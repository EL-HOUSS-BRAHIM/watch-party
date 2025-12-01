"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { partiesApi, videosApi, type WatchParty, type VideoSummary } from "@/lib/api-client"
import { IconButton } from "@/components/ui/icon-button"
import { GradientCard } from "@/components/ui/gradient-card"

interface EditPartyPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditPartyPage({ params }: EditPartyPageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [party, setParty] = useState<WatchParty | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [showVideoPicker, setShowVideoPicker] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "public" as "public" | "friends" | "private",
    max_participants: 10,
    scheduled_start: "",
    allow_chat: true,
    allow_reactions: true,
  })

  useEffect(() => {
    loadParty()
  }, [resolvedParams.id])

  const loadParty = async () => {
    try {
      setLoading(true)
      const data = await partiesApi.getById(resolvedParams.id)
      setParty(data)
      
      // Populate form
      setFormData({
        title: data.title || "",
        description: data.description || "",
        visibility: data.visibility || "public",
        max_participants: data.max_participants || 10,
        scheduled_start: data.scheduled_start ? new Date(data.scheduled_start).toISOString().slice(0, 16) : "",
        allow_chat: data.allow_chat !== false,
        allow_reactions: data.allow_reactions !== false,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load party")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError("")
      
      const updateData: any = {
        title: formData.title,
        description: formData.description,
        visibility: formData.visibility,
        max_participants: formData.max_participants,
        allow_chat: formData.allow_chat,
        allow_reactions: formData.allow_reactions,
      }
      
      // Only include scheduled_start if it has a value
      if (formData.scheduled_start) {
        updateData.scheduled_start = new Date(formData.scheduled_start).toISOString()
      }
      
      await partiesApi.update(resolvedParams.id, updateData)
      
      // Redirect back to party view
      router.push(`/party/${party?.room_code || resolvedParams.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes")
    } finally {
      setSaving(false)
    }
  }

  const handleAttachVideo = async (videoId: string) => {
    try {
      setSaving(true)
      const updated = await partiesApi.attachVideo(resolvedParams.id, videoId)
      setParty(updated)
      setShowVideoPicker(false)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to attach video")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-navy/60">Loading party...</p>
        </div>
      </div>
    )
  }

  if (!party) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-brand-navy mb-4">Party not found</h1>
          <IconButton onClick={() => router.push("/dashboard/parties")}>
            Back to Parties
          </IconButton>
        </div>
      </div>
    )
  }

  // Check if user is host
  if (party.host.id !== party.id) {
    // Note: We'd need user context here - for now assume authorized
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-neutral via-white to-brand-neutral-light p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <IconButton onClick={() => router.back()} variant="ghost" size="lg">
            ←
          </IconButton>
          <div>
            <h1 className="text-3xl font-bold text-brand-navy">Edit Party</h1>
            <p className="text-brand-navy/70">Update party settings and content</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        <GradientCard className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-bold text-brand-navy mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-brand-navy font-medium mb-2">Party Name</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-brand-navy/20 rounded-xl text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
                />
              </div>

              <div>
                <label className="block text-brand-navy font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-brand-navy/20 rounded-xl text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-purple/50 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div>
            <h2 className="text-xl font-bold text-brand-navy mb-4">Privacy</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "public", label: "Public", icon: "🌍" },
                { value: "friends", label: "Friends", icon: "👥" },
                { value: "private", label: "Private", icon: "🔒" }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData(prev => ({ ...prev, visibility: option.value as any }))}
                  className={`p-4 rounded-xl border transition-all ${
                    formData.visibility === option.value
                      ? "border-brand-purple bg-brand-purple/10"
                      : "border-brand-navy/20 bg-white hover:border-brand-navy/30"
                  }`}
                >
                  <div className="text-2xl mb-2">{option.icon}</div>
                  <div className="text-brand-navy font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div>
            <h2 className="text-xl font-bold text-brand-navy mb-4">Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-brand-navy font-medium mb-2">Max Participants</label>
                <select
                  value={formData.max_participants}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-white border border-brand-navy/20 rounded-xl text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
                >
                  {[5, 10, 20, 50, 100].map(num => (
                    <option key={num} value={num}>{num} people</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-brand-navy font-medium mb-2">Scheduled Start (optional)</label>
                <input
                  type="datetime-local"
                  value={formData.scheduled_start}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_start: e.target.value }))}
                  className="w-full px-4 py-3 bg-white border border-brand-navy/20 rounded-xl text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allow_chat}
                    onChange={(e) => setFormData(prev => ({ ...prev, allow_chat: e.target.checked }))}
                    className="w-5 h-5 rounded border-brand-navy/20 text-brand-purple focus:ring-brand-purple/50"
                  />
                  <span className="text-brand-navy">Allow Chat</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allow_reactions}
                    onChange={(e) => setFormData(prev => ({ ...prev, allow_reactions: e.target.checked }))}
                    className="w-5 h-5 rounded border-brand-navy/20 text-brand-purple focus:ring-brand-purple/50"
                  />
                  <span className="text-brand-navy">Allow Reactions</span>
                </label>
              </div>
            </div>
          </div>

          {/* Video Attachment */}
          <div>
            <h2 className="text-xl font-bold text-brand-navy mb-4">Content</h2>
            {party.video ? (
              <div className="p-4 bg-brand-navy/5 rounded-xl border border-brand-navy/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🎬</div>
                  <div>
                    <p className="font-medium text-brand-navy">{party.video.title}</p>
                    <p className="text-sm text-brand-navy/60">Currently attached</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowVideoPicker(true)}
                  className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple-dark transition-colors"
                >
                  Change Video
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowVideoPicker(true)}
                className="w-full p-6 border-2 border-dashed border-brand-navy/20 rounded-xl hover:border-brand-purple hover:bg-brand-purple/5 transition-all text-center"
              >
                <div className="text-4xl mb-2">📹</div>
                <p className="font-medium text-brand-navy">Attach a video</p>
                <p className="text-sm text-brand-navy/60">Choose from library or upload new</p>
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-brand-navy/10">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-white border border-brand-navy/20 text-brand-navy rounded-xl hover:bg-brand-navy/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.title.trim()}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-blue text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </GradientCard>

        {/* Video Picker Modal */}
        {showVideoPicker && (
          <PartyVideoPicker
            onSelect={handleAttachVideo}
            onClose={() => setShowVideoPicker(false)}
          />
        )}
      </div>
    </div>
  )
}

// Video Picker Component
function PartyVideoPicker({ onSelect, onClose }: { onSelect: (videoId: string) => void; onClose: () => void }) {
  const [videos, setVideos] = useState<VideoSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const response = await videosApi.list({ page_size: 50, upload_status: "ready" })
      setVideos(Array.isArray(response) ? response : response.results || [])
    } catch (err) {
      console.error("Failed to load videos:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredVideos = videos.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-brand-navy/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-brand-navy">Choose Video</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-navy/5 transition-colors"
            >
              ✕
            </button>
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your videos..."
            className="w-full px-4 py-3 bg-brand-navy/5 border border-brand-navy/10 rounded-xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
          />
        </div>

        {/* Video List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-brand-navy/60">Loading videos...</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📹</div>
              <p className="text-brand-navy/60">
                {searchQuery ? "No videos found" : "No videos in your library"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredVideos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => onSelect(video.id)}
                  className="p-4 bg-brand-navy/5 rounded-xl hover:bg-brand-purple/10 hover:border-brand-purple border border-transparent transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt=""
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-brand-navy/10 rounded-lg flex items-center justify-center text-2xl">
                        🎬
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-brand-navy truncate">{video.title}</p>
                      {video.duration && (
                        <p className="text-sm text-brand-navy/60">
                          {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                        </p>
                      )}
                      {video.file_size && (
                        <p className="text-xs text-brand-navy/40">
                          {(video.file_size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
