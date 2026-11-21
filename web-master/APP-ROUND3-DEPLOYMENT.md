> ⚠ **Superseded (mobile 3.7.1):** website v6.4.2 already includes `POST /api/auth/oauth/google/mobile`. Do **not** deploy this v6.1.52 `index.php`; it would undo later website releases, including the v6.4.2 tester fixes.

# APP-ROUND3 additive backend endpoint

Original **website v6.1.52** remains authoritative. The bundled `public/api/index.php` is the FULL source file from that version, with one additive POST route immediately before `/auth/oauth/config`. Do **not** deploy the complete mobile ZIP to Bluehost; merge this one route into the currently deployed website source if its SHA-256 differs, preserve the live database, and run the website build path.

- Route: `POST /api/auth/oauth/google/mobile` with JSON `{ "id_token": "<OIDC ID token from Google>" }`.
- Response: existing `{ "user": <same profile shape>, "token": <existing JWT> }` from `oauth_finish_user`; no new auth store and no schema changes.
- Validation: Google tokeninfo endpoint HTTPS, issuer, `aud` whitelist configured server-side, expiry, subject, verified email, email format.
- Setup: configure Android, iOS and Web OAuth client IDs in Google Cloud, **and** set `GOOGLE_ANDROID_CLIENT_ID`, `GOOGLE_IOS_CLIENT_ID`, `GOOGLE_WEB_CLIENT_ID` in the PHP server environment as appropriate. Existing `oauth_provider_config('google')['client_id']` is also accepted. Configure matching `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` variables for the mobile app build. Android package is `com.answerforu.app`; its SHA-1 fingerprint must match your signed build.
- Never trust client-submitted email, audience or user ID, and do not introduce a client secret into the mobile app.
- Without the new backend route and client IDs, Google button provides an explanatory configuration message instead of a false login.
