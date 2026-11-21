> ⚠ **Superseded (mobile 3.7.1):** website v6.4.2 already contains everything in this overlay (both content keys, both static JSON files and the Google mobile route). Do **not** copy this `index.php` over a v6.4.x server — it is a v6.3.7 file and would undo the v6.4.2 tester fixes (password policy, hosted currency photos, exports).

# Website deployment overlay — APP-ROUND4

Baseline: AnswerForU website v6.3.7. This folder contains only a **backward-compatible** new read-only API content key.

**Files to deploy to existing website codebase:**

- `public/api/index.php`: FULL v6.3.7 file, with `citizenship-vocabulary` and `marketplace-categories` added to the allowlist of published content keys. Only deploy if the live `index.php` is still that exact v6.3.7 baseline; compare first and merge the one-line allowlist change otherwise, to avoid overwriting newer server changes.
- `public/api/content-static/marketplace-categories.json`: canonical website marketplace section categories, 17/21/10/6/10 plus group topics, read-only through the same site_content publisher.
- `public/api/content-static/citizenship-vocabulary.json`: official M-638 reading/writing word list drawn from the website’s existing `englishVocabulary.js`, now published by the API and imported idempotently into `site_content` by `afu_static_catalog_ensure`.

Validate: `GET /api/content/static/citizenship-vocabulary` returns `ok:true` with `data.reading_vocabulary` and `data.writing_vocabulary`, source normally `site_content`.

Google OAuth `/api/auth/oauth/google/mobile` was already provided by web v6.3.7 and is not modified here. Configure the real Android OAuth client SHA-1 in Google Cloud. Never upload secrets.

**No app-owned data tables touched**. Deploy server changes before using the new native vocabulary view; until deployed this screen shows localized unavailable state and does NOT bundle a competing content source.
