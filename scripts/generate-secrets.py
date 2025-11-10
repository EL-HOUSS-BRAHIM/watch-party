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
    print("=" * 70)
    print("WATCH PARTY - SECRET KEY GENERATOR")
    print("=" * 70)
    print("\n⚠️  IMPORTANT: Keep these secrets secure and never commit them to git!\n")
    
    print("Copy these values to your backend/.env file:\n")
    print("-" * 70)
    
    # Django Secret Key
    print(f"SECRET_KEY={generate_django_secret()}")
    
    # JWT Keys
    print(f"JWT_SECRET_KEY={generate_secret()}")
    print(f"JWT_REFRESH_SECRET_KEY={generate_secret()}")
    
    print("\n# Database Password (generate strong password)")
    print("# Run: python -c \"import secrets; print(secrets.token_urlsafe(32))\"")
    print(f"DB_PASSWORD={generate_secret(32)}")
    
    print("\n# Redis/Valkey Password (generate strong password)")
    print(f"REDIS_PASSWORD={generate_secret(32)}")
    
    print("\n" + "-" * 70)
    print("\n📝 NEXT STEPS:\n")
    print("1. Copy the generated secrets above to your backend/.env file")
    print("2. Get AWS credentials from AWS Console:")
    print("   - Database password from RDS")
    print("   - Redis password from ElastiCache")
    print("   - S3 bucket name from S3 Console")
    print("\n3. Get third-party API keys:")
    print("   - Stripe keys from https://dashboard.stripe.com/apikeys")
    print("   - Google OAuth from https://console.cloud.google.com/apis/credentials")
    print("   - Firebase from https://console.firebase.google.com/")
    print("\n4. Configure email service (SendGrid, AWS SES, etc.)")
    print("\n5. Restart your Django application after updating .env")
    print("\n" + "=" * 70)
    
    # Verification
    print("\n🔍 VERIFICATION:\n")
    print("After updating .env, verify with:")
    print("  cd backend")
    print("  python manage.py check")
    print("  python manage.py shell -c \"from django.conf import settings; print('✓ Settings loaded')\"")
    print("\n" + "=" * 70)

if __name__ == "__main__":
    main()
