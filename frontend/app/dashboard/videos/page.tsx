"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"

import { useVideos, GDriveMovie } from "@/hooks/useVideos"
import { IconButton } from "@/components/ui/icon-button"
import { VideoCard, UploadSection, VideoSearchFilter } from "@/components/video"

type UploadMode = "file" | "url" | "gdrive" | null
type ViewMode = "grid" | "list"

export default function VideosPage() {
  const searchParams = useSearchParams()
  
  // Use the custom hook for video management
  const {
    videos,
    loading,
    error,
    filter,
    searchQuery,
    gdriveFiles,
    gdriveLoading,
    gdriveError,
    gdriveConnected,
    uploading,
    importingIds,
    streamingIds,
    deletingIds,
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
    videoCounts,
  } = useVideos()

  // Local UI state
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [uploadMode, setUploadMode] = useState<UploadMode>(null)
  const [connectionNotice, setConnectionNotice] = useState<string | null>(null)

  // Check if we just connected to Google Drive (from OAuth callback)
  useEffect(() => {
    if (searchParams.get("gdrive_connected") === "true") {
      setConnectionNotice("🎉 Google Drive connected successfully! You can now import videos.")
      // Clear the URL parameter
      window.history.replaceState({}, "", "/dashboard/videos")
    }
  }, [searchParams])

  // Load Google Drive files when switching to gdrive mode
  useEffect(() => {
    if (uploadMode === "gdrive") {
      loadGdriveVideos()
    }
  }, [uploadMode, loadGdriveVideos])

  // Handlers
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await uploadFile(file)
      event.target.value = "" // Reset file input
    } catch (err) {
      alert("Upload failed: " + (err instanceof Error ? err.message : "Unknown error"))
    }
  }, [uploadFile])

  const handleUrlSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const url = formData.get("url") as string
    const title = formData.get("title") as string

    if (!url || !title) return

    try {
      await uploadFromUrl(title, url)
      event.currentTarget.reset()
    } catch (err) {
      alert("Failed to add video: " + (err instanceof Error ? err.message : "Unknown error"))
    }
  }, [uploadFromUrl])

  const handleImportFromGDrive = useCallback(async (movie: GDriveMovie) => {
    try {
      await importFromGDrive(movie)
    } catch (err) {
      alert("Failed to import from Google Drive: " + (err instanceof Error ? err.message : "Unknown error"))
    }
  }, [importFromGDrive])

  const handleStreamGDriveVideo = useCallback(async (videoId: string) => {
    try {
      await streamGDriveVideo(videoId)
    } catch (err) {
      alert("Failed to start streaming: " + (err instanceof Error ? err.message : "Unknown error"))
    }
  }, [streamGDriveVideo])

  const handleDeleteGDriveVideo = useCallback(async (videoId: string, movie: GDriveMovie) => {
    try {
      await deleteGDriveVideo(videoId, movie)
    } catch (err) {
      alert("Failed to delete Google Drive video: " + (err instanceof Error ? err.message : "Unknown error"))
    }
  }, [deleteGDriveVideo])

  const handleDeleteVideo = useCallback(async (videoId: string) => {
    try {
      await deleteVideo(videoId)
    } catch (err) {
      alert("Failed to delete video: " + (err instanceof Error ? err.message : "Unknown error"))
    }
  }, [deleteVideo])

  const handleRefreshGdrive = useCallback(() => {
    loadGdriveVideos(true)
  }, [loadGdriveVideos])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        videoCount={videos.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onUploadClick={() => setUploadMode("file")}
        onGDriveClick={() => setUploadMode("gdrive")}
      />

      {/* Upload Section */}
      <UploadSection
        uploadMode={uploadMode}
        onModeChange={setUploadMode}
        uploading={uploading}
        onFileUpload={handleFileUpload}
        onUrlSubmit={handleUrlSubmit}
        gdriveConnected={gdriveConnected}
        gdriveLoading={gdriveLoading}
        gdriveError={gdriveError}
        gdriveFiles={gdriveFiles}
        connectionNotice={connectionNotice}
        onConnectionNoticeClose={() => setConnectionNotice(null)}
        onRefreshGdrive={handleRefreshGdrive}
        onImportFromGDrive={handleImportFromGDrive}
        onStreamGDriveVideo={handleStreamGDriveVideo}
        onDeleteGDriveVideo={handleDeleteGDriveVideo}
        importingIds={importingIds}
        streamingIds={streamingIds}
        deletingIds={deletingIds}
      />

      {/* Search and Filters */}
      <VideoSearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
        videoCounts={videoCounts}
      />

      {/* Error State */}
      {error && (
        <ErrorMessage message={error} onRetry={loadVideos} />
      )}

      {/* Loading State */}
      {loading && <LoadingSkeleton />}

      {/* Videos Grid */}
      {!loading && videos.length > 0 && (
        <section aria-label="Video library">
          <div className={`grid gap-6 ${viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onDelete={handleDeleteVideo}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {!loading && videos.length === 0 && (
        <EmptyState searchQuery={searchQuery} onClearSearch={() => setSearchQuery("")} />
      )}
    </div>
  )
}

// ============================================
// Sub-components
// ============================================

interface PageHeaderProps {
  videoCount: number
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  onUploadClick: () => void
  onGDriveClick: () => void
}

function PageHeader({ 
  videoCount, 
  viewMode, 
  onViewModeChange, 
  onUploadClick, 
  onGDriveClick 
}: PageHeaderProps) {
  return (
    <header className="relative">
      {/* Decorative background blur - CRITICAL: pointer-events-none prevents blocking clicks */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-blue-600/20 to-brand-purple/20 rounded-3xl blur-3xl opacity-60 pointer-events-none"
        aria-hidden="true"
      />
      
      <div className="glass-panel relative rounded-3xl p-8 border-brand-cyan/30">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-navy">
                <span className="gradient-text">Media Library</span>
              </h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-brand-cyan/10 rounded-full border border-brand-cyan/20">
                <div 
                  className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse" 
                  aria-hidden="true"
                />
                <span className="text-brand-cyan-dark text-xs sm:text-sm font-bold">
                  {videoCount} Videos
                </span>
              </div>
            </div>
            <p className="text-brand-navy/70 text-base sm:text-lg font-medium">
              Build your personal cinema collection with unlimited storage
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-brand-navy/50 font-medium">
              <span>🎬 All Formats</span>
              <span aria-hidden="true">•</span>
              <span>☁️ Cloud Storage</span>
              <span aria-hidden="true">•</span>
              <span>🔒 Private & Secure</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div 
              className="flex gap-1 bg-white/50 p-1 rounded-xl border border-brand-navy/5" 
              role="group" 
              aria-label="View mode"
            >
              <button
                onClick={() => onViewModeChange("grid")}
                className={`p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-brand-navy/30 ${
                  viewMode === "grid" 
                    ? "bg-brand-navy text-white shadow-md" 
                    : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
                }`}
                aria-label="Grid view"
                aria-pressed={viewMode === "grid"}
              >
                <span aria-hidden="true">⊞</span>
              </button>
              <button
                onClick={() => onViewModeChange("list")}
                className={`p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-brand-navy/30 ${
                  viewMode === "list" 
                    ? "bg-brand-navy text-white shadow-md" 
                    : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
                }`}
                aria-label="List view"
                aria-pressed={viewMode === "list"}
              >
                <span aria-hidden="true">☰</span>
              </button>
            </div>
            
            {/* Upload Button */}
            <IconButton
              onClick={onUploadClick}
              className="btn-gradient shadow-lg hover:shadow-brand-cyan/25 border-none"
            >
              <span aria-hidden="true">📤</span>
              <span className="hidden sm:inline">Upload</span>
            </IconButton>
            
            {/* Google Drive Button */}
            <IconButton
              onClick={onGDriveClick}
              variant="secondary"
              className="bg-white hover:bg-brand-orange/10 hover:text-brand-orange border-brand-navy/10"
            >
              <span aria-hidden="true">☁️</span>
              <span className="hidden sm:inline">Google Drive</span>
            </IconButton>
          </div>
        </div>
      </div>
    </header>
  )
}

interface ErrorMessageProps {
  message: string
  onRetry: () => void
}

function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div 
      className="glass-card border-brand-coral/30 bg-brand-coral/5 rounded-2xl p-6 flex items-center gap-4"
      role="alert"
    >
      <div className="text-3xl" aria-hidden="true">⚠️</div>
      <div>
        <p className="text-brand-coral-dark font-bold">{message}</p>
        <button
          onClick={onRetry}
          className="mt-1 text-brand-coral hover:text-brand-coral-dark underline text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-coral/50 rounded"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div 
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" 
      aria-label="Loading videos"
      aria-busy="true"
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="glass-card rounded-3xl p-6 animate-pulse" aria-hidden="true">
          <div className="h-32 bg-brand-navy/5 rounded-2xl mb-4"></div>
          <div className="h-4 bg-brand-navy/5 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-brand-navy/5 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}

interface EmptyStateProps {
  searchQuery: string
  onClearSearch: () => void
}

function EmptyState({ searchQuery, onClearSearch }: EmptyStateProps) {
  return (
    <section className="glass-card rounded-3xl text-center py-20 px-6">
      <div className="space-y-6">
        <div 
          className="w-24 h-24 mx-auto bg-gradient-to-br from-brand-purple to-brand-blue rounded-3xl flex items-center justify-center text-5xl shadow-2xl shadow-brand-purple/20 animate-float"
          aria-hidden="true"
        >
          🎬
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-brand-navy">
            {searchQuery ? "No videos found" : "No videos yet"}
          </h2>
          <p className="text-brand-navy/60 max-w-md mx-auto text-lg leading-relaxed">
            {searchQuery 
              ? `No videos match "${searchQuery}". Try a different search term.`
              : "Upload your first video or add a streaming URL to get started!"
            }
          </p>
        </div>
        {searchQuery && (
          <button
            onClick={onClearSearch}
            className="inline-flex items-center gap-2 bg-white hover:bg-brand-neutral text-brand-navy px-6 py-3 rounded-xl font-bold transition-all shadow-sm border border-brand-navy/10 focus:outline-none focus:ring-2 focus:ring-brand-navy/30 focus:ring-offset-2"
          >
            <span aria-hidden="true">🔄</span>
            Clear Search
          </button>
        )}
      </div>
    </section>
  )
}
