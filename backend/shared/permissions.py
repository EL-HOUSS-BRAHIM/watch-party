"""
Custom permissions for Watch Party Backend
"""

from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the snippet.
        return obj.uploader == request.user


class IsHostOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow hosts of a party to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the host of the party.
        return obj.host == request.user


class IsPremiumUser(permissions.BasePermission):
    """
    Permission class to check if user has active premium subscription
    """
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_premium and
            request.user.is_subscription_active
        )


class IsPremiumUserForPremiumContent(permissions.BasePermission):
    """
    Permission class to check premium requirement for content
    """
    
    def has_object_permission(self, request, view, obj):
        # If content doesn't require premium, allow access
        if not obj.require_premium:
            return True
        
        # If content requires premium, check user subscription
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_premium and
            request.user.is_subscription_active
        )


class IsPartyHost(permissions.BasePermission):
    """
    Permission class to check if user is the host of a party
    """
    
    def has_object_permission(self, request, view, obj):
        return obj.host == request.user


class IsPartyParticipant(permissions.BasePermission):
    """
    Permission class to check if user is a participant in a party
    """
    
    def has_object_permission(self, request, view, obj):
        return obj.participants.filter(user=request.user, is_active=True).exists()


class IsPartyHostOrModerator(permissions.BasePermission):
    """
    Permission class to check if user is host or moderator of a party
    """
    
    def has_object_permission(self, request, view, obj):
        if obj.host == request.user:
            return True
        
        participant = obj.participants.filter(user=request.user, is_active=True).first()
        return participant and participant.role in ['host', 'moderator']


class IsVideoOwner(permissions.BasePermission):
    """
    Permission class to check if user owns the video
    """
    
    def has_object_permission(self, request, view, obj):
        return obj.uploader == request.user


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit.
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to admin users.
        return request.user and request.user.is_staff


class IsAdminUser(permissions.BasePermission):
    """
    Permission class to check if user is admin
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class IsSuperUser(permissions.BasePermission):
    """
    Permission class to check if user is superuser
    """
    
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser


class IsOwner(permissions.BasePermission):
    """
    Permission class to check if user is the owner
    """
    
    def has_object_permission(self, request, view, obj):
        # Handle different object types that might have different owner fields
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        elif hasattr(obj, 'uploader'):
            return obj.uploader == request.user
        elif hasattr(obj, 'host'):
            return obj.host == request.user
        
        return False


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission class to check if user is owner or admin
    """
    
    def has_object_permission(self, request, view, obj):
        # Admin can access everything
        if request.user.is_staff:
            return True
        
        # Owner can access their own objects
        return IsOwner().has_object_permission(request, view, obj)


class CanAccessPrivateContent(permissions.BasePermission):
    """
    Permission to access private content based on visibility settings
    """
    
    def has_object_permission(self, request, view, obj):
        # Public content is accessible to everyone
        if obj.visibility == 'public':
            return True
        
        # Private content is only accessible to owner
        if obj.visibility == 'private':
            return obj.uploader == request.user
        
        # Friends content is accessible to friends
        if obj.visibility == 'friends':
            if obj.uploader == request.user:
                return True
            # Check if user is friend (assuming friends relationship exists)
            if hasattr(request.user, 'friends'):
                return obj.uploader in request.user.friends.all()
        
        return False
