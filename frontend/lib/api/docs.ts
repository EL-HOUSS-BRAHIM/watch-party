/**
 * DocsAPI - lightweight client for documentation management surfaces
 * Provides CRUD helpers around documents, categories, search, and publishing workflows
 * so UI layers can replace mock data with live backend responses.
 */

import { apiClient, type ApiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  DocumentationDocument,
  DocumentationVersion,
  DocumentationCategory,
  DocumentationUpsertInput,
  DocumentationCategoryInput,
  DocumentationListFilters,
  DocumentationSearchResult,
  PaginatedResponse,
} from "./types"

export class DocsAPI {
  constructor(private readonly client: ApiClient = apiClient) {}

  /**
   * Fetch paginated documentation entries with optional filtering by status, category, or tags.
   */
  async listDocuments(
    filters: DocumentationListFilters = {},
  ): Promise<PaginatedResponse<DocumentationDocument>> {
    return this.client.get<PaginatedResponse<DocumentationDocument>>(API_ENDPOINTS.docs.list, {
      params: {
        search: filters.search,
        status: filters.status,
        category: filters.category,
        tags: filters.tags?.join(","),
        author: filters.author,
        page: filters.page,
        page_size: filters.pageSize,
      },
    })
  }

  /**
   * Retrieve a single document, including its latest published content and metadata.
   */
  async getDocument(documentId: string): Promise<DocumentationDocument> {
    return this.client.get<DocumentationDocument>(API_ENDPOINTS.docs.detail(documentId))
  }

  /**
   * Create a new documentation entry in draft state.
   */
  async createDocument(payload: DocumentationUpsertInput): Promise<DocumentationDocument> {
    return this.client.post<DocumentationDocument>(API_ENDPOINTS.docs.create, payload)
  }

  /**
   * Update document content or metadata.
   */
  async updateDocument(
    documentId: string,
    payload: DocumentationUpsertInput,
  ): Promise<DocumentationDocument> {
    return this.client.put<DocumentationDocument>(API_ENDPOINTS.docs.update(documentId), payload)
  }

  /**
   * Permanently delete a document.
   */
  async deleteDocument(documentId: string): Promise<void> {
    await this.client.delete(API_ENDPOINTS.docs.delete(documentId))
  }

  /**
   * Publish the active draft version so it becomes visible to end users.
   */
  async publishDocument(documentId: string): Promise<DocumentationDocument> {
    return this.client.post<DocumentationDocument>(API_ENDPOINTS.docs.publish(documentId))
  }

  /**
   * Archive a document to remove it from standard listings while preserving history.
   */
  async archiveDocument(documentId: string): Promise<DocumentationDocument> {
    return this.client.post<DocumentationDocument>(API_ENDPOINTS.docs.archive(documentId))
  }

  /**
   * Retrieve historic versions for change tracking and rollback UI.
   */
  async listVersions(documentId: string): Promise<DocumentationVersion[]> {
    return this.client.get<DocumentationVersion[]>(API_ENDPOINTS.docs.versions(documentId))
  }

  /**
   * Fetch documentation categories to power navigation filters.
   */
  async listCategories(): Promise<DocumentationCategory[]> {
    return this.client.get<DocumentationCategory[]>(API_ENDPOINTS.docs.categories)
  }

  /**
   * Create a new documentation category.
   */
  async createCategory(payload: DocumentationCategoryInput): Promise<DocumentationCategory> {
    return this.client.post<DocumentationCategory>(API_ENDPOINTS.docs.categories, payload)
  }

  /**
   * Update an existing category's metadata.
   */
  async updateCategory(
    categoryId: string,
    payload: DocumentationCategoryInput,
  ): Promise<DocumentationCategory> {
    return this.client.put<DocumentationCategory>(API_ENDPOINTS.docs.categoryDetail(categoryId), payload)
  }

  /**
   * Delete an unused category.
   */
  async deleteCategory(categoryId: string): Promise<void> {
    await this.client.delete(API_ENDPOINTS.docs.categoryDetail(categoryId))
  }

  /**
   * Search documents for quick navigation or inline linking flows.
   */
  async searchDocuments(params: { query: string; limit?: number }): Promise<DocumentationSearchResult[]> {
    return this.client.get<DocumentationSearchResult[]>(API_ENDPOINTS.docs.search, {
      params: {
        query: params.query,
        limit: params.limit,
      },
    })
  }

  /**
   * Trigger a data export for offline reviews or backups.
   */
  async exportDocuments(): Promise<{ download_url: string; expires_at: string }> {
    return this.client.post<{ download_url: string; expires_at: string }>(API_ENDPOINTS.docs.export)
  }
}

export const docsAPI = new DocsAPI()
