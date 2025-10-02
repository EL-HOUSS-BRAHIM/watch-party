'use client'

import { useState, useEffect, use } from "react"
import { PublicPartyLayout } from "@/components/party/public-party-layout"

interface PublicPartyPageProps {
  params: Promise<{
    code: string
  }>
}

interface PartyData {
  id: string
  code: string
  name: string
  host: {
    username: string
  }
  member_count: number
  current_video?: {
    id: string
    title: string
    url: string
    duration: number
  }
  settings: {
    is_public: boolean
    allow_guest_chat: boolean
  }
}

/**
 * Public Party Page - Anonymous users can join with limited features
 * Features: Video sync + basic text chat only
 * No: Voice chat, emoji reactions, polls, games, etc.
 */
export default function PublicPartyPage({ params }: PublicPartyPageProps) {
  const resolvedParams = use(params)
  const [party, setParty] = useState<PartyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [guestName, setGuestName] = useState("")
  const [hasJoined, setHasJoined] = useState(false)

  useEffect(() => {
    loadPartyData()
  }, [resolvedParams.code])

  const loadPartyData = async () => {
    try {
      // Fetch public party data (no auth required)
      const response = await fetch(`/api/parties/public/${resolvedParams.code}/`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Party not found")
        }
        throw new Error("Failed to load party")
      }
      
      const data = await response.json()
      
      // Check if party allows guests
      if (!data.settings?.is_public || !data.settings?.allow_guest_chat) {
        throw new Error("This party is private")
      }
      
      setParty(data)
    } catch (err) {
      console.error("Failed to load party:", err)
      setError(err instanceof Error ? err.message : "Failed to load party")
    } finally {
      setLoading(false)
    }
  }

  const [joinError, setJoinError] = useState<string | null>(null)

  const handleJoinParty = () => {
    setJoinError(null)
    if (!guestName.trim()) {
      setJoinError("Please enter a name to join")
      return
    }
    if (guestName.length < 2) {
      setJoinError("Name must be at least 2 characters")
      return
    }
    setHasJoined(true)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-white/70">Loading party...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !party) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white/5 p-8 text-center backdrop-blur-sm">
          <div className="mb-4 text-6xl">😕</div>
          <h1 className="mb-2 text-2xl font-bold text-white">
            {error || "Party not found"}
          </h1>
          <p className="mb-6 text-white/70">
            {error === "This party is private" 
              ? "This party doesn't allow guest access. Please ask the host for an invite."
              : "The party code might be incorrect or the party may have ended."}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white hover:shadow-lg transition-all"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }

  // Join screen (before entering party)
  if (!hasJoined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white/5 p-8 backdrop-blur-sm border border-white/10">
          <div className="mb-6 text-center">
            <div className="mb-4 text-6xl">🎬</div>
            <h1 className="mb-2 text-3xl font-bold text-white">{party.name}</h1>
            <p className="text-white/70">
              Hosted by <span className="font-semibold text-purple-400">@{party.host.username}</span>
            </p>
            <p className="mt-2 text-sm text-white/50">
              {party.member_count} {party.member_count === 1 ? 'person' : 'people'} watching
            </p>
          </div>

          <div className="mb-6 rounded-lg bg-blue-500/10 border border-blue-500/30 p-4">
            <p className="text-sm text-blue-300">
              <strong>👁️ Guest Mode:</strong> You can watch and chat in text only. 
              Sign up for full features like voice chat and reactions!
            </p>
          </div>

          <div className="space-y-4">
            {joinError && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                <p className="text-sm text-red-300 flex items-center gap-2">
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
                  setJoinError(null) // Clear error on input
                }}
                placeholder="Guest123"
                maxLength={20}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <button
              onClick={handleJoinParty}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 py-3 font-semibold text-white hover:shadow-lg transition-all"
            >
              Join Party
            </button>

            <a
              href="/auth/register"
              className="block text-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Create an account for full features →
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Party room (after joining)
  return (
    <PublicPartyLayout 
      party={party} 
      guestName={guestName}
      onLeave={() => setHasJoined(false)}
    />
  )
}
