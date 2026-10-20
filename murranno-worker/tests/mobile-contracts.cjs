const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const esbuild = require("esbuild");
(async () => {
  const root = path.resolve(__dirname, "..");
  const bundle = await esbuild.build({
    stdin: {
      contents: `export { profileFunctions } from './src/functions/profile'; export { releaseFunctions } from './src/functions/releases'; export { walletFunctions } from './src/functions/wallet'; export { withdrawalFunctions } from './src/functions/withdrawals'; export { campaignFunctions } from './src/functions/campaigns'; export { mobileFunctions } from './src/functions/mobile'; export { analyticsFunctions } from './src/functions/analytics'; export { notify } from './src/functions/shared'; export { subscriptionFunctions } from './src/functions/subscriptions'; export { sendUserPush } from './src/lib/push';`,
      resolveDir: root,
      loader: "ts",
    },
    bundle: true,
    platform: "node",
    format: "cjs",
    write: false,
  });
  const mod = new Module(path.join(root, "contracts.cjs"), module);
  mod.filename = path.join(root, "contracts.cjs");
  mod.paths = Module._nodeModulePaths(root);
  mod._compile(bundle.outputFiles[0].text, mod.filename);
  const {
    profileFunctions: P,
    releaseFunctions: R,
    walletFunctions: W,
    withdrawalFunctions: D,
    campaignFunctions: C,
    mobileFunctions: M,
    analyticsFunctions: A,
    notify,
    subscriptionFunctions: S,
    sendUserPush,
  } = mod.exports;
  const ctx = (body = {}, db = {}, extra = {}) => ({
    auth: { userId: "test-user", isAdmin: false },
    body,
    db,
    param: (n) => body[n],
    env: {},
    ip: "127.0.0.1",
    req: new Request("https://test.invalid/functions/v1/test"),
    waitUntil: () => {},
    ...extra,
  });
  let checks = 0;
  async function test(name, run) {
    await run();
    checks++;
    console.log("PASS " + name);
  }
  const artist = {
    id: "test-artist",
    user_id: "test-user",
    stage_name: "Test Artist",
  };
  const profile = { id: "test-user", kyc_status: "verified", kyc_tier: 1 };
  const base = {
    first: async (table) => (table === "artists" ? artist : profile),
    all: async () => [],
    value: async () => 0,
  };
  await test("KYC gate reads actual profile status", async () => {
    const res = await P["get-artist-profile"](ctx({}, base));
    assert.equal(res.artist.kyc_status, "verified");
    assert.equal(res.artist.kyc_tier, 1);
  });
  await test("withdrawal rejects missing PIN before any DB or provider work", async () => {
    await assert.rejects(
      D["paystack-initiate-withdrawal"](
        ctx({ amount: 5000, payout_method_id: "bank" }),
      ),
      (e) => e.status === 400 && /PIN/.test(e.message),
    );
  });
  await test("campaign pause and resume use a boolean flag and enforce ownership", async () => {
    let status = "Active";
    const db = {
      first: async () => ({ user_id: "test-user", status }),
      update: async (_, row) => {
        status = row.status;
        return [row];
      },
    };
    await C["pause-campaign"](ctx({ campaignId: "campaign", pause: true }, db));
    assert.equal(status, "Paused");
    await C["pause-campaign"](
      ctx({ campaignId: "campaign", pause: false }, db),
    );
    assert.equal(status, "Active");
    await assert.rejects(
      C["pause-campaign"](
        ctx(
          { campaignId: "campaign", pause: true },
          {
            first: async () => ({ user_id: "someone-else", status: "Active" }),
          },
        ),
      ),
      (e) => e.status === 403,
    );
  });
  await test("release detail exposes audio_url consumed by player", async () => {
    const db = {
      all: async (table) =>
        table === "releases"
          ? [
              {
                id: "release",
                artist_user_id: "test-user",
                title: "Test",
                release_date: "2026-10-19",
              },
            ]
          : table === "tracks"
            ? [
                {
                  id: "track",
                  release_id: "release",
                  title: "Track",
                  audio_file_url: "https://example.test/track.wav",
                },
              ]
            : [],
      d1: {
        prepare: () => ({
          bind() {
            return this;
          },
          all: async () => ({ results: [] }),
        }),
      },
    };
    const res = await R["get-release-detail"](
      ctx({ releaseId: "release" }, db),
    );
    assert.equal(
      res.release.tracks[0].audio_url,
      "https://example.test/track.wav",
    );
  });
  const valid = {
    releaseData: {
      title: "Test single",
      artistName: "Test Artist",
      type: "Single",
      releaseDate: "2026-10-19",
      description: "Description",
      secondary_genre: "Soul",
      distribution_platforms: ["Spotify"],
    },
    coverArtFile: { url: "https://example.test/cover.png" },
    audioFiles: [{ url: "https://example.test/track.flac" }],
    tracks: [
      {
        title: "Track",
        duration: 210,
        trackType: "explicit",
        featuredArtists: ["Guest"],
        producers: ["Producer"],
        songwriter_legal_names: ["Legal Name"],
      },
    ],
  };
  await test("upload submits Pending with complete metadata and explicit credits", async () => {
    const inserts = [];
    const db = {
      ...base,
      insert: async (table, row) => {
        inserts.push({ table, row });
        return { id: "release", ...row };
      },
      insertStmt: async (table, row) => {
        inserts.push({ table, row });
        return { table, row };
      },
      batch: async (rows) =>
        rows.map((x) => ({ results: [{ id: "track", ...x.row }] })),
      decodeRow: async (_, row) => row,
    };
    const result = await R["upload-track"](ctx(valid, db));
    assert.equal(result.release.status, "Pending");
    assert.equal(result.release.description, "Description");
    assert.equal(result.release.secondary_genre, "Soul");
    const track = inserts.find((x) => x.table === "tracks").row;
    assert.equal(track.explicit_content, true);
    assert.deepEqual(track.featured_artists, ["Guest"]);
    assert.deepEqual(track.producers, ["Producer"]);
    assert.equal(track.duration, 210);
  });
  for (const [name, body] of [
    ["missing artwork", { ...valid, coverArtFile: null }],
    [
      "bad date",
      {
        ...valid,
        releaseData: { ...valid.releaseData, releaseDate: "2026-02-30" },
      },
    ],
    [
      "missing credits",
      {
        ...valid,
        tracks: [{ ...valid.tracks[0], songwriter_legal_names: [] }],
      },
    ],
    ["missing audio", { ...valid, audioFiles: [] }],
    [
      "zero duration",
      { ...valid, tracks: [{ ...valid.tracks[0], duration: 0 }] },
    ],
  ])
    await test("upload rejects " + name, async () => {
      await assert.rejects(
        R["upload-track"](ctx(body, base)),
        (e) => e.status === 400,
      );
    });
  await test("upload enforces verified identity on server", async () => {
    await assert.rejects(
      R["upload-track"](
        ctx(valid, { ...base, first: async () => ({ kyc_status: "pending" }) }),
      ),
      (e) => e.status === 403,
    );
  });
  await test("profile changes batch personal and artist updates atomically", async () => {
    let statements;
    const db = {
      ...base,
      updateStmt: async (table, row) => ({ table, row }),
      batch: async (rows) => {
        statements = rows;
        return [];
      },
    };
    await P["update-artist-profile"](
      ctx(
        {
          stage_name: "Updated",
          personal: { first_name: "Test", last_name: "User" },
        },
        db,
      ),
    );
    assert.deepEqual(
      statements.map((x) => x.table),
      ["artists", "profiles"],
    );
    assert.equal(statements[1].row.full_name, "Test User");
    await assert.rejects(
      P["update-artist-profile"](
        ctx(
          { stage_name: "Updated", personal: { first_name: "Test" } },
          {
            ...db,
            batch: async () => {
              throw Error("DB transaction failed");
            },
          },
        ),
      ),
      /DB transaction failed/,
    );
  });
  await test("notification preferences are per-user and boolean validated", async () => {
    let saved;
    const result = await M["update-notification-preferences"](
      ctx(
        { push_notifications: false, other_user: "ignored" },
        {
          upsert: async (table, row, keys) => {
            saved = { table, row, keys };
            return row;
          },
        },
      ),
    );
    assert.equal(result.preferences.push_notifications, false);
    assert.equal(saved.row.user_id, "test-user");
    assert.equal(saved.row.other_user, undefined);
    await assert.rejects(
      M["update-notification-preferences"](
        ctx({ push_notifications: "false" }),
      ),
      (e) => e.status === 400,
    );
  });
  await test("in-app and topic opt-out prevent notification insertion", async () => {
    let inserts = 0;
    const db = {
      first: async () => ({
        in_app_notifications: false,
        release_updates: true,
      }),
      insert: async () => {
        inserts++;
      },
    };
    await notify(db, "test-user", {
      title: "Test",
      message: "Test",
      related_type: "release",
    });
    assert.equal(inserts, 0);
  });
  await test("analytics 30-day bounds include exactly 30 dates", async () => {
    let binds;
    const db = {
      ...base,
      d1: {
        prepare: () => ({
          bind(...args) {
            binds = args;
            return this;
          },
          all: async () => ({ results: [] }),
        }),
      },
    };
    await A["get-analytics-data"](ctx({ period: 30 }, db));
    const dates = binds.filter((v) => /^\d{4}-\d{2}-\d{2}$/.test(v));
    assert.equal((Date.parse(dates[1]) - Date.parse(dates[0])) / 86400000, 29);
  });
  await test("bank recipient uses a fresh provider-resolved account name", async () => {
    const original = global.fetch;
    const calls = [];
    let saved;
    global.fetch = async (url, options = {}) => {
      calls.push({ url, body: options.body && JSON.parse(options.body) });
      return Response.json({
        status: true,
        data: url.includes("/bank/resolve")
          ? { account_name: "CURRENT OWNER" }
          : { recipient_code: "recipient", details: {} },
      });
    };
    try {
      await W["paystack-create-recipient"](
        ctx(
          {
            account_name: "STALE NAME",
            account_number: "0123456789",
            bank_code: "001",
            bank_name: "Test Bank",
          },
          {
            value: async () => null,
            insert: async (_, row) => {
              saved = row;
              return row;
            },
            run: async () => {},
          },
          { env: { PAYSTACK_SECRET_KEY: "synthetic-test-key" } },
        ),
      );
      assert.equal(calls[0].url.includes("/bank/resolve"), true);
      assert.equal(calls[1].body.name, "CURRENT OWNER");
      assert.equal(saved.account_name, "CURRENT OWNER");
    } finally {
      global.fetch = original;
    }
  });
  await test("checkout uses plan pricing and an allowed native return URL", async () => {
    const original = global.fetch;
    let request;
    global.fetch = async (_, options) => {
      request = JSON.parse(options.body);
      return Response.json({
        status: true,
        data: {
          authorization_url: "https://checkout.paystack.com/test",
          reference: "reference",
        },
      });
    };
    const db = {
      first: async (table) =>
        table === "subscription_plans"
          ? { tier: "label", price_monthly: 15000, currency: "NGN" }
          : null,
    };
    try {
      const result = await S["paystack-initialize-subscription"](
        ctx(
          {
            tier: "label",
            amount: 1,
            redirectTo: "murrannoexpo://payment-return",
          },
          db,
          {
            auth: { userId: "test-user", email: "test@example.test" },
            env: {
              PAYSTACK_SECRET_KEY: "synthetic-test-key",
              APP_URL: "https://app.example.test",
              ALLOWED_REDIRECTS: "",
            },
          },
        ),
      );
      assert.equal(result.reference, "reference");
      assert.equal(request.amount, 1500000);
      assert.equal(new URL(request.callback_url).protocol, "https:");
      assert.equal(
        new URL(request.callback_url).searchParams.get("return_to"),
        "murrannoexpo://payment-return",
      );
    } finally {
      global.fetch = original;
    }
  });
  await test("FCM delivery signs credentials, counts acceptances, and retires expired tokens", async () => {
    const pair = await crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"],
    );
    const exported = Buffer.from(
      await crypto.subtle.exportKey("pkcs8", pair.privateKey),
    ).toString("base64");
    const env = {
      FCM_SERVICE_ACCOUNT_JSON: JSON.stringify({
        project_id: "synthetic-project",
        client_email: "synthetic@example.test",
        private_key:
          "-----BEGIN PRIVATE KEY-----\n" +
          exported +
          "\n-----END PRIVATE KEY-----",
      }),
    };
    const original = global.fetch;
    let retired = false;
    let calls = 0;
    global.fetch = async (url, options) => {
      calls++;
      if (url.includes("oauth2.googleapis.com")) {
        const form = new URLSearchParams(options.body);
        const payload = JSON.parse(
          Buffer.from(form.get("assertion").split(".")[1], "base64url"),
        );
        assert.equal(
          payload.scope,
          "https://www.googleapis.com/auth/firebase.messaging",
        );
        return Response.json({
          access_token: "synthetic-token",
          expires_in: 3600,
        });
      }
      const body = JSON.parse(options.body);
      return body.message.token === "valid"
        ? Response.json({ name: "accepted" })
        : Response.json(
            { error: { details: [{ errorCode: "UNREGISTERED" }] } },
            { status: 404 },
          );
    };
    const db = {
      first: async () => ({ push_notifications: true, release_updates: true }),
      all: async () => [
        { id: "1", token: "valid" },
        { id: "2", token: "expired" },
      ],
      update: async (_, row, __, id) => {
        retired = row.is_active === false && id === "2";
      },
    };
    try {
      assert.equal(
        await sendUserPush(
          env,
          db,
          "test-user",
          "Test",
          "Synthetic message",
          "release_updates",
        ),
        1,
      );
      assert.equal(retired, true);
      assert.equal(calls, 3);
      assert.equal(
        await sendUserPush(
          env,
          { ...db, first: async () => ({ push_notifications: false }) },
          "test-user",
          "Test",
          "Synthetic",
        ),
        0,
      );
      assert.equal(calls, 3);
    } finally {
      global.fetch = original;
    }
  });
  console.log(
    `${checks} contract regression checks passed. No remote requests or writes.`,
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
