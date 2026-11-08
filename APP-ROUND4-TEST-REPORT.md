# APP-ROUND4 — Test report, v3.6.0 / versionCode 14

## Baselines / artifacts

- App source: `AnswerForU-Mobile-v3.5.0-APP-ROUND3-COMPLETE-SOURCE.zip`, preserved as the starting tree.
- Website source: `AnswerForU-v6.3.7-FINAL-complete-source.zip`, not older v6.1.52.
- Android package `com.answerforu.app`, Expo SDK 58, app version `3.6.0`, Android `versionCode=14`, `webMasterVersion=6.3.7`.

## Completed checks

| Check | Result | What it proves |
|---|---|---|
| `npm test` (`node --test tests/*.test.mjs`) | **59/59 PASS**, 0 failures | All 39 previous source/logic tests plus 20 Round 4 new tests passing; existing tests changed only to update intentional version assertions |
| TypeScript-parser syntax check of JS/JSX/MJS app/test files | **0 syntax errors** | Parse only; not the Android compiler/Metro bundler |
| `php -l WEBSITE-DEPLOY/public/api/index.php` | **PASS** | PHP syntax for current website v6.3.7 API allowlist overlay |
| Published category source parity | **17 places, 21 services, 10 jobs, 6 housing, 10 products, 8 group topics** | Taxonomy derived from website v6.3.7 source, not hardcoded in runtime mobile form |
| Civic counts in supplied source dataset | **100 + 128** | Exact source bank lengths from website civics key |
| Survival/Glossary regression fixture counts | **344 phrases/17 packs; 407 terms** | Supplied v3.5 test fixtures unchanged; **not** a live production query |
| Guest Journey crash error boundary | **PASS source coverage** | React error boundary wrapping the Journey route and guest read-only guard |
| TTS playing/stop lifecycle | **PASS source coverage** | Explicit stop state and callback cleanup wired; real device audio not exercised |
| Fully localized errors | **PASS pure-function tests AR/EN/ES** | Friendly error strings do not expose arbitrary raw exception messages |
| CV website-format model / import / repeatable fields | **PASS pure-function/source tests** | Saves the website's CV JSON data shape; not native PDF template parity |
| Google sign-in source bridge | **PASS source coverage** | Google ID token → existing `/api/auth/oauth/google/mobile` → site JWT wiring; real authorized account sign-in not exercised |
| Server-only editorial content imports | **PASS source coverage** | No runtime screen imports legacy bundled JSON; versioned cache of API responses |
| Public navigation | **PASS source coverage** | One Marketplace umbrella with nested filters; no public RideOffer link |

## Checks NOT completed (do not interpret as passes)

1. **Expo/Android build**: `npm install --offline --ignore-scripts --no-audit --no-fund` **FAILED ENOTCACHED**, because the `expo` dependency registry metadata is absent from this environment's npm cache. No native `expo-doctor`, Metro production export, APK/AAB or installed Android release could be built here.
2. **Live Google OAuth**: the actual Android OAuth client ID + matching SHA-1 were not provided. Server-side Google authorization and a working end-to-end signed Android login have **not** been demonstrated.
3. **Live published content endpoints**: URLs for website static content were not accessible from the available web reader; no authenticated HTTP or MySQL database query was run on deployed site v6.3.7. Counts above refer to source fixtures, not live API counts.
4. **New published content catalog**: `citizenship-vocabulary` and `marketplace-categories` are shipped in `WEBSITE-DEPLOY` but are **not yet proven deployed** on the live site; the mobile UI explicitly indicates when those endpoints are unavailable.
5. **Full website action parity and device QA**: all site routes/components were inventoried, but complete item-by-item parity across native admin moderation, profile detail subpanels, native website CV PDF/Word template rendering, account deletion confirmation, every click path, AR/EN/ES screen readers, camera permissions, mic and keyboard were not exhaustively validated on device. See the explicit gaps in `PARITY-MAP.md`.

## Reproduction checklist for Kiko

Run `npm install` online or with the owner's complete verified npm cache, `npm test`, `npx expo-doctor`, a release-signed Android build (`versionCode 14`), and an installed-device walkthrough in AR/EN/ES. Deploy the two additive published JSON files and current website `index.php` allowlist **only after confirming live baseline = v6.3.7**. Check `/api/content/static/citizenship-vocabulary` and `/api/content/static/marketplace-categories`; test the 9 citizenship pages, the 100+128 bank lengths, 344/17 Survival and 407 glossary live. Configure the existing Google Cloud project's actual Android OAuth client and fingerprint, then test an existing user and a new account. Confirm guest Journey no-crash, native audio stop/finish, errors in three languages, post/listing save/contact/delete, and CV create/edit/delete.

**Status:** Full source engineering release for owner/Kiko acceptance, **not** a production-certified, Android-built, fully parity-verified app.
