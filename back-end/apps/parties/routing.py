"""
WebSocket routing for party functionality
"""

from django.urls import path
from .consumers import PartyConsumer, PartyLobbyConsumer

websocket_urlpatterns = [
    path('ws/party/<uuid:party_id>/', PartyConsumer.as_asgi()),
    path('ws/party/<uuid:party_id>/lobby/', PartyLobbyConsumer.as_asgi()),
]
