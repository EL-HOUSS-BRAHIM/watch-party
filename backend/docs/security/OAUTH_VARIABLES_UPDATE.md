# OAuth Variables Update

## Overview

The GitHub secrets and environment variable naming has been standardized across all scripts and workflows to ensure consistency.

## Changes Made

### Variable Name Changes

| Old Variable Name | New Variable Name |
|------------------|-------------------|
| `GOOGLE_OAUTH2_KEY` | `GOOGLE_OAUTH_CLIENT_ID` |
| `GOOGLE_OAUTH2_SECRET` | `GOOGLE_OAUTH_CLIENT_SECRET` |
| `GITHUB_CLIENT_ID` | `GITHUB_OAUTH_CLIENT_ID` |
| `GITHUB_CLIENT_SECRET` | `GITHUB_OAUTH_CLIENT_SECRET` |

## Files Updated

1. **scripts/set-github-secrets.sh**
   - Updated `DEPLOYMENT_SECRETS` array to use new variable names
   - Updated optional secrets list in `check_missing_deployment_secrets()`

2. **github-secrets-template.txt**
   - Updated OAuth section to use new variable names

3. **.github/workflows/deploy.yml**
   - Updated environment variables section
   - Updated .env file generation section

4. **scripts/github-actions-setup.sh**
   - Updated OAuth section in template

5. **scripts/env-validator.sh**
   - Updated optional variables list
   - Updated template comments

6. **scripts/environment.sh**
   - Updated OAuth section in template

## Required Actions

### 1. Update GitHub Repository Secrets

If you have existing GitHub repository secrets with the old names, you need to update them:

1. Go to your repository's Settings > Secrets and variables > Actions
2. Delete old secrets (if they exist):
   - `GOOGLE_OAUTH2_KEY`
   - `GOOGLE_OAUTH2_SECRET`
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
3. Add new secrets:
   - `GOOGLE_OAUTH_CLIENT_ID`
   - `GOOGLE_OAUTH_CLIENT_SECRET`
   - `GITHUB_OAUTH_CLIENT_ID`
   - `GITHUB_OAUTH_CLIENT_SECRET`

### 2. Update Local Environment Files

If you have local `.env` files with the old variable names, update them to use the new names.

### 3. Use Updated Scripts

Use the updated scripts to set your GitHub secrets:

```bash
# Check current secrets status
./scripts/set-github-secrets.sh --check

# Set secrets from .env file
./scripts/set-github-secrets.sh --set .env

# Or use individual commands to set specific secrets
gh secret set GOOGLE_OAUTH_CLIENT_ID --body "your-google-client-id"
gh secret set GOOGLE_OAUTH_CLIENT_SECRET --body "your-google-client-secret"
gh secret set GITHUB_OAUTH_CLIENT_ID --body "your-github-client-id"
gh secret set GITHUB_OAUTH_CLIENT_SECRET --body "your-github-client-secret"
```

## Migration Script

A migration script has been created to help transition from old to new variable names. See `scripts/migrate-oauth-variables.sh`.

## Compatibility

The deployment scripts and workflows now expect the new variable names. Make sure to update your GitHub secrets before running any deployments.

## Support

If you encounter any issues with the variable name changes, please:

1. Check that all GitHub secrets use the new variable names
2. Verify that your `.env` files use the new variable names
3. Run `./scripts/set-github-secrets.sh --check` to validate your setup
