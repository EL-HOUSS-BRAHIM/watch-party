"use client"

import { useState, useEffect } from "react"
import { adminApi, Video } from "@/lib/api-client"

interface ContentModerationProps {
  onBack: () => void
}

export default function ContentModeration({ onBack }: ContentModerationProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadVideos()
  }, [currentPage, filter])

  const loadVideos = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: currentPage,
        page_size: 20
      }

      if (filter !== "all") {
        params.moderation_status = filter
      }

      const response = await adminApi.getVideos(params)
      const videosList = Array.isArray(response) ? response : (response.results || [])
      const total = response.count || videosList.length
      
      setVideos(videosList)
      setTotalPages(Math.ceil(total / 20))
    } catch (error) {
      console.error("Failed to load videos:", error)
    } finally {
      setLoading(false)
    }
  }

  const moderateVideo = async (videoId: string, action: "approve" | "reject", reason?: string) => {
    try {
      await adminApi.moderateVideo(videoId, action, reason)
      await loadVideos()
    } catch (error) {
      alert("Failed to moderate video: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const bulkModerate = async (action: "approve" | "reject") => {
    if (selectedVideos.size === 0) {
      alert("No videos selected")
      return
    }

    const reason = action === "reject" ? prompt("Reason for rejection:") : undefined
    if (action === "reject" && !reason) return

    try {
      for (const videoId of selectedVideos) {
        await adminApi.moderateVideo(videoId, action, reason || undefined)
      }
      
      setSelectedVideos(new Set())
      await loadVideos()
      alert(`Successfully ${action}d ${selectedVideos.size} videos.`)
    } catch (error) {
      alert(`Failed to ${action} videos: ` + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const toggleVideoSelection = (videoId: string) => {
    const newSelection = new Set(selectedVideos)
    if (newSelection.has(videoId)) {
      newSelection.delete(videoId)
    } else {
      newSelection.add(videoId)
    }
    setSelectedVideos(newSelection)
  }

  const selectAllVideos = () => {
    if (selectedVideos.size === videos.length) {
      setSelectedVideos(new Set())
    } else {
      setSelectedVideos(new Set(videos.map(v => v.id)))
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-white/60 hover:text-white transition-colors"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Content Moderation</h2>
            <p className="text-white/60">Review and moderate uploaded videos</p>
          </div>
        </div>

        {selectedVideos.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-white/60">{selectedVideos.size} selected</span>
            <button
              onClick={() => bulkModerate("approve")}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
            >
              Approve Selected
            </button>
            <button
              onClick={() => bulkModerate("reject")}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              Reject Selected
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-1">
        <div className="flex">
          {[
            { id: "pending", label: "Pending Review", count: videos.filter(v => v.moderation_status === "pending").length },
            { id: "approved", label: "Approved", count: videos.filter(v => v.moderation_status === "approved").length },
            { id: "rejected", label: "Rejected", count: videos.filter(v => v.moderation_status === "rejected").length },
            { id: "all", label: "All Videos", count: videos.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded transition-colors ${
                filter === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mb-4"></div>
            <p className="text-white/60">Loading videos...</p>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📹</div>
            <p className="text-white/60">No videos found for the selected filter</p>
          </div>
        ) : (
          <>
            {/* Bulk Actions */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedVideos.size === videos.length && videos.length > 0}
                  onChange={selectAllVideos}
                  className="rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-white/60 text-sm">
                  {selectedVideos.size > 0 ? `${selectedVideos.size} selected` : "Select all"}
                </span>
              </div>
              
              <div className="text-white/60 text-sm">
                {videos.length} videos
              </div>
            </div>

            {/* Videos List */}
            <div className="space-y-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className={`p-4 border rounded-lg transition-all ${
                    selectedVideos.has(video.id)
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedVideos.has(video.id)}
                      onChange={() => toggleVideoSelection(video.id)}
                      className="mt-1 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
                    />

                    {/* Thumbnail */}
                    <div className="w-32 h-20 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white/40 text-2xl">📹</span>
                      )}
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white mb-1 truncate">{video.title}</h3>
                      
                      <div className="flex items-center gap-4 text-sm text-white/60 mb-2">
                        <span>👤 {video.uploaded_by?.username || "Unknown"}</span>
                        <span>📅 {new Date(video.created_at || "").toLocaleDateString()}</span>
                        <span>⏱️ {video.duration || "Unknown"}</span>
                        <span>💾 {formatFileSize(video.file_size || 0)}</span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          video.moderation_status === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : video.moderation_status === "rejected"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {video.moderation_status?.toUpperCase() || "PENDING"}
                        </span>
                        
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          video.processing_status === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : video.processing_status === "failed"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}>
                          {video.processing_status?.toUpperCase() || "PROCESSING"}
                        </span>
                      </div>

                      {video.description && (
                        <p className="text-white/80 text-sm line-clamp-2 mb-3">
                          {video.description}
                        </p>
                      )}

                      {video.moderation_reason && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded p-2 mb-3">
                          <p className="text-red-400 text-sm">
                            <strong>Moderation Reason:</strong> {video.moderation_reason}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {video.moderation_status === "pending" && (
                        <>
                          <button
                            onClick={() => moderateVideo(video.id, "approve")}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt("Reason for rejection:")
                              if (reason) moderateVideo(video.id, "reject", reason)
                            }}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      
                      {video.moderation_status === "rejected" && (
                        <button
                          onClick={() => moderateVideo(video.id, "approve")}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      
                      {video.moderation_status === "approved" && (
                        <button
                          onClick={() => {
                            const reason = prompt("Reason for rejection:")
                            if (reason) moderateVideo(video.id, "reject", reason)
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                        >
                          Reject
                        </button>
                      )}

                      {video.video_file && (
                        <a
                          href={video.video_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors text-center"
                        >
                          Preview
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                <p className="text-white/60 text-sm">
                  Page {currentPage} of {totalPages}
                </p>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
                  >
                    Previous
                  </button>
                  
                  <span className="px-3 py-2 text-white text-sm">
                    {currentPage}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}