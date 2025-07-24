"""
User views for Watch Party Backend
"""

from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Friendship, UserActivity, UserSettings
from .serializers import (
    UserSerializer, UserProfileSerializer, FriendshipSerializer,
    SendFriendRequestSerializer, UserActivitySerializer, UserSettingsSerializer,
    UserSearchSerializer
)

User = get_user_model()


class DashboardStatsView(APIView):
    """Get dashboard statistics for the user"""
    permission_classes = [permissions.IsAuthenticated]
    
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


class UserProfileView(APIView):
    """Get user profile"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserProfileSerializer(
            request.user, context={'request': request}
        )
        return Response(serializer.data)


class UpdateProfileView(APIView):
    """Update user profile"""
    permission_classes = [permissions.IsAuthenticated]
    
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


class AvatarUploadView(APIView):
    """Upload user avatar"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        return Response({'message': 'Avatar upload endpoint'})


class FriendsListView(APIView):
    """List user friends"""
    permission_classes = [permissions.IsAuthenticated]
    
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


class SendFriendRequestView(APIView):
    """Send friend request"""
    permission_classes = [permissions.IsAuthenticated]
    
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


class UserSearchView(APIView):
    """Search users"""
    permission_classes = [permissions.IsAuthenticated]
    
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
    
    def get(self, request):
        settings, created = UserSettings.objects.get_or_create(user=request.user)
        serializer = UserSettingsSerializer(settings)
        return Response({'settings': serializer.data})
    
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
    
    def get(self, request):
        return Response({'settings': {}})
    
    def put(self, request):
        return Response({'message': 'Notification settings updated'})


class PrivacySettingsView(APIView):
    """Privacy settings"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({'settings': {}})
    
    def put(self, request):
        return Response({'message': 'Privacy settings updated'})


class UserActivityView(APIView):
    """User activity"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({'activities': []})


class WatchHistoryView(APIView):
    """User watch history"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({'history': []})


class FavoritesView(APIView):
    """User favorites"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({'favorites': []})


class AddFavoriteView(APIView):
    """Add favorite"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        return Response({'message': 'Added to favorites'})


class RemoveFavoriteView(APIView):
    """Remove favorite"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, favorite_id):
        return Response({'message': 'Removed from favorites'})


class NotificationsView(APIView):
    """User notifications"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({'notifications': []})


class MarkNotificationReadView(APIView):
    """Mark notification as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, notification_id):
        return Response({'message': 'Notification marked as read'})


class MarkAllNotificationsReadView(APIView):
    """Mark all notifications as read"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        return Response({'message': 'All notifications marked as read'})


class UserReportView(APIView):
    """Report user"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        return Response({'message': 'User report submitted'})


class BlockUserView(APIView):
    """Block a user"""
    permission_classes = [permissions.IsAuthenticated]
    
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
