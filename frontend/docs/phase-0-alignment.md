# Phase 0 – Alignment & Tooling Readiness

_Last updated: 2024-05-09_

## Endpoint Audit Refresh
- Re-ran `scripts/check-endpoints.mjs` and archived the raw findings at `docs/phase-0-endpoint-gaps-2024-05-09.txt` so engineers can deep link to the outstanding mock-reliant surfaces.【F:docs/phase-0-endpoint-gaps-2024-05-09.txt†L1-L323】
- Dashboard, party, and rewards views still rely on undocumented endpoints for analytics exports, social notifications, party membership, and incentive payouts, reinforcing the scope of the upcoming replacements.【F:docs/phase-0-endpoint-gaps-2024-05-09.txt†L3-L83】【F:docs/phase-0-endpoint-gaps-2024-05-09.txt†L55-L80】
- Admin consoles continue to request moderation, system-log, and user-management endpoints that the backend catalog does not yet advertise, so we must confirm their availability or request additions before cutting over.【F:docs/phase-0-endpoint-gaps-2024-05-09.txt†L8-L129】【F:docs/phase-0-endpoint-gaps-2024-05-09.txt†L311-L323】
- Social graph components (friends, groups, suggestions, and blocking) remain the heaviest consumers of undefined endpoints and should be handled as a coordinated tranche to avoid partial feature rollouts.【F:docs/phase-0-endpoint-gaps-2024-05-09.txt†L200-L270】【F:docs/phase-0-endpoint-gaps-2024-05-09.txt†L240-L269】
- Store, billing, and notifications widgets depend on promo, subscription, reward, and notification APIs that are not present in the backend spec; these will need backend confirmation or mocks converted to interim feature flags.【F:docs/phase-0-endpoint-gaps-2024-05-09.txt†L146-L180】【F:docs/phase-0-endpoint-gaps-2024-05-09.txt†L271-L280】
- Video playback and management surfaces (library, comments, admin tooling) also sit on undocumented endpoints, informing the priority of client helper work once live APIs are exposed.【F:docs/phase-0-endpoint-gaps-2024-05-09.txt†L286-L310】

## Backend Parity Review
The table below captures whether the backend currently exposes the endpoints required for each roadmap phase. "Available" entries reference documented endpoints in `backend-api.json`, while "Gap" items require backend work before the UI can drop mock data.

| Phase | Focus Area | Backend Status | Notes |
| --- | --- | --- | --- |
| Phase 1 | Docs API client | ✅ Available | `/api/docs/` serves the generated documentation payload required to bootstrap a lightweight Docs client.【F:backend-api.json†L183-L190】 |
| Phase 1 | Dashboard API helpers | ✅ Available | `/api/dashboard/stats/` and `/api/dashboard/activities/` cover the data the dashboard tiles and feeds consume.【F:backend-api.json†L115-L158】 |
| Phase 1 | Analytics helpers | ✅ Available | Analytics endpoints already expose dashboard, realtime, and advanced query data needed for the upgraded clients.【F:backend-api.json†L3044-L3284】 |
| Phase 1 | Localization client | ⚠️ Gap | No localization endpoints are defined yet; the mock-data audit notes localization work is blocked pending backend support.【F:docs/mock-data-audit.md†L73-L94】 |
| Phase 2 | Admin dashboards | ✅ Available | Admin dashboard, analytics, system logs, and system health endpoints exist and align with the planned migrations.【F:backend-api.json†L4962-L5266】 |
| Phase 2 | Localization tooling | ⚠️ Gap | Translation management surfaces remain blocked until localization endpoints are delivered by the backend.【F:docs/mock-data-audit.md†L73-L94】 |
| Phase 3 | Integrations & external services | ✅ Available | Shared integrations endpoints cover Google Drive OAuth/files plus generic connection management for Discord and other providers.【F:backend-api.json†L3694-L3939】 |
| Phase 4 | Analytics/monitoring/operations | ✅ Available | Analytics dashboards and admin system health/log endpoints already exist for live data migrations.【F:backend-api.json†L3044-L3284】【F:backend-api.json†L5227-L5266】 |
| Phase 5 | Docs & content management | ✅ Available | Documentation endpoints are in place for CRUD flows once the Docs client lands.【F:backend-api.json†L183-L190】 |
| Phase 5 | Localization expansion | ⚠️ Gap | Localization backlog still needs backend contracts before UI work begins.【F:docs/mock-data-audit.md†L73-L94】 |
| Phase 5 | Chat presence for billing typing indicators | ✅ Available | Active user presence data is exposed via `/api/chat/<room_id>/active-users/`, enabling live typing indicators once wired.【F:backend-api.json†L2615-L2622】 |
| Phase 6 | Regression & contract testing | ✅ Available | With the documented endpoints above, we can generate MSW/contract fixtures to validate schema alignment during hardening.【F:backend-api.json†L3044-L3284】【F:backend-api.json†L4962-L5266】 |

## Tracking & QA Alignment Plan
- **Jira/Linear setup**: Create a dedicated project board with swimlanes for each roadmap phase and columns for _Backlog_, _Ready for Backend_, _In Progress_, _In Review_, and _Ready for QA_. Attach the relevant component list from the saved audit output so teams see the exact surfaces transitioning away from mocks.【F:docs/phase-0-endpoint-gaps-2024-05-09.txt†L3-L310】
- **Backend coordination**: File blocker tickets for localization and any newly discovered missing endpoints, ensuring backend availability is tracked alongside frontend conversion tasks. Reference this Phase 0 document from those tickets so engineers have the latest context.【F:docs/mock-data-audit.md†L73-L94】
- **QA dashboards**: Mirror the project board with QA-owned dashboards that watch the same ticket statuses and surface MSW/Playwright coverage updates as they land. This keeps validation aligned with each phase’s exit criteria and highlights when regression suites are ready for execution.

## Next Steps
1. Socialize this parity assessment with backend leads to prioritize localization and any other uncovered gaps.
2. Bootstrap the new project board and attach the audit findings to seed the backlog for Phase 1 implementation.【F:docs/phase-0-endpoint-gaps-2024-05-09.txt†L3-L310】
3. Kick off client development for Docs, Dashboard, and Analytics APIs once the tracking board is in place and backend availability is confirmed.【F:backend-api.json†L115-L158】【F:backend-api.json†L183-L190】【F:backend-api.json†L3044-L3284】
