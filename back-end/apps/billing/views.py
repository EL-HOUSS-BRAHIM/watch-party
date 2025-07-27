"""
Billing views for Watch Party Backend
"""

import stripe
from decimal import Decimal
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings
from django.db import transaction
from .models import (
    SubscriptionPlan, Subscription, PaymentMethod, 
    Invoice, Payment, BillingAddress, PromotionalCode
)
from .serializers import (
    SubscriptionPlanSerializer, SubscriptionSerializer, PaymentMethodSerializer,
    InvoiceSerializer, PaymentSerializer, BillingAddressSerializer,
    PromotionalCodeSerializer, StripeSubscriptionCreateSerializer
)

User = get_user_model()

# Configure Stripe
stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', '')


class SubscriptionPlanListView(generics.ListAPIView):
    """List all available subscription plans"""
    
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return SubscriptionPlan.objects.filter(is_active=True).order_by('price')


class SubscriptionCreateView(generics.CreateAPIView):
    """Create a new subscription"""
    
    serializer_class = StripeSubscriptionCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        plan_id = serializer.validated_data['plan_id']
        payment_method_id = serializer.validated_data['payment_method_id']
        promotional_code = serializer.validated_data.get('promotional_code')
        
        try:
            # Get the subscription plan
            plan = get_object_or_404(SubscriptionPlan, id=plan_id, is_active=True)
            
            # Get or create Stripe customer
            stripe_customer = self._get_or_create_stripe_customer(user)
            
            # Attach payment method to customer
            stripe.PaymentMethod.attach(
                payment_method_id,
                customer=stripe_customer.id,
            )
            
            # Set as default payment method
            stripe.Customer.modify(
                stripe_customer.id,
                invoice_settings={
                    'default_payment_method': payment_method_id,
                },
            )
            
            # Create subscription
            subscription_params = {
                'customer': stripe_customer.id,
                'items': [{
                    'price': plan.stripe_price_id,
                }],
                'payment_behavior': 'default_incomplete',
                'payment_settings': {
                    'save_default_payment_method': 'on_subscription'
                },
                'expand': ['latest_invoice.payment_intent'],
            }
            
            # Apply promotional code if provided
            if promotional_code:
                promo = get_object_or_404(
                    PromotionalCode, 
                    code=promotional_code, 
                    is_active=True,
                    valid_from__lte=timezone.now(),
                    valid_until__gte=timezone.now()
                )
                if promo.stripe_coupon_id:
                    subscription_params['coupon'] = promo.stripe_coupon_id
            
            stripe_subscription = stripe.Subscription.create(**subscription_params)
            
            # Create local subscription record
            with transaction.atomic():
                subscription = Subscription.objects.create(
                    user=user,
                    plan=plan,
                    stripe_subscription_id=stripe_subscription.id,
                    stripe_customer_id=stripe_customer.id,
                    status='incomplete',
                    current_period_start=timezone.datetime.fromtimestamp(
                        stripe_subscription.current_period_start, 
                        tz=timezone.utc
                    ),
                    current_period_end=timezone.datetime.fromtimestamp(
                        stripe_subscription.current_period_end, 
                        tz=timezone.utc
                    ),
                )
                
                # Save payment method
                payment_method = PaymentMethod.objects.create(
                    user=user,
                    stripe_payment_method_id=payment_method_id,
                    is_default=True
                )
                
                # Update user premium status if subscription is active
                if stripe_subscription.status == 'active':
                    user.is_premium = True
                    user.subscription_expires = subscription.current_period_end
                    user.save()
                    subscription.status = 'active'
                    subscription.save()
            
            return Response({
                'success': True,
                'subscription_id': subscription.id,
                'client_secret': stripe_subscription.latest_invoice.payment_intent.client_secret,
                'status': stripe_subscription.status
            }, status=status.HTTP_201_CREATED)
            
        except stripe.error.StripeError as e:
            return Response({
                'success': False,
                'error': str(e),
                'type': 'stripe_error'
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e),
                'type': 'server_error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_or_create_stripe_customer(self, user):
        """Get existing Stripe customer or create new one"""
        try:
            # Try to find existing customer
            customers = stripe.Customer.list(email=user.email, limit=1)
            if customers.data:
                return customers.data[0]
        except stripe.error.StripeError:
            pass
        
        # Create new customer
        return stripe.Customer.create(
            email=user.email,
            name=user.full_name,
            metadata={
                'user_id': str(user.id)
            }
        )


class SubscriptionDetailView(generics.RetrieveAPIView):
    """Get current user's subscription details"""
    
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        try:
            return Subscription.objects.get(user=user, status__in=['active', 'trialing', 'past_due'])
        except Subscription.DoesNotExist:
            return None
    
    def retrieve(self, request, *args, **kwargs):
        subscription = self.get_object()
        if subscription:
            serializer = self.get_serializer(subscription)
            return Response(serializer.data)
        else:
            return Response({
                'success': True,
                'message': 'No active subscription found',
                'has_subscription': False
            })


class SubscriptionCancelView(generics.GenericAPIView):
    """Cancel current user's subscription"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = request.user
        cancel_immediately = request.data.get('cancel_immediately', False)
        cancellation_reason = request.data.get('reason', '')
        
        try:
            subscription = Subscription.objects.get(
                user=user, 
                status__in=['active', 'trialing']
            )
            
            if cancel_immediately:
                # Cancel immediately
                stripe.Subscription.delete(subscription.stripe_subscription_id)
                subscription.status = 'canceled'
                subscription.canceled_at = timezone.now()
                subscription.cancellation_reason = cancellation_reason
                subscription.save()
                
                # Remove premium status
                user.is_premium = False
                user.save()
                
                message = 'Subscription canceled immediately'
            else:
                # Cancel at period end
                stripe.Subscription.modify(
                    subscription.stripe_subscription_id,
                    cancel_at_period_end=True
                )
                subscription.cancel_at_period_end = True
                subscription.cancellation_reason = cancellation_reason
                subscription.save()
                
                message = 'Subscription will be canceled at the end of the current billing period'
            
            return Response({'success': True, 'message': message})
            
        except Subscription.DoesNotExist:
            return Response(
                {'error': 'No active subscription found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except stripe.error.StripeError as e:
            return Response({
                'error': str(e),
                'type': 'stripe_error'
            }, status=status.HTTP_400_BAD_REQUEST)


class SubscriptionResumeView(generics.GenericAPIView):
    """Resume a canceled subscription"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        try:
            subscription = Subscription.objects.get(
                user=user,
                cancel_at_period_end=True,
                status='active'
            )
            
            # Resume subscription in Stripe
            stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                cancel_at_period_end=False
            )
            
            # Update local record
            subscription.cancel_at_period_end = False
            subscription.cancellation_reason = ''
            subscription.save()
            
            return Response({'success': True, 'message': 'Subscription resumed successfully'})
            
        except Subscription.DoesNotExist:
            return Response(
                {'error': 'No cancelable subscription found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except stripe.error.StripeError as e:
            return Response({
                'error': str(e),
                'type': 'stripe_error'
            }, status=status.HTTP_400_BAD_REQUEST)


class PaymentMethodsView(generics.ListCreateAPIView):
    """List and create payment methods"""
    
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return self.request.user.payment_methods.filter(is_active=True).order_by('-is_default', '-created_at')
    
    def create(self, request, *args, **kwargs):
        payment_method_id = request.data.get('stripe_payment_method_id')
        set_as_default = request.data.get('set_as_default', False)
        
        if not payment_method_id:
            return Response(
                {'error': 'stripe_payment_method_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = request.user
            
            # Get or create Stripe customer
            stripe_customer = self._get_or_create_stripe_customer(user)
            
            # Attach payment method to customer
            stripe.PaymentMethod.attach(
                payment_method_id,
                customer=stripe_customer.id,
            )
            
            # Get payment method details from Stripe
            stripe_pm = stripe.PaymentMethod.retrieve(payment_method_id)
            
            # Create local payment method record
            with transaction.atomic():
                if set_as_default:
                    # Unset other default payment methods
                    PaymentMethod.objects.filter(user=user, is_default=True).update(is_default=False)
                
                payment_method = PaymentMethod.objects.create(
                    user=user,
                    stripe_payment_method_id=payment_method_id,
                    payment_method_type=stripe_pm.type,
                    card_brand=stripe_pm.card.brand if stripe_pm.card else None,
                    card_last4=stripe_pm.card.last4 if stripe_pm.card else None,
                    card_exp_month=stripe_pm.card.exp_month if stripe_pm.card else None,
                    card_exp_year=stripe_pm.card.exp_year if stripe_pm.card else None,
                    is_default=set_as_default
                )
            
            serializer = self.get_serializer(payment_method)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except stripe.error.StripeError as e:
            return Response({
                'error': str(e),
                'type': 'stripe_error'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def _get_or_create_stripe_customer(self, user):
        """Get existing Stripe customer or create new one"""
        try:
            customers = stripe.Customer.list(email=user.email, limit=1)
            if customers.data:
                return customers.data[0]
        except stripe.error.StripeError:
            pass
        
        return stripe.Customer.create(
            email=user.email,
            name=user.full_name,
            metadata={'user_id': str(user.id)}
        )


class PaymentMethodDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a payment method"""
    
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return self.request.user.payment_methods.filter(is_active=True)
    
    def destroy(self, request, *args, **kwargs):
        payment_method = self.get_object()
        
        try:
            # Detach from Stripe
            stripe.PaymentMethod.detach(payment_method.stripe_payment_method_id)
            
            # Mark as inactive instead of deleting
            payment_method.is_active = False
            payment_method.save()
            
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        except stripe.error.StripeError as e:
            return Response({
                'success': False,
                'error': str(e),
                'type': 'stripe_error'
            }, status=status.HTTP_400_BAD_REQUEST)


class PaymentMethodSetDefaultView(generics.GenericAPIView):
    """Set a payment method as default"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, pk):
        try:
            payment_method = get_object_or_404(
                PaymentMethod,
                id=pk,
                user=request.user,
                is_active=True
            )
            
            with transaction.atomic():
                # Unset other default payment methods
                PaymentMethod.objects.filter(
                    user=request.user,
                    is_default=True
                ).update(is_default=False)
                
                # Set this one as default
                payment_method.is_default = True
                payment_method.save()
                
                # Update in Stripe as well
                try:
                    # Get or create Stripe customer
                    stripe_customer = self._get_or_create_stripe_customer(request.user)
                    
                    # Set as default payment method
                    stripe.Customer.modify(
                        stripe_customer.id,
                        invoice_settings={
                            'default_payment_method': payment_method.stripe_payment_method_id,
                        },
                    )
                except stripe.error.StripeError:
                    # Continue even if Stripe update fails
                    pass
            
            return Response({
                'success': True,
                'message': 'Payment method set as default successfully'
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _get_or_create_stripe_customer(self, user):
        """Get existing Stripe customer or create new one"""
        try:
            customers = stripe.Customer.list(email=user.email, limit=1)
            if customers.data:
                return customers.data[0]
        except stripe.error.StripeError:
            pass
        
        return stripe.Customer.create(
            email=user.email,
            name=user.full_name,
            metadata={'user_id': str(user.id)}
        )


class BillingHistoryView(generics.ListAPIView):
    """Get user's billing history"""
    
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Invoice.objects.filter(
            user=self.request.user
        ).order_by('-created_at')


class InvoiceDetailView(generics.RetrieveAPIView):
    """Get invoice details"""
    
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Invoice.objects.filter(user=self.request.user)


class InvoiceDownloadView(generics.GenericAPIView):
    """Download invoice PDF"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, invoice_id):
        try:
            invoice = get_object_or_404(
                Invoice, 
                id=invoice_id, 
                user=request.user
            )
            
            # Get invoice from Stripe
            stripe_invoice = stripe.Invoice.retrieve(invoice.stripe_invoice_id)
            
            if stripe_invoice.invoice_pdf:
                return Response({
                    'pdf_url': stripe_invoice.invoice_pdf
                })
            else:
                return Response(
                    {'error': 'PDF not available for this invoice'},
                    status=status.HTTP_404_NOT_FOUND
                )
                
        except stripe.error.StripeError as e:
            return Response({
                'error': str(e),
                'type': 'stripe_error'
            }, status=status.HTTP_400_BAD_REQUEST)


class BillingAddressView(generics.RetrieveUpdateAPIView):
    """Get and update billing address"""
    
    serializer_class = BillingAddressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        user = self.request.user
        billing_address, created = BillingAddress.objects.get_or_create(user=user)
        return billing_address


class PromotionalCodeValidateView(generics.GenericAPIView):
    """Validate a promotional code"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        plan_id = request.data.get('plan_id')
        
        if not code:
            return Response(
                {'error': 'Promotional code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            promo = PromotionalCode.objects.get(
                code=code,
                is_active=True,
                valid_from__lte=timezone.now(),
                valid_until__gte=timezone.now()
            )
            
            # Check usage limits
            if promo.max_uses and promo.current_uses >= promo.max_uses:
                return Response(
                    {'error': 'Promotional code has reached its usage limit'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if user has already used this code
            if promo.max_uses_per_user and Payment.objects.filter(
                user=request.user,
                promotional_code=promo
            ).count() >= promo.max_uses_per_user:
                return Response(
                    {'error': 'You have already used this promotional code'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Calculate discount if plan_id is provided
            discount_info = {}
            if plan_id:
                try:
                    plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
                    if promo.discount_type == 'percentage':
                        discount_amount = plan.price * (promo.discount_value / 100)
                    else:
                        discount_amount = min(promo.discount_value, plan.price)
                    
                    final_price = max(Decimal('0'), plan.price - discount_amount)
                    
                    discount_info = {
                        'original_price': str(plan.price),
                        'discount_amount': str(discount_amount),
                        'final_price': str(final_price),
                        'savings_percentage': str(round((discount_amount / plan.price) * 100, 2))
                    }
                except SubscriptionPlan.DoesNotExist:
                    pass
            
            serializer = PromotionalCodeSerializer(promo)
            return Response({
                'valid': True,
                'promotional_code': serializer.data,
                'discount_info': discount_info
            })
            
        except PromotionalCode.DoesNotExist:
            return Response({
                'valid': False,
                'error': 'Invalid promotional code'
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def stripe_webhook(request):
    """Handle Stripe webhooks"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError:
        return Response({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError:
        return Response({'error': 'Invalid signature'}, status=400)
    
    # Handle the event
    if event['type'] == 'invoice.payment_succeeded':
        handle_payment_succeeded(event['data']['object'])
    elif event['type'] == 'invoice.payment_failed':
        handle_payment_failed(event['data']['object'])
    elif event['type'] == 'customer.subscription.updated':
        handle_subscription_updated(event['data']['object'])
    elif event['type'] == 'customer.subscription.deleted':
        handle_subscription_deleted(event['data']['object'])
    
    return Response({'status': 'success'})


def handle_payment_succeeded(stripe_invoice):
    """Handle successful payment"""
    try:
        subscription = Subscription.objects.get(
            stripe_subscription_id=stripe_invoice['subscription']
        )
        
        # Create payment record
        Payment.objects.create(
            user=subscription.user,
            subscription=subscription,
            stripe_invoice_id=stripe_invoice['id'],
            stripe_payment_intent_id=stripe_invoice.get('payment_intent'),
            amount=Decimal(stripe_invoice['amount_paid']) / 100,
            currency=stripe_invoice['currency'],
            status='succeeded'
        )
        
        # Update subscription status
        subscription.status = 'active'
        subscription.save()
        
        # Update user premium status
        user = subscription.user
        user.is_premium = True
        user.subscription_expires = subscription.current_period_end
        user.save()
        
    except Subscription.DoesNotExist:
        pass


def handle_payment_failed(stripe_invoice):
    """Handle failed payment"""
    try:
        subscription = Subscription.objects.get(
            stripe_subscription_id=stripe_invoice['subscription']
        )
        
        # Create failed payment record
        Payment.objects.create(
            user=subscription.user,
            subscription=subscription,
            stripe_invoice_id=stripe_invoice['id'],
            amount=Decimal(stripe_invoice['amount_due']) / 100,
            currency=stripe_invoice['currency'],
            status='failed'
        )
        
        # Update subscription status
        subscription.status = 'past_due'
        subscription.save()
        
    except Subscription.DoesNotExist:
        pass


def handle_subscription_updated(stripe_subscription):
    """Handle subscription updates"""
    try:
        subscription = Subscription.objects.get(
            stripe_subscription_id=stripe_subscription['id']
        )
        
        # Update subscription details
        subscription.status = stripe_subscription['status']
        subscription.current_period_start = timezone.datetime.fromtimestamp(
            stripe_subscription['current_period_start'], 
            tz=timezone.utc
        )
        subscription.current_period_end = timezone.datetime.fromtimestamp(
            stripe_subscription['current_period_end'], 
            tz=timezone.utc
        )
        subscription.save()
        
        # Update user premium status
        user = subscription.user
        if subscription.status in ['active', 'trialing']:
            user.is_premium = True
            user.subscription_expires = subscription.current_period_end
        else:
            user.is_premium = False
        user.save()
        
    except Subscription.DoesNotExist:
        pass


def handle_subscription_deleted(stripe_subscription):
    """Handle subscription cancellation"""
    try:
        subscription = Subscription.objects.get(
            stripe_subscription_id=stripe_subscription['id']
        )
        
        # Update subscription status
        subscription.status = 'canceled'
        subscription.canceled_at = timezone.now()
        subscription.save()
        
        # Remove premium status
        user = subscription.user
        user.is_premium = False
        user.save()
        
    except Subscription.DoesNotExist:
        pass
