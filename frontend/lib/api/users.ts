/**
 * Users API Service
 * Handles user-related API calls including social features, settings, and data management
 */

import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import { transformUser } from "./transformers"
import type {
  DashboardStats,
  User,
  UserProfile,
  Friend,
  FriendRequest,
  Notification,
  Achievement,
  UserStats,
  UserSession,
  UserSettings,
  WatchHistoryItem,
  Favorite,
  PaginatedResponse,
  APIResponse,
  RawUser,
  DashboardActivity,
  NotificationPreferences,
} from "./types"

export class UsersAPI {
  /**
   * Get user dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get<DashboardStats>(API_ENDPOINTS.users.dashboardStats)
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<User & { profile: UserProfile }> {
    const response = await apiClient.get<RawUser & { profile: UserProfile }>(
      API_ENDPOINTS.users.profile,
    )

    const { profile, ...user } = response
    return {
      ...transformUser(user),
      profile,
    }
  }

  /**
   * Update user profile (using separate update endpoint)
   */
  async updateProfile(data: Partial<UserProfile>): Promise<User & { profile: UserProfile }> {
    const response = await apiClient.put<RawUser & { profile: UserProfile }>(
      API_ENDPOINTS.users.profileUpdate,
      data,
    )

    const { profile, ...user } = response
    return {
      ...transformUser(user),
      profile,
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File, onProgress?: (progress: number) => void): Promise<{
    success: boolean
    avatar_url: string
  }> {
    return apiClient.upload(API_ENDPOINTS.users.avatarUpload, file, onProgress)
  }

  /**
   * Get user achievements
   */
  async getAchievements(): Promise<Achievement[]> {
    return apiClient.get<Achievement[]>(API_ENDPOINTS.users.achievements)
  }

  /**
   * Get user statistics
   */
  async getStats(): Promise<UserStats> {
    return apiClient.get<UserStats>(API_ENDPOINTS.users.stats)
  }

  /**
   * Complete user onboarding
   */
  async completeOnboarding(data: {
    interests: string[]
    preferred_genres: string[]
    notifications_enabled: boolean
  }): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.users.onboarding, data)
  }

  /**
   * Change password
   */
  async changePassword(data: {
    current_password: string
    new_password: string
  }): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.users.password, data)
  }

  /**
   * Get user inventory
   */
  async getInventory(): Promise<Record<string, unknown>[]> {
    return apiClient.get<Record<string, unknown>[]>(API_ENDPOINTS.users.inventory)
  }

  // === SESSION MANAGEMENT ===

  /**
   * Get user sessions
   */
  async getSessions(): Promise<UserSession[]> {
    return apiClient.get<UserSession[]>(API_ENDPOINTS.users.sessions)
  }

  /**
   * Delete specific session
   */
  async deleteSession(sessionId: string): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(API_ENDPOINTS.users.sessionDelete(sessionId))
  }

  /**
   * Revoke all sessions
   */
  async revokeAllSessions(): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.users.revokeAllSessions)
  }

  // === TWO-FACTOR AUTHENTICATION ===

  /**
   * Enable 2FA
   */
  async enable2FA(): Promise<{
    success: boolean
    qr_code: string
    secret: string
    backup_codes: string[]
  }> {
    return apiClient.post(API_ENDPOINTS.users.twoFactorEnable)
  }

  /**
   * Disable 2FA
   */
  async disable2FA(): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.users.twoFactorDisable)
  }

  /**
   * Setup 2FA
   */
  async setup2FA(): Promise<{
    success: boolean
    qr_code: string
    secret: string
  }> {
    return apiClient.post(API_ENDPOINTS.users.twoFactorSetup)
  }

  // === FRIENDS & SOCIAL SYSTEM ===

  /**
   * Get user's friends list
   */
  async getFriends(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Friend>> {
    return apiClient.get<PaginatedResponse<Friend>>(API_ENDPOINTS.users.friends, { params })
  }

  /**
   * Send friend request
   */
  async sendFriendRequest(data: FriendRequest): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.users.friendRequest, data)
  }

  /**
   * Get friend suggestions
   */
  async getFriendSuggestions(params?: { limit?: number }): Promise<Friend[]> {
    return apiClient.get<Friend[]>(API_ENDPOINTS.users.friendSuggestions, { params })
  }

  /**
   * Get friend requests
   */
  async getFriendRequests(): Promise<FriendRequest[]> {
    return apiClient.get<FriendRequest[]>(API_ENDPOINTS.users.friendRequests)
  }

  /**
   * Accept friend request
   */
  async acceptFriendRequest(requestId: string): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.users.acceptFriendRequest(requestId))
  }

  /**
   * Decline friend request
   */
  async declineFriendRequest(requestId: string): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.users.declineFriendRequest(requestId))
  }

  /**
   * Send friend request to specific user
   */
  async sendFriendRequestToUser(userId: string): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.users.sendFriendRequest(userId))
  }

  /**
   * Block user
   */
  async blockUser(userId: string): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.users.blockUser(userId))
  }

  /**
   * Accept friendship
   */
  async acceptFriendship(friendshipId: string): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.users.acceptFriendship(friendshipId))
  }

  /**
   * Decline friendship
   */
  async declineFriendship(friendshipId: string): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.users.declineFriendship(friendshipId))
  }

  /**
   * Remove friend
   */
  async removeFriend(username: string): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(API_ENDPOINTS.users.removeFriend(username))
  }

  /**
   * Get user activity
   */
  async getActivity(params?: {
    page?: number
    type?: string
    timeframe?: string
    visibility?: "public" | "friends_only" | "private"
  }): Promise<PaginatedResponse<DashboardActivity>> {
    return apiClient.get<PaginatedResponse<DashboardActivity>>(API_ENDPOINTS.users.activity, { params })
  }

  /**
   * Get user suggestions
   */
  async getUserSuggestions(): Promise<Friend[]> {
    return apiClient.get<Friend[]>(API_ENDPOINTS.users.suggestions)
  }

  /**
   * Block user (general)
   */
  async blockUserGeneral(data: { user_id: string; reason?: string }): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.users.block, data)
  }

  /**
   * Unblock user
   */
  async unblockUser(data: { user_id: string }): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.users.unblock, data)
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<User & { profile: UserProfile }> {
    return apiClient.get<User & { profile: UserProfile }>(API_ENDPOINTS.users.userProfile(userId))
  }

  /**
   * Get mutual friends
   */
  async getMutualFriends(userId: string): Promise<Friend[]> {
    return apiClient.get<Friend[]>(API_ENDPOINTS.users.mutualFriends(userId))
  }

  /**
   * Get online status
   */
  async getOnlineStatus(): Promise<{ online_friends: Friend[]; total_online: number }> {
    return apiClient.get(API_ENDPOINTS.users.onlineStatus)
  }

  /**
   * Get watch history
   */
  async getWatchHistory(params?: { page?: number }): Promise<PaginatedResponse<WatchHistoryItem>> {
    return apiClient.get<PaginatedResponse<WatchHistoryItem>>(API_ENDPOINTS.users.watchHistory, { params })
  }

  /**
   * Get favorites
   */
  async getFavorites(params?: { page?: number }): Promise<PaginatedResponse<Favorite>> {
    return apiClient.get<PaginatedResponse<Favorite>>(API_ENDPOINTS.users.favorites, { params })
  }

  /**
   * Add to favorites
   */
  async addFavorite(data: { content_type: string; content_id: string }): Promise<Favorite> {
    return apiClient.post<Favorite>(API_ENDPOINTS.users.addFavorite, data)
  }

  /**
   * Remove favorite
   */
  async removeFavorite(favoriteId: string): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(API_ENDPOINTS.users.removeFavorite(favoriteId))
  }

  /**
   * Mark notification as read
   */
  async markNotificationRead(notificationId: string): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.users.readNotification(notificationId))
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsRead(): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.users.markAllNotificationsRead)
  }

  /**
   * Report user
   */
  async reportUser(data: {
    user_id: string
    reason: string
    description?: string
  }): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.users.reportUser, data)
  }

  /**
   * Search users
   */
  async searchUsers(params: {
    q: string
    limit?: number
    sort?: string
    location?: string
    has_avatar?: boolean
    is_online?: boolean
    verified?: boolean
    min_mutual_friends?: number
    genres?: string[]
  }): Promise<PaginatedResponse<User>> {
    return apiClient.get(API_ENDPOINTS.users.search, { params })
  }

  /**
   * Get user notifications
   */
  async getNotifications(params?: { 
    page?: number
    unread?: boolean
    type?: string
  }): Promise<PaginatedResponse<Notification> & { unread_count: number }> {
    return apiClient.get<PaginatedResponse<Notification> & { unread_count: number }>(
      API_ENDPOINTS.users.notifications, 
      { params }
    )
  }

  // === SETTINGS ===

  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings> {
    return apiClient.get<UserSettings>(API_ENDPOINTS.users.settings)
  }

  /**
   * Update user settings
   */
  async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    return apiClient.put<UserSettings>(API_ENDPOINTS.users.settings, data)
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<NotificationPreferences> {
    return apiClient.get(API_ENDPOINTS.users.notificationSettings)
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return apiClient.put(API_ENDPOINTS.users.notificationSettings, data)
  }

  /**
   * Get privacy settings
   */
  async getPrivacySettings(): Promise<UserSettings> {
    return apiClient.get(API_ENDPOINTS.users.privacySettings)
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    return apiClient.put(API_ENDPOINTS.users.privacySettings, data)
  }

  // === DATA MANAGEMENT ===

  /**
   * Export user data
   */
  async exportData(): Promise<{ download_url: string; expires_at: string }> {
    return apiClient.post(API_ENDPOINTS.users.exportData)
  }

  /**
   * Delete account
   */
  async deleteAccount(data: { password: string; reason?: string }): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.users.deleteAccount, data)
  }
}

// Export the class but don't instantiate it immediately
// Instance will be created by the lazy loader in index.ts
