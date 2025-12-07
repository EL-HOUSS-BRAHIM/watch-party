'use client'

import { useState, useEffect, use } from "react"
import { PublicPartyLayout, type PublicPartyViewModel } from "@/components/party/public-party-layout"
import { authApi } from "@/lib/api-client"

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
          // Use full_name, or construct from first_name + last_name, or fallback to "User"
          const firstName = profile.first_name || ''
          const lastName = profile.last_name || ''
          const constructedName = (firstName + ' ' + lastName).trim()
          const displayName = profile.full_name || constructedName || "User"
          setGuestName(displayName)
        }
      } catch (_err) {
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
      <div className="relative flex min-h-[85vh] items-center justify-center px-4 py-16">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl" />
        </div>

        <div className="glass-panel w-full max-w-lg rounded-3xl p-12 text-center relative z-10 shadow-xl">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-brand-magenta border-r-brand-purple animate-spin" />
          </div>

          <h2 className="text-2xl font-black text-brand-navy mb-2">Loading Party...</h2>
          <p className="text-base text-brand-navy/60">Setting up your watch experience</p>
        </div>
      </div>
    )
  }

  if (error || !party) {
    const isPrivate = error === "This party is private"
    const isNotFound = error?.includes("not found")
    
    return (
      <div className="relative flex min-h-[85vh] items-center justify-center px-4 py-16">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-coral/20 rounded-full blur-3xl" />
        </div>

        <div className="glass-panel w-full max-w-xl rounded-3xl p-10 text-center relative z-10 shadow-xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-coral/10 mb-6">
            <span className="text-5xl">{isPrivate ? "🔒" : isNotFound ? "🔍" : "😕"}</span>
          </div>

          <h1 className="text-3xl font-black text-brand-navy mb-3">
            {isPrivate ? "Private Party" : isNotFound ? "Party Not Found" : "Oops!"}
          </h1>

          <p className="text-base text-brand-navy/70 leading-relaxed mb-6 max-w-md mx-auto">
            {isPrivate ? (
              "This party is invitation-only. Please ask the host for access or check if you have the correct link."
            ) : isNotFound ? (
              "We couldn't find a party with that code. It might have ended, been removed, or the code could be incorrect."
            ) : (
              "Something went wrong loading this party. The party may have ended or there might be a connection issue."
            )}
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-coral/10 border border-brand-coral/30 mb-6 text-sm font-semibold text-brand-coral">
            {error}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full rounded-xl bg-gradient-to-r from-brand-magenta via-brand-purple to-brand-cyan px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]"
            >
              🏠 Go to Homepage
            </button>

            <button
              onClick={() => (window.location.href = "/join")}
              className="w-full rounded-xl bg-white border-2 border-brand-navy/10 px-6 py-3 font-bold text-brand-navy shadow-sm hover:bg-brand-navy/5 hover:shadow-md transition-all"
            >
              🎟️ Try Another Code
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!hasJoined) {
    return (
      <div className="relative flex min-h-[85vh] items-center justify-center px-4 py-16">
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-magenta/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl" />
        </div>

        <div className="glass-panel w-full max-w-2xl rounded-3xl p-8 sm:p-10 lg:p-12 relative z-10 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-magenta via-brand-purple to-brand-cyan mb-5 shadow-lg">
              <span className="text-4xl">🎬</span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
              <span className="text-xs font-bold text-brand-cyan-dark uppercase tracking-wide">
                {party.statusLabel} • {party.isPlaying ? "Now Playing" : "Paused"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-brand-navy mb-3">
              {party.title}
            </h1>

            <div className="flex items-center justify-center gap-2 text-sm text-brand-navy/70 mb-6">
              <span>Hosted by</span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20">
                <span>{party.host.isPremium ? "👑" : "🎭"}</span>
                <span className="font-bold text-brand-purple">{party.host.name}</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5 mb-6">
              <div className="px-4 py-2 rounded-lg bg-white/70 border border-brand-navy/10 text-sm">
                <div className="text-xs text-brand-navy/50 font-medium uppercase mb-0.5">Room Code</div>
                <div className="text-sm font-mono font-black text-brand-navy">{party.roomCode}</div>
              </div>

              <div className="px-4 py-2 rounded-lg bg-white/70 border border-brand-navy/10 text-sm">
                <div className="text-xs text-brand-navy/50 font-medium uppercase mb-0.5">Watching</div>
                <div className="text-sm font-black text-brand-navy">
                  {party.participantCount} {party.participantCount === 1 ? "Person" : "People"}
                </div>
              </div>

              {party.playbackPosition && (
                <div className="px-4 py-2 rounded-lg bg-white/70 border border-brand-navy/10 text-sm">
                  <div className="text-xs text-brand-navy/50 font-medium uppercase mb-0.5">Playback</div>
                  <div className="text-sm font-mono font-black text-brand-navy">{party.playbackPosition}</div>
                </div>
              )}
            </div>
          </div>

          {/* Guest Mode Info */}
          <div className="rounded-xl border-2 border-brand-blue/20 bg-brand-blue/5 p-5 mb-7">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-blue/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">👁️</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-brand-blue-dark mb-1">Guest Mode</h3>
                <p className="text-sm text-brand-navy/70 leading-relaxed">
                  You'll watch the synced stream and can use text chat. 
                  <strong className="text-brand-blue-dark"> Sign up for premium features</strong> like 
                  voice chat, reactions, and your own watch parties!
                </p>
              </div>
            </div>
          </div>

          {/* Join Form */}
          <div className="space-y-5">
            {joinError && (
              <div className="rounded-xl border-2 border-brand-coral/30 bg-brand-coral/10 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-brand-coral">
                  <span>⚠️</span>
                  {joinError}
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              <label 
                htmlFor="guestName" 
                className="block text-sm font-bold text-brand-navy/60 uppercase tracking-wide ml-1"
              >
                Your Display Name
              </label>
              <input
                id="guestName"
                type="text"
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value)
                  setJoinError(null)
                }}
                placeholder="MovieFan123"
                maxLength={20}
                className="w-full rounded-xl border-2 border-brand-purple/20 bg-white/90 px-5 py-4 text-base font-semibold text-brand-navy placeholder:text-brand-navy/30 focus:border-brand-magenta focus:bg-white focus:outline-none focus:ring-3 focus:ring-brand-magenta/20 transition-all shadow-sm"
              />
              <p className="text-xs text-brand-navy/50 ml-1">
                This is how others will see you in the chat
              </p>
            </div>

            <button
              onClick={handleJoinParty}
              className="w-full rounded-xl bg-gradient-to-r from-brand-magenta via-brand-purple to-brand-cyan px-6 py-4 text-lg font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              🎉 Join the Party
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: "💬", text: "Live Chat" },
                { icon: "🎭", text: "Reactions" },
                { icon: "📺", text: "Synced Video" },
                { icon: "🔒", text: "Secure" },
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/70 border border-brand-navy/10 text-sm"
                >
                  <span>{feature.icon}</span>
                  <span className="text-xs font-semibold text-brand-navy/70">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-navy/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-brand-navy/50 font-medium">or</span>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-sm text-brand-navy/70 mb-3">
              Want the full experience with voice chat and more?
            </p>
            <a
              href="/auth/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border-2 border-brand-cyan/30 text-brand-cyan-dark font-bold text-sm shadow-sm hover:bg-brand-cyan/10 hover:border-brand-cyan hover:shadow-md transition-all"
            >
              <span>✨</span>
              Create Free Account
              <span>→</span>
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
