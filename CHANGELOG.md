# AnswerForU — beta-tester fixes (17 items): website v6.4.2 + mobile app 3.7.1 (versionCode 20)

Date: 2026-11-21 · Source report: beta tester Fady Francis, 17 items.
Owner decisions applied: password = minimum 8 characters + show/hide button + strength meter.
For item 17, the code-side part is done and the hosting-side part is listed as an explicit action
(it cannot be changed from source code).

## What is in this package

| Folder | What it is |
|---|---|
| `AnswerForU-v6.4.1/` | The complete website tree you uploaded (folder name kept), now **v6.4.2**. Build it as usual with `MAKE-PRODUCTION.bat` / `tools/build-production.py`. |
| `mobile-repo/` | The complete Expo app you uploaded (v3.7.0 / vc19), now **3.7.1 / versionCode 20**. |
| `CHANGELOG.md` | This file. The same copy is in both trees. |

**Frozen files were not touched and not recreated.** These are user uploads (`source-original/backend/uploads`, `public/uploads`),
`public/learn-assets` images, `source-original/backend/src/data/airports.json`, and the large DB dumps (`database/datasets/*.sqlite`,
`database/mysql/INITIAL-EMPTY-DB-ONLY.sql`). One QA gate creates an empty `database/datasets/AnswerForU-REAL.sqlite` when it runs.
That empty file was deleted before packaging. Config files are unchanged; `.htaccess` and `templates/public_html.htaccess` are unchanged.
No file was deleted from either tree. The website has 65 changed and 39 new files; the app has 48 changed and 21 new. Both counts include this CHANGELOG.md, and both lists are at the end.

## Verification summary

| Check | Website v6.4.2 | Mobile 3.7.1 |
|---|---|---|
| Parse every source file | 334/334 parse (esbuild, JSX) | 85/85 parse (esbuild, JSX) |
| Unit tests | 93 tests: 92 pass, 1 skipped. The skipped test builds a real .docx and needs `npm ci`; it passed here when docx 9.7.1 was linked in temporarily. | `npm test`: **97/97 pass** (87 existing + 10 new in `tests/mobileRound8.test.mjs`) |
| PHP | `php -l` 15/15 API files; `tools/test-v642-password-policy.php` passes | — |
| Production QA gates (`audit_source`) | **39/62 pass.** The 2 new v6.4.2 gates pass. The other 23 fail **exactly as they do on the untouched upload**: same gates, same FAIL lines (checked line by line). Each of them needs a frozen file that is not in the upload (DB dumps, learn-assets images, uploads, airports.json). No gate went from pass to fail. | — |
| Rendering | Chromium screenshots of the changed pages, in Arabic RTL and English, light and dark | Each changed screen was rendered in Chromium through a React Native DOM shim (Arabic, light + dark). This is **not** a device build: see "Action required" |
| Exported files | .xlsx opened with openpyxl. .docx opened with python-docx. Both converted to PDF with LibreOffice and checked visually (RTL tables, Latin codes in order) | Same checks on the app's own .xlsx/.docx writer output |

---

# Website v6.4.2 — one entry per tester item

### W1 — Every date field is a calendar picker · CLOSED
- **What changed:** New shared `DateField`, a calendar popover with these features:
  - month/year jump, keyboard navigation, min/max limits;
  - Arabic RTL with Latin digits, localized month and day names.
  - It replaces every typed or native date input.
  - Résumé dates use a new `MonthYearField` that writes the U.S. format ("Mar 2021", "Present").
- **Files:**
  - New: `src/lib/dates.js`, `src/components/form/DateField.jsx`, `src/components/form/MonthYearField.jsx`.
  - Changed: `src/pages/Citizenship.jsx` (filing and interview dates), `src/features/citizenship/EligibilityCalculator.jsx` (all dates), `src/features/admin/resources/StateResourcesAdmin.jsx`, `ResourceFormModal.jsx`, `src/pages/AdminRideOffer.jsx` (from/to), `src/components/cvbuilder/StepInput.jsx` (graduation, from/to with Present, course date).
- **Verified:** Calendar screenshots in Arabic RTL and English; picking, min/max and keyboard tested in Chromium; gate `qa-v642-tester-fixes.py` check 1.

### W2 — Speech rate shown only in English → works in all languages · CLOSED
- **What changed:**
  - One speech-speed control (`SpeechRateControl`, labels in ar/en/es) and one hook (`useSpeechRate`).
  - Every speaking page uses them: Survival English, Glossary, Citizenship trainer, Citizenship English.
  - It uses the same storage key as before (`afu_survival_speech_rate_v1`), so users keep their saved speed. A change on one page applies everywhere.
- **Files:**
  - New: `src/lib/speech.js`, `src/lib/useSpeechRate.js`, `src/components/SpeechRateControl.jsx`.
  - Changed: `src/pages/SurvivalEnglish.jsx`, `src/pages/JargonBuster.jsx`, `src/features/citizenship/CitizenshipTrainer.jsx`, `src/features/citizenship/CitizenshipEnglish.jsx`, `src/features/survival/survivalSpeech.js` (now re-exports the shared engine).
- **Verified:** `src/lib/tests/speech.test.mjs`; gate `qa-v633-owner-requests.py` check 12 (now checks the shared engine and passes); screenshots in ar/en/es.

### W3 — TTS read only the first word, and stopped at "/" · CLOSED
- **What changed:** One TTS engine (`speakSequence`) fixes both faults:
  - Utterances stay referenced until they end. Chrome was garbage-collecting them mid-speech.
  - After `cancel()` it waits 90 ms, and only if speech was playing. Chrome was cutting the next utterance to its first word.
  - Long text is split into chunks of up to 180 characters.
  - "A/B" is read as "A or B" / «أ أو ب» / "A o B". Dates, fractions and "24/7" are left as they are.
  - Links and emoji are removed before speaking.
  - Citizenship answers: every accepted answer is spoken, not only the first.
