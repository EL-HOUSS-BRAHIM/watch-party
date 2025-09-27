"""
Authentication admin configuration
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, UserProfile, EmailVerification, PasswordReset, SocialAccount


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin"""
    
    list_display = [
        'email', 'first_name', 'last_name', 'is_premium', 
        'is_email_verified', 'is_active', 'date_joined'
    ]
    list_filter = [
        'is_active', 'is_premium', 'is_email_verified', 
        'date_joined', 'last_login'
    ]
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {
            'fields': ('email', 'password')
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'avatar')
        }),
        ('Subscription', {
            'fields': ('is_premium', 'subscription_expires')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_email_verified',
                      'groups', 'user_permissions')
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined')
        })
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2')
        }),
    )
    
    readonly_fields = ['date_joined', 'last_login']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """User profile admin"""
    
    list_display = ['user', 'timezone', 'language', 'created_at']
    list_filter = ['timezone', 'language', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    raw_id_fields = ['user']


@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    """Email verification admin"""
    
    list_display = ['user', 'is_used', 'expires_at', 'created_at']
    list_filter = ['is_used', 'expires_at', 'created_at']
    search_fields = ['user__email', 'token']
    raw_id_fields = ['user']
    readonly_fields = ['token', 'created_at']


@admin.register(PasswordReset)
class PasswordResetAdmin(admin.ModelAdmin):
    """Password reset admin"""
    
    list_display = ['user', 'is_used', 'expires_at', 'created_at']
    list_filter = ['is_used', 'expires_at', 'created_at']
    search_fields = ['user__email', 'token']
    raw_id_fields = ['user']
    readonly_fields = ['token', 'created_at']


@admin.register(SocialAccount)
class SocialAccountAdmin(admin.ModelAdmin):
    """Social account admin"""
    
    list_display = ['user', 'provider', 'provider_email', 'created_at']
    list_filter = ['provider', 'created_at']
    search_fields = ['user__email', 'provider_email', 'provider_id']
    raw_id_fields = ['user']
