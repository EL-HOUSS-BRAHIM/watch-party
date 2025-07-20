"""
Billing models for Watch Party Backend
"""

import uuid
from decimal import Decimal
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class SubscriptionPlan(models.Model):
    """Subscription plan model"""
    
    INTERVAL_CHOICES = [
        ('month', 'Monthly'),
        ('year', 'Yearly'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name='Plan Name')
    description = models.TextField(blank=True, verbose_name='Plan Description')
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Price')
    currency = models.CharField(max_length=3, default='USD', verbose_name='Currency')
    billing_interval = models.CharField(max_length=10, choices=INTERVAL_CHOICES, default='month')
    
    # Stripe integration
    stripe_price_id = models.CharField(max_length=255, unique=True, verbose_name='Stripe Price ID')
    stripe_product_id = models.CharField(max_length=255, verbose_name='Stripe Product ID')
    
    # Plan features
    max_parties_per_month = models.PositiveIntegerField(default=10, verbose_name='Max Parties per Month')
    max_participants_per_party = models.PositiveIntegerField(default=10, verbose_name='Max Participants per Party')
    max_video_storage_gb = models.PositiveIntegerField(default=5, verbose_name='Max Video Storage (GB)')
    allows_hd_streaming = models.BooleanField(default=False, verbose_name='HD Streaming Allowed')
    allows_downloads = models.BooleanField(default=False, verbose_name='Downloads Allowed')
    priority_support = models.BooleanField(default=False, verbose_name='Priority Support')
    
    # Status
    is_active = models.BooleanField(default=True, verbose_name='Is Active')
    is_featured = models.BooleanField(default=False, verbose_name='Is Featured')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subscription_plans'
        ordering = ['price']
        verbose_name = 'Subscription Plan'
        verbose_name_plural = 'Subscription Plans'
        
    def __str__(self):
        return f"{self.name} - ${self.price}/{self.billing_interval}"


class Subscription(models.Model):
    """User subscription model"""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('past_due', 'Past Due'),
        ('canceled', 'Canceled'),
        ('unpaid', 'Unpaid'),
        ('trialing', 'Trialing'),
        ('incomplete', 'Incomplete'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name='subscriptions')
    
    # Stripe integration
    stripe_subscription_id = models.CharField(max_length=255, unique=True, verbose_name='Stripe Subscription ID')
    stripe_customer_id = models.CharField(max_length=255, verbose_name='Stripe Customer ID')
    
    # Subscription details
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    current_period_start = models.DateTimeField(verbose_name='Current Period Start')
    current_period_end = models.DateTimeField(verbose_name='Current Period End')
    trial_start = models.DateTimeField(null=True, blank=True, verbose_name='Trial Start')
    trial_end = models.DateTimeField(null=True, blank=True, verbose_name='Trial End')
    
    # Cancellation
    cancel_at_period_end = models.BooleanField(default=False, verbose_name='Cancel at Period End')
    canceled_at = models.DateTimeField(null=True, blank=True, verbose_name='Canceled At')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subscriptions'
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'
        
    def __str__(self):
        return f"{self.user.full_name} - {self.plan.name} ({self.status})"
    
    @property
    def is_active(self):
        """Check if subscription is currently active"""
        return self.status in ['active', 'trialing'] and self.current_period_end > timezone.now()
    
    @property
    def days_until_renewal(self):
        """Days until next renewal"""
        if self.current_period_end:
            delta = self.current_period_end - timezone.now()
            return max(0, delta.days)
        return 0


class PaymentMethod(models.Model):
    """User payment methods"""
    
    CARD_TYPES = [
        ('visa', 'Visa'),
        ('mastercard', 'Mastercard'),
        ('amex', 'American Express'),
        ('discover', 'Discover'),
        ('diners', 'Diners Club'),
        ('jcb', 'JCB'),
        ('unionpay', 'UnionPay'),
        ('unknown', 'Unknown'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods')
    
    # Stripe integration
    stripe_payment_method_id = models.CharField(max_length=255, unique=True, verbose_name='Stripe Payment Method ID')
    
    # Card details (stored by Stripe, we just keep metadata)
    card_brand = models.CharField(max_length=20, choices=CARD_TYPES, default='unknown')
    card_last4 = models.CharField(max_length=4, verbose_name='Last 4 Digits')
    card_exp_month = models.PositiveSmallIntegerField(verbose_name='Expiry Month')
    card_exp_year = models.PositiveSmallIntegerField(verbose_name='Expiry Year')
    
    # Settings
    is_default = models.BooleanField(default=False, verbose_name='Is Default Payment Method')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payment_methods'
        ordering = ['-is_default', '-created_at']
        verbose_name = 'Payment Method'
        verbose_name_plural = 'Payment Methods'
        
    def __str__(self):
        return f"{self.card_brand.title()} ending in {self.card_last4}"


class Invoice(models.Model):
    """Invoice model"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('open', 'Open'),
        ('paid', 'Paid'),
        ('uncollectible', 'Uncollectible'),
        ('void', 'Void'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invoices')
    subscription = models.ForeignKey(Subscription, null=True, blank=True, on_delete=models.SET_NULL, related_name='invoices')
    
    # Stripe integration
    stripe_invoice_id = models.CharField(max_length=255, unique=True, verbose_name='Stripe Invoice ID')
    
    # Invoice details
    invoice_number = models.CharField(max_length=50, unique=True, verbose_name='Invoice Number')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Amounts (in cents to avoid floating point issues)
    subtotal = models.PositiveIntegerField(verbose_name='Subtotal (cents)')
    tax_amount = models.PositiveIntegerField(default=0, verbose_name='Tax Amount (cents)')
    discount_amount = models.PositiveIntegerField(default=0, verbose_name='Discount Amount (cents)')
    total = models.PositiveIntegerField(verbose_name='Total Amount (cents)')
    amount_paid = models.PositiveIntegerField(default=0, verbose_name='Amount Paid (cents)')
    amount_due = models.PositiveIntegerField(default=0, verbose_name='Amount Due (cents)')
    
    currency = models.CharField(max_length=3, default='USD', verbose_name='Currency')
    
    # Dates
    invoice_date = models.DateTimeField(default=timezone.now, verbose_name='Invoice Date')
    due_date = models.DateTimeField(null=True, blank=True, verbose_name='Due Date')
    paid_at = models.DateTimeField(null=True, blank=True, verbose_name='Paid At')
    
    # Files
    invoice_pdf = models.URLField(blank=True, verbose_name='Invoice PDF URL')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'invoices'
        ordering = ['-created_at']
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'
        
    def __str__(self):
        return f"Invoice {self.invoice_number} - ${self.total/100:.2f}"
    
    @property
    def subtotal_dollars(self):
        return self.subtotal / 100
    
    @property
    def total_dollars(self):
        return self.total / 100
    
    @property
    def amount_due_dollars(self):
        return self.amount_due / 100


class PromoCode(models.Model):
    """Promotional code model"""
    
    DISCOUNT_TYPES = [
        ('percent', 'Percentage'),
        ('amount', 'Fixed Amount'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True, verbose_name='Promo Code')
    description = models.TextField(blank=True, verbose_name='Description')
    
    # Discount details
    discount_type = models.CharField(max_length=10, choices=DISCOUNT_TYPES, default='percent')
    discount_value = models.PositiveIntegerField(verbose_name='Discount Value')  # Percentage or cents
    
    # Stripe integration
    stripe_coupon_id = models.CharField(max_length=255, blank=True, verbose_name='Stripe Coupon ID')
    
    # Usage limits
    max_uses = models.PositiveIntegerField(null=True, blank=True, verbose_name='Max Uses')
    times_used = models.PositiveIntegerField(default=0, verbose_name='Times Used')
    max_uses_per_customer = models.PositiveIntegerField(default=1, verbose_name='Max Uses Per Customer')
    
    # Validity
    valid_from = models.DateTimeField(default=timezone.now, verbose_name='Valid From')
    valid_until = models.DateTimeField(null=True, blank=True, verbose_name='Valid Until')
    is_active = models.BooleanField(default=True, verbose_name='Is Active')
    
    # Restrictions
    minimum_amount = models.PositiveIntegerField(null=True, blank=True, verbose_name='Minimum Amount (cents)')
    applicable_plans = models.ManyToManyField(SubscriptionPlan, blank=True, verbose_name='Applicable Plans')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'promo_codes'
        ordering = ['-created_at']
        verbose_name = 'Promo Code'
        verbose_name_plural = 'Promo Codes'
        
    def __str__(self):
        return f"{self.code} - {self.discount_value}{'%' if self.discount_type == 'percent' else ' cents'}"
    
    @property
    def is_valid(self):
        """Check if promo code is currently valid"""
        now = timezone.now()
        
        if not self.is_active:
            return False
        
        if now < self.valid_from:
            return False
        
        if self.valid_until and now > self.valid_until:
            return False
        
        if self.max_uses and self.times_used >= self.max_uses:
            return False
        
        return True


class PromoCodeUsage(models.Model):
    """Track promo code usage by users"""
    
    promo_code = models.ForeignKey(PromoCode, on_delete=models.CASCADE, related_name='usages')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='promo_usages')
    subscription = models.ForeignKey(Subscription, null=True, blank=True, on_delete=models.CASCADE, related_name='promo_usages')
    
    # Usage details
    discount_amount = models.PositiveIntegerField(verbose_name='Discount Amount Applied (cents)')
    original_amount = models.PositiveIntegerField(verbose_name='Original Amount (cents)')
    final_amount = models.PositiveIntegerField(verbose_name='Final Amount (cents)')
    
    used_at = models.DateTimeField(auto_now_add=True, verbose_name='Used At')
    
    class Meta:
        db_table = 'promo_code_usages'
        unique_together = [['promo_code', 'user', 'subscription']]
        ordering = ['-used_at']
        verbose_name = 'Promo Code Usage'
        verbose_name_plural = 'Promo Code Usages'
        
    def __str__(self):
        return f"{self.user.full_name} used {self.promo_code.code}"