- **Files:** `src/lib/speech.js`, `src/features/survival/survivalSpeech.js`, `CitizenshipTrainer.jsx`, `JargonBuster.jsx`.
- **Verified:** 8 unit tests, among them "W-2/1099", "24/7", "and/or", the order of a chunked queue, and a stubbed `speechSynthesis` that drops unreferenced utterances.

### W4 — State code field → searchable list of state names · CLOSED
- **What changed:**
  - New ARIA combobox `StatePicker`. It searches by English, Arabic or Spanish name, by the 2-letter code, and by common Arabic spellings (فرجينيا / فيرجينيا).
  - It covers the 50 states and DC.
  - It replaces the state fields in: Citizenship, the eligibility calculator, journey onboarding, community filters (desktop and mobile) and admin state resources.
- **Files:**
  - New: `src/components/form/StatePicker.jsx`.
  - Changed: `src/features/marketplace/form/usStates.js` (Spanish names, aliases, `stateOptions`, `searchStates`), `Citizenship.jsx`, `EligibilityCalculator.jsx`, `features/roadmap/v2/components/JourneyOnboarding.jsx`, `features/community/components/CommunityFilters.jsx`, `StateResourcesAdmin.jsx`, `ResourceFormModal.jsx`.
- **Verified:** Screenshot: the Arabic search «فرج» selects Virginia. Gate check 4.

### W5 — Duplicated content: «دليل الخطوة» long + details, warnings twice, in most stages · CLOSED
- **What changed:** The journey step was restructured so each fact appears once:
  - «دليل الخطوة» = the checklist, plus "خطوات إضافية". These are editorial actions the checklist does not already say, at most 4 (6 when there is no checklist).
  - «التحذيرات» = authored warnings and the guide's caution sentences merged once, at most 3.
  - The full explanation moved into a collapsed «الشرح الإضافي — كل التفاصيل».
  - Removed: the duplicate action list, the documents-highlight box and the timing box.
  - Duplicates are found by the new `contentDedupe.js`: Arabic proclitic stemming, a synonym map, Jaccard similarity of at least 0.67 for short labels.
- **Files:** `src/lib/contentDedupe.js` (new), `src/features/roadmap/v3/components/JourneyTaskWorkspace.jsx`, `JourneyChecklist.jsx`, `StateGuidancePanel.jsx`.
- **Verified:**
  - Measured on the real content (46 steps): **25 duplicate pairs in 19 steps before, 0 repeated items rendered after.**
  - 7 "related" pairs remain by design: an action and a caution on the same topic, or two checklist group headings, such as «احسب ميزانية الطعام…» vs «احسب الوديعة… مش الإيجار فقط».
  - Screenshots in ar/en. Four roadmap gates were updated for the new structure (listed under "Gates and tests changed").

### W6 — RTL: numbers under «الإجراءات المطلوبة» / «التحذيرات», and Arabic RTL app-wide · CLOSED
- **What changed:**
  - `index.html` now starts as `<html lang="ar" dir="rtl">`.
  - A small boot script (`afu-theme-boot.js`) sets `lang`/`dir` from the saved language before the first paint, so pages no longer show LTR first and then flip.
  - Numbered lists use round number badges instead of `1.`, which an RTL line renders as `.1`. The badges sit on the reading side.
  - Search fields use logical (start/end) spacing.
  - The header language menu is a proper dialog.
- **Files:** `source-original/index.html`, `public/afu-theme-boot.js` + `source-original/public/afu-theme-boot.js` (new, identical), `JourneyTaskWorkspace.jsx`, `features/feed/components/FeedHeader.jsx`, `CommunityFilters.jsx`, `features/learn/components/RoadSignsLesson.jsx`, `src/components/Header.jsx`.
- **Verified:** Screenshots in Arabic of the journey step, warnings and lists; gate check 6.

### W7 — Dark mode, manual and automatic · CLOSED
- **What changed:**
  - Theme preference Light / Dark / Automatic. Automatic follows `prefers-color-scheme`.
  - The toggle is in the header and the mobile menu.
  - The boot script applies the theme before the first paint, so there is no white flash.
  - Dark overrides come from `tools/generate-dark-mode-css.py` (re-run before packaging: 299 rules from 572 colour classes) plus a hand-written `dark-theme.css`.
  - The CV document and road-sign tiles stay light on purpose.
- **Files:** `src/lib/theme.js`, `src/components/ThemeToggle.jsx`, `src/styles/dark-mode.css`, `src/styles/dark-theme.css`, `tools/generate-dark-mode-css.py` (new); `src/index.css`, `Header.jsx`, `MobileNav.jsx`, `src/app/AppShell.jsx`.
- **Verified:** Dark screenshots of Learn, the money lesson, the journey passport and the export buttons; auto mode tested with emulated `prefers-color-scheme: dark`.

### W8 — Report/export format: Word at minimum, Excel preferred · CLOSED
- **What changed:** Two downloads, each with **Excel and Word** buttons:
  1. **Journey progress report**, from the journey passport.
     - Excel has 3 sheets: Summary (stages, steps, items, %), Steps (status, priority, items) and Checklist (every item, guide or personal, done or not). It has frozen headers, filters and print titles, and the sheets are right-to-left in Arabic.
     - Word has a summary table, then one table per stage with step, status and the full checklist (☑/☐).
  2. **Survival English cheat sheet**, next to the existing Print button. Columns: English, Arabic pronunciation, meaning, reply, level, mastered.
  - Both use the same maths as the screen.
  - No new npm dependency (the lockfile cannot change offline):
    - Excel uses a new dependency-free writer (`xlsx.js` + `zip.js`). Every text cell is a shared string, so text that starts with "=" can never run as a formula.
    - Word uses the `docx` package the CV builder already ships. It is loaded only when the user clicks.
  - Arabic Word reports use RTL paragraphs and tables, with Latin codes (N-400, DS-260) kept in order.
