'use client'

import { useState, useEffect, use } from "react"
import { PublicPartyLayout, type PublicPartyViewModel } from "@/components/party/public-party-layout"

interface PublicPartyPageProps {
  params: Promise<{
    code: string
  }>
}

interface PublicPartyApiResponse {
  id: string
  title: string
  description?: string | null
  room_code: string
  visibility: string
  host?: {
    id: string
    name: string
    avatar?: string | null
    is_premium?: boolean
  }
  video?: {
    id: string
    title: string
    duration?: string | number | null
    duration_formatted?: string | null
  } | null
  participant_count?: number
  allow_chat: boolean
  allow_reactions: boolean
  status: string
  scheduled_start?: string | null
  started_at?: string | null
  ended_at?: string | null
  current_timestamp?: string | number | null
  current_timestamp_formatted?: string | null
  is_playing: boolean
  last_sync_at?: string | null
}

interface ApiErrorPayload {
  detail?: string
  error?: string
  message?: string
}

const toStatusLabel = (status?: string) => {
  if (!status) return "Unknown"
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const ensureString = (value: unknown) => {
  if (typeof value === "string") return value
  if (typeof value === "number") return value.toString()
  return undefined
}

const mapPartyResponse = (data: PublicPartyApiResponse): PublicPartyViewModel => {
  const host = data.host ?? { id: "", name: "Host" }
  const statusLabel = toStatusLabel(data.status)
  const playbackPosition = data.current_timestamp_formatted
    ? data.current_timestamp_formatted
    : ensureString(data.current_timestamp) ?? "00:00"

  const videoDuration = data.video?.duration_formatted
    ? data.video.duration_formatted
    : ensureString(data.video?.duration)

  return {
    id: data.id,
    title: data.title,
    description: data.description ?? undefined,
    roomCode: data.room_code,
    host: {
      id: host.id ?? "",
      name: host.name ?? "Host",
      avatar: host.avatar ?? undefined,
      isPremium: host.is_premium ?? undefined,
    },
    participantCount: data.participant_count ?? 0,
    allowChat: data.allow_chat,
    allowReactions: data.allow_reactions,
    status: data.status,
    statusLabel,
    isPlaying: data.is_playing,
    playbackPosition,
    lastSyncAt: data.last_sync_at ?? undefined,
    video: data.video
      ? {
          id: data.video.id,
          title: data.video.title,
          durationLabel: videoDuration,
        }
      : undefined,
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

export default function PublicPartyPage({ params }: PublicPartyPageProps) {
  const resolvedParams = use(params)
  const [party, setParty] = useState<PublicPartyViewModel | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guestName, setGuestName] = useState("")
  const [hasJoined, setHasJoined] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const fetchParty = async () => {
      setLoading(true)
      setError(null)
      setParty(null)
      setHasJoined(false)
      setGuestName("")
      setJoinError(null)

      try {
        const response = await fetch(`/api/parties/public/${resolvedParams.code}/`, {
          cache: "no-store",
        })

        let payload: unknown = null
        try {
          payload = await response.json()
        } catch (parseError) {
          payload = null
        }

        if (!response.ok || !isRecord(payload)) {
          const errorPayload = (payload as ApiErrorPayload) ?? {}
          const detail = errorPayload.detail || errorPayload.message || errorPayload.error

          if (response.status === 404) {
            throw new Error(detail || "Party not found")
          }

          if (response.status === 403) {
            throw new Error(detail || "This party is private")
          }

          throw new Error(detail || "Failed to load party")
        }

        if (!isActive) return

        setParty(mapPartyResponse(payload as unknown as PublicPartyApiResponse))
      } catch (err) {
        if (!isActive) return
        console.error("Failed to load party:", err)
        setError(err instanceof Error ? err.message : "Failed to load party")
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void fetchParty()

    return () => {
      isActive = false
    }
  }, [resolvedParams.code])

  const handleJoinParty = () => {
    setJoinError(null)
    if (!guestName.trim()) {
      setJoinError("Please enter a name to join")
      return
    }
    if (guestName.trim().length < 2) {
      setJoinError("Name must be at least 2 characters")
      return
    }
    setHasJoined(true)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand-purple border-t-transparent"></div>
          <p className="text-white/70">Loading party...</p>
        </div>
      </div>
    )
  }

  if (error || !party) {
    const isPrivate = error === "This party is private"
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white/5 p-8 text-center backdrop-blur-sm">
          <div className="mb-4 text-6xl">😕</div>
          <h1 className="mb-2 text-2xl font-bold text-white">
            {error || "Party not found"}
          </h1>
          <p className="mb-6 text-white/70">
            {isPrivate
              ? "This party doesn't allow guest access. Please ask the host for an invite."
              : "The party code might be incorrect, private, or the party may have ended."}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-brand-purple to-brand-blue px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }

  if (!hasJoined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <div className="mb-6 text-center">
            <div className="mb-4 text-6xl">🎬</div>
            <h1 className="mb-2 text-3xl font-bold text-white">{party.title}</h1>
            <p className="text-white/70">
              Hosted by <span className="font-semibold text-brand-purple-light">{party.host.name}</span>
            </p>
            <p className="mt-2 text-sm text-white/50">
              Room code: <span className="font-mono text-white/80">{party.roomCode}</span>
            </p>
            <p className="mt-2 text-sm text-white/50">
              {party.participantCount} {party.participantCount === 1 ? "person" : "people"} watching
            </p>
            <div className="mt-3 flex flex-col items-center gap-1 text-xs text-white/60">
              <span>Status: {party.statusLabel}</span>
              <span>Playback: {party.isPlaying ? "Playing" : "Paused"}</span>
              <span>Position: {party.playbackPosition}</span>
            </div>
          </div>

          <div className="mb-6 rounded-lg border border-brand-blue/30 bg-brand-blue/10 p-4">
            <p className="text-sm text-blue-300">
              <strong>👁️ Guest Mode:</strong> You can watch the synced stream and participate in text chat when enabled.
              Sign up for full features like voice chat and reactions!
            </p>
          </div>

          <div className="space-y-4">
            {joinError && (
              <div className="rounded-lg border border-brand-coral/30 bg-brand-coral/10 p-3">
                <p className="flex items-center gap-2 text-sm text-red-300">
                  <span>❌</span>
                  {joinError}
                </p>
              </div>
            )}

            <div>
              <label htmlFor="guestName" className="mb-2 block text-sm font-medium text-white/90">
                Enter your name
              </label>
              <input
                id="guestName"
                type="text"
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value)
                  setJoinError(null)
                }}
                placeholder="Guest123"
                maxLength={20}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-brand-purple/50 focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
              />
            </div>

            <button
              onClick={handleJoinParty}
              className="w-full rounded-lg bg-gradient-to-r from-brand-purple to-brand-blue py-3 font-semibold text-white transition-all hover:shadow-lg"
            >
              Join Party
            </button>

            <a
              href="/auth/register"
              className="block text-center text-sm text-brand-purple-light transition-colors hover:text-brand-purple-light"
            >
              Create an account for full features →
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PublicPartyLayout
      party={party}
      guestName={guestName}
      onLeave={() => setHasJoined(false)}
    />
  )
}
