"""
Support System URLs for Watch Party Backend
"""

from django.urls import path
from .views import (
    faq_categories, faq_list, faq_vote, faq_view,
    support_tickets, support_ticket_detail, add_ticket_message,
    user_feedback, vote_feedback, help_search
)

app_name = 'support'

urlpatterns = [
    # FAQ endpoints
    path('faq/categories/', faq_categories, name='faq_categories'),
    path('faq/', faq_list, name='faq_list'),
    path('faq/<uuid:faq_id>/vote/', faq_vote, name='faq_vote'),
    path('faq/<uuid:faq_id>/view/', faq_view, name='faq_view'),
    
    # Support ticket endpoints
    path('tickets/', support_tickets, name='support_tickets'),
    path('tickets/<uuid:ticket_id>/', support_ticket_detail, name='support_ticket_detail'),
    path('tickets/<uuid:ticket_id>/messages/', add_ticket_message, name='add_ticket_message'),
    
    # Feedback endpoints
    path('feedback/', user_feedback, name='user_feedback'),
    path('feedback/<uuid:feedback_id>/vote/', vote_feedback, name='vote_feedback'),
    
    # Search endpoint
    path('search/', help_search, name='help_search'),
]
