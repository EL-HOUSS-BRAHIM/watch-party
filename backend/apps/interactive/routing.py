"""
WebSocket routing for the Interactive app.
Defines WebSocket URL patterns for real-time interactive features.
"""

from django.urls import re_path, path
from . import consumers

websocket_urlpatterns = [
    # Interactive features WebSocket
    re_path(
        r'ws/interactive/party/(?P<party_id>\d+)/$',
        consumers.InteractiveConsumer.as_asgi(),
        name='interactive-websocket'
    ),
    
    # Voice chat specific WebSocket (if needed for signaling)
    re_path(
        r'ws/voice-chat/room/(?P<room_id>\d+)/$',
        consumers.InteractiveConsumer.as_asgi(),
        name='voice-chat-websocket'
    ),
    
    # Screen share WebSocket for annotations
    re_path(
        r'ws/screen-share/(?P<share_id>[0-9a-f-]+)/$',
        consumers.InteractiveConsumer.as_asgi(),
        name='screen-share-websocket'
    ),
]
