"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { partiesApi, WatchParty } from "@/lib/api-client"
import { GradientCard } from "@/components/ui/gradient-card"
import { IconButton } from "@/components/ui/icon-button"
import { LiveIndicator } from "@/components/ui/live-indicator"
import { useDesignSystem } from "@/hooks/use-design-system"

export default function PartiesPage() {
  const router = useRouter()
  const { formatNumber, liveStats } = useDesignSystem()
  const [parties, setParties] = useState<WatchParty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [infoMessage, setInfoMessage] = useState("")
  const [filter, setFilter] = useState<"all" | "public" | "recent" | "trending">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

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

  const handleJoinParty = async (partyId: string) => {
    try {
      await partiesApi.join(partyId)
      window.location.href = `/party/${partyId}`
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to join party")
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

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-brand-cyan/20 rounded-3xl blur-xl"></div>
        <GradientCard className="relative border-brand-purple/30">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  🎬 Watch Parties
                </h1>
                <LiveIndicator isLive={true} count={liveStats.activeParties} label="Live Parties" />
              </div>
              <p className="text-white/80 text-lg">Join the global cinema experience with {formatNumber(liveStats.onlineUsers)} movie lovers</p>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>🌍 Global Community</span>
                <span>•</span>
                <span>⚡ Instant Join</span>
                <span>•</span>
                <span>🎭 All Genres</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex gap-1 bg-black/20 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  ⚏
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  ☰
                </button>
              </div>
              <IconButton
                onClick={() => router.push("/dashboard/parties/create")}
                className="shadow-lg hover:shadow-brand-purple/25"
              >
                <span>✨</span>
                <span className="hidden sm:inline">Host Party</span>
              </IconButton>
            </div>
          </div>
        </GradientCard>
      </div>

      {/* Enhanced Search and Filters */}
      <GradientCard gradient="from-slate-900/50 via-purple-900/30 to-slate-900/50">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-white/50 text-xl">🔍</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parties, hosts, or genres..."
              className="w-full pl-14 pr-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-brand-purple/50 backdrop-blur-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-3">
            {[
              { key: "all", label: "All Parties", icon: "🌍", count: parties.length },
              { key: "public", label: "Public", icon: "👥", count: parties.filter(p => p.visibility === 'public').length },
              { key: "recent", label: "Recent", icon: "🕒", count: parties.filter(p => new Date(p.created_at) > new Date(Date.now() - 24*60*60*1000)).length },
              { key: "trending", label: "Trending", icon: "🔥", count: parties.filter(p => p.participant_count > 10).length },
            ].map(({ key, label, icon, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  filter === key
                    ? "bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-lg scale-105"
                    : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white hover:scale-105"
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">{count}</span>
              </button>
            ))}
          </div>
        </div>
      </GradientCard>

      {/* Error State */}
      {error && (
        <div className="bg-brand-coral/10 border border-brand-coral/20 rounded-lg p-4">
          <p className="text-brand-coral-light">{error}</p>
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
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-white/20 rounded mb-3"></div>
              <div className="h-3 bg-white/10 rounded mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Informational State */}
      {!loading && infoMessage && (
        <div className="bg-brand-blue/10 border border-brand-blue/20 rounded-lg p-4">
          <p className="text-blue-300">{infoMessage}</p>
        </div>
      )}

      {/* Enhanced Parties Display */}
      {!loading && parties.length > 0 && (
        <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
          {parties.map((party) => (
            <GradientCard
              key={party.id}
              className="group hover:border-brand-purple-light/40 hover:shadow-lg hover:shadow-brand-purple/25 transition-all duration-300 hover:scale-105"
              gradient="from-slate-900/40 via-purple-900/20 to-blue-900/40"
            >
              <div className="space-y-4">
                {/* Party Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-blue rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {party.title.charAt(0)}
                      </div>
                      <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-purple-200 transition-colors">
                        {party.title}
                      </h3>
                    </div>
                    {party.description && (
                      <p className="text-white/70 text-sm line-clamp-2 mb-3">
                        {party.description}
                      </p>
                    )}
                  </div>
                  <LiveIndicator 
                    isLive={party.status === "live"} 
                    label={party.status === "live" ? "LIVE" : party.status.toUpperCase()}
                  />
                </div>

                {/* Party Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-white">👥</div>
                    <div className="text-sm text-white/60">
                      {party.participant_count} watching
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-white">🎬</div>
                    <div className="text-sm text-white/60">
                      {party.video?.title || "No video"}
                    </div>
                  </div>
                </div>

                {/* Host Info */}
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-purple rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {party.host?.username?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">
                      {party.host?.username || "Unknown Host"}
                    </div>
                    <div className="text-white/60 text-xs">
                      {party.scheduled_start 
                        ? `Starts ${new Date(party.scheduled_start).toLocaleString()}`
                        : `Created ${new Date(party.created_at).toLocaleDateString()}`
                      }
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <IconButton
                    onClick={() => handleJoinParty(party.id)}
                    disabled={party.status === "ended" || party.status === "cancelled"}
                    variant={party.status === "live" ? "primary" : "secondary"}
                    className="flex-1"
                  >
                    {party.status === "live" ? (
                      <>🚀 Join Live</>
                    ) : party.status === "scheduled" ? (
                      <>📅 Join</>
                    ) : (
                      <>👀 View</>
                    )}
                  </IconButton>
                  <IconButton
                    onClick={() => router.push(`/party/${party.id}`)}
                    variant="ghost"
                    size="md"
                  >
                    ℹ️
                  </IconButton>
                </div>
              </div>
            </GradientCard>
          ))}
        </div>
      )}

      {/* Enhanced Empty State */}
      {!loading && parties.length === 0 && (
        <GradientCard className="text-center py-16" gradient="from-purple-900/20 via-blue-900/20 to-purple-900/20">
          <div className="space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-brand-purple to-brand-blue rounded-3xl flex items-center justify-center text-4xl animate-float">
              🎬
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">
                {searchQuery ? "No parties found" : "No parties available"}
              </h3>
              <p className="text-white/70 max-w-md mx-auto leading-relaxed">
                {searchQuery 
                  ? `No parties match "${searchQuery}". Try adjusting your search or filters.`
                  : "Be the first to create an epic watch party and invite the community!"
                }
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {searchQuery && (
                <IconButton
                  onClick={() => setSearchQuery("")}
                  variant="ghost"
                >
                  <span>🔄</span>
                  Clear Search
                </IconButton>
              )}
              <IconButton
                onClick={() => router.push("/dashboard/parties/create")}
                className="shadow-lg hover:shadow-brand-purple/25"
              >
                <span>✨</span>
                {searchQuery ? "Create New Party" : "Host Your First Party"}
              </IconButton>
            </div>
          </div>
        </GradientCard>
      )}
    </div>
  )
}