# AWS IAM Policy Fix for Secrets Manager Access

## Problem
The deployment is failing with this error:
```
User: arn:aws:sts::831250773267:assumed-role/AmazonLightsailInstanceRole/i-0017d49deb3d1ec62 
is not authorized to perform: secretsmanager:GetSecretValue on resource: all-in-one-credentials
```

## Solution
The IAM role attached to your Lightsail instance needs additional permissions for AWS Secrets Manager.

## Required IAM Policy

Add this policy to the IAM role `AmazonLightsailInstanceRole` (or create a new role and attach it):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:GetSecretValue",
                "secretsmanager:DescribeSecret",
                "secretsmanager:ListSecrets"
            ],
            "Resource": [
                "arn:aws:secretsmanager:eu-west-3:831250773267:secret:all-in-one-credentials*",
                "arn:aws:secretsmanager:eu-west-3:831250773267:secret:watch-party-valkey-001-auth-token*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "secretsmanager:ListSecrets"
            ],
            "Resource": "*"
        }
    ]
}
```

## How to Apply This Fix

### Option 1: AWS Console (Recommended)
1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Navigate to **Roles**
3. Find and click on `AmazonLightsailInstanceRole`
4. Click **Add permissions** → **Attach policies**
5. Click **Create policy**
6. Select **JSON** tab and paste the policy above
7. Click **Next: Tags** → **Next: Review**
8. Name it `WatchPartySecretsManagerAccess`
9. Click **Create policy**
10. Go back to the role and attach this new policy

### Option 2: AWS CLI
```bash
# Create the policy
aws iam create-policy \
    --policy-name WatchPartySecretsManagerAccess \
    --policy-document file://secrets-policy.json

# Attach it to the role
aws iam attach-role-policy \
    --role-name AmazonLightsailInstanceRole \
    --policy-arn arn:aws:iam::831250773267:policy/WatchPartySecretsManagerAccess
```

### Option 3: Terraform/CloudFormation
If you're using Infrastructure as Code, add the policy to your role definition.

## Verification
After applying the policy, test it by running:
```bash
aws secretsmanager get-secret-value --secret-id all-in-one-credentials --region eu-west-3
aws secretsmanager get-secret-value --secret-id watch-party-valkey-001-auth-token --region eu-west-3
```

## Alternative: Use GitHub Secrets
If you prefer not to use IAM roles, you can set these GitHub repository secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

The deployment workflow will use these instead of the IAM role.

## Required Secrets
Make sure these secrets exist in AWS Secrets Manager:
1. `all-in-one-credentials` - Contains database and other service credentials
2. `watch-party-valkey-001-auth-token` - Contains Redis/Valkey authentication token

## Security Notes
- The policy grants minimal permissions only to the specific secrets needed
- Use resource-based restrictions to limit access to only necessary secrets
- Consider using secret rotation for enhanced security