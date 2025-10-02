"""Tests for moderation warning actions and notifications."""

import os
from types import SimpleNamespace
from unittest import TestCase
from unittest.mock import patch

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.testing")
django.setup()

from apps.moderation.views import _apply_moderation_action
from shared.services.notification_service import notification_service


class ModerationWarningActionTests(TestCase):
    """Ensure moderation warning actions trigger the appropriate notifications."""

    def setUp(self):
        self.reported_user = SimpleNamespace(id="user-123")
        self.report = SimpleNamespace(reported_user=self.reported_user)

    def test_warning_action_triggers_warning_notification(self):
        action_data = {
            "action_type": "warning",
            "description": "Please adhere to the community guidelines.",
        }

        with patch(
            "shared.services.notification_service.notification_service.send_warning_notification"
        ) as mock_warning:
            _apply_moderation_action(self.report, action_data)

        mock_warning.assert_called_once_with(
            user=self.reported_user,
            reason=action_data["description"],
        )

    def test_send_warning_notification_formats_message(self):
        reason = "Spamming promotional links"
        action_required = "Please review the community guidelines."
        support_url = "https://example.com/guidelines"

        with patch.object(notification_service, "send_notification") as mock_send:
            notification_service.send_warning_notification(
                user=self.reported_user,
                reason=reason,
                action_required=action_required,
                support_url=support_url,
            )

        expected_message = "\n".join(
            [
                "Our moderation team has issued a warning regarding your recent activity.",
                f"Reason: {reason}",
                f"Next steps: {action_required}",
                f"For more information visit: {support_url}",
            ]
        )

        mock_send.assert_called_once_with(
            user_id=str(self.reported_user.id),
            title="Community Guidelines Warning",
            message=expected_message,
            notification_type="warning",
        )
