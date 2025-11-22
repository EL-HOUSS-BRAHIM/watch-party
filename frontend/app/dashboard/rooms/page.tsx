"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { partiesApi, WatchParty } from "@/lib/api-client"
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
      case "paused": return "bg-gradient-to-r from-brand-orange to-brand-coral text-white"
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="loading-reel mx-auto mb-6"></div>
          <p className="text-brand-navy/60 font-medium animate-pulse">Loading your rooms...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 via-brand-magenta/20 to-brand-orange/20 rounded-3xl blur-3xl opacity-60"></div>
        <div className="glass-panel relative rounded-3xl p-8 border-brand-purple/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold text-brand-navy">
                  <span className="gradient-text">My Rooms</span>
                </h1>
                <LiveIndicator 
                  isLive={myParties.some(p => p.status === "live")} 
                  count={myParties.filter(p => p.status === "live").length} 
                  label="Live" 
                />
              </div>
              <p className="text-brand-navy/70 text-lg">Manage your watch parties and joined sessions</p>
              <div className="flex items-center gap-4 text-sm text-brand-navy/50 font-medium">
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
                className="btn-gradient shadow-lg hover:shadow-brand-purple/25 border-none"
              >
                <span>🎬</span>
                <span className="hidden sm:inline">Create Party</span>
              </IconButton>
              <IconButton
                onClick={() => router.push("/dashboard/parties/join")}
                variant="secondary"
                className="bg-white/50 hover:bg-white border-brand-navy/10"
              >
                <span>🔗</span>
                <span className="hidden sm:inline">Join by Code</span>
              </IconButton>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/40 p-1.5 rounded-2xl border border-white/60 backdrop-blur-md w-fit mx-auto shadow-sm">
        {[
          { id: "hosting", label: "Hosting", icon: "🎬", count: myParties.length },
          { id: "joined", label: "Joined", icon: "👥", count: joinedParties.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-brand-navy text-white shadow-lg"
                : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === tab.id ? "bg-white/20 text-white" : "bg-brand-navy/5 text-brand-navy/60"
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-card rounded-2xl p-6 border-brand-coral/30 bg-brand-coral/5">
          <div className="flex items-center gap-4">
            <div className="text-3xl">⚠️</div>
            <div className="flex-1">
              <p className="text-brand-coral-dark font-bold">{error}</p>
              <button
                onClick={loadParties}
                className="mt-2 text-brand-coral hover:text-brand-coral-dark underline text-sm font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parties Grid */}
      {currentParties.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {currentParties.map((party) => (
            <div key={party.id} className="glass-card group rounded-3xl p-6 hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-brand-navy line-clamp-2 mb-2 group-hover:text-brand-purple transition-colors">
                    {party.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs rounded-full font-bold uppercase tracking-wide ${
                      party.status === "live" ? "bg-red-100 text-red-600 animate-pulse" :
                      party.status === "scheduled" ? "bg-brand-blue/10 text-brand-blue" :
                      party.status === "ended" ? "bg-brand-navy/5 text-brand-navy/40" :
                      "bg-brand-orange/10 text-brand-orange-dark"
                    }`}>
                      {getStatusIcon(party.status)} {party.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xl p-2 rounded-full bg-white/50" title={`${party.visibility} party`}>
                    {getVisibilityIcon(party.visibility)}
                  </span>
                </div>
              </div>

              {party.description && (
                <p className="text-brand-navy/60 text-sm mb-5 line-clamp-2 font-medium">
                  {party.description}
                </p>
              )}

              {/* Party Info */}
              <div className="space-y-3 mb-6 p-4 rounded-2xl bg-white/40 border border-white/50">
                <div className="flex items-center text-sm text-brand-navy/70 font-medium">
                  <span className="w-6 text-center mr-2">👥</span>
                  <span>{formatNumber(party.participant_count)} participants</span>
                  {party.max_participants && (
                    <span className="text-brand-navy/40 ml-1"> / {formatNumber(party.max_participants)}</span>
                  )}
                </div>
                
                {party.video?.title && (
                  <div className="flex items-center text-sm text-brand-navy/70 font-medium">
                    <span className="w-6 text-center mr-2">🎬</span>
                    <span className="truncate">{party.video.title}</span>
                  </div>
                )}
                
                {party.scheduled_start && (
                  <div className="flex items-center text-sm text-brand-navy/70 font-medium">
                    <span className="w-6 text-center mr-2">🕒</span>
                    <span>{new Date(party.scheduled_start).toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm text-brand-navy/70 font-medium">
                  <span className="w-6 text-center mr-2">📅</span>
                  <span>Created {new Date(party.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mb-4">
                <IconButton
                  onClick={() => router.push(`/party/${party.id}`)}
                  className={`flex-1 font-bold ${party.status === "live" ? "bg-red-500 hover:bg-red-600 text-white border-none" : "bg-brand-navy text-white hover:bg-brand-navy-light border-none"}`}
                >
                  {party.status === "live" ? "🔴 Join Live" : "👀 View"}
                </IconButton>
                
                {activeTab === "hosting" && (
                  <div className="flex gap-2">
                    <IconButton
                      onClick={() => router.push(`/dashboard/parties/${party.id}/edit`)}
                      variant="secondary"
                      size="sm"
                      className="bg-white hover:bg-brand-purple/10 hover:text-brand-purple border-brand-navy/10"
                    >
                      ✏️
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteParty(party.id)}
                      variant="secondary"
                      size="sm"
                      className="bg-white hover:bg-red-50 hover:text-red-500 border-brand-navy/10"
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
                    className="bg-white hover:bg-red-50 hover:text-red-500 border-brand-navy/10"
                  >
                    🚪 Leave
                  </IconButton>
                )}
              </div>

              {/* Invite Code (for hosted parties) */}
              {party.invite_code && activeTab === "hosting" && (
                <div className="pt-4 border-t border-brand-navy/5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-navy/40 uppercase tracking-wider">Invite Code</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-brand-navy/5 px-3 py-1.5 rounded-lg text-sm text-brand-navy font-mono font-bold border border-brand-navy/5">
                        {party.invite_code}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(party.invite_code!)
                          // Could add a toast notification here
                        }}
                        className="text-brand-blue hover:text-brand-blue-dark text-sm transition-colors p-1.5 hover:bg-brand-blue/10 rounded-lg"
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
      ) : (
        /* Empty State */
        <div className="glass-card rounded-3xl text-center py-20 px-6">
          <div className="text-7xl mb-6 opacity-50 animate-float">
            {activeTab === "hosting" ? "🎬" : "👥"}
          </div>
          <h3 className="text-3xl font-bold text-brand-navy mb-3">
            {activeTab === "hosting" ? "No parties hosted yet" : "No parties joined yet"}
          </h3>
          <p className="text-brand-navy/60 mb-8 max-w-md mx-auto text-lg">
            {activeTab === "hosting" 
              ? "Create your first watch party and invite friends to join the fun!"
              : "Join a party to start watching with others and make new connections!"
            }
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {activeTab === "hosting" ? (
              <IconButton
                onClick={() => router.push("/dashboard/parties/create")}
                className="btn-gradient shadow-xl hover:shadow-brand-purple/25 px-8 py-4 text-lg"
              >
                <span>🎬</span>
                Create Your First Party
              </IconButton>
            ) : (
              <>
                <IconButton
                  onClick={() => router.push("/dashboard/parties")}
                  className="bg-brand-blue text-white hover:bg-brand-blue-dark shadow-lg px-6"
                >
                  <span>🔍</span>
                  Browse Parties
                </IconButton>
                <IconButton
                  onClick={() => router.push("/dashboard/parties/join")}
                  variant="secondary"
                  className="bg-white hover:bg-brand-neutral px-6"
                >
                  <span>🔗</span>
                  Join by Code
                </IconButton>
              </>
            )}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {currentParties.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-5 text-center border-b-4 border-b-green-500">
            <div className="text-2xl mb-2">🔴</div>
            <div className="text-3xl font-bold text-brand-navy">
              {formatNumber(currentParties.filter(p => p.status === "live").length)}
            </div>
            <div className="text-brand-navy/50 text-sm font-bold uppercase tracking-wide">Live Now</div>
          </div>

          <div className="glass-card rounded-2xl p-5 text-center border-b-4 border-b-brand-blue">
            <div className="text-2xl mb-2">⏰</div>
            <div className="text-3xl font-bold text-brand-navy">
              {formatNumber(currentParties.filter(p => p.status === "scheduled").length)}
            </div>
            <div className="text-brand-navy/50 text-sm font-bold uppercase tracking-wide">Scheduled</div>
          </div>

          <div className="glass-card rounded-2xl p-5 text-center border-b-4 border-b-brand-purple">
            <div className="text-2xl mb-2">👥</div>
            <div className="text-3xl font-bold text-brand-navy">
              {formatNumber(currentParties.reduce((sum, p) => sum + (p.participant_count || 0), 0))}
            </div>
            <div className="text-brand-navy/50 text-sm font-bold uppercase tracking-wide">Total Participants</div>
          </div>

          <div className="glass-card rounded-2xl p-5 text-center border-b-4 border-b-brand-orange">
            <div className="text-2xl mb-2">📺</div>
            <div className="text-3xl font-bold text-brand-navy">
              {formatNumber(currentParties.length)}
            </div>
            <div className="text-brand-navy/50 text-sm font-bold uppercase tracking-wide">Total {activeTab === "hosting" ? "Hosted" : "Joined"}</div>
          </div>
        </div>
      )}
    </div>
  )
}
