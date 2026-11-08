# APP-ROUND2 — Expo SDK 58 Upgrade Notes

**Base:** `AnswerForU-Mobile-v3.4.0-APP-ROUND1-COMPLETE-SOURCE-FRESH-ATTACHMENT.zip`, unchanged prior release (original SHA-256 `738e7bbf35ad937f242c32c1a2921bce22ca0be08ba31ac36c18ff1dfeda102b`).

**Release:** AnswerForU Mobile `3.4.1` · Expo SDK `58` · Android `versionCode=12` · website master version remains `6.1.52`.

## Package versions

Version targets were checked against the official Expo SDK 58 API reference (its *Recommended version* values) and the maintained third-party speech-recognition package. Expo SDK 58 targets React 19.3.0 and React Native 0.88.x; the current stable patch chosen here is 0.88.1. `expo` 58.0.23 was the latest published 58.x patch found for Nov. 5, 2026.

| Package | v3.4.0 | v3.4.1 (SDK 58) |
|---|---|---|
| `expo` | `~57.0.17` | `~58.0.23` |
| `expo-document-picker` | `~57.0.2` | `~58.0.4` |
| `expo-file-system` | `~57.0.7` | `~58.0.13` |
| `expo-image-picker` | `~57.0.19` | `~58.0.10` |
| `expo-notifications` | `~57.0.24` | `~58.1.8` |
| `expo-secure-store` | `~57.0.4` | `~58.0.2` |
| `expo-sharing` | `~57.0.21` | `~58.0.22` |
| `expo-speech` | `~57.0.3` | `~58.0.3` |
| `expo-speech-recognition` | `^57.0.0` | `^58.0.1` |
| `react` | `19.2.3` | `19.3.0` |
| `react-native` | `0.86.3` | `0.88.1` |
| `react-native-safe-area-context` | `~5.6.2` | `~5.11.1` |

*No package was replaced.* The maintained `expo-speech-recognition` library has SDK 58 release `58.0.1`. This is a custom native module and is **not included in Expo Go**; see the Expo Go limitation below.

## Exactly what code/config changed

1. `package.json`: SDK 58-compatible Expo, React, React Native and library versions; app version `3.4.1`. Existing scripts, entry point and other keys unchanged.
2. `app.json`: `expo.version=3.4.1`, Android `versionCode=12`, `extra.cleanMobileVersion=3.4.1`. **Unchanged:** `com.answerforu.app` Android/iOS IDs, `https://answerforu.com` API URL, `extra.webMasterVersion=6.1.52`, existing config plugins and permissions.
3. `src/services/offline.js`: `await file.write(...)` rather than ignoring the now-async `File.write()` Promise in SDK 58. The disk-cache format, directory, keys and version are unchanged.
4. `App.js`: removed the three obsolete React Native `StatusBar.backgroundColor` props; left `barStyle=dark-content` and layout intact. RN 0.88 removed this prop; modern Android edge-to-edge system bars determine their actual appearance.
5. `src/screens/CitizenshipScreen.js`: moved the `expo-speech-recognition` module initialization from a top-level import to a guarded on-demand `require` inside the original microphone handler. On a real EAS/development build the same speech-recognition implementation and configuration are used. In Expo Go, the app no longer fails at initial import; the microphone button explains (AR/EN/ES) that a development build is required. Typed civics answers are unaffected. **This Expo Go spoken-answer limitation cannot be fixed by switching to a normal JS library**, because the Expo Go binary does not contain a native speech-recognition engine.
6. `src/services/pushGroundwork.js`: added an explicit foreground notification handler that suppresses banners/list/sound/badge. SDK 58 otherwise shows foreground notifications by default; setting the handler preserves SDK 57's behavior when no handler had been installed. Existing permission opt-in and no-backend-push-registration behavior are unchanged.
7. `tests/mobileRound1.test.mjs`: adjusted **only** the expected app version in the original version-assertion test from `3.4.0` to `3.4.1` (its test name updated accordingly). All other 30 built-in assertions/tests remain unchanged.

Other SDK 58 changes examined: the project is JS (no Strict TypeScript migration), does not use React Native `InteractionManager`, deprecated root `Touchable`, `Modal.animated`, `ImageBackground`, or deep React Native imports. It has no manually managed `android/` or `ios/` project, so SDK 58's iOS scene lifecycle and native template changes will be generated automatically by Expo during EAS/`prebuild`. `NODE_ENV` is not used by any app config files or custom scripts.

## What stays identical

- Original **78 of 85 files** are byte-for-byte identical, including all bundled JSON learning/content files and every screen except the minimal citizenship compatibility guard.
- Civics banks: **2008=100**, **2025=128**; Survival English: **344 phrases**, **17 packs**; Glossary: **407 entries**, 200 English Basics.
- API base: `https://answerforu.com`. Android package: `com.answerforu.app`. Website master: `6.1.52`.
- All existing navigation, data schemas, offline storage keys, language strings, authentication, and endpoint paths are unchanged. The only new user-visible text is the three-language Expo Go voice-input limitation message, displayed if a user presses the microphone in Expo Go.

