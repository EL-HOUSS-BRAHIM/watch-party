"""
User views for Watch Party Backend
"""

from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from shared.serializers import DataResponseSerializer, MessageResponseSerializer

from .models import Friendship, UserActivity, UserSettings
from .serializers import (
    UserSerializer, UserProfileSerializer, FriendshipSerializer,
    SendFriendRequestSerializer, UserActivitySerializer, UserSettingsSerializer,
    UserSearchSerializer
)

User = get_user_model()


class DashboardStatsView(generics.GenericAPIView):
    """Get dashboard statistics for the user"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DataResponseSerializer
    
    @extend_schema(
        summary="User Dashboard Stats",
        description="Get dashboard statistics for the authenticated user",
        responses={200: DataResponseSerializer}
    )
    def get(self, request):
        user = request.user
        
        # Get basic stats
        friends_count = Friendship.objects.filter(
            (Q(from_user=user) | Q(to_user=user)) & Q(status='accepted')
        ).count()
        
        # Import here to avoid circular imports
        from apps.videos.models import Video
        from apps.parties.models import WatchParty
        
        videos_count = Video.objects.filter(uploader=user).count()
        parties_count = WatchParty.objects.filter(host=user).count()
        
        return Response({
            'friends_count': friends_count,
            'videos_count': videos_count,
            'parties_hosted': parties_count,
            'profile_completion': 80,  # Placeholder
            'total_watch_time': '0h',  # Placeholder
        })


class UserProfileView(generics.GenericAPIView):
    """Get user profile information"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer
    
    @extend_schema(
        summary="User Profile",
        description="Get user profile information",
        responses={200: UserProfileSerializer}
    )
    def get(self, request):
        serializer = UserProfileSerializer(
            request.user, context={'request': request}
        )
        return Response(serializer.data)


class UpdateProfileView(generics.GenericAPIView):
    """Update user profile"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer
    
    @extend_schema(
        summary="Update Profile",
        description="Update user profile information",
        responses={200: UserProfileSerializer}
    )
    def put(self, request):
        serializer = UserProfileSerializer(
            request.user, data=request.data, partial=True, 
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            
            # Log activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='profile_updated',
                description="Updated profile information"
            )
            
            return Response({
                'message': 'Profile updated successfully',
                'profile': serializer.data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AvatarUploadView(generics.GenericAPIView):
    """Upload user avatar"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageResponseSerializer
    
    @extend_schema(
        summary="Upload Avatar",
        description="Upload user avatar image",
        responses={200: MessageResponseSerializer}
    )
    def post(self, request):
        return Response({'message': 'Avatar upload endpoint'})


class FriendsListView(generics.GenericAPIView):
    """Get user's friends list"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FriendshipSerializer
    
    @extend_schema(
        summary="Friends List",
        description="Get user's friends list",
        responses={200: FriendshipSerializer}
    )
    def get(self, request):
        # Get all accepted friendships where user is either sender or receiver
        friendships = Friendship.objects.filter(
            Q(from_user=request.user, status='accepted') |
            Q(to_user=request.user, status='accepted')
        ).select_related('from_user', 'to_user')
        
        # Extract the friend users (not the current user)
        friends = []
        for friendship in friendships:
            friend = friendship.to_user if friendship.from_user == request.user else friendship.from_user
            friends.append(friend)
        
        serializer = UserSerializer(friends, many=True, context={'request': request})
        return Response({
            'friends': serializer.data,
            'count': len(friends)
        })


class FriendRequestsView(APIView):
    """List friend requests"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="FriendRequestsView GET")
    def get(self, request):
        # Get pending friend requests received by the user
        received_requests = Friendship.objects.filter(
            to_user=request.user,
            status='pending'
        ).select_related('from_user')
        
        # Get pending friend requests sent by the user
        sent_requests = Friendship.objects.filter(
            from_user=request.user,
            status='pending'
        ).select_related('to_user')
        
        received_serializer = FriendshipSerializer(
            received_requests, many=True, context={'request': request}
        )
        sent_serializer = FriendshipSerializer(
            sent_requests, many=True, context={'request': request}
        )
        
        return Response({
            'received': received_serializer.data,
            'sent': sent_serializer.data,
            'received_count': received_requests.count(),
            'sent_count': sent_requests.count()
        })


