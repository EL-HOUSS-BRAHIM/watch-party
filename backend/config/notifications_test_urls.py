"""URL configuration for notifications tests."""

from django.urls import include, path

from .simple_urls import urlpatterns as base_urlpatterns

urlpatterns = list(base_urlpatterns) + [
    path(
        'api/notifications/',
        include(('apps.notifications.urls', 'notifications'), namespace='notifications'),
    ),
]
