/**
 * Analytics API Service
 * Handles analytics-related API calls
 */

import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  AnalyticsDashboard,
  UserAnalytics,
} from "./types"

export class AnalyticsAPI {
  /**
   * Get analytics dashboard data
   */
  async getDashboard(timeRange?: string): Promise<AnalyticsDashboard> {
    return apiClient.get<AnalyticsDashboard>(API_ENDPOINTS.analytics.dashboard, {
      time_range: timeRange,
    })
  }

  /**
   * Get user-specific analytics
   */
  async getUserAnalytics(): Promise<UserAnalytics> {
    return apiClient.get<UserAnalytics>(API_ENDPOINTS.analytics.user)
  }

  /**
   * Get video analytics
   */
  async getVideoAnalytics(videoId: string): Promise<{
    video: {
      id: string
      title: string
      views: number
      completion_rate: number
    }
    engagement: {
      likes: number
      comments: number
      shares: number
      average_rating: number
    }
    view_chart: Array<{
      date: string
      views: number
    }>
    audience: {
      age_groups: Array<{
        range: string
        percentage: number
      }>
      countries: Array<{
        country: string
        percentage: number
      }>
    }
  }> {
    return apiClient.get(API_ENDPOINTS.analytics.video(videoId))
  }
}

// Export the class but don't instantiate it immediately
// Instance will be created by the lazy loader in index.ts