- **Files:**
  - New: `src/lib/export/zip.js`, `xlsx.js`, `docxReport.js`, `download.js`, `src/components/ExportButtons.jsx`, `src/features/roadmap/v3/lib/journeyExport.js`, `src/features/survival/survivalExport.js`.
  - Changed: `JourneyPassport.jsx`, `src/pages/Roadmap.jsx`, `src/pages/SurvivalEnglish.jsx`, and `features/roadmap/v2/lib/journeyUtils.js` (an import now ends in `.js` so Node tests can load it; there is no behaviour change).
- **Verified:**
  - `src/lib/tests/exportFormats.test.mjs` (7 tests: CRC32, ZIP structure, RTL sheet view, frozen pane, filter, no formulas, Word run direction).
  - `src/features/roadmap/v3/tests/journeyExport.test.mjs` (3 tests: report totals equal the on-screen stats).
  - Real files were generated from the seed content in ar/en/es, opened with openpyxl and python-docx, converted to PDF with LibreOffice and checked visually.

### W9 — Learn America images felt like a driving test only · CLOSED
- **What changed:**
  - Eight topic illustrations (inline SVG): life, mixed quiz, money, measurements, signs, stores, services, education.
  - They are used in the topic tabs, the hero collage and each topic's banner.
  - The hero stats lead with daily-life guides.
  - The mixed quiz takes questions from every category in turn, so road signs no longer dominate.
- **Files:** `src/features/learn/components/LearnModuleArt.jsx` (new), `src/pages/LearnAmerica.jsx`, `MixedQuizHub.jsx`, `QuickQuiz.jsx`, `src/features/learn/lib/quizSelection.js` (new).
- **Verified:** Screenshots of every topic; `quizSelection.test.mjs`. In a 10-question mixed quiz from the real bank (13 of 29 questions are signs), at most 4 are signs.

### W10 — Currency images hot-linked from usmint.gov / uscurrency.gov (blocked outside the U.S.) · CLOSED (one admin action after deploy)
- **What changed:**
  - Official currency photos are now **stored on AnswerForU** in a `learn_currency_media` table, created on demand for both SQLite and MySQL.
  - Admin → Learn content → Currency shows a status grid with two actions:
    - "Save missing photos" downloads only from usmint.gov or uscurrency.gov: HTTPS only, the redirect target is re-checked, 8 MB cap, MIME detection.
    - Per-side upload, for a photo whose official page has changed (the 50¢ coin, for example).
  - `/content/learn` serves the hosted copy (`front_local`/`back_local`), and quiz pictures of currency point to it too.
  - The page tries the hosted copy first. A remote official image gets 7 seconds, then a clear "image unavailable" card with the official link appears, instead of an empty box.
  - Project policies respected:
    - No fake or generated currency images: only official photos, downloaded or uploaded by the admin.
    - No public visitor ever triggers a database write: sync and upload are admin-only routes.
- **Files:** `public/api/currency-media.php` (new), `public/api/index.php` (admin routes `GET /admin/learn/currency-photos`, `POST …/sync`, `POST …/upload`, inside `require_admin`; hosted-URL mapping in `/content/learn`), `src/features/admin/learn/CurrencyMediaAdmin.jsx` (new), `LearnContentAdmin.jsx`, `MoneyLesson.jsx`.
- **Verified:**
  - Chromium with every external request blocked (simulates outside the U.S.): the fallback card appears and the hosted copies load.
  - `php -l`; gate `qa-stage4-profile-money.py` 17/17.
  - The remote-photo eager loading was written so the stage-4 check is unchanged.
- **Action required:** after deploy, open Admin → Learn → Currency and press "Save missing photos". If the official half-dollar URL is dead, upload that photo once with the per-side upload.

### W11 — Sign photos had no padding · CLOSED
- **What changed:** Every sign, photo or drawing, sits on the same padded white tile with a light frame. In dark mode the tile stays light.
- **Files:** `src/features/learn/components/SignFigure.jsx` (rewritten), `RoadSignsLesson.jsx`.
- **Verified:** All 52 signs captured and reviewed.

### W12 — From one point in the content onward there were no images · CLOSED
- **What changed:**
  - 30 of the 52 road signs have no photo in the content (from "NO RIGHT TURN" onward).
  - They are now drawn from their own data: shape, colour and legend. Shapes covered: diamond, rectangle, octagon, triangle, circle, school pentagon and railroad crossbuck.
  - A «رسم مرجعي» chip marks drawings.
  - A photo that fails to load falls back to the drawing.
- **Files:** `SignFigure.jsx` (`RoadSignGraphic`), `RoadSignsLesson.jsx`.
- **Verified:** All 52 checked one by one. Fixed during review: SPEED LIMIT text overflow, DO NOT ENTER bar overlap, WRONG WAY / ONE WAY orientation, the railroad R overlapping the X, and the school sign being drawn as a diamond.

### W13 — Mixed English/Arabic text flips direction · CLOSED
- **What changed:**
  - English runs inside Arabic text are isolated (`<bdi dir="ltr">`). This covers N-400, I-94, "W-2/1099", "$100 bill", "4 Quarters = $1", and now also currency amounts such as "$2", which used to show as "2$".
  - Applied to: learn lessons, quiz, journey checklist and guidance, citizenship stages, money lesson.
  - Text that users write (posts, comments, chat bubbles, reviews) now uses `dir="auto"`, so each message takes its own direction.
