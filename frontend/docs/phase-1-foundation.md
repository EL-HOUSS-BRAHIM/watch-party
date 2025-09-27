# Phase 1 – Client API Foundation

_Phase owner:_ Frontend Platform
_Last updated:_ 2024-05-09

## Deliverables
- **DocsAPI** implements document CRUD, version history, category management, and exports so authoring surfaces can replace mock fixtures with live data once the backend exposes `/api/docs/` content.【F:lib/api/docs.ts†L1-L128】
- **DashboardAPI** standardizes access to `/api/dashboard/` stats and activities, including acknowledgement helpers to de-duplicate notifications across surfaces.【F:lib/api/dashboard.ts†L1-L54】
- **LocalizationAPI** defines the translation contracts covering languages, projects, strings, submissions, and approvals, providing a shared abstraction when backend endpoints arrive.【F:lib/api/localization.ts†L1-L97】
- **AnalyticsAPI typings** now cover realtime snapshots and advanced queries so dashboards stop relying on `any` and can benefit from inference across admin surfaces.【F:lib/api/analytics.ts†L1-L244】【F:lib/api/types.ts†L1-L360】

## Integration & Testing
- Added `ApiClient` constructor options plus a `configure` helper so tests can exercise real HTTP calls without stubbing interceptors.【F:lib/api/client.ts†L1-L180】
- Provisioned `foundation-clients.test.ts` to spin up ephemeral HTTP servers and exercise Docs, Dashboard, and Localization flows end-to-end, validating query params, payloads, and responses.【F:__tests__/lib/api/foundation-clients.test.ts†L1-L230】

## Next Steps
- Wire `components/documentation/documentation-manager.tsx` and admin translation screens to the new clients once backend endpoints are verified.【F:docs/mock-data-remediation-status.md†L1-L120】
- Coordinate with backend to implement the localization routes described in `LocalizationAPI` so QA can start running against live translation payloads.
- Expand integration coverage to include analytics realtime dashboards after the UI migrates away from mock generators.
