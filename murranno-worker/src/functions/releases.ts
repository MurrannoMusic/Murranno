import { inList, type Row } from '../lib/db';
import { fail, requireUser, type FnCtx, type Handler } from './context';
import { artistOfUser, profileOf } from './shared';

async function releasesWithTracks(ctx: FnCtx, where: string, ...params: unknown[]) {
  const releases = await ctx.db.all(
    'releases',
    `SELECT r.*, a.stage_name AS artist_stage_name, a.user_id AS artist_user_id
     FROM releases r JOIN artists a ON a.id = r.artist_id WHERE ${where}`,
    ...params,
  );
  const ids = inList(releases.map((r) => r.id));
  const tracks = await ctx.db.all('tracks', `SELECT * FROM tracks WHERE release_id IN ${ids.sql} ORDER BY track_number`, ...ids.params);
  return releases.map((r) => ({ ...r, tracks: tracks.filter((t) => t.release_id === r.id) }));
}

const getUserReleases: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const artist = await artistOfUser(ctx.db, userId);
  if (!artist) return { success: true, releases: [] };
  const status = ctx.param('status');
  const search = String(ctx.param('search') ?? '').trim();
  const clauses = ['r.artist_id = ?'];
  const params: unknown[] = [artist.id];
  if (status && status !== 'All') {
    clauses.push('r.status = ?');
    params.push(status);
  }
  if (search) {
    clauses.push("r.title LIKE ? ESCAPE '\\'");
    params.push(`%${search.replace(/[\\%_]/g, (m) => `\\${m}`)}%`);
  }
  const releases = await releasesWithTracks(ctx, `${clauses.join(' AND ')} ORDER BY r.created_at DESC`, ...params);
  return {
    success: true,
    releases: releases.map((r) => ({
      id: r.id,
      title: r.title,
      artist: r.artist_stage_name,
      type: r.release_type,
      year: new Date(r.release_date).getFullYear(),
      releaseDate: r.release_date,
      coverArt: r.cover_art_url || '/placeholder.svg',
      status: r.status,
      metadata: {
        genre: r.genre || '',
        language: r.language || '',
        label: r.label || '',
        copyright: r.copyright || '',
        upcEan: r.upc_ean || '',
      },
      smartlink: r.smartlink || '',
      tracks: r.tracks,
    })),
  };
};

const getReleaseDetail: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const id = ctx.param('releaseId') ?? ctx.param('id');
  if (!id) throw fail(400, 'Release ID required');
  const [release] = await releasesWithTracks(ctx, 'r.id = ?', id);
  if (!release) throw fail(404, 'Release not found');
  if (release.artist_user_id !== userId) throw fail(403, 'Access denied');

  const trackIds = inList(release.tracks.map((t: Row) => t.id));
  const streams = await ctx.db.d1
    .prepare(`SELECT track_id, SUM(streams) AS streams FROM streaming_data WHERE track_id IN ${trackIds.sql} GROUP BY track_id`)
    .bind(...trackIds.params)
    .all<{ track_id: string; streams: number }>();
  const streamsOf = (tid: string) => streams.results.find((s) => s.track_id === tid)?.streams ?? 0;
  const earnings = (await ctx.db.all('earnings', "SELECT amount FROM earnings WHERE release_id = ? AND status = 'paid'", id))
    .reduce((t, e) => t + e.amount, 0);

  return {
    success: true,
    release: {
      id: release.id,
      title: release.title,
      artist_name: release.artist_stage_name,
      release_type: release.release_type,
      release_date: release.release_date,
      cover_art_url: release.cover_art_url || '/placeholder.svg',
      status: release.status,
      recording_year: release.recording_year || String(new Date(release.release_date).getFullYear()),
      genre: release.genre || '',
      language: release.language || '',
      label: release.label || '',
      copyright: release.copyright_holder || release.copyright || '',
      upc_ean: release.upc || release.upc_ean || '',
      isrc: release.isrc || '',
      smartlink: release.smartlink || '',
      total_streams: release.tracks.reduce((t: number, tr: Row) => t + streamsOf(tr.id), 0),
      total_earnings: earnings,
      tracks: release.tracks.map((t: Row) => ({
        id: t.id,
        title: t.title,
        duration: t.duration,
        isrc: t.isrc,
        track_number: t.track_number,
        streams: streamsOf(t.id),
        audioFileUrl: t.audio_file_url,
        audio_url: t.audio_file_url,
      })),
    },
  };
};

const placeholderCode = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

