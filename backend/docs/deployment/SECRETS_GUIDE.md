# Secrets & Environment Configuration Guide

> Last Updated: 2025-08-12
> Scope: Watch Party Backend (Production, Staging, CI, Local)

## 1. Principles
- **Never commit real secrets** to git (.env contains placeholders only)
- **Source of truth**: AWS Secrets Manager / SSM Parameter Store
- **CI usage**: GitHub Actions environment/repository secrets (or OIDC + AWS IAM
  policies)
- **Rotation**: Automate or schedule (minimum every 90 days for high-value creds)
- **Least privilege**: Credentials scoped to only required resources

## 2. Secrets Inventory (Minimal Set)
| Category | Variable | Description | Storage | Required |
|----------|----------|-------------|---------|----------|
| Django | SECRET_KEY | Django cryptographic key | Secrets Manager | Yes |
| App | ALLOWED_HOSTS | Comma list of domains | GitHub (non-secret) / SSM | Yes |
| App | CSRF_TRUSTED_ORIGINS | Comma list of origins | GitHub / SSM | Yes |
| Database | DATABASE_URL or (DB_* parts) | PostgreSQL connection | Secrets Manager | Yes |
| Cache | REDIS_URL | Redis / Valkey URL | Secrets Manager | Yes |
| Celery | CELERY_BROKER_URL | Broker (Redis) | Secrets Manager | Yes |
| Celery | CELERY_RESULT_BACKEND | Results backend | Secrets Manager | Yes |
| Channels | CHANNEL_LAYERS_CONFIG_HOSTS | Redis layer URL | Secrets Manager | Yes |
| Email | EMAIL_HOST, EMAIL_PORT, EMAIL_HOST_USER, EMAIL_HOST_PASSWORD, DEFAULT_FROM_EMAIL | SMTP | Secrets Manager / SSM | Optional |
| Monitoring | SENTRY_DSN | Sentry DSN | Secrets Manager / GitHub | Optional |
| Storage | AWS_STORAGE_BUCKET_NAME | S3 media (if enabled) | IAM role (MyAppRole) | Optional |
| Social / APIs | GOOGLE_OAUTH2_CLIENT_ID, GOOGLE_OAUTH2_CLIENT_SECRET, YOUTUBE_API_KEY, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET | Third party APIs | Secrets Manager | As used |
| Security | RATE_LIMIT_* (if dynamic), any API tokens | Runtime config | SSM | Optional |
| Deployment | SSH_PRIVATE_KEY | SSH to server (only if push model) | GitHub Secrets | Yes (if used) |
| Deployment | SERVER_HOST, SERVER_USER, PROJECT_DIR | Target deployment metadata | GitHub (non-secret except host sometimes) | Yes |

## 3. Storage Strategy Matrix
| Secret Type | Primary Store | CI Access | Runtime Access |
|-------------|---------------|-----------|----------------|
| High value (DB, Redis, SECRET_KEY) | AWS Secrets Manager | GitHub OIDC->STS or direct secret mirror | App loads via injected env or fetch-secrets script |
| Medium (API keys) | Secrets Manager | Same as above | Same |
| Low / Non-secret config (domains) | GitHub / .env template / SSM | Direct | .env |

## 4. AWS Secrets Manager Layout
Recommended single JSON secret (example key: `watchparty/production/core`):
```json
{
  "SECRET_KEY": "...",
  "DATABASE_URL": "postgresql://...",
  "REDIS_URL": "rediss://...",
  "CELERY_BROKER_URL": "rediss://...",
  "CELERY_RESULT_BACKEND": "rediss://...",
  "CHANNEL_LAYERS_CONFIG_HOSTS": "rediss://...",
  "SENTRY_DSN": "https://...",
  "DEFAULT_FROM_EMAIL": "noreply@example.com"
}
```
Additional secrets (API keys) can live in `watchparty/production/integrations`.

### Standard Secret Names

- `all-in-one-credentials` – contains database connection details and related service URLs.
- `watch-party-valkey-001-auth-token` – stores the Valkey/Redis authentication token when one is required.

### Naming Convention
```
watchparty/<environment>/<group>
# e.g.
watchparty/production/core
watchparty/production/integrations
watchparty/staging/core
```

## 5. AWS SSM Parameter Store (Optional Granular Keys)
Use path style:
```
/WatchParty/production/DB/URL
/WatchParty/production/Redis/URL
/WatchParty/production/App/SECRET_KEY
```
Use `String` or `SecureString` (KMS default) depending on sensitivity.

