"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { partiesApi, WatchParty } from "@/lib/api-client"

export default function PartiesPage() {
  const [parties, setParties] = useState<WatchParty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<"all" | "public" | "recent" | "trending">("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadParties()
  }, [filter, searchQuery])

  const loadParties = async () => {
    setLoading(true)
    setError("")

    try {
      let response
      
      if (searchQuery.trim()) {
        response = await partiesApi.search(searchQuery)
      } else if (filter === "public") {
        response = await partiesApi.getPublic()
      } else if (filter === "recent") {
        response = await partiesApi.getRecent()
      } else if (filter === "trending") {
        response = await partiesApi.getTrending()
      } else {
        response = await partiesApi.list({ page_size: 20 })
      }

      const partiesList = Array.isArray(response) ? response : (response.results || [])
      setParties(partiesList)
    } catch (error) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live": return "text-green-400 bg-green-400/20"
      case "scheduled": return "text-blue-400 bg-blue-400/20"
      case "ended": return "text-gray-400 bg-gray-400/20"
      case "cancelled": return "text-red-400 bg-red-400/20"
      default: return "text-yellow-400 bg-yellow-400/20"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Discover Parties</h1>
          <p className="text-white/70">Find and join watch parties happening now</p>
        </div>
        <Link
          href="/dashboard/create-party"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Create Party
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search parties by title, description, or host..."
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            {[
              { key: "all", label: "All" },
              { key: "public", label: "Public" },
              { key: "recent", label: "Recent" },
              { key: "trending", label: "Trending" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === key
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
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
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-white/20 rounded mb-3"></div>
              <div className="h-3 bg-white/10 rounded mb-2"></div>
              <div className="h-3 bg-white/10 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Parties Grid */}
      {!loading && parties.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {parties.map((party) => (
            <div
              key={party.id}
              className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-white line-clamp-2">
                  {party.title}
                </h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(party.status)}`}>
                  {party.status}
                </span>
              </div>

              {party.description && (
                <p className="text-white/70 text-sm mb-3 line-clamp-2">
                  {party.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-white/60">
                  <span>👤 {party.host?.username || "Unknown"}</span>
                </div>
                <div className="flex items-center text-sm text-white/60">
                  <span>👥 {party.participant_count} watching</span>
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
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleJoinParty(party.id)}
                  disabled={party.status === "ended" || party.status === "cancelled"}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  {party.status === "live" ? "Join Now" : party.status === "scheduled" ? "Join" : "View"}
                </button>
                <Link
                  href={`/party/${party.id}`}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && parties.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery ? "No parties found" : "No parties available"}
          </h3>
          <p className="text-white/70 mb-6">
            {searchQuery 
              ? `No parties match "${searchQuery}". Try a different search term.`
              : "Be the first to create a watch party!"
            }
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mr-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear Search
            </button>
          )}
          <Link
            href="/dashboard/create-party"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create Your First Party
          </Link>
        </div>
      )}
    </div>
  )
}