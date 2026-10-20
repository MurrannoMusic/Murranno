import { inList, naira } from '../lib/db';
import { fail, requireUser, type Handler } from './context';
import { artistOfUser, isLabelOf, periodStart } from './shared';

const getAnalyticsData: Handler = async (ctx) => {
  const { userId } = requireUser(ctx);
  const period = parseInt(String(ctx.param('period') ?? '30'), 10) || 30;
  const artistId = ctx.param('artistId');

  let artistIds: string[] = [];
  if (artistId) {
    const own = await ctx.db.value('SELECT 1 FROM artists WHERE id = ? AND user_id = ?', artistId, userId);
    if (!own && !(await isLabelOf(ctx.db, userId, artistId))) throw fail(403, 'Access denied');
    artistIds = [artistId];
  } else {
    const own = await artistOfUser(ctx.db, userId);
    if (own) artistIds.push(own.id);
    const signed = await ctx.db.all('label_artists', "SELECT artist_id FROM label_artists WHERE label_id = ? AND status = 'active'", userId);
    artistIds.push(...signed.map((s) => s.artist_id));
  }
  if (artistIds.length === 0) return { success: true, streamsByDate: {}, streamsByPlatform: {}, streamsByCountry: {}, topTracks: [], totalStreams: 0, totalEarnings: 0, bestPlatform: null, topCountry: null, period };

  const start = new Date(Date.now() - (period - 1) * 86400_000).toISOString().slice(0, 10);
  const end = new Date().toISOString().slice(0, 10);
  const ids = inList(artistIds);
  const { results } = await ctx.db.d1
    .prepare(
      `SELECT s.date, s.platform, s.country, t.id AS track_id, t.title AS track_title, r.title AS release_title,
              SUM(s.streams) AS streams
       FROM streaming_data s JOIN tracks t ON t.id = s.track_id JOIN releases r ON r.id = t.release_id
       WHERE r.artist_id IN ${ids.sql} AND s.date >= ? AND s.date <= ?
       GROUP BY s.date, s.platform, s.country, t.id`,
    )
    .bind(...ids.params, start, end)
    .all<{ date: string; platform: string; country: string | null; track_id: string; track_title: string; release_title: string; streams: number }>();

  const streamsByDate: Record<string, number> = {};
  const streamsByPlatform: Record<string, number> = {};
  const streamsByCountry: Record<string, number> = {};
  const byTrack: Record<string, { id: string; title: string; release: string; streams: number }> = {};
  let totalStreams = 0;
  for (const r of results) {
    totalStreams += r.streams;
    streamsByDate[r.date] = (streamsByDate[r.date] ?? 0) + r.streams;
    streamsByPlatform[r.platform] = (streamsByPlatform[r.platform] ?? 0) + r.streams;
    if (r.country) streamsByCountry[r.country] = (streamsByCountry[r.country] ?? 0) + r.streams;
    byTrack[r.track_id] ??= { id: r.track_id, title: r.track_title, release: r.release_title || 'Unknown', streams: 0 };
    byTrack[r.track_id].streams += r.streams;
  }
  const top = (o: Record<string, number>) => Object.entries(o).sort(([, a], [, b]) => b - a)[0];
  const bestPlatform = top(streamsByPlatform);
  const topCountry = top(streamsByCountry);
  const totalEarnings = naira(
    await ctx.db.value<number>(
      `SELECT COALESCE(SUM(amount), 0) FROM earnings WHERE artist_id IN ${ids.sql} AND period_start >= ? AND period_end <= ?`,
      ...ids.params,
      start,
      `${end}T23:59:59.999Z`,
    ),
  );

  return {
    success: true,
    streamsByDate,
    streamsByPlatform,
    streamsByCountry,
    totalStreams,
    totalEarnings,
    topTracks: Object.values(byTrack).sort((a, b) => b.streams - a.streams).slice(0, 10),
    bestPlatform: bestPlatform ? { name: bestPlatform[0], streams: bestPlatform[1] } : null,
    topCountry: topCountry ? { name: topCountry[0], streams: topCountry[1] } : null,
    period,
  };
};

export const analyticsFunctions = { 'get-analytics-data': getAnalyticsData };
