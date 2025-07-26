/**
 * Videos API Service
 * Handles video-related API calls
 */

import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  Video,
  VideoUpload,
  VideoUploadStatus,
  VideoStreamInfo,
  PaginatedResponse,
  APIResponse,
  UploadProgressCallback,
} from "./types"

export class VideosAPI {
  /**
   * Get videos list with filtering and pagination
   */
  async getVideos(params?: {
    page?: number
    search?: string
    visibility?: 'public' | 'private' | 'unlisted'
    uploader?: string
    ordering?: string
  }): Promise<PaginatedResponse<Video>> {
    return apiClient.get<PaginatedResponse<Video>>(API_ENDPOINTS.videos.list, params)
  }

  /**
   * Create a new video entry
   */
  async createVideo(data: {
    title: string
    description: string
    visibility: 'public' | 'private' | 'unlisted'
    allow_download?: boolean
    require_premium?: boolean
  }): Promise<Video> {
    return apiClient.post<Video>(API_ENDPOINTS.videos.create, data)
  }

  /**
   * Get video details
   */
  async getVideo(videoId: string): Promise<Video> {
    return apiClient.get<Video>(API_ENDPOINTS.videos.detail(videoId))
  }

  /**
   * Update video details
   */
  async updateVideo(videoId: string, data: Partial<Video>): Promise<Video> {
    return apiClient.patch<Video>(API_ENDPOINTS.videos.detail(videoId), data)
  }

  /**
   * Delete video
   */
  async deleteVideo(videoId: string): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(API_ENDPOINTS.videos.detail(videoId))
  }

  /**
   * Upload video file
   */
  async uploadVideo(
    file: File,
    metadata: {
      title: string
      description: string
      visibility?: 'public' | 'private' | 'unlisted'
    },
    onProgress?: UploadProgressCallback
  ): Promise<VideoUpload> {
    return apiClient.uploadFile<VideoUpload>(
      API_ENDPOINTS.videos.upload,
      file,
      metadata,
      onProgress
    )
  }

  /**
   * Check video upload status
   */
  async getUploadStatus(uploadId: string): Promise<VideoUploadStatus> {
    return apiClient.get<VideoUploadStatus>(API_ENDPOINTS.videos.uploadStatus(uploadId))
  }

  /**
   * Get video streaming URL
   */
  async getVideoStream(videoId: string): Promise<VideoStreamInfo> {
    return apiClient.get<VideoStreamInfo>(API_ENDPOINTS.videos.stream(videoId))
  }

  /**
   * Like or unlike video
   */
  async likeVideo(videoId: string, isLike: boolean): Promise<{
    success: boolean
    is_liked: boolean
    like_count: number
  }> {
    return apiClient.post(API_ENDPOINTS.videos.like(videoId), { is_like: isLike })
  }

  /**
   * Search videos
   */
  async searchVideos(params: {
    q: string
    category?: string
    duration_min?: number
    duration_max?: number
    quality?: string
    ordering?: string
  }): Promise<PaginatedResponse<Video> & {
    facets: {
      categories: Array<{ name: string; count: number }>
      qualities: Array<{ name: string; count: number }>
    }
  }> {
    return apiClient.get(API_ENDPOINTS.videos.search, params)
  }
}

// Export the class but don't instantiate it immediately
// Instance will be created by the lazy loader in index.ts
