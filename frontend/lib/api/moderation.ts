/**
 * Moderation API Service
 * Handles content moderation, reports, and admin moderation tools
 */

import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  ModerationReport,
  ReportType,
  ContentType,
  PaginatedResponse,
} from "./types"

export class ModerationAPI {
  /**
   * Get moderation reports
   */
  async getReports(params?: {
    status?: 'pending' | 'reviewed' | 'resolved'
    content_type?: string
    page?: number
  }): Promise<PaginatedResponse<ModerationReport>> {
    return apiClient.get<PaginatedResponse<ModerationReport>>(API_ENDPOINTS.moderation.reports, { params })
  }

  /**
   * Create report
   */
  async createReport(data: {
    content_type: string
    content_id: string
    report_type: string
    description: string
  }): Promise<ModerationReport> {
    return apiClient.post<ModerationReport>(API_ENDPOINTS.moderation.reports, data)
  }

  /**
   * Get report types
   */
  async getReportTypes(): Promise<ReportType[]> {
    return apiClient.get<ReportType[]>(API_ENDPOINTS.moderation.reportTypes)
  }

  /**
   * Get content types
   */
  async getContentTypes(): Promise<ContentType[]> {
    return apiClient.get<ContentType[]>(API_ENDPOINTS.moderation.contentTypes)
  }
}
