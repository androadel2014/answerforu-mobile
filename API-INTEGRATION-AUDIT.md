# Mobile 3.3.0 integration audit

## Verified from the bundled AnswerForU v6.1.49 PHP API source

| Mobile feature | API endpoint(s) | Login required |
| --- | --- | --- |
| Login / Registration | POST /api/auth/login, /api/auth/register | No |
| Session | GET /api/auth/me | Yes |
| Learn America | GET /api/content/learn | No |
| Glossary | GET /api/glossary, POST /api/glossary/suggestions | No / Yes |
| Community places/groups | GET/POST /api/community/places, /groups | No / Yes |
| Marketplace | GET/POST/PATCH /api/listings | No / Yes |
| Community feed | GET/POST /api/posts | No / Yes |
| Resource directory | GET /api/resources | No |
| Journey | GET/PATCH /api/journey | Yes |
| My requests | GET /api/me/requests | Yes |
| Moderation | GET /api/admin/listings; PATCH /api/admin/listings/{id}/{action} | Admin |
| Listing changes | GET /api/admin/listing-changes; PATCH /api/admin/listing-changes/{id}/{action} | Admin |
| Notifications and chat | GET /api/notifications, /api/chat/* | Yes |

## Remaining parity gaps
- Not every admin capability from the website is implemented natively (e.g. user management and content editors).
- My Requests now supports title/details updates to listings, but complex image edits and suggestion edits require dedicated forms.
- Learn America is fully sourced from DB; web-specific components may have richer UX.
- Public community API still returns all places, even though mobile renders 24 at a time. True backend pagination is a separate API evolution.
- Test live authentication, image uploads, Android keyboard and RTL on-device.

## Safety
No MySQL or PHP backend files have been copied into the APK source. Database is not modified by building this app. All server-side permissions stay enforced by the production API.
