# AnswerForU app 3.7.2 (versionCode 21): follow-up to 3.7.1

Follows the owner's QA on 2026-11-26.

**Base:** 3.7.1 (versionCode 20) exactly as delivered on 2026-11-21, plus Kiko's `package.json`, `package-lock.json` and `app.json` from `npm install` then `npx expo install expo-system-ui expo-splash-screen`.

**Website version:** 6.4.3. **Change count:** 6 files added (plus this changelog), 18 modified, 0 removed. Full list with SHA-256 values: `CHANGES-vs-2026-11-21-*.txt` at the root of the package.

**Unchanged:** no new Android permission.

---

## M4. Android automatic dark mode (expo-system-ui) and a dark launch screen

### What changed

**Dependencies, as installed by Kiko:** `expo-system-ui ~58.0.7` and `expo-splash-screen ~58.0.14`.
- Compared with the 3.7.1 lock, Kiko's lockfile adds **exactly these two packages**: no version changes, nothing removed.
- My only edits on top of Kiko's files are the version fields (3.7.2) in `package.json` and in the lock root.

**`app.json`.**
- Plugin `"expo-system-ui"` added. It is needed on Android, or `userInterfaceStyle: "automatic"` is ignored.
- `expo-splash-screen` is configured with the **existing app icon** (no new artwork) at `imageWidth` 180:

| Mode | Background | Matches |
|---|---|---|
| Light | cream `#FAF3E0` | the app's light background |
| Dark | `#0B1220` | the app's dark background |

- Version 3.7.2, versionCode 21, `webMasterVersion` 6.4.3. `userInterfaceStyle` stays `automatic`.

**`App.js`.**
- `SystemUI.setBackgroundColorAsync(C.bg)` runs on every appearance change, so no white frame shows behind sheets, the keyboard or screen transitions.
- A manual Light or Dark choice is also passed to the phone with `Appearance.setColorScheme`, so system alerts and the keyboard match. "Automatic" passes `'auto'`, which removes the override.
- Both calls are guarded (try/catch), so they cannot crash the app.

**`src/config.js`:** `APP_VERSION` 3.7.2, `WEB_MASTER_VERSION` 6.4.3.

### Files
`package.json`, `package-lock.json`, `app.json`, `App.js`, `src/config.js`.

### How it was verified
- **Round-9 tests** (`tests/mobileRound9.test.mjs`) cover:
  - both packages pinned at SDK-58 versions;
  - `package.json` and the lock root in sync, so `npm ci` works;
  - registry URLs and sha512 integrity for both lock entries;
  - the plugins and the light/dark launch-screen settings, with image files present;
  - the `App.js` wiring.
- **Not run here:**
  - `npx expo config --type introspect` needs `node_modules`, which this workspace cannot install. It is the first gate in DEVICE-TEST-PLAN.md: it must not print "Install expo-system-ui…".
  - On-device checks D1–D7 in DEVICE-TEST-PLAN.md.

---

## M5. 8-character password rule, end to end against the server

### Script

`scripts/verify-live-password-rule.mjs` (Node 18 or later, no packages) and `VERIFY-LIVE-PASSWORD-RULE.bat` for Kiko. The script uses the app's own requests and the app's own policy.

**What it checks (17 steps):**
1. Registration with 7 characters gets `422 PASSWORD_TOO_SHORT`, and the error code is one the app translates.
2. That refused registration created no account: sign-in fails.
3. Registration with a valid password succeeds with the same username and e-mail.
4. Sign-in works.
5. Change password to six samples and compare the server's answer with the app's own check for each:
   - 7 characters;
   - 7 characters including an emoji;
   - a common password;
   - 8 characters;
   - 8 characters including an emoji;
   - 10 Arabic letters.
6. The old password no longer works; the current one does.
7. The account is deleted, and sign-in fails afterwards.

**Safety:**
- It refuses to touch a non-local server without `--yes-create-test-account`.
- It always deletes the test account at the end, even after a failure. Cleanup uses the server's immediate delete, `DELETE /api/auth/account` with the password and "DELETE".
- It writes a JSON report to `qa/`, with passwords masked.

### Results
- **Against a local copy of the v6.4.3 PHP API** (SQLite; same password rules as live v6.4.2): **ALL PASSED, 17/17.**
- **Same script with the 3.7.1 policy file:** it fails exactly one check: *"7 characters incl. an emoji: app accepts, server refuses (422 PASSWORD_TOO_SHORT)"*. That is the mismatch fixed below.
- **Production run:** not done yet. It waits for Andrew's OK on the test account and the inbox. Then Kiko runs `VERIFY-LIVE-PASSWORD-RULE.bat`.

### Fixed: what the check found
1. **Character counting.**
   - **Problem:** the app counted UTF-16 units, while the server counts Unicode characters and caps the size at 4096 UTF-8 bytes. So a password with an emoji could pass the app's check and then be refused by the server.
   - **Fix:** `src/logic/passwordPolicy.mjs` now counts like the server. This is the same code as website 6.4.3.
