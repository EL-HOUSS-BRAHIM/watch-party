/**
 * Admin API Service
 * Handles admin panel-related API calls
 */

import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  AdminDashboard,
  SystemHealth,
  User,
  PaginatedResponse,
  APIResponse,
} from "./types"

export class AdminAPI {
  /**
   * Get admin dashboard overview
   */
  async getDashboard(): Promise<AdminDashboard> {
    return apiClient.get<AdminDashboard>(API_ENDPOINTS.admin.dashboard)
  }

  /**
   * Get users for admin management
   */
  async getUsers(params?: {
    search?: string
    status?: 'active' | 'suspended' | 'banned'
    subscription?: 'active' | 'inactive'
    page?: number
  }): Promise<PaginatedResponse<User>> {
    return apiClient.get<PaginatedResponse<User>>(API_ENDPOINTS.admin.users, params)
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    return apiClient.get<SystemHealth>(API_ENDPOINTS.admin.systemHealth)
  }

  /**
   * Suspend user account
   */
  async suspendUser(userId: string, reason?: string): Promise<APIResponse> {
    return apiClient.post<APIResponse>(`${API_ENDPOINTS.admin.users}${userId}/suspend/`, {
      reason,
    })
  }

  /**
   * Unsuspend user account
   */
  async unsuspendUser(userId: string): Promise<APIResponse> {
    return apiClient.post<APIResponse>(`${API_ENDPOINTS.admin.users}${userId}/unsuspend/`)
  }

  /**
   * Ban user account
   */
  async banUser(userId: string, reason?: string): Promise<APIResponse> {
    return apiClient.post<APIResponse>(`${API_ENDPOINTS.admin.users}${userId}/ban/`, {
      reason,
    })
  }

  /**
   * Unban user account
   */
  async unbanUser(userId: string): Promise<APIResponse> {
    return apiClient.post<APIResponse>(`${API_ENDPOINTS.admin.users}${userId}/unban/`)
  }
}

// Export the class but don't instantiate it immediately
// Instance will be created by the lazy loader in index.ts
