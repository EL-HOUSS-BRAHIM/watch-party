"use client"

import { useState, useEffect, useCallback } from "react"
import { videosApi, VideoSummary } from "@/lib/api-client"

export type GDriveMovie = {
  gdrive_file_id: string
  title: string
  size?: number
  mime_type?: string
  thumbnail_url?: string
  duration?: number
  resolution?: string
  created_time?: string
  modified_time?: string
  in_database?: boolean
  video_id?: string | null
}

export type VideoFilter = "all" | "ready" | "processing" | "failed"

export interface UseVideosReturn {
  // Video state
  videos: VideoSummary[]
  loading: boolean
  error: string
  filter: VideoFilter
  searchQuery: string
  
  // Google Drive state
  gdriveFiles: GDriveMovie[]
  gdriveLoading: boolean
  gdriveError: string
  gdriveConnected: boolean | null
  
  // Action states
  uploading: boolean
  importingIds: string[]
  streamingIds: string[]
  deletingIds: string[]
  
  // Actions
  setFilter: (filter: VideoFilter) => void
  setSearchQuery: (query: string) => void
  loadVideos: () => Promise<void>
  loadGdriveVideos: (force?: boolean) => Promise<void>
  uploadFile: (file: File) => Promise<VideoSummary | null>
  uploadFromUrl: (title: string, url: string) => Promise<VideoSummary | null>
  importFromGDrive: (movie: GDriveMovie) => Promise<void>
  streamGDriveVideo: (videoId: string) => Promise<void>
  deleteGDriveVideo: (videoId: string, movie: GDriveMovie) => Promise<void>
  deleteVideo: (videoId: string) => Promise<void>
  
  // Computed values
  videoCounts: {
    all: number
    ready: number
    processing: number
    failed: number
  }
}

