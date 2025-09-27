# Backend API Alignment Audit

This document captures the current status of the frontend's REST usage compared to the
`backend-api.json` source of truth. The audit combines automated checks with targeted
manual reviews that were completed while updating the 2FA flows.

## Methodology

1. Added `scripts/check-endpoints.mjs`, which parses `backend-api.json` to build the list
   of supported endpoint patterns, then scans `.ts`/`.tsx`/`.js` files for string literals
   beginning with `/api/`. Any string that does not match the backend specification is
   reported.
2. Ran `node scripts/check-endpoints.mjs` after the refactor to identify remaining gaps
   (the script ignores `lib/api/endpoints.ts` because it contains the authoritative map).
3. Spot-checked high-traffic features (auth/2FA, account security, notifications) and
   replaced ad-hoc `fetch` calls with the typed API client where possible.

## Updates completed in this pass

- Replaced the legacy 2FA setup/verify/reset flows with `AuthAPI` methods so that they
  now call the documented `/api/auth/2fa/*/` endpoints and persist tokens using the
  canonical storage keys (`access_token`/`refresh_token`).
- Migrated the dashboard security page to `AuthAPI` for listing and revoking sessions,
  generating setup QR codes, and enabling/disabling MFA. Local overrides are used for
  features that do not have a backend equivalent yet (e.g. "security settings").
- Swapped the notifications grouping widget over to `notificationsAPI`, ensuring that
  mark-read and delete actions target `/api/notifications/*` and gracefully handling
  features that the backend does not expose ("mark unread").
- Normalized social-login callback handling to use `AuthAPI.completeSocialAuth`, which
  aligns with the `/api/auth/social/<provider>/` endpoints from the spec.
- Documented the audit process and added the reusable endpoint validation script.

## Outstanding discrepancies

Running `node scripts/check-endpoints.mjs` still highlights a large number of calls that
are not described in `backend-api.json`. The most common groups are:

| Area | Examples reported by the script |
| --- | --- |
| Dashboard & analytics | `/api/admin/analytics/export/`, `/api/parties/<id>/analytics/`, `/api/videos/recent` |
| Social graph | `/api/users/friends/suggestions/`, `/api/friends/requests`, `/api/users/<id>/friend-request/` |
| Moderation/admin tooling | `/api/admin/system-logs/`, `/api/admin/moderation/reports`, `/api/admin/settings/reset/` |
| Store & rewards | `/api/store/items/<id>/purchase`, `/api/rewards/<id>/claim/`, `/api/store/rewards/daily` |
| Feedback/support | `/api/feedback/`, `/api/support/faq/<id>/vote/`, `/api/support/tickets/<id>/` |
| Media interactions | `/api/videos/<id>/comments/`, `/api/comments/<id>/like/`, `/api/videos/<id>/regenerate-thumbnail/` |

These endpoints either need to be added to `backend-api.json` if they are genuinely
supported, or the frontend needs to be refactored to the documented routes. The script
output should be used as a to-do list—each entry points directly at the file and string
literal to update.

## Next steps

1. Prioritise high-impact screens (dashboard, parties, social) and replace the remaining
   `fetch` calls with the shared API services so they inherit authentication, retries,
   and endpoint validation.
2. Extend `backend-api.json` where the backend intentionally exposes additional routes.
   Doing so will automatically silence the relevant warnings from
   `scripts/check-endpoints.mjs`.
3. Integrate the new script into CI once the backlog shrinks, ensuring future changes
   stay aligned with the backend contract.

To re-run the audit locally:

```bash
node scripts/check-endpoints.mjs
```

Review the reported file/endpoint pairs and either update the code to use a documented
route or add the missing path to `backend-api.json` if the backend already supports it.
