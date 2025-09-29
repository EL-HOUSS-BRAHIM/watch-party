# Quick Setup Guide - AWS Secrets Manager Access

## What Was Fixed

✅ **Sudo Password Issue**: Deploy user can now run commands without password prompts
✅ **AWS Secrets Manager Access**: Server can now fetch app configuration from AWS

## Next Steps to Complete Setup

### 1. Create AWS IAM User (Required)
```bash
# Create IAM user for Secrets Manager access
aws iam create-user --user-name watch-party-secrets-access

# Create and attach policy
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
            "Resource": "*"
        }
    ]
}
EOF

aws iam create-policy --policy-name WatchPartySecretsAccess --policy-document file://secrets-policy.json
aws iam attach-user-policy --user-name watch-party-secrets-access --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/WatchPartySecretsAccess

# Generate access keys
aws iam create-access-key --user-name watch-party-secrets-access
```

### 2. Add GitHub Repository Secrets
Go to: **Repository → Settings → Secrets and variables → Actions**

Add these secrets:
- `AWS_ACCESS_KEY_ID` = Your access key from step 1
- `AWS_SECRET_ACCESS_KEY` = Your secret key from step 1

### 3. Create Required Secrets in AWS Secrets Manager

Your app expects these secrets:

#### Secret: `all-in-one-credentials`
```bash
aws secretsmanager create-secret \
    --name all-in-one-credentials \
    --secret-string '{
        "database": {
            "url": "postgresql://user:pass@your-rds-host:5432/watchparty_prod",
            "password": "your-db-password"
        },
        "redis": {
            "url": "rediss://:your-redis-token@your-redis-host:6379/0",
            "password": "your-redis-auth-token"
        }
    }' \
    --region eu-west-3
```

#### Secret: `watch-party-valkey-001-auth-token`
```bash
aws secretsmanager create-secret \
    --name watch-party-valkey-001-auth-token \
    --secret-string 'your-redis-auth-token-here' \
    --region eu-west-3
```

### 4. Test Your Setup

Run the deployment workflow - it will now:
1. ✅ Install AWS CLI without password prompts
2. ✅ Configure AWS credentials from GitHub secrets  
3. ✅ Test Secrets Manager access
4. ✅ Your Django app can fetch secrets using `shared.aws.get_secret()`

### 5. Validate on Server (Optional)
After deployment, SSH to your server and run:
```bash
./validate-deployment-fixes.sh
```

## What the App Does Now

Your Django application will automatically:
- Connect to the database using credentials from `all-in-one-credentials` secret
- Connect to Redis using the auth token from `watch-party-valkey-001-auth-token` 
- No need to manually configure .env files - secrets are fetched at runtime

## Alternative: IAM Role (Advanced)
Instead of GitHub secrets, you can attach an IAM role to your server. See `AWS_SECRETS_SETUP.md` for details.

## Security Notes
- AWS credentials are only used during deployment to configure the server
- Server fetches secrets at runtime using the configured credentials
- Consider rotating access keys periodically