export function useVideos(): UseVideosReturn {
  // Video state
  const [videos, setVideos] = useState<VideoSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<VideoFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Google Drive state
  const [gdriveFiles, setGdriveFiles] = useState<GDriveMovie[]>([])
  const [gdriveLoading, setGdriveLoading] = useState(false)
  const [gdriveError, setGdriveError] = useState("")
  const [gdriveLoaded, setGdriveLoaded] = useState(false)
  const [gdriveConnected, setGdriveConnected] = useState<boolean | null>(null)
  
  // Action states
  const [uploading, setUploading] = useState(false)
  const [importingIds, setImportingIds] = useState<string[]>([])
  const [streamingIds, setStreamingIds] = useState<string[]>([])
  const [deletingIds, setDeletingIds] = useState<string[]>([])

  // Load videos on filter/search change
  useEffect(() => {
    loadVideos()
  }, [filter, searchQuery])

  const loadVideos = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      let response
      
      if (searchQuery.trim()) {
        response = await videosApi.search(searchQuery)
      } else {
        const params: Record<string, string | number | undefined> = { page_size: 20 }
        if (filter !== "all") {
          params.upload_status = filter
        }
        response = await videosApi.list(params)
      }

      const videosList = Array.isArray(response) ? response : (response.results || [])
      setVideos(videosList)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load videos")
    } finally {
      setLoading(false)
    }
  }, [filter, searchQuery])

  const loadGdriveVideos = useCallback(async (force = false) => {
    if (gdriveLoading || (!force && gdriveLoaded)) {
      return
    }

    setGdriveLoading(true)
    setGdriveError("")

    try {
      const response = await videosApi.getGDriveVideos({ page_size: 50 })
      
      // Check if response indicates not connected
      const notConnectedMessage = (response as any)?.message
      if (
        notConnectedMessage === "Google Drive not connected" ||
        (Array.isArray((response as any)?.movies) && (response as any)?.movies?.length === 0 && notConnectedMessage)
      ) {
        setGdriveConnected(false)
        setGdriveFiles([])
        setGdriveLoaded(true)
        return
      }
      
      // Mark as connected if we got a valid response
      setGdriveConnected(true)
      
      const rawMovies =
        (response as any)?.movies ??
        (response as any)?.results ??
        (Array.isArray(response) ? response : [])

      const normalized: GDriveMovie[] = Array.isArray(rawMovies)
        ? rawMovies
            .map((movie: any) => {
              const rawSize = movie.size ?? movie.file_size
              const parsedSize =
                typeof rawSize === "string"
                  ? Number.parseInt(rawSize, 10)
                  : typeof rawSize === "number"
                    ? rawSize
                    : undefined

              const rawDuration = movie.duration ?? movie.duration_seconds
              const parsedDuration =
                typeof rawDuration === "string"
                  ? Number.parseFloat(rawDuration)
                  : typeof rawDuration === "number"
                    ? rawDuration
                    : undefined

              const fileId = movie.gdrive_file_id ?? movie.gdriveId ?? movie.id ?? movie.file_id

              return {
                gdrive_file_id: fileId,
                title: movie.title ?? movie.name ?? "Untitled file",
                size: Number.isFinite(parsedSize) ? parsedSize : undefined,
                mime_type: movie.mime_type,
                thumbnail_url: movie.thumbnail_url ?? movie.thumbnail,
                duration: Number.isFinite(parsedDuration) ? parsedDuration : undefined,
                resolution: movie.resolution,
                created_time: movie.created_time ?? movie.createdAt,
                modified_time: movie.modified_time ?? movie.modifiedAt,
                in_database: movie.in_database ?? Boolean(movie.video_id),
                video_id: movie.video_id ?? movie.library_id ?? null,
              } as GDriveMovie
            })
            .filter((movie: GDriveMovie) => Boolean(movie.gdrive_file_id))
        : []

      setGdriveFiles(normalized)
      setGdriveLoaded(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load Google Drive videos"
      if (
        errorMessage.toLowerCase().includes("not connected") ||
        errorMessage.toLowerCase().includes("google drive")
      ) {
        setGdriveConnected(false)
      }
      setGdriveError(errorMessage)
      setGdriveLoaded(false)
    } finally {
      setGdriveLoading(false)
    }
  }, [gdriveLoading, gdriveLoaded])

  const uploadFile = useCallback(async (file: File): Promise<VideoSummary | null> => {
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", file.name.replace(/\.[^/.]+$/, ""))
      formData.append("visibility", "private")

      const newVideo = await videosApi.create(formData)
      setVideos((prev) => [newVideo, ...prev])
      return newVideo
    } catch (err) {
      throw err instanceof Error ? err : new Error("Upload failed")
    } finally {
      setUploading(false)
    }
  }, [])

  const uploadFromUrl = useCallback(async (title: string, url: string): Promise<VideoSummary | null> => {
    setUploading(true)

    try {
      const validation = await videosApi.validateUrl(url)
      if (!validation.valid) {
        throw new Error("Invalid video URL")
      }

      const newVideo = await videosApi.create({
        title,
        source_type: "url",
        source_url: url,
        visibility: "private",
      })
      
      setVideos((prev) => [newVideo, ...prev])
      return newVideo
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to add video")
    } finally {
      setUploading(false)
    }
  }, [])

  const importFromGDrive = useCallback(async (movie: GDriveMovie) => {
    if (!movie.gdrive_file_id || importingIds.includes(movie.gdrive_file_id)) {
      return
    }

    setImportingIds((prev) => [...prev, movie.gdrive_file_id])

    try {
      const response = await videosApi.uploadFromGDrive(movie.gdrive_file_id)
      const importedVideo: VideoSummary = (response as any)?.video ?? response

      if (importedVideo) {
        setVideos((prev) => [importedVideo, ...prev])
        setGdriveFiles((prev) =>
          prev.map((file) =>
            file.gdrive_file_id === movie.gdrive_file_id
              ? { ...file, in_database: true, video_id: importedVideo.id }
              : file
          )
        )
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to import from Google Drive")
    } finally {
      setImportingIds((prev) => prev.filter((id) => id !== movie.gdrive_file_id))
    }
  }, [importingIds])

  const streamGDriveVideo = useCallback(async (videoId: string) => {
    if (!videoId || streamingIds.includes(videoId)) {
      return
    }

    setStreamingIds((prev) => [...prev, videoId])

    try {
      const response = await videosApi.getGDriveStream(videoId)
      const streamUrl = (response as any)?.stream_url ?? (response as any)?.url
      if (streamUrl) {
        window.open(streamUrl, "_blank")
      }
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to start streaming")
    } finally {
      setStreamingIds((prev) => prev.filter((id) => id !== videoId))
    }
  }, [streamingIds])

  const deleteGDriveVideo = useCallback(async (videoId: string, movie: GDriveMovie) => {
    if (!videoId || deletingIds.includes(videoId)) {
      return
    }

    setDeletingIds((prev) => [...prev, videoId])

    try {
      await videosApi.deleteGDriveVideo(videoId)
      setVideos((prev) => prev.filter((video) => video.id !== videoId))
      setGdriveFiles((prev) =>
        prev.map((file) =>
          file.gdrive_file_id === movie.gdrive_file_id
            ? { ...file, in_database: false, video_id: null }
            : file
        )
      )
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to delete Google Drive video")
    } finally {
      setDeletingIds((prev) => prev.filter((id) => id !== videoId))
    }
  }, [deletingIds])

  const deleteVideo = useCallback(async (videoId: string) => {
    try {
      await videosApi.delete(videoId)
      setVideos((prev) => prev.filter((v) => v.id !== videoId))
    } catch (err) {
      throw err instanceof Error ? err : new Error("Failed to delete video")
    }
  }, [])

  // Computed values
  const videoCounts = {
    all: videos.length,
    ready: videos.filter((v) => v.upload_status === "ready").length,
    processing: videos.filter((v) => v.upload_status === "processing").length,
    failed: videos.filter((v) => v.upload_status === "failed").length,
  }

  return {
    // Video state
    videos,
    loading,
    error,
    filter,
    searchQuery,
    
    // Google Drive state
    gdriveFiles,
    gdriveLoading,
    gdriveError,
    gdriveConnected,
    
    // Action states
    uploading,
    importingIds,
    streamingIds,
    deletingIds,
    
    // Actions
    setFilter,
    setSearchQuery,
    loadVideos,
    loadGdriveVideos,
    uploadFile,
    uploadFromUrl,
    importFromGDrive,
    streamGDriveVideo,
    deleteGDriveVideo,
    deleteVideo,
    
    // Computed values
    videoCounts,
  }
}
