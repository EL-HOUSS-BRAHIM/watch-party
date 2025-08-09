# Backend Analysis (Django / Channels / Celery)

Date: 2025-08-09

## 1. High-Level Architecture
- Django 5 project with modular app structure (authentication, users, videos, parties, chat, analytics, notifications, integrations, interactive, billing, moderation, store, search, social, messaging, support, mobile, admin_panel).
- ReST API via DRF + JWT (SimpleJWT).
- WebSockets via Django Channels (chat, party sync, interactive features).
- Celery for async tasks (tasks modules present; beat schedule file) – production config references queues, but no celery beat/worker scripts in repo aside from `watchparty/celery.py`.
- Redis used for cache, sessions (prod), channels layer, celery broker/result.
- S3 (optional) for media in production.
- Logging configured for file + console.
- drf-spectacular for OpenAPI schema generation.

## 2. Deployment Readiness Scorecard
| Area | Status | Notes |
|------|--------|-------|
| Settings separation | GOOD | dev / prod / testing present. Need env var override for DJANGO_SETTINGS_MODULE in ASGI/WSGI for prod. Currently hard-coded to development in multiple places. |
| Secret management | FAIR | `SECRET_KEY` default placeholder; ensure set in prod. Many optional secrets default to blank. |
| Dependency hygiene | FAIR | Missing some required libs for referenced code (see below). Versions pinned (good). Consider grouping dev-only deps. |
| Database | BASIC | Default SQLite; production config expects DATABASE_URL via dj-database-url. Provide migration strategy doc. |
| Migrations | UNKNOWN | Migrations directories exist (only videos listed in tree). Need to ensure all apps have migrations committed. Testing settings disable migrations (OK). |
| Static files | MINOR ISSUE | `STATICFILES_DIRS` points to `static/` which does not exist – warning appears. Create or remove. |
| Media handling | OK | MEDIA_ROOT configured. For S3 path conditional but `django-storages` not in requirements. |
| Celery | PARTIAL | Celery config & tasks file; no Procfile / systemd / pm2 command for workers in repo docs (deployment script may generate). Confirm worker + beat startup. Missing `django-celery-beat` dependency though production references its scheduler. |
| Channels/WebSockets | GOOD | Routing combined; custom JWT middleware. Need scaling guidance (ASGI server, daphne/uvicorn, sticky sessions behind proxy, Redis capacity). |
| Tests | POOR | `tests/` package present but running revealed 0 collected tests (perhaps empty or misconfigured). Need meaningful unit/integration tests. |
| Observability | BASIC | Logging configured; no metrics integration besides placeholders in admin health endpoints. Consider Prometheus / OpenTelemetry. |
| Rate limiting | CUSTOM | Custom middleware classes (not analyzed for correctness here); ensure they are performance-safe. |
| Security headers | PARTIAL | Some headers configured; missing CSP, Referrer-Policy, Permissions-Policy. |
| API versioning | BASIC | Middleware mention `APIVersionMiddleware`; actual versioning strategy not documented. |
| Error handling | CUSTOM | `core.error_handling.enhanced_exception_handler` configured; review for leaking internals (file not read yet). |
| Documentation | FAIR | Endpoint listing file(s) and spectacular integration present. Need generated schema artifact or publish step. |
| Performance | UNKNOWN | No caching strategy docs; Celery tasks not profiled. |
| Data retention | BASIC | Analytics retention constant only. Need cron to purge old data. |

## 3. Identified Missing / Mismatched Dependencies
Referenced in code but absent in `requirements.txt`:
- `django-storages` (needed for `storages.backends.s3boto3.S3Boto3Storage` in production).
- `python-json-logger` (module name often `python-json-logger`; production logging uses `'class': 'pythonjsonlogger.jsonlogger.JsonFormatter'`).
- `django-celery-beat` ( production: `CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'`).

Action: Add these with pinned versions & update docs.

## 4. Hard-Coded Development Settings
Files hard-coding `watchparty.settings.development`:
- `manage.py`
- `asgi.py`
- `celery.py`
- scripts (`run_dev_server.sh`, tests, helpers)

Risk: Production deploy may accidentally run dev settings (DEBUG=True, in-memory channels layer, dummy cache). 

Recommendation: Use `os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'watchparty.settings.production')` in `asgi.py`, `wsgi.py`, `celery.py`, and rely on environment to override for dev/testing. Or load via `.env` variable (already supported by `.env.production`). Provide a single entrypoint script to export correct module.

## 5. Logging Issues
- Test run failed until logs directory created. Create directory automatically if not exists in logging handler configuration (custom handler or pre-flight script) or document manual creation.
- File rotation only configured in production settings; dev uses simple file. Add retention policy (size vs time), consider log aggregation (ELK, Loki, CloudWatch) for scaling.

## 6. Static & Media
- Missing `static/` directory. Either create or remove from `STATICFILES_DIRS` to avoid warnings.
- Consider separate buckets for media and video transcodes; document expiration policies.

