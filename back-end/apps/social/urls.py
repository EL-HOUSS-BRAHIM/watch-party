"""
URL patterns for social groups endpoints
"""

from django.urls import path
from .views import SocialGroupsView, JoinGroupView, LeaveGroupView, GroupDetailView

app_name = 'social'

urlpatterns = [
    path('groups/', SocialGroupsView.as_view(), name='social_groups'),
    path('groups/<int:group_id>/', GroupDetailView.as_view(), name='group_detail'),
    path('groups/<int:group_id>/join/', JoinGroupView.as_view(), name='join_group'),
    path('groups/<int:group_id>/leave/', LeaveGroupView.as_view(), name='leave_group'),
]
