"""
Authentication signals
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, UserProfile


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Create user profile when user is created"""
    if created and not hasattr(instance, 'profile'):
        UserProfile.objects.create(
            user=instance,
            notification_preferences={
                'email_notifications': True,
                'push_notifications': True,
                'marketing_emails': False
            },
            privacy_settings={
                'profile_visibility': 'friends',
                'activity_visibility': 'friends'
            }
        )
