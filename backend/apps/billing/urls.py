"""
Billing URLs for Watch Party Backend
"""

from django.urls import path
from . import views

app_name = 'billing'

urlpatterns = [
    # Subscription Management
    path('plans/', views.SubscriptionPlanListView.as_view(), name='subscription_plans'),
    path('subscribe/', views.SubscriptionCreateView.as_view(), name='create_subscription'),
    path('subscription/', views.SubscriptionDetailView.as_view(), name='subscription_detail'),
    path('subscription/cancel/', views.SubscriptionCancelView.as_view(), name='cancel_subscription'),
    path('subscription/resume/', views.SubscriptionResumeView.as_view(), name='resume_subscription'),
    
    # Payment Methods
    path('payment-methods/', views.PaymentMethodsView.as_view(), name='payment_methods'),
    path('payment-methods/<uuid:pk>/', views.PaymentMethodDetailView.as_view(), name='payment_method_detail'),
    path('payment-methods/<uuid:pk>/set-default/', views.PaymentMethodSetDefaultView.as_view(), name='set_default_payment_method'),
    
    # Billing History
    path('history/', views.BillingHistoryView.as_view(), name='billing_history'),
    path('invoices/<uuid:invoice_id>/', views.InvoiceDetailView.as_view(), name='invoice_detail'),
    path('invoices/<uuid:invoice_id>/download/', views.InvoiceDownloadView.as_view(), name='invoice_download'),
    
    # Billing Address
    path('address/', views.BillingAddressView.as_view(), name='billing_address'),
    
    # Promotional Codes
    path('promo-code/validate/', views.PromotionalCodeValidateView.as_view(), name='validate_promo_code'),
    
    # Stripe Webhook
    path('webhooks/stripe/', views.stripe_webhook, name='stripe_webhook'),
]
