"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { videosApi, VideoSummary, integrationsApi } from "@/lib/api-client"
import { IconButton } from "@/components/ui/icon-button"
import { useDesignSystem } from "@/hooks/use-design-system"

type GDriveMovie = {
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

export default function VideosPage() {
  const { formatNumber: _formatNumber } = useDesignSystem()
  const searchParams = useSearchParams()
  const [videos, setVideos] = useState<VideoSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "ready" | "processing" | "failed">("all")
  const [uploading, setUploading] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [uploadMode, setUploadMode] = useState<"file" | "url" | "gdrive" | null>(null)
  const [gdriveFiles, setGdriveFiles] = useState<GDriveMovie[]>([])
  const [gdriveLoading, setGdriveLoading] = useState(false)
  const [gdriveError, setGdriveError] = useState("")
  const [gdriveLoaded, setGdriveLoaded] = useState(false)
  const [gdriveConnected, setGdriveConnected] = useState<boolean | null>(null)
  const [gdriveConnecting, setGdriveConnecting] = useState(false)
  const [importingIds, setImportingIds] = useState<string[]>([])
  const [streamingIds, setStreamingIds] = useState<string[]>([])
  const [deletingIds, setDeletingIds] = useState<string[]>([])
  const [connectionNotice, setConnectionNotice] = useState<string | null>(null)

  // Check if we just connected to Google Drive (from OAuth callback)
  useEffect(() => {
    if (searchParams.get("gdrive_connected") === "true") {
      setConnectionNotice("🎉 Google Drive connected successfully! You can now import videos.")
      setGdriveConnected(true)
      // Clear the URL parameter
      window.history.replaceState({}, "", "/dashboard/videos")
    }
  }, [searchParams])

  useEffect(() => {
    loadVideos()
  }, [filter, searchQuery])

  useEffect(() => {
    if (uploadMode === "gdrive") {
      loadGdriveVideos()
    }
  }, [uploadMode])

  const loadVideos = async () => {
    setLoading(true)
    setError("")

    try {
      let response
      
      if (searchQuery.trim()) {
        response = await videosApi.search(searchQuery)
      } else {
        const params: any = { page_size: 20 }
        if (filter !== "all") {
          // Map filter to API status
          const statusMap = {
            ready: "ready",
            processing: "processing", 
            failed: "failed"
          }
          params.upload_status = statusMap[filter as keyof typeof statusMap]
        }
        response = await videosApi.list(params)
      }

      const videosList = Array.isArray(response) ? response : (response.results || [])
      setVideos(videosList)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load videos")
    } finally {
      setLoading(false)
    }
  }

  const loadGdriveVideos = async (force = false) => {
    if (gdriveLoading || (!force && gdriveLoaded)) {
      return
    }

    setGdriveLoading(true)
    setGdriveError("")

    try {
      const response = await videosApi.getGDriveVideos({ page_size: 50 })
      
      // Check if response indicates not connected
      const notConnectedMessage = (response as any)?.message
      if (notConnectedMessage === "Google Drive not connected" || 
          (Array.isArray((response as any)?.movies) && (response as any)?.movies?.length === 0 && notConnectedMessage)) {
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
    } catch (error) {
      // Check if error indicates not connected
      const errorMessage = error instanceof Error ? error.message : "Failed to load Google Drive videos"
      if (errorMessage.toLowerCase().includes("not connected") || 
          errorMessage.toLowerCase().includes("google drive")) {
        setGdriveConnected(false)
      }
      setGdriveError(errorMessage)
      setGdriveLoaded(false)
    } finally {
      setGdriveLoading(false)
    }
  }

  const handleConnectGoogleDrive = async () => {
    console.log("[GDrive] Button clicked!")
    setGdriveConnecting(true)
    setGdriveError("")
    
    try {
      console.log("[GDrive] Starting OAuth flow...")
      const response = await integrationsApi.googleDrive.getAuthUrl()
      console.log("[GDrive] Auth URL response:", response)
      
      // Handle different response structures
      // Backend returns: { success: true, data: { authorization_url: "...", state: "..." }, message: "..." }
      const authData = (response as any)?.data ?? response
      console.log("[GDrive] Auth data extracted:", authData)
      
      // Get the authorization URL
      let authorizationUrl = authData?.authorization_url
      const state = authData?.state
      
      console.log("[GDrive] Authorization URL:", authorizationUrl)
      console.log("[GDrive] State:", state)
      
      if (!authorizationUrl) {
        console.error("[GDrive] No authorization URL in response:", response)
        throw new Error("Failed to get authorization URL from server. Please check if Google Drive is configured.")
      }
      
      // Add state to URL if not already included
      if (state && !authorizationUrl.includes("state=")) {
        const separator = authorizationUrl.includes("?") ? "&" : "?"
        authorizationUrl = `${authorizationUrl}${separator}state=${encodeURIComponent(state)}`
      }
      
      console.log("[GDrive] Redirecting to:", authorizationUrl)
      // Redirect to Google for authorization
      window.location.href = authorizationUrl
    } catch (error) {
      console.error("[GDrive] Failed to connect Google Drive:", error)
      const errorMsg = error instanceof Error 
        ? error.message 
        : "Failed to start Google Drive connection. Please try again."
      setGdriveError(errorMsg)
      setGdriveConnecting(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', file.name.replace(/\.[^/.]+$/, "")) // Remove extension
      formData.append('visibility', 'private')

      const newVideo = await videosApi.create(formData)
      setVideos(prev => [newVideo, ...prev])
      
      // Reset file input
      event.target.value = ""
    } catch (error) {
      alert("Upload failed: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setUploading(false)
    }
  }

  const handleImportFromGDrive = async (movie: GDriveMovie) => {
    if (!movie.gdrive_file_id || importingIds.includes(movie.gdrive_file_id)) {
      return
    }

    setImportingIds(prev => (prev.includes(movie.gdrive_file_id) ? prev : [...prev, movie.gdrive_file_id]))

    try {
      const response = await videosApi.uploadFromGDrive(movie.gdrive_file_id)
      const importedVideo: VideoSummary = (response as any)?.video ?? response

      if (importedVideo) {
        setVideos(prev => [importedVideo, ...prev])
        setGdriveFiles(prev =>
          prev.map(file =>
            file.gdrive_file_id === movie.gdrive_file_id
              ? {
                  ...file,
                  in_database: true,
                  video_id: importedVideo.id,
                }
              : file
          )
        )
      }
    } catch (error) {
      alert("Failed to import from Google Drive: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setImportingIds(prev => prev.filter(id => id !== movie.gdrive_file_id))
    }
  }

  const handleUrlSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const url = formData.get("url") as string
    const title = formData.get("title") as string

    if (!url || !title) return

    setUploading(true)

    try {
      // First validate the URL
      const validation = await videosApi.validateUrl(url)
      if (!validation.valid) {
        alert("Invalid video URL")
        return
      }

      const newVideo = await videosApi.create({
        title,
        source_type: "url",
        source_url: url,
        visibility: "private",
      })
      
      setVideos(prev => [newVideo, ...prev])
      
      // Reset form
      event.currentTarget.reset()
    } catch (error) {
      alert("Failed to add video: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setUploading(false)
    }
  }

  const handleStreamGDriveVideo = async (videoId: string | null | undefined) => {
    if (!videoId || streamingIds.includes(videoId)) {
      return
    }

    setStreamingIds(prev => (prev.includes(videoId) ? prev : [...prev, videoId]))

    try {
      const response = await videosApi.getGDriveStream(videoId)
      const streamUrl = (response as any)?.stream_url ?? (response as any)?.url
      if (streamUrl) {
        window.open(streamUrl, "_blank")
      }
    } catch (error) {
      alert("Failed to start streaming: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setStreamingIds(prev => prev.filter(id => id !== videoId))
    }
  }

  const handleDeleteGDriveVideo = async (videoId: string | null | undefined, movie: GDriveMovie) => {
    if (!videoId || deletingIds.includes(videoId)) {
      return
    }

    if (!confirm("Delete this Google Drive video from your library and Drive?")) {
      return
    }

    setDeletingIds(prev => (prev.includes(videoId) ? prev : [...prev, videoId]))

    try {
      await videosApi.deleteGDriveVideo(videoId)
      setVideos(prev => prev.filter(video => video.id !== videoId))
      setGdriveFiles(prev =>
        prev.map(file =>
          file.gdrive_file_id === movie.gdrive_file_id
            ? {
                ...file,
                in_database: false,
                video_id: null,
              }
            : file
        )
      )
    } catch (error) {
      alert("Failed to delete Google Drive video: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setDeletingIds(prev => prev.filter(id => id !== videoId))
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return
    }

    try {
      await videosApi.delete(videoId)
      setVideos(prev => prev.filter(v => v.id !== videoId))
    } catch (error) {
      alert("Failed to delete video: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "ready": return "text-brand-cyan-light bg-green-400/20"
      case "processing": return "text-brand-orange-light bg-yellow-400/20"
      case "pending": return "text-brand-blue-light bg-blue-400/20"
      case "failed": return "text-brand-coral-light bg-red-400/20"
      default: return "text-white/60 bg-white/10"
    }
  }

  const formatFileSize = (bytes?: number | string) => {
    if (!bytes) return "Unknown size"
    const units = ['B', 'KB', 'MB', 'GB']
    let size = typeof bytes === "string" ? Number.parseFloat(bytes) : bytes
    if (!Number.isFinite(size)) return "Unknown size"
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "Unknown"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-blue-600/20 to-brand-purple/20 rounded-3xl blur-3xl opacity-60"></div>
        <div className="glass-panel relative rounded-3xl p-8 border-brand-cyan/30">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-navy">
                  <span className="gradient-text">Media Library</span>
                </h1>
                <div className="flex items-center gap-2 px-3 py-1 bg-brand-cyan/10 rounded-full border border-brand-cyan/20">
                  <div className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse"></div>
                  <span className="text-brand-cyan-dark text-xs sm:text-sm font-bold">{videos.length} Videos</span>
                </div>
              </div>
              <p className="text-brand-navy/70 text-base sm:text-lg font-medium">Build your personal cinema collection with unlimited storage</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-brand-navy/50 font-medium">
                <span>🎬 All Formats</span>
                <span>•</span>
                <span>☁️ Cloud Storage</span>
                <span>•</span>
                <span>🔒 Private & Secure</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex gap-1 bg-white/50 p-1 rounded-xl border border-brand-navy/5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid" ? "bg-brand-navy text-white shadow-md" : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
                  }`}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list" ? "bg-brand-navy text-white shadow-md" : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
                  }`}
                >
                  ☰
                </button>
              </div>
              <IconButton
                onClick={() => setUploadMode("file")}
                className="btn-gradient shadow-lg hover:shadow-brand-cyan/25 border-none"
              >
                <span>📤</span>
                <span className="hidden sm:inline">Upload</span>
              </IconButton>
              <IconButton
                onClick={() => setUploadMode("gdrive")}
                variant="secondary"
                className="bg-white hover:bg-brand-orange/10 hover:text-brand-orange border-brand-navy/10"
              >
                <span>☁️</span>
                <span className="hidden sm:inline">Google Drive</span>
              </IconButton>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Upload Section */}
      {uploadMode && (
        <div className="glass-card rounded-3xl p-6 border-brand-navy/10 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-brand-navy flex items-center gap-3">
                <span>📤</span>
                Add New Content
              </h2>
              <button
                onClick={() => setUploadMode(null)}
                className="p-2 text-brand-navy/40 hover:text-brand-navy transition-colors rounded-full hover:bg-brand-navy/5"
              >
                ✕
              </button>
            </div>
            
            {/* Upload Mode Tabs */}
            <div className="flex gap-2 bg-brand-navy/5 p-1 rounded-xl w-fit">
              <button
                onClick={() => setUploadMode("file")}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  uploadMode === "file" ? "bg-white text-brand-navy shadow-sm" : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
                }`}
              >
                📁 Upload File
              </button>
              <button
                onClick={() => setUploadMode("url")}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  uploadMode === "url" ? "bg-white text-brand-navy shadow-sm" : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
                }`}
              >
                🔗 Add URL
              </button>
              <button
                onClick={() => setUploadMode("gdrive")}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  uploadMode === "gdrive" ? "bg-white text-brand-navy shadow-sm" : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
                }`}
              >
                ☁️ Google Drive
              </button>
            </div>

            {uploadMode === "file" ? (
              <div className="border-2 border-dashed border-brand-cyan/30 rounded-2xl p-12 text-center bg-brand-cyan/5 hover:bg-brand-cyan/10 transition-colors group cursor-pointer">
                <div className="space-y-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-cyan to-brand-blue rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-brand-cyan/20 group-hover:scale-110 transition-transform duration-300">
                    📁
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-brand-navy mb-2">Drop your video here</h3>
                    <p className="text-brand-navy/60 mb-6 font-medium">Or click to browse files • MP4, MOV, AVI, MKV supported</p>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`inline-block px-8 py-4 rounded-xl font-bold transition-all cursor-pointer ${
                      uploading
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-brand-navy text-white hover:bg-brand-navy-light shadow-lg hover:shadow-brand-navy/20 hover:-translate-y-0.5"
                    }`}
                  >
                    {uploading ? (
                      <span className="flex items-center gap-2">
                        <div className="loading-reel w-5 h-5 border-white/30 border-t-white"></div>
                        Uploading...
                      </span>
                    ) : (
                      "Choose Video File"
                    )}
                  </label>
                </div>
              </div>
            ) : uploadMode === "url" ? (
              <form onSubmit={handleUrlSubmit} className="space-y-4 max-w-2xl mx-auto">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="title"
                    placeholder="Video title"
                    required
                    disabled={uploading}
                    className="px-4 py-3 bg-white border border-brand-navy/10 rounded-xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue/30 transition-all"
                  />
                  <input
                    type="url"
                    name="url"
                    placeholder="Video URL (YouTube, Vimeo, etc.)"
                    required
                    disabled={uploading}
                    className="px-4 py-3 bg-white border border-brand-navy/10 rounded-xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue/30 transition-all"
                  />
                </div>
                <IconButton
                  type="submit"
                  disabled={uploading}
                  loading={uploading}
                  className="w-full btn-gradient shadow-lg hover:shadow-brand-blue/25"
                >
                  <span>🌐</span>
                  Add Video from URL
                </IconButton>
              </form>
            ) : uploadMode === "gdrive" ? (
              <div className="space-y-6">
                {/* Connection Success Notice */}
                {connectionNotice && (
                  <div className="bg-brand-cyan/10 border border-brand-cyan/20 rounded-2xl p-4 flex items-center gap-3">
                    <div className="text-xl">✅</div>
                    <div className="flex-1">
                      <p className="text-brand-cyan-dark font-bold">{connectionNotice}</p>
                    </div>
                    <button
                      onClick={() => setConnectionNotice(null)}
                      className="text-brand-cyan/60 hover:text-brand-cyan transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-brand-navy flex items-center gap-2">
                      <span>☁️</span>
                      Browse Google Drive Library
                    </h3>
                    <p className="text-brand-navy/60 text-sm font-medium">
                      Import videos stored in your connected Google Drive account directly into Watch Party.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {gdriveConnected !== false && (
                      <IconButton
                        onClick={() => loadGdriveVideos(true)}
                        variant="secondary"
                        disabled={gdriveLoading}
                        className="bg-white hover:bg-brand-neutral"
                      >
                        🔄 Refresh
                      </IconButton>
                    )}
                  </div>
                </div>

                {gdriveError && gdriveConnected !== false && (
                  <div className="bg-brand-coral/5 border border-brand-coral/20 rounded-2xl p-4 flex items-center gap-3">
                    <div className="text-xl">⚠️</div>
                    <div>
                      <p className="text-brand-coral-dark font-bold">{gdriveError}</p>
                      <button
                        onClick={() => loadGdriveVideos(true)}
                        className="mt-1 text-brand-coral hover:text-brand-coral-dark underline text-sm font-medium"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                )}

                {/* Not Connected State - Show Connect Button */}
                {gdriveConnected === false && !gdriveLoading && (
                  <div className="text-center bg-gradient-to-br from-brand-blue/5 to-brand-purple/5 border border-brand-blue/20 rounded-2xl py-12 px-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-blue to-brand-purple rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-brand-blue/20 mb-6">
                      <img 
                        src="https://www.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png" 
                        alt="Google Drive" 
                        className="w-12 h-12"
                      />
                    </div>
                    <h4 className="text-2xl font-bold text-brand-navy mb-3">Connect Google Drive</h4>
                    <p className="text-brand-navy/60 mb-6 max-w-md mx-auto">
                      Link your Google Drive to import videos directly. Watch movies stored in your cloud without downloading.
                    </p>
                    <div className="space-y-3">
                      <IconButton
                        onClick={handleConnectGoogleDrive}
                        loading={gdriveConnecting}
                        disabled={gdriveConnecting}
                        className="btn-gradient shadow-lg hover:shadow-brand-blue/25 px-8 py-3"
                      >
                        <span>🔗</span>
                        {gdriveConnecting ? "Connecting..." : "Connect Google Drive"}
                      </IconButton>
                      <p className="text-xs text-brand-navy/40">
                        You&apos;ll be redirected to Google to authorize access
                      </p>
                    </div>
                    {gdriveError && (
                      <div className="mt-4 text-sm text-brand-coral-dark bg-brand-coral/10 rounded-lg px-4 py-2 inline-block">
                        {gdriveError}
                      </div>
                    )}
                  </div>
                )}

                {/* Loading State */}
                {gdriveLoading ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white/40 border border-white/50 rounded-2xl p-4 animate-pulse space-y-4">
                        <div className="aspect-video bg-brand-navy/5 rounded-xl"></div>
                        <div className="h-4 bg-brand-navy/5 rounded w-3/4"></div>
                        <div className="h-3 bg-brand-navy/5 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : gdriveConnected !== false && gdriveFiles.length === 0 ? (
                  <div className="text-center text-brand-navy/60 bg-brand-navy/5 border border-brand-navy/10 rounded-2xl py-12">
                    <div className="text-4xl mb-3">📁</div>
                    <p className="font-bold text-lg">No compatible videos found</p>
                    <p className="text-sm mt-1">Upload a video to your Watch Party folder in Drive and refresh to see it here.</p>
                    <IconButton
                      onClick={() => loadGdriveVideos(true)}
                      variant="secondary"
                      disabled={gdriveLoading}
                      className="mt-4 bg-white hover:bg-brand-neutral"
                    >
                      🔄 Refresh
                    </IconButton>
                  </div>
                ) : gdriveConnected !== false ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {gdriveFiles.map((movie) => (
                      <div
                        key={movie.gdrive_file_id}
                        className="bg-white/60 border border-white/60 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="aspect-video bg-brand-navy/5 flex items-center justify-center relative group">
                          {movie.thumbnail_url ? (
                            <img
                              src={movie.thumbnail_url}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-4xl">🎞️</div>
                          )}
                          {movie.duration && (
                            <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-bold">
                              {formatDuration(movie.duration)}
                            </span>
                          )}
                          {movie.in_database && (
                            <span className="absolute top-2 right-2 bg-green-500/90 backdrop-blur-md text-white text-xs px-2 py-1 rounded-lg font-bold shadow-sm">
                              Imported
                            </span>
                          )}
                        </div>
                        <div className="p-4 space-y-3 flex-1 flex flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-lg font-bold text-brand-navy line-clamp-2">{movie.title}</h4>
                          </div>
                          <div className="text-xs text-brand-navy/60 space-y-1 font-medium">
                            {movie.size && <div>Size: {formatFileSize(movie.size)}</div>}
                            {movie.duration && <div>Duration: {formatDuration(movie.duration)}</div>}
                            {movie.modified_time && (
                              <div>Updated: {new Date(movie.modified_time).toLocaleDateString()}</div>
                            )}
                            {movie.resolution && <div>Resolution: {movie.resolution}</div>}
                          </div>
                          <div className="mt-auto flex flex-wrap gap-2 pt-2">
                            {movie.in_database && movie.video_id ? (
                              <>
                                <IconButton
                                  onClick={() => handleStreamGDriveVideo(movie.video_id!)}
                                  loading={streamingIds.includes(movie.video_id!)}
                                  className="flex-1 bg-brand-navy text-white hover:bg-brand-navy-light"
                                >
                                  ▶️ Stream
                                </IconButton>
                                <IconButton
                                  onClick={() => handleDeleteGDriveVideo(movie.video_id!, movie)}
                                  loading={deletingIds.includes(movie.video_id!)}
                                  variant="danger"
                                  className="flex-1"
                                >
                                  🗑️ Delete
                                </IconButton>
                              </>
                            ) : (
                              <IconButton
                                onClick={() => handleImportFromGDrive(movie)}
                                loading={importingIds.includes(movie.gdrive_file_id)}
                                className="w-full btn-gradient"
                              >
                                📥 Import to Library
                              </IconButton>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Enhanced Search and Filters */}
      <div className="glass-card rounded-3xl p-6">
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-brand-navy/40 group-focus-within:text-brand-purple transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your video library..."
                className="w-full pl-12 sm:pl-14 pr-6 py-3 sm:py-4 text-base bg-white/50 border border-brand-navy/10 rounded-2xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple/30 focus:bg-white transition-all"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All Videos", icon: "📹", count: videos.length },
                { key: "ready", label: "Ready", icon: "✅", count: videos.filter(v => v.upload_status === "ready").length },
                { key: "processing", label: "Processing", icon: "⚡", count: videos.filter(v => v.upload_status === "processing").length },
                { key: "failed", label: "Failed", icon: "❌", count: videos.filter(v => v.upload_status === "failed").length },
              ].map(({ key, label, icon, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-3 rounded-xl font-bold transition-all duration-300 min-h-[44px] text-sm sm:text-base ${
                    filter === key
                      ? "bg-brand-navy text-white shadow-lg sm:scale-105"
                      : "bg-white/50 text-brand-navy/60 hover:bg-white hover:text-brand-navy sm:hover:scale-105 border border-brand-navy/5"
                  }`}
                >
                  <span>{icon}</span>
                  <span className="hidden sm:inline">{label}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    filter === key ? "bg-white/20 text-white" : "bg-brand-navy/5 text-brand-navy/40"
                  }`}>{count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-card border-brand-coral/30 bg-brand-coral/5 rounded-2xl p-6 flex items-center gap-4">
          <div className="text-3xl">⚠️</div>
          <div>
            <p className="text-brand-coral-dark font-bold">{error}</p>
            <button
              onClick={loadVideos}
              className="mt-1 text-brand-coral hover:text-brand-coral-dark underline text-sm font-medium"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card rounded-3xl p-6 animate-pulse">
              <div className="h-32 bg-brand-navy/5 rounded-2xl mb-4"></div>
              <div className="h-4 bg-brand-navy/5 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-brand-navy/5 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Videos Grid */}
      {!loading && videos.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="glass-card group rounded-3xl overflow-hidden hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-brand-navy/5 flex items-center justify-center relative overflow-hidden">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-6xl animate-float">🎬</div>
                )}
                
                {video.upload_status && (
                  <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-lg font-bold backdrop-blur-md shadow-sm ${getStatusColor(video.upload_status)}`}>
                    {video.upload_status}
                  </span>
                )}
                
                {video.duration && (
                  <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-bold">
                    {formatDuration(video.duration)}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <h3 className="text-lg font-bold text-brand-navy line-clamp-2 group-hover:text-brand-purple transition-colors">
                  {video.title}
                </h3>

                {video.description && (
                  <p className="text-brand-navy/60 text-sm line-clamp-2 font-medium">
                    {video.description}
                  </p>
                )}

                <div className="space-y-1 text-xs text-brand-navy/50 font-medium">
                  {video.source_type && (
                    <div>Source: {video.source_type}</div>
                  )}
                  {video.file_size && (
                    <div>Size: {formatFileSize(video.file_size)}</div>
                  )}
                  <div>Added: {new Date(video.created_at).toLocaleDateString()}</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {video.upload_status === "ready" && (
                    <Link
                      href={`/dashboard/videos/${video.id}/preview`}
                      className="flex-1 bg-brand-navy hover:bg-brand-navy-light text-white py-2.5 px-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-navy/20 text-center"
                    >
                      Preview
                    </Link>
                  )}
                  
                  <Link
                    href={`/dashboard/videos/${video.id}/edit`}
                    className="px-3 py-2 bg-white hover:bg-brand-purple/10 text-brand-navy hover:text-brand-purple border border-brand-navy/10 rounded-xl transition-colors text-sm flex items-center justify-center"
                    title="Edit Video"
                  >
                    ✏️
                  </Link>
                  
                  <button
                    onClick={() => handleDeleteVideo(video.id)}
                    className="px-3 py-2 bg-white hover:bg-red-50 text-brand-coral hover:text-red-600 border border-brand-navy/10 rounded-xl transition-colors text-sm flex items-center justify-center"
                    title="Delete Video"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && videos.length === 0 && (
        <div className="glass-card rounded-3xl text-center py-20 px-6">
          <div className="space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-brand-purple to-brand-blue rounded-3xl flex items-center justify-center text-5xl shadow-2xl shadow-brand-purple/20 animate-float">
              🎬
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-bold text-brand-navy">
                {searchQuery ? "No videos found" : "No videos yet"}
              </h3>
              <p className="text-brand-navy/60 max-w-md mx-auto text-lg leading-relaxed">
                {searchQuery 
                  ? `No videos match "${searchQuery}". Try a different search term.`
                  : "Upload your first video or add a streaming URL to get started!"
                }
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center gap-2 bg-white hover:bg-brand-neutral text-brand-navy px-6 py-3 rounded-xl font-bold transition-all shadow-sm border border-brand-navy/10"
              >
                <span>🔄</span>
                Clear Search
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}