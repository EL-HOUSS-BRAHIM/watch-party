"""
WebSocket routing for the Interactive app.
Defines WebSocket URL patterns for real-time interactive features.
"""

from django.urls import path
from . import consumers

websocket_urlpatterns = [
    # Interactive features WebSocket
    path(
        'ws/interactive/<uuid:party_id>/',
        consumers.InteractiveConsumer.as_asgi(),
        name='interactive-websocket'
    ),
    
    # Voice chat specific WebSocket (if needed for signaling)
    path(
        'ws/voice-chat/room/<uuid:room_id>/',
        consumers.InteractiveConsumer.as_asgi(),
        name='voice-chat-websocket'
    ),
    
    # Screen share WebSocket for annotations
    path(
        'ws/screen-share/<uuid:share_id>/',
        consumers.InteractiveConsumer.as_asgi(),
        name='screen-share-websocket'
    ),
]
