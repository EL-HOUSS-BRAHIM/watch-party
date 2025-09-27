"""
ASGI routing configuration for WebSocket support
"""

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from shared.websocket_auth import JWTAuthMiddlewareStack

# Import WebSocket routing patterns
from apps.chat.routing import websocket_urlpatterns as chat_websocket_urlpatterns
from apps.interactive.routing import websocket_urlpatterns as interactive_websocket_urlpatterns
from apps.parties.routing import websocket_urlpatterns as party_websocket_urlpatterns

# Combine all WebSocket URL patterns
websocket_urlpatterns = []
websocket_urlpatterns.extend(chat_websocket_urlpatterns)
websocket_urlpatterns.extend(interactive_websocket_urlpatterns)
websocket_urlpatterns.extend(party_websocket_urlpatterns)

application = ProtocolTypeRouter({
    # HTTP requests are handled by Django's ASGI application
    "http": get_asgi_application(),
    
    # WebSocket requests are handled by our WebSocket routing with JWT auth
    "websocket": JWTAuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
