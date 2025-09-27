/**
 * LocalizationAPI - helper for translations, language status, and review workflows
 * Centralizes the new localization routes so admin and dashboard surfaces can
 * fetch consistent translation data without duplicating HTTP details.
 */

import { apiClient, type ApiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  LocalizationLanguage,
  LocalizationProject,
  LocalizationString,
  LocalizationSubmissionPayload,
  LocalizationApproval,
  PaginatedResponse,
} from "./types"

export class LocalizationAPI {
  constructor(private readonly client: ApiClient = apiClient) {}

  /**
   * List supported languages with high-level completion metrics.
   */
  async getLanguages(): Promise<LocalizationLanguage[]> {
    return this.client.get<LocalizationLanguage[]>(API_ENDPOINTS.localization.languages)
  }

  /**
   * Retrieve a single language and its overall translation status.
   */
  async getLanguage(languageCode: string): Promise<LocalizationLanguage> {
    return this.client.get<LocalizationLanguage>(API_ENDPOINTS.localization.languageDetail(languageCode))
  }

  /**
   * List active localization projects (e.g., product, marketing, support docs).
   */
  async getProjects(): Promise<LocalizationProject[]> {
    return this.client.get<LocalizationProject[]>(API_ENDPOINTS.localization.projects)
  }

  /**
   * Fetch details for a specific project including language assignments.
   */
  async getProject(projectId: string): Promise<LocalizationProject> {
    return this.client.get<LocalizationProject>(API_ENDPOINTS.localization.projectDetail(projectId))
  }

  /**
   * Retrieve paginated translation strings for a project, optionally filtered by language or status.
   */
  async getStrings(
    projectId: string,
    params: { language?: string; status?: string; page?: number; pageSize?: number } = {},
  ): Promise<PaginatedResponse<LocalizationString>> {
    return this.client.get<PaginatedResponse<LocalizationString>>(API_ENDPOINTS.localization.strings(projectId), {
      params: {
        language: params.language,
        status: params.status,
        page: params.page,
        page_size: params.pageSize,
      },
    })
  }

  /**
   * Submit a translation or update an existing string.
   */
  async submitString(projectId: string, payload: LocalizationSubmissionPayload): Promise<LocalizationString> {
    return this.client.post<LocalizationString>(API_ENDPOINTS.localization.submitString(projectId), payload)
  }

  /**
   * Approve or reject submitted translations during review.
   */
  async reviewString(
    projectId: string,
    stringId: string,
    payload: { status: "approved" | "rejected"; feedback?: string },
  ): Promise<LocalizationString> {
    return this.client.post<LocalizationString>(
      `${API_ENDPOINTS.localization.strings(projectId)}${stringId}/review/`,
      payload,
    )
  }

  /**
   * Fetch approval tasks assigned to reviewers for the project.
   */
  async getApprovals(projectId: string): Promise<LocalizationApproval[]> {
    return this.client.get<LocalizationApproval[]>(API_ENDPOINTS.localization.approvals(projectId))
  }
}

export const localizationAPI = new LocalizationAPI()
