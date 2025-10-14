"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api-client"

interface SyncState {
  is_playing: boolean
  current_time: number
  video_url?: string
  video_title?: string
  last_updated?: string
  updated_by?: {
    id?: string
    username: string
  }
}

interface SyncControlsProps {
  partyId: string
  currentUser?: any
  isHost?: boolean
  onSyncUpdate?: (state: SyncState) => void
}

export default function SyncControls({ partyId, currentUser: _currentUser, isHost = false, onSyncUpdate }: SyncControlsProps) {
  const [syncState, setSyncState] = useState<SyncState | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [localTime, setLocalTime] = useState(0)
  const [localPlaying, setLocalPlaying] = useState(false)
  const [showTimeInput, setShowTimeInput] = useState(false)
  const [timeInput, setTimeInput] = useState("")

  useEffect(() => {
    if (!partyId) return

    loadSyncState()

    // Poll for updates every 2 seconds
    const interval = setInterval(loadSyncState, 2000)
    return () => clearInterval(interval)
  }, [partyId])

  useEffect(() => {
    if (syncState) {
      setLocalTime(syncState.current_time)
      setLocalPlaying(syncState.is_playing)
      onSyncUpdate?.(syncState)
    }
  }, [syncState, onSyncUpdate])

  const loadSyncState = async () => {
    try {
      const response = await api.get(`/parties/${partyId}/sync/`)
      setSyncState(response)
    } catch (error) {
      console.error("Failed to load sync state:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateSyncState = async (updates: Partial<SyncState>) => {
    if (!isHost) return

    setUpdating(true)
    try {
      const response = await api.patch(`/parties/${partyId}/sync/`, updates)
      setSyncState(response)

      // Update local state immediately
      if (updates.current_time !== undefined) {
        setLocalTime(updates.current_time)
      }
      if (updates.is_playing !== undefined) {
        setLocalPlaying(updates.is_playing)
      }
    } catch (error) {
      console.error("Failed to update sync state:", error)
      alert("Failed to update playback controls")
    } finally {
      setUpdating(false)
    }
  }

  const togglePlayPause = () => {
    updateSyncState({
      is_playing: !localPlaying,
      current_time: localTime
    })
  }

  const seekTo = (time: number) => {
    updateSyncState({
      current_time: Math.max(0, Math.floor(time)),
      is_playing: localPlaying
    })
  }

  const handleTimeInputSubmit = () => {
    const timeValue = parseTime(timeInput)
    if (timeValue >= 0) {
      seekTo(timeValue)
      setTimeInput("")
      setShowTimeInput(false)
    } else {
      alert("Invalid time format. Use MM:SS or HH:MM:SS")
    }
  }

  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(":").map(p => parseInt(p.trim(), 10))

    if (parts.length === 2 && parts.every(p => !isNaN(p))) {
      // MM:SS format
      return parts[0] * 60 + parts[1]
    } else if (parts.length === 3 && parts.every(p => !isNaN(p))) {
      // HH:MM:SS format
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
    }

    return -1
  }

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimeSinceUpdate = (): string => {
    if (!syncState?.last_updated) return ""

    const now = Date.now()
    const updated = new Date(syncState.last_updated).getTime()
    const diffSeconds = Math.floor((now - updated) / 1000)

    if (diffSeconds < 5) return "just now"
    if (diffSeconds < 60) return `${diffSeconds}s ago`
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`
    return `${Math.floor(diffSeconds / 3600)}h ago`
  }

  if (loading) {
    return (
      <div className="bg-white/5 border border-brand-navy/10 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="h-16 bg-white/10 rounded"></div>
        </div>
      </div>
    )
  }

  if (!syncState) {
    return (
      <div className="bg-white/5 border border-brand-navy/10 rounded-lg p-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">⏯️</div>
          <p className="text-brand-navy/60">No video loaded</p>
          {isHost && (
            <p className="text-brand-navy/40 text-sm mt-1">Select a video to start syncing</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-brand-navy/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-brand-navy">Sync Controls</h3>
        {syncState.updated_by && (
          <div className="text-sm text-brand-navy/60">
            Updated by {syncState.updated_by.username} {getTimeSinceUpdate()}
          </div>
        )}
      </div>

      {/* Current Video Info */}
      {syncState.video_title && (
        <div className="mb-6 p-4 bg-white/5 border border-brand-navy/10 rounded-lg">
          <h4 className="font-medium text-brand-navy mb-2">Now Playing</h4>
          <p className="text-brand-navy/80 text-sm">{syncState.video_title}</p>
        </div>
      )}

      {/* Playback Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          {/* Skip Back 30s */}
          {isHost && (
            <button
              onClick={() => seekTo(Math.max(0, localTime - 30))}
              disabled={updating}
              className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-brand-navy rounded-lg transition-colors"
              title="Skip back 30 seconds"
            >
              ⏪
            </button>
          )}

          {/* Skip Back 10s */}
          {isHost && (
            <button
              onClick={() => seekTo(Math.max(0, localTime - 10))}
              disabled={updating}
              className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-brand-navy rounded-lg transition-colors"
              title="Skip back 10 seconds"
            >
              ⏮️
            </button>
          )}

          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            disabled={!isHost || updating}
            className={`p-4 text-2xl rounded-lg transition-all ${
              isHost
                ? "bg-brand-blue hover:bg-brand-blue-dark text-white"
                : "bg-white/10 text-brand-navy/60 cursor-not-allowed"
            } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
            title={isHost ? (localPlaying ? "Pause" : "Play") : "Host controls only"}
          >
            {localPlaying ? "⏸️" : "▶️"}
          </button>

          {/* Skip Forward 10s */}
          {isHost && (
            <button
              onClick={() => seekTo(localTime + 10)}
              disabled={updating}
              className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-brand-navy rounded-lg transition-colors"
              title="Skip forward 10 seconds"
            >
              ⏭️
            </button>
          )}

          {/* Skip Forward 30s */}
          {isHost && (
            <button
              onClick={() => seekTo(localTime + 30)}
              disabled={updating}
              className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-brand-navy rounded-lg transition-colors"
              title="Skip forward 30 seconds"
            >
              ⏩
            </button>
          )}
        </div>

        {/* Time Display and Seek */}
        <div className="text-center space-y-2">
          <div className="text-brand-navy font-mono text-lg">
            {formatTime(localTime)}
          </div>

          {isHost && (
            <div className="flex items-center justify-center gap-2">
              {!showTimeInput ? (
                <button
                  onClick={() => setShowTimeInput(true)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-brand-navy text-sm rounded transition-colors"
                >
                  Jump to Time
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    placeholder="MM:SS or HH:MM:SS"
                    className="px-2 py-1 bg-white/10 border border-brand-navy/20 rounded text-brand-navy text-sm placeholder-brand-navy/50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleTimeInputSubmit()
                      } else if (e.key === "Escape") {
                        setTimeInput("")
                        setShowTimeInput(false)
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleTimeInputSubmit}
                    className="px-2 py-1 bg-brand-cyan hover:bg-green-700 text-white text-sm rounded transition-colors"
                  >
                    Go
                  </button>
                  <button
                    onClick={() => {
                      setTimeInput("")
                      setShowTimeInput(false)
                    }}
                    className="px-2 py-1 bg-brand-coral hover:bg-red-700 text-white text-sm rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Seek Buttons */}
        {isHost && (
          <div className="flex justify-center gap-2">
            <button
              onClick={() => seekTo(0)}
              disabled={updating}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-brand-navy text-sm rounded transition-colors"
            >
              Start
            </button>
            <button
              onClick={() => seekTo(localTime - 60)}
              disabled={updating}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-brand-navy text-sm rounded transition-colors"
            >
              -1min
            </button>
            <button
              onClick={() => seekTo(localTime + 60)}
              disabled={updating}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-brand-navy text-sm rounded transition-colors"
            >
              +1min
            </button>
          </div>
        )}

        {/* Status */}
        <div className="text-center space-y-1">
          <div className={`text-sm ${localPlaying ? "text-brand-cyan-light" : "text-brand-coral-light"}`}>
            {localPlaying ? "▶️ Playing" : "⏸️ Paused"}
          </div>
          {!isHost && (
            <div className="text-xs text-brand-navy/60">Host controls playback synchronization</div>
          )}
          {updating && (
            <div className="text-xs text-brand-orange-light">Updating...</div>
          )}
        </div>
      </div>
    </div>
  )
}