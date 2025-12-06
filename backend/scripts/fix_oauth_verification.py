#!/usr/bin/env python
"""
Script to fix email verification status for OAuth users.
Marks all users with google_id or github_id as verified.
"""
import os
import sys
import django

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.production')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def fix_oauth_verification():
    """Mark all OAuth users as email verified"""
    
    # Find all users with Google or GitHub ID who aren't verified
    oauth_users = User.objects.filter(
        is_email_verified=False
    ).filter(
        google_id__isnull=False
    ) | User.objects.filter(
        is_email_verified=False
    ).filter(
        github_id__isnull=False
    )
    
    count = oauth_users.count()
    
    if count == 0:
        print("✅ No OAuth users need verification status update")
        return
    
    print(f"Found {count} OAuth users who need verification status update:")
    
    for user in oauth_users:
        provider = "Google" if user.google_id else "GitHub"
        print(f"  - {user.email} ({provider})")
    
    # Update all at once
    updated = oauth_users.update(is_email_verified=True)
    
    print(f"\n✅ Updated {updated} users - all OAuth users are now verified")

if __name__ == '__main__':
    print("🔧 Fixing OAuth user verification status...\n")
    fix_oauth_verification()
    print("\n✨ Done!")
