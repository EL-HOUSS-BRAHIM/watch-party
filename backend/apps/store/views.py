"""
Views for Store app
"""

from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from django.db import models
from drf_spectacular.utils import extend_schema

from shared.responses import StandardResponse
from .models import (
    StoreItem, UserInventory, Achievement, UserAchievement,
    Reward, UserRewardClaim, UserCurrency
)
from .serializers import (
    StoreItemSerializer, UserInventorySerializer, AchievementSerializer,
    UserAchievementSerializer, RewardSerializer, UserRewardClaimSerializer,
    UserCurrencySerializer, PurchaseItemSerializer
)


class StoreItemsView(APIView):
    """List and filter store items"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="StoreItemsView GET")
    def get(self, request):
        """Get available store items"""
        category = request.GET.get('category')
        rarity = request.GET.get('rarity')
        search = request.GET.get('search')
        
        items = StoreItem.objects.filter(is_active=True)
        
        # Apply filters
        if category:
            items = items.filter(category=category)
        if rarity:
            items = items.filter(rarity=rarity)
        if search:
            items = items.filter(name__icontains=search)
        
        # Only show available items
        current_time = timezone.now()
        items = items.filter(
            models.Q(is_limited_time=False) | 
            models.Q(available_until__gte=current_time)
        )
        
        serializer = StoreItemSerializer(items, many=True, context={'request': request})
        
        return StandardResponse.success(
            data={
                'items': serializer.data,
                'categories': dict(StoreItem.CATEGORY_CHOICES),
                'rarities': ['common', 'rare', 'epic', 'legendary']
            },
            message="Store items retrieved successfully"
        )


class PurchaseItemView(APIView):
    """Purchase items from store"""
    
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    @extend_schema(summary="PurchaseItemView POST")
    def post(self, request):
        """Purchase an item"""
        serializer = PurchaseItemSerializer(data=request.data)
        if not serializer.is_valid():
            return StandardResponse.validation_error(serializer.errors)
        
        user = request.user
        item_id = serializer.validated_data['item_id']
        quantity = serializer.validated_data['quantity']
        
        item = get_object_or_404(StoreItem, id=item_id)
        total_cost = item.price * quantity
        
        # Get or create user currency
        user_currency, created = UserCurrency.objects.get_or_create(user=user)
        
        # Check if user has enough currency
        if user_currency.balance < total_cost:
            return StandardResponse.error(
                message="Insufficient currency",
                details={
                    'required': total_cost,
                    'available': user_currency.balance,
                    'shortfall': total_cost - user_currency.balance
                }
            )
        
        # Check if item is available
        if not item.is_available:
            return StandardResponse.error(message="Item is not available for purchase")
        
        # Process purchase
        try:
            # Deduct currency
            if not user_currency.spend_currency(
                total_cost, 
                transaction_type='purchase', 
                description=f"Purchased {quantity}x {item.name}"
            ):
                return StandardResponse.error(message="Failed to process payment")
            
            # Add item to inventory
            inventory_item, created = UserInventory.objects.get_or_create(
                user=user,
                item=item,
                defaults={'quantity': quantity}
            )
            
            if not created:
                inventory_item.quantity += quantity
                inventory_item.save()
            
            # Serialize response
            inventory_serializer = UserInventorySerializer(inventory_item)
            currency_serializer = UserCurrencySerializer(user_currency)
            
            return StandardResponse.success(
                data={
                    'inventory_item': inventory_serializer.data,
                    'currency': currency_serializer.data,
                    'transaction': {
                        'cost': total_cost,
                        'quantity': quantity,
                        'item_name': item.name
                    }
                },
                message=f"Successfully purchased {quantity}x {item.name}"
            )
            
        except Exception as e:
            return StandardResponse.server_error(
                message="Failed to complete purchase",
                details=str(e)
            )


class UserInventoryView(APIView):
    """User's inventory management"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="UserInventoryView GET")
    def get(self, request):
        """Get user's inventory"""
        user = request.user
        category = request.GET.get('category')
        equipped_only = request.GET.get('equipped_only', '').lower() == 'true'
        
        inventory = UserInventory.objects.filter(user=user)
        
        if category:
            inventory = inventory.filter(item__category=category)
        if equipped_only:
            inventory = inventory.filter(is_equipped=True)
        
        inventory = inventory.select_related('item').order_by('-purchased_at')
        
        serializer = UserInventorySerializer(inventory, many=True)
        
        # Get currency info
        user_currency = getattr(user, 'currency', None)
        currency_data = UserCurrencySerializer(user_currency).data if user_currency else {
            'balance': 0, 'total_earned': 0, 'total_spent': 0
        }
        
        return StandardResponse.success(
            data={
                'inventory': serializer.data,
                'currency': currency_data,
                'stats': {
                    'total_items': inventory.count(),
                    'equipped_items': inventory.filter(is_equipped=True).count(),
                    'categories': list(inventory.values_list('item__category', flat=True).distinct())
                }
            },
            message="Inventory retrieved successfully"
        )
    
    @extend_schema(summary="UserInventoryView PATCH")
    def patch(self, request):
        """Update inventory item (equip/unequip)"""
        item_id = request.data.get('item_id')
        action = request.data.get('action')  # 'equip' or 'unequip'
        
        if not item_id or action not in ['equip', 'unequip']:
            return StandardResponse.error(
                message="Invalid request data",
                details="item_id and action (equip/unequip) are required"
            )
        
        try:
            inventory_item = UserInventory.objects.get(
                user=request.user,
                item__id=item_id
            )
            
            # Unequip other items in same category if equipping
            if action == 'equip':
                UserInventory.objects.filter(
                    user=request.user,
                    item__category=inventory_item.item.category,
                    is_equipped=True
                ).update(is_equipped=False)
                
                inventory_item.is_equipped = True
            else:
                inventory_item.is_equipped = False
            
            inventory_item.save()
            
            serializer = UserInventorySerializer(inventory_item)
            
            return StandardResponse.success(
                data=serializer.data,
                message=f"Item {action}ped successfully"
            )
            
        except UserInventory.DoesNotExist:
            return StandardResponse.not_found(message="Inventory item not found")


