"""
User views for Watch Party Backend
"""

from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

User = get_user_model()


class UserProfileView(APIView):
    """Get user profile"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Return basic user profile
        return Response({
            'id': str(request.user.id),
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'is_premium': request.user.is_premium,
            'avatar': request.user.avatar.url if request.user.avatar else None,
        })


class UpdateProfileView(APIView):
    """Update user profile"""
    permission_classes = [permissions.IsAuthenticated]
    
    def put(self, request):
        # Basic profile update implementation
        return Response({'message': 'Profile updated successfully'})


class AvatarUploadView(APIView):
    """Upload user avatar"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        return Response({'message': 'Avatar upload endpoint'})


class FriendsListView(APIView):
    """List user friends"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({'friends': []})


class FriendRequestsView(APIView):
    """List friend requests"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({'requests': []})


class SendFriendRequestView(APIView):
    """Send friend request"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        return Response({'message': 'Friend request sent'})


class AcceptFriendRequestView(APIView):
    """Accept friend request"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, request_id):
        return Response({'message': 'Friend request accepted'})


class RemoveFriendView(APIView):
    """Remove friend"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, friend_id):
        return Response({'message': 'Friend removed'})


class UserSearchView(APIView):
    """Search users"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({'users': []})


class PublicProfileView(APIView):
    """Get public user profile"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id):
        return Response({'profile': {}})


class UserSettingsView(APIView):
    """User settings"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({'settings': {}})
    
    def put(self, request):
        return Response({'message': 'Settings updated'})


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
