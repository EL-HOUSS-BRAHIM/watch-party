/**
 * Videos API Service
 * Handles video-related API calls including analytics, comments, and Google Drive integration
 */

import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  Video,
  VideoUpload,
  VideoUploadStatus,
  VideoStreamInfo,
  VideoComment,
  VideoAnalytics,
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
    return apiClient.get<PaginatedResponse<Video>>(API_ENDPOINTS.videos.list, { params })
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
    return apiClient.upload<VideoUpload>(
      API_ENDPOINTS.videos.upload,
      file,
      onProgress,
      metadata
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
    return apiClient.get(API_ENDPOINTS.videos.search, { params })
  }

  // === VIDEO COMMENTS & INTERACTIONS ===

  /**
   * Get video comments
   */
  async getComments(videoId: string, params?: {
    page?: number
    ordering?: string
  }): Promise<PaginatedResponse<VideoComment>> {
    return apiClient.get<PaginatedResponse<VideoComment>>(API_ENDPOINTS.videos.comments(videoId), { params })
  }

  /**
   * Download video
   */
  async downloadVideo(videoId: string): Promise<{ download_url: string; expires_at: string }> {
    return apiClient.get(API_ENDPOINTS.videos.download(videoId))
  }

  // === UPLOAD MANAGEMENT ===

  /**
   * S3 video upload
   */
  async uploadToS3(data: {
    file_name: string
    content_type: string
    file_size: number
  }): Promise<{ upload_url: string; fields: object }> {
    return apiClient.post(API_ENDPOINTS.videos.uploadS3, data)
  }

  /**
   * Complete upload
   */
  async completeUpload(uploadId: string, data: {
    file_key: string
    metadata?: object
  }): Promise<VideoUpload> {
    return apiClient.post<VideoUpload>(API_ENDPOINTS.videos.completeUpload(uploadId), data)
  }

  // === VIDEO METADATA & PROCESSING ===

  /**
   * Get video thumbnail
   */
  async getThumbnail(videoId: string): Promise<{ thumbnail_url: string }> {
    return apiClient.get(API_ENDPOINTS.videos.thumbnail(videoId))
  }

  /**
   * Get video analytics
   */
  async getAnalytics(videoId: string): Promise<VideoAnalytics> {
    return apiClient.get<VideoAnalytics>(API_ENDPOINTS.videos.analytics(videoId))
  }

  /**
   * Get video processing status
   */
  async getProcessingStatus(videoId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress: number
    message?: string
  }> {
    return apiClient.get(API_ENDPOINTS.videos.processingStatus(videoId))
  }

  /**
   * Get video quality variants
   */
  async getQualityVariants(videoId: string): Promise<Array<{
    quality: string
    url: string
    file_size: number
    bitrate: number
  }>> {
    return apiClient.get(API_ENDPOINTS.videos.qualityVariants(videoId))
  }

  /**
   * Regenerate video thumbnail
   */
  async regenerateThumbnail(videoId: string, data?: {
    timestamp?: number
  }): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.videos.regenerateThumbnail(videoId), data)
  }

  /**
   * Share video
   */
  async shareVideo(videoId: string, data: {
    platform: string
    message?: string
  }): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.videos.share(videoId), data)
  }

  // === ADVANCED ANALYTICS ===

  /**
   * Get detailed analytics
   */
  async getDetailedAnalytics(videoId: string, params?: {
    period?: 'day' | 'week' | 'month'
    start_date?: string
    end_date?: string
  }): Promise<any> {
    return apiClient.get(API_ENDPOINTS.videos.detailedAnalytics(videoId), { params })
  }

  /**
   * Get heatmap analytics
   */
  async getHeatmapAnalytics(videoId: string): Promise<Array<{
    timestamp: number
    engagement: number
    watch_time: number
  }>> {
    return apiClient.get(API_ENDPOINTS.videos.heatmapAnalytics(videoId))
  }

  /**
   * Get retention analytics
   */
  async getRetentionAnalytics(videoId: string): Promise<{
    average_view_duration: number
    retention_curve: Array<{ timestamp: number; retention_rate: number }>
  }> {
    return apiClient.get(API_ENDPOINTS.videos.retentionAnalytics(videoId))
  }

  /**
   * Get journey analytics
   */
  async getJourneyAnalytics(videoId: string): Promise<{
    traffic_sources: Array<{ source: string; views: number }>
    viewer_journey: Array<{ step: string; count: number }>
  }> {
    return apiClient.get(API_ENDPOINTS.videos.journeyAnalytics(videoId))
  }

  /**
   * Get comparative analytics
   */
  async getComparativeAnalytics(videoId: string, params: {
    compare_with: string[]
    metrics: string[]
  }): Promise<any> {
    return apiClient.get(API_ENDPOINTS.videos.comparativeAnalytics(videoId), { params })
  }

  // === CHANNEL ANALYTICS ===

  /**
   * Get channel analytics
   */
  async getChannelAnalytics(params?: {
    period?: 'day' | 'week' | 'month'
  }): Promise<{
    total_views: number
    total_watch_time: number
    subscriber_count: number
    top_videos: Video[]
  }> {
    return apiClient.get(API_ENDPOINTS.videos.channelAnalytics, { params })
  }

  /**
   * Get trending videos
   */
  async getTrending(params?: {
    category?: string
    country?: string
    limit?: number
  }): Promise<Video[]> {
    return apiClient.get<Video[]>(API_ENDPOINTS.videos.trending, { params })
  }

  // === VIDEO MANAGEMENT ===

  /**
   * Validate video URL
   */
  async validateUrl(data: { url: string }): Promise<{
    is_valid: boolean
    video_info?: {
      title: string
      duration: number
      thumbnail: string
    }
  }> {
    return apiClient.post(API_ENDPOINTS.videos.validateUrl, data)
  }

  /**
   * Advanced video search
   */
  async advancedSearch(params: {
    q?: string
    filters: {
      duration?: { min?: number; max?: number }
      upload_date?: { from?: string; to?: string }
      quality?: string[]
      categories?: string[]
    }
    sort?: string
    page?: number
  }): Promise<PaginatedResponse<Video> & {
    aggregations: object
  }> {
    return apiClient.get(API_ENDPOINTS.videos.advancedSearch, { params })
  }

  // === GOOGLE DRIVE INTEGRATION ===

  /**
   * Get Google Drive videos
   */
  async getGoogleDriveVideos(params?: {
    folder_id?: string
    page_token?: string
  }): Promise<{
    videos: any[]
    next_page_token?: string
  }> {
    return apiClient.get(API_ENDPOINTS.videos.gdrive, { params })
  }

  /**
   * Upload to Google Drive
   */
  async uploadToGoogleDrive(data: {
    file_name: string
    parent_folder?: string
  }): Promise<{ upload_url: string; file_id: string }> {
    return apiClient.post(API_ENDPOINTS.videos.gdriveUpload, data)
  }

  /**
   * Delete from Google Drive
   */
  async deleteFromGoogleDrive(videoId: string): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(API_ENDPOINTS.videos.gdriveDelete(videoId))
  }

  /**
   * Stream from Google Drive
   */
  async streamFromGoogleDrive(videoId: string): Promise<{ streaming_url: string }> {
    return apiClient.get(API_ENDPOINTS.videos.gdriveStream(videoId))
  }

  // === VIDEO PROXY ===

  /**
   * Get video proxy URL
   */
  async getProxyUrl(videoId: string): Promise<{ proxy_url: string; expires_at: string }> {
    return apiClient.get(API_ENDPOINTS.videos.proxy(videoId))
  }
}

// Export the class but don't instantiate it immediately
// Instance will be created by the lazy loader in index.ts
