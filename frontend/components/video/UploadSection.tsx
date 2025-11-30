"use client"

import Link from "next/link"
import { GDriveMovie } from "@/hooks/useVideos"
import { IconButton } from "@/components/ui/icon-button"
import { GDriveFileCard } from "./GDriveFileCard"

type UploadMode = "file" | "url" | "gdrive" | null

interface UploadSectionProps {
  uploadMode: UploadMode
  onModeChange: (mode: UploadMode) => void
  uploading: boolean
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onUrlSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  
  // Google Drive props
  gdriveConnected: boolean | null
  gdriveLoading: boolean
  gdriveError: string
  gdriveFiles: GDriveMovie[]
  connectionNotice: string | null
  onConnectionNoticeClose: () => void
  onRefreshGdrive: () => void
  onImportFromGDrive: (movie: GDriveMovie) => void
  onStreamGDriveVideo: (videoId: string) => void
  onDeleteGDriveVideo: (videoId: string, movie: GDriveMovie) => void
  importingIds: string[]
  streamingIds: string[]
  deletingIds: string[]
}

export function UploadSection({
  uploadMode,
  onModeChange,
  uploading,
  onFileUpload,
  onUrlSubmit,
  gdriveConnected,
  gdriveLoading,
  gdriveError,
  gdriveFiles,
  connectionNotice,
  onConnectionNoticeClose,
  onRefreshGdrive,
  onImportFromGDrive,
  onStreamGDriveVideo,
  onDeleteGDriveVideo,
  importingIds,
  streamingIds,
  deletingIds,
}: UploadSectionProps) {
  if (!uploadMode) return null

  return (
    <section 
      className="glass-card rounded-3xl p-6 border-brand-navy/10 animate-in fade-in slide-in-from-top-4 duration-300"
      aria-label="Add new content"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brand-navy flex items-center gap-3">
            <span aria-hidden="true">📤</span>
            Add New Content
          </h2>
          <button
            onClick={() => onModeChange(null)}
            className="p-2 text-brand-navy/40 hover:text-brand-navy transition-colors rounded-full hover:bg-brand-navy/5 focus:outline-none focus:ring-2 focus:ring-brand-navy/20"
            aria-label="Close upload section"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        
        {/* Upload Mode Tabs */}
        <div className="flex gap-2 bg-brand-navy/5 p-1 rounded-xl w-fit" role="tablist">
          <button
            onClick={() => onModeChange("file")}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              uploadMode === "file" 
                ? "bg-white text-brand-navy shadow-sm" 
                : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
            }`}
            role="tab"
            aria-selected={uploadMode === "file"}
            aria-controls="upload-panel-file"
          >
            <span aria-hidden="true">📁</span> Upload File
          </button>
          <button
            onClick={() => onModeChange("url")}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              uploadMode === "url" 
                ? "bg-white text-brand-navy shadow-sm" 
                : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
            }`}
            role="tab"
            aria-selected={uploadMode === "url"}
            aria-controls="upload-panel-url"
          >
            <span aria-hidden="true">🔗</span> Add URL
          </button>
          <button
            onClick={() => onModeChange("gdrive")}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              uploadMode === "gdrive" 
                ? "bg-white text-brand-navy shadow-sm" 
                : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
            }`}
            role="tab"
            aria-selected={uploadMode === "gdrive"}
            aria-controls="upload-panel-gdrive"
          >
            <span aria-hidden="true">☁️</span> Google Drive
          </button>
        </div>

        {/* File Upload Panel */}
        {uploadMode === "file" && (
          <div 
            id="upload-panel-file"
            role="tabpanel"
            className="border-2 border-dashed border-brand-cyan/30 rounded-2xl p-12 text-center bg-brand-cyan/5 hover:bg-brand-cyan/10 transition-colors group"
          >
            <div className="space-y-6">
              <div 
                className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-cyan to-brand-blue rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-brand-cyan/20 group-hover:scale-110 transition-transform duration-300"
                aria-hidden="true"
              >
                📁
              </div>
              <div>
                <h3 className="text-xl font-bold text-brand-navy mb-2">Drop your video here</h3>
                <p className="text-brand-navy/60 mb-6 font-medium">
                  Or click to browse files • MP4, MOV, AVI, MKV supported
                </p>
              </div>
              <input
                type="file"
                accept="video/*"
                onChange={onFileUpload}
                disabled={uploading}
                className="hidden"
                id="file-upload"
                aria-describedby="file-upload-description"
              />
              <span id="file-upload-description" className="sr-only">
                Upload a video file from your computer
              </span>
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
                    <div className="loading-reel w-5 h-5 border-white/30 border-t-white" aria-hidden="true"></div>
                    Uploading...
                  </span>
                ) : (
                  "Choose Video File"
                )}
              </label>
            </div>
          </div>
        )}

        {/* URL Upload Panel */}
        {uploadMode === "url" && (
          <form 
            id="upload-panel-url"
            role="tabpanel"
            onSubmit={onUrlSubmit} 
            className="space-y-4 max-w-2xl mx-auto"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="video-title" className="sr-only">Video title</label>
                <input
                  id="video-title"
                  type="text"
                  name="title"
                  placeholder="Video title"
                  required
                  disabled={uploading}
                  className="w-full px-4 py-3 bg-white border border-brand-navy/10 rounded-xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue/30 transition-all"
                />
              </div>
              <div>
                <label htmlFor="video-url" className="sr-only">Video URL</label>
                <input
                  id="video-url"
                  type="url"
                  name="url"
                  placeholder="Video URL (YouTube, Vimeo, etc.)"
                  required
                  disabled={uploading}
                  className="w-full px-4 py-3 bg-white border border-brand-navy/10 rounded-xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue/30 transition-all"
                />
              </div>
            </div>
            <IconButton
              type="submit"
              disabled={uploading}
              loading={uploading}
              className="w-full btn-gradient shadow-lg hover:shadow-brand-blue/25"
            >
              <span aria-hidden="true">🌐</span>
              Add Video from URL
            </IconButton>
          </form>
        )}

        {/* Google Drive Panel */}
        {uploadMode === "gdrive" && (
          <div id="upload-panel-gdrive" role="tabpanel" className="space-y-6">
            {/* Connection Success Notice */}
            {connectionNotice && (
              <div 
                className="bg-brand-cyan/10 border border-brand-cyan/20 rounded-2xl p-4 flex items-center gap-3"
                role="alert"
              >
                <div className="text-xl" aria-hidden="true">✅</div>
                <p className="flex-1 text-brand-cyan-dark font-bold">{connectionNotice}</p>
                <button
                  onClick={onConnectionNoticeClose}
                  className="text-brand-cyan/60 hover:text-brand-cyan transition-colors focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 rounded"
                  aria-label="Dismiss notification"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-brand-navy flex items-center gap-2">
                  <span aria-hidden="true">☁️</span>
                  {gdriveConnected === true ? "Browse Google Drive Library" : "Google Drive Integration"}
                </h3>
                <p className="text-brand-navy/60 text-sm font-medium">
                  {gdriveConnected === true 
                    ? "Import videos stored in your connected Google Drive account directly into Watch Party."
                    : "Connect your Google Drive to import and stream videos directly."}
                </p>
              </div>
              {gdriveConnected === true && (
                <IconButton
                  onClick={onRefreshGdrive}
                  variant="secondary"
                  disabled={gdriveLoading}
                  className="bg-white hover:bg-brand-neutral"
                  aria-label="Refresh Google Drive files"
                >
                  <span aria-hidden="true">🔄</span> Refresh
                </IconButton>
              )}
            </div>

            {/* Error Message */}
            {gdriveError && gdriveConnected === true && (
              <div 
                className="bg-brand-coral/5 border border-brand-coral/20 rounded-2xl p-4 flex items-center gap-3"
                role="alert"
              >
                <div className="text-xl" aria-hidden="true">⚠️</div>
                <div>
                  <p className="text-brand-coral-dark font-bold">{gdriveError}</p>
                  <button
                    onClick={onRefreshGdrive}
                    className="mt-1 text-brand-coral hover:text-brand-coral-dark underline text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-coral/50 rounded"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Content based on connection state */}
            {gdriveLoading ? (
              <GDriveLoadingSkeleton />
            ) : gdriveConnected !== true ? (
              <GDriveNotConnected />
            ) : gdriveFiles.length === 0 ? (
              <GDriveEmptyState onRefresh={onRefreshGdrive} loading={gdriveLoading} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {gdriveFiles.map((movie) => (
                  <GDriveFileCard
                    key={movie.gdrive_file_id}
                    movie={movie}
                    isImporting={importingIds.includes(movie.gdrive_file_id)}
                    isStreaming={movie.video_id ? streamingIds.includes(movie.video_id) : false}
                    isDeleting={movie.video_id ? deletingIds.includes(movie.video_id) : false}
                    onImport={onImportFromGDrive}
                    onStream={onStreamGDriveVideo}
                    onDelete={onDeleteGDriveVideo}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

// Sub-components for cleaner organization

function GDriveLoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-label="Loading Google Drive files">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i} 
          className="bg-white/40 border border-white/50 rounded-2xl p-4 animate-pulse space-y-4"
          aria-hidden="true"
        >
          <div className="aspect-video bg-brand-navy/5 rounded-xl"></div>
          <div className="h-4 bg-brand-navy/5 rounded w-3/4"></div>
          <div className="h-3 bg-brand-navy/5 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}

function GDriveNotConnected() {
  return (
    <div className="text-center bg-gradient-to-br from-brand-blue/5 to-brand-purple/5 border border-brand-blue/20 rounded-2xl py-12 px-6">
      <div 
        className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-blue to-brand-purple rounded-3xl flex items-center justify-center text-4xl shadow-lg shadow-brand-blue/20 mb-6"
        aria-hidden="true"
      >
        <img 
          src="https://www.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png" 
          alt=""
          className="w-12 h-12"
        />
      </div>
      <h4 className="text-2xl font-bold text-brand-navy mb-3">Google Drive Not Connected</h4>
      <p className="text-brand-navy/60 mb-6 max-w-md mx-auto">
        Connect your Google Drive to import and stream videos directly from your cloud storage.
      </p>
      <div className="space-y-3">
        <Link
          href="/dashboard/integrations"
          className="inline-flex items-center justify-center gap-2 btn-gradient shadow-lg hover:shadow-brand-blue/25 px-8 py-3 rounded-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:ring-offset-2"
        >
          <span aria-hidden="true">🔌</span>
          Go to Integrations
        </Link>
        <p className="text-xs text-brand-navy/40">
          Manage all your connected services in one place
        </p>
      </div>
    </div>
  )
}

interface GDriveEmptyStateProps {
  onRefresh: () => void
  loading: boolean
}

function GDriveEmptyState({ onRefresh, loading }: GDriveEmptyStateProps) {
  return (
    <div className="text-center text-brand-navy/60 bg-brand-navy/5 border border-brand-navy/10 rounded-2xl py-12">
      <div className="text-4xl mb-3" aria-hidden="true">📁</div>
      <p className="font-bold text-lg">No compatible videos found</p>
      <p className="text-sm mt-1">
        Upload a video to your Watch Party folder in Drive and refresh to see it here.
      </p>
      <IconButton
        onClick={onRefresh}
        variant="secondary"
        disabled={loading}
        className="mt-4 bg-white hover:bg-brand-neutral"
      >
        <span aria-hidden="true">🔄</span> Refresh
      </IconButton>
    </div>
  )
}
