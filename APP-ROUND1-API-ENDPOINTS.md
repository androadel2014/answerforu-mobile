# APP-ROUND1 API contract notes

**New PHP endpoints bundled:** NONE. No PHP/server/database changes are present in the mobile source zip.

The app continues to use the production API base `https://answerforu.com`, with its existing stored bearer token from the v3.3.0 app.

| Purpose | Existing website endpoint | HTTP method |
| --- | --- | --- |
| Current account | `/api/auth/me` | GET |
| Change own password | `/api/auth/change-password` | POST `{currentPassword,newPassword,confirmPassword}` |
| Dynamic USCIS answer values | `/api/citizenship/answers` | GET |
| Civics study progress | `/api/citizenship/progress` | GET, PUT `{progress}` |
| Survival phrases and packs | `/api/survival-english` | GET |
| Survival learning progress | `/api/survival-english/progress` | GET, PUT `{mastered}` |
| Glossary (including English basics) | `/api/glossary` | GET |
| Admin users | `/api/admin/users` | GET |
| Server-side places paging | `/api/community/places?paged=1&compact=1&page=1&limit=24` | GET |
| CV update/delete | `/api/cv/{id}` | PATCH, DELETE |
| Notifications inbox (existing) | `/api/notifications` | GET |

**Push delivery remainder:** The website's notification inbox is not a device-token registration API. A future *new backward-compatible* authenticated endpoint such as `POST /api/push/register` accepting an authenticated user's Expo token (plus endpoint for deletion and server delivery integration) would be needed. That endpoint is **not included or invoked** by this app. EAS `projectId` and real devices are required before push enrollment can be tested.

**Offline behavior:** The app bundles the public content so it does not require newly deployed APIs merely to display phrase banks, official questions, or glossary. Fresh server-side changes and progress sync still require connectivity. User progress is kept in per-user local pending records and is attempted again when opening the module.
