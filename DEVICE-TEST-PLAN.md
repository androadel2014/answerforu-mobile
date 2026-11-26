# AnswerForU app 3.7.2 (versionCode 21) — real-device test plan

Covers the five areas requested for the device pass: right-to-left screens, dark mode (manual and automatic), date and state pickers, Excel/Word share, and audio speeds. Each area lists what is already known to be weak.

Write the result of every check in the table at the end: **Pass**, **Fail** (with a screenshot), or **Note**.

## 0. Build and setup

**1. On the build machine (Kiko gate):**

| Step | Expected |
|---|---|
| `npm ci` | Installs without changing `package-lock.json`. |
| `node --test tests/*.test.mjs` | 108 tests, 0 failures. |
| `npx expo config --type introspect` | No line saying *"Install expo-system-ui in your project to enable this feature"*. `userInterfaceStyle` is `automatic`. |
| `npx expo-doctor` (optional) | No SDK-version mismatch for `expo-system-ui` / `expo-splash-screen`. |

**2. Build the Android test APK:** run `BUILD-PREVIEW-APK.bat`. This uses the EAS `preview` profile: an APK with internal distribution that installs directly on a phone.

**3. Confirm the build on the phone:** open All Sections. At the bottom of the Account card it must read **v3.7.2 · Website 6.4.3**.

**4. Devices and setup:**

- **Phones:**
  - at least one phone on Android 12–15 with gesture navigation;
  - if possible, one older phone (Android 9–11) or one with 3-button navigation.
  - Write down the model and Android version.
- **iPhone:** waiting for Andrew's decision on TestFlight. If iPhones join the pass, an iOS test-build profile will be added.
- **Language:** test each area in **Arabic** first, then spot-check **English** and **Spanish**.
- **Server:** live answerforu.com. Run the currency check in section 6 after website 6.4.3 is deployed.

## 1. Right-to-left screens (Arabic)

**Known weak spots:**
- Right-to-left is applied at the app root, so switching language needs no restart. It has only been checked in a simulation, never on a real phone, so **test this area hardest**.
- Expected, not a bug: the phone's own pieces keep the phone's direction (back gesture, share sheet, system dialogs).

| ID | Steps | Expected |
|---|---|---|
| R1 | Switch the language to Arabic from the header. Do not restart. Visit Home, Journey, Citizenship, Learn, Survival English, Community, CV builder, Profile. | Every screen is right-to-left: titles on the right, chevrons and arrows mirrored, numbered rows use round badges, and no line starts with a stray "." or ")". |
| R2 | Read mixed text: prices, "SSN", "DMV", "Checklist" inside Arabic sentences. | "$2" reads **$2**, not 2$. English words stay in order and do not jump to the other end of the line. |
| R3 | Open a date sheet, a month/year sheet and the state sheet in Arabic. | Title on the right, close (X) on the left, calendar laid out right-to-left. Day numbers are tappable. |
| R4 | Switch to English, then to Spanish, without restarting. | Everything turns left-to-right at once. Labels are in the chosen language. |
| R5 | Rotate the phone. | The app stays in portrait (portrait-only by design). |
| R6 | Long-press to copy selectable Arabic text, then paste it into Notes. | **Known, minor:** invisible direction marks are copied too. Note it only. |

## 2. Dark mode — manual and automatic

**Background and known weak spots:**
- **Fixed in this build, verify on the phone:** before 3.7.2, Android "Automatic" stayed light, because expo-system-ui was missing.
- **New in 3.7.2, verify:**
  - Native dialogs and the keyboard follow a manual Light or Dark choice.
  - The launch screen has a dark version.
- **Expected:** the launch screen follows the **phone** setting, not the in-app choice, because the app is not running yet when it shows.

| ID | Steps | Expected |
|---|---|---|
| D1 | Profile → Appearance → **Light**. | The app is light. A system dialog (e.g. sign-out confirmation) is light. |
| D2 | Appearance → **Dark**. | The app is dark. System dialogs and the keyboard are dark too, even if the phone is in light mode. |
| D3 | Appearance → **Automatic**. Phone Settings → Display → Dark theme **on**. Return to the app. | The app is dark. Toggle the phone setting while the app is open: the app follows within a second, with no restart, and typed text in forms is kept. |
| D4 | Automatic, phone dark theme **off**. | The app is light. |
| D5 | Swipe the app away (cold start) with the phone in dark, then in light. | Dark: navy launch screen with the compass. Light: cream launch screen with the compass. No white flash before the first screen. |
| D6 | In dark: open and close picker sheets, open the keyboard, move between screens. | No white frame shows behind sheets, the keyboard or screen transitions. |
| D7 | Contrast spot-check in dark: gold buttons, glossary terms, quiz result, step warnings card, road-sign tiles. | Everything is readable. Signs keep their real colours on a white tile. |

## 3. Date and state pickers

**Known weak spots, both fixed in 3.7.2 (verify):**
- Android could swallow scrolling inside the picker sheets.
- The keyboard could cover the state list.

