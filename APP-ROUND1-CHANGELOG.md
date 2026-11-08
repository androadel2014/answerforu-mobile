# AnswerForU Mobile — v3.4.0 / APP-ROUND1

**Base:** supplied `AnswerForU-Mobile-v3.3.0-API-CONNECTED-FULL-SOURCE` ZIP; **website reference:** supplied v6.1.52 source. Complete Expo/React Native mobile source; not a patch. Original authentication and PHP API connection preserved.

## Added / changed
- Native citizenship hub with naturalization stages, eligibility estimator, trilingual study notes, both official civics banks, mock tests, dynamic-answer API integration, typed and voice-transcribed answer input, mastery and M-638 words.
- Native Survival English with **344 phrases / 17 packs**, phrase and reply TTS, 3 speech speeds, play-all with STOP, study/flash/quiz, Arabic-script search, and server progress plus offline retry.
- Bundled **407 glossary terms**, 200 English Basics with pronunciation/examples, offline cache, native speech/share, category filter, and incremental display.
- Password-change form in Profile via existing v6.1.52 API; Admin users name/email filter.
- Offline download/cache screen, versioned disk snapshots, background public-content refresh, queued account-specific study progress, native device speech, Home search, native post sharing, community photo capture, CV camera and edits/deletion, and existing server places paging (24/page).
- Expo app version `3.4.0`, Android versionCode 11, `extra.webMasterVersion = 6.1.52`; added required Expo native dependencies and config plugin declarations.
- Push notification permission/token-client groundwork only. Server push enrollment and delivery are **not implemented**.

## Validation and scope
- Run `npm test` to check the supplied tests.
- React/JS syntax was checked with an external TypeScript parser; this is **not** an Expo build.
- `npm install --offline` failed because the npm package metadata for Expo was not cached. Build and physical-device runtime checks are still needed.
- See `PARITY-MAP.md` for explicit remaining parity gaps rather than a misleading zero-gap claim.
- See `APP-ROUND1-API-ENDPOINTS.md` for used existing API endpoints and future push backend requirement.
- See `APP-ROUND1-TEST-REPORT.md` for commands and counts.
- See `APP-ROUND1-SOURCE-SHA256.tsv` for old/new hashes of modified source files and new-file hashes.
