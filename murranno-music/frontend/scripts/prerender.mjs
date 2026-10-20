// Build the marketing site for search engines and AI crawlers (run after `vite build`):
//   node scripts/prerender.mjs        -> dist-landing/ (murrannomusic.co) + no-index markers in dist/ (app.*)
// Most AI crawlers and part of Bing do not run JavaScript, so every marketing page is rendered to static
// HTML here. Also writes sitemap.xml, robots.txt, llms.txt, llms-full.txt, _redirects and the share image.
// Chromium: CHROME_PATH, else the newest Playwright Chromium, else installed Chrome/Edge.
import { chromium } from 'playwright-core';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, 'dist-landing');
const seo = JSON.parse(readFileSync(join(ROOT, 'src/content/seo.json'), 'utf8'));
const journal = JSON.parse(readFileSync(join(ROOT, 'src/content/journal.json'), 'utf8'));
const SITE = seo.site.url;
export const INDEXNOW_KEY = 'ab94ff9d7e759b69a165e2d8a9598b91';
const PORT = 4173 + Math.floor(Math.random() * 500);
const ROUTES = [...Object.keys(seo.pages), ...journal.map((p) => `/journal/${p.slug}`)];
const canonical = (r) => `${SITE}${r === '/' ? '/' : `${r}/`}`;

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const pw = join(process.env.LOCALAPPDATA || join(process.env.HOME || '', '.cache'), 'ms-playwright');
  if (existsSync(pw)) {
    const builds = readdirSync(pw).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => b.split('-')[1] - a.split('-')[1]);
    for (const b of builds) for (const exe of ['chrome-win64/chrome.exe', 'chrome-win/chrome.exe', 'chrome-linux/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium']) if (existsSync(join(pw, b, exe))) return join(pw, b, exe);
  }
  for (const p of ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']) if (existsSync(p)) return p;
  throw new Error('No Chromium found: set CHROME_PATH');
}

// Serves dist/ the way Workers static assets will: files first, SPA fallback to index.html.
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json', '.ico': 'image/x-icon' };
const server = createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  let file = join(DIST, p);
  if (!file.startsWith(DIST) || !existsSync(file) || statSync(file).isDirectory()) file = join(DIST, 'index.html');
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});

const xml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) throw new Error('Run `vite build` first');
  rmSync(OUT, { recursive: true, force: true });
  cpSync(DIST, OUT, { recursive: true });
  await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
  const browser = await chromium.launch({ executablePath: findChrome() });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
  // API calls run from Node (no browser CORS) so live data such as promotion prices lands in the HTML.
  await context.route('https://api.murrannomusic.co/**', async (route) => {
    const req = route.request();
    try {
      const res = await fetch(req.url(), { method: req.method(), headers: { 'content-type': 'application/json', apikey: 'public' }, body: req.postData() ?? undefined });
      await route.fulfill({ status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json', 'access-control-allow-origin': '*' }, body: Buffer.from(await res.arrayBuffer()) });
    } catch { await route.fulfill({ status: 503, headers: { 'access-control-allow-origin': '*' }, body: '{}' }); }
  });
  await context.route(/cloudflareinsights|google-analytics|googletagmanager/, (r) => r.abort());

  const texts = [];
  for (const route of ROUTES) {
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`http://murrannomusic.localhost:${PORT}${route}`, { waitUntil: 'load' });
    await page.locator('h1').first().waitFor({ state: 'visible', timeout: 20000 });
    if (route === '/promotions') await page.locator('.mm-service-row').first().waitFor({ timeout: 15000 }).catch(() => console.warn('  promotions: catalogue not loaded'));
    await page.waitForTimeout(800);
    if (route === '/') await page.screenshot({ path: join(OUT, 'landing/og-image.png'), clip: { x: 0, y: 0, width: 1440, height: 756 } });
    const { html, text, title, description } = await page.evaluate(() => {
      document.querySelectorAll('[role="region"][aria-label^="Notifications"], section[aria-label^="Notifications"]').forEach((n) => n.remove());
      document.getElementById('root').setAttribute('data-prerendered', '');
      return {
        html: '<!DOCTYPE html>\n' + document.documentElement.outerHTML,
        text: (document.querySelector('main') || document.body).innerText.replace(/\n{3,}/g, '\n\n').trim(),
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      };
    });
    if (errors.length) throw new Error(`${route}: ${errors[0]}`);
    const file = route === '/' ? join(OUT, 'index.html') : join(OUT, route, 'index.html');
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, html);
    texts.push({ route, title, description, text });
    console.log('  rendered', route);
    await page.close();
  }
  await browser.close();
  server.close();

  const today = new Date().toISOString().slice(0, 10);
  const posts = Object.fromEntries(journal.map((p) => [`/journal/${p.slug}`, p]));
  writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${ROUTES.map((r) => {
    const page = seo.pages[r];
    const post = posts[r];
    return `  <url>
    <loc>${canonical(r)}</loc>
    <xhtml:link rel="alternate" hreflang="en-NG" href="${canonical(r)}"/>
    <lastmod>${post ? post.published : today}</lastmod>
    <changefreq>${page?.changefreq ?? 'yearly'}</changefreq>
    <priority>${(page?.priority ?? 0.6).toFixed(1)}</priority>${post?.image ? `
    <image:image><image:loc>${SITE}${post.image}</image:loc><image:title>${xml(post.title)}</image:title></image:image>` : ''}
  </url>`;
  }).join('\n')}