## 7. Celery & Async
- Provide queue names & concurrency in docs.
- Add health check endpoint for worker (e.g., ping task). 
- Add `redis` version compatibility note.
- If video processing heavy: isolate queue; consider resource constraints & autoscaling.

## 8. Rate Limiting & Middleware
Multiple custom middleware listed. Risks:
- Middleware stacking order: Performance & rate limiting appear after heavy logic? Evaluate ordering (put lightweight performance/rate limit earlier). 
- Potential duplicated responsibilities (two performance middlewares?).
Action: Audit `middleware/enhanced_middleware.py` & `performance_middleware.py` for overlap and ensure idempotency.

## 9. Security Review
Improvements:
- Add Content Security Policy (script-src 'self' ...). Provide dynamic nonce for inline scripts (if any in templates / admin). 
- Add Referrer-Policy (e.g., `strict-origin-when-cross-origin`).
- Add Permissions-Policy (restrict camera/microphone/geolocation). 
- Enforce secure cookies only in prod (already done) + SameSite attributes.
- Validate JWT token rotation & revocation (blacklist installed). Provide docs for clearing blacklisted tokens.
- Ensure password reset tokens time-limited & hashed (not inspected yet). 
- Add dependency vulnerability scanning (pip-audit in CI). 

## 10. Data & Privacy
- Provide Data Export / Delete endpoints (seen in users). Ensure asynchronous handling for large exports (currently likely synchronous). Suggest Celery job for export + email link.

## 11. API Consistency Issues
- Some endpoints have both legacy and enhanced routes (users, parties, chat). Plan deprecation: add `Deprecated` response header & timeline in docs.
- Mixed naming styles: some hyphenated (`/generate-invite/`), some underscores (none?), mostly hyphenated – maintain consistency (prefer hyphen for REST path segments). 
- Consider versioning prefix `/api/v1/` before public launch to ease breaking changes.

## 12. WebSocket Considerations
- JWTAuthMiddlewareStack: ensure token renewal strategy (short access tokens + refresh over HTTP). Document reconnection & token refresh pattern. 
- Provide heartbeat or ping/pong; set appropriate `expiry` in channel layer (currently 60). Possibly raise for long-lived parties.

## 13. Testing Gaps
Observed: 0 tests executed. Steps:
- Add pytest configuration & at least smoke tests for critical auth flows.
- Add WebSocket consumer tests with Channels `WebsocketCommunicator`.
- Add Celery task tests (use eager mode). 
- Integrate coverage threshold into CI.

## 14. Performance & Scaling Recommendations
- Introduce caching for heavy analytics endpoints (cache key w/ user + parameters). 
- Add database index review (models not inspected here). Provide a migration adding indexes on frequently queried fields (e.g., `created_at`, foreign keys in events/analytics). 
- Offload video transcoding (if implemented) to specialized service / ffmpeg worker queue; ensure limits.

## 15. Observability Enhancements
- Integrate Sentry performance traces (already partial). 
- Add OpenTelemetry instrumentation export (optional). 
- Provide Prometheus metrics endpoint (django-prometheus) for container orchestration.

## 16. Housekeeping / Cleanup
Potential removal / consolidation:
- Legacy endpoints (duplicate friend system) – plan sunset.
- Repetitive analytics endpoints: unify under structured query endpoints if possible.
- Ensure migrations exist for each app or mark `default_auto_field` usage.

## 17. Suggested Additions
- Health endpoint at `/health/` (README references; verify implemented). If missing, add simple view returning build info + commit hash.
- Management command to prune old analytics / notifications.
- DRF throttling classes for baseline fallback beyond custom rate limiting.
- API schema export automation (CI step generating `openapi.json` artifact).

## 18. Summary of Action Items (Backend)
Priority (High / Medium / Low):
1. (High) Add missing dependencies: django-storages, python-json-logger, django-celery-beat.
2. (High) Remove hard-coded development settings in runtime entrypoints for production safety.
3. (High) Implement real tests; at least auth + video + party flows.
4. (High) Add CSP & security headers; finalize cookie policies.
5. (Medium) Create logging directory automatically; document log shipping.
6. (Medium) Provide deprecation plan for legacy endpoints.
7. (Medium) Add health, metrics, and worker heartbeat endpoints.
8. (Medium) Introduce caching & DB index review.
9. (Low) Standardize endpoint naming, remove duplicates.
10. (Low) Provide docs for WebSocket token refresh strategy.

---

# Backend API Inventory (Derived from urls.py files)
(Format: METHOD PATH – Description; ViewSet-generated routes grouped)

## Authentication `/api/auth/`
- POST /api/auth/register/ – Register
- POST /api/auth/login/ – Login
- POST /api/auth/logout/ – Logout
- POST /api/auth/refresh/ – Refresh JWT
- POST /api/auth/forgot-password/ – Start reset
- POST /api/auth/reset-password/ – Complete reset
- POST /api/auth/change-password/ – Authenticated password change
- GET/PUT /api/auth/profile/ – User profile
- POST /api/auth/verify-email/ – Verify email
- POST /api/auth/resend-verification/ – Resend verification
- GET /api/auth/google-drive/auth/ ... (Drive integration auth)
- POST /api/auth/2fa/setup|verify|disable/ – TOTP operations
- GET /api/auth/sessions/; DELETE /api/auth/sessions/{id}/ – Session management
- Social auth: /api/auth/social/<provider>/, /api/auth/social/google/, /api/auth/social/github/

