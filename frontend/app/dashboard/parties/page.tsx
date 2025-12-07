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
  
  // State management
  const [parties, setParties] = useState<WatchParty[]>([])
  const [_recommendedParties, setRecommendedParties] = useState<WatchParty[]>([])
  const [myHostedParties, setMyHostedParties] = useState<WatchParty[]>([])
  const [myJoinedParties, setMyJoinedParties] = useState<WatchParty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [infoMessage, setInfoMessage] = useState("")
  
  // UI State
  const [activeTab, setActiveTab] = useState<TabMode>("discover")
  const [filter, setFilter] = useState<FilterType>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [inviteCode, setInviteCode] = useState("")
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "starting-soon">("recent")

  useEffect(() => {
    loadParties()
  }, [activeTab, filter, searchQuery, sortBy])

  const loadParties = async () => {
    setLoading(true)
    setError("")
    setInfoMessage("")

    try {
      if (activeTab === "discover") {
        await loadDiscoverParties()
      } else if (activeTab === "my-parties") {
        await loadMyHostedParties()
      } else if (activeTab === "joined") {
        await loadMyJoinedParties()
      } else if (activeTab === "scheduled") {
        await loadScheduledParties()
      } else if (activeTab === "recommended") {
        await loadRecommendedParties()
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load parties")
    } finally {
      setLoading(false)
    }
  }

  const loadDiscoverParties = async () => {
    let partiesList: WatchParty[] = []

    if (searchQuery.trim()) {
      const response = await partiesApi.search(searchQuery)
      partiesList = response.results
    } else if (filter === "live") {
      const response = await partiesApi.list({ status: "live" })
      partiesList = response.results
    } else if (filter === "scheduled") {
      const response = await partiesApi.list({ status: "scheduled" })
      partiesList = response.results
    } else if (filter === "public") {
      const response = await partiesApi.getPublic()
      partiesList = response.results
    } else if (filter === "trending") {
      partiesList = await partiesApi.getTrending()
    } else {
      const response = await partiesApi.list({ page_size: 50 })
      partiesList = response.results
    }

    // Apply sorting
    partiesList = applySorting(partiesList)
    setParties(partiesList)
  }

  const loadMyHostedParties = async () => {
    const response = await partiesApi.list({})
    const hosted = response.results.filter(p => p.is_host === true)
    setMyHostedParties(applySorting(hosted))
    setParties(applySorting(hosted))
  }

  const loadMyJoinedParties = async () => {
    const response = await partiesApi.list({})
    // Filter parties where user is participant but not host
    const joined = response.results.filter(p => p.participant_count > 0)
    setMyJoinedParties(applySorting(joined))
    setParties(applySorting(joined))
  }

  const loadScheduledParties = async () => {
    const response = await partiesApi.list({ status: "scheduled" })
    setParties(applySorting(response.results))
  }

  const loadRecommendedParties = async () => {
    const recommended = await partiesApi.getRecommendations()
    setRecommendedParties(recommended)
    setParties(recommended)
  }

  const applySorting = (partiesList: WatchParty[]) => {
    if (sortBy === "recent") {
      return [...partiesList].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    } else if (sortBy === "popular") {
      return [...partiesList].sort((a, b) => b.participant_count - a.participant_count)
    } else if (sortBy === "starting-soon") {
      return [...partiesList].sort((a, b) => {
        const aTime = a.scheduled_start ? new Date(a.scheduled_start).getTime() : Infinity
        const bTime = b.scheduled_start ? new Date(b.scheduled_start).getTime() : Infinity
        return aTime - bTime
      })
    }
    return partiesList
  }

  const handleJoinParty = async (partyId: string, roomCode?: string) => {
    try {
      await partiesApi.join(partyId)
      window.location.href = `/party/${roomCode || partyId}`
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to join party"
      const lowerMessage = errorMessage.toLowerCase()
      if (lowerMessage.includes("already")) {
        window.location.href = `/party/${roomCode || partyId}`
        return
      }
      alert(errorMessage)
    }
  }

  const handleJoinByInvite = async () => {
    if (!inviteCode.trim()) {
      alert("Please enter an invite code")
      return
    }
    
    try {
      const response = await partiesApi.joinByCode(inviteCode)
      window.location.href = `/party/${response.party.id}`
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to join party")
    }
  }

  const handleShareParty = async (party: WatchParty) => {
    const url = `${window.location.origin}/party/${party.room_code || party.id}`
    try {
      await navigator.clipboard.writeText(url)
      alert("Party link copied to clipboard!")
    } catch {
      alert(`Share this link: ${url}`)
    }
  }

  const handleGenerateInvite = async (partyId: string) => {
    try {
      const response = await partiesApi.generateInvite(partyId)
      await navigator.clipboard.writeText(response.invite_code)
      alert(`Invite code copied: ${response.invite_code}`)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to generate invite")
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      live: { color: "bg-red-500", icon: "🔴", text: "LIVE", pulse: true },
      scheduled: { color: "bg-blue-500", icon: "📅", text: "SCHEDULED", pulse: false },
      ended: { color: "bg-gray-500", icon: "⏹️", text: "ENDED", pulse: false },
      cancelled: { color: "bg-red-800", icon: "❌", text: "CANCELLED", pulse: false },
    }
    return badges[status as keyof typeof badges] || badges.scheduled
  }

  const renderQuickStats = () => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:scale-105 transition-transform cursor-pointer"
           onClick={() => { setActiveTab("discover"); setFilter("live") }}>
        <div className="text-3xl sm:text-4xl mb-2">🔴</div>
        <div className="text-xl sm:text-2xl font-bold text-brand-navy">{formatNumber(parties.filter(p => p.status === 'live').length)}</div>
        <div className="text-xs sm:text-sm text-brand-navy/60 font-medium">Live Now</div>
      </div>
      <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:scale-105 transition-transform cursor-pointer"
           onClick={() => { setActiveTab("scheduled") }}>
        <div className="text-3xl sm:text-4xl mb-2">📅</div>
        <div className="text-xl sm:text-2xl font-bold text-brand-navy">{formatNumber(parties.filter(p => p.status === 'scheduled').length)}</div>
        <div className="text-xs sm:text-sm text-brand-navy/60 font-medium">Scheduled</div>
      </div>
      <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:scale-105 transition-transform cursor-pointer"
           onClick={() => { setActiveTab("my-parties") }}>
        <div className="text-3xl sm:text-4xl mb-2">👑</div>
        <div className="text-xl sm:text-2xl font-bold text-brand-navy">{formatNumber(myHostedParties.length)}</div>
        <div className="text-xs sm:text-sm text-brand-navy/60 font-medium">My Parties</div>
      </div>
      <div className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:scale-105 transition-transform cursor-pointer"
           onClick={() => { setActiveTab("joined") }}>
        <div className="text-3xl sm:text-4xl mb-2">🎟️</div>
        <div className="text-xl sm:text-2xl font-bold text-brand-navy">{formatNumber(myJoinedParties.length)}</div>
        <div className="text-xs sm:text-sm text-brand-navy/60 font-medium">Joined</div>
      </div>
    </div>
  )

  const renderPartyCard = (party: WatchParty) => {
    const statusBadge = getStatusBadge(party.status)
    
    return (
      <div key={party.id}
           className="glass-card group rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5">
        <div className="space-y-3 sm:space-y-4">
          {/* Header with status */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-brand-purple to-brand-blue rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md group-hover:scale-110 transition-transform">
                  {party.title.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-brand-navy line-clamp-1 group-hover:text-brand-purple transition-colors">
                    {party.title}
                  </h3>
                  {party.room_code && (
                    <div className="text-xs text-brand-navy/50 font-mono">#{party.room_code}</div>
                  )}
                </div>
              </div>
              {party.description && (
                <p className="text-brand-navy/60 text-xs sm:text-sm line-clamp-2">{party.description}</p>
              )}
            </div>
            <div className={`shrink-0 px-3 py-1.5 rounded-full text-white text-xs font-bold flex items-center gap-1.5 ${statusBadge.color} ${statusBadge.pulse ? 'animate-pulse' : ''}`}>
              <span>{statusBadge.icon}</span>
              <span>{statusBadge.text}</span>
            </div>
          </div>

          {/* Video info */}
          {party.video && (
            <div className="bg-white/40 rounded-xl p-3 flex items-center gap-3">
              <div className="text-2xl">🎬</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-brand-navy truncate">{party.video.title}</div>
                <div className="text-xs text-brand-navy/50">Now Playing</div>
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/30 rounded-lg p-2 text-center">
              <div className="text-lg mb-1">👥</div>
              <div className="text-sm font-bold text-brand-navy">{party.participant_count}</div>
              <div className="text-[10px] text-brand-navy/50">Watching</div>
            </div>
            <div className="bg-white/30 rounded-lg p-2 text-center">
              <div className="text-lg mb-1">
                {party.visibility === 'public' ? '🌍' : party.visibility === 'friends' ? '👥' : '🔒'}
              </div>
              <div className="text-xs font-bold text-brand-navy capitalize">{party.visibility || 'Public'}</div>
              <div className="text-[10px] text-brand-navy/50">Visibility</div>
            </div>
            <div className="bg-white/30 rounded-lg p-2 text-center">
              <div className="text-lg mb-1">⏱️</div>
              <div className="text-xs font-bold text-brand-navy">
                {party.scheduled_start 
                  ? new Date(party.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Now'
                }
              </div>
              <div className="text-[10px] text-brand-navy/50">Start</div>
            </div>
          </div>

          {/* Host info */}
          <div className="flex items-center gap-3 p-3 bg-brand-navy/5 rounded-xl">
            <div className="w-8 h-8 bg-brand-navy text-white rounded-full flex items-center justify-center font-bold text-xs">
              {(party.host?.name || party.host?.username)?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-brand-navy truncate">
                {party.host?.name || party.host?.username || "Unknown Host"}
              </div>
              <div className="text-xs text-brand-navy/50">
                {party.scheduled_start 
                  ? new Date(party.scheduled_start).toLocaleDateString()
                  : `Created ${new Date(party.created_at).toLocaleDateString()}`
                }
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <IconButton
              onClick={() => handleJoinParty(party.id, party.room_code)}
              disabled={party.status === "ended" || party.status === "cancelled"}
              className={`flex-1 font-bold border-none min-h-[44px] ${
                party.status === "live" 
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-lg" 
                  : "bg-brand-navy text-white hover:bg-brand-navy-light shadow-lg"
              }`}
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
              onClick={() => handleShareParty(party)}
              variant="secondary"
              className="bg-white hover:bg-brand-blue/10 border-brand-navy/10 min-h-[44px] min-w-[44px]"
              title="Share party"
            >
              📤
            </IconButton>
            <IconButton
              onClick={() => handleGenerateInvite(party.id)}
              variant="secondary"
              className="bg-white hover:bg-brand-purple/10 border-brand-navy/10 min-h-[44px] min-w-[44px]"
              title="Generate invite"
            >
              🎟️
            </IconButton>
            <IconButton
              onClick={() => router.push(`/party/${party.room_code || party.id}`)}
              variant="secondary"
              className="bg-white hover:bg-brand-orange/10 border-brand-navy/10 min-h-[44px] min-w-[44px]"
              title="View details"
            >
              ℹ️
            </IconButton>
          </div>
        </div>
      </div>
    )
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
    <div className="space-y-4 sm:space-y-6">
      {/* Enhanced Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 via-brand-magenta/20 to-brand-orange/20 rounded-3xl blur-3xl opacity-60"></div>
        <div className="glass-panel relative rounded-3xl p-6 sm:p-8 border-brand-purple/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                  <span className="gradient-text">Watch Parties</span>
                </h1>
                <LiveIndicator isLive={true} count={liveStats.activeParties} label="Live Now" />
              </div>
              <p className="text-brand-navy/70 text-base sm:text-lg">
                Join {formatNumber(liveStats.onlineUsers)} movie lovers worldwide
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-brand-navy/60">
                <span>🌍 Global Community</span>
                <span>•</span>
                <span>⚡ Instant Join</span>
                <span>•</span>
                <span>🎭 All Genres</span>
                <span>•</span>
                <span>🎟️ Invite Friends</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <IconButton
                onClick={() => setShowInviteModal(true)}
                variant="secondary"
                className="bg-white hover:bg-brand-blue/10 min-h-[48px] px-6"
              >
                <span>🎟️</span>
                <span>Join by Code</span>
              </IconButton>
              <IconButton
                onClick={() => router.push("/dashboard/parties/create")}
                className="btn-gradient shadow-lg min-h-[48px] px-6"
              >
                <span>✨</span>
                <span>Host Party</span>
              </IconButton>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Dashboard */}
      {renderQuickStats()}

      {/* Navigation Tabs */}
      <div className="glass-card rounded-2xl p-2">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "discover", label: "Discover", icon: "🌍" },
            { key: "recommended", label: "For You", icon: "✨" },
            { key: "my-parties", label: "My Parties", icon: "👑" },
            { key: "joined", label: "Joined", icon: "🎟️" },
            { key: "scheduled", label: "Upcoming", icon: "📅" },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as TabMode)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all min-h-[44px] ${
                activeTab === key
                  ? "bg-brand-navy text-white shadow-lg scale-105"
                  : "bg-white/50 text-brand-navy/60 hover:bg-white hover:text-brand-navy"
              }`}
            >
              <span>{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search, Filters & Sort */}
      <div className="glass-card rounded-2xl p-4 sm:p-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-brand-navy/40 text-xl">🔍</span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search parties, hosts, genres..."
            className="w-full pl-12 pr-20 py-4 bg-white/50 border border-brand-navy/10 rounded-xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple/30 focus:bg-white transition-all"
          />
          <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-2 text-brand-navy/40 hover:text-brand-navy min-h-[40px] min-w-[40px]"
              >
                ✕
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors min-h-[40px] min-w-[40px] ${
                showFilters ? "bg-brand-navy text-white" : "bg-white hover:bg-brand-navy/5 text-brand-navy/60"
              }`}
            >
              🎛️
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "all", label: "All", icon: "🌍" },
            { key: "live", label: "Live", icon: "🔴" },
            { key: "scheduled", label: "Scheduled", icon: "📅" },
            { key: "public", label: "Public", icon: "🌐" },
            { key: "trending", label: "Trending", icon: "🔥" },
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key as FilterType)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all min-h-[40px] ${
                filter === key
                  ? "bg-brand-navy text-white shadow-md"
                  : "bg-white/50 text-brand-navy/60 hover:bg-white"
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Sort & View Mode */}
        {showFilters && (
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-brand-navy/10">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-brand-navy/70">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-white border border-brand-navy/10 rounded-lg text-sm font-medium text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-purple/30"
              >
                <option value="recent">Recently Created</option>
                <option value="popular">Most Popular</option>
                <option value="starting-soon">Starting Soon</option>
              </select>
            </div>

            <div className="flex gap-1 bg-white p-1 rounded-lg border border-brand-navy/10">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all min-h-[40px] min-w-[40px] ${
                  viewMode === "grid" ? "bg-brand-navy text-white" : "text-brand-navy/60 hover:bg-brand-navy/5"
                }`}
              >
                ⚏
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all min-h-[40px] min-w-[40px] ${
                  viewMode === "list" ? "bg-brand-navy text-white" : "text-brand-navy/60 hover:bg-brand-navy/5"
                }`}
              >
                ☰
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`p-2 rounded-md transition-all min-h-[40px] min-w-[40px] ${
                  viewMode === "calendar" ? "bg-brand-navy text-white" : "text-brand-navy/60 hover:bg-brand-navy/5"
                }`}
              >
                📅
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-card border-brand-coral/30 bg-brand-coral/5 rounded-2xl p-6 flex items-center gap-4">
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
      )}

      {/* Info Message */}
      {infoMessage && (
        <div className="glass-card border-brand-blue/30 bg-brand-blue/5 rounded-2xl p-6 flex items-center gap-4">
          <div className="text-3xl">ℹ️</div>
          <p className="text-brand-blue-dark font-medium">{infoMessage}</p>
        </div>
      )}

      {/* Parties Display */}
      {!loading && parties.length > 0 && (
        <div className={
          viewMode === "grid" 
            ? "grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
            : viewMode === "list"
            ? "space-y-4"
            : "grid gap-4"
        }>
          {parties.map(renderPartyCard)}
        </div>
      )}

      {/* Empty State */}
      {!loading && parties.length === 0 && (
        <div className="glass-card rounded-3xl text-center py-20 px-6">
          <div className="space-y-6">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-brand-purple to-brand-blue rounded-3xl flex items-center justify-center text-5xl shadow-2xl animate-float">
              🎬
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl lg:text-3xl font-bold text-brand-navy">
                {searchQuery ? "No parties found" : "No parties available"}
              </h3>
              <p className="text-brand-navy/60 max-w-md mx-auto text-lg">
                {searchQuery 
                  ? `No parties match "${searchQuery}"`
                  : activeTab === "my-parties"
                  ? "You haven't hosted any parties yet"
                  : activeTab === "joined"
                  ? "You haven't joined any parties yet"
                  : "Be the first to create an epic watch party!"
                }
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              {searchQuery && (
                <IconButton
                  onClick={() => setSearchQuery("")}
                  variant="secondary"
                  className="bg-white px-6 min-h-[48px]"
                >
                  <span>🔄</span>
                  Clear Search
                </IconButton>
              )}
              <IconButton
                onClick={() => router.push("/dashboard/parties/create")}
                className="btn-gradient shadow-xl px-8 min-h-[48px]"
              >
                <span>✨</span>
                Host Your First Party
              </IconButton>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
             onClick={() => setShowInviteModal(false)}>
          <div className="glass-card rounded-3xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-purple to-brand-blue rounded-2xl flex items-center justify-center text-3xl mb-4">
                  🎟️
                </div>
                <h2 className="text-2xl font-bold text-brand-navy mb-2">Join by Invite Code</h2>
                <p className="text-brand-navy/60">Enter the party invite code to join</p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="Enter invite code"
                  className="w-full px-4 py-3 bg-white border-2 border-brand-navy/10 rounded-xl text-center text-lg font-mono font-bold text-brand-navy placeholder:text-brand-navy/30 focus:outline-none focus:ring-4 focus:ring-brand-purple/20 focus:border-brand-purple uppercase"
                />

                <div className="flex gap-3">
                  <IconButton
                    onClick={() => setShowInviteModal(false)}
                    variant="secondary"
                    className="flex-1 bg-white min-h-[48px]"
                  >
                    Cancel
                  </IconButton>
                  <IconButton
                    onClick={handleJoinByInvite}
                    className="flex-1 btn-gradient min-h-[48px]"
                  >
                    Join Party
                  </IconButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