## 6. Granting Access (Recommended: GitHub OIDC + IAM Role)
1. Create IAM role with trust policy for GitHub OIDC provider (aud: sts.amazonaws.com, repo: owner/repo).
2. Attach policy allowing `secretsmanager:GetSecretValue` for required ARNs and/or `ssm:GetParametersByPath`.
3. In workflow, configure role via `aws-actions/configure-aws-credentials` (not yet added; add if migrating from mirrored secrets).
4. Remove raw AWS access keys from GitHub Secrets after validating role-based access.

## 7. GitHub Actions Secrets
Add (Settings → Secrets and variables → Actions):
```
SSH_PRIVATE_KEY
SERVER_HOST
SERVER_USER
PROJECT_DIR
SECRET_KEY (if not using runtime fetch)
DATABASE_URL
REDIS_URL
CELERY_BROKER_URL
CELERY_RESULT_BACKEND
CHANNEL_LAYERS_CONFIG_HOSTS
ALLOWED_HOSTS
CSRF_TRUSTED_ORIGINS
DEFAULT_FROM_EMAIL
SENTRY_DSN (optional)
```
Add any integration keys actually used.

## 8. Local Development `.env` Template
Provide `.env.example` (no real values):
```
DEBUG=True
SECRET_KEY=change_me_dev_only
DJANGO_SETTINGS_MODULE=watchparty.settings.development
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=http://localhost:8000
```
Developer copies: `cp .env.example .env`.

## 9. Fetching Secrets at Runtime
Script added: `scripts/env-validator.sh` command:
```
./scripts/env-validator.sh fetch-secrets production \
  AWS_SECRETS_MANAGER_SECRET_ID=watchparty/production/core \
  AWS_SSM_PARAM_PATH=/WatchParty/production
```
(Provide env vars inline or export before running.)

## 10. Rotation Workflow (Example)
1. Generate new value (e.g., DB password) in RDS console.
2. Update Secrets Manager JSON (new `DATABASE_URL`).
3. Deploy (workflow picks new secret or run fetch on servers).
4. Invalidate old credentials after validation.
5. Log rotation in CHANGELOG / audit log.

## 11. Verification Checklist
- [ ] `git grep` shows no real secrets
- [ ] `.env` only has placeholders where sensitive values appear
- [ ] AWS IAM role restricted to specific secret ARNs
- [ ] CI deployment succeeds without static AWS keys (OIDC path) or keys rotated < 90 days
- [ ] Production host returns 200 on `/health/`
- [ ] Revoking a secret denies access within expected TTL

## 12. Incident Response (Secret Leak)
1. Revoke/rotate leaked credential immediately.
2. Purge caches (Redis / CDN) if affected.
3. Invalidate sessions if SECRET_KEY leaked (force logout).
4. Rotate dependent secrets (chain-of-trust) as needed.
5. Post-mortem: cause, blast radius, improvements.

## 13. Common Mistakes
| Issue | Impact | Fix |
|-------|--------|-----|
| Committing real `.env` | Credential exposure | Add to `.gitignore`, rotate secrets |
| Using same SECRET_KEY across envs | Weak isolation | Unique per environment |
| Hard-coding DB password in workflow | Audit risk | Use Secrets Manager or GH secret |
| Over-broad IAM policy (`secretsmanager:*`) | Lateral movement | Scope to ARNs |
| Forgetting to chmod 600 .env | Potential read by other users | Enforce permission in deploy script |

## 14. Future Enhancements
- Automatic secret sync lambda (Secrets Manager -> SSM mirror)
- Encrypted `.env.enc` with KMS + decrypt on provision
- Integrate HashiCorp Vault if multi-cloud
- Add secret expiry alerts (CloudWatch Event + SNS)

## 15. Quick Actions
| Task | Command |
|------|---------|
| Validate env | `./scripts/env-validator.sh validate production` |
| Fetch secrets | `AWS_SECRETS_MANAGER_SECRET_ID=watchparty/production/core ./scripts/env-validator.sh fetch-secrets production` |
| List secret (manual) | `aws secretsmanager get-secret-value --secret-id watchparty/production/core` |
| List SSM params | `aws ssm get-parameters-by-path --with-decryption --path /WatchParty/production` |

---
Security contact: (define internal contact / email)
Audit log location: (define)
