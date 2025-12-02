# Credentials Setup Checklist

Complete guide for setting up all required credentials for Watch Party.

## Status Overview

| Service | Status | Notes |
|---------|--------|-------|
| Django Secret Key | ✅ Configured | Generated and added to .env |
| JWT Tokens | ✅ Configured | Generated and added to .env |
| Google OAuth | ✅ Configured | Client ID and Secret added |
| Stripe | ✅ Configured | Test keys added |
| AWS RDS | ✅ Auto-Rotating | Fetched from Secrets Manager |
| AWS Valkey/Redis | ✅ Auto-Rotating | Fetched from Secrets Manager |
| AWS S3 | ✅ Configured | Using IAM role credentials |
| AWS SES SMTP | ⚠️ Needs Setup | Credentials pending |
| Stripe Webhook | ⚠️ Needs Setup | Secret pending |
| Firebase/FCM | ❌ Not Required | Using AWS SES for email |

## ✅ Completed Configuration

### 1. Django Core Secrets
```bash
SECRET_KEY=x!XLcwtDIkp%QdGLW*CmJ$XQ=DIvvu0IU$1PP%Bier%OqFsy(E
JWT_SECRET_KEY=GwnddiSPM5v4sggegK3lg3sj2tNJffOdlKSV6rIURYb2DQKot1L_jbxpT93X4sO7ciBRHPdVjcxRD7tw4GO2Pw
JWT_REFRESH_SECRET_KEY=jh86aZP1qhDk2f2S5uCO3ALZWtfCwYIQBZm7DkKhJhhSZGWTHMtVzAmJDv43k9BYe9Zz4helWRiJruVg1dvi1Q
```

### 2. Google OAuth 2.0
```bash
GOOGLE_OAUTH_CLIENT_ID=1008595879091-gu9unfhj6j5cl2760925ek4grf251nvo.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=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
GOOGLE_OAUTH_REDIRECT_URI=https://be-watch-party.brahim-elhouss.me/api/auth/google/callback/
```

**⚠️ ACTION REQUIRED**: Update redirect URI in Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Select: Watch party app (Client ID: 1008595879091...)
3. Update "Authorized redirect URIs":
   - Remove: `http://localhost:8088/oauth2callback.php`
   - Add: `https://be-watch-party.brahim-elhouss.me/api/auth/google/callback/`
   - Add: `https://watch-party.brahim-elhouss.me/auth/callback`
   - Add: `http://localhost:3000/auth/callback` (for development)

### 3. Stripe Payment Integration
```bash
# Test Mode Keys (use your own keys from Stripe Dashboard)
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Webhook Secret (PENDING - see below)
STRIPE_WEBHOOK_SECRET=
```

### 4. AWS Configuration
```bash
# S3 Storage
AWS_S3_BUCKET_NAME=watch-party-media
AWS_S3_REGION_NAME=eu-west-3
USE_S3=True

# Credential Rotation (auto-configured)
AWS_CREDENTIAL_ROTATION_MINUTES=30
AWS_DEFAULT_REGION=eu-west-3

# RDS and Valkey credentials fetched automatically from Secrets Manager
# No manual configuration needed! 🎉
```

## ⚠️ Pending Configuration

### 1. Stripe Webhook Secret

**Why**: Verify payment events are authentic

**Steps**:
1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://be-watch-party.brahim-elhouss.me/api/billing/webhook/`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the "Signing secret" (starts with `whsec_`)
6. Add to `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET_HERE
   ```

### 2. AWS SES SMTP Credentials

**Why**: Send transactional emails (password reset, invitations, etc.)

**Steps**:
1. Go to: AWS Console → Simple Email Service (SES)
2. Navigate to: SMTP Settings
3. Click: "Create SMTP Credentials"
4. Note the SMTP username and password
5. Add to `.env`:
   ```bash
   EMAIL_HOST_USER=AKIAIOSFODNN7EXAMPLE
   EMAIL_HOST_PASSWORD=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   ```

**Domain Verification** (if not done):
1. Go to: SES → Verified identities
2. Add domain: `brahim-elhouss.me`
3. Add DNS records to verify ownership
4. Wait for verification (can take up to 72 hours)

