const assert = require("node:assert/strict");
const { DatabaseSync } = require("node:sqlite");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const esbuild = require("esbuild");
(async () => {
  const root = path.resolve(__dirname, "..");
  const output = await esbuild.build({
    stdin: {
      contents: `export { DB } from './src/lib/db';export { profileFunctions as P } from './src/functions/profile';export { releaseFunctions as R } from './src/functions/releases';export { mobileFunctions as M } from './src/functions/mobile';export { campaignFunctions as C } from './src/functions/campaigns';`,
      resolveDir: root,
      loader: "ts",
    },
    bundle: true,
    platform: "node",
    format: "cjs",
    write: false,
  });
  const mod = new Module(path.join(root, "database-test.cjs"), module);
  mod.filename = path.join(root, "database-test.cjs");
  mod.paths = Module._nodeModulePaths(root);
  mod._compile(output.outputFiles[0].text, mod.filename);
  const { DB, P, R, M, C } = mod.exports;
  const sqlite = new DatabaseSync(":memory:");
  sqlite.exec(fs.readFileSync(path.join(root, "src/db/schema.sql"), "utf8"));
  class Statement {
    constructor(sql, params = []) {
      this.sql = sql;
      this.params = params;
    }
    bind(...params) {
      return new Statement(this.sql, params);
    }
    async all() {
      return {
        results: sqlite.prepare(this.sql).all(...this.params),
        success: true,
      };
    }
    async first() {
      return sqlite.prepare(this.sql).get(...this.params) || null;
    }
    async run() {
      return {
        success: true,
        meta: sqlite.prepare(this.sql).run(...this.params),
      };
    }
  }
  const d1 = {
    prepare: (sql) => new Statement(sql),
    batch: async (statements) => {
      sqlite.exec("BEGIN");
      try {
        const results = [];
        for (const statement of statements) results.push(await statement.all());
        sqlite.exec("COMMIT");
        return results;
      } catch (e) {
        sqlite.exec("ROLLBACK");
        throw e;
      }
    },
  };
  const db = new DB(d1);
  const ctx = (body = {}) => ({
    db,
    body,
    auth: { userId: "test-user", email: "test@example.test", isAdmin: false },
    param: (n) => body[n],
    env: {},
    req: new Request("https://test.invalid/functions/v1/test"),
    ip: "127.0.0.1",
    waitUntil: () => {},
  });
  await db.insert("auth_users", {
    id: "test-user",
    email: "test@example.test",
  });
  await db.insert("profiles", {
    id: "test-user",
    email: "test@example.test",
    full_name: "Test User",
    kyc_status: "verified",
  });
  await db.insert("platform_settings", { id: "settings" });
  const config = await M["get-mobile-config"](ctx());
  assert.equal(config.settings.minimum_payout_amount, 1000);
  assert.equal(config.pushEnabled, false);
  const release = await R["upload-track"](
    ctx({
      releaseData: {
        title: "Database Single",
        type: "Single",
        artistName: "Test Artist",
        releaseDate: "2026-12-01",
        distribution_platforms: ["Spotify"],
        description: "Saved description",
        secondary_genre: "Soul",
      },
      tracks: [
        {
          title: "Database Track",
          duration: 210,
          explicit_content: true,
          featuredArtists: ["Guest"],
          producers: ["Producer"],
          songwriter_legal_names: ["Legal Name"],
        },
      ],
      coverArtFile: { url: "https://example.test/cover.png" },
      audioFiles: [{ url: "https://example.test/audio.flac" }],
    }),
  );
  assert.equal(release.release.status, "Pending");
  assert.equal(release.release.description, "Saved description");
  assert.deepEqual(release.tracks[0].featured_artists, ["Guest"]);
  assert.equal(release.tracks[0].explicit_content, true);
  const artist = (await P["get-artist-profile"](ctx())).artist;
  assert.equal(artist.stage_name, "Test Artist");
  assert.equal(artist.kyc_status, "verified");
  const detail = await R["get-release-detail"](
    ctx({ releaseId: release.release.id }),
  );
  assert.equal(
    detail.release.tracks[0].audio_url,
    "https://example.test/audio.flac",
  );
  await P["update-artist-profile"](
    ctx({
      stage_name: "Updated Artist",
      personal: { first_name: "New", last_name: "Name" },
    }),
  );
  assert.equal(
    (
      await db.first(
        "profiles",
        "SELECT * FROM profiles WHERE id = ?",
        "test-user",
      )
    ).full_name,
    "New Name",
  );
  // A failing profile write must roll back the preceding artist write in the same batch.
  sqlite.exec(
    "CREATE TRIGGER fail_profile BEFORE UPDATE OF first_name ON profiles WHEN NEW.first_name = 'FAIL' BEGIN SELECT RAISE(ABORT, 'Synthetic profile failure'); END;",
  );
  await assert.rejects(
    P["update-artist-profile"](
      ctx({ stage_name: "Must Roll Back", personal: { first_name: "FAIL" } }),
    ),
    /Synthetic profile failure/,
  );
  assert.equal(
    (await P["get-artist-profile"](ctx())).artist.stage_name,
    "Updated Artist",
  );
  await M["update-notification-preferences"](
    ctx({ email_notifications: false }),
  );
  const preferences = (await M["get-notification-preferences"](ctx()))
    .preferences;
  assert.equal(preferences.email_notifications, false);
  assert.equal(preferences.release_updates, true);
  const campaign = await db.insert("campaigns", {
    user_id: "test-user",
    artist_id: artist.id,
    name: "Test Campaign",
    type: "Spotify",
    platform: "Spotify",
    start_date: "2026-10-19",
    status: "Active",
    budget: 10000,
  });
  await db.insert("campaign_metrics", {
    campaign_id: campaign.id,
    date: "2026-10-19",
    reach: 1234,
    engagement: 2.5,
  });
  const campaigns = await C["get-user-campaigns"](ctx());
  assert.equal(campaigns.campaigns[0].reach, 1234);
  assert.equal(campaigns.campaigns[0].engagement, 2.5);
  assert.equal(campaigns.stats.totalReach, "1,234");
  await C["pause-campaign"](ctx({ campaignId: campaign.id, pause: true }));
  assert.equal(
    (await C["get-user-campaigns"](ctx())).campaigns[0].status,
    "Paused",
  );
  await P["register-push-token"](
    ctx({ token: "synthetic-device-token", platform: "android" }),
  );
  await db.insert("auth_users", {
    id: "second-user",
    email: "second@example.test",
  });
  await db.insert("profiles", {
    id: "second-user",
    email: "second@example.test",
  });
  await P["register-push-token"]({
    ...ctx({ token: "synthetic-device-token", platform: "android" }),
    auth: { userId: "second-user", sessionId: "second-session" },
  });
  const tokens = await db.all(
    "push_notification_tokens",
    "SELECT * FROM push_notification_tokens",
  );
  assert.equal(tokens.find((t) => t.user_id === "test-user").is_active, false);
  assert.equal(tokens.find((t) => t.user_id === "second-user").is_active, true);
  sqlite.close();
  console.log(
    "PASS actual handlers + DB adapter + real SQLite schema: release metadata/JSON/booleans, KYC, audio, money decoding, profile rollback, notification defaults, campaign metrics/pause. In-memory only.",
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
