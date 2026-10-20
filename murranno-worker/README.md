# Murranno API — Cloudflare Workers + D1

Replaces Supabase (Auth, Postgres/PostgREST, Edge Functions) with one Worker. It serves the same
HTTP API that `supabase-js` talks to, so the web and Expo apps keep their code and only change
their base URL (`VITE_API_URL` / `EXPO_PUBLIC_API_URL`).

| Path | Replaces | Code |
|------|----------|------|
| `/auth/v1/*` | Supabase Auth (signup + email OTP/link, password, refresh rotation, recovery, Google/Apple) | `src/auth/` |
| `/rest/v1/:table` | PostgREST + RLS (per-table rules) | `src/rest/` |
| `/functions/v1/:name` | Edge Functions (same names) | `src/functions/` |
| `/webhooks/paystack` | both Paystack webhooks | `src/webhooks.ts` |
| cron `*/15 * * * *` | — releases 12h-delayed payouts, reconciles stuck transfers, cleans tokens | `src/webhooks.ts` |

Money is stored as integer kobo (`KOBO` columns) and returned to the apps as naira.

## Local development

```sh
npm install
cp .dev.vars.example .dev.vars          # local-only secrets
npm run db:init:local && npm run db:seed:local
npm run dev > wrangler.log 2>&1          # http://127.0.0.1:8787; emails are printed to the log
                                         # (only with ENVIRONMENT=development and no RESEND_API_KEY in .dev.vars)
WRANGLER_LOG=wrangler.log npm run smoke  # end-to-end check with supabase-js (110 checks)
node scripts/export-supabase.mjs --check # export converter self-test
npm run typecheck
```

## Production (Cloudflare account `d93620af…c954`)

| Piece | Where |
|-------|-------|
| API Worker `murranno-api` | https://api.murrannomusic.co (also murranno-api.murranno.workers.dev; cron `*/15 * * * *`) |
| Web app `murranno` (Pages → static-assets Worker) | https://app.murrannomusic.co (also murranno.murranno.workers.dev) — config in `murranno-music/frontend/wrangler.jsonc` |
| D1 `murranno-db` (WEUR) | schema + seed applied |
| R2 `murranno-media` | uploads, served at `<api>/media/<key>` |
| Secret `JWT_SECRET` | set (random, 48 bytes) |

Deploy: `npm run deploy` here; web: `cd ../murranno-music/frontend && npm run build && npx wrangler deploy`
(production builds read `VITE_API_URL` from `.env.production`).

Requires the **Workers Paid** plan: migrated passwords are bcrypt and exceed the free plan's 10 ms CPU limit.

### Still to do (needs your credentials)

1. **Secrets** — `PAYSTACK_SECRET_KEY` and `RESEND_API_KEY` are set (Resend domain `murrannomusic.co` verified). Still needed,
   with `npx wrangler secret put <NAME>`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `APPLE_SERVICES_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`.
2. **Providers** — Google OAuth redirect URI and Apple return URL: `https://api.murrannomusic.co/auth/v1/callback`;
   Paystack webhook: `https://api.murrannomusic.co/webhooks/paystack`.
3. **Custom domains** — done: `app.murrannomusic.co` (web) and `api.murrannomusic.co` (API), set as `routes` in each
   `wrangler.jsonc`; `EXPO_PUBLIC_API_URL` is set per build profile in `murranno-expo/eas.json`. The `*.workers.dev` URLs stay
   on (`workers_dev: true`) until old clients are gone; then set it to false and drop them from `ALLOWED_REDIRECTS`
   and `_headers`. `murrannomusic.co` itself is free for the marketing site.
4. **Data** — imported 2026-10-19 (6 users, balances verified). To re-run: stop writes to Supabase first, and use the
   **session pooler** (`aws-1-eu-north-1.pooler.supabase.com`, user `postgres.<ref>`); the direct `db.<ref>` host is IPv6-only
   ```sh
   SUPABASE_DB_URL='postgresql://postgres.<ref>:<password>@<pooler-host>:5432/postgres'    SUPABASE_CA_CERT=./prod-ca-2021.crt npm run export:supabase
   npx wrangler d1 execute murranno-db --remote --file=export/murranno-data.sql
   ```
   Read `export/integrity-report.txt`, spot-check counts and a few wallet balances, then **delete `export/`**
   (password hashes + personal data). Users keep their passwords; everyone signs in once more.
   Cloudinary media was copied to R2 on 2026-10-19; nothing references Cloudinary any more.
5. **Mobile** — ship new Expo/Capacitor builds (they point at the API). Installed versions still talk to Supabase until
   updated: force the update (or make Supabase read-only) so there are never two live databases.
6. **First admin** (only on a fresh database; migrated admins keep their role):
   ```sh
   npx wrangler d1 execute murranno-db --remote --command      "UPDATE user_roles SET tier='admin' WHERE user_id=(SELECT id FROM profiles WHERE email='you@example.com')"
   ```
7. Decommission Supabase and Netlify once traffic is on Cloudflare, and close the Cloudinary account (its media is already in R2).

## Known differences from Supabase

- **Realtime** is not provided: the web app polls every 30 s instead (notifications still toast when new ones arrive).
- Functions no client calls were not ported, including the unsafe ones (`update-subscription-tier`,
  `admin-promote-user`, public `send-*-email` relays). Notifications/emails they sent are now sent server-side.
- Withdrawals ≥ ₦100k no longer require an OTP (no app screen could supply one); every withdrawal
  ≥ ₦50k already goes to admin review.
- Push notifications are counted but not delivered (unchanged from before).
- KYC documents are private: stored under `private/kyc-documents/<userId>/` in R2 and opened through a 10-minute
  signed link from `media-signed-url` (owner or admin only). All other media is public at `/media/<key>`.
- Label/agency invitations start `pending`; the artist accepts through the signed link in the invite email
  (there is no in-app accept screen yet). Until then the label/agency gets no access.
- Changing the PIN needs the current PIN; changing the password or email needs the current password (except right
  after a reset link, or for Google/Apple-only accounts). The account's address is notified of credential changes.
- Account deletion is refused while the wallet holds money.
