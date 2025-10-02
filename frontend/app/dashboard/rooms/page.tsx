"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { partiesApi, WatchParty } from "@/lib/api-client"
import { GradientCard } from "@/components/ui/gradient-card"
import { IconButton } from "@/components/ui/icon-button"
import { LiveIndicator } from "@/components/ui/live-indicator"
import { useDesignSystem } from "@/hooks/use-design-system"

export default function RoomsPage() {
  const router = useRouter()
  const { formatNumber } = useDesignSystem()
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
      case "live": return "bg-gradient-to-r from-brand-cyan to-brand-blue text-white"
      case "scheduled": return "bg-gradient-to-r from-brand-blue to-brand-cyan text-white"
      case "paused": return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "ended": return "bg-gradient-to-r from-gray-500 to-slate-500 text-white"
      case "cancelled": return "bg-gradient-to-r from-red-500 to-brand-magenta text-white"
      default: return "bg-white/20 text-white/60"
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "live": return "🔴"
      case "scheduled": return "⏰"
      case "paused": return "⏸️"
      case "ended": return "🏁"
      case "cancelled": return "❌"
      default: return "📺"
    }
  }

  const currentParties = activeTab === "hosting" ? myParties : joinedParties

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/60">Loading your rooms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-brand-coral/20 rounded-3xl blur-xl"></div>
        <GradientCard className="relative border-purple-500/30">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  🏠 My Rooms
                </h1>
                <LiveIndicator 
                  isLive={myParties.some(p => p.status === "live")} 
                  count={myParties.filter(p => p.status === "live").length} 
                  label="Live" 
                />
              </div>
              <p className="text-white/80 text-lg">Manage your watch parties and joined sessions</p>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>🎬 Host Parties</span>
                <span>•</span>
                <span>👥 Join Sessions</span>
                <span>•</span>
                <span>⚡ Live Controls</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <IconButton
                onClick={() => router.push("/dashboard/parties/create")}
                gradient="from-brand-purple to-brand-magenta"
                className="shadow-lg hover:shadow-purple-500/25"
              >
                <span>🎬</span>
                <span className="hidden sm:inline">Create Party</span>
              </IconButton>
              <IconButton
                onClick={() => router.push("/dashboard/parties/join")}
                variant="secondary"
              >
                <span>🔗</span>
                <span className="hidden sm:inline">Join by Code</span>
              </IconButton>
            </div>
          </div>
        </GradientCard>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-black/20 p-1 rounded-2xl border border-white/10 w-fit mx-auto">
        {[
          { id: "hosting", label: "Hosting", icon: "🎬", count: myParties.length },
          { id: "joined", label: "Joined", icon: "👥", count: joinedParties.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-brand-purple to-brand-magenta text-white shadow-lg"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
            <span className="bg-white/20 text-xs px-2 py-1 rounded-full font-bold">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <GradientCard className="border-red-500/30">
          <div className="flex items-center gap-4">
            <div className="text-3xl">⚠️</div>
            <div className="flex-1">
              <p className="text-brand-coral-light font-medium">{error}</p>
              <button
                onClick={loadParties}
                className="mt-2 text-red-300 hover:text-red-200 underline text-sm"
              >
                Try again
              </button>
            </div>
          </div>
        </GradientCard>
      )}

      {/* Parties Grid */}
      {currentParties.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {currentParties.map((party) => (
            <GradientCard key={party.id} className="hover:border-purple-400/40 transition-all duration-300">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white line-clamp-2 mb-1">
                    {party.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(party.status)}`}>
                      {getStatusIcon(party.status)} {party.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xl" title={`${party.visibility} party`}>
                    {getVisibilityIcon(party.visibility)}
                  </span>
                </div>
              </div>

              {party.description && (
                <p className="text-white/70 text-sm mb-4 line-clamp-2">
                  {party.description}
                </p>
              )}

              {/* Party Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-white/60">
                  <span>👥 {formatNumber(party.participant_count)} participants</span>
                  {party.max_participants && (
                    <span className="text-white/40"> / {formatNumber(party.max_participants)}</span>
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

              {/* Actions */}
              <div className="flex gap-2 mb-4">
                <IconButton
                  onClick={() => router.push(`/party/${party.id}`)}
                  variant="primary"
                  className="flex-1"
                >
                  {party.status === "live" ? "🔴 Join Live" : "👀 View"}
                </IconButton>
                
                {activeTab === "hosting" && (
                  <div className="flex gap-1">
                    <IconButton
                      onClick={() => router.push(`/dashboard/parties/${party.id}/edit`)}
                      variant="secondary"
                      size="sm"
                    >
                      ✏️
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteParty(party.id)}
                      variant="secondary"
                      size="sm"
                      className="hover:bg-red-600/20 hover:text-brand-coral-light"
                    >
                      🗑️
                    </IconButton>
                  </div>
                )}

                {activeTab === "joined" && (
                  <IconButton
                    onClick={() => handleLeaveParty(party.id)}
                    variant="secondary"
                    size="sm"
                    className="hover:bg-red-600/20 hover:text-brand-coral-light"
                  >
                    🚪 Leave
                  </IconButton>
                )}
              </div>

              {/* Invite Code (for hosted parties) */}
              {party.invite_code && activeTab === "hosting" && (
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60">Invite Code:</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-white/10 px-2 py-1 rounded text-sm text-white font-mono">
                        {party.invite_code}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(party.invite_code!)
                          // Could add a toast notification here
                        }}
                        className="text-brand-blue-light hover:text-brand-blue-light text-sm transition-colors"
                        title="Copy invite code"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </GradientCard>
          ))}
        </div>
      ) : (
        /* Empty State */
        <GradientCard className="text-center py-16">
          <div className="text-6xl mb-4">
            {activeTab === "hosting" ? "🎬" : "👥"}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {activeTab === "hosting" ? "No parties hosted yet" : "No parties joined yet"}
          </h3>
          <p className="text-white/60 mb-6 max-w-md mx-auto">
            {activeTab === "hosting" 
              ? "Create your first watch party and invite friends to join the fun!"
              : "Join a party to start watching with others and make new connections!"
            }
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {activeTab === "hosting" ? (
              <IconButton
                onClick={() => router.push("/dashboard/parties/create")}
                className="shadow-lg hover:shadow-purple-500/25"
              >
                <span>🎬</span>
                Create Your First Party
              </IconButton>
            ) : (
              <>
                <IconButton
                  onClick={() => router.push("/dashboard/parties")}
                  className="shadow-lg hover:shadow-blue-500/25"
                >
                  <span>🔍</span>
                  Browse Parties
                </IconButton>
                <IconButton
                  onClick={() => router.push("/dashboard/parties/join")}
                  variant="secondary"
                >
                  <span>🔗</span>
                  Join by Code
                </IconButton>
              </>
            )}
          </div>
        </GradientCard>
      )}

      {/* Stats Overview */}
      {currentParties.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GradientCard gradient="from-green-500/20 to-brand-blue/20" className="text-center">
            <div className="text-2xl mb-2">🔴</div>
            <div className="text-2xl font-bold text-white">
              {formatNumber(currentParties.filter(p => p.status === "live").length)}
            </div>
            <div className="text-white/60 text-sm">Live Now</div>
          </GradientCard>

          <GradientCard gradient="from-brand-blue/20 to-brand-cyan/20" className="text-center">
            <div className="text-2xl mb-2">⏰</div>
            <div className="text-2xl font-bold text-white">
              {formatNumber(currentParties.filter(p => p.status === "scheduled").length)}
            </div>
            <div className="text-white/60 text-sm">Scheduled</div>
          </GradientCard>

          <GradientCard gradient="from-purple-500/20 to-brand-magenta/20" className="text-center">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-2xl font-bold text-white">
              {formatNumber(currentParties.reduce((sum, p) => sum + (p.participant_count || 0), 0))}
            </div>
            <div className="text-white/60 text-sm">Total Participants</div>
          </GradientCard>

          <GradientCard gradient="from-brand-orange/20 to-brand-coral/20" className="text-center">
            <div className="text-2xl mb-2">📺</div>
            <div className="text-2xl font-bold text-white">
              {formatNumber(currentParties.length)}
            </div>
            <div className="text-white/60 text-sm">Total {activeTab === "hosting" ? "Hosted" : "Joined"}</div>
          </GradientCard>
        </div>
      )}
    </div>
  )
}
