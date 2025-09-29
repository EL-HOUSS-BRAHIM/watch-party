# AWS Secrets Configuration Guide

This guide explains how to configure AWS access for your Watch Party deployment, addressing both server-side IAM roles and GitHub Actions AWS access.

## Current Architecture

The Watch Party application is designed to use **AWS IAM roles** rather than AWS access keys for security:

- **Server (Lightsail)**: Uses IAM role `MyAppRole` attached to the instance
- **GitHub Actions**: Currently uses SSH to deploy to server (no direct AWS access needed)

## Option 1: Server-Only AWS Access (Current Recommended Setup)

### What you need:
1. **IAM Role**: `MyAppRole` attached to your Lightsail instance
2. **GitHub Secrets**: Only SSH-related secrets for deployment

### Required GitHub Secrets:
```bash
# Server connection
LIGHTSAIL_HOST=your-server-ip-or-domain
LIGHTSAIL_SSH_KEY=your-private-ssh-key

# Application secrets (these get copied to server)
SECRET_KEY=your-django-secret-key
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=rediss://:token@host:6379/0
# ... other app secrets
```

### Setup Steps:
1. Ensure your Lightsail instance has the `MyAppRole` IAM role attached
2. The server can access AWS services (RDS, ElastiCache) using this role
3. GitHub Actions deploys via SSH - no AWS credentials needed

## Option 2: GitHub Actions + AWS Access (Advanced)

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