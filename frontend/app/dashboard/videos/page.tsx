"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { videosApi, VideoSummary } from "@/lib/api-client"
import { GradientCard } from "@/components/ui/gradient-card"
import { IconButton } from "@/components/ui/icon-button"
import { useDesignSystem } from "@/hooks/use-design-system"

export default function VideosPage() {
  const router = useRouter()
  const { formatNumber } = useDesignSystem()
  const [videos, setVideos] = useState<VideoSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "ready" | "processing" | "failed">("all")
  const [uploading, setUploading] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [uploadMode, setUploadMode] = useState<"file" | "url" | null>(null)

  useEffect(() => {
    loadVideos()
  }, [filter, searchQuery])

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
      case "ready": return "text-green-400 bg-green-400/20"
      case "processing": return "text-yellow-400 bg-yellow-400/20"
      case "pending": return "text-blue-400 bg-blue-400/20"
      case "failed": return "text-red-400 bg-red-400/20"
      default: return "text-white/60 bg-white/10"
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size"
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
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
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-blue-600/20 to-purple-600/20 rounded-3xl blur-xl"></div>
        <GradientCard className="relative border-green-500/30">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-green-200 to-blue-200 bg-clip-text text-transparent">
                  📹 Media Library
                </h1>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">{videos.length} Videos</span>
                </div>
              </div>
              <p className="text-white/80 text-lg">Build your personal cinema collection with unlimited storage</p>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>🎬 All Formats</span>
                <span>•</span>
                <span>☁️ Cloud Storage</span>
                <span>•</span>
                <span>🔒 Private & Secure</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex gap-1 bg-black/20 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  ☰
                </button>
              </div>
              <IconButton
                onClick={() => setUploadMode("file")}
                gradient="from-green-600 to-emerald-600"
                className="shadow-lg hover:shadow-green-500/25"
              >
                <span>📤</span>
                <span className="hidden sm:inline">Upload</span>
              </IconButton>
            </div>
          </div>
        </GradientCard>
      </div>

      {/* Enhanced Upload Section */}
      {uploadMode && (
        <GradientCard gradient="from-emerald-900/30 via-green-800/20 to-blue-900/30" className="border-green-500/30">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span>📤</span>
                Add New Content
              </h2>
              <button
                onClick={() => setUploadMode(null)}
                className="p-2 text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Upload Mode Tabs */}
            <div className="flex gap-2 bg-black/20 p-1 rounded-xl w-fit">
              <button
                onClick={() => setUploadMode("file")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  uploadMode === "file" ? "bg-green-600 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                📁 Upload File
              </button>
              <button
                onClick={() => setUploadMode("url")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  uploadMode === "url" ? "bg-blue-600 text-white" : "text-white/60 hover:text-white"
                }`}
              >
                🔗 Add URL
              </button>
            </div>
            
            {uploadMode === "file" ? (
              <div className="border-2 border-dashed border-green-500/30 rounded-2xl p-8 text-center bg-green-500/5 hover:bg-green-500/10 transition-colors">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl animate-float">
                    📁
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Drop your video here</h3>
                    <p className="text-white/70 mb-4">Or click to browse files • MP4, MOV, AVI, MKV supported</p>
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
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-green-500/25 hover:scale-105"
                    }`}
                  >
                    {uploading ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Uploading...
                      </span>
                    ) : (
                      "Choose Video File"
                    )}
                  </label>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="title"
                    placeholder="Video title"
                    required
                    disabled={uploading}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm"
                  />
                  <input
                    type="url"
                    name="url"
                    placeholder="Video URL (YouTube, Vimeo, etc.)"
                    required
                    disabled={uploading}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 backdrop-blur-sm"
                  />
                </div>
                <IconButton
                  type="submit"
                  disabled={uploading}
                  loading={uploading}
                  gradient="from-blue-600 to-cyan-600"
                  className="w-full shadow-lg hover:shadow-blue-500/25"
                >
                  <span>🌐</span>
                  Add Video from URL
                </IconButton>
              </form>
            )}
          </div>
        </GradientCard>
      )}

      {/* Enhanced Search and Filters */}
      <GradientCard gradient="from-slate-900/50 via-blue-900/30 to-slate-900/50">
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-white/50 text-xl">🔍</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your video library..."
                className="w-full pl-14 pr-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all"
              />
            </div>
            
            <div className="flex gap-2">
              {[
                { key: "all", label: "All Videos", icon: "📹", count: videos.length },
                { key: "ready", label: "Ready", icon: "✅", count: videos.filter(v => v.upload_status === "ready").length },
                { key: "processing", label: "Processing", icon: "⚡", count: videos.filter(v => v.upload_status === "processing").length },
                { key: "failed", label: "Failed", icon: "❌", count: videos.filter(v => v.upload_status === "failed").length },
              ].map(({ key, label, icon, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    filter === key
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105"
                      : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white hover:scale-105"
                  }`}
                >
                  <span>{icon}</span>
                  <span className="hidden sm:inline">{label}</span>
                  <span className="bg-white/20 text-xs px-2 py-1 rounded-full">{count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </GradientCard>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadVideos}
            className="mt-2 text-red-300 hover:text-red-200 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-6 animate-pulse">
              <div className="h-32 bg-white/20 rounded mb-3"></div>
              <div className="h-4 bg-white/20 rounded mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Videos Grid */}
      {!loading && videos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition-colors"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-black/50 flex items-center justify-center relative">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl">🎬</div>
                )}
                
                {video.upload_status && (
                  <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-full ${getStatusColor(video.upload_status)}`}>
                    {video.upload_status}
                  </span>
                )}
                
                {video.duration && (
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                    {formatDuration(video.duration)}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <h3 className="text-lg font-semibold text-white line-clamp-2">
                  {video.title}
                </h3>

                {video.description && (
                  <p className="text-white/70 text-sm line-clamp-2">
                    {video.description}
                  </p>
                )}

                <div className="space-y-1 text-xs text-white/60">
                  {video.source_type && (
                    <div>Source: {video.source_type}</div>
                  )}
                  {video.file_size && (
                    <div>Size: {formatFileSize(video.file_size)}</div>
                  )}
                  <div>Added: {new Date(video.created_at).toLocaleDateString()}</div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {video.upload_status === "ready" && (
                    <Link
                      href={`/dashboard/videos/${video.id}/preview`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors text-center"
                    >
                      Preview
                    </Link>
                  )}
                  
                  <Link
                    href={`/dashboard/videos/${video.id}/edit`}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                    title="Edit Video"
                  >
                    ✏️
                  </Link>
                  
                  <button
                    onClick={() => handleDeleteVideo(video.id)}
                    className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm"
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
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery ? "No videos found" : "No videos yet"}
          </h3>
          <p className="text-white/70 mb-6">
            {searchQuery 
              ? `No videos match "${searchQuery}". Try a different search term.`
              : "Upload your first video or add a streaming URL to get started!"
            }
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mr-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  )
}