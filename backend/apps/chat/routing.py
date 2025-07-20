"""
WebSocket routing for chat functionality
"""

from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/chat/<uuid:room_id>/', consumers.ChatConsumer.as_asgi()),
    path('ws/notifications/', consumers.NotificationConsumer.as_asgi()),
]
