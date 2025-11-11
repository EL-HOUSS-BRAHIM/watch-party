#!/usr/bin/env python3
"""
Generate secure secrets for Watch Party environment variables
Run this script to generate new secrets for your .env file
"""

import secrets
import string

def generate_secret(length=64):
    """Generate a URL-safe secret token"""
    return secrets.token_urlsafe(length)

def generate_django_secret(length=50):
    """Generate Django-style secret key with special characters"""
    characters = string.ascii_letters + string.digits + '!@#$%^&*(-_=+)'
    return ''.join(secrets.choice(characters) for _ in range(length))

def main():
    print("=" * 80)
    print("WATCH PARTY - SECRET KEY GENERATOR")
    print("=" * 80)
    print("\n⚠️  IMPORTANT: Keep these secrets secure and never commit them to git!\n")
    
    print("Copy these values to your backend/.env file:\n")
    print("-" * 80)
    
    # Django Secret Key
    print(f"SECRET_KEY={generate_django_secret()}")
    
    # JWT Keys
    print(f"JWT_SECRET_KEY={generate_secret()}")
    print(f"JWT_REFRESH_SECRET_KEY={generate_secret()}")
    
    print("\n# Stripe Webhook Secret (get from Stripe Dashboard)")
    print("STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE")
    
    print("\n# AWS SES SMTP Credentials (get from AWS IAM SMTP credentials)")
    print("EMAIL_HOST_USER=YOUR_AWS_SES_SMTP_USERNAME")
    print("EMAIL_HOST_PASSWORD=YOUR_AWS_SES_SMTP_PASSWORD")
    
    print("\n" + "-" * 80)
    print("\n✅ CREDENTIALS ALREADY CONFIGURED:\n")
    print("  ✓ Google OAuth - Client ID and Secret")
    print("  ✓ Stripe - Publishable and Secret Keys (test mode)")
    print("  ✓ AWS - RDS, Valkey, S3 configured with auto-rotation")
    print("  ✓ Email - AWS SES configured (needs SMTP credentials)")
    
    print("\n" + "-" * 80)
    print("\n📝 AWS CREDENTIAL ROTATION:\n")
    print("  • RDS database credentials rotate automatically every 30 minutes")
    print("  • Valkey (Redis) auth tokens rotate automatically every 30 minutes")
    print("  • Credentials are cached and refreshed in background")
    print("  • No manual intervention needed for AWS resources")
    print("\n  Environment variables:")
    print("    AWS_CREDENTIAL_ROTATION_MINUTES=30  (default)")
    print("    DISABLE_CREDENTIAL_ROTATION=1       (to disable)")
    
    print("\n" + "-" * 80)
    print("\n🔑 MISSING CREDENTIALS TO CONFIGURE:\n")
    print("1. Stripe Webhook Secret:")
    print("   → Go to: https://dashboard.stripe.com/webhooks")
    print("   → Create endpoint: https://be-watch-party.brahim-elhouss.me/api/billing/webhook/")
    print("   → Copy signing secret (starts with whsec_)")
    
    print("\n2. AWS SES SMTP Credentials:")
    print("   → Go to: AWS SES Console → SMTP Settings")
    print("   → Create SMTP Credentials")
    print("   → Copy username and password")
    
    print("\n3. Google OAuth Redirect URI (already configured but verify):")
    print("   → Client ID: 1008595879091-gu9unfhj6j5cl2760925ek4grf251nvo.apps.googleusercontent.com")
    print("   → Current redirect: http://localhost:8088/oauth2callback.php")
    print("   → Update to: https://be-watch-party.brahim-elhouss.me/api/auth/google/callback/")
    print("   → Add: https://watch-party.brahim-elhouss.me/auth/callback")
    
    print("\n" + "-" * 80)
    print("\n🔍 VERIFICATION:\n")
    print("After updating .env, verify with:")
    print("  cd backend")
    print("  python manage.py check")
    print("  python manage.py shell -c \"from django.conf import settings; print('✓ Settings loaded')\"")
    print("\nTest credential rotation:")
    print("  python manage.py shell")
    print("  >>> from shared.aws_credential_rotation import get_credential_service")
    print("  >>> service = get_credential_service()")
    print("  >>> print(service.get_status())")
    
    print("\n" + "=" * 80)
    print("\n📚 NOTE ABOUT FIREBASE:\n")
    print("Firebase/FCM is NOT required for this project.")
    print("  • Email: Using AWS SES (already configured)")
    print("  • Push Notifications: Optional for mobile apps (can be added later)")
    print("  • The code supports mobile push via Firebase but it's not mandatory")
    print("\n" + "=" * 80)

if __name__ == "__main__":
    main()
