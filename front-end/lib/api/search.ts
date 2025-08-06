/**
 * Search API Service
 * Handles global search and discovery functionality
 */

import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  SearchResult,
  DiscoverContent,
  APIResponse,
} from "./types"

export class SearchAPI {
  /**
   * Global search across all content types
   */
  async globalSearch(params: {
    q: string
    type?: 'videos' | 'parties' | 'users' | 'all'
    page?: number
    limit?: number
  }): Promise<{
    success: boolean
    results: {
      videos: SearchResult[]
      parties: SearchResult[]
      users: SearchResult[]
    }
    total_count: number
    search_time: number
  }> {
    return apiClient.get(API_ENDPOINTS.search.global, { params })
  }

  /**
   * Discover content based on user preferences
   */
  async discover(params?: {
    category?: string
    trending?: boolean
    recommended?: boolean
    limit?: number
  }): Promise<{
    success: boolean
    content: DiscoverContent
    recommendations: {
      videos: any[]
      parties: any[]
      users: any[]
    }
  }> {
    return apiClient.get(API_ENDPOINTS.search.discover, { params })
  }
}
