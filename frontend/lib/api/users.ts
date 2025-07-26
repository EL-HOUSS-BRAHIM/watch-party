/**
 * Users API Service
 * Handles user-related API calls
 */

import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  DashboardStats,
  User,
  UserProfile,
  Friend,
  FriendRequest,
  Notification,
  PaginatedResponse,
  APIResponse,
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
    return apiClient.get<User & { profile: UserProfile }>(API_ENDPOINTS.users.profile)
  }

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<UserProfile>): Promise<User & { profile: UserProfile }> {
    return apiClient.put<User & { profile: UserProfile }>(API_ENDPOINTS.users.profile, data)
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File, onProgress?: (progress: number) => void): Promise<{
    success: boolean
    avatar_url: string
  }> {
    return apiClient.uploadAvatar(API_ENDPOINTS.users.avatarUpload, file, onProgress)
  }

  /**
   * Get user's friends list
   */
  async getFriends(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Friend>> {
    return apiClient.get<PaginatedResponse<Friend>>(API_ENDPOINTS.users.friends, params)
  }

  /**
   * Send friend request
   */
  async sendFriendRequest(data: FriendRequest): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.users.friendRequest, data)
  }

  /**
   * Search users
   */
  async searchUsers(params: { 
    q: string
    limit?: number
  }): Promise<PaginatedResponse<Friend>> {
    return apiClient.get<PaginatedResponse<Friend>>(API_ENDPOINTS.users.search, params)
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
      params
    )
  }
}

// Export the class but don't instantiate it immediately
// Instance will be created by the lazy loader in index.ts
