# AnswerForU Mobile v3.7.0 · versionCode 18 — "جواب" Airmail identity (reskin)

**Base:** `AnswerForU-Mobile-v3.7.0-COMPLETE-SOURCE` (versionCode 16), the only base available.
**Output:** the same app with a new look. Same code paths, routes, API calls and content. Only the presentation changed.
**IDs:** `com.answerforu.app`, versionName `3.7.0`, versionCode `18`. The app icon is unchanged, as instructed.

## Identity
- **Palette (`src/theme.js`):** royal blue `#0B4FC4`, cream page `#F8EFDC`, paper cards `#FFFCF5`, airmail red `#E2363C`, navy ink `#0E1A3A`, gold `#F6B92B`. The old token names (`teal`, `mist`, `sea`, …) are kept but now point to the new colors, so all 26 screens changed from one place.
- **Airmail kit (`src/components/Airmail.js`, new, re-exported from `UI.js`):**
  - diagonal red/blue stripe
  - envelope frame with the airmail border on all four sides
  - perforated stamp tile
  - postmark
  - simplified brand mark (drawn, no image file)
  - wordmark
  - three-language switch
  - Feather outline icons through `@expo/vector-icons`, with a plain-glyph fallback
  - road-sign art, route art, trust icons
- **Shared UI (`UI.js`):**
  - Buttons: navy, royal and gold with a pressed lower edge, plus a cream outline style.
  - Cards: paper.
  - Fields: cream.
  - Empty state: a dashed letter box with the airmail edge and a fan of stamps.
  - Hero variants: `cream`, `envelope`, `blue` (perforated panel with the route and pin) and `certificate` (gold rule and ribbon medal).
- **Fonts:** system font at heavy weights, because no TTF files were supplied.

## Screen by screen
| Screen | What changed |
|---|---|
| Header (every main screen) | Airmail stripe, then a navy bar with **العربية · English · Español** always visible. Below it a cream bar with the mark, wordmark and gold **دخول** (guest), or a bell plus **حسابي** (member). |
| Bottom bar | The same 5 tabs as a floating cream bar. The active tab is a navy tile with a gold icon. The last tab is now labelled "كل الأقسام". |
| Splash + first-run tour | Cream splash with stripes. The tour has the envelope art, stamp, postmark, `01 / 03`, and the language switch. Still 3 skippable slides. |
| Home (mockups 01–03) | Envelope hero: "أمريكا أسهل لما تعرف تعمل إيه بعد كده", **ابدأ من رحلتي** / **اختبر نفسي**, and "اختار هدفك دلوقتي" (4 goals). Then search (kept), the blue perforated **رحلتي** stamp with the 1-2-3 route, the cream **اتعلم أمريكا** stamp with STOP / 35 / YIELD, "كل اللي تحتاجه" with all 6 remaining links, and the navy trust band. All 8 original links are kept. |
| All sections (04) | 30 numbered stamp tiles (01…), with item 01 in navy. Same 29 entries plus admin. Website pages carry an `answerforu.com` tag. The sign-in/sign-out card and version line are kept. |
| Journey (05) | Blue hero with chips: state, stage count, steps done, and how-it-works 01/02/03. The stage grid becomes a horizontal stamp stepper (each stage keeps its title, description and %), plus a progress bar. Steps carry an "مفتوحة تحت" pill. The open step card gets the airmail top edge and a gold **مهمة** pill. All checklist, status, custom-item and resource functions are unchanged. |
| Learn (06) | Cream hero with stat stamps computed from live data: paths, road signs, quiz questions. Pills for lessons, citizenship, Survival English, offline packs and glossary. Horizontal topic cards with counts and an "افتح القسم" / "مفتوح تحت" tag, then an "القسم المفتوح الآن" banner. Lesson cards have an image panel and a code tag. |
| Citizenship (07) | Certificate hero with the ribbon medal and quick pills, plus **العودة إلى الرحلة**. A guest notice offers sign-in to save. "ابدأ منين؟" has 3 cards. The 4 study areas are a panel with sub-lines. Steps are numbered navy circles in accordion rows. Calculator, trainer, voice and English practice are unchanged. |
| Marketplace (08) | Cream hero with **إضافة إعلان جديد** and **تحديث**. Section tabs have icons, with the active tab in navy. Filters sit in one card. The empty state uses the airmail box, stamps and an add button. Marketplace emptiness is expected and is not a defect. |
| CV builder (09) | A 3-step stepper (edit / preview / import) and a completeness ring (0–100, counted from filled fields). The target-job panel is light blue. Entries are cream, and "إضافة" pills replace the add buttons. Photo, camera, save, share, delete, import and the website PDF link are unchanged. |
| Sign in (10) | Language switch, then a blue panel with the envelope, then an airmail-framed form: back link, big "تسجيل الدخول", Google (outline), email/password, forgot, a royal submit button, and a cream footer with "سجل الآن" and browse-as-guest. |
| Other 16 screens | They inherit the new palette, cards, buttons, fields and empty state. Navy header cards (Messages, Verification, My requests, Admin, Resources, Offline packs, Recommend, Profile, Thread) get the airmail top edge. Saved and Notifications get the cream hero. Feed uses the blue hero. About 110 leftover slate, purple and teal colors were mapped to the palette. |

## Mockup items deliberately not copied
- **Website top menu and footer:** the app uses the bottom bar plus "كل الأقسام", and the policy links stay in that grid.
- **Floating up/down buttons and chat bubble:** not added.
- **Facebook sign-in:** the app has no Facebook flow, so no dead button was added.
- **"قريب مني":** this would need a location permission, so it was not added.
- **Fixed numbers from the mockups ("24 منشور", "51", "10"):** not hard-coded; the counts are computed from data.
- **Citizenship link:** kept out of the top header, as the project rule requires.

## Copy changes
These are the only visible labels that changed. No feature is behind them.
- Home hero and section titles now use the mockup wording.
- The bottom tab "الأقسام" is now "كل الأقسام".
- "＋" glyphs and emoji prefixes on buttons became icons.
- Citizenship hero title changed.
- Marketplace search placeholder changed.

## Tests and checks (all run on this exact package)
- `npm test`: **76 / 76 pass**. That is the 67 existing tests plus 9 new ones in `tests/mobileRound6.test.mjs`. 0 skipped.
- Changes to existing tests:
  - The `versionCode 16` assertions now expect `18`.
  - The render harness learned the new Airmail component names.
  - No assertion was removed.
- Syntax: 72 JS files parsed, 0 errors.
- References: no un-imported components, unknown color tokens or unknown icon names.
- Render smoke: all 29 screens and components, in AR, EN and ES, as guest and as member, with mocked API data and effects run. **174 renders, 0 runtime errors** (same result as the base).
- **Zero deletions:**
  - Files: 0 deleted, 37 modified, 2 added (see `SOURCE-DIFF-v3.7.0-vc18.md`).
  - Code: API calls 92 → 92, App routes 25 → 25, navigate targets 18 → 20, named handlers 45 → 45, state variables 139 → 139.
  - All of `src/data`, `src/logic`, `src/api`, `src/services` and `src/auth/storage.js` are byte-identical, with their hashes pinned in the test. That means civics 100+128, Survival 344/17 and glossary 407 come from the same untouched sources and API.
- **Not verified here:** an APK build and on-device pixels. This environment cannot install npm packages. Run `npm install` (or `npx expo install --fix` to align `@expo/vector-icons` with SDK 58), then `BUILD-PREVIEW-APK.bat`, and use `qa/CAPTURE-REAL-AR-EMULATOR.bat` for the screenshot gate.
