import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {}

/**
 * Integrations API Service
 * Handles external service integrations like Google Drive, S3, and social auth
 */

  APIResponse,
  HealthStatus,
  IntegrationConnection,
  IntegrationDefinition,
  IntegrationFile,
  IntegrationStatusOverview,
  PresignedUpload,
} from "./types"

export class IntegrationsAPI {}
  /**
   * Get Google Drive auth URL
   */
  async getGoogleDriveAuthUrl(): Promise<{ auth_url: string }> {}
    return apiClient.get(API_ENDPOINTS.integrations.googleDriveAuthUrl)
  }

  /**
   * Get Google Drive files
   */
  async getGoogleDriveFiles(params?: {}
    folder_id?: string
    mime_type?: string
    page_token?: string
  }): Promise<{}
    files: IntegrationFile[]
    next_page_token?: string
  }> {}
    return apiClient.get(API_ENDPOINTS.integrations.googleDriveFiles, { params })
  }

  /**
   * Complete Google Drive OAuth callback
   */
  async completeGoogleDriveOAuth(data: { code: string; state?: string }): Promise<APIResponse> {}
    return apiClient.post<APIResponse>(API_ENDPOINTS.integrations.googleDriveCallback, data)
  }

  /**
   * Get S3 presigned upload URL
   */
  async getS3PresignedUpload(data: {}
    file_name: string
    content_type: string
    file_size?: number
  }): Promise<PresignedUpload> {}
    return apiClient.post<PresignedUpload>(API_ENDPOINTS.integrations.s3PresignedUpload, data)
  }

  /**
   * Get integration auth URL (generic)
   */
  async getAuthUrl(provider: string): Promise<{ auth_url: string }> {}
    return apiClient.get<{ auth_url: string }>(API_ENDPOINTS.integrations.authUrl(provider))
  }

  /**
   * Handle integration callback
   */
  async handleCallback(provider: string, data: {}
    code?: string
    state?: string
    error?: string
  }): Promise<APIResponse> {}
    return apiClient.post<APIResponse>(API_ENDPOINTS.integrations.callback(provider), data)
  }

  /**
   * Check integrations health
   */
  async getHealth(): Promise<HealthStatus> {}
    return apiClient.get<HealthStatus>(API_ENDPOINTS.integrations.health)
  }

  /**
   * Get integration status overview (admin + provider health)
   */
  async getStatus(): Promise<{ integrations: IntegrationStatusOverview[] }> {}
    return apiClient.get<{ integrations: IntegrationStatusOverview[] }>(API_ENDPOINTS.integrations.status)
  }

  /**
   * Get available integration definitions
   */
  async getIntegrationTypes(): Promise<{ integrations: IntegrationDefinition[] }> {}
    return apiClient.get<{ integrations: IntegrationDefinition[] }>(API_ENDPOINTS.integrations.types)
  }

  /**
   * Get the current user's connections
   */
  async getConnections(): Promise<{ connections: IntegrationConnection[] }> {}
    return apiClient.get<{ connections: IntegrationConnection[] }>(API_ENDPOINTS.integrations.connections)
  }

  /**
   * Disconnect a specific integration connection
   */
  async disconnectConnection(connectionId: string): Promise<APIResponse> {}
    return apiClient.delete(API_ENDPOINTS.integrations.disconnectConnection(connectionId))
  }

  /**
   * Get Google Drive streaming URL
   */
  async getGoogleDriveStreamingUrl(fileId: string): Promise<{ streaming_url: string }> {}
    return apiClient.get(API_ENDPOINTS.integrations.gdriveStreamingUrl(fileId))
  }
}
