/**
 * Mobile API Service
 * Handles mobile app specific functionality and configurations
 */

import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  MobileConfig,
  MobileHomeData,
  APIResponse,
} from "./types"

export class MobileAPI {
  /**
   * Get mobile app configuration
   */
  async getConfig(): Promise<MobileConfig> {
    return apiClient.get<MobileConfig>(API_ENDPOINTS.mobile.config)
  }

  /**
   * Get mobile home screen data
   */
  async getHomeData(): Promise<MobileHomeData> {
    return apiClient.get<MobileHomeData>(API_ENDPOINTS.mobile.home)
  }

  /**
   * Sync mobile data
   */
  async sync(data: {
    last_sync?: string
    device_info?: object
  }): Promise<{
    success: boolean
    updated_data: object
    sync_timestamp: string
  }> {
    return apiClient.post(API_ENDPOINTS.mobile.sync, data)
  }

  /**
   * Update push token
   */
  async updatePushToken(data: {
    token: string
    device_type: 'ios' | 'android'
    device_id: string
  }): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.mobile.pushToken, data)
  }

  /**
   * Get app information
   */
  async getAppInfo(): Promise<{
    version: string
    min_version: string
    features: string[]
    update_required: boolean
    update_url?: string
  }> {
    return apiClient.get(API_ENDPOINTS.mobile.appInfo)
  }
}
