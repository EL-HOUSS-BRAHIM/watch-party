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
          // Use full_name, or construct from first_name + last_name, or fallback to "User"
          const firstName = profile.first_name || ''
          const lastName = profile.last_name || ''
          const constructedName = (firstName + ' ' + lastName).trim()
          const displayName = profile.full_name || constructedName || "User"
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
      <div className="relative flex min-h-screen items-center justify-center px-4 py-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-cyan/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="glass-panel w-full max-w-lg rounded-[2.5rem] p-16 text-center relative z-10 shadow-2xl border-2 border-white/30">
          {/* Loading Spinner */}
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute w-24 h-24 rounded-full border-4 border-brand-purple/20 animate-ping" />
            <div className="w-20 h-20 rounded-full border-4 border-transparent border-t-brand-magenta border-r-brand-purple animate-spin" />
            <div className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-brand-magenta to-brand-cyan opacity-20 animate-pulse" />
          </div>

          <h2 className="text-3xl font-black text-brand-navy mb-3">Loading Party...</h2>
          <p className="text-lg text-brand-navy/60">Setting up your watch experience</p>
          
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className="w-2 h-2 rounded-full bg-brand-purple/40 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !party) {
    const isPrivate = error === "This party is private"
    const isNotFound = error?.includes("not found")
    
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4 py-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-brand-coral/15 via-transparent to-transparent blur-3xl" />
        </div>

        <div className="glass-panel w-full max-w-xl rounded-[2.5rem] p-12 text-center relative z-10 shadow-2xl border-2 border-white/30">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-brand-coral/20 to-brand-orange/20 mb-8 shadow-xl">
            <span className="text-7xl">{isPrivate ? "🔒" : isNotFound ? "🔍" : "😕"}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-black text-brand-navy mb-4">
            {isPrivate ? "Private Party" : isNotFound ? "Party Not Found" : "Oops!"}
          </h1>

          {/* Message */}
          <p className="text-lg text-brand-navy/70 leading-relaxed mb-8 max-w-md mx-auto">
            {isPrivate ? (
              <>
                This party is <strong className="text-brand-coral">invitation-only</strong>. 
                Please ask the host for access or check if you have the correct link.
              </>
            ) : isNotFound ? (
              <>
                We couldn't find a party with that code. It might have ended, been removed, 
                or the code could be incorrect.
              </>
            ) : (
              <>
                Something went wrong loading this party. The party may have ended or 
                there might be a connection issue.
              </>
            )}
          </p>

          {/* Error Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-coral/10 border border-brand-coral/30 mb-8">
            <span className="text-sm font-bold text-brand-coral">{error}</span>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full rounded-2xl bg-gradient-to-r from-brand-magenta via-brand-purple to-brand-cyan px-8 py-4 text-lg font-bold text-white shadow-xl shadow-brand-purple/30 transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-brand-magenta/40 active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                🏠 Go to Homepage
              </span>
            </button>

            <button
              onClick={() => (window.location.href = "/join")}
              className="w-full rounded-2xl bg-white/80 border-2 border-brand-navy/10 px-8 py-4 text-lg font-bold text-brand-navy shadow-lg hover:bg-white hover:border-brand-purple/30 hover:shadow-xl transition-all"
            >
              <span className="flex items-center justify-center gap-2">
                🎟️ Try Another Code
              </span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!hasJoined) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4 py-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-magenta/15 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-brand-blue/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-brand-purple/10 via-transparent to-transparent" />
        </div>

        <div className="glass-panel w-full max-w-2xl rounded-[2.5rem] p-8 sm:p-12 lg:p-14 relative z-10 shadow-2xl border-2 border-white/30">
          {/* Header */}
          <div className="text-center mb-10">
            {/* Animated Icon */}
            <div className="relative inline-flex items-center justify-center mb-8">
              <div className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-brand-magenta/30 to-brand-cyan/30 blur-2xl animate-pulse" />
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-magenta via-brand-purple to-brand-cyan flex items-center justify-center shadow-2xl shadow-brand-purple/40 animate-float">
                <span className="text-5xl">🎬</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-brand-cyan/10 to-brand-blue/10 border border-brand-cyan/30 mb-5">
              <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
              <span className="text-sm font-bold text-brand-cyan-dark uppercase tracking-wide">
                {party.statusLabel} • {party.isPlaying ? "Now Playing" : "Paused"}
              </span>
            </div>

            {/* Party Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy mb-3 tracking-tight">
              {party.title}
            </h1>

            {/* Host Info */}
            <div className="flex items-center justify-center gap-2 text-brand-navy/70 mb-6">
              <span className="text-sm">Hosted by</span>
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/20">
                <span className="text-lg">{party.host.isPremium ? "👑" : "🎭"}</span>
                <span className="font-bold text-brand-purple">{party.host.name}</span>
              </div>
            </div>

            {/* Info Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <div className="px-5 py-2 rounded-xl bg-white/60 border border-brand-navy/10 shadow-sm">
                <div className="text-xs text-brand-navy/50 font-medium uppercase tracking-wider mb-0.5">
                  Room Code
                </div>
                <div className="text-sm font-mono font-black text-brand-navy tracking-wider">
                  {party.roomCode}
                </div>
              </div>

              <div className="px-5 py-2 rounded-xl bg-white/60 border border-brand-navy/10 shadow-sm">
                <div className="text-xs text-brand-navy/50 font-medium uppercase tracking-wider mb-0.5">
                  Watching
                </div>
                <div className="text-sm font-black text-brand-navy">
                  {party.participantCount} {party.participantCount === 1 ? "Person" : "People"}
                </div>
              </div>

              {party.playbackPosition && (
                <div className="px-5 py-2 rounded-xl bg-white/60 border border-brand-navy/10 shadow-sm">
                  <div className="text-xs text-brand-navy/50 font-medium uppercase tracking-wider mb-0.5">
                    Playback
                  </div>
                  <div className="text-sm font-mono font-black text-brand-navy">
                    {party.playbackPosition}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Guest Mode Info */}
          <div className="rounded-2xl border-2 border-brand-blue/20 bg-gradient-to-br from-brand-blue/5 to-brand-cyan/5 p-6 mb-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-brand-blue/20 flex items-center justify-center">
                  <span className="text-2xl">👁️</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-brand-blue-dark mb-2">Guest Mode</h3>
                <p className="text-sm text-brand-navy/70 leading-relaxed">
                  You'll watch the synced stream and can use text chat. 
                  <strong className="text-brand-blue-dark"> Sign up for premium features</strong> like 
                  voice chat, reactions, and your own watch parties!
                </p>
              </div>
            </div>
          </div>

          {/* Join Form */}
          <div className="space-y-6">
            {/* Error Message */}
            {joinError && (
              <div className="rounded-2xl border-2 border-brand-coral/30 bg-brand-coral/10 p-5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-sm font-bold text-brand-coral">{joinError}</p>
                </div>
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-3">
              <label 
                htmlFor="guestName" 
                className="block text-sm font-bold text-brand-navy/60 uppercase tracking-widest ml-1"
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
                className="w-full rounded-2xl border-2 border-brand-purple/20 bg-white/80 px-6 py-5 text-lg font-semibold text-brand-navy placeholder:text-brand-navy/30 focus:border-brand-magenta focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-magenta/20 transition-all shadow-lg shadow-brand-purple/10"
              />
              <p className="text-xs text-brand-navy/50 ml-1">
                This is how others will see you in the chat
              </p>
            </div>

            {/* Join Button */}
            <button
              onClick={handleJoinParty}
              className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-magenta via-brand-purple to-brand-cyan px-8 py-5 text-xl font-bold text-white shadow-2xl shadow-brand-purple/40 transition-all hover:scale-[1.02] hover:shadow-3xl hover:shadow-brand-magenta/50 active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                🎉 Join the Party
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan via-brand-purple to-brand-magenta opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "💬", text: "Live Chat", color: "cyan" },
                { icon: "🎭", text: "Reactions", color: "purple" },
                { icon: "📺", text: "Synced Video", color: "blue" },
                { icon: "🔒", text: "Safe & Secure", color: "magenta" },
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/60 border border-brand-navy/10 shadow-sm hover:shadow-md hover:bg-white/80 transition-all"
                >
                  <span className="text-xl">{feature.icon}</span>
                  <span className="text-sm font-semibold text-brand-navy/70">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-brand-navy/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white/80 px-4 py-1 rounded-full text-xs text-brand-navy/50 font-medium uppercase tracking-wider">
                or
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-sm text-brand-navy/70 mb-4">
              Want the full experience with voice chat and more?
            </p>
            <a
              href="/auth/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/80 border-2 border-brand-cyan/30 text-brand-cyan-dark font-bold shadow-lg shadow-brand-cyan/10 hover:bg-brand-cyan/10 hover:border-brand-cyan hover:shadow-xl hover:shadow-brand-cyan/20 hover:-translate-y-0.5 transition-all"
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
