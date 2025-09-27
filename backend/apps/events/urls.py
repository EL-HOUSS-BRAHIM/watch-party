from django.urls import path

from . import views

app_name = 'events'

urlpatterns = [
    # Event CRUD operations
    path('', views.EventListCreateView.as_view(), name='event-list-create'),
    path('<int:pk>/', views.EventDetailView.as_view(), name='event-detail'),
    
    # Event actions
    path('<int:pk>/join/', views.join_event, name='event-join'),
    path('<int:pk>/leave/', views.leave_event, name='event-leave'),
    path('<int:pk>/rsvp/', views.rsvp_event, name='event-rsvp'),
    
    # Event attendees
    path('<int:pk>/attendees/', views.EventAttendeesView.as_view(), name='event-attendees'),
    
    # Event invitations
    path('<int:pk>/invitations/', views.EventInvitationListCreateView.as_view(), name='event-invitations'),
    path('<int:pk>/invitations/<int:invitation_id>/respond/', views.respond_to_invitation, name='invitation-respond'),
    
    # Event lists and search
    path('upcoming/', views.UpcomingEventsView.as_view(), name='upcoming-events'),
    path('my/', views.MyEventsView.as_view(), name='my-events'),
    path('attending/', views.MyAttendingEventsView.as_view(), name='my-attending-events'),
    path('search/', views.EventSearchView.as_view(), name='event-search'),
]
