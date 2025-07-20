from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe

from .models import (
    ExternalService, UserServiceConnection, GoogleDriveFile,
    AWSS3Configuration, SocialOAuthProvider
)


@admin.register(ExternalService)
class ExternalServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_name_display', 'is_active', 'created_at', 'updated_at']
    list_filter = ['name', 'is_active', 'created_at']
    search_fields = ['name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'is_active')
        }),
        ('Configuration', {
            'fields': ('configuration',),
            'classes': ['collapse']
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ['collapse']
        }),
    )


@admin.register(UserServiceConnection)
class UserServiceConnectionAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'service', 'is_connected', 'external_username', 
        'external_email', 'last_sync_at', 'created_at'
    ]
    list_filter = [
        'service__name', 'is_connected', 'is_active', 
        'created_at', 'last_sync_at'
    ]
    search_fields = [
        'user__username', 'user__email', 'external_username', 
        'external_email', 'external_user_id'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'last_sync_at', 'token_expires_at'
    ]
    
    fieldsets = (
        ('Connection Info', {
            'fields': ('user', 'service', 'is_connected', 'is_active')
        }),
        ('External Account', {
            'fields': (
                'external_user_id', 'external_username', 'external_email'
            )
        }),
        ('OAuth Tokens', {
            'fields': ('access_token', 'refresh_token', 'token_expires_at'),
            'classes': ['collapse']
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ['collapse']
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_sync_at'),
            'classes': ['collapse']
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'service')


@admin.register(GoogleDriveFile)
class GoogleDriveFileAdmin(admin.ModelAdmin):
    list_display = [
        'file_name', 'get_user', 'file_id', 'mime_type', 'is_video',
        'can_stream', 'file_size_display', 'created_at'
    ]
    list_filter = [
        'is_video', 'can_stream', 'is_public', 'mime_type', 
        'created_at', 'last_accessed'
    ]
    search_fields = [
        'file_name', 'file_id', 'connection__user__username',
        'connection__external_username', 'mime_type'
    ]
    readonly_fields = [
        'file_id', 'created_at', 'updated_at', 'last_accessed',
        'stream_url_expires_at', 'file_size_display'
    ]
    
    fieldsets = (
        ('File Information', {
            'fields': (
                'connection', 'file_id', 'file_name', 'mime_type', 
                'file_size_display', 'is_video'
            )
        }),
        ('Video Metadata', {
            'fields': (
                'duration', 'video_codec', 'audio_codec', 
                'resolution', 'bitrate'
            ),
            'classes': ['collapse']
        }),
        ('Streaming', {
            'fields': (
                'can_stream', 'stream_url', 'stream_url_expires_at',
                'thumbnail_url'
            )
        }),
        ('Status', {
            'fields': ('is_public', 'last_accessed'),
            'classes': ['collapse']
        }),
        ('Raw Metadata', {
            'fields': ('drive_metadata',),
            'classes': ['collapse']
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ['collapse']
        }),
    )
    
    def get_user(self, obj):
        return obj.connection.user.username
    get_user.short_description = 'User'
    get_user.admin_order_field = 'connection__user__username'
    
    def file_size_display(self, obj):
        if obj.file_size:
            size = obj.file_size
            for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
                if size < 1024.0:
                    return f"{size:.1f} {unit}"
                size /= 1024.0
            return f"{size:.1f} PB"
        return "Unknown"
    file_size_display.short_description = 'File Size'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('connection__user')


@admin.register(AWSS3Configuration)
class AWSS3ConfigurationAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'bucket_name', 'region', 'use_cloudfront',
        'is_active', 'max_file_size_display', 'created_at'
    ]
    list_filter = ['region', 'use_cloudfront', 'is_active', 'created_at']
    search_fields = ['name', 'bucket_name', 'cloudfront_domain']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Configuration', {
            'fields': ('name', 'bucket_name', 'region', 'is_active')
        }),
        ('AWS Credentials', {
            'fields': ('access_key_id', 'secret_access_key'),
            'classes': ['collapse']
        }),
        ('CloudFront CDN', {
            'fields': ('use_cloudfront', 'cloudfront_domain')
        }),
        ('Upload Settings', {
            'fields': (
                'max_file_size', 'allowed_file_types', 'default_acl',
                'enable_encryption'
            ),
            'classes': ['collapse']
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ['collapse']
        }),
    )
    
    def max_file_size_display(self, obj):
        size = obj.max_file_size
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} PB"
    max_file_size_display.short_description = 'Max File Size'


@admin.register(SocialOAuthProvider)
class SocialOAuthProviderAdmin(admin.ModelAdmin):
    list_display = [
        'provider', 'get_provider_display', 'is_active', 
        'client_id_masked', 'created_at'
    ]
    list_filter = ['provider', 'is_active', 'created_at']
    search_fields = ['provider', 'client_id']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Provider Configuration', {
            'fields': ('provider', 'is_active')
        }),
        ('OAuth Credentials', {
            'fields': ('client_id', 'client_secret'),
            'classes': ['collapse']
        }),
        ('OAuth Settings', {
            'fields': ('scope', 'redirect_uri'),
        }),
        ('Additional Settings', {
            'fields': ('additional_settings',),
            'classes': ['collapse']
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ['collapse']
        }),
    )
    
    def client_id_masked(self, obj):
        client_id = obj.client_id
        if len(client_id) > 8:
            return f"{client_id[:4]}{'*' * (len(client_id) - 8)}{client_id[-4:]}"
        return client_id
    client_id_masked.short_description = 'Client ID'


# Inline admin for connections
class UserServiceConnectionInline(admin.TabularInline):
    model = UserServiceConnection
    extra = 0
    readonly_fields = ['created_at', 'last_sync_at', 'token_expires_at']
    fields = [
        'service', 'is_connected', 'external_username', 
        'external_email', 'last_sync_at'
    ]


class GoogleDriveFileInline(admin.TabularInline):
    model = GoogleDriveFile
    extra = 0
    readonly_fields = ['file_id', 'file_size', 'created_at']
    fields = [
        'file_name', 'file_id', 'mime_type', 'is_video', 
        'can_stream', 'file_size', 'created_at'
    ]