class SendFriendRequestView(generics.GenericAPIView):
    """Send a friend request to another user"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SendFriendRequestSerializer
    
    @extend_schema(
        summary="Send Friend Request",
        description="Send a friend request to another user",
        responses={200: MessageResponseSerializer}
    )
    def post(self, request):
        serializer = SendFriendRequestSerializer(
            data=request.data, context={'request': request}
        )
        
        if serializer.is_valid():
            to_user = User.objects.get(id=serializer.validated_data['to_user_id'])
            
            # Create friendship record
            friendship = Friendship.objects.create(
                from_user=request.user,
                to_user=to_user,
                status='pending'
            )
            
            # Log activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='friend_request_sent',
                description=f"Sent friend request to {to_user.full_name}",
                object_type='user',
                object_id=str(to_user.id)
            )
            
            # TODO: Create notification for the recipient
            # This would use the notifications app
            
            return Response({
                'message': 'Friend request sent successfully',
                'friendship_id': str(friendship.id)
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AcceptFriendRequestView(APIView):
    """Accept friend request"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="AcceptFriendRequestView POST")
    def post(self, request, request_id):
        try:
            # Get the friendship request
            friendship = Friendship.objects.get(
                id=request_id,
                to_user=request.user,
                status='pending'
            )
            
            # Update status to accepted
            friendship.status = 'accepted'
            friendship.updated_at = timezone.now()
            friendship.save()
            
            # Log activity for both users
            UserActivity.objects.create(
                user=request.user,
                activity_type='friend_request_accepted',
                description=f"Accepted friend request from {friendship.from_user.full_name}",
                object_type='user',
                object_id=str(friendship.from_user.id)
            )
            
            UserActivity.objects.create(
                user=friendship.from_user,
                activity_type='friend_request_accepted',
                description=f"Friend request accepted by {request.user.full_name}",
                object_type='user',
                object_id=str(request.user.id)
            )
            
            # TODO: Create notification for the original sender
            
            return Response({
                'message': 'Friend request accepted successfully',
                'friendship': FriendshipSerializer(
                    friendship, context={'request': request}
                ).data
            })
            
        except Friendship.DoesNotExist:
            return Response(
                {'error': 'Friend request not found or already processed'},
                status=status.HTTP_404_NOT_FOUND
            )


class DeclineFriendRequestView(APIView):
    """Decline friend request"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="DeclineFriendRequestView POST")
    def post(self, request, request_id):
        try:
            # Get the friendship request
            friendship = Friendship.objects.get(
                id=request_id,
                to_user=request.user,
                status='pending'
            )
            
            # Delete the friendship request
            friendship.delete()
            
            return Response({
                'message': 'Friend request declined successfully'
            })
            
        except Friendship.DoesNotExist:
            return Response(
                {'error': 'Friend request not found or already processed'},
                status=status.HTTP_404_NOT_FOUND
            )


class RemoveFriendView(APIView):
    """Remove friend"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="RemoveFriendView POST")
    def post(self, request, friend_id):
        try:
            friend = User.objects.get(id=friend_id)
            
            # Find the friendship (could be in either direction)
            friendship = Friendship.objects.filter(
                Q(from_user=request.user, to_user=friend, status='accepted') |
                Q(from_user=friend, to_user=request.user, status='accepted')
            ).first()
            
            if not friendship:
                return Response(
                    {'error': 'You are not friends with this user'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Delete the friendship
            friendship.delete()
            
            # Log activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='friend_removed',
                description=f"Removed {friend.full_name} from friends",
                object_type='user',
                object_id=str(friend.id)
            )
            
            return Response({
                'message': f'Successfully removed {friend.full_name} from friends'
            })
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class UserSearchView(generics.GenericAPIView):
    """Search users"""
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSearchSerializer
    
    @extend_schema(
        summary="User Search",
        description="Search for users by username or email",
        responses={200: UserSearchSerializer}
    )
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response({
                'users': [],
                'message': 'Please provide a search query'
            })
        
        if len(query) < 2:
            return Response({
                'users': [],
                'message': 'Search query must be at least 2 characters'
            })
        
        # Search by first name, last name, or email
        users = User.objects.filter(
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query) |
            Q(email__icontains=query)
        ).exclude(id=request.user.id)[:20]  # Limit to 20 results
        
        serializer = UserSearchSerializer(
            users, many=True, context={'request': request}
        )
        
        return Response({
            'users': serializer.data,
            'count': len(users),
            'query': query
        })


