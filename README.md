# AnswerForU Mobile v3.7.0 · versionCode 18 — "جواب" Airmail identity round

**Latest round:** a presentation-only reskin of the v3.7.0 (versionCode 16) source with the approved Airmail identity: royal blue, cream, diagonal red/blue airmail stripes, navy and gold. The language switch (العربية / English / Español) is always visible. It is applicationId `com.answerforu.app`, versionName `3.7.0`, versionCode `18`. See `AIRMAIL-ROUND6-REPORT.md` and `SOURCE-DIFF-v3.7.0-vc18.md`. Run `npm test`: 76/76 pass.

---

# AnswerForU Mobile v3.7.0 — Design + UX round

Complete Expo React Native source based on the working v3.6.1 build. Android `versionCode: 16`, applicationId `com.answerforu.app`, website design reference v6.3.9. This is a **presentation-only redesign**; the account system, Google OAuth bridge and client IDs, API endpoint list, permissions, all existing routes, CV data, and interactive operations are unchanged.

## Screen-by-screen visible changes

| Screen | Visual and interaction improvements | Existing actions preserved |
|---|---|---|
| **Home** | Editorial navy/turquoise welcome hero, raised search module, two side-by-side starting actions, two-column sections catalog | Search, Journey/Marketplace and eight destination routes |
| **Journey** | Branded progress header, explicit stage count, two-column selectable stage cards and step workspace | Guest sign-in button, all stages/steps, checklist, resources, API progress |
| **Marketplace** | Editorial category hero and create-listing CTA, compact category pills, rebuilt photo/illustration-first cards | All six marketplace types, search and filters, add/review/save/contact/edit |
| **Citizenship** | Full-page hero, study-area introduction, larger selected-stage tiles | Nine stages, civics tests, English practice, eligibility, progress and audio |
| **Survival English** | Branded study header, progress label and pack-selection introduction | 344/17 server content, pack filter, play/stop, speed, quizzes, mastery |
| **Community/feed** | New title hierarchy and post-composer emphasis | Post/edit/delete, comments, likes, navigation |
| **CV** | Distinctive resume header and refined shared form/cards | Shared website CV fields, repeatable sections, image, share, export handoff, CRUD |
| **Profile** | Enhanced account hero with prominent verified avatar and consistent form styles | Account fields, image edit, password, saved, messages and delete request |
| **Auth** | Compact branded hero and centered form for sign-in/register/reset | Identical Google sign-in, email auth, forgot password, guest browse |
| **Learn / All sections** | Full-width study hero, readable two-column topic catalog, redesigned section directory | Quizzes, signs, currency, guide items, all routes and account actions |
| **Shared chrome** | Website-colored logo, clear account/language/notification controls, contained five-tab bottom navigation, consistent inputs and empty states | Existing active routes, AR/EN/ES and back handling |

## First-run clarity

`WelcomeTour.js` presents **three short, skippable slides** (Journey, Marketplace, Learn). It runs only once per installation via the existing secure storage adapter; `Skip`, `Previous` and `Next`/`Start exploring` are translated into Arabic, English and Spanish. It does not ask for permissions or create a new API call.

## Compatibility and unchanged dependencies

- Same `https://answerforu.com` API routes, token storage, OAuth flows and Google IDs. No permission or dependency was added. No ads or analytics SDK.
- Exact original `WEBSITE-DEPLOY` contents, static fixtures and backend bridge retained. Content is still API-first; only previously downloaded cache is used offline.
- The old cache schema version remains `6.3.7` deliberately: updating the website design reference must not invalidate saved offline learning data merely for a visual release. `app.json`/`config.js` reference website v6.3.9.
- All base screens, routes and files are retained. The original v3.6.1 guest-Journey `Btn` import remains.

## Verification

Run `npm test` and `npm run export:android` with Expo dependencies installed. In the source verification workspace: 67/67 Node tests passed, including 2 JSX function-execution tests with mock React Native host components; 69 JS/JSX/MJS files parsed with TypeScript, no errors. **These are not device/emulator rendering tests.**

**Release blocker:** The build container does not have Android SDK/emulator or installed native dependencies; real Arabic emulator screenshots and an installed APK test are outstanding. See `qa/screenshots/README.md` and `qa/CAPTURE-REAL-AR-EMULATOR.bat`. Do not present this build as visually accepted or production certified until the real screenshots and device QA pass.
