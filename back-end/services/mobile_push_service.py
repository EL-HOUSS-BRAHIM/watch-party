"""
Mobile push notification service for Watch Party Backend
"""

import json
import logging
from typing import Dict, List, Optional
from django.conf import settings

try:
    from firebase_admin import messaging, credentials, initialize_app
    from firebase_admin.exceptions import FirebaseError
    import firebase_admin
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False
    messaging = None
    credentials = None
    initialize_app = None
    FirebaseError = Exception
    firebase_admin = None

logger = logging.getLogger(__name__)


class MobilePushService:
    """Service for sending mobile push notifications via Firebase Cloud Messaging"""
    
    def __init__(self):
        self.initialized = False
        if FIREBASE_AVAILABLE:
            self._initialize_firebase()
        else:
            logger.warning("Firebase Admin SDK not available. Push notifications will not work.")
    
    def _get_user_model(self):
        """Get user model dynamically to avoid import issues"""
        try:
            from django.contrib.auth import get_user_model
            return get_user_model()
        except Exception:
            return None
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        if not FIREBASE_AVAILABLE:
            return
            
        try:
            # Check if Firebase is already initialized
            if firebase_admin._apps:
                self.initialized = True
                return
            
            # Get Firebase credentials from settings
            firebase_config = getattr(settings, 'FIREBASE_CONFIG', None)
            if not firebase_config:
                logger.warning("Firebase configuration not found in settings")
                return
            
            # Initialize Firebase with service account
            if isinstance(firebase_config, dict):
                cred = credentials.Certificate(firebase_config)
            else:
                # Path to service account JSON file
                cred = credentials.Certificate(firebase_config)
            
            initialize_app(cred)
            self.initialized = True
            logger.info("Firebase Admin SDK initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {str(e)}")
            self.initialized = False
    
    def send_notification(
        self, 
        tokens: List[str], 
        title: str, 
        body: str,
        data: Optional[Dict] = None,
        image: Optional[str] = None,
        action_url: Optional[str] = None
    ) -> Dict[str, any]:
        """
        Send push notification to multiple devices
        
        Args:
            tokens: List of FCM registration tokens
            title: Notification title
            body: Notification body
            data: Additional data payload
            image: Optional image URL
            action_url: Optional deep link URL
        
        Returns:
            Dict with success/failure counts and details
        """
        if not self.initialized:
            logger.error("Firebase not initialized, cannot send notifications")
            return {'success_count': 0, 'failure_count': len(tokens), 'error': 'Firebase not available'}
        
        if not FIREBASE_AVAILABLE:
            logger.error("Firebase SDK not available")
            return {'success_count': 0, 'failure_count': len(tokens), 'error': 'Firebase SDK not installed'}
        
        if not tokens:
            return {'success_count': 0, 'failure_count': 0}
        
        try:
            # Prepare notification payload
            notification = messaging.Notification(
                title=title,
                body=body,
                image=image
            )
            
            # Prepare data payload
            notification_data = data or {}
            if action_url:
                notification_data['click_action'] = action_url
                notification_data['action_url'] = action_url
            
            # Create multicast message
            multicast_message = messaging.MulticastMessage(
                notification=notification,
                data=notification_data,
                tokens=tokens,
                android=messaging.AndroidConfig(
                    notification=messaging.AndroidNotification(
                        channel_id='watch_party_notifications',
                        priority='high',
                        default_sound=True,
                        default_vibrate_timings=True
                    ),
                    data=notification_data
                ),
                apns=messaging.APNSConfig(
                    payload=messaging.APNSPayload(
                        aps=messaging.Aps(
                            sound='default',
                            badge=1,
                            category='WATCH_PARTY',
                            custom_data=notification_data
                        )
                    )
                ),
                webpush=messaging.WebpushConfig(
                    notification=messaging.WebpushNotification(
                        title=title,
                        body=body,
                        icon='/icons/notification-icon.png',
                        badge='/icons/badge-icon.png',
                        image=image,
                        tag='watch-party',
                        requireInteraction=True,
                        actions=[
                            messaging.WebpushNotificationAction(
                                action='view',
                                title='View'
                            ),
                            messaging.WebpushNotificationAction(
                                action='dismiss',
                                title='Dismiss'
                            )
                        ] if action_url else None
                    ),
                    data=notification_data
                )
            )
            
            # Send the message
            response = messaging.send_multicast(multicast_message)
            
            # Process results
            result = {
                'success_count': response.success_count,
                'failure_count': response.failure_count,
                'failed_tokens': []
            }
            
            # Handle failed tokens
            if response.failure_count > 0:
                for idx, resp in enumerate(response.responses):
                    if not resp.success:
                        failed_token = tokens[idx]
                        error_code = resp.exception.code if resp.exception else 'unknown'
                        
                        result['failed_tokens'].append({
                            'token': failed_token,
                            'error': error_code
                        })
                        
                        # Handle invalid tokens
                        if error_code in ['registration-token-not-registered', 'invalid-argument']:
                            self._handle_invalid_token(failed_token)
            
            logger.info(f"Push notification sent: {response.success_count} succeeded, {response.failure_count} failed")
            return result
            
        except FirebaseError as e:
            logger.error(f"Firebase error sending notification: {str(e)}")
            return {'success_count': 0, 'failure_count': len(tokens), 'error': str(e)}
        except Exception as e:
            logger.error(f"Unexpected error sending notification: {str(e)}")
            return {'success_count': 0, 'failure_count': len(tokens), 'error': str(e)}
    
    def send_to_user(
        self, 
        user, 
        title: str, 
        body: str,
        data: Optional[Dict] = None,
        image: Optional[str] = None,
        action_url: Optional[str] = None
    ) -> Dict[str, any]:
        """
        Send push notification to a specific user
        
        Args:
            user: User instance
            title: Notification title
            body: Notification body
            data: Additional data payload
            image: Optional image URL
            action_url: Optional deep link URL
        
        Returns:
            Dict with success/failure counts and details
        """
        # Get user's push tokens
        tokens = self._get_user_tokens(user)
        
        if not tokens:
            logger.info(f"No push tokens found for user {user.username}")
            return {'success_count': 0, 'failure_count': 0, 'message': 'No tokens found'}
        
        return self.send_notification(tokens, title, body, data, image, action_url)
    
    def send_to_multiple_users(
        self, 
        users, 
        title: str, 
        body: str,
        data: Optional[Dict] = None,
        image: Optional[str] = None,
        action_url: Optional[str] = None
    ) -> Dict[str, any]:
        """
        Send push notification to multiple users
        
        Args:
            users: List of User instances
            title: Notification title
            body: Notification body
            data: Additional data payload
            image: Optional image URL
            action_url: Optional deep link URL
        
        Returns:
            Dict with success/failure counts and details
        """
        all_tokens = []
        
        for user in users:
            user_tokens = self._get_user_tokens(user)
            all_tokens.extend(user_tokens)
        
        if not all_tokens:
            return {'success_count': 0, 'failure_count': 0, 'message': 'No tokens found'}
        
        return self.send_notification(all_tokens, title, body, data, image, action_url)
    
    def subscribe_to_topic(self, tokens: List[str], topic: str) -> Dict[str, any]:
        """
        Subscribe tokens to a topic for topic-based messaging
        
        Args:
            tokens: List of FCM registration tokens
            topic: Topic name
        
        Returns:
            Dict with success/failure counts
        """
        if not self.initialized or not tokens:
            return {'success_count': 0, 'failure_count': len(tokens) if tokens else 0}
        
        try:
            response = messaging.subscribe_to_topic(tokens, topic)
            
            logger.info(f"Topic subscription: {response.success_count} succeeded, {response.failure_count} failed")
            return {
                'success_count': response.success_count,
                'failure_count': response.failure_count
            }
            
        except FirebaseError as e:
            logger.error(f"Firebase error subscribing to topic: {str(e)}")
            return {'success_count': 0, 'failure_count': len(tokens), 'error': str(e)}
    
    def unsubscribe_from_topic(self, tokens: List[str], topic: str) -> Dict[str, any]:
        """
        Unsubscribe tokens from a topic
        
        Args:
            tokens: List of FCM registration tokens
            topic: Topic name
        
        Returns:
            Dict with success/failure counts
        """
        if not self.initialized or not tokens:
            return {'success_count': 0, 'failure_count': len(tokens) if tokens else 0}
        
        try:
            response = messaging.unsubscribe_from_topic(tokens, topic)
            
            logger.info(f"Topic unsubscription: {response.success_count} succeeded, {response.failure_count} failed")
            return {
                'success_count': response.success_count,
                'failure_count': response.failure_count
            }
            
        except FirebaseError as e:
            logger.error(f"Firebase error unsubscribing from topic: {str(e)}")
            return {'success_count': 0, 'failure_count': len(tokens), 'error': str(e)}
    
    def send_to_topic(
        self, 
        topic: str, 
        title: str, 
        body: str,
        data: Optional[Dict] = None,
        image: Optional[str] = None,
        action_url: Optional[str] = None
    ) -> str:
        """
        Send notification to a topic
        
        Args:
            topic: Topic name
            title: Notification title
            body: Notification body
            data: Additional data payload
            image: Optional image URL
            action_url: Optional deep link URL
        
        Returns:
            Message ID if successful, None if failed
        """
        if not self.initialized:
            logger.error("Firebase not initialized, cannot send topic notification")
            return None
        
        try:
            # Prepare notification payload
            notification = messaging.Notification(
                title=title,
                body=body,
                image=image
            )
            
            # Prepare data payload
            notification_data = data or {}
            if action_url:
                notification_data['click_action'] = action_url
                notification_data['action_url'] = action_url
            
            # Create topic message
            message = messaging.Message(
                notification=notification,
                data=notification_data,
                topic=topic
            )
            
            # Send the message
            response = messaging.send(message)
            
            logger.info(f"Topic notification sent to '{topic}': {response}")
            return response
            
        except FirebaseError as e:
            logger.error(f"Firebase error sending topic notification: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error sending topic notification: {str(e)}")
            return None
    
    def _get_user_tokens(self, user) -> List[str]:
        """Get all active push tokens for a user"""
        try:
            from apps.notifications.models import NotificationPreferences
            
            prefs = NotificationPreferences.objects.filter(
                user=user,
                push_enabled=True,
                push_token__isnull=False
            ).exclude(push_token='')
            
            return [pref.push_token for pref in prefs if pref.push_token]
            
        except Exception as e:
            logger.error(f"Error getting user tokens: {str(e)}")
            return []
    
    def _handle_invalid_token(self, token: str):
        """Handle invalid or expired tokens by removing them"""
        try:
            from apps.notifications.models import NotificationPreferences
            
            # Remove invalid token from database
            NotificationPreferences.objects.filter(push_token=token).update(
                push_token='',
                push_enabled=False
            )
            
            logger.info(f"Removed invalid push token: {token[:20]}...")
            
        except Exception as e:
            logger.error(f"Error handling invalid token: {str(e)}")


