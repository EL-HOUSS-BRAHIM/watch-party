"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { partiesApi, WatchParty } from "@/lib/api-client"

export default function RoomsPage() {
  const [myParties, setMyParties] = useState<WatchParty[]>([])
  const [joinedParties, setJoinedParties] = useState<WatchParty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"hosting" | "joined">("hosting")

  useEffect(() => {
    loadParties()
  }, [])

  const loadParties = async () => {
    setLoading(true)
    setError(null)

    try {
      // Load parties where user is host
      const myPartiesResponse = await partiesApi.list({ 
        page_size: 50 
        // Note: We'd need to add a "host=me" filter to the API
      })
      const myPartiesList = Array.isArray(myPartiesResponse) 
        ? myPartiesResponse 
        : (myPartiesResponse.results || [])

      // For now, we'll use all parties and filter on frontend
      // In production, the API should support filtering by host/participant
      setMyParties(myPartiesList)
      setJoinedParties([]) // Would be loaded separately

    } catch (err) {
      console.error('Failed to load parties:', err)
      setError('Failed to load your parties. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteParty = async (partyId: string) => {
    if (!confirm("Are you sure you want to delete this party? This action cannot be undone.")) {
      return
    }

    try {
      await partiesApi.delete(partyId)
      setMyParties(prev => prev.filter(p => p.id !== partyId))
    } catch (error) {
      alert("Failed to delete party: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const handleLeaveParty = async (partyId: string) => {
    if (!confirm("Are you sure you want to leave this party?")) {
      return
    }

    try {
      await partiesApi.leave(partyId)
      setJoinedParties(prev => prev.filter(p => p.id !== partyId))
    } catch (error) {
      alert("Failed to leave party: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "text-green-400 bg-green-400/20"
      case "scheduled": return "text-blue-400 bg-blue-400/20"
      case "paused": return "text-yellow-400 bg-yellow-400/20"
      case "ended": return "text-gray-400 bg-gray-400/20"
      case "cancelled": return "text-red-400 bg-red-400/20"
      default: return "text-white/60 bg-white/10"
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public": return "🌍"
      case "friends": return "👥"
      case "private": return "🔒"
      default: return "📺"
    }
  }

  const currentParties = activeTab === "hosting" ? myParties : joinedParties

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Rooms</h1>
          <p className="text-white/70">Manage your watch parties and joined sessions</p>
        </div>
        <Link
          href="/dashboard/create-party"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Create New Party
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("hosting")}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === "hosting"
              ? "bg-blue-600 text-white"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          Hosting ({myParties.length})
        </button>
        <button
          onClick={() => setActiveTab("joined")}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === "joined"
              ? "bg-blue-600 text-white"
              : "text-white/70 hover:text-white hover:bg-white/10"
          }`}
        >
          Joined ({joinedParties.length})
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadParties}
            className="mt-2 text-red-300 hover:text-red-200 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-white/20 rounded mb-3"></div>
              <div className="h-3 bg-white/10 rounded mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Parties Grid */}
      {!loading && currentParties.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {currentParties.map((party) => (
            <div
              key={party.id}
              className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-white line-clamp-2">
                  {party.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getVisibilityIcon(party.visibility)}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(party.status)}`}>
                    {party.status}
                  </span>
                </div>
              </div>

              {party.description && (
                <p className="text-white/70 text-sm mb-3 line-clamp-2">
                  {party.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-white/60">
                  <span>👥 {party.participant_count} participants</span>
                  {party.max_participants && (
                    <span className="text-white/40"> / {party.max_participants}</span>
                  )}
                </div>
                {party.video?.title && (
                  <div className="flex items-center text-sm text-white/60">
                    <span>🎬 {party.video.title}</span>
                  </div>
                )}
                {party.scheduled_start && (
                  <div className="flex items-center text-sm text-white/60">
                    <span>🕒 {new Date(party.scheduled_start).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-white/60">
                  <span>📅 Created {new Date(party.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/party/${party.id}`}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors text-center"
                >
                  {party.status === "live" ? "Join" : "View"}
                </Link>
                
                {activeTab === "hosting" && (
                  <div className="flex gap-1">
                    <Link
                      href={`/dashboard/parties/${party.id}/edit`}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                      title="Edit Party"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => handleDeleteParty(party.id)}
                      className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                      title="Delete Party"
                    >
                      🗑️
                    </button>
                  </div>
                )}

                {activeTab === "joined" && (
                  <button
                    onClick={() => handleLeaveParty(party.id)}
                    className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
                    title="Leave Party"
                  >
                    Leave
                  </button>
                )}
              </div>

              {party.invite_code && activeTab === "hosting" && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">Invite Code:</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-white/10 px-2 py-1 rounded text-sm text-white">
                        {party.invite_code}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(party.invite_code!)
                          // Could add a toast notification here
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                        title="Copy invite code"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && currentParties.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            {activeTab === "hosting" ? "🎬" : "👥"}
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {activeTab === "hosting" ? "No parties hosted yet" : "No parties joined yet"}
          </h3>
          <p className="text-white/70 mb-6">
            {activeTab === "hosting" 
              ? "Create your first watch party and invite friends to join!"
              : "Join a party to start watching with others!"
            }
          </p>
          
          <div className="flex justify-center gap-4">
            {activeTab === "hosting" ? (
              <Link
                href="/dashboard/create-party"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create Your First Party
              </Link>
            ) : (
              <>
                <Link
                  href="/parties"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Browse Parties
                </Link>
                <Link
                  href="/join"
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Join by Code
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
