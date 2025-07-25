"""
Django app configuration for moderation
"""

from django.apps import AppConfig


class ModerationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.moderation'
    verbose_name = 'Content Moderation'
    
    def ready(self):
        """Import signals when app is ready"""
        try:
            import apps.moderation.signals  # noqa
        except ImportError:
            pass
