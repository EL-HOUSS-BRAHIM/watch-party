"""
Billing serializers for Watch Party Backend
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes
from .models import (
    SubscriptionPlan, Subscription, PaymentMethod, 
    Invoice, Payment, BillingAddress, PromotionalCode
)

User = get_user_model()


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """Subscription plan serializer"""
    
    features = serializers.SerializerMethodField()
    is_most_popular = serializers.SerializerMethodField()
    
    class Meta:
        model = SubscriptionPlan
        fields = [
            'id', 'name', 'description', 'price', 'currency', 'billing_interval',
            'max_parties_per_month', 'max_participants_per_party', 'max_video_storage_gb',
            'allows_hd_streaming', 'allows_downloads', 'priority_support',
            'is_featured', 'features', 'is_most_popular'
        ]
        read_only_fields = ['id', 'features', 'is_most_popular']
    
    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_features(self, obj) -> List[str]:
        """Get formatted list of plan features"""
        features = []
        
        if obj.max_parties_per_month:
            if obj.max_parties_per_month == 999999:  # Unlimited
                features.append('Unlimited watch parties')
            else:
                features.append(f'Up to {obj.max_parties_per_month} watch parties per month')
        
        if obj.max_participants_per_party:
            features.append(f'Up to {obj.max_participants_per_party} participants per party')
        
        if obj.max_video_storage_gb:
            features.append(f'{obj.max_video_storage_gb}GB video storage')
        
        if obj.allows_hd_streaming:
            features.append('HD streaming')
        
        if obj.allows_downloads:
            features.append('Video downloads')
        
        if obj.priority_support:
            features.append('Priority customer support')
        
        return features
    
    @extend_schema_field(OpenApiTypes.BOOL)
    def get_is_most_popular(self, obj) -> bool:
        """Check if this is the most popular plan"""
        return obj.is_featured


class SubscriptionSerializer(serializers.ModelSerializer):
    """User subscription serializer"""
    
    plan = SubscriptionPlanSerializer(read_only=True)
    days_until_renewal = serializers.SerializerMethodField()
    is_expiring_soon = serializers.SerializerMethodField()
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'plan', 'status', 'is_active', 'current_period_start', 
            'current_period_end', 'cancel_at_period_end', 'canceled_at',
            'trial_start', 'trial_end', 'days_until_renewal', 'is_expiring_soon',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    @extend_schema_field(OpenApiTypes.INT)
    def get_days_until_renewal(self, obj) -> int:
        """Get days until next renewal"""
        if obj.current_period_end:
            delta = obj.current_period_end - timezone.now()
            return max(0, delta.days)
        return 0
    
    @extend_schema_field(OpenApiTypes.BOOL)
    def get_is_expiring_soon(self, obj) -> bool:
        """Check if subscription is expiring soon (within 7 days)"""
        return self.get_days_until_renewal(obj) <= 7


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Payment method serializer"""
    
    display_name = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'payment_method_type', 'card_brand', 'card_last4', 
            'card_exp_month', 'card_exp_year', 'is_default', 'is_expired',
            'display_name', 'created_at'
        ]
        read_only_fields = ['id', 'display_name', 'is_expired', 'created_at']
    
    @extend_schema_field(OpenApiTypes.STR)
    def get_display_name(self, obj) -> str:
        """Get human-readable payment method name"""
        if obj.card_brand and obj.card_last4:
            brand = obj.card_brand.title()
            return f"{brand} ending in {obj.card_last4}"
        return obj.payment_method_type.title()
    
    @extend_schema_field(OpenApiTypes.BOOL)
    def get_is_expired(self, obj) -> bool:
        """Check if card has expired"""
        """Check if card has expired"""
        if obj.card_exp_month and obj.card_exp_year:
            from django.utils import timezone
            now = timezone.now()
            return (obj.card_exp_year < now.year or 
                   (obj.card_exp_year == now.year and obj.card_exp_month < now.month))
        return False


