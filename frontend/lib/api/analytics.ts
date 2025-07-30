/**
 * Analytics API Service
 * Handles analytics-related API calls including comprehensive business intelligence
 */

import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  AnalyticsDashboard,
  UserAnalytics,
  APIResponse,
  PaginatedResponse,
} from "./types"

export class AnalyticsAPI {
  /**
   * Get analytics dashboard data
   */
  async getDashboard(timeRange?: string): Promise<AnalyticsDashboard> {
    return apiClient.get<AnalyticsDashboard>(API_ENDPOINTS.analytics.dashboard, {
      params: { time_range: timeRange }
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

  // === BASIC ANALYTICS ===

  /**
   * Get basic analytics
   */
  async getBasicAnalytics(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.basic)
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.userStats)
  }

  /**
   * Get party statistics
   */
  async getPartyStats(partyId: string): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.partyStats(partyId))
  }

  /**
   * Get admin analytics
   */
  async getAdminAnalytics(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.adminAnalytics)
  }

  /**
   * Export analytics data
   */
  async exportAnalytics(params?: {
    format?: 'csv' | 'json' | 'excel'
    date_range?: string
    metrics?: string[]
  }): Promise<{ download_url: string; expires_at: string }> {
    return apiClient.post(API_ENDPOINTS.analytics.export, params)
  }

  // === DASHBOARD ANALYTICS ===

  /**
   * Get party analytics
   */
  async getPartyAnalytics(partyId: string): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.party(partyId))
  }

  /**
   * Get system analytics
   */
  async getSystemAnalytics(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.system)
  }

  /**
   * Get performance analytics
   */
  async getPerformanceAnalytics(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.performance)
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.revenue)
  }

  /**
   * Get retention analytics
   */
  async getRetentionAnalytics(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.retention)
  }

  /**
   * Get content analytics
   */
  async getContentAnalytics(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.content)
  }

  /**
   * Get events analytics
   */
  async getEventsAnalytics(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.events)
  }

  // === ADVANCED ANALYTICS ===

  /**
   * Get real-time analytics
   */
  async getRealtimeAnalytics(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.realtime)
  }

  /**
   * Execute advanced analytics query
   */
  async executeAdvancedQuery(query: {
    metrics: string[]
    dimensions?: string[]
    filters?: Record<string, any>
    date_range?: {
      start: string
      end: string
    }
    granularity?: 'hour' | 'day' | 'week' | 'month'
  }): Promise<any> {
    return apiClient.post(API_ENDPOINTS.analytics.advancedQuery, query)
  }

  /**
   * Get A/B testing analytics
   */
  async getABTestingAnalytics(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.abTesting)
  }

  /**
   * Get predictive analytics
   */
  async getPredictiveAnalytics(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.predictive)
  }

  // === EXTENDED ANALYTICS ===

  /**
   * Get platform overview analytics
   */
  async getPlatformOverview(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.platformOverview)
  }

  /**
   * Get user behavior analytics
   */
  async getUserBehaviorAnalytics(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.userBehavior)
  }

  /**
   * Get content performance analytics
   */
  async getContentPerformance(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.contentPerformance)
  }

  /**
   * Get advanced revenue analytics
   */
  async getAdvancedRevenueAnalytics(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.revenueAdvanced)
  }

  /**
   * Get personal analytics
   */
  async getPersonalAnalytics(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.personal)
  }

  /**
   * Get real-time data
   */
  async getRealTimeData(): Promise<any> {
    return apiClient.get(API_ENDPOINTS.analytics.realTimeData)
  }
}

// Export the class but don't instantiate it immediately
// Instance will be created by the lazy loader in index.ts
