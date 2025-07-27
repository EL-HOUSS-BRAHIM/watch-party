"""
Store models for Watch Party Backend
Handles virtual store items, user inventory, achievements, and rewards
"""

from django.db import models
from django.utils import timezone
from apps.authentication.models import User


class StoreItem(models.Model):
    """Virtual items available in the store"""
    
    CATEGORY_CHOICES = [
        ('avatar', 'Avatar Items'),
        ('themes', 'Themes'),
        ('emotes', 'Emotes'),
        ('badges', 'Badges'),
        ('backgrounds', 'Backgrounds'),
        ('effects', 'Special Effects'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.IntegerField(help_text="Price in virtual currency")
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    image = models.ImageField(upload_to='store/items/', null=True, blank=True)
    icon = models.ImageField(upload_to='store/icons/', null=True, blank=True)
    rarity = models.CharField(max_length=20, choices=[
        ('common', 'Common'),
        ('rare', 'Rare'),
        ('epic', 'Epic'),
        ('legendary', 'Legendary'),
    ], default='common')
    is_active = models.BooleanField(default=True)
    is_limited_time = models.BooleanField(default=False)
    available_until = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, help_text="Additional item properties")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['category', 'name']
        
    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"
    
    @property
    def is_available(self):
        """Check if item is currently available for purchase"""
        if not self.is_active:
            return False
        if self.is_limited_time and self.available_until:
            return timezone.now() <= self.available_until
        return True


class UserInventory(models.Model):
    """Items owned by users"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inventory')
    item = models.ForeignKey(StoreItem, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    is_equipped = models.BooleanField(default=False)
    purchased_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, help_text="Item-specific user data")
    
    class Meta:
        unique_together = ['user', 'item']
        ordering = ['-purchased_at']
        
    def __str__(self):
        return f"{self.user.username} - {self.item.name} (x{self.quantity})"


class Achievement(models.Model):
    """Achievements that users can unlock"""
    
    TYPE_CHOICES = [
        ('social', 'Social'),
        ('watching', 'Watching'),
        ('hosting', 'Hosting'),
        ('community', 'Community'),
        ('milestone', 'Milestone'),
        ('special', 'Special Event'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.ImageField(upload_to='achievements/', null=True, blank=True)
    points = models.IntegerField(default=0, help_text="Points awarded when unlocked")
    currency_reward = models.IntegerField(default=0, help_text="Virtual currency reward")
    achievement_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    criteria = models.JSONField(help_text="Conditions to unlock this achievement")
    rarity = models.CharField(max_length=20, choices=[
        ('common', 'Common'),
        ('rare', 'Rare'),
        ('epic', 'Epic'),
        ('legendary', 'Legendary'),
    ], default='common')
    is_active = models.BooleanField(default=True)
    is_hidden = models.BooleanField(default=False, help_text="Hidden until unlocked")
    order = models.IntegerField(default=0, help_text="Display order")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'name']
        
    def __str__(self):
        return self.name


class UserAchievement(models.Model):
    """Achievements unlocked by users"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)
    progress_data = models.JSONField(default=dict, help_text="Progress tracking data")
    
    class Meta:
        unique_together = ['user', 'achievement']
        ordering = ['-unlocked_at']
        
    def __str__(self):
        return f"{self.user.username} - {self.achievement.name}"


class Reward(models.Model):
    """Daily/weekly rewards and challenges"""
    
    REWARD_TYPE_CHOICES = [
        ('daily', 'Daily Reward'),
        ('weekly', 'Weekly Reward'),
        ('challenge', 'Challenge Reward'),
        ('streak', 'Streak Reward'),
        ('milestone', 'Milestone Reward'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    reward_type = models.CharField(max_length=20, choices=REWARD_TYPE_CHOICES)
    currency_amount = models.IntegerField(default=0)
    items = models.ManyToManyField(StoreItem, blank=True, through='RewardItem')
    requirements = models.JSONField(help_text="Requirements to claim this reward")
    is_active = models.BooleanField(default=True)
    is_repeatable = models.BooleanField(default=True)
    cooldown_hours = models.IntegerField(default=24, help_text="Hours before can claim again")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['reward_type', 'name']
        
    def __str__(self):
        return f"{self.name} ({self.get_reward_type_display()})"


class RewardItem(models.Model):
    """Items included in rewards"""
    
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE)
    item = models.ForeignKey(StoreItem, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    probability = models.FloatField(default=1.0, help_text="Chance to receive (0.0-1.0)")
    
    class Meta:
        unique_together = ['reward', 'item']
        
    def __str__(self):
        return f"{self.reward.name} - {self.item.name} (x{self.quantity})"


class UserRewardClaim(models.Model):
    """Track reward claims by users"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reward_claims')
    reward = models.ForeignKey(Reward, on_delete=models.CASCADE)
    claimed_at = models.DateTimeField(auto_now_add=True)
    currency_received = models.IntegerField(default=0)
    items_received = models.JSONField(default=list, help_text="List of items received")
    
    class Meta:
        ordering = ['-claimed_at']
        
    def __str__(self):
        return f"{self.user.username} - {self.reward.name} ({self.claimed_at})"
    
    @property
    def can_claim_again(self):
        """Check if user can claim this reward again"""
        if not self.reward.is_repeatable:
            return False
        
        next_claim_time = self.claimed_at + timezone.timedelta(hours=self.reward.cooldown_hours)
        return timezone.now() >= next_claim_time


class UserCurrency(models.Model):
    """User virtual currency balance and transactions"""
    
    TRANSACTION_TYPES = [
        ('purchase', 'Item Purchase'),
        ('reward', 'Reward Earned'),
        ('achievement', 'Achievement Unlocked'),
        ('gift', 'Gift Received'),
        ('refund', 'Refund'),
        ('admin', 'Admin Adjustment'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='currency')
    balance = models.IntegerField(default=0)
    total_earned = models.IntegerField(default=0)
    total_spent = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.balance} coins"
    
    def add_currency(self, amount, transaction_type='reward', description=''):
        """Add currency to user account"""
        if amount > 0:
            self.balance += amount
            self.total_earned += amount
            self.save()
            
            # Create transaction record
            CurrencyTransaction.objects.create(
                user=self.user,
                amount=amount,
                transaction_type=transaction_type,
                description=description,
                balance_after=self.balance
            )
    
    def spend_currency(self, amount, transaction_type='purchase', description=''):
        """Spend currency from user account"""
        if amount > 0 and self.balance >= amount:
            self.balance -= amount
            self.total_spent += amount
            self.save()
            
            # Create transaction record
            CurrencyTransaction.objects.create(
                user=self.user,
                amount=-amount,
                transaction_type=transaction_type,
                description=description,
                balance_after=self.balance
            )
            return True
        return False


class CurrencyTransaction(models.Model):
    """Currency transaction history"""
    
    TRANSACTION_TYPES = UserCurrency.TRANSACTION_TYPES
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='currency_transactions')
    amount = models.IntegerField(help_text="Positive for earned, negative for spent")
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    description = models.CharField(max_length=255, blank=True)
    balance_after = models.IntegerField()
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"{self.user.username} - {self.amount} ({self.get_transaction_type_display()})"
