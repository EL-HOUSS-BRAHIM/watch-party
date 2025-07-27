"""
URL patterns for store endpoints
"""

from django.urls import path
from .views import (
    StoreItemsView,
    PurchaseItemView,
    UserInventoryView,
    AchievementsView,
    RewardsView,
    ClaimRewardView,
    UserStatsView,
)

app_name = 'store'

urlpatterns = [
    # Store items
    path('items/', StoreItemsView.as_view(), name='store_items'),
    path('purchase/', PurchaseItemView.as_view(), name='purchase_item'),
    
    # User inventory  
    path('inventory/', UserInventoryView.as_view(), name='user_inventory'),
    
    # Achievements
    path('achievements/', AchievementsView.as_view(), name='achievements'),
    
    # Rewards
    path('rewards/', RewardsView.as_view(), name='rewards'),
    path('rewards/<int:reward_id>/claim/', ClaimRewardView.as_view(), name='claim_reward'),
    
    # User stats
    path('stats/', UserStatsView.as_view(), name='user_stats'),
]