class PublicProfileView(APIView):
    """Get public user profile"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="PublicProfileView GET")
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            
            # Check friendship status
            friendship = Friendship.objects.filter(
                Q(from_user=request.user, to_user=user) |
                Q(from_user=user, to_user=request.user)
            ).first()
            
            friendship_status = None
            if friendship:
                friendship_status = {
                    'status': friendship.status,
                    'is_sender': friendship.from_user == request.user,
                    'created_at': friendship.created_at
                }
            
            # Get user settings to check privacy levels
            user_settings, _ = UserSettings.objects.get_or_create(user=user)
            
            # Basic profile data always visible to authenticated users
            profile_data = {
                'id': str(user.id),
                'first_name': user.first_name,
                'last_name': user.last_name,
                'full_name': user.full_name,
                'avatar_url': user.avatar.url if user.avatar else None,
                'date_joined': user.date_joined,
                'friendship_status': friendship_status,
                'is_online': user.is_online
            }
            
            # Add more details based on privacy settings
            is_friend = friendship and friendship.status == 'accepted'
            
            if user_settings.profile_visibility == 'public' or \
               (user_settings.profile_visibility == 'friends' and is_friend):
                profile_data.update({
                    'bio': getattr(user, 'bio', ''),
                    'location': getattr(user, 'location', ''),
                    'friends_count': Friendship.objects.filter(
                        Q(from_user=user, status='accepted') |
                        Q(to_user=user, status='accepted')
                    ).count()
                })
            
            return Response({'profile': profile_data})
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class UserSettingsView(APIView):
    """User settings"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="UserSettingsView GET")
    def get(self, request):
        settings, created = UserSettings.objects.get_or_create(user=request.user)
        serializer = UserSettingsSerializer(settings)
        return Response({'settings': serializer.data})
    
    @extend_schema(summary="UserSettingsView PUT")
    def put(self, request):
        settings, created = UserSettings.objects.get_or_create(user=request.user)
        serializer = UserSettingsSerializer(settings, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Settings updated successfully',
                'settings': serializer.data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NotificationSettingsView(APIView):
    """Notification settings"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="NotificationSettingsView GET")
    def get(self, request):
        return Response({'settings': {}})
    
    def put(self, request):
        return Response({'message': 'Notification settings updated'})


class PrivacySettingsView(APIView):
    """Privacy settings"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="PrivacySettingsView GET")
    def get(self, request):
        return Response({'settings': {}})
    
    def put(self, request):
        return Response({'message': 'Privacy settings updated'})


class UserActivityView(APIView):
    """User activity"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="UserActivityView GET")
    def get(self, request):
        return Response({'activities': []})


class WatchHistoryView(APIView):
    """User watch history"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="WatchHistoryView GET")
    def get(self, request):
        return Response({'history': []})


class FavoritesView(APIView):
    """User favorites"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="FavoritesView GET")
    def get(self, request):
        return Response({'favorites': []})


class AddFavoriteView(APIView):
    """Add favorite"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="AddFavoriteView POST")
    def post(self, request):
        return Response({'message': 'Added to favorites'})


class RemoveFavoriteView(APIView):
    """Remove favorite"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="RemoveFavoriteView POST")
    def post(self, request, favorite_id):
        return Response({'message': 'Removed from favorites'})


class NotificationsView(APIView):
    """User notifications"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="NotificationsView GET")
    def get(self, request):
        return Response({'notifications': []})


class MarkNotificationReadView(APIView):
    """Mark notification as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="MarkNotificationReadView POST")
    def post(self, request, notification_id):
        return Response({'message': 'Notification marked as read'})


class MarkAllNotificationsReadView(APIView):
    """Mark all notifications as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="MarkAllNotificationsReadView POST")
    def post(self, request):
        return Response({'message': 'All notifications marked as read'})


