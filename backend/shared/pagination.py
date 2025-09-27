"""
Pagination classes for Watch Party Backend
"""

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from collections import OrderedDict


class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination for most list views
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('page_size', self.page_size),
            ('results', data)
        ]))


class LargeResultsSetPagination(PageNumberPagination):
    """
    Pagination for large datasets like analytics
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200
    
    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('page_size', self.page_size),
            ('results', data)
        ]))


class SmallResultsSetPagination(PageNumberPagination):
    """
    Pagination for small datasets like friends list
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50
    
    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('page_size', self.page_size),
            ('results', data)
        ]))


class ChatMessagePagination(PageNumberPagination):
    """
    Pagination for chat messages - reverse order
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100
    ordering = '-created_at'  # Most recent first
    
    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('page_size', self.page_size),
            ('has_more', self.get_next_link() is not None),
            ('results', data)
        ]))


class VideoListPagination(PageNumberPagination):
    """
    Pagination for video listings
    """
    page_size = 12  # Grid layout friendly
    page_size_query_param = 'page_size'
    max_page_size = 48
    
    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('page_size', self.page_size),
            ('results', data)
        ]))


class PartyListPagination(PageNumberPagination):
    """
    Pagination for party listings
    """
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size = 60
    
    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('page_size', self.page_size),
            ('results', data)
        ]))


class NotificationPagination(PageNumberPagination):
    """
    Pagination for notifications
    """
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100
    ordering = '-created_at'
    
    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('total_pages', self.page.paginator.num_pages),
            ('current_page', self.page.number),
            ('page_size', self.page_size),
            ('unread_count', self.get_unread_count()),
            ('results', data)
        ]))
    
    def get_unread_count(self):
        """Get count of unread notifications"""
        # This would be implemented based on your notification model
        # For now, return 0 as placeholder
        return 0
