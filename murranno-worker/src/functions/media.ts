import type { Context } from 'hono';
import type { AppEnv, Env } from '../env';
import { hmacHex, timingSafeEqual } from '../lib/crypto';
import { fail, requireUser, type Handler } from './context';

/**
 * Media lives in R2 (bucket binding MEDIA) and is served by this Worker at /media/<key>.
 * Public files are immutable; private/ (identity documents) needs a signed link from media-signed-url.
 */
const FOLDER_RE = /^[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)*$/;
const MAX_BYTES = 100 * 1024 * 1024; // Workers request-body limit on the paid plan
// Explicit allow-list: nothing a browser would execute (no SVG/HTML/XML).
const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif', 'image/avif',
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/flac', 'audio/x-flac',
  'audio/aac', 'audio/mp4', 'audio/x-m4a', 'audio/ogg',
  'video/mp4', 'video/quicktime', 'video/webm',
  'application/pdf',
]);

// Identity documents are never public: stored under private/<folder>/<userId>/ and served only via signed links.
const PRIVATE_FOLDERS = new Set(['kyc-documents']);
const SIGNED_URL_TTL = 10 * 60; // seconds

function keyFor(folder: string, name: string, type: string, userId: string) {
  const ext = (/\.([A-Za-z0-9]{1,8})$/.exec(name)?.[1] ?? type.split('/')[1] ?? 'bin').toLowerCase();
  const prefix = PRIVATE_FOLDERS.has(folder) ? `private/${folder}/${userId}` : folder;
  return `${prefix}/${crypto.randomUUID()}.${ext}`;
}

const signature = (env: Env, key: string, exp: number) => hmacHex('SHA-256', env.JWT_SECRET, `media:${key}:${exp}`);

async function hasValidSignature(env: Env, key: string, url: URL) {
  const exp = Number(url.searchParams.get('exp'));
  const sig = url.searchParams.get('sig') ?? '';
  if (!Number.isInteger(exp) || exp < Date.now() / 1000) return false;
  return timingSafeEqual(sig, await signature(env, key, exp));
}

/**
 * POST /functions/v1/upload-media
 * - raw body (preferred, streamed to R2): ?folder=…&name=…, Content-Type + Content-Length set
 * - multipart/form-data with `file` and `folder` (older callers, React Native)
 */
const uploadMedia: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const contentType = ctx.req.headers.get('content-type') ?? '';
  let folder: string;
  let key: string;
  let type: string;
  let size: number;
  let body: ReadableStream | ArrayBuffer;

  if (contentType.startsWith('multipart/form-data')) {
    const form = await ctx.req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw fail(400, 'No file provided');
    folder = String(form.get('folder') || 'uploads');
    type = file.type || 'application/octet-stream';
    size = file.size;
    key = keyFor(folder, file.name, type, userId);
    body = await file.arrayBuffer();
  } else {
    folder = String(ctx.url.searchParams.get('folder') || 'uploads');
    type = contentType.split(';')[0].trim();
    size = Number(ctx.req.headers.get('content-length') ?? NaN);
    if (!ctx.req.body || !Number.isFinite(size)) throw fail(411, 'Content-Length is required');
    key = keyFor(folder, ctx.url.searchParams.get('name') ?? '', type, userId);
    body = ctx.req.body;
  }
  if (!FOLDER_RE.test(folder) || folder.length > 64) throw fail(400, 'Invalid folder');
  if (!ALLOWED_TYPES.has(type.toLowerCase())) throw fail(415, 'Only images (JPEG/PNG/WebP/GIF/HEIC), audio, video or PDF can be uploaded');
  if (size <= 0 || size > MAX_BYTES) throw fail(413, 'Files must be between 1 byte and 100 MB');

  await ctx.env.MEDIA.put(key, body, {
    httpMetadata: { contentType: type, cacheControl: key.startsWith('private/') ? 'private, no-store' : 'public, max-age=31536000, immutable' },
  });
  const url = new URL(`/media/${key}`, ctx.req.url).toString();
  // `publicId` is the URL too, so components that took Cloudinary ids accept R2 files unchanged.
  return { success: true, url, secure_url: url, publicId: url, key };
};

/** POST /functions/v1/media-signed-url { url } — a 10-minute link to a private file, for its owner or an admin. */
const mediaSignedUrl: Handler = async (ctx) => {
  const auth = requireUser(ctx);
  const url = new URL(String(ctx.body.url ?? ''), ctx.req.url);
  const key = decodeURIComponent(url.pathname.replace(/^\/media\//, ''));
  const owner = /^private\/[^/]+\/([^/]+)\//.exec(key)?.[1];
  if (!owner || key.includes('..')) throw fail(400, 'Not a private media URL');
  if (owner !== auth.userId && !auth.isAdmin) throw fail(403, 'Not allowed');
  const exp = Math.floor(Date.now() / 1000) + SIGNED_URL_TTL;
  const signed = new URL(`/media/${key}`, ctx.req.url);
  signed.searchParams.set('exp', String(exp));
  signed.searchParams.set('sig', await signature(ctx.env, key, exp));
  return { success: true, url: signed.toString(), expires_at: new Date(exp * 1000).toISOString() };
};

export const mediaFunctions: Record<string, Handler> = {
  'upload-media': uploadMedia,
  'media-signed-url': mediaSignedUrl,
  // Old names used by direct fetch() callers; they now store in R2.
  'upload-image-cloudinary': uploadMedia,
  'upload-audio-cloudinary': uploadMedia,
};

/** GET /media/<key> — public, immutable, with Range support for audio/video seeking. */
export async function serveMedia(c: Context<AppEnv>): Promise<Response> {
  const key = decodeURIComponent(c.req.path.slice('/media/'.length));
  if (!key || key.includes('..')) return c.text('Not found', 404);
  const isPrivate = key.startsWith('private/');
  if (isPrivate && !(await hasValidSignature(c.env, key, new URL(c.req.url)))) return c.text('Not found', 404);
  const range = c.req.header('range');
  const object = await c.env.MEDIA.get(key, range ? { range: c.req.raw.headers } : {});
  if (!object) return c.text('Not found', 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  if (isPrivate) headers.set('cache-control', 'private, no-store');
  headers.set('etag', object.httpEtag);
  headers.set('accept-ranges', 'bytes');
  headers.set('x-content-type-options', 'nosniff');
  // Defence in depth: even a mislabelled file can never run script on the API origin.
  headers.set('content-security-policy', "sandbox; default-src 'none'");
  if (!('body' in object)) return new Response(null, { status: 304, headers });
  if (range && object.range && 'offset' in object.range) {
    const offset = object.range.offset ?? 0;
    const length = object.range.length ?? object.size - offset;
    headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${object.size}`);
    headers.set('content-length', String(length));
    return new Response(object.body, { status: 206, headers });
  }
  headers.set('content-length', String(object.size));
  return new Response(object.body, { headers });
}
