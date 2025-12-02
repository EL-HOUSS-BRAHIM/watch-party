# Pre-Deployment Checklist

Before using the new deployment workflows, complete these setup steps.

## ✅ Step 1: Verify GitHub Secrets

Navigate to: **Repository Settings > Secrets and variables > Actions**

### Required Secrets
- [ ] `AWS_ACCESS_KEY_ID` - Your AWS IAM access key
- [ ] `AWS_SECRET_ACCESS_KEY` - Your AWS IAM secret key  
- [ ] `LIGHTSAIL_HOST` - Should be: `35.181.208.71`
- [ ] `LIGHTSAIL_SSH_KEY` - Private SSH key for `deploy` user

### Optional Secrets (Fallback for SES SMTP)
- [ ] `SES_SMTP_USERNAME` - AWS SES SMTP username (fallback if Secrets Manager fails)
- [ ] `SES_SMTP_PASSWORD` - AWS SES SMTP password (fallback if Secrets Manager fails)

**Note**: SES credentials are primarily fetched from AWS Secrets Manager. GitHub secrets are only fallback.

## ✅ Step 2: Configure GitHub Actions Permissions

Navigate to: **Repository Settings > Actions > General > Workflow permissions**

- [ ] Select: **"Read and write permissions"**
- [ ] Check: **"Allow GitHub Actions to create and approve pull requests"**

This allows workflows to push images to GitHub Container Registry (GHCR).

## ✅ Step 3: Create GitHub Environments

Navigate to: **Repository Settings > Environments**

### Create Production Environment
1. Click "New environment"
2. Name: `production`
3. (Optional) Add protection rules:
   - [ ] Required reviewers
   - [ ] Wait timer
   - [ ] Deployment branches: Only `master`

### Create Staging Environment
1. Click "New environment"
2. Name: `staging`
3. No protection rules needed (for faster testing)

## ✅ Step 4: Setup Staging Database

SSH to Lightsail and run the setup script:

```bash
ssh deploy@35.181.208.71
cd ~/watch-party
git pull origin master
./scripts/setup-staging-database.sh
```

This creates the `watchparty_staging` database on your AWS RDS cluster.

**Verify**:
```bash
# Check if database exists
PGPASSWORD="..." psql -h all-in-one.cj6w0queklir.eu-west-3.rds.amazonaws.com \
  -U watchparty_admin -d watchparty_prod \
  -c "SELECT datname FROM pg_database WHERE datname='watchparty_staging';"
```

## ✅ Step 5: Create AWS Secrets (Optional but Recommended)

### SES SMTP Secret (for email notifications)
```bash
aws secretsmanager create-secret \
  --name watch-party/ses-smtp \
  --secret-string '{"username":"AKIAXXXXXXXXXXXXXXXX","password":"BXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"}' \
  --region eu-west-3
```

### Stripe Secrets (Environment-Specific)
```bash
# Production
aws secretsmanager create-secret \
  --name watch-party/production/stripe \
  --secret-string '{"secret_key":"sk_live_YOUR_STRIPE_LIVE_KEY_HERE"}' \
  --region eu-west-3

# Staging (use test key)
aws secretsmanager create-secret \
  --name watch-party/staging/stripe \
  --secret-string '{"secret_key":"sk_test_YOUR_STRIPE_TEST_KEY_HERE"}' \
  --region eu-west-3
```

### Google OAuth Secrets (Environment-Specific)
```bash
# Production
aws secretsmanager create-secret \
  --name watch-party/production/google-oauth \
  --secret-string '{"client_id":"XXXXXXXXXX.apps.googleusercontent.com","client_secret":"XXXXXXXXXXXXXX"}' \
  --region eu-west-3

# Staging
aws secretsmanager create-secret \
  --name watch-party/staging/google-oauth \
  --secret-string '{"client_id":"XXXXXXXXXX.apps.googleusercontent.com","client_secret":"XXXXXXXXXXXXXX"}' \
  --region eu-west-3
```

**Verify secrets**:
```bash
aws secretsmanager list-secrets --region eu-west-3 | grep watch-party
```

## ✅ Step 6: Configure DNS Records

Add these DNS records to your domain (`brahim-elhouss.me`):

### Staging Subdomains
- [ ] `staging-watch-party.brahim-elhouss.me` → `35.181.208.71` (A record)
- [ ] `staging-be-watch-party.brahim-elhouss.me` → `35.181.208.71` (A record)

**Test DNS propagation**:
```bash
dig staging-watch-party.brahim-elhouss.me +short
dig staging-be-watch-party.brahim-elhouss.me +short
# Both should return: 35.181.208.71
```

## ✅ Step 7: Update SSL Certificates (If Needed)

If using Cloudflare Origin Certificates, ensure they cover staging subdomains:

