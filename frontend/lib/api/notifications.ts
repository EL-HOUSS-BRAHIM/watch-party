/**
 * Notifications API Service
 * Handles notification-related API calls including admin features and bulk operations
 */

import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  Notification,
  NotificationPreferences,
  PaginatedResponse,
  APIResponse,
} from "./types"

export class NotificationsAPI {
  /**
   * Get user notifications
   */
  async getNotifications(params?: {
    unread?: boolean
    type?: string
    page?: number
  }): Promise<PaginatedResponse<Notification> & {
    unread_count: number
  }> {
    return apiClient.get(API_ENDPOINTS.notifications.list, { params })
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.notifications.markRead(notificationId))
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.notifications.markAllRead)
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(API_ENDPOINTS.notifications.delete(notificationId))
  }

  /**
   * Bulk delete notifications
   */
  async bulkDelete(notificationIds: string[]): Promise<APIResponse> {
    await Promise.all(notificationIds.map(id => this.deleteNotification(id)))
    return {
      success: true,
      message: "Notifications deleted",
    }
  }

  /**
   * Clear all notifications
   */
  async clearAll(): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.notifications.clearAll)
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    return apiClient.get<NotificationPreferences>(API_ENDPOINTS.notifications.preferences)
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    return apiClient.put<NotificationPreferences>(API_ENDPOINTS.notifications.updatePreferences, preferences)
  }

  /**
   * Update push notification token
   */
  async updatePushToken(data: {
    token: string
    platform: 'ios' | 'android' | 'web'
  }): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.notifications.pushTokenUpdate, data)
  }

  /**
   * Remove push notification token
   */
  async removePushToken(): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.notifications.removePushToken)
  }

  /**
   * Test push notification
   */
  async testPush(data?: {
    title?: string
    message?: string
  }): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.notifications.testPush, data)
  }

  /**
   * Broadcast notification (admin only)
   */
  async broadcast(data: {
    title: string
    message: string
    target_audience?: 'all' | 'premium' | 'active'
    action_url?: string
  }): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.notifications.broadcast, data)
  }

  // === ADMIN FEATURES ===

  /**
   * Get notification templates
   */
  async getTemplates(): Promise<any[]> {
    return apiClient.get(API_ENDPOINTS.notifications.templates)
  }

  /**
   * Get notification template details
   */
  async getTemplateDetail(templateId: string): Promise<any> {
    return apiClient.get(API_ENDPOINTS.notifications.templateDetail(templateId))
  }

  /**
   * Get notification channels
   */
  async getChannels(): Promise<any[]> {
    return apiClient.get(API_ENDPOINTS.notifications.channels)
  }

  // === STATISTICS & BULK OPERATIONS ===

  /**
   * Get notification statistics
   */
  async getStats(): Promise<{
    total_sent: number
    total_delivered: number
    total_opened: number
    delivery_rate: number
    open_rate: number
    recent_activity: any[]
  }> {
    return apiClient.get(API_ENDPOINTS.notifications.stats)
  }

  /**
   * Get delivery statistics
   */
  async getDeliveryStats(params?: {
    date_range?: {
      start: string
      end: string
    }
    type?: string
  }): Promise<{
    delivery_stats: any[]
    summary: {
      total_sent: number
      delivered: number
      failed: number
      pending: number
    }
  }> {
    return apiClient.get(API_ENDPOINTS.notifications.deliveryStats, { params })
  }

  /**
   * Send bulk notifications
   */
  async bulkSend(data: {
    user_ids: string[]
    title: string
    message: string
    type?: string
    action_url?: string
    scheduled_at?: string
  }): Promise<APIResponse & {
    batch_id: string
    estimated_delivery: string
  }> {
    return apiClient.post(API_ENDPOINTS.notifications.bulkSend, data)
  }

  /**
   * Cleanup old notifications
   */
  async cleanup(data?: {
    older_than_days?: number
    types?: string[]
    read_only?: boolean
  }): Promise<APIResponse & {
    deleted_count: number
  }> {
    return apiClient.post(API_ENDPOINTS.notifications.cleanup, data)
  }
}

// Export the class but don't instantiate it immediately
// Instance will be created by the lazy loader in index.ts