- **Files:**
  - New: `src/lib/bidi.js`, `src/components/BidiText.jsx`.
  - Changed: learn lessons (`MoneyLesson`, `RoadSignsLesson`, `LifeGuidesLesson`, `StoresLesson`, `ServicesLesson`, `EducationLesson`, `MeasurementsLesson`, `QuickQuiz`), `JourneyChecklist.jsx`, `StateGuidancePanel.jsx`, `Citizenship.jsx`, `FeedPostCard.jsx`, `FeedCommentNode.jsx`, `components/profile/PostCard.jsx`, `components/chat/MessagesView.jsx`, `components/chat/ChatDock.jsx`, `components/itemDetails/ItemReviewsSection.jsx`, `features/profile/parts/profileTabs.jsx`.
- **Verified:** `src/lib/tests/bidi.test.mjs` (6 tests, including the currency case); before/after screenshots ("bill $100", "Quarters = $1 4").

### W14 — Quiz loops and never shows the result · CLOSED
- **What changed:**
  - Root cause: the quiz was reset every time the page re-rendered. Saving a finished attempt re-renders the page, so the reset happened exactly when the result should have appeared.
  - The quiz now keeps one state per content signature and goes through three phases (intro → question → result). The result is saved and stays on screen.
  - The citizenship flashcard deck now ends on a summary screen instead of starting over.
- **Files:** `QuickQuiz.jsx`, `quizSelection.js` (new), `MixedQuizHub.jsx`, `MoneyLesson.jsx` (memoised quiz bank), `CitizenshipTrainer.jsx` (`deckDone`, `restartDeck`).
- **Verified:** Reproduced in Chromium on the original code (result never visible), then fixed (result visible and saved); `quizSelection.test.mjs`.

### W15 — Citizenship path: date calendar + age from it; separate 5-year and marriage routes; state of residence · CLOSED
- **What changed:**
  - The eligibility calculator was rewritten with two route cards: 5-year and marriage.
  - Date of birth is a calendar, and the age is calculated from it (a red badge appears when under 18).
  - Every date is a calendar.
  - A state-of-residence picker shows the date the 3 months in that state are complete.
  - Result dates are shown in readable form («1 فبراير 2027»).
  - The Citizenship page passes the chosen state to the calculator.
- **Files:** `EligibilityCalculator.jsx` (rewritten), `Citizenship.jsx`, `src/lib/dates.js`.
- **Verified:** Screenshots: age 36; age 15 "under 18"; VA chosen with «فرج»; 3-month date «1 فبراير 2027».

### W16 — 12-character password too strict · CLOSED (owner decision applied)
- **What changed:**
  - Minimum **8** characters, a **show/hide** button and a **strength meter**, applied to: registration, login form, profile password change, admin reset, and the e-mail reset link page (that page used a 6-character rule before).
  - The PHP API enforces the same rule through `afu_password_policy_violation()` for registration, reset link and admin reset.
  - **Added on top of the decision:** passwords that are very common, or that equal the user's own name or e-mail name, are refused with a clear message. The ~60-entry list is the same in JS and PHP. Remove it in `passwordPolicy.js` + `password-change.php` if you do not want it.
- **Files:**
  - New: `src/lib/passwordPolicy.js`, `src/components/form/PasswordStrength.jsx`, `tools/test-v642-password-policy.php`.
  - Changed: `src/components/AuthView.jsx`, `ProfileBodyModals.jsx`, `useAdminUserActions.js`, `ResetPasswordModal.jsx`, `public/api/password-change.php`, `public/api/index.php`, `public/account-password-reset.js` + its `source-original/public` copy.
- **Verified:** `passwordPolicy.test.mjs` (4 tests, which also check that the PHP list matches and that `index.php` calls the policy 3 times); `tools/test-v642-password-policy.php`; gates `qa-stage13-launch-fixes.py` 21/21, `qa-v640-release.py` 23/23, `test-round15-password.php`.

### W17 — The site did not open from Egypt at first · CODE SIDE CLOSED · HOSTING SIDE = ACTION REQUIRED
- **Code side (done):**
  - The web font no longer blocks the first paint (`media="print"` switched on by the boot script, with a `<noscript>` fallback), so a slow or blocked fonts.googleapis.com cannot hold the page blank.
  - Currency pictures are no longer hot-linked from usmint.gov (W10).
- **Files:** `source-original/index.html`, `public/afu-theme-boot.js`.
- **Hosting side — cannot be fixed in source; please check on Bluehost and DNS:**
  1. Bluehost / Imunify360 / ModSecurity: look for country or IP blocks and for rate rules hit by Egyptian IP ranges.
  2. Any CDN/WAF in front of the site (Cloudflare, Bluehost CDN): look for country rules and "Under attack" challenges.
  3. DNS and SSL: confirm the A/AAAA records and the certificate are fully propagated.
  4. Test from Egypt with check-host.net (HTTP + ping, Egyptian nodes) or a VPN exit in Egypt.
  5. HSTS `includeSubDomains`: v6.4.0 left it as it was. Confirm every subdomain serves valid HTTPS, or browsers will refuse them.
- `.htaccess` was not changed in this release.

---

# Mobile app 3.7.1 (versionCode 20) — one entry per tester item

Every changed screen keeps its route; there are still 26 screens and 25 routes.
No new dependency, plugin or permission. Light mode looks the same as before, except:
- the Learn stats (W9/M9);
- the sign art, which now uses real sign colours.

