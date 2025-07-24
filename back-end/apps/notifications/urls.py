from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    # Notification Management
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('<uuid:pk>/', views.NotificationDetailView.as_view(), name='notification-detail'),
    path('<uuid:pk>/mark-read/', views.mark_notification_read, name='mark-notification-read'),
    path('mark-all-read/', views.mark_all_notifications_read, name='mark-all-read'),
    path('clear-all/', views.clear_all_notifications, name='clear-all'),
    
    # Notification Preferences
    path('preferences/', views.NotificationPreferencesView.as_view(), name='preferences'),
    path('preferences/update/', views.update_notification_preferences, name='update-preferences'),
    
    # Mobile Push Notifications
    path('push/token/update/', views.update_push_token, name='update-push-token'),
    path('push/token/remove/', views.remove_push_token, name='remove-push-token'),
    path('push/test/', views.test_push_notification, name='test-push'),
    path('push/broadcast/', views.send_broadcast_push, name='broadcast-push'),
    
    # Templates and Channels (Admin)
    path('templates/', views.NotificationTemplateListView.as_view(), name='template-list'),
    path('templates/<uuid:pk>/', views.NotificationTemplateDetailView.as_view(), name='template-detail'),
    path('channels/', views.NotificationChannelListView.as_view(), name='channel-list'),
    
    # Notification Statistics
    path('stats/', views.notification_stats, name='notification-stats'),
    path('delivery-stats/', views.delivery_stats, name='delivery-stats'),
    
    # Bulk Operations
    path('bulk/send/', views.bulk_send_notifications, name='bulk-send'),
    path('cleanup/', views.cleanup_old_notifications, name='cleanup'),
]
