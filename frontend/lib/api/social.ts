/**
 * Social API Service
 * Handles social groups and community features
 */

import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  SocialGroup,
  PaginatedResponse,
  APIResponse,
} from "./types"

export class SocialAPI {
  /**
   * Get social groups
   */
  async getGroups(params?: {
    page?: number
    category?: string
    public_only?: boolean
    my_groups?: boolean
  }): Promise<PaginatedResponse<SocialGroup>> {
    return apiClient.get<PaginatedResponse<SocialGroup>>(API_ENDPOINTS.social.groups, { params })
  }

  /**
   * Get group details
   */
  async getGroup(groupId: number): Promise<SocialGroup> {
    return apiClient.get<SocialGroup>(API_ENDPOINTS.social.groupDetail(groupId))
  }

  /**
   * Create new group
   */
  async createGroup(data: {
    name: string
    description: string
    is_public: boolean
    category?: string
  }): Promise<SocialGroup> {
    return apiClient.post<SocialGroup>(API_ENDPOINTS.social.groups, data)
  }

  /**
   * Update group
   */
  async updateGroup(groupId: number, data: Partial<SocialGroup>): Promise<SocialGroup> {
    return apiClient.patch<SocialGroup>(API_ENDPOINTS.social.groupDetail(groupId), data)
  }

  /**
   * Delete group
   */
  async deleteGroup(groupId: number): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(API_ENDPOINTS.social.groupDetail(groupId))
  }

  /**
   * Join group
   */
  async joinGroup(groupId: number): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.social.joinGroup(groupId))
  }

  /**
   * Leave group
   */
  async leaveGroup(groupId: number): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.social.leaveGroup(groupId))
  }
}