# Create service instance
mobile_push_service = MobilePushService()


# Helper functions for common notification types
def send_party_invitation_push(invitee, party, inviter):
    """Send party invitation push notification"""
    return mobile_push_service.send_to_user(
        user=invitee,
        title="Party Invitation",
        body=f"{inviter.username} invited you to watch '{party.title}'",
        data={
            'type': 'party_invitation',
            'party_id': str(party.id),
            'inviter_id': str(inviter.id)
        },
        action_url=f"/parties/{party.id}"
    )


def send_friend_request_push(addressee, requester):
    """Send friend request push notification"""
    return mobile_push_service.send_to_user(
        user=addressee,
        title="Friend Request",
        body=f"{requester.username} sent you a friend request",
        data={
            'type': 'friend_request',
            'requester_id': str(requester.id)
        },
        action_url="/friends/requests"
    )


def send_party_starting_push(participants, party):
    """Send party starting soon push notification"""
    return mobile_push_service.send_to_multiple_users(
        users=participants,
        title="Party Starting Soon",
        body=f"'{party.title}' starts in 15 minutes",
        data={
            'type': 'party_starting',
            'party_id': str(party.id)
        },
        action_url=f"/parties/{party.id}"
    )


def send_video_processed_push(user, video):
    """Send video processing complete push notification"""
    return mobile_push_service.send_to_user(
        user=user,
        title="Video Ready",
        body=f"Your video '{video.title}' is ready to watch",
        data={
            'type': 'video_processed',
            'video_id': str(video.id)
        },
        action_url=f"/videos/{video.id}"
    )


def send_comment_reply_push(user, commenter, content_title: str):
    """Send comment reply push notification"""
    return mobile_push_service.send_to_user(
        user=user,
        title="New Reply",
        body=f"{commenter.username} replied to your comment on '{content_title}'",
        data={
            'type': 'comment_reply',
            'commenter_id': str(commenter.id)
        }
    )