### M1 — Every date field is a calendar picker · CLOSED
- **What changed:**
  - New pure React Native pickers (no native date dependency, the same on Android and iOS):
    - `DateField`: month grid, year and month quick-select, min/max limits, Arabic RTL.
    - `MonthYearField`: résumé dates with "Present".
  - They replace the typed `YYYY-MM-DD` fields:
    - Citizenship: resident-since, date of birth, marriage, spouse citizenship, state residence, N-400 filing date.
    - CV: start/end, graduation year, course date.
  - Date logic (`src/logic/dates.mjs`) is the same as the website's. Month names are built in, so the picker does not depend on Hermes Intl data.
- **Files:**
  - New: `src/components/FormPickers.js`, `src/logic/dates.mjs`.
  - Changed: `src/screens/CitizenshipScreen.js`, `src/screens/CVScreen.js`.
- **Verified:** `mobileRound8` test 1 (at least 6 DateFields, no YYYY placeholders, age maths, display dates in 3 languages); rendered calendar (Arabic, dark) with Sunday on the right.

### M2 — Speech rate shown only in English → all languages · CLOSED
- **What changed:**
  - One labelled speed control (`VoiceSpeed`): «عادي / أبطأ / بطيء جدًا» · Normal / Slower / Very slow · Normal / Más lento / Muy lento.
  - It is shared live by every screen through `subscribeSpeed`.
  - Survival English now uses it instead of three unlabelled "1×" buttons.
  - Speech buttons now use the saved speed. Before, they forced 1×, so the setting had no effect on citizenship questions.
- **Files:** `src/services/voice.js`, `src/components/VoiceSpeed.js`, `src/components/SpeechButton.js`, `src/screens/SurvivalEnglishScreen.js`, `src/screens/CitizenshipScreen.js`.
- **Verified:** `mobileRound8` test 2; rendered labels in Arabic.

### M3 — TTS read only the first answer, and stopped at "/" · CLOSED
- **What changed:**
  - The citizenship answer button spoke `ans[0]` only. It now speaks **every accepted answer**, joined with "or" («اسمع كل الإجابات»).
  - All speech goes through `speechText.mjs`, the same rules as the website: "/" → "or", links and emoji removed, chunks of up to 180 characters played one after another.
  - The Survival "play all" queue is normalised too.
- **Files:** `src/logic/speechText.mjs` (new), `src/services/voice.js`, `SpeechButton.js`, `CitizenshipScreen.js`.
- **Verified:** `mobileRound8` test 2 ("the Constitution or the Bill of Rights", "Sunday or Saturday, W-2 or 1099, 24/7").

### M4 — State code field → searchable list of names · CLOSED
- **What changed:**
  - New `StatePicker`: a bottom sheet with search by Arabic, English or Spanish name or code (the same list as the website, `src/logic/usStates.mjs`).
  - It replaces the free-text state fields in: Citizenship trainer ("your state" for governor/senator answers), calculator (state of residence), Community add-form (was a 2-letter text box), Community filter (with "All states"), CV target state.
- **Files:** `src/components/FormPickers.js`, `src/logic/usStates.mjs` (new), `CitizenshipScreen.js`, `CommunityScreen.js`, `CVScreen.js`.
- **Verified:** `mobileRound8` test 3; rendered picker («فيرجينيا (VA)»).

### M5 — Duplicated content in the step («دليل الخطوة» / «الإجراءات المطلوبة» / «التحذيرات») · CLOSED
- **What changed:**
  - Before, the open step stacked seven published datasets one after another:
    - In Arabic, «دليل الخطوة» and «شرح إضافي» printed the same guide twice.
    - Warnings appeared twice («تحذيرات» + «تحذيرات إضافية»).
    - The actions repeated the checklist.
    - In English and Spanish, the Arabic original appeared as "Detailed guidance".
  - Now each fact appears once, in the user's language:
    - **«دليل الخطوة»**: short broad points (at most 4, or 6 without a checklist).
    - **«الإجراءات المطلوبة»**: the interactive checklist.
    - **«التحذيرات»**: merged and de-duplicated, at most 3.
    - **«الشرح الإضافي — كل التفاصيل»**: collapsed; full text, cost, preparation time and video note.
- **Files:** `src/logic/stepGuide.mjs`, `src/logic/contentDedupe.mjs` (new; the same algorithm as the website), `src/components/RoadmapDeepDetails.js` (rewritten), `src/screens/JourneyScreen.js`.
- **Verified:**
  - `mobileRound8` test 4 (fixture: repeated warning shown once, near-duplicate action dropped, no Arabic in English).
  - The existing test "seven independent datasets" still passes.
  - Rendered step "ابنِ مركز المستندات قبل السفر", Arabic light and dark.

