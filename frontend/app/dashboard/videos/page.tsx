"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { videosApi, VideoSummary } from "@/lib/api-client"

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

type UploadMode = "file" | "url" | "gdrive" | null
type ViewMode = "grid" | "list"
type VideoFilter = "all" | "ready" | "processing" | "failed"

export default function VideosPage() {
  const searchParams = useSearchParams()
  
  // State
  const [videos, setVideos] = useState<VideoSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<VideoFilter>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [uploadMode, setUploadMode] = useState<UploadMode>(null)
  const [uploading, setUploading] = useState(false)
  
  // Google Drive state
  const [gdriveFiles, setGdriveFiles] = useState<GDriveMovie[]>([])
  const [gdriveLoading, setGdriveLoading] = useState(false)
  const [gdriveError, setGdriveError] = useState("")
  const [gdriveConnected, setGdriveConnected] = useState<boolean | null>(null)
  const [importingIds, setImportingIds] = useState<string[]>([])
  const [streamingIds, setStreamingIds] = useState<string[]>([])
  const [deletingIds, setDeletingIds] = useState<string[]>([])
  
  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Check OAuth callback
  useEffect(() => {
    if (searchParams.get("gdrive_connected") === "true") {
      showToast("Google Drive connected successfully!", "success")
      setGdriveConnected(true)
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

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadVideos = async () => {
    setLoading(true)
    setError("")
    try {
      const params: Record<string, string | number | undefined> = { page_size: 50 }
      if (filter !== "all") params.upload_status = filter
      if (searchQuery.trim()) {
        const response = await videosApi.search(searchQuery)
        setVideos(Array.isArray(response) ? response : response.results || [])
      } else {
        const response = await videosApi.list(params)
        setVideos(Array.isArray(response) ? response : response.results || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load videos")
    } finally {
      setLoading(false)
    }
  }

  const loadGdriveVideos = async (force = false) => {
    if (gdriveLoading) return
    setGdriveLoading(true)
    setGdriveError("")
    try {
      const response = await videosApi.getGDriveVideos({ page_size: 50 })
      const msg = (response as any)?.message
      if (msg === "Google Drive not connected") {
        setGdriveConnected(false)
        setGdriveFiles([])
        return
      }
      setGdriveConnected(true)
      const rawMovies = (response as any)?.movies ?? (response as any)?.results ?? (Array.isArray(response) ? response : [])
      const normalized: GDriveMovie[] = Array.isArray(rawMovies)
        ? rawMovies.map((m: any) => ({
            gdrive_file_id: m.gdrive_file_id ?? m.gdriveId ?? m.id ?? m.file_id,
            title: m.title ?? m.name ?? "Untitled",
            size: typeof m.size === "number" ? m.size : undefined,
            thumbnail_url: m.thumbnail_url ?? m.thumbnail,
            duration: typeof m.duration === "number" ? m.duration : undefined,
            resolution: m.resolution,
            modified_time: m.modified_time ?? m.modifiedAt,
            in_database: m.in_database ?? Boolean(m.video_id),
            video_id: m.video_id ?? null,
          })).filter((m: GDriveMovie) => m.gdrive_file_id)
        : []
      setGdriveFiles(normalized)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load"
      if (msg.toLowerCase().includes("not connected")) setGdriveConnected(false)
      setGdriveError(msg)
    } finally {
      setGdriveLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", file.name.replace(/\.[^/.]+$/, ""))
      formData.append("visibility", "private")
      const newVideo = await videosApi.create(formData)
      setVideos(prev => [newVideo, ...prev])
      showToast("Video uploaded successfully!", "success")
      e.target.value = ""
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Upload failed", "error")
    } finally {
      setUploading(false)
    }
  }

  const handleUrlSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formElement = e.currentTarget
    const form = new FormData(formElement)
    const url = form.get("url") as string
    const title = form.get("title") as string
    if (!url || !title) return
    setUploading(true)
    try {
      const validation = await videosApi.validateUrl(url)
      if (!validation.valid) throw new Error("Invalid URL")
      const newVideo = await videosApi.create({ title, source_type: "url", source_url: url, visibility: "private" })
      setVideos(prev => [newVideo, ...prev])
      showToast("Video added successfully!", "success")
      // Guard form reset with null check
      if (formElement) {
        formElement.reset()
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add video", "error")
    } finally {
      setUploading(false)
    }
  }

  const handleImport = async (movie: GDriveMovie) => {
    if (importingIds.includes(movie.gdrive_file_id)) return
    setImportingIds(prev => [...prev, movie.gdrive_file_id])
    try {
      const response = await videosApi.uploadFromGDrive(movie.gdrive_file_id)
      const imported = (response as any)?.video ?? response
      if (imported) {
        setVideos(prev => [imported, ...prev])
        setGdriveFiles(prev => prev.map(f => f.gdrive_file_id === movie.gdrive_file_id ? { ...f, in_database: true, video_id: imported.id } : f))
        showToast("Imported successfully!", "success")
      }
    } catch (err) {
      showToast("Import failed", "error")
    } finally {
      setImportingIds(prev => prev.filter(id => id !== movie.gdrive_file_id))
    }
  }

  const handleStream = async (videoId: string) => {
    if (streamingIds.includes(videoId)) return
    setStreamingIds(prev => [...prev, videoId])
    try {
      const response = await videosApi.getGDriveStream(videoId)
      const url = (response as any)?.stream_url ?? (response as any)?.url
      if (url) window.open(url, "_blank")
    } catch (err) {
      showToast("Failed to stream", "error")
    } finally {
      setStreamingIds(prev => prev.filter(id => id !== videoId))
    }
  }

  const handleDeleteGDrive = async (videoId: string, movie: GDriveMovie) => {
    if (!confirm("Delete this video from your library?")) return
    setDeletingIds(prev => [...prev, videoId])
    try {
      await videosApi.deleteGDriveVideo(videoId)
      setVideos(prev => prev.filter(v => v.id !== videoId))
      setGdriveFiles(prev => prev.map(f => f.gdrive_file_id === movie.gdrive_file_id ? { ...f, in_database: false, video_id: null } : f))
      showToast("Deleted successfully", "success")
    } catch (err) {
      showToast("Delete failed", "error")
    } finally {
      setDeletingIds(prev => prev.filter(id => id !== videoId))
    }
  }

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Delete this video permanently?")) return
    try {
      await videosApi.delete(id)
      setVideos(prev => prev.filter(v => v.id !== id))
      showToast("Video deleted", "success")
    } catch (err) {
      showToast("Delete failed", "error")
    }
  }

  const formatSize = (bytes?: number) => {
    if (!bytes) return ""
    const units = ["B", "KB", "MB", "GB"]
    let i = 0
    while (bytes >= 1024 && i < units.length - 1) { bytes /= 1024; i++ }
    return `${bytes.toFixed(1)} ${units[i]}`
  }

  const formatDuration = (secs?: number) => {
    if (!secs) return ""
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = Math.floor(secs % 60)
    return h > 0 ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}` : `${m}:${s.toString().padStart(2, "0")}`
  }

  const counts = {
    all: videos.length,
    ready: videos.filter(v => v.upload_status === "ready").length,
    processing: videos.filter(v => v.upload_status === "processing").length,
    failed: videos.filter(v => v.upload_status === "failed").length,
  }

  return (
    <div className="min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all animate-in slide-in-from-right ${
          toast.type === "success" 
            ? "bg-emerald-500/90 border-emerald-400/50 text-white" 
            : "bg-red-500/90 border-red-400/50 text-white"
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-xl">{toast.type === "success" ? "✓" : "✕"}</span>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[2rem] mb-8 bg-gradient-to-br from-brand-navy via-brand-purple to-brand-blue p-1">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none" />
        <div className="relative bg-brand-navy/80 backdrop-blur-xl rounded-[1.8rem] p-8 md:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-white/80 text-sm font-medium">{videos.length} videos in library</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Video <span className="bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-coral bg-clip-text text-transparent">Library</span>
              </h1>
              <p className="text-white/60 text-lg max-w-xl">
                Your personal cinema vault. Upload, organize, and stream your favorite content.
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setUploadMode(uploadMode === "file" ? null : "file")}
                className={`group flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                  uploadMode === "file"
                    ? "bg-white text-brand-navy shadow-xl shadow-white/20"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload
              </button>
              <button
                onClick={() => setUploadMode(uploadMode === "url" ? null : "url")}
                className={`group flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                  uploadMode === "url"
                    ? "bg-white text-brand-navy shadow-xl shadow-white/20"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Add URL
              </button>
              <button
                onClick={() => setUploadMode(uploadMode === "gdrive" ? null : "gdrive")}
                className={`group flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                  uploadMode === "gdrive"
                    ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-xl"
                    : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 19.5h7.8L12 15l2.2 4.5H22L12 2zm0 6l4.5 9h-9l4.5-9z"/>
                </svg>
                Google Drive
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Panel */}
      {uploadMode && (
        <div className="mb-8 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl shadow-brand-navy/10 border border-brand-navy/5 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-brand-navy/10">
              {[
                { id: "file", label: "Upload File", icon: "📁" },
                { id: "url", label: "Add URL", icon: "🔗" },
                { id: "gdrive", label: "Google Drive", icon: "☁️" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setUploadMode(tab.id as UploadMode)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-5 font-bold transition-all ${
                    uploadMode === tab.id
                      ? "bg-brand-navy text-white"
                      : "text-brand-navy/60 hover:bg-brand-navy/5"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
              <button
                onClick={() => setUploadMode(null)}
                className="px-6 text-brand-navy/40 hover:text-brand-navy transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {uploadMode === "file" && (
                <label className="block cursor-pointer">
                  <div className="border-3 border-dashed border-brand-cyan/40 rounded-2xl p-16 text-center hover:border-brand-cyan hover:bg-brand-cyan/5 transition-all group">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center text-white text-3xl shadow-lg shadow-brand-cyan/30 group-hover:scale-110 transition-transform">
                      {uploading ? (
                        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "📤"
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-brand-navy mb-2">
                      {uploading ? "Uploading..." : "Drop your video here"}
                    </h3>
                    <p className="text-brand-navy/60 mb-4">or click to browse • MP4, MOV, AVI, MKV</p>
                    <span className="inline-block px-6 py-3 bg-brand-navy text-white rounded-xl font-bold group-hover:bg-brand-purple transition-colors">
                      Select Video
                    </span>
                  </div>
                  <input type="file" accept="video/*" onChange={handleFileUpload} disabled={uploading} className="hidden" />
                </label>
              )}

              {uploadMode === "url" && (
                <form onSubmit={handleUrlSubmit} className="max-w-2xl mx-auto space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-blue flex items-center justify-center text-white text-2xl shadow-lg">
                      🔗
                    </div>
                    <h3 className="text-2xl font-bold text-brand-navy">Add from URL</h3>
                    <p className="text-brand-navy/60">YouTube, Vimeo, or direct video links</p>
                  </div>
                  <div className="space-y-4">
                    <input
                      name="title"
                      type="text"
                      placeholder="Video title"
                      required
                      className="w-full px-6 py-4 bg-brand-navy/5 border-2 border-transparent rounded-xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:border-brand-purple focus:bg-white transition-all text-lg"
                    />
                    <input
                      name="url"
                      type="url"
                      placeholder="https://..."
                      required
                      className="w-full px-6 py-4 bg-brand-navy/5 border-2 border-transparent rounded-xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:border-brand-purple focus:bg-white transition-all text-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full py-4 bg-gradient-to-r from-brand-purple to-brand-blue text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-brand-purple/30 transition-all disabled:opacity-50"
                  >
                    {uploading ? "Adding..." : "Add Video"}
                  </button>
                </form>
              )}

              {uploadMode === "gdrive" && (
                <div className="space-y-6">
                  {gdriveLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="w-16 h-16 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin mb-4" />
                      <p className="text-brand-navy/60 font-medium">Loading your Drive...</p>
                    </div>
                  ) : gdriveConnected === false ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-2xl">
                        <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2L2 19.5h7.8L12 15l2.2 4.5H22L12 2zm0 6l4.5 9h-9l4.5-9z"/>
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-brand-navy mb-3">Connect Google Drive</h3>
                      <p className="text-brand-navy/60 max-w-md mx-auto mb-6">
                        Link your Google Drive to import and stream videos directly from your cloud storage.
                      </p>
                      <div className="bg-brand-blue/10 border border-brand-blue/30 rounded-xl p-4 max-w-lg mx-auto mb-8">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl flex-shrink-0">💡</span>
                          <div className="text-left">
                            <p className="text-brand-navy font-bold mb-2">How it works:</p>
                            <p className="text-brand-navy/70 text-sm">
                              After connecting, use your Google Drive app to move movies into the <span className="font-mono bg-brand-navy/10 px-2 py-0.5 rounded">Watch Party</span> folder. Videos in this folder will appear here for import.
                            </p>
                          </div>
                        </div>
                      </div>
                      <Link
                        href="/dashboard/integrations"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all"
                      >
                        Connect Now
                        <span>→</span>
                      </Link>
                    </div>
                  ) : gdriveFiles.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">📂</div>
                      <h3 className="text-xl font-bold text-brand-navy mb-2">No videos found</h3>
                      <p className="text-brand-navy/60 mb-6">Upload videos to your Watch Party folder in Google Drive</p>
                      <button onClick={() => loadGdriveVideos(true)} className="px-6 py-3 bg-brand-navy/10 text-brand-navy rounded-xl font-bold hover:bg-brand-navy/20 transition-colors">
                        Refresh
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-brand-navy">Your Google Drive Videos</h3>
                        <button onClick={() => loadGdriveVideos(true)} className="px-4 py-2 text-brand-navy/60 hover:text-brand-navy font-medium transition-colors">
                          🔄 Refresh
                        </button>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {gdriveFiles.map(movie => (
                          <div key={movie.gdrive_file_id} className="group bg-brand-navy/5 rounded-2xl overflow-hidden hover:bg-brand-navy/10 transition-all">
                            <div className="aspect-video bg-brand-navy/10 relative">
                              {movie.thumbnail_url ? (
                                <img src={movie.thumbnail_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-4xl">🎬</div>
                              )}
                              {movie.duration && (
                                <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded-lg font-mono">
                                  {formatDuration(movie.duration)}
                                </span>
                              )}
                              {!movie.duration && movie.in_database && (
                                <span className="absolute bottom-2 right-2 px-2 py-1 bg-amber-500/90 text-white text-xs rounded-lg font-bold animate-pulse">
                                  Processing...
                                </span>
                              )}
                              {movie.in_database && (
                                <span className="absolute top-2 left-2 px-2 py-1 bg-emerald-500 text-white text-xs rounded-lg font-bold">
                                  ✓ Imported
                                </span>
                              )}
                            </div>
                            <div className="p-4">
                              <h4 className="font-bold text-brand-navy truncate mb-2">{movie.title}</h4>
                              <div className="flex gap-2">
                                {movie.in_database && movie.video_id ? (
                                  <>
                                    <button
                                      onClick={() => handleStream(movie.video_id!)}
                                      disabled={streamingIds.includes(movie.video_id)}
                                      aria-label="Stream imported video"
                                      className="flex-1 py-2 bg-brand-navy text-white rounded-lg text-sm font-bold hover:bg-brand-purple transition-colors disabled:opacity-50"
                                    >
                                      ▶ Play
                                    </button>
                                    <button
                                      onClick={() => handleDeleteGDrive(movie.video_id!, movie)}
                                      disabled={deletingIds.includes(movie.video_id)}
                                      aria-label="Delete imported video"
                                      className="px-3 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm font-bold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                    >
                                      🗑
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleImport(movie)}
                                    disabled={importingIds.includes(movie.gdrive_file_id)}
                                    aria-label="Import Google Drive video"
                                    className="w-full py-2 bg-gradient-to-r from-brand-cyan to-brand-blue text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50"
                                  >
                                    {importingIds.includes(movie.gdrive_file_id) ? "Importing..." : "📥 Import"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-2xl shadow-lg shadow-brand-navy/5 border border-brand-navy/5 p-4 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="w-full pl-12 pr-4 py-3 bg-brand-navy/5 rounded-xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-2 focus:ring-brand-purple/30 transition-all"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {(["all", "ready", "processing", "failed"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                  filter === f
                    ? "bg-brand-navy text-white shadow-lg"
                    : "bg-brand-navy/5 text-brand-navy/60 hover:bg-brand-navy/10"
                }`}
              >
                <span>{f === "all" ? "📹" : f === "ready" ? "✅" : f === "processing" ? "⏳" : "❌"}</span>
                <span className="capitalize">{f}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  filter === f ? "bg-white/20" : "bg-brand-navy/10"
                }`}>
                  {counts[f]}
                </span>
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex gap-1 bg-brand-navy/5 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-3 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow text-brand-navy" : "text-brand-navy/40"}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-3 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow text-brand-navy" : "text-brand-navy/40"}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4">
          <span className="text-3xl">⚠️</span>
          <div>
            <p className="font-bold text-red-700">{error}</p>
            <button onClick={loadVideos} className="text-red-600 hover:text-red-800 underline text-sm">Try again</button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={`grid gap-6 ${viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : ""}`}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
              <div className="aspect-video bg-brand-navy/10" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-brand-navy/10 rounded w-3/4" />
                <div className="h-4 bg-brand-navy/5 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Videos Grid */}
      {!loading && videos.length > 0 && (
        <div className={`grid gap-6 ${viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : ""}`}>
          {videos.map(video => (
            <div key={video.id} className={`group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all ${viewMode === "list" ? "flex" : ""}`}>
              {/* Thumbnail */}
              <div className={`relative bg-brand-navy/5 ${viewMode === "list" ? "w-48 flex-shrink-0" : "aspect-video"}`}>
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl opacity-30">🎬</span>
                  </div>
                )}
                
                {/* Status Badge */}
                {video.upload_status && (
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur ${
                    video.upload_status === "ready" ? "bg-emerald-500/90 text-white" :
                    video.upload_status === "processing" ? "bg-amber-500/90 text-white" :
                    video.upload_status === "failed" ? "bg-red-500/90 text-white" :
                    "bg-white/80 text-brand-navy"
                  }`}>
                    {video.upload_status}
                  </span>
                )}
                
                {/* Duration */}
                <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded font-mono backdrop-blur">
                  {video.is_processing ? (
                    <span className="text-amber-300 animate-pulse">Processing...</span>
                  ) : (
                    video.duration_formatted || video.duration ? formatDuration(video.duration) : '--:--'
                  )}
                </span>
                
                {/* Play Overlay */}
                {video.upload_status === "ready" && (
                  <Link
                    href={`/dashboard/videos/${video.id}/preview`}
                    className="absolute inset-0 flex items-center justify-center bg-brand-navy/0 group-hover:bg-brand-navy/50 transition-all"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-xl">
                      <svg className="w-7 h-7 text-brand-navy ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </Link>
                )}
              </div>

              {/* Content */}
              <div className={`p-4 ${viewMode === "list" ? "flex-1 flex flex-col" : ""}`}>
                <h3 className="font-bold text-brand-navy line-clamp-2 mb-2 group-hover:text-brand-purple transition-colors">
                  {video.title}
                </h3>
                
                {video.description && (
                  <p className="text-brand-navy/60 text-sm line-clamp-2 mb-3">{video.description}</p>
                )}
                
                <div className="text-xs text-brand-navy/40 space-y-1 mt-auto">
                  {video.file_size && <div>📁 {formatSize(video.file_size)}</div>}
                  <div>📅 {new Date(video.created_at).toLocaleDateString()}</div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-brand-navy/10">
                  {video.upload_status === "ready" && (
                    <Link
                      href={`/dashboard/videos/${video.id}/preview`}
                      className="flex-1 py-2 bg-brand-navy text-white text-center rounded-lg text-sm font-bold hover:bg-brand-purple transition-colors"
                    >
                      Preview
                    </Link>
                  )}
                  <Link
                    href={`/dashboard/videos/${video.id}/edit`}
                    className="px-3 py-2 bg-brand-navy/5 text-brand-navy rounded-lg text-sm hover:bg-brand-navy/10 transition-colors"
                    title="Edit video"
                  >
                    ✏️
                  </Link>
                  <button
                    onClick={() => handleDeleteVideo(video.id)}
                    className="px-3 py-2 bg-red-50 text-red-500 rounded-lg text-sm hover:bg-red-100 transition-colors"
                    title="Delete video"
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
        <div className="text-center py-24">
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-brand-purple/20 to-brand-blue/20 flex items-center justify-center">
            <span className="text-6xl">🎬</span>
          </div>
          <h2 className="text-3xl font-bold text-brand-navy mb-4">
            {searchQuery ? "No videos found" : "Your library is empty"}
          </h2>
          <p className="text-brand-navy/60 max-w-md mx-auto mb-8">
            {searchQuery
              ? `No videos match "${searchQuery}"`
              : "Upload your first video or import from Google Drive to get started."}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="px-6 py-3 bg-brand-navy/10 text-brand-navy rounded-xl font-bold hover:bg-brand-navy/20 transition-colors"
            >
              Clear Search
            </button>
          ) : (
            <button
              onClick={() => setUploadMode("file")}
              className="px-8 py-4 bg-gradient-to-r from-brand-purple to-brand-blue text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-brand-purple/30 transition-all"
            >
              Upload Your First Video
            </button>
          )}
        </div>
      )}
    </div>
  )
}
