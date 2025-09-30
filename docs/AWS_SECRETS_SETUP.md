# AWS Secrets Configuration Guide

This guide explains how to configure AWS access for your Watch Party deployment. The application uses **AWS Secrets Manager** to fetch configuration like database passwords and Redis tokens.

## Why AWS Access is Required

Your Watch Party application code fetches secrets from AWS Secrets Manager:
- `all-in-one-credentials` - Bundled database/Redis credentials  
- `watch-party-valkey-001-auth-token` - Redis authentication token

The server needs AWS API access to call `secretsmanager.get_secret_value()`.

## Option 1: GitHub Actions Secrets (Recommended)

This approach stores AWS credentials in GitHub repository secrets and configures them on the server during deployment.

### Setup Steps:

#### Step 1: Create AWS IAM User with Secrets Manager Access
```bash
# Create IAM user for the application
aws iam create-user --user-name watch-party-secrets-access

# Create policy for Secrets Manager access
cat > secrets-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue",
                "secretsmanager:ListSecrets"
            ],
            "Resource": [
                "arn:aws:secretsmanager:eu-west-3:*:secret:all-in-one-credentials*",
                "arn:aws:secretsmanager:eu-west-3:*:secret:watch-party-valkey-001-auth-token*"
            ]
        }
    ]
}
EOF

# Apply policy to user
aws iam create-policy --policy-name WatchPartySecretsAccess --policy-document file://secrets-policy.json
aws iam attach-user-policy --user-name watch-party-secrets-access --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/WatchPartySecretsAccess

# Create access keys
aws iam create-access-key --user-name watch-party-secrets-access
```

#### Step 2: Add GitHub Repository Secrets
Go to your repository → Settings → Secrets and variables → Actions

Add these secrets:
```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

#### Step 3: Deploy
The deployment workflow will now:
1. Configure AWS credentials on the server using the GitHub secrets
2. Test Secrets Manager access
3. Your Django app can fetch secrets using the `shared.aws.get_secret()` function

## Option 2: Server IAM Role (Alternative)

Attach an IAM role to your Lightsail instance with Secrets Manager permissions.

### Required Policy:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue",
                "secretsmanager:ListSecrets"
            ],
            "Resource": [
                "arn:aws:secretsmanager:eu-west-3:*:secret:all-in-one-credentials*",
                "arn:aws:secretsmanager:eu-west-3:*:secret:watch-party-valkey-001-auth-token*"
            ]
        }
    ]
}
```

## Security Considerations

**GitHub Secrets Approach:**
- ✅ Centralized credential management
- ✅ Easy rotation via GitHub UI
- ✅ Works with any hosting provider
- ⚠️ Credentials transmitted during deployment

**IAM Role Approach:**
- ✅ No credential transmission
- ✅ AWS native security model
- ⚠️ Tied to specific AWS instance
- ⚠️ Harder to manage across environments

## Required AWS Secrets in Secrets Manager

Your application expects these secrets to exist:

### `all-in-one-credentials`
JSON containing database and Redis configuration:
```json
{
  "database": {
    "url": "postgresql://user:pass@host:5432/db",
    "password": "your-db-password"
  },
  "redis": {
    "url": "rediss://:token@host:6379/0",
    "password": "your-redis-token"
  }
}
```

### `watch-party-valkey-001-auth-token`
Redis authentication token as a string.

## Troubleshooting

### "Unable to retrieve secret" errors:
1. Check AWS credentials are configured: `aws sts get-caller-identity`
2. Verify Secrets Manager access: `aws secretsmanager list-secrets --region eu-west-3`
3. Ensure secrets exist with correct names
4. Check IAM permissions include your specific secret ARNs

### During deployment:
- Workflow will test AWS connectivity and Secrets Manager access
- Check deployment logs for AWS configuration status
- Use the validation script: `./validate-deployment-fixes.sh`

### When you might need this:
- Fetching secrets from AWS Secrets Manager during deployment
- Managing AWS infrastructure from GitHub Actions
- Deploying to multiple environments
- Running AWS CLI commands in workflows

### Setup AWS OIDC for GitHub Actions:

#### Step 1: Create IAM Role for GitHub Actions
```bash
# Create trust policy for GitHub OIDC
cat > github-actions-trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:EL-HOUSS-BRAHIM/watch-party:ref:refs/heads/master"
        }
      }
    }
  ]
}
EOF

# Create the role
aws iam create-role \
  --role-name GitHubActionsWatchParty \
  --assume-role-policy-document file://github-actions-trust-policy.json

# Attach policies (adjust permissions as needed)
aws iam attach-role-policy \
  --role-name GitHubActionsWatchParty \
  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess

# For secrets management:
aws iam attach-role-policy \
  --role-name GitHubActionsWatchParty \
  --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite
```

#### Step 2: Setup OIDC Provider (if not exists)
```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
  --client-id-list sts.amazonaws.com
```

#### Step 3: Add GitHub Secrets
```bash
# Add this to your GitHub repository secrets
AWS_ROLE_ARN=arn:aws:iam::YOUR_ACCOUNT_ID:role/GitHubActionsWatchParty
AWS_REGION=eu-west-3
```

#### Step 4: Use in Workflow
See the example in `.github/workflows/setup-aws-oidc.yml`

## Recommended Approach

### For most users: **Option 1** (Server-Only)
- Simpler setup
- More secure (no AWS credentials in GitHub)
- Server handles all AWS operations
- GitHub Actions only deploys via SSH

### For advanced users: **Option 2** (GitHub Actions + AWS)
- More complex but more flexible
- Can manage infrastructure from CI/CD
- Can fetch secrets dynamically
- Requires careful permission management

## Security Notes

1. **Never put AWS access keys in GitHub secrets** - use IAM roles instead
2. **Principle of least privilege** - only grant necessary permissions
3. **Use separate roles** for different environments (dev, staging, prod)
4. **Rotate credentials regularly** if you must use access keys
5. **Monitor access** with CloudTrail

## Troubleshooting

### Server can't access AWS services:
1. Check IAM role is attached: `aws sts get-caller-identity`
2. Verify role permissions in AWS Console
3. Check security groups allow traffic

### GitHub Actions can't assume role:
1. Verify OIDC provider exists
2. Check role trust policy allows your repository
3. Ensure workflow has `id-token: write` permission
4. Verify role ARN is correct in secrets

## Current Status

Your deployment currently uses **Option 1** - server-only AWS access via IAM roles. This is the recommended setup unless you have specific needs for GitHub Actions to access AWS services directly.

The deployment workflow failure was due to sudo password requirements, not AWS credentials. This has been fixed by configuring passwordless sudo for the deploy user.