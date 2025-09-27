"""
URL patterns for search endpoints
"""

"""
URL patterns for Search application
"""

from django.urls import path
from . import views

app_name = 'search'

urlpatterns = [
    # Global search
    path('', views.GlobalSearchView.as_view(), name='global_search'),
    path('discover/', views.DiscoverContentView.as_view(), name='discover_content'),
    
    # Enhanced search features
    path('suggestions/', views.SearchSuggestionsView.as_view(), name='search_suggestions'),
    path('trending/', views.TrendingSearchView.as_view(), name='trending_searches'),
    
    # Saved searches
    path('saved/', views.SavedSearchView.as_view(), name='saved_searches'),
    path('saved/<uuid:search_id>/', views.SavedSearchView.as_view(), name='saved_search_detail'),
    
    # Analytics endpoints (for admin use)
    path('analytics/', views.SearchAnalyticsView.as_view(), name='search_analytics'),
]
