"""Mobile push notification service."""

import logging
import uuid
from typing import Any, Dict, Iterable, List, Optional

logger = logging.getLogger(__name__)


class _MockPushProvider:
    """Simple mock provider used as a default implementation."""

    def subscribe_to_topic(
        self, tokens: List[str], topic: str, metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        return {
            "topic": topic,
            "success_count": len(tokens),
            "failure_count": 0,
            "metadata": metadata or {},
        }

    def unsubscribe_from_topic(
        self, tokens: List[str], topic: str, metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        return {
            "topic": topic,
            "success_count": len(tokens),
            "failure_count": 0,
            "metadata": metadata or {},
        }

    def send_to_tokens(self, tokens: List[str], payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "message_ids": {token: str(uuid.uuid4()) for token in tokens},
            "failure_count": 0,
            "payload": payload,
        }

    def send_to_topic(self, topic: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "message_id": str(uuid.uuid4()),
            "topic": topic,
            "status": "sent",
            "payload": payload,
        }


class MobilePushService:
    """Service for mobile push notifications."""

    def __init__(self, provider: Optional[Any] = None) -> None:
        self.provider = provider or _MockPushProvider()

    def _normalize_tokens(self, device_tokens: Iterable[str]) -> List[str]:
        if isinstance(device_tokens, str):
            tokens = [device_tokens]
        elif isinstance(device_tokens, Iterable):
            tokens = [token for token in device_tokens]
        else:
            raise TypeError("device_tokens must be a string or iterable of strings")

        cleaned_tokens = [token.strip() for token in tokens if isinstance(token, str) and token.strip()]
        if not cleaned_tokens:
            raise ValueError("At least one valid device token must be provided")
        return cleaned_tokens

    def _send_to_tokens(self, tokens: List[str], payload: Dict[str, Any]) -> Dict[str, Any]:
        try:
            response = self.provider.send_to_tokens(tokens, payload)
        except Exception as exc:  # pragma: no cover - defensive guard
            raise RuntimeError(f"Failed to send push notification: {exc}") from exc

        failures = response.get("failure_count", 0)
        if failures:
            raise RuntimeError(
                f"Push provider reported {failures} failures while sending notification"
            )
        return response

    def subscribe_to_topic(
        self,
        device_tokens: Iterable[str],
        topic: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Subscribe one or more device tokens to a topic."""

        tokens = self._normalize_tokens(device_tokens)
        if not topic or not topic.strip():
            raise ValueError("Topic must be a non-empty string")

        try:
            response = self.provider.subscribe_to_topic(tokens, topic.strip(), metadata or {})
        except Exception as exc:  # pragma: no cover - defensive guard
            raise RuntimeError(
                f"Failed to subscribe tokens to topic '{topic}': {exc}"
            ) from exc

        if response.get("failure_count", 0):
            raise RuntimeError(
                f"Push provider reported {response['failure_count']} failures when subscribing to '{topic}'"
            )

        logger.info("Subscribed %s tokens to topic '%s'", len(tokens), topic)
        return response

    def unsubscribe_from_topic(
        self,
        device_tokens: Iterable[str],
        topic: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Unsubscribe one or more device tokens from a topic."""

        tokens = self._normalize_tokens(device_tokens)
        if not topic or not topic.strip():
            raise ValueError("Topic must be a non-empty string")

        try:
            response = self.provider.unsubscribe_from_topic(tokens, topic.strip(), metadata or {})
        except Exception as exc:  # pragma: no cover - defensive guard
            raise RuntimeError(
                f"Failed to unsubscribe tokens from topic '{topic}': {exc}"
            ) from exc

        if response.get("failure_count", 0):
            raise RuntimeError(
                f"Push provider reported {response['failure_count']} failures when unsubscribing from '{topic}'"
            )

        logger.info("Unsubscribed %s tokens from topic '%s'", len(tokens), topic)
        return response

    def send_to_user(
        self,
        user: Any,
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Send a push notification directly to a user's registered devices."""

        if not user:
            raise ValueError("user is required")
        if not title or not title.strip():
            raise ValueError("title is required")
        if not body or not body.strip():
            raise ValueError("body is required")

        from apps.notifications.models import NotificationPreferences

        preferences = NotificationPreferences.objects.filter(
            user=user, push_token__isnull=False
        ).exclude(push_token="").first()

        if not preferences or not preferences.push_enabled:
            raise RuntimeError("User does not have push notifications enabled or registered")

        tokens = self._normalize_tokens([preferences.push_token])
        payload: Dict[str, Any] = {
            "title": title.strip(),
            "body": body.strip(),
        }
        if data:
            payload["data"] = data
        if metadata:
            payload["metadata"] = metadata

        return self._send_to_tokens(tokens, payload)

    def send_to_topic(
        self,
        topic: str,
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Send a push notification to all subscribers of a topic."""

        if not topic or not topic.strip():
            raise ValueError("Topic must be a non-empty string")
        if not title or not title.strip():
            raise ValueError("title is required")
        if not body or not body.strip():
            raise ValueError("body is required")

        payload: Dict[str, Any] = {
            "title": title.strip(),
            "body": body.strip(),
        }
        if data:
            payload["data"] = data
        if metadata:
            payload["metadata"] = metadata

        try:
            response = self.provider.send_to_topic(topic.strip(), payload)
        except Exception as exc:  # pragma: no cover - defensive guard
            raise RuntimeError(f"Failed to send notification to topic '{topic}': {exc}") from exc

        if response.get("status") not in {None, "sent", "success"}:
            raise RuntimeError(
                f"Push provider returned unexpected status '{response.get('status')}' for topic '{topic}'"
            )

        message_id = response.get("message_id")
        if not message_id:
            raise RuntimeError(
                f"Push provider did not return a message id for topic '{topic}'"
            )

        logger.info("Sent topic notification '%s' with id %s", topic, message_id)
        return message_id

    def send_push_notification(
        self,
        device_token: str,
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Send push notification to a device."""
        logger.info("Sending push notification to device: %s", title)
        payload = {"title": title, "body": body}
        if data:
            payload["data"] = data
        return self._send_to_tokens(self._normalize_tokens([device_token]), payload)

    def send_bulk_push(
        self,
        device_tokens: List[str],
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Send push notification to multiple devices."""
        logger.info(
            "Sending bulk push notification to %s devices", len(device_tokens)
        )
        payload = {"title": title, "body": body}
        if data:
            payload["data"] = data
        return self._send_to_tokens(self._normalize_tokens(device_tokens), payload)

    def register_device(
        self, user_id: str, device_token: str, platform: str = "android"
    ) -> Dict[str, Any]:
        """Register a device for push notifications."""
        logger.info("Registering %s device for user %s", platform, user_id)
        return {"device_id": "placeholder", "status": "registered"}

    def unregister_device(self, device_token: str) -> bool:
        """Unregister a device."""
        logger.info("Unregistering device %s", device_token)
        return True

    def get_user_devices(self, user_id: str) -> List[Dict[str, Any]]:
        """Get registered devices for a user."""
        logger.info("Getting devices for user %s", user_id)
        return []


# Global service instance
mobile_push_service = MobilePushService()
