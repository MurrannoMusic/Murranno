# Mobile functionality repairs

19 October 2026. This records implementation and local verification; no production deployment, database migration, real account change, payout, or payment was performed.

## Implemented

- KYC comes from the account profile and refreshes on focus, including accounts without an artist row. Upload validation also enforces verified identity on the server.
- Withdrawal includes a transaction PIN and an idempotency key, shows backend errors, and refreshes balance/history after submission. Bank verification clears on account/bank changes, ignores obsolete responses, and is repeated by the backend before recipient creation. Forms scroll on smaller screens.
- Password recovery and signup verification have receiving screens, email/code forms, and the registered `murrannoexpo` return scheme. Email/password changes require the current password. Google/Apple use actual OAuth sessions; unavailable providers are disabled based on server configuration.
- Upload requires cover art, valid ISO date, audio, duration, distribution stores, and legal songwriter names. Android/iOS/web credit dialogs replace native-only prompts. Browser uploads contain real multipart File parts and retain file MIME types. Pending releases retain descriptions, secondary genre, featured artists, producers, and explicit flags.
- Release list/detail mappings match the Worker responses. Audio loading errors release the loading state and URI changes unload old playback. Earnings sources map the actual response and compute shares from amounts, without inventing stream/growth figures.
- Profile and personal changes use one database transaction; cancel restores all fields. Avatar saving refreshes the profile. Streaming links open saved URLs and are editable in Profile.
- Settings includes current subscriptions, checkout access, credentials, PIN, security activity, saved notification preferences, notification inbox, version checking, and account deletion. Light/Dark/System remains in Settings.
- Subscription checkout uses server pricing and an HTTPS Worker callback that returns to the app. Payment verification precedes activation; both success and failure return to a reviewable screen.
- Campaign navigation, status changes, metadata mapping, and reported performance metrics are wired. Analytics uses matching inclusive reporting dates and complete store/country breakdowns. The unsupported playlist tab was removed because no playlist reports exist in the backend.
- Support only clears a successfully saved request. Failed saves retain the message; ticket-list failures offer retry. Data hooks expose errors and refresh relevant screens on return.
- FCM delivery uses service-account authentication, honors preferences, counts actual accepted sends, and retires expired tokens. Native token registration/refresh is connected. Device tokens move to the current account; logout deactivates matching registrations.

## Verification

From the repository root:

```powershell
npm --prefix murranno-expo run typecheck:app
npm --prefix murranno-expo run test:flows
npm --prefix murranno-worker run typecheck
npm --prefix murranno-worker run test:mobile
```

`typecheck:app` covers routed Expo screens and their imported dependencies, plus platform-specific library files. It excludes unused legacy components and the separate Deno functions; it does not claim the legacy full-project compiler passes.

18 actual-handler contract checks cover identity, upload validation/persistence, PIN requirements, campaign state/ownership, profile batching, preference validation, analytics bounds, provider-resolved bank names, server-priced checkout, and FCM signing/delivery with synthetic provider responses. No external provider requests are made by these tests.

The database suite uses the actual database adapter and real in-memory SQLite schema, rather than stubbing every database result. It checks metadata/JSON/boolean persistence, money decoding, KYC, release audio, atomic profile rollback, preference defaults, campaign metrics/pause, and device-token reassignment. Node 24 was used. Fresh schema and upgrade-migration columns were also compared locally.

The support test executes the screen's actual submit handler for both save success and database failure.

Browser evidence is under `output/playwright/`:

- `settings-withdrawal-review.log`: password failure/success, PIN submission, withdrawal PIN/idempotency, artwork validation.
- `upload-finish-review.log`: real file selection, multipart files, credits, explicit metadata, release submission navigation, store/country reporting, dark theme, 320px overflow check.
- `preferences-bank-review.log`: preference rollback/save and re-verification after an account-number change.
- Screenshots: `settings-functional-light.png`, `settings-functional-dark.png`, `upload-review-functional-light.png`, `bank-functional-dark.png`.

Browser API responses are intercepted synthetic fixtures. These checks establish UI behavior and outgoing contracts, not live payment/authentication/provider delivery. The earlier audit scripts in `output/functionality-audit` are historical reproductions, not the current regression commands.

## Deployment requirements

1. Back up the existing D1 database and apply `migrations/0001_release_metadata.sql` once to an existing database. A fresh database should use `src/db/schema.sql`, which already includes these columns; do not apply the ALTER statements again to a fresh schema.
2. Deploy the Worker after the migration, then build/publish the Expo app against that API. Keep the Expo `EXPO_PUBLIC_API_URL` pointed at the deployed Worker origin. Mobile and Worker changes must ship together.
3. Configure Paystack and email provider secrets, plus the existing Google/Apple OAuth settings and provider callbacks. `get-mobile-config` exposes provider availability without exposing secrets.
4. Configure `FCM_SERVICE_ACCOUNT_JSON` as a Worker secret for server delivery. The installed Android app needs its Firebase config and notification permission. iOS also needs its Firebase plist, APNs credentials/capability, and a native build. Expo Go does not supply these native Firebase modules.
5. Optionally publish `MOBILE_APP_VERSION`, `IOS_STORE_URL`, and `ANDROID_STORE_URL`. Version checking reports unavailable information honestly until these are configured.
6. Run provider-sandbox tests for signup/recovery/email change/OAuth, bank resolution and transfers, subscription payment/return, then Android/iOS device checks for file/camera permissions, audio, keyboard layouts, deep links, and push delivery. No claim of full production/native verification is made by local tests.
