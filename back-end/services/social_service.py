"""
Enhanced Social Features Service for Watch Party Backend
"""

from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Prefetch
from django.utils import timezone
from datetime import timedelta
from typing import List, Dict, Any, Optional
import logging

from apps.users.models import Friendship, UserActivity
from apps.parties.models import WatchParty
from apps.videos.models import Video
from apps.analytics.models import AnalyticsEvent
from services.notification_service import notification_service

User = get_user_model()
logger = logging.getLogger(__name__)


class SocialService:
    """Service for managing social features and interactions"""
    
    def __init__(self):
        self.logger = logger
    
    def send_friend_request(self, requester: User, addressee_username: str) -> Dict[str, Any]:
        """Send a friend request to another user"""
        try:
            # Get the addressee user
            try:
                addressee = User.objects.get(username=addressee_username)
            except User.DoesNotExist:
                return {'success': False, 'error': 'User not found'}
            
            # Check if users are the same
            if requester == addressee:
                return {'success': False, 'error': 'Cannot send friend request to yourself'}
            
            # Check if friendship already exists
            existing_friendship = Friendship.objects.filter(
                Q(from_user=requester, to_user=addressee) |
                Q(from_user=addressee, to_user=requester)
            ).first()
            
            if existing_friendship:
                if existing_friendship.status == 'accepted':
                    return {'success': False, 'error': 'Already friends'}
                elif existing_friendship.status == 'pending':
                    return {'success': False, 'error': 'Friend request already sent'}
                elif existing_friendship.status == 'blocked':
                    return {'success': False, 'error': 'Cannot send friend request'}
            
            # Create friend request
            friendship = Friendship.objects.create(
                from_user=requester,
                to_user=addressee,
                status='pending'
            )
            
            # Send notification
            notification_service.send_friend_request_notification(requester, addressee)
            
            # Log activity
            UserActivity.objects.create(
                user=requester,
                activity_type='friend_request_sent',
                target_user=addressee
            )
            
            return {
                'success': True,
                'friendship_id': str(friendship.id),
                'message': f'Friend request sent to {addressee.username}'
            }
            
        except Exception as e:
            self.logger.error(f"Failed to send friend request: {str(e)}")
            return {'success': False, 'error': 'Failed to send friend request'}
    
    def accept_friend_request(self, user: User, friendship_id: str) -> Dict[str, Any]:
        """Accept a friend request"""
        try:
            friendship = Friendship.objects.get(
                id=friendship_id,
                to_user=user,
                status='pending'
            )
            
            # Update friendship status
            friendship.status = 'accepted'
            friendship.save()
            
            # Send notification to requester
            notification_service.send_notification(
                user=friendship.from_user,
                notification_type='friend_accepted',
                context={
                    'accepter_name': user.get_full_name() or user.username,
                    'accepter_username': user.username
                }
            )
            
            # Log activities
            UserActivity.objects.bulk_create([
                UserActivity(
                    user=user,
                    activity_type='friend_request_accepted',
                    target_user=friendship.from_user
                ),
                UserActivity(
                    user=friendship.from_user,
                    activity_type='friend_gained',
                    target_user=user
                )
            ])
            
            return {
                'success': True,
                'message': f'You are now friends with {friendship.from_user.username}'
            }
            
        except Friendship.DoesNotExist:
            return {'success': False, 'error': 'Friend request not found'}
        except Exception as e:
            self.logger.error(f"Failed to accept friend request: {str(e)}")
            return {'success': False, 'error': 'Failed to accept friend request'}
    
    def decline_friend_request(self, user: User, friendship_id: str) -> Dict[str, Any]:
        """Decline a friend request"""
        try:
            friendship = Friendship.objects.get(
                id=friendship_id,
                to_user=user,
                status='pending'
            )
            
            # Delete the friendship request
            friendship.delete()
            
            # Log activity
            UserActivity.objects.create(
                user=user,
                activity_type='friend_request_declined',
                target_user=friendship.from_user
            )
            
            return {
                'success': True,
                'message': 'Friend request declined'
            }
            
        except Friendship.DoesNotExist:
            return {'success': False, 'error': 'Friend request not found'}
        except Exception as e:
            self.logger.error(f"Failed to decline friend request: {str(e)}")
            return {'success': False, 'error': 'Failed to decline friend request'}
    
    def remove_friend(self, user: User, friend_username: str) -> Dict[str, Any]:
        """Remove a friend"""
        try:
            friend = User.objects.get(username=friend_username)
            
            # Find the friendship
            friendship = Friendship.objects.filter(
                Q(from_user=user, to_user=friend) |
                Q(from_user=friend, to_user=user),
                status='accepted'
            ).first()
            
            if not friendship:
                return {'success': False, 'error': 'Not friends with this user'}
            
            # Delete the friendship
            friendship.delete()
            
            # Log activities
            UserActivity.objects.bulk_create([
                UserActivity(
                    user=user,
                    activity_type='friend_removed',
                    target_user=friend
                ),
                UserActivity(
                    user=friend,
                    activity_type='friend_lost',
                    target_user=user
                )
            ])
            
            return {
                'success': True,
                'message': f'Removed {friend.username} from friends'
            }
            
        except User.DoesNotExist:
            return {'success': False, 'error': 'User not found'}
        except Exception as e:
            self.logger.error(f"Failed to remove friend: {str(e)}")
            return {'success': False, 'error': 'Failed to remove friend'}
    
    def get_friends_list(self, user: User) -> List[Dict[str, Any]]:
        """Get user's friends list"""
        try:
            # Get accepted friendships
            friendships = Friendship.objects.filter(
                Q(from_user=user) | Q(to_user=user),
                status='accepted'
            ).select_related('from_user', 'to_user')
            
            friends = []
            for friendship in friendships:
                friend = friendship.to_user if friendship.from_user == user else friendship.from_user
                
                # Get recent activity
                recent_activity = UserActivity.objects.filter(
                    user=friend
                ).order_by('-created_at').first()
                
                friends.append({
                    'id': str(friend.id),
                    'username': friend.username,
                    'full_name': friend.get_full_name(),
                    'avatar': getattr(friend.profile, 'avatar', None) if hasattr(friend, 'profile') else None,
                    'is_online': self._is_user_online(friend),
                    'last_activity': recent_activity.created_at if recent_activity else None,
                    'friendship_since': friendship.created_at
                })
            
            return friends
            
        except Exception as e:
            self.logger.error(f"Failed to get friends list: {str(e)}")
            return []
    
    def get_friend_requests(self, user: User, type: str = 'received') -> List[Dict[str, Any]]:
        """Get friend requests (received or sent)"""
        try:
            if type == 'received':
                friendships = Friendship.objects.filter(
                    to_user=user,
                    status='pending'
                ).select_related('from_user').order_by('-created_at')
                
                requests = []
                for friendship in friendships:
                    requests.append({
                        'id': str(friendship.id),
                        'from_user': {
                            'id': str(friendship.from_user.id),
                            'username': friendship.from_user.username,
                            'full_name': friendship.from_user.get_full_name(),
                            'avatar': getattr(friendship.from_user.profile, 'avatar', None) if hasattr(friendship.from_user, 'profile') else None
                        },
                        'created_at': friendship.created_at
                    })
                
            else:  # sent
                friendships = Friendship.objects.filter(
                    from_user=user,
                    status='pending'
                ).select_related('to_user').order_by('-created_at')
                
                requests = []
                for friendship in friendships:
                    requests.append({
                        'id': str(friendship.id),
                        'to_user': {
                            'id': str(friendship.to_user.id),
                            'username': friendship.to_user.username,
                            'full_name': friendship.to_user.get_full_name(),
                            'avatar': getattr(friendship.to_user.profile, 'avatar', None) if hasattr(friendship.to_user, 'profile') else None
                        },
                        'created_at': friendship.created_at
                    })
            
            return requests
            
        except Exception as e:
            self.logger.error(f"Failed to get friend requests: {str(e)}")
            return []
    
    def search_users(self, query: str, current_user: User, limit: int = 20) -> List[Dict[str, Any]]:
        """Search for users"""
        try:
            # Search users by username, first name, or last name
            users = User.objects.filter(
                Q(username__icontains=query) |
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query),
                is_active=True
            ).exclude(
                id=current_user.id  # Exclude current user
            ).select_related('profile')[:limit]
            
            # Get friendship status for each user
            user_ids = [user.id for user in users]
            friendships = Friendship.objects.filter(
                Q(from_user=current_user, to_user_id__in=user_ids) |
                Q(from_user_id__in=user_ids, to_user=current_user)
            ).values('from_user_id', 'to_user_id', 'status')
            
            # Create friendship status mapping
            friendship_status = {}
            for fs in friendships:
                if fs['from_user_id'] == current_user.id:
                    friendship_status[fs['to_user_id']] = fs['status']
                else:
                    friendship_status[fs['from_user_id']] = fs['status']
            
            results = []
            for user in users:
                status = friendship_status.get(user.id, 'none')
                
                results.append({
                    'id': str(user.id),
                    'username': user.username,
                    'full_name': user.get_full_name(),
                    'avatar': getattr(user.profile, 'avatar', None) if hasattr(user, 'profile') else None,
                    'friendship_status': status,
                    'is_online': self._is_user_online(user)
                })
            
            return results
            
        except Exception as e:
            self.logger.error(f"Failed to search users: {str(e)}")
            return []
    
    def get_activity_feed(self, user: User, limit: int = 50) -> List[Dict[str, Any]]:
        """Get activity feed for user (friends' activities)"""
        try:
            # Get friends
            friend_ids = Friendship.objects.filter(
                Q(from_user=user) | Q(to_user=user),
                status='accepted'
            ).values_list('from_user_id', 'to_user_id')
            
            all_friend_ids = set()
            for from_id, to_id in friend_ids:
                all_friend_ids.add(from_id if from_id != user.id else to_id)
            
            # Get recent activities from friends
            activities = UserActivity.objects.filter(
                user_id__in=all_friend_ids,
                activity_type__in=[
                    'video_upload', 'party_create', 'friend_gained'
                ]
            ).select_related('user', 'target_user').order_by('-created_at')[:limit]
            
            feed = []
            for activity in activities:
                activity_data = {
                    'id': str(activity.id),
                    'user': {
                        'id': str(activity.user.id),
                        'username': activity.user.username,
                        'full_name': activity.user.get_full_name(),
                        'avatar': getattr(activity.user.profile, 'avatar', None) if hasattr(activity.user, 'profile') else None
                    },
                    'activity_type': activity.activity_type,
                    'created_at': activity.created_at,
                    'metadata': activity.metadata or {}
                }
                
                if activity.target_user:
                    activity_data['target_user'] = {
                        'id': str(activity.target_user.id),
                        'username': activity.target_user.username,
                        'full_name': activity.target_user.get_full_name()
                    }
                
                feed.append(activity_data)
            
            return feed
            
        except Exception as e:
            self.logger.error(f"Failed to get activity feed: {str(e)}")
            return []
    
    def get_friend_suggestions(self, user: User, limit: int = 10) -> List[Dict[str, Any]]:
        """Get friend suggestions based on mutual friends and common interests"""
        try:
            # Get current friends
            current_friends = Friendship.objects.filter(
                Q(from_user=user) | Q(to_user=user),
                status='accepted'
            ).values_list('from_user_id', 'to_user_id')
            
            current_friend_ids = set()
            for from_id, to_id in current_friends:
                current_friend_ids.add(from_id if from_id != user.id else to_id)
            
            # Get mutual friends (friends of friends)
            mutual_friends = Friendship.objects.filter(
                Q(from_user_id__in=current_friend_ids) | Q(to_user_id__in=current_friend_ids),
                status='accepted'
            ).exclude(
                Q(from_user=user) | Q(to_user=user)
            ).values_list('from_user_id', 'to_user_id')
            
            suggestion_ids = set()
            for from_id, to_id in mutual_friends:
                suggestion_ids.add(from_id)
                suggestion_ids.add(to_id)
            
            # Remove current friends and self
            suggestion_ids -= current_friend_ids
            suggestion_ids.discard(user.id)
            
            # Get pending requests to exclude
            pending_requests = Friendship.objects.filter(
                Q(from_user=user) | Q(to_user=user),
                status='pending'
            ).values_list('from_user_id', 'to_user_id')
            
            pending_ids = set()
            for from_id, to_id in pending_requests:
                pending_ids.add(from_id if from_id != user.id else to_id)
            
            suggestion_ids -= pending_ids
            
            # Get user objects
            suggestions = User.objects.filter(
                id__in=list(suggestion_ids)[:limit * 2],  # Get more to filter
                is_active=True
            ).select_related('profile')
            
            # Calculate mutual friend count for ranking
            suggestions_data = []
            for suggested_user in suggestions:
                mutual_count = Friendship.objects.filter(
                    Q(
                        Q(from_user__in=current_friend_ids, to_user=suggested_user) |
                        Q(from_user=suggested_user, to_user__in=current_friend_ids)
                    ),
                    status='accepted'
                ).count()
                
                suggestions_data.append({
                    'id': str(suggested_user.id),
                    'username': suggested_user.username,
                    'full_name': suggested_user.get_full_name(),
                    'avatar': getattr(suggested_user.profile, 'avatar', None) if hasattr(suggested_user, 'profile') else None,
                    'mutual_friends_count': mutual_count,
                    'is_online': self._is_user_online(suggested_user)
                })
            
            # Sort by mutual friends count and return top suggestions
            suggestions_data.sort(key=lambda x: x['mutual_friends_count'], reverse=True)
            return suggestions_data[:limit]
            
        except Exception as e:
            self.logger.error(f"Failed to get friend suggestions: {str(e)}")
            return []
    
    def _is_user_online(self, user: User) -> bool:
        """Check if user is currently online"""
        if not user.last_login:
            return False
        
        # Consider user online if they were active in the last 15 minutes
        threshold = timezone.now() - timedelta(minutes=15)
        return user.last_login >= threshold
    
    def block_user(self, user: User, target_username: str) -> Dict[str, Any]:
        """Block a user"""
        try:
            target_user = User.objects.get(username=target_username)
            
            if user == target_user:
                return {'success': False, 'error': 'Cannot block yourself'}
            
            # Find existing friendship and update or create new blocked relationship
            friendship = Friendship.objects.filter(
                Q(from_user=user, to_user=target_user) |
                Q(from_user=target_user, to_user=user)
            ).first()
            
            if friendship:
                friendship.status = 'blocked'
                friendship.from_user = user  # Blocker becomes from_user
                friendship.to_user = target_user
                friendship.save()
            else:
                Friendship.objects.create(
                    from_user=user,
                    to_user=target_user,
                    status='blocked'
                )
            
            # Log activity
            UserActivity.objects.create(
                user=user,
                activity_type='user_blocked',
                target_user=target_user
            )
            
            return {
                'success': True,
                'message': f'Blocked {target_user.username}'
            }
            
        except User.DoesNotExist:
            return {'success': False, 'error': 'User not found'}
        except Exception as e:
            self.logger.error(f"Failed to block user: {str(e)}")
            return {'success': False, 'error': 'Failed to block user'}
    
    def unblock_user(self, user: User, target_username: str) -> Dict[str, Any]:
        """Unblock a user"""
        try:
            target_user = User.objects.get(username=target_username)
            
            # Find blocked relationship
            friendship = Friendship.objects.filter(
                from_user=user,
                to_user=target_user,
                status='blocked'
            ).first()
            
            if not friendship:
                return {'success': False, 'error': 'User is not blocked'}
            
            # Remove the block
            friendship.delete()
            
            # Log activity
            UserActivity.objects.create(
                user=user,
                activity_type='user_unblocked',
                target_user=target_user
            )
            
            return {
                'success': True,
                'message': f'Unblocked {target_user.username}'
            }
            
        except User.DoesNotExist:
            return {'success': False, 'error': 'User not found'}
        except Exception as e:
            self.logger.error(f"Failed to unblock user: {str(e)}")
            return {'success': False, 'error': 'Failed to unblock user'}


# Create singleton instance
social_service = SocialService()
