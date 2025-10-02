"""Notification service for sending various types of notifications."""

import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for handling notifications."""

    def send_notification(self, user_id: str, title: str, message: str,
                         notification_type: str = "info") -> Dict[str, Any]:
        """Send a notification to a user."""
        logger.info(f"Sending {notification_type} notification to user {user_id}: {title}")
        return {"notification_id": "placeholder", "status": "sent"}

    def send_warning_notification(self, user, reason: str, **kwargs) -> Dict[str, Any]:
        """Send a warning notification to a user."""
        user_id = getattr(user, "id", user)
        if user_id is None:
            raise ValueError("A valid user or user identifier is required to send a warning notification")

        title = kwargs.pop('title', "Community Guidelines Warning")
        custom_message = kwargs.pop('message', None)
        action_required = kwargs.pop('action_required', None)
        support_url = kwargs.pop('support_url', None)

        if custom_message:
            message = custom_message
        else:
            message_lines = [
                "Our moderation team has issued a warning regarding your recent activity.",
                f"Reason: {reason}",
            ]
            if action_required:
                message_lines.append(f"Next steps: {action_required}")
            if support_url:
                message_lines.append(f"For more information visit: {support_url}")
            message = "\n".join(message_lines)

        if kwargs:
            logger.debug(
                "Unused warning notification options provided for user %s: %s",
                user_id,
                kwargs,
            )

        logger.info("Sending warning notification to user %s", user_id)
        return self.send_notification(
            user_id=str(user_id),
            title=title,
            message=message,
            notification_type="warning",
        )
    
    def send_bulk_notification(self, user_ids: List[str], title: str, 
                              message: str, notification_type: str = "info") -> Dict[str, Any]:
        """Send notification to multiple users."""
        logger.info(f"Sending bulk {notification_type} notification to {len(user_ids)} users")
        return {"batch_id": "placeholder", "status": "sent"}
    
    def mark_as_read(self, notification_id: str) -> bool:
        """Mark notification as read."""
        logger.info(f"Marking notification {notification_id} as read")
        return True
    
    def get_unread_count(self, user_id: str) -> int:
        """Get unread notification count for user."""
        logger.info(f"Getting unread count for user {user_id}")
        return 0


# Global service instance
notification_service = NotificationService()