2. **Messages for the server's refusals.**
   - **Problem:**
     - Profile → change password showed **"Use at least 12 characters"** for the server's `PASSWORD_TOO_SHORT`. That text was left over from the old 12-character rule.
     - It showed a generic error for `PASSWORD_TOO_COMMON` and `PASSWORD_IS_PERSONAL`.
     - Registration showed a generic error for every password code, and the server's own text is Arabic only.
   - **Fix:** both screens now show the same words as the app's own check, in the app's language (`passwordServerProblem`).

### Files
- **Added:** `scripts/verify-live-password-rule.mjs`, `VERIFY-LIVE-PASSWORD-RULE.bat`
- **Modified:** `src/logic/passwordPolicy.mjs`, `src/components/PasswordInput.js`, `src/screens/AuthScreen.js`, `src/screens/ProfileScreen.js`

---

## M6. Prepare the build for the real-device test pass

### `DEVICE-TEST-PLAN.md` (new)

For each check, steps, the expected result and a results table. It covers:
- **Right-to-left:** R1–R6.
- **Dark mode, manual and automatic:** D1–D7.
- **Date and state pickers:** P1–P6.
- **Excel/Word share:** X1–X6.
- **Audio speeds:** A1–A5.
- **Quick checks:** currency photos and password messages, C1–C4.

It also has the build-machine gate commands, the build step (`BUILD-PREVIEW-APK.bat`), how to confirm the build on the phone (All Sections shows "v3.7.2 · Website 6.4.3"), and a summary of the weak spots.

### Fixed before the pass

**Picker sheets (`src/components/FormPickers.js`).**
- The dimmed backdrop now sits **behind** the sheet instead of wrapping it. A wrapping touch area can swallow scrolling on Android.
- The sheet is keyboard-aware (`KeyboardAvoidingView`).
- The state list and the year grid shrink above the keyboard, and the first tap selects. The year grid now also keeps taps while the keyboard is open.
- The bottom safe-area inset keeps the buttons clear of the navigation bar.

**Currency photos only from AnswerForU (`src/logic/currencyPhotos.mjs`, `src/screens/LearnScreen.js`).**
- Same rule as website 6.4.3: usmint.gov / uscurrency.gov are never image sources; the official page stays a link.
- Combined with the 6.4.3 server, every coin side loads from AnswerForU.

**Voice hint (`src/services/voiceCheck.js`, `src/components/VoiceSpeed.js`).**
- If the phone reports its voices and none of them is English, a one-line hint appears under "Speech speed".
- A phone that does not report its voices never gets a false alarm.
- **Correction to my scope note:** the app speaks only English (en-US). No screen uses an Arabic voice, so the useful check is for an English voice, not an Arabic one.

### Flagged, not changed
These are in the device plan as things to record:
- Right-to-left has only been checked in a simulation, so test it hardest.
- Back gesture, share sheet and system dialogs keep the phone's direction. This is expected.
- Android and iPhone engines treat speech speeds differently.
- Google Sheets and Docs on phones may ignore right-to-left sheets.
- Copied text includes invisible direction marks.
- The launch screen follows the phone's setting, not the in-app choice, because the app is not running yet.

### How it was verified
**Round-9 tests:** sheet structure, keyboard settings, the currency rule (identical to the website's), the voice hint and the plan's contents.

**Rendered in the browser simulation of the app (DOM shim):**
- **State sheet:**
  - the backdrop sits beside the sheet, not around it;
  - right-to-left in Arabic dark mode;
  - "vir" lists Virginia and West Virginia, and one tap selects.
- **Voice hint:**

| Voices the phone reports | Hint shown |
|---|---|
| Only Arabic | Yes |
| English and Arabic | No |
| None reported | No |

- **Learn → Money with old raw content:** 12 cards show "not available", and **0 requests** go to usmint.gov / uscurrency.gov. Before 3.7.2 the app requested them.

---

## Tests and checks
- **Tests:** `node --test tests/*.test.mjs` gives **108/108** (was 97). Round 9 is new, with 11 tests.
- **Re-pinned for 3.7.2:**

| Round | What changed |
|---|---|
| 1, 3, 4, 5, 6 | Version, versionCode and website version |
| 5, 6, 8 | Plugin count 5 → 7, on purpose: the two appearance plugins |
| 8 | Dependency list (+2) and the currency-photo line, now hosted-only |

- **Hash pins:** no pinned "byte-identical" file changed (`voice.js`, `storage.js`, `api/client.js` and the data files are untouched).
- **Parse:** all 87 source files parse.
- `app.json`, `package.json` and `package-lock.json` are valid JSON.

## Not closed / waiting on you
- **Production run of the password check:** Andrew's OK on one test account plus an inbox you control, then Kiko runs `VERIFY-LIVE-PASSWORD-RULE.bat`.
- **iPhone in the device pass:** waiting for Andrew. If yes, I add an iOS TestFlight build profile.
- **On the build machine:** `npm ci`, then `npx expo config --type introspect` (gate 0 in DEVICE-TEST-PLAN.md), then `BUILD-PREVIEW-APK.bat`.
