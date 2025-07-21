from django.urls import path
from . import views

app_name = 'notifications'

urlpatterns = [
    # Basic notification endpoint
    path('', views.NotificationListView.as_view(), name='notification_list'),
]
