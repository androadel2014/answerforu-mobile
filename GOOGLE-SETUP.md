# APP-ROUND4 / v3.6.0 — Google OAuth for Android

# AnswerForU — Google sign-in for Android (server-side), v6.3.0

## Existing Google project

Reuse the existing site's Google Cloud project and OAuth consent screen, **do not create an unrelated project**. The Web OAuth Client ID found in the supplied server configuration is:

`816411262872-hhf8r29j0gt9p2russi232ji7vgmq1oj.apps.googleusercontent.com`

Only **public client identifiers** are shown here; never put the Web **client secret**, app JWT secret or refresh tokens into Expo `EXPO_PUBLIC_*` variables, the Android binary, Git, or the public web directory.

### Console values and client types

| Configuration | Value / action | Where |
|---|---|---|
| Existing Web client | ID above | Google Auth Platform → Clients → existing Web client |
| Web authorized origin | `https://answerforu.com` | Existing Web OAuth client → Authorized JavaScript origins |
| Web authorized redirect URI | `https://answerforu.com/api/auth/oauth/google/callback` | Existing Web OAuth client → Authorized redirect URIs — **preserve** |
| Android application ID | `com.answerforu.app` | Add an **Android OAuth client** under the **same** Google Cloud project |
| Android signing fingerprint | **Your actual SHA-1** for debug and release signing certificates; SHA-256 if required by integration | Android OAuth client; get it from signing configuration / Google Play App Signing. Not discoverable from website ZIP |
| Android OAuth client ID | Obtain from console after entering package and SHA-1. Do not invent | `config/production.php` OAuth google `mobile_client_ids` (server allowlist) |
| Web server client ID | Existing Web ID above | Native Google Sign-In SDK `webClientId` when requesting an ID token, where appropriate |
| Native deep link (optional client return path) | `answerforu://auth/callback` | Android app URL scheme registration / Expo scheme: `answerforu` |
| Native API endpoint | `POST https://answerforu.com/api/auth/oauth/google/mobile` | Native app HTTPS request, body JSON `{"id_token":"GOOGLE_ID_TOKEN"}` |

**Important:** the new ID-token-based mobile flow **does not require an OAuth redirect URI for the server**. The app's `answerforu://auth/callback` is a native navigation deep link only, not a Google Console Web redirect. Do **not** register it under Web OAuth Authorized Redirect URIs. If switching to an authorization-code-with-PKCE browser flow later, that requires a separate design and explicitly registered redirect matching the SDK.

### Protected server settings

Keep the existing `oauth.google.client_id` and `oauth.google.client_secret` untouched (web login must still work). In protected production configuration outside public_html, add the Android OAuth client to `oauth.google.mobile_client_ids` as an array of exact strings, e.g. `['YOUR_ACTUAL_ANDROID_CLIENT_ID.apps.googleusercontent.com']`. Ensure production `jwt_secret`, HTTPS and outbound TLS to `https://oauth2.googleapis.com/tokeninfo`. Never copy production credentials into a release archive.

### Mobile contract

1. Google native SDK obtains the Google ID token for the configured authorized audience; no raw Google access token is accepted by the new endpoint.
2. Send `POST /api/auth/oauth/google/mobile` with `Content-Type: application/json` and `id_token`.
3. Server verifies with Google over TLS; checks `aud` against configured web/Android IDs, issuer, expiry, verified email, and Google subject. No client-supplied email/user ID is trusted.
4. Account resolution uses **existing** `oauth_finish_user`, preserving established user IDs/profiles when the OAuth identity/email matches. Successful response: `{"ok":true,"token":"<AnswerForU JWT>","user":{...}}`; app stores JWT securely (not in plaintext AsyncStorage) and sends `Authorization: Bearer <JWT>` to existing API.
5. Invalid/revoked/expired tokens return 401; missing config returns 503; missing token returns 422. Web `/auth/oauth/google/start` and `/callback` remain unchanged.

### Checks before live rollout

- Real Google console Android client and release signing SHA-1 have not been supplied, so release-signature login cannot be validated yet.
- Validate exact `aud`, existing-account linking, brand-new account, expired token, duplicate sign-in, and no redirected browser session.
- Test from installed package `com.answerforu.app` against deployed HTTPS endpoint, and watch for Google API outbound network restrictions on shared hosting. No local test can prove production OAuth works without a real token and protected production credentials.


## Deployment overlay
The app reuses `POST https://answerforu.com/api/auth/oauth/google/mobile` from the deployed website v6.3.7. The **web client ID** is a public identifier and is included in the app. To complete real native sign-in, configure an **Android OAuth client ID** in Google Cloud for package `com.answerforu.app` and the SHA-1 of the signing key for this exact build, then set `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` in the Expo build environment and rebuild. Register the deep link scheme `answerforu://`; test `makeRedirectUri()` on the release client. Do not put client secrets in the app. OAuth verification is server-side. This repository cannot invent the owner’s signing SHA-1 or production Android client ID; a live end-to-end sign-in is unverified until those are configured and tested.
