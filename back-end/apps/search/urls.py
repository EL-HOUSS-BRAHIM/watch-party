"""
URL patterns for search endpoints
"""

from django.urls import path
from .views import GlobalSearchView, DiscoverContentView

app_name = 'search'

urlpatterns = [
    path('', GlobalSearchView.as_view(), name='global_search'),
    path('discover/', DiscoverContentView.as_view(), name='discover'),
]
