"""API tests for push notification endpoints."""

import os
from unittest.mock import patch

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.notifications_testing")

import django

django.setup()

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.notifications.models import NotificationPreferences
from shared.services.mobile_push_service import mobile_push_service
from tests.factories import UserFactory


class PushNotificationViewTests(APITestCase):
    """Exercises the push-notification endpoints."""

    def test_update_push_token_subscribes(self):
        user = UserFactory()
        self.client.force_authenticate(user=user)

        with patch.object(mobile_push_service, "subscribe_to_topic", autospec=True) as subscribe_mock:
            response = self.client.post(
                reverse("notifications:update-push-token"),
                {"push_token": "abc123", "device_type": "ios"},
                format="json",
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        subscribe_mock.assert_called_once_with(["abc123"], "general_announcements")

    def test_remove_push_token_unsubscribes(self):
        user = UserFactory()
        NotificationPreferences.objects.create(
            user=user,
            push_token="xyz789",
            push_enabled=True,
        )

        self.client.force_authenticate(user=user)

        with patch.object(mobile_push_service, "unsubscribe_from_topic", autospec=True) as unsubscribe_mock:
            response = self.client.post(reverse("notifications:remove-push-token"), format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        unsubscribe_mock.assert_called_once_with(["xyz789"], "general_announcements")
        prefs = NotificationPreferences.objects.get(user=user)
        self.assertEqual(prefs.push_token, "")
        self.assertFalse(prefs.push_enabled)

    def test_send_test_push_uses_service(self):
        user = UserFactory()
        NotificationPreferences.objects.create(
            user=user,
            push_token="abc",
            push_enabled=True,
        )

        self.client.force_authenticate(user=user)

        with patch.object(
            mobile_push_service,
            "send_to_user",
            return_value={"message_ids": {"abc": "id-abc"}},
        ) as send_mock:
            response = self.client.post(reverse("notifications:test-push"), format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        send_mock.assert_called_once()
        self.assertEqual(response.data["result"], {"message_ids": {"abc": "id-abc"}})

    def test_broadcast_push_requires_admin_and_calls_service(self):
        admin = UserFactory()
        admin.is_staff = True
        admin.save()
        self.client.force_authenticate(user=admin)

        with patch.object(
            mobile_push_service,
            "send_to_topic",
            return_value="msg-123",
        ) as send_topic_mock:
            response = self.client.post(
                reverse("notifications:broadcast-push"),
                {"title": "Hello", "body": "World", "topic": "news"},
                format="json",
            )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        send_topic_mock.assert_called_once()
        kwargs = send_topic_mock.call_args.kwargs
        self.assertEqual(kwargs["topic"], "news")
        self.assertEqual(kwargs["title"], "Hello")
        self.assertEqual(kwargs["body"], "World")
        self.assertEqual(kwargs["data"]["type"], "broadcast")
        self.assertIn("timestamp", kwargs["data"])
        self.assertEqual(response.data["message_id"], "msg-123")