const uploadTrack: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const { releaseData, tracks, coverArtFile, audioFiles } = ctx.body;
  if (!releaseData?.title || !releaseData?.type || !releaseData?.releaseDate) {
    throw fail(400, 'Release title, type and release date are required');
  }
  if (!['Single', 'EP', 'Album'].includes(releaseData.type)) throw fail(400, 'Choose Single, EP or Album');
  if (!Array.isArray(tracks) || tracks.length === 0) throw fail(400, 'At least one track is required');
  if (releaseData.type === 'Single' && tracks.length !== 1) throw fail(400, 'A single must contain one track');
  if (tracks.some((t: Row) => !Number.isFinite(Number(t.duration)) || Number(t.duration) <= 0)) throw fail(400, 'Every track needs a valid duration in seconds');
  if (releaseData.is_existing_release && !/^\d{12,13}$/.test(String(releaseData.upc || ''))) throw fail(400, 'Enter the existing 12 or 13 digit UPC');
  const urls = [coverArtFile?.url, ...(Array.isArray(audioFiles) ? audioFiles.map((f: Row) => f?.url) : [])].filter(Boolean);
  if (urls.some((u) => typeof u !== 'string' || !u.startsWith('https://'))) throw fail(400, 'Media URLs must be https');

  const ownerProfile = await profileOf(ctx.db, userId);
  if (ownerProfile?.kyc_status !== 'verified') throw fail(403, 'Verify your identity before submitting music');
  const releaseDate = String(releaseData.releaseDate);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate) || Number.isNaN(Date.parse(releaseDate)) || new Date(releaseDate).toISOString().slice(0, 10) !== releaseDate) throw fail(400, 'A valid release date in YYYY-MM-DD format is required');
  if (!coverArtFile?.url) throw fail(400, 'Cover artwork is required');
  if (!Array.isArray(audioFiles) || audioFiles.length !== tracks.length || audioFiles.some((f: Row) => !f?.url)) throw fail(400, 'An audio file is required for every track');
  if (!Array.isArray(releaseData.distribution_platforms) || !releaseData.distribution_platforms.length) throw fail(400, 'Choose at least one distribution store');
  if (tracks.some((t: Row) => !t.title?.trim() || !(t.songwriter_legal_names?.some((name: unknown) => typeof name === 'string' && name.trim())))) throw fail(400, 'Every track needs a title and songwriter legal name');
  let artist = await artistOfUser(ctx.db, userId);
  if (!artist) {
    const profile = await profileOf(ctx.db, userId);
    artist = await ctx.db.insert('artists', { user_id: userId, stage_name: releaseData.artistName || profile?.full_name || 'Artist' });
  }

  let { upc, isrc } = releaseData;
  if (!releaseData.is_existing_release) {
    upc ||= placeholderCode('M-UPC');
    isrc ||= placeholderCode('M-ISRC');
  }

  const release = await ctx.db.insert('releases', {
    artist_id: artist.id,
    title: releaseData.title,
    release_type: releaseData.type,
    release_date: releaseData.releaseDate,
    cover_art_url: coverArtFile?.url || null,
    status: 'Pending',
    description: releaseData.description || null,
    secondary_genre: releaseData.secondary_genre || null,
    genre: releaseData.genre ?? null,
    language: releaseData.language ?? null,
    label: releaseData.label ?? null,
    copyright_holder: releaseData.copyright_holder ?? null,
    recording_year: releaseData.recording_year ?? null,
    is_existing_release: Boolean(releaseData.is_existing_release),
    upc: upc ?? null,
    isrc: isrc ?? null,
    distribution_platforms: releaseData.distribution_platforms ?? null,
  });

  const stmts = await Promise.all(
    tracks.map((t: Row, i: number) =>
      ctx.db.insertStmt('tracks', {
        release_id: release.id,
        title: t.title || `Track ${i + 1}`,
        duration: t.duration || 0,
        track_number: i + 1,
        audio_file_url: audioFiles?.[i]?.url || null,
        lyrics: t.lyrics ?? null,
        songwriter_legal_names: t.songwriter_legal_names ?? null,
        explicit_content: Boolean(t.explicit_content ?? t.explicit ?? (t.trackType === 'explicit')),
        featured_artists: t.featuredArtists ?? t.featured_artists ?? [],
        producers: t.producers ?? [],
      }),
    ),
  );
  try {
    const results = await ctx.db.batch(stmts);
    const created = await Promise.all(results.map((r) => ctx.db.decodeRow('tracks', (r.results as Row[])[0])));
    return { success: true, release, tracks: created };
  } catch (e) {
    await ctx.db.run('DELETE FROM releases WHERE id = ?', release.id); // no half-created releases
    throw e;
  }
};

export const releaseFunctions: Record<string, Handler> = {
  'get-user-releases': getUserReleases,
  'get-release-detail': getReleaseDetail,
  'upload-track': uploadTrack,
};