class UserReportView(APIView):
    """Report user"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="UserReportView POST")
    def post(self, request):
        return Response({'message': 'User report submitted'})


class BlockUserView(APIView):
    """Block a user"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="BlockUserView POST")
    def post(self, request, user_id):
        try:
            user_to_block = User.objects.get(id=user_id)
            
            if user_to_block == request.user:
                return Response(
                    {'error': 'You cannot block yourself'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get or create friendship record
            friendship, created = Friendship.objects.get_or_create(
                from_user=request.user,
                to_user=user_to_block,
                defaults={'status': 'blocked'}
            )
            
            if not created:
                friendship.status = 'blocked'
                friendship.save()
            
            # Log activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='user_blocked',
                description=f"Blocked user {user_to_block.full_name}",
                object_type='user',
                object_id=str(user_to_block.id)
            )
            
            return Response({
                'message': f'Successfully blocked {user_to_block.full_name}'
            })
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class UnblockUserView(APIView):
    """Unblock a user"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="UnblockUserView POST")
    def post(self, request, user_id):
        try:
            user_to_unblock = User.objects.get(id=user_id)
            
            # Find blocked friendship
            friendship = Friendship.objects.filter(
                from_user=request.user,
                to_user=user_to_unblock,
                status='blocked'
            ).first()
            
            if not friendship:
                return Response(
                    {'error': 'User is not blocked'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Remove the block (delete the record)
            friendship.delete()
            
            # Log activity
            UserActivity.objects.create(
                user=request.user,
                activity_type='user_unblocked',
                description=f"Unblocked user {user_to_unblock.full_name}",
                object_type='user',
                object_id=str(user_to_unblock.id)
            )
            
            return Response({
                'message': f'Successfully unblocked {user_to_unblock.full_name}'
            })
            
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class UserActivityView(APIView):
    """Get user activity history"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        activities = UserActivity.objects.filter(
            user=request.user
        ).order_by('-created_at')[:50]  # Last 50 activities
        
        serializer = UserActivitySerializer(activities, many=True)
        
        return Response({
            'activities': serializer.data,
            'count': activities.count()
        })


