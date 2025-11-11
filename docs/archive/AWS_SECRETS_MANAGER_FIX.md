# AWS Secrets Manager Permission Fix

## Issue
The deployment is failing with the following error:
```
User: arn:aws:sts::831250773267:assumed-role/AmazonLightsailInstanceRole/i-0017d49deb3d1ec62 is not authorized to perform: secretsmanager:GetSecretValue
```

## Root Cause
The EC2 instance role (`AmazonLightsailInstanceRole`) doesn't have the necessary permissions to access AWS Secrets Manager.

## Solution

### Option 1: Update IAM Role Policy (Recommended)
Add the following policy to the `AmazonLightsailInstanceRole` role:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue",
                "secretsmanager:DescribeSecret"
            ],
            "Resource": [
                "arn:aws:secretsmanager:eu-west-3:831250773267:secret:all-in-one-credentials*",
                "arn:aws:secretsmanager:eu-west-3:831250773267:secret:watch-party-valkey-001-auth-token*"
            ]
        }
    ]
}
```

### Option 2: Create a Custom Policy
1. Go to AWS IAM Console
2. Create a new policy named `WatchPartySecretsAccess`:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue",
                "secretsmanager:DescribeSecret"
            ],
            "Resource": [
                "arn:aws:secretsmanager:eu-west-3:*:secret:all-in-one-credentials*",
                "arn:aws:secretsmanager:eu-west-3:*:secret:watch-party-*"
            ]
        }
    ]
}
```

3. Attach this policy to the `AmazonLightsailInstanceRole` role

### Option 3: Using AWS CLI
If you have AWS CLI access, run:

```bash
# Create the policy document
cat > secrets-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue",
                "secretsmanager:DescribeSecret"
            ],
            "Resource": [
                "arn:aws:secretsmanager:eu-west-3:831250773267:secret:all-in-one-credentials*",
                "arn:aws:secretsmanager:eu-west-3:831250773267:secret:watch-party-valkey-001-auth-token*"
            ]
        }
    ]
}
EOF

# Create the policy
aws iam create-policy \
    --policy-name WatchPartySecretsAccess \
    --policy-document file://secrets-policy.json

# Attach to the role
aws iam attach-role-policy \
    --role-name AmazonLightsailInstanceRole \
    --policy-arn arn:aws:iam::831250773267:policy/WatchPartySecretsAccess
```

## Verification
After applying the fix, test the connection:

```bash
# Test access to the secrets
aws secretsmanager get-secret-value --secret-id all-in-one-credentials --region eu-west-3
aws secretsmanager get-secret-value --secret-id watch-party-valkey-001-auth-token --region eu-west-3
```

## Alternative: Environment Variables
If you cannot modify IAM permissions, set these secrets as environment variables in GitHub Actions:

```yaml
env:
  AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
  AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  DATABASE_PASSWORD: ${{ secrets.DATABASE_PASSWORD }}
  REDIS_AUTH_TOKEN: ${{ secrets.REDIS_AUTH_TOKEN }}
```

Then modify the backend Django settings to use environment variables instead of AWS Secrets Manager for these specific values.