"""Unit tests for the mobile push service integration."""

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.notifications_testing")

import django

django.setup()

from django.test import TestCase

from apps.notifications.models import NotificationPreferences
from shared.services.mobile_push_service import MobilePushService
from tests.factories import UserFactory


class DummyProvider:
    """Provider used to capture interactions during tests."""

    def __init__(self, failure_count: int = 0, status: str = "sent", message_id: str = "msg-1"):
        self.subscribed = []
        self.unsubscribed = []
        self.sent_tokens = []
        self.sent_topics = []
        self.failure_count = failure_count
        self.status = status
        self.message_id = message_id

    def subscribe_to_topic(self, tokens, topic, metadata=None):
        self.subscribed.append((tuple(tokens), topic, metadata or {}))
        return {"success_count": len(tokens), "failure_count": self.failure_count}

    def unsubscribe_from_topic(self, tokens, topic, metadata=None):
        self.unsubscribed.append((tuple(tokens), topic, metadata or {}))
        return {"success_count": len(tokens), "failure_count": self.failure_count}

    def send_to_tokens(self, tokens, payload):
        self.sent_tokens.append((tuple(tokens), payload))
        return {"failure_count": self.failure_count, "message_ids": {t: f"id-{t}" for t in tokens}}

    def send_to_topic(self, topic, payload):
        self.sent_topics.append((topic, payload))
        return {"message_id": self.message_id, "status": self.status}


class MobilePushServiceTests(TestCase):
    """Test suite covering push service helpers."""

    def test_subscribe_to_topic_succeeds(self):
        provider = DummyProvider()
        service = MobilePushService(provider=provider)

        response = service.subscribe_to_topic(["token-a", "token-b"], "general")

        self.assertEqual(response["success_count"], 2)
        self.assertEqual(provider.subscribed, [(("token-a", "token-b"), "general", {})])

    def test_subscribe_to_topic_failure_raises(self):
        provider = DummyProvider(failure_count=1)
        service = MobilePushService(provider=provider)

        with self.assertRaises(RuntimeError):
            service.subscribe_to_topic(["token-a"], "general")

    def test_send_to_user_requires_registered_token(self):
        user = UserFactory()
        service = MobilePushService(provider=DummyProvider())

        with self.assertRaises(RuntimeError):
            service.send_to_user(user=user, title="Hello", body="World")

    def test_send_to_user_delivers_payload(self):
        user = UserFactory()
        NotificationPreferences.objects.create(
            user=user,
            push_enabled=True,
            push_token="abc123",
        )

        provider = DummyProvider()
        service = MobilePushService(provider=provider)

        response = service.send_to_user(
            user=user,
            title="Greetings",
            body="Hello there",
            data={"foo": "bar"},
            metadata={"source": "unit"},
        )

        self.assertTrue(provider.sent_tokens)
        tokens, payload = provider.sent_tokens[0]
        self.assertEqual(tokens, ("abc123",))
        self.assertEqual(payload["title"], "Greetings")
        self.assertEqual(payload["data"], {"foo": "bar"})
        self.assertEqual(payload["metadata"], {"source": "unit"})
        self.assertTrue(response["message_ids"]["abc123"].startswith("id-"))

    def test_send_to_topic_returns_message_id(self):
        provider = DummyProvider(message_id="topic-123")
        service = MobilePushService(provider=provider)

        message_id = service.send_to_topic(
            topic="general",
            title="Title",
            body="Body",
            data={"extra": True},
            metadata={"segment": "all"},
        )

        self.assertEqual(message_id, "topic-123")
        self.assertTrue(provider.sent_topics)
        topic, payload = provider.sent_topics[0]
        self.assertEqual(topic, "general")
        self.assertEqual(payload["data"], {"extra": True})
        self.assertEqual(payload["metadata"], {"segment": "all"})

    def test_send_to_topic_reports_provider_error(self):
        provider = DummyProvider(status="failed")
        service = MobilePushService(provider=provider)

        with self.assertRaises(RuntimeError):
            service.send_to_topic(topic="general", title="t", body="b")
