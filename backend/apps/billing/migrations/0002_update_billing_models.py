# Generated manually on 2025-07-23 14:10

import django.db.models.deletion
import django.utils.timezone
import uuid
from decimal import Decimal
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("billing", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # Step 1: Delete old models first
        migrations.DeleteModel(
            name="PromoCodeUsage",
        ),
        migrations.DeleteModel(
            name="PromoCode",
        ),
        
        # Step 2: Update Invoice model - remove old fields
        migrations.RemoveField(
            model_name="invoice",
            name="amount_due",
        ),
        migrations.RemoveField(
            model_name="invoice",
            name="amount_paid",
        ),
        migrations.RemoveField(
            model_name="invoice",
            name="discount_amount",
        ),
        migrations.RemoveField(
            model_name="invoice",
            name="invoice_date",
        ),
        migrations.RemoveField(
            model_name="invoice",
            name="invoice_pdf",
        ),
        migrations.RemoveField(
            model_name="invoice",
            name="subtotal",
        ),
        migrations.RemoveField(
            model_name="invoice",
            name="tax_amount",
        ),
        migrations.RemoveField(
            model_name="invoice",
            name="total",
        ),
        
        # Step 3: Add new fields to Invoice
        migrations.AddField(
            model_name="invoice",
            name="amount",
            field=models.DecimalField(
                decimal_places=2,
                default=Decimal("0.00"),
                max_digits=10,
                verbose_name="Amount",
            ),
        ),
        migrations.AddField(
            model_name="invoice",
            name="invoice_url",
            field=models.URLField(blank=True, verbose_name="Invoice URL"),
        ),
        
        # Step 4: Update PaymentMethod model
        migrations.AddField(
            model_name="paymentmethod",
            name="is_active",
            field=models.BooleanField(default=True, verbose_name="Is Active"),
        ),
        migrations.AddField(
            model_name="paymentmethod",
            name="payment_method_type",
            field=models.CharField(
                default="card", max_length=20, verbose_name="Payment Method Type"
            ),
        ),
        migrations.AlterField(
            model_name="paymentmethod",
            name="card_exp_month",
            field=models.PositiveSmallIntegerField(
                blank=True, null=True, verbose_name="Expiry Month"
            ),
        ),
        migrations.AlterField(
            model_name="paymentmethod",
            name="card_exp_year",
            field=models.PositiveSmallIntegerField(
                blank=True, null=True, verbose_name="Expiry Year"
            ),
        ),
        migrations.AlterField(
            model_name="paymentmethod",
            name="card_last4",
            field=models.CharField(
                blank=True, max_length=4, verbose_name="Last 4 Digits"
            ),
        ),
        
        # Step 5: Add field to Subscription model
        migrations.AddField(
            model_name="subscription",
            name="cancellation_reason",
            field=models.TextField(blank=True, verbose_name="Cancellation Reason"),
        ),
        
        # Step 6: Create new models
        migrations.CreateModel(
            name="BillingAddress",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "company_name",
                    models.CharField(
                        blank=True, max_length=255, verbose_name="Company Name"
                    ),
                ),
                (
                    "address_line_1",
                    models.CharField(max_length=255, verbose_name="Address Line 1"),
                ),
                (
                    "address_line_2",
                    models.CharField(
                        blank=True, max_length=255, verbose_name="Address Line 2"
                    ),
                ),
                ("city", models.CharField(max_length=100, verbose_name="City")),
                (
                    "state_province",
                    models.CharField(max_length=100, verbose_name="State/Province"),
                ),
                (
                    "postal_code",
                    models.CharField(max_length=20, verbose_name="Postal Code"),
                ),
                (
                    "country",
                    models.CharField(max_length=2, verbose_name="Country Code"),
                ),
                (
                    "tax_id",
                    models.CharField(blank=True, max_length=50, verbose_name="Tax ID"),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="billing_address",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Billing Address",
                "verbose_name_plural": "Billing Addresses",
                "db_table": "billing_addresses",
            },
        ),
        migrations.CreateModel(
            name="PromotionalCode",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "code",
                    models.CharField(
                        max_length=50, unique=True, verbose_name="Promo Code"
                    ),
                ),
                ("name", models.CharField(max_length=100, verbose_name="Promo Name")),
                (
                    "description",
                    models.TextField(blank=True, verbose_name="Description"),
                ),
                (
                    "discount_type",
                    models.CharField(
                        choices=[
                            ("percentage", "Percentage"),
                            ("fixed_amount", "Fixed Amount"),
                        ],
                        default="percentage",
                        max_length=20,
                    ),
                ),
                (
                    "discount_value",
                    models.PositiveIntegerField(verbose_name="Discount Value"),
                ),
                (
                    "stripe_coupon_id",
                    models.CharField(
                        blank=True, max_length=255, verbose_name="Stripe Coupon ID"
                    ),
                ),
                (
                    "max_uses",
                    models.PositiveIntegerField(
                        blank=True, null=True, verbose_name="Max Uses"
                    ),
                ),
                (
                    "current_uses",
                    models.PositiveIntegerField(default=0, verbose_name="Current Uses"),
                ),
                (
                    "max_uses_per_user",
                    models.PositiveIntegerField(
                        default=1, verbose_name="Max Uses Per User"
                    ),
                ),
                (
                    "valid_from",
                    models.DateTimeField(
                        default=django.utils.timezone.now, verbose_name="Valid From"
                    ),
                ),
                (
                    "valid_until",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="Valid Until"
                    ),
                ),
                (
                    "is_active",
                    models.BooleanField(default=True, verbose_name="Is Active"),
                ),
                (
                    "minimum_amount",
                    models.DecimalField(
                        blank=True,
                        decimal_places=2,
                        max_digits=10,
                        null=True,
                        verbose_name="Minimum Amount",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "applicable_plans",
                    models.ManyToManyField(
                        blank=True,
                        to="billing.subscriptionplan",
                        verbose_name="Applicable Plans",
                    ),
                ),
            ],
            options={
                "verbose_name": "Promotional Code",
                "verbose_name_plural": "Promotional Codes",
                "db_table": "promotional_codes",
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="Payment",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "stripe_payment_intent_id",
                    models.CharField(
                        max_length=255,
                        unique=True,
                        verbose_name="Stripe Payment Intent ID",
                    ),
                ),
                (
                    "stripe_invoice_id",
                    models.CharField(
                        blank=True, max_length=255, verbose_name="Stripe Invoice ID"
                    ),
                ),
                (
                    "amount",
                    models.DecimalField(
                        decimal_places=2, max_digits=10, verbose_name="Amount"
                    ),
                ),
                (
                    "currency",
                    models.CharField(
                        default="USD", max_length=3, verbose_name="Currency"
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("succeeded", "Succeeded"),
                            ("pending", "Pending"),
                            ("failed", "Failed"),
                            ("canceled", "Canceled"),
                            ("refunded", "Refunded"),
                        ],
                        default="pending",
                        max_length=20,
                    ),
                ),
                (
                    "paid_at",
                    models.DateTimeField(blank=True, null=True, verbose_name="Paid At"),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "subscription",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="payments",
                        to="billing.subscription",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="payments",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "promotional_code",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="payments",
                        to="billing.promotionalcode",
                    ),
                ),
            ],
            options={
                "verbose_name": "Payment",
                "verbose_name_plural": "Payments",
                "db_table": "payments",
                "ordering": ["-created_at"],
            },
        ),
    ]