class InvoiceSerializer(serializers.ModelSerializer):
    """Invoice serializer"""
    
    plan_name = serializers.CharField(source='subscription.plan.name', read_only=True)
    payment_status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'plan_name', 'amount', 'currency', 
            'status', 'payment_status_display', 'due_date', 'paid_at',
            'invoice_url', 'created_at'
        ]
        read_only_fields = ['id', 'plan_name', 'payment_status_display', 'created_at']
    
    @extend_schema_field(OpenApiTypes.STR)
    def get_payment_status_display(self, obj) -> str:
        """Get human-readable payment status"""
        status_map = {
            'draft': 'Draft',
            'open': 'Pending Payment',
            'paid': 'Paid',
            'void': 'Void',
            'uncollectible': 'Uncollectible'
        }
        return status_map.get(obj.status, obj.status.title())


class PaymentSerializer(serializers.ModelSerializer):
    """Payment serializer"""
    
    plan_name = serializers.CharField(source='subscription.plan.name', read_only=True)
    status_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Payment
        fields = [
            'id', 'plan_name', 'amount', 'currency', 'status', 'status_display',
            'created_at', 'paid_at'
        ]
        read_only_fields = ['id', 'plan_name', 'status_display', 'created_at']
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_status_display(self, obj):
        """Get human-readable payment status"""
        status_map = {
            'succeeded': 'Successful',
            'pending': 'Pending',
            'failed': 'Failed',
            'canceled': 'Canceled',
            'refunded': 'Refunded'
        }
        return status_map.get(obj.status, obj.status.title())


