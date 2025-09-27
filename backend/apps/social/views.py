"""
Views for Social Groups functionality
"""

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from drf_spectacular.utils import extend_schema

from shared.responses import StandardResponse
from .models import SocialGroup, GroupMembership


class SocialGroupsView(APIView):
    """List and create social groups"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="SocialGroupsView GET")
    def get(self, request):
        """Get social groups"""
        user = request.user
        category = request.GET.get('category')
        privacy = request.GET.get('privacy')
        my_groups = request.GET.get('my_groups', '').lower() == 'true'
        
        if my_groups:
            # Get user's groups
            groups = SocialGroup.objects.filter(
                memberships__user=user,
                memberships__is_active=True,
                is_active=True
            ).distinct()
        else:
            # Get discoverable groups
            groups = SocialGroup.objects.filter(
                is_active=True,
                privacy__in=['public', 'invite_only']
            )
        
        # Apply filters
        if category:
            groups = groups.filter(category=category)
        if privacy:
            groups = groups.filter(privacy=privacy)
        
        groups = groups.order_by('-created_at')[:20]
        
        groups_data = []
        for group in groups:
            user_membership = group.memberships.filter(user=user, is_active=True).first()
            
            groups_data.append({
                'id': group.id,
                'name': group.name,
                'description': group.description,
                'category': group.category,
                'privacy': group.privacy,
                'avatar': group.avatar.url if group.avatar else None,
                'member_count': group.member_count,
                'max_members': group.max_members,
                'is_member': user_membership is not None,
                'member_role': user_membership.role if user_membership else None,
                'created_at': group.created_at,
                'creator': {
                    'id': group.creator.id,
                    'name': group.creator.get_full_name(),
                }
            })
        
        return StandardResponse.success(
            data={
                'groups': groups_data,
                'categories': dict(SocialGroup.CATEGORY_CHOICES),
                'privacy_options': dict(SocialGroup.PRIVACY_CHOICES),
            },
            message="Social groups retrieved successfully"
        )
    
    @extend_schema(summary="SocialGroupsView POST")
    def post(self, request):
        """Create a new social group"""
        user = request.user
        
        name = request.data.get('name', '').strip()
        description = request.data.get('description', '').strip()
        category = request.data.get('category', 'general')
        privacy = request.data.get('privacy', 'public')
        
        if not name:
            return StandardResponse.error("Group name is required")
        
        if len(name) < 3:
            return StandardResponse.error("Group name must be at least 3 characters")
        
        # Check if user already has too many groups
        user_groups_count = SocialGroup.objects.filter(creator=user, is_active=True).count()
        if user_groups_count >= 10:  # Limit to 10 groups per user
            return StandardResponse.error("You can only create up to 10 groups")
        
        # Create group
        group = SocialGroup.objects.create(
            name=name,
            description=description,
            category=category,
            privacy=privacy,
            creator=user
        )
        
        # Add creator as owner
        GroupMembership.objects.create(
            user=user,
            group=group,
            role='owner'
        )
        
        return StandardResponse.created(
            data={
                'id': group.id,
                'name': group.name,
                'description': group.description,
                'category': group.category,
                'privacy': group.privacy,
                'member_count': 1,
                'created_at': group.created_at,
            },
            message="Social group created successfully"
        )


class JoinGroupView(APIView):
    """Join a social group"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="JoinGroupView POST")
    def post(self, request, group_id):
        """Join a group"""
        user = request.user
        
        try:
            group = SocialGroup.objects.get(id=group_id, is_active=True)
        except SocialGroup.DoesNotExist:
            return StandardResponse.not_found("Group not found")
        
        # Check if can join
        can_join, message = group.can_join(user)
        if not can_join:
            return StandardResponse.error(message)
        
        # Create membership
        membership, created = GroupMembership.objects.get_or_create(
            user=user,
            group=group,
            defaults={'role': 'member'}
        )
        
        if not created:
            if membership.is_active:
                return StandardResponse.error("Already a member of this group")
            else:
                # Reactivate membership
                membership.is_active = True
                membership.status = 'active'
                membership.joined_at = timezone.now()
                membership.save()
        
        return StandardResponse.success(
            data={
                'group': {
                    'id': group.id,
                    'name': group.name,
                },
                'membership': {
                    'role': membership.role,
                    'joined_at': membership.joined_at,
                }
            },
            message=f"Successfully joined {group.name}"
        )


