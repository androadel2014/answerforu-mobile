# APP-ROUND4 — AnswerForU Mobile v3.6.0, Android versionCode 14

**Basis**: full v3.5.0/APP-ROUND3 source, compared against the delivered website **v6.3.7** source. Package `com.answerforu.app`; Expo SDK 58, React Native; AR / EN / ES. This is full source, not a binary APK/AAB and not a patch. The website's existing identity/accounts and API remain authoritative.

## What changed

1. **Website v6.3.7 design language:** turquoise/teal primary accents, light surfaces, consistent 16-point body text, readable high-contrast cards and actions. Original native tab navigation retained. Marketplace is one umbrella with sections for places, groups, services, jobs, housing, products and saved items; `All sections` links into the same screen with the requested filter, rather than duplicating marketplaces.
2. **Server data, not APK data:** Survival English, glossary, civics banks, citizenship stages, Journey details and taxonomy no longer import bundled JSON at runtime. The app reads from the site's HTTPS endpoints and caches the response versioned to website 6.3.7. No bundled editorial fallback is used when an API is unreachable; only a **previously downloaded API snapshot** can be shown offline. Old JSON files are retained only as immutable regression-test fixtures, not imported by mobile runtime screens.
3. **Citizenship full step pages:** Nine AR/EN/ES stages loaded from `/api/content/static/citizenship-guide`; selecting a card reveals every supplied field (tasks, documents, mistakes, time, cost, source). Official 2008 and 2025 banks fetched independently; their dynamic current answers still use existing `/api/citizenship/answers`. English reading/writing/interview examples come from the guide. The entire official M-638 reading/writing word list is added as read-only website content under `/api/content/static/citizenship-vocabulary` (see WEBSITE-DEPLOY).
4. **My Journey full detail:** `GET /api/content/roadmap-v2` is the stage/step source. The active step displays complete documents, explanations, task actions, warnings, stage-specific warnings, effort and costs from seven published-content datasets. Guest Journey opens read-only; all user-specific progress writes are gated by an authenticated session. New screen-level error boundary offers localized retry/home when a component throws.
5. **Learn and resource library:** Learn's full existing API categories, images, quiz, coin fronts/backs and source links are maintained. An API-backed full-depth reference screen exposes additional roadmap, city, state agency, health marketplace, DV and citizenship reference datasets. A state code field loads the same `/api/state-resources/{code}` endpoint as the website.
6. **CV builder:** Native repeatable website-format sections now use `targetJob`, `personalInfo`, `summary`, `experiences`, `education`, `courses`, `skills` and `languages`. Create/update/delete use the site's existing CV API; edit, preview, camera/gallery photo and bounded JSON import are included. Site-only advanced PDF/Word template rendering remains a documented external handoff to `/cv_builder`, not falsely claimed to be native equivalent.
7. **Marketplace data and multilingual discovery:** App sends `q` and optional location filters to the site's current server-side queries, and no longer removes cross-language synonym matches through a conflicting literal client-side text filter. Category options now load from the website `marketplace-categories` published catalog, based on its current original lists (17 places, 21 services, 10 jobs, 6 housing, 10 products, eight group topics).
8. **Audio and error regressions:** TTS button reflects speaking/stop, stops its own playback on unmount and handles late callbacks. Screen errors and network/server failures are localized in all three languages without showing arbitrary raw exception strings.
9. **Account/OAuth:** Existing `POST /api/auth/oauth/google/mobile` is reused for Google ID-token exchange into a normal website JWT, rather than creating a separate app identity table. Existing public web OAuth client ID is set; Android release client ID and SHA-1 **must be configured by the owner**, and real login has not been tested. Native callback scheme `answerforu://auth/callback` is documented. No secrets in source.
10. **Legal links:** About, contact, privacy, terms, editorial policy, data deletion and affiliate disclosure open the website's own pages, rather than embedding out-of-date legal text. The website does not expose these as structured public content API datasets in v6.3.7; this is a documented exception.

## CONTENT COVERAGE TABLE — published data and consumers