### Certificate SANs should include:
- [ ] `watch-party.brahim-elhouss.me`
- [ ] `be-watch-party.brahim-elhouss.me`
- [ ] `staging-watch-party.brahim-elhouss.me`
- [ ] `staging-be-watch-party.brahim-elhouss.me`
- [ ] `*.brahim-elhouss.me` (wildcard)

If not covered, generate new certificate from Cloudflare SSL/TLS > Origin Server.

## ✅ Step 8: Disable Old Deploy Workflow

To prevent accidental auto-deploys:

### Option A: Rename (Recommended)
```bash
cd .github/workflows
mv deploy.yml deploy.yml.old
git add deploy.yml.old
git commit -m "chore: disable old auto-deploy workflow"
git push origin master
```

### Option B: Delete
```bash
git rm .github/workflows/deploy.yml
git commit -m "chore: remove old auto-deploy workflow"
git push origin master
```

## ✅ Step 9: Test Staging Deployment

Run your first deployment to staging:

1. **Go to**: GitHub Actions tab
2. **Select**: "Deploy to Staging" workflow
3. **Click**: "Run workflow"
4. **Configure**:
   - Branch: `master`
   - Services: `all`
   - Force rebuild: `false`
5. **Click**: "Run workflow"
6. **Wait**: 8-12 minutes
7. **Check**: Email for deployment notification
8. **Visit**: https://staging-watch-party.brahim-elhouss.me

**Expected result**: Staging site loads successfully

## ✅ Step 10: Test Production Deployment

Once staging works, deploy to production:

1. **Go to**: GitHub Actions tab
2. **Select**: "Deploy to Production" workflow
3. **Click**: "Run workflow"
4. **Configure**:
   - Branch: `master`
   - Services: `all`
   - Force rebuild: `false`
5. **Click**: "Run workflow"
6. **Wait**: 8-12 minutes
7. **Check**: Email for deployment notification
8. **Visit**: https://watch-party.brahim-elhouss.me

**Expected result**: Production site loads successfully

## ✅ Step 11: Test Rollback (Optional)

Test the rollback functionality:

1. **Note current SHA**: `git log --oneline -1`
2. **Deploy again**: Make a small change and deploy
3. **Go to**: GitHub Actions > "Rollback Deployment"
4. **Configure**:
   - Environment: `production`
   - Version: (enter SHA from step 1)
5. **Click**: "Run workflow"
6. **Wait**: 5-8 minutes
7. **Check**: Site reverted to previous version

## ✅ Step 12: Verify Auto-Cleanup

Staging should auto-stop after 24h inactivity:

1. **Deploy to staging**: (if not already deployed)
2. **Wait 24+ hours**: Don't visit staging URLs
3. **Check email**: Should receive cleanup notification
4. **Verify stopped**: 
   ```bash
   ssh deploy@35.181.208.71
   docker ps --filter "name=staging"
   # Should show no running staging containers
   ```
5. **Restart staging**: Run "Deploy to Staging" workflow again

## 📝 Verification Checklist

After completing all steps, verify:

- [ ] Production deploys successfully
- [ ] Staging deploys successfully
- [ ] Email notifications received
- [ ] Health checks pass
- [ ] Rollback works correctly
- [ ] GHCR images visible (ghcr.io/el-houss-brahim/watch-party-backend)
- [ ] Old deploy workflow disabled
- [ ] Staging auto-cleanup scheduled (runs every 4 hours)

## 🚨 Troubleshooting

### GitHub Actions Fails with "Permission denied"
- Check workflow permissions: Settings > Actions > General
- Ensure "Read and write permissions" is selected

### GHCR Authentication Failed
- Verify `GITHUB_TOKEN` has package write access
- Check repository visibility (public or private with package access)

### Email Notifications Not Received
- Check spam folder
- Verify SES credentials in AWS Secrets Manager
- Check GitHub Actions logs for SMTP errors

### Staging Database Connection Failed
- Verify database was created: Run `setup-staging-database.sh`
- Check RDS security group allows Lightsail IP
- Verify credentials in `.env` file

### DNS Not Resolving
- Wait for DNS propagation (up to 48 hours)
- Check DNS records in domain registrar
- Use `dig` or `nslookup` to verify

### SSL Certificate Errors
- Verify certificate covers staging subdomains
- Check Nginx SSL configuration in `/etc/nginx/ssl/`
- Ensure Cloudflare proxy status is correct

## 📞 Support

If issues persist:
1. Check GitHub Actions logs
2. Review email notifications
3. SSH to Lightsail for direct container access
4. Run health checks: `bash scripts/deployment/health-check.sh`
5. Check deployment guide: `docs/ENHANCED_DEPLOYMENT_GUIDE.md`

---

**Checklist Completed**: _____ / 12 steps

**Ready for Production**: [ ] Yes [ ] No

**Date Completed**: ________________

**Deployed By**: bross.or.of.1@gmail.com
