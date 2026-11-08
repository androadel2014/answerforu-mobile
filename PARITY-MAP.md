# APP-ROUND4 — parity map: AnswerForU website 6.3.7 ↔ mobile 3.6.0

**Legend:** ✅ API/source-level implemented, ⚠️ implemented but real-device/live QA pending, ◐ partial/native remainder, ↗ opens website official page, — intentionally excluded private service. This table inventories the website v6.3.7 `source-original/src/app/AppRoutes.jsx` route map and important child views; it does not equate source presence with a validated Android release.

| Website route and detail/action | Native destination | Status and notes |
|---|---|---|
| `/`, `/home` homepage, explore/search | Home | ✅ Same marketplace family; source-level, web search differences possible |
| `/marketplace`, `/community` umbrella, filters for places/groups/services/jobs/housing/products | Marketplace | ✅ All within one native umbrella, server `q` and state/city, photo-forward cards, save/contact |
| `/jobs`, `/housing` shortcuts | Marketplace `tab=jobs/housing` | ✅ filtered entry; no duplicate marketplace screen |
| `/marketplace/item/:id` detail gallery, rating, save, edit, delete and contact | Listing Detail | ⚠️ Gallery and key facts + sticky contact + review/save/owner operations; test each real user role |
| `/feed`, `/posts/:id` posts, likes, comments, owner controls | Feed, Post Detail | ⚠️ Existing native operations retained; moderation and media QA needed |
| `/roadmap`, `/journey` 13 stages, checklists, progress | Journey | ✅ `/api/content/roadmap-v2`, authenticated mutations and guest read-only preview |
| Roadmap step detailed guides, warnings, actions, cost, effort | Journey selected step | ✅ seven published API datasets, no source truncation; rendered recursively |
| `/citizenship` nine full steps, each step full page | Citizenship → step card → full details | ✅ complete published guide, server data, not summary-only stage title |
| Citizenship both exam versions, variable answers, audio and mastery | Citizenship trainer | ✅ 100+128 from server, current answers and progress from DB; device TTS unverified |
| Citizenship English M-638 vocabulary | Citizenship English | ⚠️ new website endpoint must be deployed; API-only, no APK bundled fallback |
| `/learn` cards, money both sides, signs, quiz, stores, measurements | Learn | ✅ existing API-backed native sections kept; sourced by website `/api/content/learn` |
| `/learn/survival-english` full packs, TTS, progress | Survival | ✅ 344/17 from website; native stop/speed control and cached snapshots |
| `/jargon` glossary, Basics, TTS, search | Glossary | ✅ 407 terms from website database; no bundled source |
| Published site states, agencies, health market and city guide | Resources | ✅ full published content and `/api/state-resources/{code}`, direct state selector |
| `/recommend` | Recommend | ⚠️ Existing API/native recommendation workflows preserved |
| `/auth` email registration, reset, Google | Auth | ⚠️ email flow retained; Google bridge wired, release OAuth setup and end-to-end test outstanding |
| `/u/me`, `/u/:userId` profile, avatar, cover, activity | Profile / native detail authors | ◐ own profile native; public-user profile and all subpanels not certified equal |
| `/messages` plus threads and replies | Messages/Thread | ⚠️ Native API workflow existing; logged-in device QA pending |
| `/my-requests` owner submissions and correction | My Requests | ⚠️ API state/edit/delete; role-specific QA pending |
| `/cv_builder`, `/cv_edit`, `/resume` schema, create/edit/delete, templates | CV Builder | ◐ Repeatable website schema and API native; website export/PDF/Word/layout templates open original site |
| Notifications, saved lists, account verification | Native section screens | ⚠️ Retained; device QA pending |
| `/admin` full moderation area | Native Admin | ◐ Existing native subset retained; complete granular web moderation parity not verified |
| `/admin/rideoffer` private driver data | Not in public navigation | — intentionally excluded from general immigrant mobile app; privileged web-only route |
| `/about`, `/privacy`, `/terms`, `/contact`, `/data-deletion`, `/editorial-policy`, `/affiliate-disclosure` | All sections → official website link | ↗ Current website has HTML pages, not published JSON APIs; intentionally defer to authoritative website copy |
| `/start` alias | Journey | ✅ authenticated navigation behavior retained |
| Catch-all detail pages `/:pageId` | Depends on target content | ◐ API detail screens for known published datasets; dynamic SEO/marketing detail pages not all mirrored natively |

## CONTENT COVERAGE TABLE

For the complete **dataset → endpoint → DB key → native consumer** inventory (rather than repeated summaries), see `REDESIGN-NOTES.md` → **CONTENT COVERAGE TABLE**. The read endpoints are versioned against website 6.3.7. `WEBSITE-DEPLOY` contains the two **new** read-only published keys; their server publication is a prerequisite for the content being accessible.

**Counts grounded in checked source fixtures, not a claim of production fetch:** civics 100 (2008) + 128 (2025); Survival 344 phrases / 17 packs; glossary 407. End-to-end live HTTP and signed Android build not run in this environment.

## Round 3 regressions and quality

- Guest Journey: error boundary around route plus guest-mode read-only gate; exception recovery home/retry.
- Audio: playing/stop state updated from speech start/done/stopped/error callbacks; cancellation-safe cleanup.
- Errors: all HTTP/network errors funnel through localized Arabic/English/Spanish friendly error text.
- The original 39 tests remain present, updated only where version numbers intentionally changed. New Round 4 API/CV/regression tests are additive. See `APP-ROUND4-TEST-REPORT.md` for exact run results and limitations.