class LeaveGroupView(APIView):
    """Leave a social group"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="LeaveGroupView POST")
    def post(self, request, group_id):
        """Leave a group"""
        user = request.user
        
        try:
            group = SocialGroup.objects.get(id=group_id, is_active=True)
        except SocialGroup.DoesNotExist:
            return StandardResponse.not_found("Group not found")
        
        try:
            membership = GroupMembership.objects.get(
                user=user,
                group=group,
                is_active=True
            )
        except GroupMembership.DoesNotExist:
            return StandardResponse.error("You are not a member of this group")
        
        # Check if user is the owner
        if membership.role == 'owner':
            # Check if there are other admins to transfer ownership
            other_admins = GroupMembership.objects.filter(
                group=group,
                role__in=['admin', 'owner'],
                is_active=True
            ).exclude(user=user)
            
            if not other_admins.exists():
                return StandardResponse.error(
                    "Cannot leave group as owner. Please assign another admin first or delete the group."
                )
        
        # Leave the group
        membership.leave_group()
        
        return StandardResponse.success(
            message=f"Successfully left {group.name}"
        )


class GroupDetailView(APIView):
    """Get detailed information about a group"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="GroupDetailView GET")
    def get(self, request, group_id):
        """Get group details"""
        user = request.user
        
        try:
            group = SocialGroup.objects.get(id=group_id, is_active=True)
        except SocialGroup.DoesNotExist:
            return StandardResponse.not_found("Group not found")
        
        # Check if user has access
        user_membership = group.memberships.filter(user=user, is_active=True).first()
        
        if group.privacy == 'private' and not user_membership:
            return StandardResponse.forbidden("This is a private group")
        
        # Get recent members
        recent_members = group.memberships.filter(
            is_active=True
        ).select_related('user').order_by('-joined_at')[:10]
        
        members_data = []
        for membership in recent_members:
            members_data.append({
                'id': membership.user.id,
                'name': membership.user.get_full_name(),
                'role': membership.role,
                'joined_at': membership.joined_at,
                'avatar': membership.user.profile_picture.url if hasattr(membership.user, 'profile_picture') and membership.user.profile_picture else None,
            })
        
        # Get recent posts
        recent_posts = group.posts.filter(
            is_deleted=False
        ).select_related('author').order_by('-created_at')[:5]
        
        posts_data = []
        for post in recent_posts:
            posts_data.append({
                'id': post.id,
                'content': post.content[:200] + '...' if len(post.content) > 200 else post.content,
                'author': {
                    'id': post.author.id,
                    'name': post.author.get_full_name(),
                },
                'created_at': post.created_at,
                'post_type': post.post_type,
            })
        
        group_data = {
            'id': group.id,
            'name': group.name,
            'description': group.description,
            'category': group.category,
            'privacy': group.privacy,
            'avatar': group.avatar.url if group.avatar else None,
            'banner': group.banner.url if group.banner else None,
            'rules': group.rules,
            'tags': group.tags,
            'member_count': group.member_count,
            'max_members': group.max_members,
            'created_at': group.created_at,
            'creator': {
                'id': group.creator.id,
                'name': group.creator.get_full_name(),
            },
            'user_membership': {
                'is_member': user_membership is not None,
                'role': user_membership.role if user_membership else None,
                'joined_at': user_membership.joined_at if user_membership else None,
            },
            'recent_members': members_data,
            'recent_posts': posts_data,
        }
        
        return StandardResponse.success(
            data=group_data,
            message="Group details retrieved successfully"
        )
