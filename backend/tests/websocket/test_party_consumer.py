"""Channels smoke tests exercising the party WebSocket consumer."""

from asgiref.sync import async_to_sync
from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator
from django.test import TransactionTestCase
from django.urls import path
from rest_framework_simplejwt.tokens import AccessToken

from shared.websocket_auth import JWTAuthMiddlewareStack


class PartyConsumerTests(TransactionTestCase):
    """Ensure authenticated clients can connect and receive heartbeat responses."""

    reset_sequences = True

    def test_party_consumer_responds_to_ping(self):
        from tests.factories import UserFactory, WatchPartyFactory

        user = UserFactory()
        party = WatchPartyFactory(host=user)
        token = AccessToken.for_user(user)
        from apps.parties.consumers import PartyConsumer

        application = JWTAuthMiddlewareStack(
            URLRouter([
                path('ws/party/<uuid:party_id>/', PartyConsumer.as_asgi()),
            ])
        )

        async def _communicate():
            communicator = WebsocketCommunicator(
                application,
                f"/ws/party/{party.id}/?token={token}",
            )
            connected, _ = await communicator.connect()
            assert connected

            initial_types = set()
            for _ in range(2):
                message = await communicator.receive_json_from()
                initial_types.add(message["type"])
            assert {"party_state", "user_joined"} == initial_types

            await communicator.send_json_to({"type": "ping"})
            pong = await communicator.receive_json_from()
            assert pong["type"] == "pong"

            await communicator.disconnect()

        async_to_sync(_communicate)()
