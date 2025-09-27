"""
WebSocket routing for chat functionality and video sync
"""

from django.urls import path
from . import consumers
from .video_sync_consumer import VideoSyncConsumer
from .enhanced_party_consumer import EnhancedPartyConsumer

websocket_urlpatterns = [
    path('ws/chat/<uuid:party_id>/', consumers.ChatConsumer.as_asgi()),
    path('ws/party/<uuid:party_id>/sync/', VideoSyncConsumer.as_asgi()),
    path('ws/party/<uuid:party_id>/enhanced/', EnhancedPartyConsumer.as_asgi()),
    path('ws/notifications/', consumers.NotificationConsumer.as_asgi()),
    # Test endpoint for system testing
    path('ws/test/', consumers.TestWebSocketConsumer.as_asgi()),
]
