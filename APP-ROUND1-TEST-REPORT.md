# APP-ROUND1 Validation / QA report — Native v3.4.0

## Completed checks in this build workspace
- `npm test` — **31/31 passing** (22 data/logic tests and 9 source-contract/static wiring tests).
- JS/JSX parse check — **52 source/test files**, **0 parse errors** (TypeScript parser, not Metro).
- Public data integrity tests: **100** 2008 and **128** 2025 questions, **344** Survival phrases in **17** packs, **407** glossary items including exactly **200** English Basics, M-638 reading/writing lists.
- Civics logic tests: date-based 2008/2025 selection, 10/6 and 20/12 thresholds, 65/20 special, 90 days, 50/20 and 55/15 rules, punctuation-tolerant typed answers (including Washington D.C.), dynamic answers, mastery filters.
- Survival tests: Arabic-script pronunciation search, correct reply extraction/queue order, hide/mark mastered.
- Static wiring tests: existing bearer API auth, screen routes, native TTS and speed persistence, versioned local caches and pending progress, native camera/share, 24-row server paging, and no fake push registration.

## Not completed — do NOT claim a full QA pass
- `npm install --offline --ignore-scripts` **failed (ENOTCACHED)** because npm registry metadata for `expo` was unavailable. No dependency install, `expo-doctor`, Metro bundle export, Android AAB/APK, iOS compile, or live Android/iOS simulation was performed.
- Not tested against the live v6.1.52 production PHP API or production database. A shared API path exists in source but HTTP compatibility for specific user accounts is **not yet certified**.
- Not tested with real microphone permissions / native speech recognition, offline voice availability, Android keyboard/RTL, local cache storage permission behavior, camera image upload size, Expo push device tokens, or authenticated offline-then-reconnect conflict handling.
- Website parity remains incomplete in full admin editing, rich profile/image editing and some post/message features. See `PARITY-MAP.md`.

## Recommended smoke test on a development-build device
1. Install dependencies online: `npm install` followed by `npx expo-doctor`.
2. Build a development client (speech recognition native module cannot be assumed to work inside Expo Go): `npx expo run:android` or `eas build --profile preview --platform android`.
3. Confirm existing login and navigation, 13 Journey stages, community, marketplace, CV, messages and logout.
4. Citizenship: switch N-400 filing dates across 2025-10-20, try 2008/2025 exams, special 65/20, spoken answer, current answers, and offline.
5. Survival: search Arabic pronunciation, play all/stop, all speeds, mark mastered offline then reconnect and reopen account.
6. Glossary: verify 407/200 counts, Arabic search, listen, and offline startup.
7. Password change: wrong old password must fail without sign-out; valid change must keep the session.
8. Admin: search name/email using a permitted account; verify page 2 of places uses a new server response.
9. Test AR/EN/ES at narrow Android widths, keyboard open over inputs, permission denials, RTL, accessibility labels, and connectivity changes.

**Status:** source artifact complete for this development round; **not an independently verified release build**.
