'use client'

import { useState, useEffect, use } from "react"
import { PublicPartyLayout, type PublicPartyViewModel } from "@/components/party/public-party-layout"
import { partiesApi, authApi } from "@/lib/api-client"

interface PublicPartyPageProps {
  params: Promise<{
    code: string
  }>
}

interface UserInfo {
  id: string
  username: string
  full_name?: string
  email?: string
  is_staff?: boolean
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
  can_edit?: boolean
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
  const [authUser, setAuthUser] = useState<UserInfo | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Check if user is authenticated
  useEffect(() => {
    let isActive = true

    const checkAuth = async () => {
      try {
        const profile = await authApi.getProfile()
        if (!isActive) return
        if (profile && profile.id) {
          setAuthUser(profile as UserInfo)
          // Auto-join for authenticated users - skip guest name input
          setHasJoined(true)
          // Use full_name first, then username (full_name is more user-friendly)
          const displayName = profile.full_name || profile.username || "User"
          setGuestName(displayName)
        }
      } catch (err) {
        // User is not authenticated, that's fine - they'll use guest mode
        console.log("Not authenticated, using guest mode")
      } finally {
        if (isActive) {
          setAuthChecked(true)
        }
      }
    }

    void checkAuth()

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    let isActive = true

    const fetchParty = async () => {
      setLoading(true)
      setError(null)
      setParty(null)
      // Don't reset hasJoined or guestName - keep auth state
      setJoinError(null)

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://be-watch-party.brahim-elhouss.me'
        const code = resolvedParams.code
        
        // Try public endpoint first (for room_code), then fall back to authenticated endpoint (for UUID)
        let response = await fetch(`${apiUrl}/api/parties/public/${code}/`, {
          cache: "no-store",
          credentials: "include"
        })
        
        // If public endpoint fails with 404, try the authenticated party detail endpoint
        // This handles when the URL contains a UUID instead of room_code
        if (response.status === 404) {
          response = await fetch(`${apiUrl}/api/parties/${code}/`, {
            cache: "no-store",
            credentials: "include"
          })
        }

        let payload: unknown = null
        try {
          payload = await response.json()
        } catch (_parseError) {
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

  if (loading || !authChecked) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-16 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-brand-purple/10 via-transparent to-transparent blur-3xl" />
        </div>
        <div className="glass-panel w-full max-w-md rounded-[40px] p-12 text-center relative z-10 flex flex-col items-center justify-center min-h-[400px]">
          <div className="mb-8 inline-block h-16 w-16 animate-spin rounded-full border-4 border-brand-purple/20 border-t-brand-purple"></div>
          <h2 className="text-2xl font-bold text-brand-navy">Loading party...</h2>
          <p className="mt-2 text-brand-navy/60">Getting everything ready for you</p>
        </div>
      </div>
    )
  }

  if (error || !party) {
    const isPrivate = error === "This party is private"
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-16 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-brand-coral/10 via-transparent to-transparent blur-3xl" />
        </div>
        <div className="glass-panel w-full max-w-md rounded-[40px] p-12 text-center relative z-10">
          <div className="mb-6 text-6xl">😕</div>
          <h1 className="mb-4 text-2xl font-bold text-brand-navy">
            {error || "Party not found"}
          </h1>
          <p className="mb-8 text-brand-navy/70 leading-relaxed">
            {isPrivate
              ? "This party doesn't allow guest access. Please ask the host for an invite."
              : "The party code might be incorrect, private, or the party may have ended."}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="w-full rounded-2xl bg-gradient-to-r from-brand-purple to-brand-blue px-6 py-4 font-bold text-white shadow-lg shadow-brand-purple/25 transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }

  if (!hasJoined) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-16 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-brand-purple/10 via-transparent to-transparent blur-3xl" />
        </div>
        <div className="glass-panel w-full max-w-xl rounded-[40px] p-8 text-brand-navy sm:p-12 relative z-10">
          <div className="mb-8 text-center">
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-purple to-brand-blue text-4xl shadow-lg shadow-brand-purple/30">
              🎬
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-brand-navy">{party.title}</h1>
            <p className="text-brand-navy/60">
              Hosted by <span className="font-bold text-brand-purple">{party.host.name}</span>
            </p>
            
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <div className="rounded-xl bg-brand-navy/5 px-4 py-2 text-sm font-medium text-brand-navy/70">
                Code: <span className="font-mono font-bold text-brand-navy">{party.roomCode}</span>
              </div>
              <div className="rounded-xl bg-brand-navy/5 px-4 py-2 text-sm font-medium text-brand-navy/70">
                {party.participantCount} {party.participantCount === 1 ? "person" : "people"} watching
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs font-medium text-brand-navy/50 uppercase tracking-wider">
              <span>Status: {party.statusLabel}</span>
              <span>•</span>
              <span>{party.isPlaying ? "Playing" : "Paused"}</span>
              <span>•</span>
              <span>{party.playbackPosition}</span>
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-5">
            <p className="text-sm leading-relaxed text-brand-blue-dark">
              <strong className="block mb-1 text-brand-blue">👁️ Guest Mode</strong>
              You can watch the synced stream and participate in text chat. Sign up for full features like voice chat and reactions!
            </p>
          </div>

          <div className="space-y-6">
            {joinError && (
              <div className="rounded-2xl border border-brand-coral/30 bg-brand-coral/10 p-4">
                <p className="flex items-center gap-2 text-sm font-medium text-brand-coral">
                  <span>❌</span>
                  {joinError}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="guestName" className="block text-xs font-bold uppercase tracking-[0.25em] text-brand-navy/50 ml-1">
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
                className="w-full rounded-2xl border border-brand-navy/10 bg-white/50 px-5 py-4 text-base text-brand-navy placeholder:text-brand-navy/30 focus:border-brand-purple/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 transition-all"
              />
            </div>

            <button
              onClick={handleJoinParty}
              className="w-full rounded-2xl bg-gradient-to-r from-brand-purple to-brand-blue px-6 py-4 text-lg font-bold text-white shadow-lg shadow-brand-purple/25 transition-all hover:-translate-y-0.5 hover:shadow-brand-purple/40 hover:shadow-xl"
            >
              Join Party
            </button>

            <a
              href="/auth/register"
              className="block text-center text-sm font-medium text-brand-purple hover:text-brand-purple-dark hover:underline decoration-brand-purple/30 underline-offset-4 transition-all"
            >
              Create an account for full features →
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Check if current user is the host
  const isHost = !!authUser && party.host.id === authUser.id

  return (
    <PublicPartyLayout
      party={party}
      guestName={guestName}
      isAuthenticated={!!authUser}
      userId={authUser?.id}
      isHost={isHost}
      onLeave={() => setHasJoined(false)}
    />
  )
}