class BillingAddressSerializer(serializers.ModelSerializer):
    """Billing address serializer"""
    
    class Meta:
        model = BillingAddress
        fields = [
            'id', 'company_name', 'address_line_1', 'address_line_2',
            'city', 'state_province', 'postal_code', 'country',
            'tax_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_postal_code(self, value):
        """Validate postal code format"""
        # Basic validation - can be enhanced based on country
        if value and len(value.strip()) < 3:
            raise serializers.ValidationError("Postal code must be at least 3 characters")
        return value.strip() if value else value


class PromotionalCodeSerializer(serializers.ModelSerializer):
    """Promotional code serializer"""
    
    is_valid = serializers.SerializerMethodField()
    discount_description = serializers.SerializerMethodField()
    
    class Meta:
        model = PromotionalCode
        fields = [
            'id', 'code', 'name', 'description', 'discount_type', 'discount_value',
            'max_uses', 'current_uses', 'max_uses_per_user', 'valid_from', 'valid_until',
            'is_valid', 'discount_description'
        ]
        read_only_fields = ['id', 'current_uses', 'is_valid', 'discount_description']
    
    @extend_schema_field(OpenApiTypes.BOOL)

    
    def get_is_valid(self, obj):
        """Check if promotional code is currently valid"""
        from django.utils import timezone
        now = timezone.now()
        return (obj.is_active and 
                obj.valid_from <= now <= obj.valid_until and
                (not obj.max_uses or obj.current_uses < obj.max_uses))
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_discount_description(self, obj):
        """Get human-readable discount description"""
        if obj.discount_type == 'percentage':
            return f"{obj.discount_value}% off"
        else:
            return f"${obj.discount_value} off"


class StripeSubscriptionCreateSerializer(serializers.Serializer):
    """Serializer for creating Stripe subscriptions"""
    
    plan_id = serializers.UUIDField()
    payment_method_id = serializers.CharField(max_length=255)
    promotional_code = serializers.CharField(max_length=50, required=False, allow_blank=True)
    
    def validate_plan_id(self, value):
        """Validate that plan exists and is active"""
        if not SubscriptionPlan.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Invalid or inactive subscription plan")
        return value
    
    def validate_promotional_code(self, value):
        """Validate promotional code if provided"""
        if value:
            from django.utils import timezone
            try:
                promo = PromotionalCode.objects.get(
                    code=value.upper(),
                    is_active=True,
                    valid_from__lte=timezone.now(),
                    valid_until__gte=timezone.now()
                )
                if promo.max_uses and promo.current_uses >= promo.max_uses:
                    raise serializers.ValidationError("Promotional code has reached its usage limit")
                return value.upper()
            except PromotionalCode.DoesNotExist:
                raise serializers.ValidationError("Invalid promotional code")
        return value


class SubscriptionUpdateSerializer(serializers.Serializer):
    """Serializer for updating subscriptions"""
    
    new_plan_id = serializers.UUIDField()
    prorate = serializers.BooleanField(default=True)
    
    def validate_new_plan_id(self, value):
        """Validate that plan exists and is active"""
        if not SubscriptionPlan.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Invalid or inactive subscription plan")
        return value


class BillingPortalSessionSerializer(serializers.Serializer):
    """Serializer for creating billing portal sessions"""
    
    return_url = serializers.URLField(required=False)


class PaymentIntentSerializer(serializers.Serializer):
    """Serializer for payment intent creation"""
    
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(max_length=3, default='usd')
    payment_method_id = serializers.CharField(max_length=255, required=False)
    confirm = serializers.BooleanField(default=False)
    
    def validate_amount(self, value):
        """Validate amount is positive"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive")
        return value


class WebhookEventSerializer(serializers.Serializer):
    """Serializer for webhook events"""
    
    id = serializers.CharField()
    object = serializers.CharField()
    type = serializers.CharField()
    data = serializers.DictField()
    created = serializers.IntegerField()


class UsageStatsSerializer(serializers.Serializer):
    """Serializer for user usage statistics"""
    
    current_plan = SubscriptionPlanSerializer()
    usage = serializers.DictField()
    limits = serializers.DictField()
    usage_percentage = serializers.DictField()
    is_over_limit = serializers.BooleanField()


class BillingDashboardSerializer(serializers.Serializer):
    """Serializer for billing dashboard data"""
    
    subscription = SubscriptionSerializer()
    upcoming_invoice = InvoiceSerializer()
    recent_payments = PaymentSerializer(many=True)
    payment_methods = PaymentMethodSerializer(many=True)
    usage_stats = UsageStatsSerializer()


class InvoicePreviewSerializer(serializers.Serializer):
    """Serializer for invoice preview"""
    
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2)
    discount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    tax = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    currency = serializers.CharField(max_length=3)
    line_items = serializers.ListField()
    proration_date = serializers.DateTimeField(required=False)


class RefundRequestSerializer(serializers.Serializer):
    """Serializer for refund requests"""
    
    payment_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    reason = serializers.ChoiceField(choices=[
        ('duplicate', 'Duplicate charge'),
        ('fraudulent', 'Fraudulent charge'),
        ('requested_by_customer', 'Requested by customer'),
        ('subscription_canceled', 'Subscription canceled')
    ], default='requested_by_customer')
    
    def validate_payment_id(self, value):
        """Validate that payment exists"""
        if not Payment.objects.filter(id=value, status='succeeded').exists():
            raise serializers.ValidationError("Invalid or non-refundable payment")
        return value


class TaxRateSerializer(serializers.Serializer):
    """Serializer for tax rates"""
    
    display_name = serializers.CharField()
    percentage = serializers.FloatField()
    inclusive = serializers.BooleanField()
    country = serializers.CharField()
    state = serializers.CharField(required=False)


class CouponSerializer(serializers.Serializer):
    """Serializer for Stripe coupons"""
    
    id = serializers.CharField()
    name = serializers.CharField()
    percent_off = serializers.FloatField(required=False)
    amount_off = serializers.IntegerField(required=False)
    currency = serializers.CharField(required=False)
    duration = serializers.CharField()
    duration_in_months = serializers.IntegerField(required=False)
    max_redemptions = serializers.IntegerField(required=False)
    redeem_by = serializers.DateTimeField(required=False)


# Additional serializers for views that need explicit serializer_class

class PaymentMethodSetDefaultSerializer(serializers.Serializer):
    """Serializer for setting payment method as default"""
    pass  # No input data needed, uses URL parameter

class InvoiceDownloadSerializer(serializers.Serializer):
    """Serializer for invoice download"""
    pass  # No input data needed, uses URL parameter

class PromotionalCodeValidateSerializer(serializers.Serializer):
    """Serializer for promotional code validation"""
    code = serializers.CharField(max_length=50)
    plan_id = serializers.UUIDField(required=False)
    
    def validate_code(self, value):
        return value.strip().upper()
