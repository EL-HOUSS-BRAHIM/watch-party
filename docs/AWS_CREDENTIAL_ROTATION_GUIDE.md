# AWS Credential Rotation System

## Overview

The Watch Party backend now includes **automatic AWS credential rotation** that fetches and refreshes database and Redis credentials from AWS Secrets Manager every 30 minutes. This eliminates the need for manual credential updates when AWS rotates passwords.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Django Application                          │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  AWS Credential Rotation Service                       │   │
│  │  (shared/aws_credential_rotation.py)                   │   │
│  │                                                         │   │
│  │  • Runs in background thread                           │   │
│  │  • Fetches credentials every 30 minutes                │   │
│  │  • Thread-safe caching                                 │   │
│  │  • Automatic retry on failure                          │   │
│  └────────────────────────────────────────────────────────┘   │
│           │                                │                   │
│           ▼                                ▼                   │
│  ┌──────────────────┐          ┌──────────────────┐          │
│  │  RDS Credentials  │          │ Valkey/Redis Auth │          │
│  │  (Postgres DB)    │          │      Token        │          │
│  └──────────────────┘          └──────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼
        ┌──────────────────────────────┐
        │   AWS Secrets Manager         │
        │                               │
        │  • rds!db-44fd826c...         │
        │  • watch-party-valkey-001...  │
        └──────────────────────────────┘
```

## Configuration

### Environment Variables

Add to `backend/.env`:

```bash
# AWS Credential Rotation (every 30 minutes)
AWS_CREDENTIAL_ROTATION_MINUTES=30
AWS_DEFAULT_REGION=eu-west-3

# Optional: Disable rotation for local development
# DISABLE_CREDENTIAL_ROTATION=1
```

### How It Works

1. **Startup**: When Django starts, the credential rotation service initializes
2. **Initial Fetch**: Credentials are fetched immediately from AWS Secrets Manager
3. **Background Loop**: A daemon thread runs in the background
4. **Periodic Rotation**: Every 30 minutes, credentials are refreshed
5. **Caching**: Credentials are cached in memory for fast access
6. **Fallback**: If rotation fails, cached credentials continue to work

## AWS Secrets Manager Setup

### Required Secrets

1. **RDS Database Credentials**
   - Secret Name: `rds!db-44fd826c-d576-4afd-8bf3-38f59d5cd4ae`
   - Format: JSON
   ```json
   {
     "username": "watchparty_admin",
     "password": "rotating-password",
     "host": "all-in-one.cj6w0queklir.eu-west-3.rds.amazonaws.com",
     "port": 5432,
     "dbname": "watchparty_prod"
   }
   ```

2. **Valkey/Redis Auth Token**
   - Secret Name: `watch-party-valkey-001-auth-token`
   - Format: JSON
   ```json
   {
     "auth_token": "rotating-token"
   }
   ```

### Rotation Configuration (AWS Console)

1. Go to AWS Secrets Manager
2. Select the secret
3. Enable "Automatic rotation"
4. Set rotation schedule: **30 minutes** (1800 seconds)
5. Select rotation Lambda: Use AWS-managed Lambda for RDS

## IAM Permissions

The application's IAM role needs these permissions:

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
        "arn:aws:secretsmanager:eu-west-3:*:secret:rds!db-*",
        "arn:aws:secretsmanager:eu-west-3:*:secret:watch-party-valkey-*"
      ]
    }
  ]
}
```

## Testing

### Test Credential Rotation

```bash
cd backend
python manage.py shell
```

```python
from shared.aws_credential_rotation import get_credential_service

# Get service instance
service = get_credential_service()

# Check status
print(service.get_status())
# Output:
# {
#   'running': True,
#   'rotation_interval_seconds': 1800,
#   'cached_credentials': ['rds', 'valkey'],
#   'last_rotations': {
#     'rds': '2025-11-11T10:30:00',
#     'valkey': '2025-11-11T10:30:00'
#   },
#   'next_rotation_in_seconds': 1200
# }

# Get current credentials
rds_creds = service.get_rds_credentials()
print(f"Database user: {rds_creds['username']}")

valkey_creds = service.get_valkey_credentials()
print(f"Redis auth token: {valkey_creds['auth_token'][:10]}...")

# Force immediate rotation (for testing)
service.force_rotation()
```

### Verify Database Connection

```bash
cd backend
python manage.py check --database default
```

### Monitor Rotation Logs

```bash
# View Django logs
tail -f /var/log/watchparty/django.log | grep -i "credential\|rotation"

# Expected output:
# INFO AWS credential rotation service initialized
# INFO Starting credential rotation cycle
# INFO ✓ Rotated RDS database credentials (secret: rds!db-44fd826c...)
# INFO ✓ Rotated Valkey/Redis auth token (secret: watch-party-valkey-001...)
# INFO Credential rotation cycle completed
```

## Production Deployment

### 1. Update .env

Ensure these are set in production:

```bash
AWS_CREDENTIAL_ROTATION_MINUTES=30
AWS_DEFAULT_REGION=eu-west-3
```

### 2. Restart Application

```bash
# Using systemd
sudo systemctl restart watchparty-backend

# Using Docker
docker-compose -f docker-compose-prod.yml restart backend

# Using PM2
pm2 restart ecosystem.config.js
```

### 3. Verify Rotation is Working

```bash
# Check logs for rotation messages
docker logs watchparty-backend | grep rotation

# Or via Django admin
# Navigate to: https://be-watch-party.brahim-elhouss.me/admin/
# Check recent logs
```

## Troubleshooting

### Rotation Service Not Starting

**Symptom**: No rotation logs appear

**Solution**:
```bash
# Check if explicitly disabled
echo $DISABLE_CREDENTIAL_ROTATION

# Verify AWS credentials are available
python3 -c "import boto3; print(boto3.Session().get_credentials())"

# Check IAM role permissions
aws sts get-caller-identity
```

### Credentials Not Updating

**Symptom**: Application still using old credentials after rotation

**Solution**:
```bash
# Force immediate rotation
python manage.py shell -c "
from shared.aws_credential_rotation import get_credential_service
service = get_credential_service()
service.force_rotation()
print('Forced rotation complete')
"

# Restart application
sudo systemctl restart watchparty-backend
```

### AWS Secrets Manager Access Denied

**Symptom**: `ClientError: Access Denied` in logs

**Solution**:
1. Verify IAM role has `secretsmanager:GetSecretValue` permission
2. Check secret ARN matches the region (`eu-west-3`)
3. Ensure secrets exist:
   ```bash
   aws secretsmanager list-secrets --region eu-west-3 | grep watch-party
   ```

## Benefits

✅ **Automatic Security**: Credentials rotate without manual intervention
✅ **Zero Downtime**: Cached credentials continue working during rotation
✅ **Audit Trail**: All rotations logged for compliance
✅ **Fail-Safe**: Graceful fallback to environment variables if AWS is unavailable
✅ **Thread-Safe**: Multiple processes can access credentials safely
✅ **Performance**: In-memory caching minimizes AWS API calls

## Development Mode

For local development, you can disable rotation:

```bash
# backend/.env.local
DISABLE_CREDENTIAL_ROTATION=1
REDIS_URL=redis://localhost:6379/0
DATABASE_URL=postgresql://user:pass@localhost:5432/watchparty_dev
```

This allows you to use local credentials without AWS dependencies.

## Summary

The credential rotation system provides:
- **Automated security** with 30-minute rotation
- **Zero-downtime** credential updates
- **Production-ready** with proper error handling
- **Easy monitoring** via Django admin and logs

No manual intervention required once configured! 🎉