class AchievementsView(APIView):
    """User achievements"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="AchievementsView GET")
    def get(self, request):
        """Get user's achievements and available achievements"""
        user = request.user
        achievement_type = request.GET.get('type')
        unlocked_only = request.GET.get('unlocked_only', '').lower() == 'true'
        
        achievements = Achievement.objects.filter(is_active=True)
        
        if achievement_type:
            achievements = achievements.filter(achievement_type=achievement_type)
        
        # Filter hidden achievements for non-unlocked
        if not unlocked_only:
            user_achievement_ids = UserAchievement.objects.filter(
                user=user
            ).values_list('achievement_id', flat=True)
            
            achievements = achievements.filter(
                models.Q(is_hidden=False) | 
                models.Q(id__in=user_achievement_ids)
            )
        
        serializer = AchievementSerializer(
            achievements, 
            many=True, 
            context={'request': request}
        )
        
        # Get user's unlocked achievements
        unlocked_achievements = UserAchievement.objects.filter(
            user=user
        ).select_related('achievement')
        
        unlocked_serializer = UserAchievementSerializer(unlocked_achievements, many=True)
        
        # Calculate stats
        total_achievements = achievements.count()
        unlocked_count = unlocked_achievements.count()
        total_points = sum(ua.achievement.points for ua in unlocked_achievements)
        
        return StandardResponse.success(
            data={
                'achievements': serializer.data,
                'unlocked_achievements': unlocked_serializer.data,
                'stats': {
                    'total_achievements': total_achievements,
                    'unlocked_count': unlocked_count,
                    'completion_percentage': round((unlocked_count / total_achievements) * 100) if total_achievements > 0 else 0,
                    'total_points': total_points
                },
                'types': dict(Achievement.TYPE_CHOICES)
            },
            message="Achievements retrieved successfully"
        )