| Website section / full dataset | Endpoint | DB/source of truth | Mobile reader / status |
|---|---|---|---|
| Home and marketplace discovery | `/api/community/places`, `/api/listings`, `/api/community/groups` | Existing community/marketplace DB tables | Home, Marketplace — **API**; global search is not a true server-wide single-index endpoint |
| Journey: 13 stages and steps/checklists | `/api/content/roadmap-v2` | Website roadmap publisher | Journey — **API** |
| Journey: account progress, custom items | `/api/journey` and step/checklist write routes | Existing account DB | Journey — **API**, authenticated mutations |
| Journey: full guides | `/api/content/static/roadmap-guides` | `site_content: afu_static_roadmap-guides` | Journey detail, Resources — **API** |
| Journey: localized descriptions and full details | `/api/content/static/roadmap-guide-locales` | `site_content: afu_static_roadmap-guide-locales` | Journey detail, Resources — **API** |
| Journey: actions and resource pointers | `/api/content/static/roadmap-actions` | `site_content: afu_static_roadmap-actions` | Journey detail, Resources — **API** |
| Journey: multilingual cautions | `/api/content/static/roadmap-warnings-locales` | `site_content: afu_static_roadmap-warnings-locales` | Journey detail, Resources — **API** |
| Journey: Arabic expanded step/stage warnings | `/api/content/static/roadmap-warnings-ar` | `site_content: afu_static_roadmap-warnings-ar` | Journey detail, Resources — **API** |
| Journey: costs and budgets | `/api/content/static/roadmap-costs` | `site_content: afu_static_roadmap-costs` | Journey detail, Resources — **API** |
| Journey: effort and timing | `/api/content/static/roadmap-effort` | `site_content: afu_static_roadmap-effort` | Journey detail, Resources — **API** |
| Journey: lottery guidance | `/api/content/static/roadmap-dv-template` | `site_content: afu_static_roadmap-dv-template` | Resources — **API** |
| Citizenship: all nine naturalization steps | `/api/content/static/citizenship-guide` | `site_content: afu_static_citizenship-guide` | Citizenship full-step reader — **API** |
| Citizenship: 2008 official civics (100) | `/api/content/static/citizenship-civics` | `site_content: afu_static_citizenship-civics` | Citizenship trainer — **API** |
| Citizenship: 2025 official civics (128) | same | same | Citizenship trainer — **API** |
| Citizenship: current variable answers | `/api/citizenship/answers` | Existing managed answers DB | Citizenship — **API** |
| Citizenship: mastery/progress | `/api/citizenship/progress` | Existing user DB | Citizenship — **API**, synced to account |
| Citizenship: M-638 official word lists | `/api/content/static/citizenship-vocabulary` | **NEW** `site_content: afu_static_citizenship-vocabulary` | Citizenship English — **requires WEBSITE-DEPLOY** |
| Learn: life guides, money/coins, signs | `/api/content/learn` | Existing Learn DB/published data | Learn — **API** |
| Learn: stores, services, education, conversions, quizzes | same | same | Learn — **API** including original detailed cards |
| Survival English: 344 phrases in 17 packs | `/api/survival-english` | Existing survival DB | Survival / offline packs — **API** |
| Survival saved progress | `/api/survival-english/progress` | User account DB | Survival — **API** |
| Glossary: 407 terms (including 200 Basics) | `/api/glossary` | Existing glossary DB | Glossary/offline packs — **API** |
| Places (curated and user-contributed) | `/api/community/places?paged=1&...` | Community DB | Marketplace, details — **API** |
| Groups | `/api/community/groups` | Community DB | Marketplace — **API** |
| Services/jobs/housing/products and owner listings | `/api/listings?type=...&q=...`, `/api/listings/{id}` | Marketplace DB | Marketplace, detail/edit/save/review — **API** |
| Marketplace taxonomy, group topics/platforms | `/api/content/static/marketplace-categories` | **NEW** `site_content: afu_static_marketplace-categories` | Add-listing form — **requires WEBSITE-DEPLOY** |
| Trilingual cross-category synonym dictionary | `/api/content/static/search-synonyms` + server marketplace query logic | `site_content: afu_static_search-synonyms` | Marketplace server-side search — **API** |
| Public reviews, ratings, favorites | Existing `/api/listings/*`, `/api/community/*`, `/api/favorites/*` | Existing site DB | Listing details and saved lists — **API** |
| Community posts/comments, profile, notifications, messages | Existing `/api/posts`, `/api/profile`, `/api/notifications`, `/api/messages` routes | Existing user DB | Native Feed, Profile, Notifications, Threads — **API** |
| CV documents and data fields | `/api/cvs`, `/api/cv/{id}` | Existing CV DB | Native website-schema CV editor — **API** |
| State guides and resource detail | `/api/state-resources/{code}` | Existing state resource DB | Resources — **API** |
| State agency and health directories | `/api/content/static/state-agencies`, `/api/content/static/state-health-marketplaces` | `site_content` published keys | Resources — **API** |
| Curated cities reference | `/api/content/static/curated-cities` | `site_content: afu_static_curated-cities` | Resources — **API** |
| Local resource recommendations, reviews and suggestions | `/api/resources` and resource-specific write routes | Existing resource DB | Journey embedded resource cards — **API** |
| Site legal pages | HTML website `/about`, `/privacy`, `/terms`, `/contact`, `/editorial-policy`, `/affiliate-disclosure`, `/data-deletion` | Website legal pages, **not** current JSON API | In-app native link opens **official website page**, deliberately not bundled |
| Private RideOffer admin app | `/admin/rideoffer` and `/api/rideoffer/v1/*` | Separate private driver DB | **Not exposed** to public immigrant app navigation; intentional privacy boundary |

### Remaining parity limits — explicit, not hidden

- **Google end-to-end release sign-in:** requires owner-provided real Android OAuth client ID and signing SHA-1, server `mobile_client_ids` configuration, and test on installed release app. Wiring is present but no successful live token exchange was run here.
- **Website full CV template rendering and PDF/Word downloads:** native form and saved data schema implemented; exact formatting/download parity has not been implemented in native code. Opens original website CV builder for those operations.
- **Complete action-level parity across every website account/admin component:** public native flows have been retained and added to, but destructive workflows, all moderation subforms, private Google sign-in, and UI interactions across every website route have not been exhaustively verified with real accounts/devices. Do not label this a zero-gap production-certified release.
- **Original website legal pages** are HTML-only; mobile opens those on the website, not API JSON. Navigation categories and UI translations remain code-defined (presentation labels, not editorial content).
- **New content endpoints** (`citizenship-vocabulary`, `marketplace-categories`) are bundled for backward-compatible website deploy but are **not already available merely by installing the app**. Until the overlay is deployed, the associated panels show a localized unavailable state. All other published keys are in website v6.3.7 source.
- The v3.5 legacy JSON files remain as **test fixtures only** and are not imported by production app screens. No preloaded static content substitutes for the server on first run.

## Validation boundary

Source and pure-function tests, syntactic parser checks, PHP syntax and ZIP extraction can run here. Native Android/Metro/EAS build is not certified because npm dependencies are unavailable offline. The app was not installed on an Android device; AR/EN/ES keyboard/RTL behavior, push delivery, screen reader UX and real account flows need on-device QA. See `APP-ROUND4-TEST-REPORT.md`.
