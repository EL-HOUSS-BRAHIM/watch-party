"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { partiesApi, WatchParty } from "@/lib/api-client"
import { IconButton } from "@/components/ui/icon-button"
import { LiveIndicator } from "@/components/ui/live-indicator"
import { useDesignSystem } from "@/hooks/use-design-system"

type ViewMode = "grid" | "list" | "calendar"
type TabMode = "discover" | "my-parties" | "joined" | "scheduled" | "recommended"
type FilterType = "all" | "live" | "scheduled" | "public" | "friends-only" | "trending"

export default function PartiesPage() {
  const router = useRouter()
  const { formatNumber, liveStats } = useDesignSystem()
  const [parties, setParties] = useState<WatchParty[]>([])
  const [recommendedParties, setRecommendedParties] = useState<WatchParty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [infoMessage, setInfoMessage] = useState("")
  const [activeTab, setActiveTab] = useState<TabMode>("discover")
  const [filter, setFilter] = useState<FilterType>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [inviteCode, setInviteCode] = useState("")
  const [showInviteModal, setShowInviteModal] = useState(false)

  useEffect(() => {
    loadParties()
  }, [filter, searchQuery])

  const loadParties = async () => {
    setLoading(true)
    setError("")
    setInfoMessage("")

    try {
      let partiesList: WatchParty[] = []

      if (searchQuery.trim()) {
        const response = await partiesApi.search(searchQuery)
        partiesList = response.results
      } else if (filter === "public") {
        const response = await partiesApi.getPublic()
        partiesList = response.results
      } else if (filter === "recent") {
        const response = await partiesApi.getRecent()
        partiesList = response.results
      } else if (filter === "trending") {
        partiesList = await partiesApi.getTrending()

        if (partiesList.length === 0) {
          setInfoMessage("No trending parties are live right now. Check back soon or explore recent parties.")
        }
      } else {
        const response = await partiesApi.list({ page_size: 20 })
        partiesList = response.results
      }

      setParties(partiesList)
    } catch (error) {
      setInfoMessage("")
      setError(error instanceof Error ? error.message : "Failed to load parties")
    } finally {
      setLoading(false)
    }
  }

  const handleJoinParty = async (partyId: string, roomCode?: string) => {
    try {
      await partiesApi.join(partyId)
      // Redirect using room_code if available, otherwise use partyId
      window.location.href = `/party/${roomCode || partyId}`
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to join party"
      const lowerMessage = errorMessage.toLowerCase()
      // If already joined or is host, just redirect to the party
      if (lowerMessage.includes("already joined") || 
          lowerMessage.includes("already a participant") ||
          lowerMessage.includes("already") ||
          lowerMessage.includes("host")) {
        window.location.href = `/party/${roomCode || partyId}`
        return
      }
      alert(errorMessage)
    }
  }

  const _getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "text-brand-cyan-light bg-green-400/20"
      case "scheduled": return "text-brand-blue-light bg-blue-400/20"
      case "ended": return "text-gray-400 bg-gray-400/20"
      case "cancelled": return "text-brand-coral-light bg-red-400/20"
      default: return "text-brand-orange-light bg-yellow-400/20"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="loading-reel mx-auto mb-6"></div>
          <p className="text-brand-navy/60 font-medium animate-pulse">Loading parties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 via-brand-magenta/20 to-brand-orange/20 rounded-2xl sm:rounded-3xl blur-3xl opacity-60 pointer-events-none"></div>
        <div className="glass-panel relative rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 border-brand-purple/20">
          <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:justify-between lg:items-center">
            <div className="space-y-2">
              <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4">
                <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-brand-navy">
                  <span className="gradient-text">Watch Parties</span>
                </h1>
                <LiveIndicator isLive={true} count={liveStats.activeParties} label="Live Parties" />
              </div>
              <p className="text-brand-navy/70 text-sm sm:text-base lg:text-lg">Join the global cinema experience with {formatNumber(liveStats.onlineUsers)} movie lovers</p>
              <div className="hidden xs:flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-brand-navy/50 font-medium flex-wrap">
                <span>🌍 Global Community</span>
                <span>•</span>
                <span>⚡ Instant Join</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">🎭 All Genres</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex gap-1 bg-white/50 p-1 rounded-lg sm:rounded-xl border border-brand-navy/5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center ${
                    viewMode === "grid" ? "bg-brand-navy text-white shadow-md" : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
                  }`}
                >
                  ⚏
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center ${
                    viewMode === "list" ? "bg-brand-navy text-white shadow-md" : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
                  }`}
                >
                  ☰
                </button>
              </div>
              <IconButton
                onClick={() => router.push("/dashboard/parties/create")}
                className="btn-gradient shadow-lg hover:shadow-brand-purple/25 border-none min-h-[44px]"
              >
                <span>✨</span>
                <span className="hidden sm:inline">Host Party</span>
              </IconButton>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
        <div className="space-y-4 sm:space-y-6">
          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-5 flex items-center pointer-events-none">
              <span className="text-brand-navy/40 text-lg sm:text-xl group-focus-within:text-brand-purple transition-colors">🔍</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parties, hosts, or genres..."
              className="w-full pl-10 sm:pl-14 pr-10 sm:pr-6 py-3 sm:py-4 bg-white/50 border border-brand-navy/10 rounded-xl sm:rounded-2xl text-sm sm:text-base text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple/30 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-brand-navy/40 hover:text-brand-navy transition-colors min-h-[44px]"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {[
              { key: "all", label: "All Parties", icon: "🌍", count: parties.length },
              { key: "public", label: "Public", icon: "👥", count: parties.filter(p => p.visibility === 'public').length },
              { key: "recent", label: "Recent", icon: "🕒", count: parties.filter(p => new Date(p.created_at) > new Date(Date.now() - 24*60*60*1000)).length },
              { key: "trending", label: "Trending", icon: "🔥", count: parties.filter(p => p.participant_count > 10).length },
            ].map(({ key, label, icon, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 min-h-[40px] sm:min-h-[44px] ${
                  filter === key
                    ? "bg-brand-navy text-white shadow-lg scale-105"
                    : "bg-white/50 text-brand-navy/60 hover:bg-white hover:text-brand-navy hover:shadow-md"
                }`}
              >
                <span>{icon}</span>
                <span className="hidden xs:inline">{label}</span>
                <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold ${
                  filter === key ? "bg-white/20 text-white" : "bg-brand-navy/5 text-brand-navy/40"
                }`}>{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-card border-brand-coral/30 bg-brand-coral/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
          <div className="text-2xl sm:text-3xl">⚠️</div>
          <div>
            <p className="text-brand-coral-dark font-bold text-sm sm:text-base">{error}</p>
            <button
              onClick={loadParties}
              className="mt-1 text-brand-coral hover:text-brand-coral-dark underline text-xs sm:text-sm font-medium min-h-[44px] inline-flex items-center"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Informational State */}
      {!loading && infoMessage && (
        <div className="glass-card border-brand-blue/30 bg-brand-blue/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
          <div className="text-2xl sm:text-3xl">ℹ️</div>
          <p className="text-brand-blue-dark font-medium text-sm sm:text-base">{infoMessage}</p>
        </div>
      )}

      {/* Enhanced Parties Display */}
      {!loading && parties.length > 0 && (
        <div className={viewMode === "grid" ? "grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3" : "space-y-3 sm:space-y-4"}>
          {parties.map((party) => (
            <div
              key={party.id}
              className="glass-card group rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5"
            >
              <div className="space-y-3 sm:space-y-5">
                {/* Party Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 pr-2 sm:pr-4">
                    <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-purple to-brand-blue rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md group-hover:scale-110 transition-transform">
                        {party.title.charAt(0)}
                      </div>
                      <h3 className="text-sm sm:text-lg font-bold text-brand-navy line-clamp-1 group-hover:text-brand-purple transition-colors">
                        {party.title}
                      </h3>
                    </div>
                    {party.description && (
                      <p className="text-brand-navy/60 text-xs sm:text-sm line-clamp-2 font-medium pl-1">
                        {party.description}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    <LiveIndicator 
                      isLive={party.status === "live"} 
                      label={party.status === "live" ? "LIVE" : party.status.toUpperCase()}
                    />
                  </div>
                </div>

                {/* Party Stats */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="bg-white/40 border border-white/50 rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center transition-colors group-hover:bg-white/60">
                    <div className="text-base sm:text-xl mb-0.5 sm:mb-1">👥</div>
                    <div className="text-xs sm:text-sm font-bold text-brand-navy">
                      {formatNumber(party.participant_count)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-brand-navy/50 font-medium uppercase tracking-wide">Watching</div>
                  </div>
                  <div className="bg-white/40 border border-white/50 rounded-xl sm:rounded-2xl p-2 sm:p-3 text-center transition-colors group-hover:bg-white/60">
                    <div className="text-base sm:text-xl mb-0.5 sm:mb-1">🎬</div>
                    <div className="text-xs sm:text-sm font-bold text-brand-navy truncate px-1">
                      {party.video?.title || "No video"}
                    </div>
                    <div className="text-[10px] sm:text-xs text-brand-navy/50 font-medium uppercase tracking-wide">Playing</div>
                  </div>
                </div>

                {/* Host Info */}
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-brand-navy/5 rounded-xl sm:rounded-2xl border border-transparent group-hover:border-brand-navy/5 transition-colors">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-brand-navy text-white rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-sm">
                    {(party.host?.name || party.host?.username)?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-brand-navy font-bold text-xs sm:text-sm truncate">
                      {party.host?.name || party.host?.username || "Unknown Host"}
                    </div>
                    <div className="text-brand-navy/50 text-[10px] sm:text-xs font-medium truncate">
                      {party.scheduled_start 
                        ? `Starts ${new Date(party.scheduled_start).toLocaleString()}`
                        : `Created ${new Date(party.created_at).toLocaleDateString()}`
                      }
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1 sm:pt-2">
                  <IconButton
                    onClick={() => handleJoinParty(party.id, party.room_code)}
                    disabled={party.status === "ended" || party.status === "cancelled"}
                    className={`flex-1 font-bold border-none min-h-[40px] sm:min-h-[44px] text-xs sm:text-sm ${
                      party.status === "live" 
                        ? "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20" 
                        : "bg-brand-navy text-white hover:bg-brand-navy-light shadow-lg shadow-brand-navy/20"
                    }`}
                  >
                    {party.status === "live" ? (
                      <>🚀 <span className="hidden xs:inline">Join </span>Live</>
                    ) : party.status === "scheduled" ? (
                      <>📅 Join</>
                    ) : (
                      <>👀 View</>
                    )}
                  </IconButton>
                  <IconButton
                    onClick={() => router.push(`/party/${party.room_code || party.id}`)}
                    variant="secondary"
                    className="bg-white hover:bg-brand-purple/10 hover:text-brand-purple border-brand-navy/10 min-h-[40px] sm:min-h-[44px] min-w-[40px] sm:min-w-[44px]"
                  >
                    ℹ️
                  </IconButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Empty State */}
      {!loading && parties.length === 0 && (
        <div className="glass-card rounded-2xl sm:rounded-3xl text-center py-12 sm:py-20 px-4 sm:px-6">
          <div className="space-y-4 sm:space-y-6">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-brand-purple to-brand-blue rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-5xl shadow-2xl shadow-brand-purple/20 animate-float">
              🎬
            </div>
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-navy">
                {searchQuery ? "No parties found" : "No parties available"}
              </h3>
              <p className="text-brand-navy/60 max-w-md mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
                {searchQuery 
                  ? `No parties match "${searchQuery}". Try adjusting your search or filters.`
                  : "Be the first to create an epic watch party and invite the community!"
                }
              </p>
            </div>
            
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center items-center pt-2 sm:pt-4">
              {searchQuery && (
                <IconButton
                  onClick={() => setSearchQuery("")}
                  variant="secondary"
                  className="bg-white hover:bg-brand-neutral px-4 sm:px-6 min-h-[44px] w-full xs:w-auto"
                >
                  <span>🔄</span>
                  Clear Search
                </IconButton>
              )}
              <IconButton
                onClick={() => router.push("/dashboard/parties/create")}
                className="btn-gradient shadow-xl hover:shadow-brand-purple/25 px-6 py-3 sm:px-8 sm:py-4 text-sm sm:text-lg min-h-[44px] w-full xs:w-auto"
              >
                <span>✨</span>
                {searchQuery ? "Create New Party" : "Host Your First Party"}
              </IconButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}