"""
Enhanced social features API views for Users app
"""

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from services.social_service import social_service

User = get_user_model()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def friends_list(request):
    """Get user's friends list"""
    friends = social_service.get_friends_list(request.user)
    return Response({'friends': friends})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_friend_request(request):
    """Send a friend request"""
    username = request.data.get('username')
    if not username:
        return Response(
            {'error': 'Username is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    result = social_service.send_friend_request(request.user, username)
    
    if result['success']:
        return Response(result, status=status.HTTP_201_CREATED)
    else:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def accept_friend_request(request, friendship_id):
    """Accept a friend request"""
    result = social_service.accept_friend_request(request.user, friendship_id)
    
    if result['success']:
        return Response(result)
    else:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def decline_friend_request(request, friendship_id):
    """Decline a friend request"""
    result = social_service.decline_friend_request(request.user, friendship_id)
    
    if result['success']:
        return Response(result)
    else:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def remove_friend(request, username):
    """Remove a friend"""
    result = social_service.remove_friend(request.user, username)
    
    if result['success']:
        return Response(result)
    else:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def friend_requests(request):
    """Get friend requests (received and sent)"""
    request_type = request.GET.get('type', 'received')  # received, sent
    
    requests = social_service.get_friend_requests(request.user, request_type)
    return Response({'requests': requests})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_users(request):
    """Search for users"""
    query = request.GET.get('q', '')
    if not query:
        return Response(
            {'error': 'Search query is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    limit = int(request.GET.get('limit', 20))
    users = social_service.search_users(query, request.user, limit)
    
    return Response({'users': users})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def activity_feed(request):
    """Get activity feed"""
    limit = int(request.GET.get('limit', 50))
    feed = social_service.get_activity_feed(request.user, limit)
    
    return Response({'activities': feed})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def friend_suggestions(request):
    """Get friend suggestions"""
    limit = int(request.GET.get('limit', 10))
    suggestions = social_service.get_friend_suggestions(request.user, limit)
    
    return Response({'suggestions': suggestions})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def block_user(request):
    """Block a user"""
    username = request.data.get('username')
    if not username:
        return Response(
            {'error': 'Username is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    result = social_service.block_user(request.user, username)
    
    if result['success']:
        return Response(result)
    else:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def unblock_user(request):
    """Unblock a user"""
    username = request.data.get('username')
    if not username:
        return Response(
            {'error': 'Username is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    result = social_service.unblock_user(request.user, username)
    
    if result['success']:
        return Response(result)
    else:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile(request, user_id):
    """Get public user profile"""
    try:
        user = User.objects.select_related('profile').get(id=user_id)
        
        # Check if the viewing user has permission to see this profile
        # (e.g., friends, public profile, etc.)
        profile_data = {
            'id': str(user.id),
            'username': user.username,
            'full_name': user.get_full_name(),
            'date_joined': user.date_joined,
            'is_online': social_service._is_user_online(user)
        }
        
        if hasattr(user, 'profile'):
            profile_data['profile'] = {
                'avatar': user.profile.avatar.url if user.profile.avatar else None,
                'bio': getattr(user.profile, 'bio', ''),
                'country': getattr(user.profile, 'country', ''),
                'is_verified': getattr(user.profile, 'is_verified', False)
            }
        
        # Add friendship status if not the same user
        if request.user != user:
            # Get friendship status
            from apps.users.models import Friendship
            from django.db.models import Q
            
            friendship = Friendship.objects.filter(
                Q(from_user=request.user, to_user=user) |
                Q(from_user=user, to_user=request.user)
            ).first()
            
            if friendship:
                profile_data['friendship_status'] = friendship.status
            else:
                profile_data['friendship_status'] = 'none'
        
        return Response(profile_data)
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
