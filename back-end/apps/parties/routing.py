"""
WebSocket routing for party functionality
"""

from django.urls import re_path
from .consumers import PartyConsumer, PartyLobbyConsumer

websocket_urlpatterns = [
    re_path(r'ws/party/(?P<party_id>[0-9a-f-]+)/$', PartyConsumer.as_asgi()),
    re_path(r'ws/party/(?P<party_id>[0-9a-f-]+)/lobby/$', PartyLobbyConsumer.as_asgi()),
]
