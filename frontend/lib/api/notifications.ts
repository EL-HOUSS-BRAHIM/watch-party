/**
 * Notifications API Service
 * Handles notification-related API calls
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
    return apiClient.get(API_ENDPOINTS.notifications.list, params)
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
    return apiClient.post<APIResponse>(API_ENDPOINTS.notifications.list + "mark-all-read/")
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(
      API_ENDPOINTS.notifications.list + `${notificationId}/`
    )
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
    return apiClient.put<NotificationPreferences>(
      API_ENDPOINTS.notifications.preferences,
      preferences
    )
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
}

// Export the class but don't instantiate it immediately
// Instance will be created by the lazy loader in index.ts
