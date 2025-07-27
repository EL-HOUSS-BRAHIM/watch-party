"""
Support System Views for Watch Party Backend
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db.models import Q, F, Count
from django.shortcuts import get_object_or_404
from django.utils import timezone

from core.responses import StandardResponse
from .models import (
    FAQCategory, FAQ, SupportTicket, SupportTicketMessage, 
    UserFeedback, FeedbackVote
)
from .serializers import (
    FAQCategorySerializer, FAQSerializer, SupportTicketSerializer,
    SupportTicketMessageSerializer, UserFeedbackSerializer
)


@api_view(['GET'])
@permission_classes([AllowAny])
def faq_categories(request):
    """Get all active FAQ categories"""
    try:
        categories = FAQCategory.objects.filter(is_active=True).prefetch_related('faqs')
        serializer = FAQCategorySerializer(categories, many=True)
        
        return StandardResponse.success({
            'categories': serializer.data
        }, "FAQ categories retrieved successfully")
        
    except Exception as e:
        return StandardResponse.error(f"Error retrieving FAQ categories: {str(e)}")


@api_view(['GET'])
@permission_classes([AllowAny])
def faq_list(request):
    """Get FAQs with optional filtering"""
    try:
        category_slug = request.GET.get('category')
        search_query = request.GET.get('search')
        featured_only = request.GET.get('featured') == 'true'
        
        faqs = FAQ.objects.filter(is_active=True)
        
        if category_slug:
            faqs = faqs.filter(category__slug=category_slug)
        
        if featured_only:
            faqs = faqs.filter(is_featured=True)
        
        if search_query:
            faqs = faqs.filter(
                Q(question__icontains=search_query) |
                Q(answer__icontains=search_query) |
                Q(keywords__icontains=search_query)
            )
        
        serializer = FAQSerializer(faqs, many=True)
        
        return StandardResponse.success({
            'faqs': serializer.data,
            'total_count': faqs.count(),
            'filters_applied': {
                'category': category_slug,
                'search': search_query,
                'featured_only': featured_only
            }
        }, "FAQs retrieved successfully")
        
    except Exception as e:
        return StandardResponse.error(f"Error retrieving FAQs: {str(e)}")


@api_view(['POST'])
@permission_classes([AllowAny])
def faq_vote(request, faq_id):
    """Vote on FAQ helpfulness"""
    try:
        faq = get_object_or_404(FAQ, id=faq_id, is_active=True)
        vote_type = request.data.get('vote')  # 'helpful' or 'unhelpful'
        
        if vote_type not in ['helpful', 'unhelpful']:
            return StandardResponse.validation_error({
                'vote': ['Vote must be either "helpful" or "unhelpful"']
            })
        
        # Update vote count
        if vote_type == 'helpful':
            faq.helpful_votes = F('helpful_votes') + 1
        else:
            faq.unhelpful_votes = F('unhelpful_votes') + 1
        
        faq.save(update_fields=[f'{vote_type}_votes'])
        faq.refresh_from_db()
        
        return StandardResponse.success({
            'helpful_votes': faq.helpful_votes,
            'unhelpful_votes': faq.unhelpful_votes,
            'helpfulness_ratio': faq.helpfulness_ratio
        }, f"FAQ marked as {vote_type}")
        
    except Exception as e:
        return StandardResponse.error(f"Error voting on FAQ: {str(e)}")


@api_view(['POST'])
@permission_classes([AllowAny])
def faq_view(request, faq_id):
    """Track FAQ view"""
    try:
        faq = get_object_or_404(FAQ, id=faq_id, is_active=True)
        faq.view_count = F('view_count') + 1
        faq.save(update_fields=['view_count'])
        
        return StandardResponse.success({}, "FAQ view tracked")
        
    except Exception as e:
        return StandardResponse.error(f"Error tracking FAQ view: {str(e)}")


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def support_tickets(request):
    """Get user's support tickets or create new ticket"""
    
    if request.method == 'GET':
        try:
            tickets = SupportTicket.objects.filter(user=request.user)
            status_filter = request.GET.get('status')
            
            if status_filter:
                tickets = tickets.filter(status=status_filter)
            
            serializer = SupportTicketSerializer(tickets, many=True)
            
            return StandardResponse.success({
                'tickets': serializer.data,
                'total_count': tickets.count()
            }, "Support tickets retrieved successfully")
            
        except Exception as e:
            return StandardResponse.error(f"Error retrieving support tickets: {str(e)}")
    
    elif request.method == 'POST':
        try:
            serializer = SupportTicketSerializer(data=request.data, context={'request': request})
            
            if serializer.is_valid():
                ticket = serializer.save(user=request.user)
                
                return StandardResponse.success({
                    'ticket': SupportTicketSerializer(ticket).data
                }, "Support ticket created successfully", status_code=status.HTTP_201_CREATED)
            else:
                return StandardResponse.validation_error(serializer.errors)
                
        except Exception as e:
            return StandardResponse.error(f"Error creating support ticket: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def support_ticket_detail(request, ticket_id):
    """Get specific support ticket with messages"""
    try:
        ticket = get_object_or_404(
            SupportTicket, 
            id=ticket_id, 
            user=request.user
        )
        
        serializer = SupportTicketSerializer(ticket)
        
        return StandardResponse.success({
            'ticket': serializer.data
        }, "Support ticket retrieved successfully")
        
    except Exception as e:
        return StandardResponse.error(f"Error retrieving support ticket: {str(e)}")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_ticket_message(request, ticket_id):
    """Add message to support ticket"""
    try:
        ticket = get_object_or_404(
            SupportTicket, 
            id=ticket_id, 
            user=request.user
        )
        
        message_content = request.data.get('message')
        if not message_content:
            return StandardResponse.validation_error({
                'message': ['Message content is required']
            })
        
        message = SupportTicketMessage.objects.create(
            ticket=ticket,
            author=request.user,
            message=message_content
        )
        
        # Update ticket status if resolved
        if ticket.status == 'resolved':
            ticket.status = 'open'
            ticket.save()
        
        serializer = SupportTicketMessageSerializer(message)
        
        return StandardResponse.success({
            'message': serializer.data
        }, "Message added successfully", status_code=status.HTTP_201_CREATED)
        
    except Exception as e:
        return StandardResponse.error(f"Error adding message: {str(e)}")


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def user_feedback(request):
    """Get user feedback or submit new feedback"""
    
    if request.method == 'GET':
        try:
            feedback_type = request.GET.get('type')
            status_filter = request.GET.get('status')
            my_feedback = request.GET.get('my_feedback') == 'true'
            
            feedback = UserFeedback.objects.all()
            
            if my_feedback:
                feedback = feedback.filter(user=request.user)
            
            if feedback_type:
                feedback = feedback.filter(feedback_type=feedback_type)
            
            if status_filter:
                feedback = feedback.filter(status=status_filter)
            
            # Order by vote score for public viewing
            if not my_feedback:
                feedback = feedback.annotate(
                    vote_score=F('upvotes') - F('downvotes')
                ).order_by('-vote_score', '-created_at')
            
            serializer = UserFeedbackSerializer(feedback, many=True, context={'request': request})
            
            return StandardResponse.success({
                'feedback': serializer.data,
                'total_count': feedback.count()
            }, "User feedback retrieved successfully")
            
        except Exception as e:
            return StandardResponse.error(f"Error retrieving user feedback: {str(e)}")
    
    elif request.method == 'POST':
        try:
            serializer = UserFeedbackSerializer(data=request.data, context={'request': request})
            
            if serializer.is_valid():
                feedback = serializer.save(user=request.user)
                
                return StandardResponse.success({
                    'feedback': UserFeedbackSerializer(feedback).data
                }, "Feedback submitted successfully", status_code=status.HTTP_201_CREATED)
            else:
                return StandardResponse.validation_error(serializer.errors)
                
        except Exception as e:
            return StandardResponse.error(f"Error submitting feedback: {str(e)}")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def vote_feedback(request, feedback_id):
    """Vote on user feedback"""
    try:
        feedback = get_object_or_404(UserFeedback, id=feedback_id)
        vote_type = request.data.get('vote')  # 'up' or 'down'
        
        if vote_type not in ['up', 'down']:
            return StandardResponse.validation_error({
                'vote': ['Vote must be either "up" or "down"']
            })
        
        # Check if user already voted
        existing_vote = FeedbackVote.objects.filter(
            feedback=feedback, 
            user=request.user
        ).first()
        
        if existing_vote:
            if existing_vote.vote == vote_type:
                return StandardResponse.error(
                    "You have already voted on this feedback",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            else:
                # Update existing vote
                # Remove old vote count
                if existing_vote.vote == 'up':
                    feedback.upvotes = F('upvotes') - 1
                else:
                    feedback.downvotes = F('downvotes') - 1
                
                # Add new vote count
                if vote_type == 'up':
                    feedback.upvotes = F('upvotes') + 1
                else:
                    feedback.downvotes = F('downvotes') + 1
                
                existing_vote.vote = vote_type
                existing_vote.save()
        else:
            # Create new vote
            FeedbackVote.objects.create(
                feedback=feedback,
                user=request.user,
                vote=vote_type
            )
            
            if vote_type == 'up':
                feedback.upvotes = F('upvotes') + 1
            else:
                feedback.downvotes = F('downvotes') + 1
        
        feedback.save()
        feedback.refresh_from_db()
        
        return StandardResponse.success({
            'upvotes': feedback.upvotes,
            'downvotes': feedback.downvotes,
            'vote_score': feedback.vote_score
        }, f"Feedback {vote_type}voted successfully")
        
    except Exception as e:
        return StandardResponse.error(f"Error voting on feedback: {str(e)}")


@api_view(['GET'])
@permission_classes([AllowAny])
def help_search(request):
    """Search across FAQs and support content"""
    try:
        query = request.GET.get('q', '').strip()
        if not query:
            return StandardResponse.validation_error({
                'q': ['Search query is required']
            })
        
        # Search FAQs
        faq_results = FAQ.objects.filter(
            Q(question__icontains=query) |
            Q(answer__icontains=query) |
            Q(keywords__icontains=query),
            is_active=True
        )[:10]
        
        # Search feedback for feature requests
        feedback_results = UserFeedback.objects.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query),
            feedback_type='feature',
            status__in=['planned', 'in_progress', 'completed']
        ).annotate(
            vote_score=F('upvotes') - F('downvotes')
        ).order_by('-vote_score')[:5]
        
        return StandardResponse.success({
            'query': query,
            'results': {
                'faqs': FAQSerializer(faq_results, many=True).data,
                'feature_requests': UserFeedbackSerializer(feedback_results, many=True).data
            },
            'total_results': faq_results.count() + feedback_results.count()
        }, "Help search completed successfully")
        
    except Exception as e:
        return StandardResponse.error(f"Error searching help content: {str(e)}")
