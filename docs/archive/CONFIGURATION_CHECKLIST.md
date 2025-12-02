# Configuration Checklist

Quick reference checklist for verifying Watch Party project configurations.

## Quick Validation

Run the comprehensive validation script:
```bash
bash scripts/tests/validate-configuration.sh
```

Expected: All 38 tests should pass ✅

## Manual Checklist

### Docker Compose Files

- [ ] **docker-compose.yml** (Production)
  - [ ] Frontend build args include NEXT_PUBLIC_API_URL
  - [ ] Frontend build args include NEXT_PUBLIC_FRONTEND_API
  - [ ] Frontend build args include NEXT_PUBLIC_WS_URL
  - [ ] Frontend environment includes BACKEND_URL
  - [ ] Backend uses external AWS RDS and ElastiCache

- [ ] **docker-compose.aws.yml** (AWS Production)
  - [ ] Frontend build args include all NEXT_PUBLIC_* variables
  - [ ] Same as docker-compose.yml for production values

- [ ] **docker-compose.dev.yml** (Local Development)
  - [ ] Frontend build args section exists
  - [ ] Frontend build args include NEXT_PUBLIC_API_URL (localhost:8000)
  - [ ] Backend uses local PostgreSQL container
  - [ ] Backend uses local Redis/Valkey container

### Environment Files

- [ ] **backend/.env.example**
  - [ ] DEBUG=False (production default)
  - [ ] DJANGO_SETTINGS_MODULE=config.settings.production
  - [ ] Includes AWS RDS database URL
  - [ ] Includes AWS ElastiCache Redis URL
  - [ ] Has helpful comments about dev vs prod
  - [ ] All required variables documented

- [ ] **frontend/.env.example**
  - [ ] BACKEND_URL documented
  - [ ] NEXT_PUBLIC_API_URL documented
  - [ ] NEXT_PUBLIC_WS_URL documented
  - [ ] NEXT_PUBLIC_FRONTEND_API documented
  - [ ] Feature flags documented

### Dockerfiles

- [ ] **frontend/Dockerfile**
  - [ ] ARG NEXT_PUBLIC_API_URL declared
  - [ ] ARG NEXT_PUBLIC_FRONTEND_API declared
  - [ ] ARG NEXT_PUBLIC_WS_URL declared
  - [ ] ARGs converted to ENVs
  - [ ] Build stage has proper memory settings

- [ ] **backend/Dockerfile**
  - [ ] Exists and is properly configured
  - [ ] Handles SKIP_AWS_DURING_BUILD

### Deployment Scripts

- [ ] **deploy-main.sh**
  - [ ] Calls all required deployment scripts
  - [ ] Exports APP_DIR variable
  - [ ] Error handling in place

- [ ] **setup-aws-environment.sh**
  - [ ] Creates backend/.env with production settings
  - [ ] Creates frontend/.env.local with production URLs
  - [ ] Sets DEBUG=False
  - [ ] Uses config.settings.production

- [ ] **build-docker-images.sh**
  - [ ] Passes NEXT_PUBLIC_API_URL as build arg
  - [ ] Passes NEXT_PUBLIC_FRONTEND_API as build arg
  - [ ] Passes NEXT_PUBLIC_WS_URL as build arg
  - [ ] URLs match docker-compose.yml

### GitHub Actions Workflow

- [ ] **.github/workflows/deploy.yml**
  - [ ] Calls scripts/deployment/deploy-main.sh
  - [ ] Passes AWS_ACCESS_KEY_ID secret
  - [ ] Passes AWS_SECRET_ACCESS_KEY secret
  - [ ] Passes SSL_ORIGIN secret
  - [ ] Passes SSL_PRIVATE secret
  - [ ] Exports required environment variables

### Security

- [ ] **.gitignore**
  - [ ] Excludes .env files
  - [ ] Excludes .env.local files

- [ ] **Repository**
  - [ ] No .env files committed (except .env.example)
  - [ ] No secrets in code
  - [ ] Production secrets in GitHub Secrets

### URL Consistency

Verify all production URLs are consistent:
- [ ] docker-compose.yml: `https://be-watch-party.brahim-elhouss.me`
- [ ] docker-compose.aws.yml: `https://be-watch-party.brahim-elhouss.me`
- [ ] build-docker-images.sh: `https://be-watch-party.brahim-elhouss.me`
- [ ] setup-aws-environment.sh: `https://be-watch-party.brahim-elhouss.me`

## Common Issues and Fixes

### Issue: Frontend can't connect to backend
**Check**: Are NEXT_PUBLIC_* variables passed as build args?
```bash
grep -A 15 "context: ./frontend" docker-compose.yml | grep NEXT_PUBLIC
```

### Issue: Backend using development settings
**Check**: Does backend/.env have production settings?
```bash
grep "^DEBUG\|^DJANGO_SETTINGS_MODULE" backend/.env
```

### Issue: Build fails with environment variable errors
**Check**: Are build args declared in Dockerfile?
```bash
grep "^ARG" frontend/Dockerfile
```

## Quick Fixes

### Rebuild frontend with correct settings:
```bash
docker-compose build --no-cache frontend
```

### Recreate environment files:
```bash
bash scripts/deployment/setup-aws-environment.sh
```

### Verify deployment scripts:
```bash
bash scripts/deployment/deploy-main.sh --dry-run
```

## Documentation

For detailed information, see:
- `docs/CONFIGURATION_REVIEW_SUMMARY.md` - Comprehensive review and fixes
- `scripts/deployment/README.md` - Deployment scripts documentation
- `docs/BACKEND_URL_BUILD_TIME_FIX.md` - Build-time variable fix details

## Testing

Run the validation script regularly:
```bash
# From repository root
bash scripts/tests/validate-configuration.sh

# Expected output: 38/38 tests passed
```

---

**Last Updated**: October 12, 2025  
**Validation**: All checks passing ✅