## Behavior and device limitations

- **Expo Go:** SDK 58-compatible application source; standard Expo SDK APIs, native TTS, offline content, and typed civics practice remain usable. **Spoken civics answer recognition requires a custom EAS/development build**, just as it did with the v3.4.0 third-party native dependency. Guarding the module avoids an app-start import crash in Expo Go. No Expo Go build/emulator was available for a runtime check.
- **Android system bars:** the now-removed `StatusBar.backgroundColor` prop means exact Android status-bar background appearance may be OS-dependent, especially with edge-to-edge. The existing light page and dark-content configuration remain unchanged. This visual difference is forced by RN 0.88's API removal.
- **Foreground notifications:** the previous hidden-without-handler behavior is explicitly restored, avoiding SDK 58's new show-by-default behavior.
- **EAS / release validation:** SDK 58 dependencies and plugins are configured for EAS builds, but **an actual install, Metro bundle, native build, Expo Doctor, and Expo Go device smoke test were not possible here**: package downloads cannot reach `registry.npmjs.org` (`EAI_AGAIN`). This is a source migration with a passing local test suite, **not a certified successful EAS build**.

## How to validate on a connected machine

Requires Node.js 22.13+ (22.16.0 used for the local tests), current npm, Expo Go supporting SDK 58, an Expo/EAS account, and native build credentials as appropriate.

```bash
npm install
npx expo install --check
npx expo-doctor
npm test
npx expo start --clear
npx eas-cli@latest build --platform android --profile preview
npx eas-cli@latest build --platform android --profile production
```

For the **microphone feature**, run an EAS/development build containing the `expo-speech-recognition` config plugin. The Play Store preview/profile is a native build and can include it. Never interpret testing in Expo Go as testing this custom native module.

## Validation performed

- Original v3.4.0 suite: 31/31 PASS.
- Migrated v3.4.1 suite: **31/31 PASS** (`npm test`, `node --test tests/*.test.mjs`).
- TypeScript JSX-capable parser: **52 JS/MJS files, 0 parse errors**.
- Separate source/config/data/async-cache regression audit: **PASS** (includes a mocked delayed `File.write()` to check that `writePack()` awaits completion).
- JSON/data counts and all hard invariants: **PASS**.
- Byte comparison with v3.4.0: **78 files unchanged**, 7 existing files changed only for the migration; no assets or learning-data JSON changed.
- npm dependency installation, Metro, Expo Go, EAS build: **NOT VERIFIED** due to unreachable npm registry and no simulator/cloud build credentials.

## SHA-256 for all changed source files

| Changed file | v3.4.0 SHA-256 | v3.4.1 SHA-256 |
|---|---|---|
| `App.js` | `4f9878d71b873f129834ae8488c5eab5d52574ef5116adeb8a18d13034e8872a` | `ceeb09c49f8a07722cc88c81ec274dfaf435a4409155b0a4021ab1a5a3470037` |
| `app.json` | `0ace531e61bec338685d23cf8916bf919c1490a668669b17fb0685e6ee408010` | `38ed2367a0caeb3bab8cdbde6d64a911367930ec7c826a294555fe434cf6a641` |
| `package.json` | `cc5e4ce35df97810e72b1bdada8f3a39037d3df6a65b4915566cefe0783c962c` | `9e4f5151f7dedf4c336a28b9197fa29f992312a7cedf9980f4c49736410a5f22` |
| `src/screens/CitizenshipScreen.js` | `a68d9d4d9a36996f804d1a02d05baf3293ee603b5110a38103684026d5a1605e` | `4a713e517ae3f0090d7e4cd7864c20ec6da2c58de5b0f35de493ee3add3f12ae` |
| `src/services/offline.js` | `35361344395809b6984c8fc4b8e3af633cb9f59a3267f46d0a5e8ad0c024e513` | `c4b3646ff450d1f50c76e8664500978a98b3207ef2c9aafb24108564529c289e` |
| `src/services/pushGroundwork.js` | `5e2957b532a8cd8b6c4f68066396fd64b9215b0f631af80a62c9124598883923` | `411e327783a00074e85aeccd047401d663a2584076dabd0153c468da539ce81e` |
| `tests/mobileRound1.test.mjs` | `59ad51a8f1d42416ea9cd26baf5f9243ad322fda60f9048d5b072fd494453d26` | `b058429426c7c09e8b57446ececd476a2c2298fffa1b31f4a17ef1e047058933` |

## Expo references

- SDK 58 release notes: https://expo.dev/changelog/sdk-58
- SDK 58 compatibility/version reference: https://docs.expo.dev/versions/latest/
- Official SDK 58 upgrade guide: https://expo.dev/blog/how-to-upgrade-to-sdk-58
- SDK 58 package reference (replace package at end as needed): https://docs.expo.dev/versions/v58.0.0/sdk/filesystem/
- Speech recognition package: https://www.npmjs.com/package/expo-speech-recognition
- Expo Go native-module limitation: https://docs.expo.dev/develop/development-builds/faq/
