# AnswerForU Mobile v3.6.0 (Android code 14)

Complete source based on v3.5.0 and website v6.3.7, Expo SDK 58, React Native, API `https://answerforu.com`, package `com.answerforu.app`.

## Local setup

1. Run `npm install` with your known-working npm registry/cache and `npm test` (59 tests in this source release).
2. Copy `.env.example` to `.env` and set the **public** `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` generated for your package and release signing SHA-1. Do **not** enter a Google client secret, server JWT secret or private credentials in `.env` or Expo `EXPO_PUBLIC_*`.
3. Run `npx expo-doctor`; build a development client or release via `npx expo run:android` or EAS. Speech recognition and Google native auth are **not guaranteed** inside Expo Go.
4. If not already on the live server, deploy only the **additive** files inside `WEBSITE-DEPLOY` (see `WEBSITE-DEPLOY/README.md`) to the verified v6.3.7 website, then check the API routes. The app itself never installs the website changes.
5. Test the live API with existing admin/test accounts and correct signing credentials. See `APP-ROUND4-TEST-REPORT.md` and `GOOGLE-SETUP.md`.

**Authoritative files**: `REDESIGN-NOTES.md` (includes full CONTENT COVERAGE TABLE), `PARITY-MAP.md` (route & action inventory), `APP-ROUND4-TEST-REPORT.md` (what was actually run). App editorial data is fetched from website API and available offline only after the device downloads a snapshot. The old v3.5 JSON data under `src/data/website` is retained for regression fixtures, not loaded into runtime views.
