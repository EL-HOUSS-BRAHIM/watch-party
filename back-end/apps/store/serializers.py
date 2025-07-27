"""
Serializers for Store app
"""

from rest_framework import serializers
from .models import (
    StoreItem, UserInventory, Achievement, UserAchievement,
    Reward, UserRewardClaim, UserCurrency, CurrencyTransaction
)


class StoreItemSerializer(serializers.ModelSerializer):
    """Serializer for store items"""
    
    is_available = serializers.ReadOnlyField()
    is_owned = serializers.SerializerMethodField()
    
    class Meta:
        model = StoreItem
        fields = [
            'id', 'name', 'description', 'price', 'category', 'rarity',
            'image', 'icon', 'is_active', 'is_limited_time', 'available_until',
            'metadata', 'is_available', 'is_owned', 'created_at'
        ]
    
    def get_is_owned(self, obj):
        """Check if current user owns this item"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserInventory.objects.filter(user=request.user, item=obj).exists()
        return False


class UserInventorySerializer(serializers.ModelSerializer):
    """Serializer for user inventory items"""
    
    item = StoreItemSerializer(read_only=True)
    
    class Meta:
        model = UserInventory
        fields = [
            'id', 'item', 'quantity', 'is_equipped', 'purchased_at', 'metadata'
        ]


class AchievementSerializer(serializers.ModelSerializer):
    """Serializer for achievements"""
    
    is_unlocked = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Achievement
        fields = [
            'id', 'name', 'description', 'icon', 'points', 'currency_reward',
            'achievement_type', 'rarity', 'is_hidden', 'is_unlocked', 'progress'
        ]
    
    def get_is_unlocked(self, obj):
        """Check if current user has unlocked this achievement"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return UserAchievement.objects.filter(user=request.user, achievement=obj).exists()
        return False
    
    def get_progress(self, obj):
        """Get user's progress towards this achievement"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                user_achievement = UserAchievement.objects.get(user=request.user, achievement=obj)
                return user_achievement.progress_data
            except UserAchievement.DoesNotExist:
                pass
        return {}


class UserAchievementSerializer(serializers.ModelSerializer):
    """Serializer for user achievements"""
    
    achievement = AchievementSerializer(read_only=True)
    
    class Meta:
        model = UserAchievement
        fields = ['id', 'achievement', 'unlocked_at', 'progress_data']


class RewardSerializer(serializers.ModelSerializer):
    """Serializer for rewards"""
    
    can_claim = serializers.SerializerMethodField()
    next_claim_time = serializers.SerializerMethodField()
    items_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Reward
        fields = [
            'id', 'name', 'description', 'reward_type', 'currency_amount',
            'requirements', 'is_repeatable', 'cooldown_hours', 'can_claim',
            'next_claim_time', 'items_list'
        ]
    
    def get_can_claim(self, obj):
        """Check if current user can claim this reward"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Check if user meets requirements
            # This would need to be implemented based on specific requirements logic
            return True  # Placeholder
        return False
    
    def get_next_claim_time(self, obj):
        """Get when user can next claim this reward"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                last_claim = UserRewardClaim.objects.filter(
                    user=request.user, reward=obj
                ).order_by('-claimed_at').first()
                
                if last_claim and obj.is_repeatable:
                    from django.utils import timezone
                    next_time = last_claim.claimed_at + timezone.timedelta(hours=obj.cooldown_hours)
                    return next_time
            except UserRewardClaim.DoesNotExist:
                pass
        return None
    
    def get_items_list(self, obj):
        """Get items included in this reward"""
        reward_items = obj.rewarditem_set.all()
        return [
            {
                'item': StoreItemSerializer(ri.item).data,
                'quantity': ri.quantity,
                'probability': ri.probability
            }
            for ri in reward_items
        ]


class UserRewardClaimSerializer(serializers.ModelSerializer):
    """Serializer for user reward claims"""
    
    reward = RewardSerializer(read_only=True)
    
    class Meta:
        model = UserRewardClaim
        fields = [
            'id', 'reward', 'claimed_at', 'currency_received', 'items_received'
        ]


class UserCurrencySerializer(serializers.ModelSerializer):
    """Serializer for user currency"""
    
    class Meta:
        model = UserCurrency
        fields = [
            'balance', 'total_earned', 'total_spent', 'created_at', 'updated_at'
        ]


class CurrencyTransactionSerializer(serializers.ModelSerializer):
    """Serializer for currency transactions"""
    
    class Meta:
        model = CurrencyTransaction
        fields = [
            'id', 'amount', 'transaction_type', 'description', 'balance_after',
            'metadata', 'created_at'
        ]


class PurchaseItemSerializer(serializers.Serializer):
    """Serializer for item purchase requests"""
    
    item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(default=1, min_value=1)
    
    def validate_item_id(self, value):
        """Validate that item exists and is available"""
        try:
            item = StoreItem.objects.get(id=value)
            if not item.is_available:
                raise serializers.ValidationError("Item is not available for purchase")
            return value
        except StoreItem.DoesNotExist:
            raise serializers.ValidationError("Item does not exist")


class ClaimRewardSerializer(serializers.Serializer):
    """Serializer for reward claim requests"""
    
    reward_id = serializers.IntegerField()
    
    def validate_reward_id(self, value):
        """Validate that reward exists and is active"""
        try:
            reward = Reward.objects.get(id=value)
            if not reward.is_active:
                raise serializers.ValidationError("Reward is not active")
            return value
        except Reward.DoesNotExist:
            raise serializers.ValidationError("Reward does not exist")


class UserStatsSerializer(serializers.Serializer):
    """Serializer for comprehensive user statistics"""
    
    level = serializers.IntegerField()
    experience_points = serializers.IntegerField()
    total_watch_time = serializers.IntegerField()
    parties_hosted = serializers.IntegerField()
    parties_joined = serializers.IntegerField()
    achievements_unlocked = serializers.IntegerField()
    total_achievements = serializers.IntegerField()
    currency_balance = serializers.IntegerField()
    items_owned = serializers.IntegerField()
    friends_count = serializers.IntegerField()
    rank = serializers.IntegerField()
    
    def to_representation(self, instance):
        """Convert user instance to stats data"""
        # This would need to be implemented based on actual user stats calculation
        return {
            'level': 1,  # Placeholder - calculate based on experience
            'experience_points': 0,  # Placeholder
            'total_watch_time': 0,  # From user model or analytics
            'parties_hosted': 0,  # Count from parties app
            'parties_joined': 0,  # Count from parties app
            'achievements_unlocked': instance.achievements.count(),
            'total_achievements': Achievement.objects.filter(is_active=True).count(),
            'currency_balance': getattr(instance.currency, 'balance', 0) if hasattr(instance, 'currency') else 0,
            'items_owned': instance.inventory.count(),
            'friends_count': 0,  # From friends system when implemented
            'rank': 0,  # Calculate based on leaderboard position
        }