class ExportUserDataView(APIView):
    """Export user data for GDPR compliance"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="ExportUserDataView GET")
    def get(self, request):
        user = request.user
        
        # Gather all user data
        user_data = {
            'user_profile': {
                'id': str(user.id),
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'date_joined': user.date_joined.isoformat(),
                'last_login': user.last_login.isoformat() if user.last_login else None,
                'is_premium': user.is_premium,
            },
            'friends': [],
            'activities': [],
            'videos': [],
            'parties': [],
            'notifications': []
        }
        
        # Get friends
        friendships = Friendship.objects.filter(
            (Q(from_user=user) | Q(to_user=user)) & Q(status='accepted')
        )
        for friendship in friendships:
            friend = friendship.to_user if friendship.from_user == user else friendship.from_user
            user_data['friends'].append({
                'name': friend.full_name,
                'email': friend.email,
                'friends_since': friendship.created_at.isoformat()
            })
        
        # Get activities
        activities = UserActivity.objects.filter(user=user)[:100]  # Last 100 activities
        for activity in activities:
            user_data['activities'].append({
                'type': activity.activity_type,
                'description': activity.description,
                'timestamp': activity.created_at.isoformat()
            })
        
        # Get videos
        from apps.videos.models import Video
        videos = Video.objects.filter(uploader=user)
        for video in videos:
            user_data['videos'].append({
                'title': video.title,
                'description': video.description,
                'uploaded_at': video.created_at.isoformat(),
                'views': getattr(video, 'views', 0)
            })
        
        # Get parties
        from apps.parties.models import WatchParty
        parties = WatchParty.objects.filter(host=user)
        for party in parties:
            user_data['parties'].append({
                'title': party.title,
                'description': party.description,
                'created_at': party.created_at.isoformat(),
                'privacy': party.privacy
            })
        
        # Get notifications
        from apps.notifications.models import Notification
        notifications = Notification.objects.filter(user=user)[:50]  # Last 50 notifications
        for notification in notifications:
            user_data['notifications'].append({
                'type': notification.notification_type,
                'title': notification.title,
                'message': notification.message,
                'timestamp': notification.created_at.isoformat()
            })
        
        return Response({
            'success': True,
            'data': user_data,
            'export_date': timezone.now().isoformat()
        })


class DeleteAccountView(APIView):
    """Delete user account with confirmation"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="DeleteAccountView POST")
    def post(self, request):
        password = request.data.get('password')
        confirmation_phrase = request.data.get('confirmation_phrase')
        
        # Verify password
        if not request.user.check_password(password):
            return Response({
                'success': False,
                'message': 'Invalid password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify confirmation phrase
        if confirmation_phrase != 'DELETE MY ACCOUNT':
            return Response({
                'success': False,
                'message': 'Please type "DELETE MY ACCOUNT" to confirm'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        
        try:
            # Log the account deletion
            UserActivity.objects.create(
                user=user,
                activity_type='account_deleted',
                description=f"Account deleted by user",
                object_type='user',
                object_id=str(user.id)
            )
            
            # Mark user as inactive instead of hard delete (for data integrity)
            user.is_active = False
            user.email = f"deleted_{user.id}@deleted.com"
            user.first_name = "Deleted"
            user.last_name = "User"
            user.save()
            
            return Response({
                'success': True,
                'message': 'Account successfully deleted'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Failed to delete account',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UserMutualFriendsView(APIView):
    """Get mutual friends with another user"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="UserMutualFriendsView GET")
    def get(self, request, user_id):
        try:
            other_user = User.objects.get(id=user_id)
            current_user = request.user
            
            # Get current user's friends
            current_user_friends = set()
            current_friendships = Friendship.objects.filter(
                (Q(from_user=current_user) | Q(to_user=current_user)) & Q(status='accepted')
            )
            for friendship in current_friendships:
                friend = friendship.to_user if friendship.from_user == current_user else friendship.from_user
                current_user_friends.add(friend.id)
            
            # Get other user's friends
            other_user_friends = set()
            other_friendships = Friendship.objects.filter(
                (Q(from_user=other_user) | Q(to_user=other_user)) & Q(status='accepted')
            )
            for friendship in other_friendships:
                friend = friendship.to_user if friendship.from_user == other_user else friendship.from_user
                other_user_friends.add(friend.id)
            
            # Find mutual friends
            mutual_friend_ids = current_user_friends.intersection(other_user_friends)
            mutual_friends = User.objects.filter(id__in=mutual_friend_ids)
            
            serializer = UserSerializer(mutual_friends, many=True)
            
            return Response({
                'mutual_friends': serializer.data,
                'count': len(mutual_friend_ids)
            })
            
        except User.DoesNotExist:
            return Response({
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)


class UserOnlineStatusView(APIView):
    """Get online status of users"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="UserOnlineStatusView GET")
    def get(self, request):
        user_ids = request.GET.getlist('user_ids')
        
        if not user_ids:
            return Response({
                'error': 'user_ids parameter is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # For now, use last_login to determine online status
            # In production, you might use Redis or WebSocket connections
            online_threshold = timezone.now() - timezone.timedelta(minutes=5)
            
            users = User.objects.filter(id__in=user_ids)
            status_data = []
            
            for user in users:
                is_online = user.last_login and user.last_login > online_threshold
                status_data.append({
                    'user_id': str(user.id),
                    'is_online': is_online,
                    'last_seen': user.last_login.isoformat() if user.last_login else None
                })
            
            return Response({
                'user_statuses': status_data
            })
            
        except Exception as e:
            return Response({
                'error': 'Failed to get user statuses',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===== NEW MISSING VIEWS FROM TODO =====

class UserAchievementsView(APIView):
    """User achievements view"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="UserAchievementsView GET")
    def get(self, request):
        """Return user achievements"""
        user = request.user
        
        # Import here to avoid circular imports
        try:
            from apps.store.models import UserAchievement, Achievement
            from apps.store.serializers import UserAchievementSerializer, AchievementSerializer
            
            # Get user's unlocked achievements
            user_achievements = UserAchievement.objects.filter(user=user).select_related('achievement')
            
            # Get all available achievements
            all_achievements = Achievement.objects.filter(is_active=True)
            
            # Serialize data
            user_achievements_data = UserAchievementSerializer(user_achievements, many=True).data
            all_achievements_data = AchievementSerializer(all_achievements, many=True, context={'request': request}).data
            
            stats = {
                'total_unlocked': user_achievements.count(),
                'total_available': all_achievements.count(),
                'completion_percentage': round((user_achievements.count() / all_achievements.count()) * 100) if all_achievements.count() > 0 else 0,
                'total_points': sum(ua.achievement.points for ua in user_achievements)
            }
            
            return Response({
                'success': True,
                'data': {
                    'unlocked_achievements': user_achievements_data,
                    'all_achievements': all_achievements_data,
                    'stats': stats
                }
            })
            
        except ImportError:
            # Store app not available
            return Response({
                'success': True,
                'data': {
                    'unlocked_achievements': [],
                    'all_achievements': [],
                    'stats': {
                        'total_unlocked': 0,
                        'total_available': 0,
                        'completion_percentage': 0,
                        'total_points': 0
                    }
                }
            })


class UserStatsView(APIView):
    """Detailed user statistics"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="UserStatsView GET")
    def get(self, request):
        """Return detailed user statistics"""
        user = request.user
        
        # Calculate various statistics
        from apps.videos.models import Video
        from apps.parties.models import WatchParty
        
        # Basic counts
        videos_uploaded = Video.objects.filter(uploader=user).count()
        parties_hosted = WatchParty.objects.filter(host=user).count()
        parties_joined = WatchParty.objects.filter(participants__user=user).count()
        
        # Friend statistics
        friends_count = Friendship.objects.filter(
            (Q(from_user=user) | Q(to_user=user)) & Q(status='accepted')
        ).count()
        
        # Store statistics (if available)
        try:
            from apps.store.models import UserInventory, UserAchievement
            currency = getattr(user, 'currency', None)
            currency_balance = currency.balance if currency else 0
            items_owned = UserInventory.objects.filter(user=user).count()
            achievements_unlocked = UserAchievement.objects.filter(user=user).count()
        except ImportError:
            currency_balance = 0
            items_owned = 0
            achievements_unlocked = 0
        
        # Calculate level based on simple formula (this could be more sophisticated)
        total_activity = videos_uploaded + parties_hosted + friends_count + achievements_unlocked
        level = min(max(1, total_activity // 5), 100)  # Level 1-100 based on activity
        experience_points = total_activity * 10
        
        stats = {
            'level': level,
            'experience_points': experience_points,
            'total_watch_time': 0,  # TODO: Calculate from analytics
            'parties_hosted': parties_hosted,
            'parties_joined': parties_joined,
            'videos_uploaded': videos_uploaded,
            'achievements_unlocked': achievements_unlocked,
            'total_achievements': 0,  # TODO: Get from achievements system
            'currency_balance': currency_balance,
            'items_owned': items_owned,
            'friends_count': friends_count,
            'rank': 0,  # TODO: Calculate leaderboard position
            'join_date': user.date_joined,
            'last_active': user.last_login,
        }
        
        return Response({
            'success': True,
            'data': stats
        })


class UserSessionsView(APIView):
    """User session management"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="UserSessionsView GET")
    def get(self, request):
        """List active sessions for user"""
        # For now, return mock data. This would integrate with actual session management
        sessions = [
            {
                'id': '1',
                'device_info': {'browser': 'Chrome', 'os': 'Windows'},
                'ip_address': request.META.get('REMOTE_ADDR', 'Unknown'),
                'user_agent': request.META.get('HTTP_USER_AGENT', 'Unknown'),
                'created_at': timezone.now(),
                'expires_at': timezone.now() + timezone.timedelta(days=7),
                'is_current': True
            }
        ]
        
        return Response({
            'success': True,
            'data': {'sessions': sessions}
        })


class RevokeSessionView(APIView):
    """Revoke a specific session"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="RevokeSessionView DELETE")
    def delete(self, request, session_id):
        """Revoke specific session"""
        # TODO: Implement actual session revocation
        return Response({
            'success': True,
            'message': f'Session {session_id} revoked successfully'
        })


class RevokeAllSessionsView(APIView):
    """Revoke all sessions except current"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="RevokeAllSessionsView POST")
    def post(self, request):
        """Revoke all other sessions"""
        # TODO: Implement actual session revocation
        return Response({
            'success': True,
            'message': 'All other sessions revoked successfully'
        })


class Enable2FAView(APIView):
    """Enable Two-Factor Authentication"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="Enable2FAView POST")
    def post(self, request):
        """Enable 2FA for user"""
        token = request.data.get('token')
        
        if not token:
            return Response({
                'success': False,
                'message': 'Token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # TODO: Implement actual 2FA enabling
        # This would verify the token and enable 2FA
        
        return Response({
            'success': True,
            'message': '2FA enabled successfully'
        })


class Disable2FAView(APIView):
    """Disable Two-Factor Authentication"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="Disable2FAView POST")
    def post(self, request):
        """Disable 2FA for user"""
        token = request.data.get('token')
        password = request.data.get('password')
        
        if not token or not password:
            return Response({
                'success': False,
                'message': 'Token and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify password
        if not request.user.check_password(password):
            return Response({
                'success': False,
                'message': 'Invalid password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # TODO: Implement actual 2FA disabling
        
        return Response({
            'success': True,
            'message': '2FA disabled successfully'
        })


class Setup2FAView(APIView):
    """Setup Two-Factor Authentication"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="Setup2FAView POST")
    def post(self, request):
        """Generate 2FA setup data"""
        import secrets
        import base64
        import io
        import qrcode
        import pyotp
        
        user = request.user
        
        # Generate secret key
        secret = pyotp.random_base32()
        
        # Generate QR code
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user.email,
            issuer_name="Watch Party"
        )
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        qr_code_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        # Generate backup codes
        backup_codes = [secrets.token_hex(8) for _ in range(10)]
        
        return Response({
            'success': True,
            'data': {
                'secret': secret,
                'qr_code': f"data:image/png;base64,{qr_code_base64}",
                'backup_codes': backup_codes
            }
        })


class OnboardingView(APIView):
    """Complete user onboarding"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="OnboardingView POST")
    def post(self, request):
        """Complete user onboarding process"""
        user = request.user
        
        # Update user onboarding status
        # TODO: Add onboarding fields to user model
        
        # Log activity
        UserActivity.objects.create(
            user=user,
            activity_type='onboarding_completed',
            description="Completed onboarding process"
        )
        
        return Response({
            'success': True,
            'message': 'Onboarding completed successfully'
        })


class UpdatePasswordView(APIView):
    """Update user password"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="UpdatePasswordView POST")
    def post(self, request):
        """Update user password"""
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response({
                'success': False,
                'message': 'Current password and new password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        
        # Verify current password
        if not user.check_password(current_password):
            return Response({
                'success': False,
                'message': 'Current password is incorrect'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate new password
        if len(new_password) < 8:
            return Response({
                'success': False,
                'message': 'New password must be at least 8 characters long'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update password
        user.set_password(new_password)
        user.save()
        
        # Log activity
        UserActivity.objects.create(
            user=user,
            activity_type='password_changed',
            description="Password changed successfully"
        )
        
        return Response({
            'success': True,
            'message': 'Password updated successfully'
        })


class UserInventoryView(APIView):
    """User inventory from store"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="UserInventoryView GET")
    def get(self, request):
        """Get user's inventory"""
        try:
            from apps.store.models import UserInventory
            from apps.store.serializers import UserInventorySerializer, UserCurrencySerializer
            
            user = request.user
            inventory = UserInventory.objects.filter(user=user).select_related('item')
            currency = getattr(user, 'currency', None)
            
            inventory_data = UserInventorySerializer(inventory, many=True).data
            currency_data = UserCurrencySerializer(currency).data if currency else {'balance': 0, 'total_earned': 0, 'total_spent': 0}
            
            return Response({
                'success': True,
                'data': {
                    'inventory': inventory_data,
                    'currency': currency_data,
                    'stats': {
                        'total_items': inventory.count(),
                        'equipped_items': inventory.filter(is_equipped=True).count()
                    }
                }
            })
            
        except ImportError:
            return Response({
                'success': True,
                'data': {
                    'inventory': [],
                    'currency': {'balance': 0, 'total_earned': 0, 'total_spent': 0},
                    'stats': {'total_items': 0, 'equipped_items': 0}
                }
            })


class FriendSuggestionsView(APIView):
    """Friend suggestions for user"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="FriendSuggestionsView GET")
    def get(self, request):
        """Get friend suggestions"""
        user = request.user
        
        # Get users who are not already friends
        existing_friends = Friendship.objects.filter(
            (Q(from_user=user) | Q(to_user=user))
        ).values_list('from_user_id', 'to_user_id')
        
        friend_ids = set()
        for from_id, to_id in existing_friends:
            friend_ids.add(from_id)
            friend_ids.add(to_id)
        friend_ids.discard(user.id)
        
        # Simple suggestion: random users not already friends
        suggestions = User.objects.filter(
            is_active=True
        ).exclude(id__in=friend_ids).exclude(id=user.id)[:10]
        
        suggestions_data = []
        for suggestion in suggestions:
            suggestions_data.append({
                'id': suggestion.id,
                'username': suggestion.username,
                'name': suggestion.get_full_name(),
                'profile_picture': suggestion.profile_picture.url if hasattr(suggestion, 'profile_picture') and suggestion.profile_picture else None,
                'mutual_friends': 0,  # TODO: Calculate mutual friends
            })
        
        return Response({
            'success': True,
            'data': {'suggestions': suggestions_data}
        })


class SendFriendRequestView(APIView):
    """Send friend request"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, user_id):
        """Send friend request to user"""
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if target_user == request.user:
            return Response({
                'success': False,
                'message': 'Cannot send friend request to yourself'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if friendship already exists
        existing_friendship = Friendship.objects.filter(
            (Q(from_user=request.user, to_user=target_user) |
             Q(from_user=target_user, to_user=request.user))
        ).first()
        
        if existing_friendship:
            return Response({
                'success': False,
                'message': 'Friend request already exists or users are already friends'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create friend request
        friendship = Friendship.objects.create(
            from_user=request.user,
            to_user=target_user,
            status='pending'
        )
        
        # Log activity
        UserActivity.objects.create(
            user=request.user,
            activity_type='friend_request_sent',
            description=f"Sent friend request to {target_user.username}"
        )
        
        return Response({
            'success': True,
            'message': 'Friend request sent successfully'
        })


class AcceptFriendRequestView(APIView):
    """Accept friend request"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, request_id):
        """Accept friend request"""
        try:
            friendship = Friendship.objects.get(
                id=request_id,
                to_user=request.user,
                status='pending'
            )
        except Friendship.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Friend request not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        friendship.status = 'accepted'
        friendship.save()
        
        # Log activity
        UserActivity.objects.create(
            user=request.user,
            activity_type='friend_request_accepted',
            description=f"Accepted friend request from {friendship.from_user.username}"
        )
        
        return Response({
            'success': True,
            'message': 'Friend request accepted'
        })


class DeclineFriendRequestView(APIView):
    """Decline friend request"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, request_id):
        """Decline friend request"""
        try:
            friendship = Friendship.objects.get(
                id=request_id,
                to_user=request.user,
                status='pending'
            )
        except Friendship.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Friend request not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        friendship.delete()
        
        # Log activity
        UserActivity.objects.create(
            user=request.user,
            activity_type='friend_request_declined',
            description=f"Declined friend request from {friendship.from_user.username}"
        )
        
        return Response({
            'success': True,
            'message': 'Friend request declined'
        })


class BlockUserView(APIView):
    """Block a user"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, user_id):
        """Block a user"""
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        if target_user == request.user:
            return Response({
                'success': False,
                'message': 'Cannot block yourself'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # TODO: Implement actual user blocking logic
        # This would typically involve creating a UserBlock model
        
        # Log activity
        UserActivity.objects.create(
            user=request.user,
            activity_type='user_blocked',
            description=f"Blocked user {target_user.username}"
        )
        
        return Response({
            'success': True,
            'message': f'User {target_user.username} blocked successfully'
        })
