# GitHub Actions Workflows

This directory contains all CI/CD workflows for the Watch Party project.

## Workflows

### 🚀 Deployment Workflows

#### 1. Deploy to Production (`deploy-production.yml`)
- **Trigger**: Manual (`workflow_dispatch`)
- **Branch**: `master` only
- **Duration**: 8-12 minutes (with cache)
- **Features**:
  - GHCR caching for fast builds
  - Selective service deployment (all/backend/frontend/nginx)
  - Health checks with exponential backoff
  - Email notifications on success/failure
  - Automatic old image cleanup

#### 2. Deploy to Staging (`deploy-staging.yml`)
- **Trigger**: Manual (`workflow_dispatch`)
- **Branch**: Any branch
- **Duration**: 8-12 minutes (with cache)
- **Features**:
  - Same as production
  - Separate staging environment
  - Activity logging for auto-cleanup
  - Staging-specific configuration

#### 3. Rollback Deployment (`rollback.yml`)
- **Trigger**: Manual (`workflow_dispatch`)
- **Duration**: 5-8 minutes
- **Features**:
  - Lists last 10 available versions
  - Rollback to any previous version by SHA
  - Environment-aware (production/staging)
  - Health checks after rollback
  - Email confirmation

#### 4. Staging Auto-Cleanup (`staging-cleanup.yml`)
- **Trigger**: Scheduled (every 4 hours) or Manual
- **Duration**: 2-5 minutes
- **Features**:
  - Checks for 24h inactivity
  - Stops staging containers when idle
  - Email notification on cleanup
  - Force cleanup option

### 📦 Old/Additional Workflows

#### Deploy to Lightsail (`deploy.yml.old`)
- **Status**: ⚠️ Disabled (renamed to .old)
- **Issue**: Auto-deploys on every push to master
- **Migration**: Use `deploy-production.yml` and `deploy-staging.yml` instead

#### Destroy Lightsail Deployment (`destroy.yml`)
- **Status**: ✅ Active (infrastructure teardown)
- **Trigger**: Manual only (requires "destroy" confirmation)
- **Purpose**: Complete infrastructure cleanup when needed

## Usage

### Deploy to Production
```
1. Go to GitHub Actions tab
2. Select "Deploy to Production"
3. Click "Run workflow"
4. Select branch: master
5. Choose services: all (or specific)
6. Click "Run workflow"
```

### Deploy to Staging
```
1. Go to GitHub Actions tab
2. Select "Deploy to Staging"
3. Click "Run workflow"
4. Select your feature branch
5. Choose services: all (or specific)
6. Click "Run workflow"
```

### Rollback
```
1. Go to GitHub Actions tab
2. Select "Rollback Deployment"
3. Click "Run workflow"
4. Select environment: production/staging
5. Enter version SHA (or "latest")
6. Click "Run workflow"
```

## Required Secrets

Configure these in repository settings (Settings > Secrets and variables > Actions):

- `AWS_ACCESS_KEY_ID` - AWS IAM access key
- `AWS_SECRET_ACCESS_KEY` - AWS IAM secret key
- `LIGHTSAIL_HOST` - Lightsail instance IP (35.181.208.71)
- `LIGHTSAIL_SSH_KEY` - SSH private key for deploy user
- `SES_SMTP_USERNAME` - AWS SES SMTP username (fallback)
- `SES_SMTP_PASSWORD` - AWS SES SMTP password (fallback)

**Note**: `GITHUB_TOKEN` is automatically provided by GitHub Actions.

## Workflow Outputs

### Email Notifications
All workflows send email notifications to `bross.or.of.1@gmail.com`:
- ✅ Deployment success (with links and details)
- ❌ Deployment failure (with logs link)
- 🧹 Staging cleanup (with reason)
- 🔄 Rollback confirmation

### GitHub Actions Logs
- Detailed step-by-step execution
- Build output and timings
- Health check results
- Container logs on failure

## GHCR Images

Images are stored in GitHub Container Registry:
- `ghcr.io/el-houss-brahim/watch-party-backend:production-{sha}`
- `ghcr.io/el-houss-brahim/watch-party-backend:production-latest`
- `ghcr.io/el-houss-brahim/watch-party-frontend:production-{sha}`
- `ghcr.io/el-houss-brahim/watch-party-frontend:production-latest`
- `ghcr.io/el-houss-brahim/watch-party-backend:staging-{sha}`
- `ghcr.io/el-houss-brahim/watch-party-backend:staging-latest`
- `ghcr.io/el-houss-brahim/watch-party-frontend:staging-{sha}`
- `ghcr.io/el-houss-brahim/watch-party-frontend:staging-latest`

**Retention**: Last 10 versions per environment (automatic cleanup)

## Troubleshooting

### Authentication Errors
- Verify GitHub token has package write permissions
- Check: Repository Settings > Actions > General > Workflow permissions
- Select: "Read and write permissions"

### Build Failures
- Check Docker Buildx availability
- Verify GHCR connectivity
- Review build logs in GitHub Actions

### Deployment Failures
- Check health check logs
- SSH to Lightsail for container logs
- Review email notification for details

## Performance

| Workflow | Duration | Cache | Notes |
|----------|----------|-------|-------|
| Production Deploy | 8-12 min | Yes | With GHCR cache |
| Staging Deploy | 8-12 min | Yes | With GHCR cache |
| Force Rebuild | 12-18 min | No | Clean build |
| Rollback | 5-8 min | N/A | Just deploys |
| Cleanup | 2-5 min | N/A | Quick check |

## Best Practices

1. **Test on staging first**: Deploy to staging before production
2. **Use selective deploys**: Deploy only changed services
3. **Monitor emails**: Check deployment status in email
4. **Keep staging clean**: Let auto-cleanup handle idle staging
5. **Rollback quickly**: Use rollback workflow if issues arise

## Migration Guide

If migrating from old `deploy.yml`:

1. **Disable old workflow**: Rename or delete `deploy.yml`
2. **Setup secrets**: Verify all required secrets are configured
3. **Test staging**: Run first deployment to staging
4. **Test production**: Deploy to production when ready
5. **Update team**: Notify team about manual deployment process

---

For detailed documentation, see:
- [Enhanced Deployment Guide](../docs/ENHANCED_DEPLOYMENT_GUIDE.md)
- [Implementation Summary](../docs/DEPLOYMENT_IMPLEMENTATION_SUMMARY.md)