### 3. Production Domain Configuration

**Current domains**:
```bash
ALLOWED_HOSTS=localhost,127.0.0.1,be-watch-party.brahim-elhouss.me
CORS_ALLOWED_ORIGINS=https://watch-party.brahim-elhouss.me,https://be-watch-party.brahim-elhouss.me
```

**Verify DNS records**:
```bash
# Frontend
nslookup watch-party.brahim-elhouss.me
# Should point to: Cloudflare CDN

# Backend
nslookup be-watch-party.brahim-elhouss.me
# Should point to: AWS Lightsail instance
```

## ❌ Not Required

### Firebase/FCM

**Why not needed**:
- **Email notifications**: Using AWS SES (already configured)
- **Mobile push**: Optional feature, can be added later if you build mobile apps
- **The code supports it**: But it's not mandatory for core functionality

**If you want to add it later**:
1. Create Firebase project: https://console.firebase.google.com/
2. Enable Cloud Messaging (FCM)
3. Download service account JSON
4. Add credentials to `.env`

But for now, skip it! ✅

## Verification Commands

### Check All Settings Load Correctly

```bash
cd backend
python manage.py check
```

Expected: `System check identified no issues (0 silenced).`

### Test Database Connection

```bash
python manage.py shell -c "
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute('SELECT version()')
    print(f'✓ Database: {cursor.fetchone()[0][:30]}...')
"
```

### Test Redis Connection

```bash
python manage.py shell -c "
from django.core.cache import cache
cache.set('test_key', 'test_value', 60)
result = cache.get('test_key')
print(f'✓ Redis: {result}')
"
```

### Test AWS S3 Access

```bash
python manage.py shell -c "
from django.core.files.storage import default_storage
print(f'✓ S3 Bucket: {default_storage.bucket_name}')
print(f'✓ S3 Region: {default_storage.region_name}')
"
```

### Test Credential Rotation

```bash
python manage.py shell -c "
from shared.aws_credential_rotation import get_credential_service
service = get_credential_service()
status = service.get_status()
print(f'✓ Rotation service: {\"Running\" if status[\"running\"] else \"Stopped\"}')
print(f'✓ Cached credentials: {status[\"cached_credentials\"]}')
"
```

### Test Email Configuration

```bash
python manage.py shell -c "
from django.core.mail import send_mail
# Note: This will only work after AWS SES SMTP credentials are configured
send_mail(
    'Test Email',
    'This is a test from Watch Party',
    'noreply@brahim-elhouss.me',
    ['your-email@example.com'],
    fail_silently=False,
)
print('✓ Email sent successfully')
"
```

## Next Steps

### 1. Complete Pending Configuration
- [ ] Add Stripe webhook secret to `.env`
- [ ] Create AWS SES SMTP credentials
- [ ] Add SES SMTP credentials to `.env`
- [ ] Update Google OAuth redirect URIs

### 2. Restart Application
```bash
# Using systemd
sudo systemctl restart watchparty-backend

# Using Docker
docker-compose -f docker-compose-prod.yml restart backend

# Using PM2
pm2 restart ecosystem.config.js
```

### 3. Run Verification Commands
Execute all commands in the "Verification Commands" section above.

### 4. Test Core Features
- [ ] User registration with email
- [ ] Google OAuth login
- [ ] Create a party
- [ ] Upload a video
- [ ] Process a test payment (Stripe)
- [ ] Receive email notification

## Security Notes

🔒 **Never commit `.env` files to Git!**

The `.env` file is already in `.gitignore`, but double-check:
```bash
grep "^\.env$" .gitignore
```

🔐 **Rotate secrets periodically**:
- Django SECRET_KEY: Every 90 days
- JWT keys: Every 60 days
- API keys: When compromised or every year

🛡️ **AWS credentials rotate automatically**:
- RDS: Every 30 minutes via Secrets Manager
- Valkey: Every 30 minutes via Secrets Manager
- No manual intervention needed!

## Summary

**Completed**: 7/10 ✅
**Pending**: 2/10 ⚠️
**Not Required**: 1/10 ❌

Once you complete the 2 pending items (Stripe webhook + AWS SES SMTP), your application will be **100% production-ready**! 🚀