## Users `/api/users/`
(Representative – large set): profile, update, avatar upload, achievements, stats, sessions (CRUD), 2FA endpoints, friends (legacy + new), friend requests, block/unblock, search, notifications, settings (user/notification/privacy), export-data, delete-account, favorites CRUD, watch-history, reports, mutual-friends, etc.

## Videos `/api/videos/`
ViewSet (CRUD + like/comments etc.) plus:
- POST /upload/, /upload/s3/, /upload/{id}/complete/, /upload/{id}/status/
- GET /{id}/stream/, /{id}/thumbnail/, /{id}/analytics/, processing-status, quality-variants, regenerate-thumbnail, share/
- GET analytics detailed: heatmap, retention, journey, comparative
- GET channel analytics, trending
- POST /validate-url/
- GET /search/, /search/advanced/
- Google Drive: /gdrive/, /gdrive/upload/, /gdrive/{id}/delete/, /gdrive/{id}/stream/
- /{id}/proxy/

## Parties `/api/parties/`
ViewSet + invitations subresource, plus: recent, public, trending, recommendations, join-by-code, join-by-invite, search, report, {id}/generate-invite, analytics, update-analytics.

## Chat `/api/chat/`
Party chat messages send/list, room join/leave, active-users, settings, moderation (moderate, ban, unban, moderation-log), stats, legacy paths.

## Billing `/api/billing/`
Plans, subscribe, subscription detail cancel/resume, payment-methods CRUD + set-default, history, invoices (detail/download), address, promo-code validate, Stripe webhook.

## Analytics `/api/analytics/`
Base analytics, user-stats, party-stats, admin analytics, export, dashboard stats (user, video, party, system, system/performance, revenue, retention, content, events), advanced (realtime dashboard, advanced query, AB testing, predictive), platform overview, user behavior, content performance, revenue-advanced, personal, real-time.

## Notifications `/api/notifications/`
List, detail (GET/DELETE), mark-read, mark-all-read, clear-all, preferences (view/update), push token update/remove/test/broadcast, templates (list/detail), channels, stats, delivery-stats, bulk send, cleanup.

## Integrations `/api/integrations/`
Health, status, management, test, types, connections (list, disconnect), google-drive (auth-url, oauth-callback, files, streaming-url), s3 (presigned-upload, upload, streaming-url), oauth provider generic auth-url/callback.

## Interactive `/api/interactive/`
Per party: reactions list/create, voice-chat (get/manage), screen-shares list/update/annotations, polls list/create/publish/respond, analytics.

## Messaging `/api/messaging/`
conversations/, conversations/{id}/messages/.

## Search `/api/search/` + discover.

## Support `/api/support/`
FAQ categories/list/vote/view, tickets CRUD/messages, feedback submit/vote, help search.

## Moderation `/api/moderation/`
reports list/create, report detail, admin queue/stats/dashboard, report actions (assign, resolve, dismiss, actions list), bulk-action, report-types, content-types.

## Store `/api/store/`
items, purchase, inventory, achievements, rewards (claim), stats.

## Admin Panel `/api/admin/`
Dashboard, analytics overview, user management (suspend/unsuspend, bulk-action, export, actions), parties management, videos management, content reports resolve, system logs/health/maintenance, broadcast, send notification, settings view/update, health check/status/metrics.

## Mobile `/api/mobile/`
config, home, sync, push-token, app-info.

## Root & Dashboard
- /api/ (root listing)
- /api/test/
- /api/dashboard/stats/, /api/dashboard/activities/

## WebSockets
- /ws/chat/{party_id}/ (chat)
- /ws/party/{party_id}/sync/ (video sync)
- /ws/party/{party_id}/ (party)
- /ws/party/{party_id}/lobby/ (lobby)
- /ws/notifications/
- /ws/test/
- /ws/interactive/{party_id}/
- /ws/voice-chat/room/{room_id}/
- /ws/screen-share/{share_id}/

---

## 19. Risks Summary
| Risk | Impact | Mitigation |
|------|--------|------------|
| Dev settings in production | Security / performance | Environment-based settings selection |
| Missing dependencies | Runtime errors | Add packages & lock versions |
| No automated tests | Regressions | Add baseline test suite in CI |
| Legacy endpoint sprawl | Maintenance overhead | Deprecation policy & removal schedule |
| Overly permissive CORS in dev leaking to prod | Security | Ensure prod CORS explicit only |
| Incomplete security headers | XSS / injection risk | Add CSP, Referrer-Policy, Permissions-Policy |
| Unbounded analytics growth | Storage/performance | Scheduled purge tasks |

---

## 20. Final Backend Recommendation
NOT YET READY for production hardening until High priority items addressed. After remediation, proceed with load testing (WebSocket concurrency, video streaming path), finalize observability, and produce OpenAPI schema baseline.
