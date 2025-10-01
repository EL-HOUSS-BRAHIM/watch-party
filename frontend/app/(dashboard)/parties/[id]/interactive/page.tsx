"use client"

import { useState, useEffect } from "react"
import { PollComponent, ReactionComponent, SyncControls, GameComponent } from "@/components/interactive"
import { authApi } from "@/lib/api-client"

interface InteractivePageProps {
  params: Promise<{
    id: string
  }>
}

interface Party {
  id: string
  name: string
  description?: string
  host: {
    id: string
    username: string
    avatar?: string
  }
  is_host: boolean
  member_count: number
  settings: {
    max_members?: number
    is_public: boolean
    allow_guest_chat: boolean
    video_sync_enabled: boolean
    reactions_enabled: boolean
    polls_enabled: boolean
    games_enabled: boolean
  }
}

export default function InteractivePage({ params }: InteractivePageProps) {
  const [party, setParty] = useState<Party | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"polls" | "reactions" | "sync" | "games">("polls")
  const [error, setError] = useState<string | null>(null)
  const [partyId, setPartyId] = useState<string | null>(null)

  useEffect(() => {
    params.then(resolvedParams => {
      setPartyId(resolvedParams.id)
    })
  }, [params])

  useEffect(() => {
    if (partyId) {
      loadPartyData()
      loadCurrentUser()
    }
  }, [partyId])

  const loadPartyData = async () => {
    if (!partyId) return
    
    try {
      const response = await fetch(`/api/parties/${partyId}/`, {
        credentials: "include"
      })
      
      if (!response.ok) {
        throw new Error("Failed to load party")
      }
      
      const partyData = await response.json()
      setParty(partyData)
    } catch (error) {
      console.error("Failed to load party:", error)
      setError("Failed to load party data")
    } finally {
      setLoading(false)
    }
  }

  const loadCurrentUser = async () => {
    try {
      const userData = await authApi.getProfile()
      setCurrentUser(userData)
      }
    } catch (error) {
      console.error("Failed to load user:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="h-64 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !party) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-2">Party Not Found</h1>
          <p className="text-white/60 mb-6">{error || "This party doesn't exist or you don't have access to it."}</p>
          <a
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: "polls" as const, name: "Polls", icon: "📊", enabled: party.settings.polls_enabled },
    { id: "reactions" as const, name: "Reactions", icon: "😊", enabled: party.settings.reactions_enabled },
    { id: "sync" as const, name: "Sync Controls", icon: "⏯️", enabled: party.settings.video_sync_enabled },
    { id: "games" as const, name: "Games", icon: "🎮", enabled: party.settings.games_enabled }
  ].filter(tab => tab.enabled)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Interactive Features</h1>
              <p className="text-white/60">Engage with party: {party.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-white/60">
                {party.member_count} member{party.member_count !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center gap-2">
                {party.host.avatar && (
                  <img
                    src={party.host.avatar}
                    alt={party.host.username}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="text-white/80 text-sm">
                  Host: {party.host.username}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          {tabs.length > 0 && (
            <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        {tabs.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-xl font-semibold text-white mb-2">No Interactive Features Available</h2>
            <p className="text-white/60 mb-6">
              The host has disabled all interactive features for this party.
            </p>
            <a
              href={`/dashboard/parties/${party.id}`}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Back to Party
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Feature Content */}
            {activeTab === "polls" && party.settings.polls_enabled && (
              <PollComponent
                partyId={party.id}
                currentUser={currentUser}
                isHost={party.is_host}
              />
            )}

            {activeTab === "reactions" && party.settings.reactions_enabled && (
              <ReactionComponent
                partyId={party.id}
                currentUser={currentUser}
              />
            )}

            {activeTab === "sync" && party.settings.video_sync_enabled && (
              <SyncControls
                partyId={party.id}
                currentUser={currentUser}
                isHost={party.is_host}
              />
            )}

            {activeTab === "games" && party.settings.games_enabled && (
              <GameComponent
                partyId={party.id}
                currentUser={currentUser}
                isHost={party.is_host}
              />
            )}

            {/* Quick Actions */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href={`/dashboard/parties/${party.id}`}
                  className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <span className="text-2xl">🏠</span>
                  <div>
                    <h4 className="font-medium text-white">Party Room</h4>
                    <p className="text-white/60 text-sm">Return to main party</p>
                  </div>
                </a>

                <a
                  href={`/dashboard/parties/${party.id}/chat`}
                  className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <span className="text-2xl">💬</span>
                  <div>
                    <h4 className="font-medium text-white">Chat</h4>
                    <p className="text-white/60 text-sm">Join the conversation</p>
                  </div>
                </a>

                <a
                  href={`/dashboard/parties/${party.id}/videos`}
                  className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <span className="text-2xl">🎬</span>
                  <div>
                    <h4 className="font-medium text-white">Videos</h4>
                    <p className="text-white/60 text-sm">Browse video library</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}