class RewardsView(APIView):
    """Daily rewards and challenges"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="RewardsView GET")
    def get(self, request):
        """Get available rewards"""
        user = request.user
        reward_type = request.GET.get('type')
        
        rewards = Reward.objects.filter(is_active=True)
        
        if reward_type:
            rewards = rewards.filter(reward_type=reward_type)
        
        serializer = RewardSerializer(rewards, many=True, context={'request': request})
        
        # Get user's recent claims
        recent_claims = UserRewardClaim.objects.filter(
            user=user
        ).order_by('-claimed_at')[:10]
        
        claims_serializer = UserRewardClaimSerializer(recent_claims, many=True)
        
        return StandardResponse.success(
            data={
                'rewards': serializer.data,
                'recent_claims': claims_serializer.data,
                'types': dict(Reward.REWARD_TYPE_CHOICES)
            },
            message="Rewards retrieved successfully"
        )


class ClaimRewardView(APIView):
    """Claim a reward"""
    
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    @extend_schema(summary="ClaimRewardView POST")
    def post(self, request, reward_id):
        """Claim a specific reward"""
        user = request.user
        
        try:
            reward = Reward.objects.get(id=reward_id, is_active=True)
        except Reward.DoesNotExist:
            return StandardResponse.not_found(message="Reward not found")
        
        # Check if user can claim this reward
        if reward.is_repeatable:
            last_claim = UserRewardClaim.objects.filter(
                user=user, reward=reward
            ).order_by('-claimed_at').first()
            
            if last_claim:
                next_claim_time = last_claim.claimed_at + timezone.timedelta(hours=reward.cooldown_hours)
                if timezone.now() < next_claim_time:
                    return StandardResponse.error(
                        message="Reward not yet available",
                        details={
                            'next_claim_time': next_claim_time,
                            'hours_remaining': (next_claim_time - timezone.now()).total_seconds() / 3600
                        }
                    )
        else:
            # Check if already claimed
            if UserRewardClaim.objects.filter(user=user, reward=reward).exists():
                return StandardResponse.error(message="Reward already claimed")
        
        # TODO: Check if user meets requirements
        # This would need to be implemented based on specific reward requirements
        
        try:
            # Get or create user currency
            user_currency, created = UserCurrency.objects.get_or_create(user=user)
            
            # Process reward
            items_received = []
            currency_received = reward.currency_amount
            
            # Add currency if applicable
            if currency_received > 0:
                user_currency.add_currency(
                    currency_received,
                    transaction_type='reward',
                    description=f"Claimed {reward.name}"
                )
            
            # Add items if applicable
            # TODO: Implement item reward logic with probability
            
            # Create claim record
            claim = UserRewardClaim.objects.create(
                user=user,
                reward=reward,
                currency_received=currency_received,
                items_received=items_received
            )
            
            # Serialize response
            claim_serializer = UserRewardClaimSerializer(claim)
            currency_serializer = UserCurrencySerializer(user_currency)
            
            return StandardResponse.success(
                data={
                    'claim': claim_serializer.data,
                    'currency': currency_serializer.data
                },
                message=f"Successfully claimed {reward.name}"
            )
            
        except Exception as e:
            return StandardResponse.server_error(
                message="Failed to claim reward",
                details=str(e)
            )


class UserStatsView(APIView):
    """Comprehensive user statistics"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="UserStatsView GET")
    def get(self, request):
        """Get detailed user statistics"""
        user = request.user
        
        # This would need to be expanded with actual stat calculations
        # from various apps (parties, videos, etc.)
        
        stats_data = {
            'level': 1,  # Calculate based on experience points
            'experience_points': 0,  # From user activities
            'total_watch_time': 0,  # From analytics
            'parties_hosted': 0,  # From parties app
            'parties_joined': 0,  # From parties app
            'achievements_unlocked': user.achievements.count(),
            'total_achievements': Achievement.objects.filter(is_active=True).count(),
            'currency_balance': getattr(user.currency, 'balance', 0) if hasattr(user, 'currency') else 0,
            'items_owned': user.inventory.count(),
            'friends_count': 0,  # From friends system when implemented
            'rank': 0,  # Calculate based on leaderboard
        }
        
        return StandardResponse.success(
            data=stats_data,
            message="User statistics retrieved successfully"
        )
