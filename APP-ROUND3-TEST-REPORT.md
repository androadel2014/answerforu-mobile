# APP-ROUND3 — Test report v3.5.0

## Executed

- `node --test tests/*.test.mjs`: **39 tests passed, 0 failed**. This consists of the **31 previous tests** (version expectation updated to the requested 3.5.0) and **8 new tests** in `tests/mobileRound3.test.mjs`.
- New tests: 4-second boot timeout; failure of native storage; web localStorage token/language recovery; Arabic/English/Spanish network error localization and no raw error leakage; single-source app version and unchanged API/Android identifiers; listing card/detail actions; Google route/JWT reuse; guest journey preview.
- `php -l web-master/public/api/index.php`: syntax valid.
- TypeScript parser (`transpileModule`, JSX preserved) across JS/JSX/MJS source and test files: 0 parse errors.
- Bundled educational JSON bytes unchanged compared to the v3.4.1 ZIP; counts 100/128, 344/17, 407 confirmed.
- ZIP CRC/integrity and a re-extracted `npm test` run: checked in packaging.

## Not executed / cannot certify

- `npm install`, `npx expo-doctor`, native Android/iOS or EAS build, and Expo web export: dependencies are **not installed** in this environment.
- Google Cloud OAuth client IDs, mobile redirect, and deployed website JWT bridge: **unconfigured / not tested end-to-end**.
- Actual phone screenshots, accessibility contrast measurement, keyboard/RTL, TTS audio and microphone, API integration, and QA of destructive actions: require Kiko device and test-account verification.

**Status:** Complete v3.5.0 development source; verified code/data checks only. Not a production-certified or function-for-function fully parity-verified release.