| ID | Steps | Expected |
|---|---|---|
| P1 | Citizenship → eligibility calculator → a date field. | A calendar sheet opens. Change month and year from the header, then tap a day: the field shows the date and the age/eligibility updates. |
| P2 | Open the year grid and scroll quickly up and down (Android). | Scrolling is smooth. The first tap on a year selects it. |
| P3 | Open the state picker and type **فر** (Arabic) or **vir**. | The list filters as you type. With the keyboard open, results stay visible above it. **One** tap selects (no double tap). |
| P4 | Tap the dimmed area; press the Android back button; check the bottom of the sheet with gesture and with 3-button navigation. | Both actions close the sheet. The buttons at the bottom are not hidden under the navigation bar. |
| P5 | Small phone (5.5" or less): state sheet with the keyboard open. | At least three state rows are visible and scrollable. |
| P6 | Community → state filter and CV builder → month/year fields. | Same pickers, same behaviour. |

## 4. Excel and Word share

**Known weak spots:**
- Files are written to the app cache and handed to the share sheet with the right type. They have never been created and shared on a real phone before this pass.
- Google Sheets and Google Docs on phones may ignore the right-to-left sheet direction. Record what you see.

| ID | Steps | Expected |
|---|---|---|
| X1 | Journey → **Excel**. Share to Gmail, Drive or WhatsApp. Open the file in Microsoft Excel on the phone. | The share sheet offers the .xlsx. The Arabic sheet is right-to-left, with a frozen header row and filters. Progress matches the app. |
| X2 | Journey → **Word**. Open the file in Microsoft Word on the phone. | The .docx opens. Arabic paragraphs are right-aligned and tables run right-to-left. |
| X3 | Survival English → Excel and Word. | Same results as X1 and X2, with phrases, meanings and mastery. |
| X4 | Open the X1 and X2 files in Google Sheets / Google Docs. | **Known possible gap:** record whether right-to-left is kept. |
| X5 | Cancel the share sheet, then share again. | The app stays usable. The second share works. |
| X6 | Airplane mode, then export. | The file is created and the share sheet opens. Network share targets may queue until you are back online. |

## 5. Audio speeds

**Background and known weak spots:**
- The app speaks English (en-US) through the phone's own text-to-speech engine.
- Android and iPhone engines treat 0.75× and 0.5× differently.
- **New in 3.7.2:** a phone with no English voice shows a hint under "Speech speed". Some phones without Google services ship an engine with no English voice.

| ID | Steps | Expected |
|---|---|---|
| A1 | Survival English → play a pack. | Every phrase and reply is read in full. Long answers are not cut, and "/" is read as "or". |
| A2 | Speech speed: Normal 1x → Slower 0.75x → Very slow 0.5x. | The difference is audible. The setting is the same on Citizenship and Glossary, and after a restart. |
| A3 | Press Stop; leave the screen while audio plays. | Audio stops immediately in both cases. |
| A4 | Select a text-to-speech engine without English (if available), or uninstall the English voice data. | The hint appears: *"No English voice is installed on this phone…"* (Arabic and Spanish versions too). There is no hint on a normal phone. |
| A5 | Bluetooth headphones. | Audio plays through the headphones at the chosen speed. |

## 6. Also in this build (quick checks)

| ID | Steps | Expected |
|---|---|---|
| C1 | After website 6.4.3 is deployed: Learn → Money → flip Front/Back on every coin, including the half dollar. | All 10 coin sides show photos hosted on AnswerForU. Nothing loads from usmint.gov (no "not available" box on coins). |
| C2 | Register with a 7-character password, in each language. | The message reads "Password must be at least 8 characters." in the app language. |
| C3 | Profile → change password to 7 characters. | Same message. The old text "12 characters" no longer appears anywhere. |
| C4 | Kiko runs `VERIFY-LIVE-PASSWORD-RULE.bat` (needs Andrew's OK and an inbox). | "ALL PASSED". The JSON report is saved in `qa/`, and the test account is deleted. |

## Known weak spots — summary

| Area | Weak spot | Status in 3.7.2 |
|---|---|---|
| Dark mode | Android "Automatic" stayed light (expo-system-ui missing) | Fixed. Verify D3/D4. |
| Dark mode | Native dialogs and keyboard ignored a manual choice | Fixed (`Appearance.setColorScheme`). Verify D1/D2. |
| Dark mode | White launch screen on dark phones | Fixed (expo-splash-screen dark variant). Verify D5. |
| Dark mode | White flashes behind sheets and keyboard | Fixed (`SystemUI.setBackgroundColorAsync`). Verify D6. |
| Pickers | Scrolling swallowed by the sheet on Android | Fixed (backdrop behind the sheet). Verify P2. |
| Pickers | Keyboard covers the state list | Fixed (keyboard-aware sheet; list shrinks). Verify P3/P5. |
| Pickers | Buttons under the navigation bar | Fixed (bottom safe-area inset). Verify P4. |
| Audio | Silent "Listen" when the phone has no English voice | Hint added. Verify A4. |
| Audio | Speed sounds different on Android and iPhone | Platform behaviour. Record only. |
| Right-to-left | Only checked in a simulation | Test hardest (R1–R4). |
| Right-to-left | System pieces keep the phone's direction | Expected. Note only. |
| Right-to-left | Copied text carries invisible direction marks | Known, minor. Note only. |
| Excel/Word | Never run on a phone before | Verify X1–X6. |
| Excel/Word | Google Sheets/Docs may ignore right-to-left | Record only (X4). |

## Results

| Device / Android | Navigation | Language | ID | Result | Notes / screenshot |
|---|---|---|---|---|---|
| | | | | | |

**Screenshot names:** use `<ID>-<lang>-<light|dark>-<device>.png`, e.g. `P3-ar-dark-pixel7.png`.
