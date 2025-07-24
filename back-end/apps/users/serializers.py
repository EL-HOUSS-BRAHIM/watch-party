"""
User serializers for Watch Party Backend
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import models
from .models import Friendship, UserActivity, UserSettings

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for basic user information"""
    
    full_name = serializers.CharField(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name', 
            'avatar_url', 'is_premium', 'date_joined'
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'is_premium']
    
    def get_avatar_url(self, obj):
        """Get avatar URL or None"""
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for detailed user profile"""
    
    full_name = serializers.CharField(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    friends_count = serializers.SerializerMethodField()
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'avatar_url', 'is_premium', 'date_joined', 'friends_count',
            'profile'
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'is_premium', 'friends_count']
    
    def get_avatar_url(self, obj):
        """Get avatar URL or None"""
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None
    
    def get_friends_count(self, obj):
        """Get number of friends"""
        return Friendship.objects.filter(
            models.Q(from_user=obj, status='accepted') |
            models.Q(to_user=obj, status='accepted')
        ).count()
    
    def get_profile(self, obj):
        """Get user profile data"""
        try:
            profile = obj.profile
            return {
                'bio': profile.bio,
                'timezone': profile.timezone,
                'language': profile.language,
            }
        except:
            return {
                'bio': '',
                'timezone': 'UTC',
                'language': 'en',
            }


class FriendshipSerializer(serializers.ModelSerializer):
    """Serializer for friendship relationships"""
    
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)
    
    class Meta:
        model = Friendship
        fields = ['id', 'from_user', 'to_user', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SendFriendRequestSerializer(serializers.Serializer):
    """Serializer for sending friend requests"""
    
    to_user_id = serializers.UUIDField()
    
    def validate_to_user_id(self, value):
        """Validate that the user exists and is not the current user"""
        request_user = self.context['request'].user
        
        if value == request_user.id:
            raise serializers.ValidationError("You cannot send a friend request to yourself.")
        
        try:
            user = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist.")
        
        # Check if friendship already exists
        existing = Friendship.objects.filter(
            models.Q(from_user=request_user, to_user=user) |
            models.Q(from_user=user, to_user=request_user)
        ).first()
        
        if existing:
            if existing.status == 'pending':
                raise serializers.ValidationError("Friend request already sent.")
            elif existing.status == 'accepted':
                raise serializers.ValidationError("You are already friends with this user.")
            elif existing.status == 'blocked':
                raise serializers.ValidationError("Cannot send friend request to this user.")
        
        return value


class UserActivitySerializer(serializers.ModelSerializer):
    """Serializer for user activities"""
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserActivity
        fields = [
            'id', 'user', 'activity_type', 'description', 'object_type',
            'object_id', 'extra_data', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class UserSettingsSerializer(serializers.ModelSerializer):
    """Serializer for user settings"""
    
    class Meta:
        model = UserSettings
        fields = [
            'email_notifications', 'push_notifications', 'friend_request_notifications',
            'party_invite_notifications', 'video_notifications', 'profile_visibility',
            'activity_visibility', 'allow_friend_requests', 'show_online_status',
            'auto_play_videos', 'default_video_quality', 'auto_join_friend_parties',
            'party_notifications_sound'
        ]


class UserSearchSerializer(serializers.ModelSerializer):
    """Serializer for user search results"""
    
    full_name = serializers.CharField(read_only=True)
    avatar_url = serializers.SerializerMethodField()
    is_friend = serializers.SerializerMethodField()
    friendship_status = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'avatar_url',
            'is_friend', 'friendship_status', 'is_online'
        ]
    
    def get_avatar_url(self, obj):
        """Get avatar URL or None"""
        if obj.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None
    
    def get_is_friend(self, obj):
        """Check if current user is friends with this user"""
        request_user = self.context['request'].user
        return Friendship.objects.filter(
            models.Q(from_user=request_user, to_user=obj, status='accepted') |
            models.Q(from_user=obj, to_user=request_user, status='accepted')
        ).exists()
    
    def get_friendship_status(self, obj):
        """Get friendship status with current user"""
        request_user = self.context['request'].user
        friendship = Friendship.objects.filter(
            models.Q(from_user=request_user, to_user=obj) |
            models.Q(from_user=obj, to_user=request_user)
        ).first()
        
        if friendship:
            return {
                'status': friendship.status,
                'is_sender': friendship.from_user == request_user,
                'created_at': friendship.created_at
            }
        return None
