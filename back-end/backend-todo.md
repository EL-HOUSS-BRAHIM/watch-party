# Backend Hardening Sprint (5–6 Hours)
Date: 2025-08-09
Time Budget: ~5–6 hours (single focused session)
Goal: Eliminate top production blockers fast; establish minimal safety net (config correctness, deps, security headers, smoke tests, health & logging).

## Guiding Principles
- Prioritize risk reduction over feature completeness.
- Keep changes small & atomic (one concern per commit).
- Fail fast: after every major edit, run a quick startup + smoke test.
- Add only minimal tests now—depth can come later.

## Success Criteria (Exit Checklist)
[ ] Default runtime uses production settings module (no silent DEBUG in prod)
[ ] Missing dependencies installed & importable
[ ] App starts from clean clone without manual log/static dir creation
[ ] Security headers (CSP report-only, Referrer-Policy, Permissions-Policy, X-Content-Type-Options, X-Frame-Options) applied
[ ] Health endpoint (/health/) returns JSON with status + commit
[ ] Minimal pytest suite runs (≥3 tests: auth flow, health endpoint, websocket or simple task)
[ ] Structured JSON logging working in production settings (one sample line validated)
[ ] Static files warning removed
[ ] Celery ping task callable (even if worker not running—fallback graceful)
[ ] OpenAPI export command stub OR documented follow-up

---
## Condensed Task Timeline

### Hour 0: Kickoff (10–15m)
1. Create branch
   - Command: git checkout -b backend-hardening-sprint
   - Commit style: chore(settings): ...; feat(security): ... etc.
2. Quick dependency inventory
   - Open requirements.txt; confirm absence of: django-storages, python-json-logger, django-celery-beat.

### Hour 1: Configuration & Dependencies (35–40m)
3. Settings selection unification (HIGH)
   - Files: manage.py, asgi.py, celery.py.
   - Replace hard-coded 'watchparty.settings.development' with:
     os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'watchparty.settings.production')
   - Dev helper script (run_dev_server.sh) should export DJANGO_SETTINGS_MODULE=watchparty.settings.development before running.
   - Risk: accidental test env mismatch—ensure testing settings still set explicitly in pytest.ini later.
4. Add missing deps (HIGH)
   - Choose stable pins (example—verify latest minor stable):
     django-storages==1.14.4
     python-json-logger==2.0.7
     django-celery-beat==2.6.0
   - Install & verify imports:
     python - <<'PY'\nimport storages, pythonjsonlogger, django_celery_beat\nprint('deps ok')\nPY
5. Static & logs directories
   - Create back-end/static/.gitkeep if keeping STATICFILES_DIRS.
   - Add early-init util or small function in settings or an AppConfig.ready() to mkdir logs/ if absent (exist_ok=True).

### Hour 2: Security Middleware & Cookies (50–55m)
6. Security headers middleware (HIGH)
   - New module: middleware/security_headers.py
   - Add class SecurityHeadersMiddleware:
     - Always: X-Content-Type-Options: nosniff
     - X-Frame-Options: DENY (or SAMEORIGIN if admin needs embedded)
     - Referrer-Policy: strict-origin-when-cross-origin
     - Permissions-Policy: camera=(), microphone=(), geolocation=()
     - CSP (report-only first): default-src 'self'; img-src 'self' data:; media-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'
   - Insert early in MIDDLEWARE (after security middlewares, before caching / auth).
7. Cookies & CORS tightening
   - Production settings: ensure SESSION_COOKIE_SECURE=True, CSRF_COOKIE_SECURE=True, CSRF_COOKIE_SAMESITE='Lax' (or 'Strict' if safe), SESSION_COOKIE_SAMESITE='Lax'.
   - Explicit CORS_ALLOWED_ORIGINS list (remove '*'). Document dev override in development settings.

### Hour 3: Health & Observability Baseline (45–50m)
8. Health endpoint (MED)
   - New view returning: {"status":"ok","commit":"<short-sha>","build_time":ENV or fallback}
   - Use subprocess git rev-parse --short HEAD (cache result) OR read env GIT_COMMIT passed at deploy.
   - Add simple URL /health/ outside auth (read-only, no DB).