</urlset>
`);

  // Search engines and AI crawlers are all welcome; app/account pages live on app.murrannomusic.co.
  const bots = ['Googlebot', 'Bingbot', 'Applebot', 'DuckDuckBot', 'YandexBot', 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'CCBot', 'Meta-ExternalAgent', 'Amazonbot', 'cohere-ai', 'Bytespider'];
  writeFileSync(join(OUT, 'robots.txt'), `# Murranno Music — music distribution & promotion, Lagos, Nigeria
${bots.map((b) => `User-agent: ${b}\nAllow: /`).join('\n\n')}

User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
# AI-readable summary: ${SITE}/llms.txt
`);

  const describe = (r) => texts.find((t) => t.route === r);
  writeFileSync(join(OUT, 'llms.txt'), `# Murranno Music

> ${seo.site.description}

Murranno Music (also written "Murranno" or "murrannomusic") is a music distribution and promotion company based at 100 Kujore Street, Ojota, Lagos, Nigeria. It serves independent artists, record labels and music managers in Nigeria, across Africa and worldwide. Website: ${SITE}. Artist app: https://app.murrannomusic.co. Contact: support@murrannomusic.co, +234 818 939 1868.

Key facts:
- Distributes music to 150+ stores and platforms including Spotify, Apple Music, Boomplay, Audiomack, YouTube Music, TikTok, Deezer, Amazon Music and Tidal.
- Free UPC and ISRC codes; artists keep 100% ownership of their master recordings.
- Royalties are reported in the Murranno dashboard and withdrawn to Nigerian bank accounts in naira.
- Promotion services: Spotify and Apple Music playlist placement, Audiomack promotion, TikTok and Instagram campaigns, YouTube promotion, blog and magazine features, press releases and radio airplay in Nigeria. Prices are listed on ${canonical('/promotions')}.
- Creative services: cover artwork and visualizers. Artist profile setup on Spotify for Artists, Apple Music for Artists, Boomplay, Deezer and YouTube Official Artist Channel.

## Pages
${Object.keys(seo.pages).map((r) => `- [${seo.pages[r].title}](${canonical(r)}): ${seo.pages[r].description}`).join('\n')}

## The Music Journal
${journal.map((p) => `- [${p.title}](${canonical(`/journal/${p.slug}`)}): ${p.excerpt}`).join('\n')}

## Optional
- [Full text of every page](${SITE}/llms-full.txt)
- [Sitemap](${SITE}/sitemap.xml)
`);
  writeFileSync(join(OUT, 'llms-full.txt'), `# Murranno Music — full site text\n\n> ${seo.site.description}\n\n${ROUTES.map((r) => { const t = describe(r); return `---\n\n## ${t.title}\nURL: ${canonical(r)}\n\n${t.description}\n\n${t.text}`; }).join('\n\n')}\n`);

  // Old WordPress addresses keep their rankings with permanent redirects.
  const redirects = [
    '/read-music /journal/ 301', '/read-music/ /journal/ 301', '/blog /journal/ 301', '/blog/ /journal/ 301',
    '/category/* /journal/ 301',
    '/privacy-policy /privacy 301', '/privacy-policy/ /privacy 301', '/terms-and-conditions /terms 301', '/terms-and-conditions/ /terms 301',
    ...journal.flatMap((p) => [`/${p.slug} /journal/${p.slug}/ 301`, `/${p.slug}/ /journal/${p.slug}/ 301`]),
  ];
  writeFileSync(join(OUT, '_redirects'), `${redirects.join('\n')}\n`);
  writeFileSync(join(OUT, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);
  // The app's PWA worker would answer every navigation with one cached index.html; the marketing site serves
  // real per-page HTML instead, so ship a worker that intercepts nothing and clears old caches.
  writeFileSync(join(OUT, 'sw.js'), "self.addEventListener('install', () => self.skipWaiting());\nself.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => self.clients.claim())));\n");

  // The app host (app.murrannomusic.co, served from dist/) must not compete with the marketing site.
  writeFileSync(join(DIST, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  const headers = readFileSync(join(DIST, '_headers'), 'utf8');
  if (!headers.includes('X-Robots-Tag')) writeFileSync(join(DIST, '_headers'), headers.replace('/*\n', '/*\n  X-Robots-Tag: noindex, nofollow\n'));
  console.log(`prerendered ${ROUTES.length} pages -> dist-landing/ (+ sitemap.xml, robots.txt, llms.txt, llms-full.txt, _redirects)`);
}

main().catch((e) => { console.error(e); server.close(); process.exit(1); });
