"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { videosApi, VideoSummary } from "@/lib/api-client"

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "ready" | "processing" | "failed">("all")
  const [uploading, setUploading] = useState(false)

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Video Library</h1>
          <p className="text-white/70">Manage your uploaded videos and streaming links</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Add New Video</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Upload File</h3>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
              <div className="text-4xl mb-2">📁</div>
              <p className="text-white/70 mb-4">Drag and drop a video file or click to browse</p>
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
                className={`inline-block px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                  uploading
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {uploading ? "Uploading..." : "Choose File"}
              </label>
            </div>
          </div>

          {/* URL Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Add from URL</h3>
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Video title"
                required
                disabled={uploading}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="url"
                name="url"
                placeholder="Video URL (YouTube, Vimeo, etc.)"
                required
                disabled={uploading}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={uploading}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  uploading
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {uploading ? "Adding..." : "Add Video"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos by title or description..."
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: "all", label: "All" },
              { key: "ready", label: "Ready" },
              { key: "processing", label: "Processing" },
              { key: "failed", label: "Failed" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === key
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

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