9. Celery ping task
   - tasks/common.py -> @shared_task(name='system.ping') returns 'pong'.
   - Optional endpoint /health/worker/?timeout=1 to attempt apply_async().get(timeout=timeout). On timeout return worker_status:"down" but overall status still ok.
10. Structured logging (MED)
   - Add JSON formatter via python-json-logger in production LOGGING config.
   - Fields: timestamp, level, logger, message, request_id, path, method, status_code, user_id (if available).
   - Implement request_id middleware (uuid4). Store in request.META['REQUEST_ID']; add to logging Filter.
   - Validate one log line.

### Hour 4: Minimal Testing Framework (45–50m)
11. Add pytest + config (HIGH)
   - requirements: pytest, pytest-django, coverage (if not present). (If time constrained, only pytest + pytest-django now; coverage later.)
   - File pytest.ini:
     [pytest]\nDJANGO_SETTINGS_MODULE=watchparty.settings.testing\npython_files = tests/test_*.py
12. Smoke tests (HIGH)
   - tests/test_auth_smoke.py: register -> login -> access protected endpoint (or if register complex, mock user creation & test login only).
   - tests/test_health.py: GET /health/ returns 200 and JSON.
   - tests/test_websocket.py: Channels communicator connect to /ws/test/ (if test consumer exists) or skip with reason if absent.
13. Run pytest -q; fix immediate import/config errors.

### Hour 5: Finish & Polish (45–60m)
14. Static warning removal confirmation (collectstatic or runserver log).
15. Document quickstart snippet at top of README or SECURITY.md delta (optional if minutes remain).
16. OpenAPI export stub (if time): management command export_openapi writing openapi.json (using spectacular). If out of time, add TODO comment.
17. Final verification pass:
   - Start dev server with production settings (env var) -> check headers.
   - Validate log JSON line.
   - Run pytest again.
   - Commit & push.

---
## Detailed Implementation Notes

### Security Middleware Snippet (Conceptual)
class SecurityHeadersMiddleware:
    def __init__(self, get_response): self.get_response = get_response
    def __call__(self, request):
        response = self.get_response(request)
        h = response.setdefault
        h('X-Content-Type-Options', 'nosniff')
        h('X-Frame-Options', 'DENY')
        h('Referrer-Policy', 'strict-origin-when-cross-origin')
        h('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
        if 'Content-Security-Policy' not in response:
            response['Content-Security-Policy-Report-Only'] = "default-src 'self'; img-src 'self' data:; media-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'"
        return response

### Request ID Middleware (Outline)
- Generate uuid4 at request start, set in request.META['REQUEST_ID'] and response header X-Request-ID.
- Logging Filter reads from record if present.

### Logging Filter Example
class RequestIDFilter(logging.Filter):
    def filter(self, record):
        record.request_id = getattr(record, 'request_id', '-')
        return True

Attach via LOGGING['filters'] and reference in handlers.

### Testing Priorities (Keep Fast)
- Avoid hitting external services.
- Use Django test client; no live server needed for these smoke tests.
- For websocket test mark skip if Channels test tools not readily configured.

### Rollback Safety
- Each major change in separate commit; revert by hash if regression discovered.

### Deferred (Log as TODO if not completed)
- Coverage thresholds
- Analytics retention task
- Deprecation header decorator
- Advanced CSP (non-report-only)
- DB index audit

---
## Quick Commands (Reference)
(Do NOT commit these inside code unless adding Makefile.)
- Install new deps: pip install django-storages python-json-logger django-celery-beat pytest pytest-django
- Freeze (if pattern used): pip freeze > requirements.txt (then manually prune if needed)
- Run tests: pytest -q
- Run server (dev): DJANGO_SETTINGS_MODULE=watchparty.settings.development python manage.py runserver
- Run server (prod-like local): python manage.py runserver

---
## Final Exit Review
Run the following manual checks before merging:
- python - <<'PY'\nimport importlib; [importlib.import_module(m) for m in ['storages','pythonjsonlogger','django_celery_beat']]; print('imports ok')\nPY
- curl -i http://localhost:8000/health/ (verify JSON & headers)
- Inspect one log line: contains request_id and JSON parse passes.
- pytest all pass (document test count & duration).

If all boxes checked, open PR titled: chore(backend): initial hardening sprint (config, security headers, health, tests)

---
Happy shipping. Focus on correctness first, then incremental enhancements.
