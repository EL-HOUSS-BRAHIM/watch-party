"""
Management command to fix OAuth user verification status
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Mark all OAuth users (Google/GitHub) as email verified'

    def handle(self, *args, **options):
        self.stdout.write('🔧 Fixing OAuth user verification status...\n')
        
        # Find all users with Google or GitHub ID who aren't verified
        oauth_users = User.objects.filter(
            is_email_verified=False
        ).exclude(
            google_id__isnull=True,
            github_id__isnull=True
        )
        
        count = oauth_users.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS('✅ No OAuth users need verification status update'))
            return
        
        self.stdout.write(f'Found {count} OAuth users who need verification status update:')
        
        for user in oauth_users:
            provider = "Google" if user.google_id else "GitHub"
            self.stdout.write(f'  - {user.email} ({provider})')
        
        # Update all at once
        updated = oauth_users.update(is_email_verified=True)
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Updated {updated} users - all OAuth users are now verified'))
        self.stdout.write(self.style.SUCCESS('✨ Done!'))