### M6 — RTL: numbers under «الإجراءات المطلوبة» / «التحذيرات», and Arabic RTL app-wide · CLOSED
- **What changed:**
  - RTL now applies from the app root: `direction: rtl` for Arabic on the whole tree, including header, body, nav, sign-in and the first-run tour.
  - Before, Journey, listing details and the directory never got RTL, because they do not use `<Screen>`. That is why rows and numbers sat on the wrong side.
  - Numbered rows use a round `NumBadge` (digits only) instead of "1.", which Arabic shows as ".1".
  - "1. نفّذ دول" / "2. قارن" headings became icon headings.
  - **On `I18nManager.forceRTL` (the tester's suggestion):** it only takes effect after a full app restart, and it applies globally. The app switches between Arabic, English and Spanish live, and it keeps several deliberately LTR elements: the language switch, the airmail stripes and the chip scroller that avoids Android's RTL clipping. Root-level `direction` gives the same mirroring immediately, with no restart and no double flip. This is a design choice, not a gap.
- **Files:** `App.js`, `src/components/UI.js` (`NumBadge`), `src/components/ServerContent.js`, `JourneyScreen.js`, `CitizenshipScreen.js` (step heading).
- **Verified:** `mobileRound8` tests 4 and 5; rendered Journey in Arabic (badges and rows on the right).

### M7 — Dark mode, manual and automatic · CLOSED (one device check, see Action required)
- **What changed:**
  - Appearance can be **Light / Dark / Automatic** (follows the phone). It is chosen in All sections and in Profile, and saved (`afu_theme`).
  - `app.json` now has `userInterfaceStyle: "automatic"`. The status bar follows the appearance.
  - The theme now holds a dark palette with the same token names, plus role tokens. A colour that was both text and surface (navy, white, royal, green, red) can now split. Light values are unchanged.
  - Every module StyleSheet is built per appearance through `themed()`. A codemod moved colour tokens to their roles: 167 + 74 uses.
  - Text on gold stays navy (`onGold`). Road-sign faces keep their real colours.
  - The switch re-renders without remounting, so forms and scroll positions are kept.
  - Contrast in dark: ink 15.8:1, muted 7.7:1, placeholder 6.7:1, input border 3.9:1, white on royal buttons 4.8:1.
- **Files:**
  - New: `src/components/AppearanceControl.js`.
  - Changed: `src/theme.js` (dark palette, roles, `setColorScheme`, `resolveScheme`, `themed`, `signPalette`), `App.js`, `src/auth/storage.js` (`getThemePref`/`setThemePref`), `app.json`, `AllSectionsScreen.js`, `ProfileScreen.js`, and colour-role updates in the screen and component files listed below.
- **Verified:**
  - `mobileRound8` test 6: dark contrast; light palette byte-identical after a round trip; no plain StyleSheets; no navy or white text tokens left.
  - All existing palette and contrast tests pass.
  - Rendered Journey, Learn quiz, All sections and the calendar in dark.

### M8 — Report/export: Word at minimum, Excel preferred · CLOSED
- **What changed:**
  - The **journey report** has Excel and Word buttons in the Journey hero (signed-in users), with the same sheets and sections as the website report.
  - The **Survival English sheet** has Excel and Word buttons for the chosen situation.
  - The files are written by a dependency-free xlsx writer and a small .docx writer (RTL paragraphs, RTL runs, RTL tables in Arabic). They are saved to the app cache and handed to the system share sheet (`expo-sharing`, already a dependency).
- **Files:**
  - New: `src/logic/export/zip.mjs`, `xlsx.mjs`, `docx.mjs`, `src/logic/journeyReport.mjs`, `src/logic/survivalSheet.mjs`, `src/services/reportShare.js`, `src/components/ReportButtons.js`.
  - Changed: `JourneyScreen.js`, `SurvivalEnglishScreen.js`.
- **Verified:**
  - `mobileRound8` test 7: ZIP CRC of every part, required OOXML parts, `bidiVisual`, "N-400" kept as one LTR run.
  - Files generated from the seed content were opened with openpyxl and python-docx, converted with LibreOffice and checked visually.
  - The share sheet itself needs a device (see Action required).

### M9 — Learn images reflect each section · CLOSED
- **What changed:**
  - Each topic opens with a banner of three pictures of what it really covers (home, card and phone for daily life; coins, card and cart for money, and so on), plus a one-line description.
  - The hero stats lead with daily-life guides.
  - The quiz draws from every category in turn.
- **Files:** `src/screens/LearnScreen.js`, `src/logic/quizSelection.mjs` (new).
- **Verified:** `mobileRound8` test 8 (at most 4 of 10 questions are signs); rendered.

### M10 — Currency images (hosted, not hot-linked) · CLOSED (relies on the W10 admin sync)
- **What changed:**
  - The app already prefers the API's `*_local` URL. After the website admin sync, that URL is the AnswerForU-hosted copy.
  - An official image that hangs or fails, such as usmint.gov outside the U.S., switches after 8 seconds to a clear "photo not available — open the official page" card, instead of an empty box.
- **Files:** `LearnScreen.js`.
- **Verified:** `mobileRound8` test 8; rendered with external images blocked.

### M11 — Sign photos had no padding · CLOSED
- **What changed:** Every sign sits on the same padded white tile (16 px) with a frame, in light and dark.
- **Files:** `src/components/SignTile.js` (new), `LearnScreen.js`.
- **Verified:** Rendered 52 signs.

### M12 — From one point onward no images · CLOSED
- **What changed:**
  - The 30 signs without a photo are drawn from their shape, colour and legend: diamond, rectangle, octagon, triangle, circle.
  - A failed photo falls back to the drawing.
  - Drawings are labelled «رسم توضيحي للإشارة».
- **Files:** `SignTile.js` (`SignGraphic`), `LearnScreen.js`; `src/components/Airmail.js` (the sign art keeps real sign colours).
- **Verified:** Rendered: STOP, YIELD, SPEED LIMIT 35, ONE WAY, NO RIGHT TURN, KEEP RIGHT, DO NOT PASS…

### M13 — Mixed English/Arabic text flips · CLOSED
- **What changed:**
  - Every Arabic `<Txt>` gets an RLM first and each Latin run isolated (LRI…PDI). The isolated runs include N-400, SSN, "$100 bill" and "$2".
  - Android has no `writingDirection`, so before this a sentence that started with an English word was laid out left-to-right.
  - The marks are invisible. Speech and exports strip them.
- **Files:** `src/logic/bidi.mjs` (new), `src/components/UI.js` (`Txt`).
- **Verified:** `mobileRound8` test 5; rendered quiz review («Home Depot غاليًا بتروحله عشان إيه؟», «ورقة $2»).

### M14 — Quiz loops and never shows the result · CLOSED
- **What changed:**
  - The last answer used to reset the quiz to question 1 with the score set to 0, and the same 15 questions came back every time.
  - The quiz now ends on **«نتيجتك»**: percent, x/10, a message, and the correct answers for the ones missed. Buttons: "new quiz with different questions" and "review the lessons".
- **Files:** `LearnScreen.js`, `src/logic/quizSelection.mjs`.
- **Verified:** `mobileRound8` test 8; rendered after answering all 10 questions.

### M15 — Citizenship path: date + age, separate 5-year / marriage routes, state of residence · CLOSED
- **What changed:**
  - **Two separate route cards** (5-year / marriage 3-year) replace the single toggle.
  - **Date of birth** → automatic age badge (red when under 18). The age field was removed.
  - **State of residence** picker. The label reads "Living in Virginia since", and the screen shows the date the 3 months are complete.
  - Results are shown as readable dates. The trainer and calculator share the chosen state.
- **Files:** `CitizenshipScreen.js`, `src/logic/dates.mjs`, `FormPickers.js`.
- **Verified:** `mobileRound8` test 1; rendered calculator and date sheet.

### M16 — 12-character password too strict · CLOSED (owner decision applied)
- **What changed:**
  - Sign-up and profile password change use the 8-character policy, with a **show/hide** eye button and a **strength meter**.
  - Common and personal passwords are refused, with the same list as the website and the API.
  - Login fields also got show/hide.
- **Files:** `src/components/PasswordInput.js`, `src/logic/passwordPolicy.mjs` (new), `src/screens/AuthScreen.js`, `src/screens/ProfileScreen.js`.
- **Verified:** `mobileRound8` test 9 (the common list is byte-identical to the website's); rendered sign-up.
- **Note:** the server must run website v6.4.2. A v6.4.1 server still rejects passwords shorter than 12 characters.

### M17 — Access from Egypt · HOSTING SIDE = ACTION REQUIRED (same as W17)
- The app talks only to `https://answerforu.com`. With W10 and M10, it no longer depends on usmint.gov or uscurrency.gov for pictures once the photos are synced.
- Everything else is the hosting checklist in W17.

### Release markers (mobile)
- `app.json` 3.7.1 / versionCode 20.
- `package.json` + `package-lock.json` (root entry only) 3.7.1.
- `src/config.js` `APP_VERSION` 3.7.1.
- `webMasterVersion` / `WEB_MASTER_VERSION` 6.4.2, because the app's 8-character password rule needs the 6.4.2 API.
- `WEB_CONTENT_VERSION` (offline cache key) is unchanged.

---

# Action required / not fully closed — with the reason

1. **Hosting checks for item 17** (W17/M17). These are server, CDN and DNS settings and cannot be changed in source code; the checklist is in W17.
2. **Run "Save missing photos" once after deploy** (W10). The photos are downloaded only by an admin action, because public visitors must never trigger a database write. If the official half-dollar page is dead, upload that one photo manually.
3. **Mobile was not built or run on a device here.**
   - There is no network for `npm ci`/EAS, and no Android emulator.
   - What was checked: 97/97 Node tests; every file parsed; the changed screens bundled with esbuild and rendered in Chromium through a React Native DOM shim, in Arabic light and dark.
   - Please run `npm ci && npx expo-doctor && npm run build:preview`, then check on a phone:
     - RTL on Journey, Learn and Citizenship;
     - Light / Dark / Automatic;
     - the date, month and state sheets;
     - the Excel/Word share sheet (`File.write(Uint8Array)` from expo-file-system 58);
     - speech at all three speeds.
4. **Automatic dark mode on Android.** The app reads the phone setting with `useColorScheme()` and sets `userInterfaceStyle: "automatic"`. Expo's documentation also requires the `expo-system-ui` package on Android for that setting to take effect. That package cannot be added offline without breaking `npm ci`, because the lockfile would be out of sync. If Automatic stays light on Android, run `npx expo install expo-system-ui` before the build. Manual Dark works without it.
5. **Superseded deploy overlays in the mobile repo.** `mobile-repo/WEBSITE-DEPLOY/` and `mobile-repo/web-master/` hold old website `index.php` files (v6.3.7 / v6.1.52). Website v6.4.2 already contains their changes. A warning was added at the top of both READMEs: **do not deploy them**, or they will undo the v6.4.2 fixes.
6. **Common-password list (W16/M16)** was added on top of the owner's decision. It is easy to remove if you do not want it (see W16).

# Gates and tests changed (each one on purpose)

**Website**
- `tools/qa-final-service-journey.py`, `qa-round39-open-issues.py`, `qa-round30-roadmap-source.py`, `qa-round40-final-source.py`: they pinned the old duplicated step layout (W5). They now check the new structure.
- `tools/qa-stage13-launch-fixes.py`, `qa-v640-release.py` (admin-reset check), `test-round15-password.php` (label only): 8-character policy (W16).
- `tools/qa-v640-release.py`: version check 6.4.1 → 6.4.2.
- `tools/qa-v633-owner-requests.py` check 12: the glossary now speaks through the shared engine. The check verifies the same requirement there: same storage key, rate applied.
- `tools/build-production.py`: runs the two new gates `tools/qa-v642-tester-fixes.py` (17/17) and `tools/test-v642-password-policy.php`.
- New unit tests: `speech`, `bidi`, `passwordPolicy`, `quizSelection`, `exportFormats`, `journeyExport`.

**Mobile**
- Version pins 3.7.0/19/6.3.9 → 3.7.1/20/6.4.2 in `tests/mobileRound1, 3, 4, 5, 6`.
- `tests/mobileRound4`: the "seven datasets" test also reads `src/logic/stepGuide.mjs`, where the keys now live.
- `tests/mobileRound5` + `mobileRound7` render harnesses: the theme mock exposes `themed()`, and pure `src/logic/*.mjs` imports are loaded.
- `tests/mobileRound6`: re-pinned the two hash-pinned files changed on purpose, `src/services/voice.js` (M2/M3) and `src/auth/storage.js` (M7). All other pinned content, logic and API files are byte-identical.
- New: `tests/mobileRound8.test.mjs` (10 tests, one or more per tester item).

# Changed files

**Website — new (39, including this file):** `public/afu-theme-boot.js`, `public/api/currency-media.php`, `source-original/public/afu-theme-boot.js`,
`src/components/{BidiText,ExportButtons,SpeechRateControl,ThemeToggle}.jsx`, `src/components/form/{DateField,MonthYearField,PasswordStrength,StatePicker}.jsx`,
`src/features/admin/learn/CurrencyMediaAdmin.jsx`, `src/features/learn/components/LearnModuleArt.jsx`, `src/features/learn/lib/quizSelection.js`,
`src/features/learn/tests/quizSelection.test.mjs`, `src/features/roadmap/v3/lib/journeyExport.js`, `src/features/roadmap/v3/tests/journeyExport.test.mjs`,
`src/features/survival/survivalExport.js`, `src/lib/{bidi,contentDedupe,dates,passwordPolicy,speech,theme,useSpeechRate}.js`,
`src/lib/export/{docxReport,download,xlsx,zip}.js`, `src/lib/tests/{bidi,exportFormats,passwordPolicy,speech}.test.mjs`,
`src/styles/{dark-mode,dark-theme}.css`, `tools/generate-dark-mode-css.py`, `tools/qa-v642-tester-fixes.py`, `tools/test-v642-password-policy.php`, `CHANGELOG.md`.

**Website — changed (65):** `MAKE-PRODUCTION.bat`, `VERSION.txt`, `public/api/release.txt`, `public/api/index.php`, `public/api/password-change.php`,
`public/account-password-reset.js` (+ `source-original/public/` copy), `source-original/index.html`, and in `source-original/src/`:
`app/AppShell.jsx`, `components/{AuthView,Header,MobileNav}.jsx`, `components/chat/{ChatDock,MessagesView}.jsx`, `components/cvbuilder/StepInput.jsx`,
`components/itemDetails/ItemReviewsSection.jsx`, `components/profile/PostCard.jsx`, `features/admin/hooks/useAdminUserActions.js`,
`features/admin/learn/LearnContentAdmin.jsx`, `features/admin/modals/ResetPasswordModal.jsx`, `features/admin/resources/{ResourceFormModal,StateResourcesAdmin}.jsx`,
`features/citizenship/{CitizenshipEnglish,CitizenshipTrainer,EligibilityCalculator}.jsx`, `features/community/components/CommunityFilters.jsx`,
`features/feed/components/{FeedCommentNode,FeedHeader,FeedPostCard}.jsx`,
`features/learn/components/{EducationLesson,LifeGuidesLesson,MeasurementsLesson,MixedQuizHub,MoneyLesson,QuickQuiz,RoadSignsLesson,ServicesLesson,SignFigure,StoresLesson}.jsx`,
`features/marketplace/form/usStates.js`, `features/profile/body/components/ProfileBodyModals.jsx`, `features/profile/parts/profileTabs.jsx`,
`features/roadmap/v2/components/{JourneyChecklist,JourneyOnboarding}.jsx`, `features/roadmap/v2/lib/journeyUtils.js`,
`features/roadmap/v3/components/{JourneyPassport,JourneyTaskWorkspace,StateGuidancePanel}.jsx`, `features/survival/survivalSpeech.js`, `index.css`,
`pages/{AdminRideOffer,Citizenship,JargonBuster,LearnAmerica,Roadmap,SurvivalEnglish}.jsx`; and in `tools/`: `build-production.py`,
`qa-final-service-journey.py`, `qa-round30-roadmap-source.py`, `qa-round39-open-issues.py`, `qa-round40-final-source.py`, `qa-stage13-launch-fixes.py`,
`qa-v633-owner-requests.py`, `qa-v640-release.py`, `test-round15-password.php`.

**Mobile — new (21, including this file):** `src/components/{AppearanceControl,FormPickers,PasswordInput,ReportButtons,SignTile}.js`,
`src/logic/{bidi,contentDedupe,dates,journeyReport,passwordPolicy,quizSelection,speechText,stepGuide,survivalSheet,usStates}.mjs`,
`src/logic/export/{docx,xlsx,zip}.mjs`, `src/services/reportShare.js`, `tests/mobileRound8.test.mjs`, `CHANGELOG.md`.

**Mobile — changed (48):** `App.js`, `app.json`, `package.json`, `package-lock.json` (version only), `src/config.js`, `src/theme.js`,
`src/auth/storage.js`, `src/services/voice.js`, `src/components/{Airmail,AppHeader,BottomNav,ListingCard,ResourceCards,RoadmapDeepDetails,ServerContent,SpeechButton,UI,VoiceSpeed,WelcomeTour}.js`,
`src/screens/{AdminManage,Admin,AllSections,Auth,CV,Citizenship,Community,Glossary,Home,Journey,Learn,ListingDetail,Messages,MyRequests,OfflinePacks,Profile,PublishedLibrary,Recommend,SurvivalEnglish,Thread,Verification}Screen.js`,
`tests/mobileRound{1,3,4,5,6,7}.test.mjs`, `WEBSITE-DEPLOY/README.md` and `web-master/APP-ROUND3-DEPLOYMENT.md` (warning line only).
