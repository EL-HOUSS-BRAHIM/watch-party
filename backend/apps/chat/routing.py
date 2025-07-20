"""
WebSocket routing for chat functionality and video sync
"""

from django.urls import path
from . import consumers
from .video_sync_consumer import VideoSyncConsumer

websocket_urlpatterns = [
    path('ws/chat/<uuid:room_id>/', consumers.ChatConsumer.as_asgi()),
    path('ws/notifications/', consumers.NotificationConsumer.as_asgi()),
    path('ws/sync/<str:party_code>/', VideoSyncConsumer.as_asgi()),
]
