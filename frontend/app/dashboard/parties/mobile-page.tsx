"use client"

import { useState, useEffect } from "react"
import { SwipeGesture } from "@/components/mobile"
import api, { WatchParty as Party } from "@/lib/api-client"

import { PullToRefresh } from "@/components/mobile"

export default function MobilePartiesPage() {
  const [parties, setParties] = useState<Party[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "joined" | "hosted">("all")

  useEffect(() => {
    loadParties()
  }, [filter])

  const loadParties = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true)
    
    try {
      const params = filter === "hosted" ? { host: "me" } : filter === "joined" ? { is_public: false } : {}
      const response = await api.parties.list(params)
      setParties(response.results || [])
    } catch (error) {
      console.error("Failed to load parties:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadParties(true)
  }

  const joinParty = async (partyId: string) => {
    try {
      await api.parties.join(partyId)
      await loadParties()
    } catch (error) {
      alert("Failed to join party: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 pb-20">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-white/10 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                  <div className="h-3 bg-white/10 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pb-20">
      {/* Header */}
      <div className="sticky top-16 z-20 bg-gray-900/95 backdrop-blur-sm border-b border-white/10 p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Parties</h1>
        
        {/* Filter Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {[
            { value: "all", label: "All" },
            { value: "joined", label: "Joined" },
            { value: "hosted", label: "Hosted" }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as any)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                filter === tab.value
                  ? "bg-brand-blue text-white"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="p-4">
          {parties.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Parties Found</h3>
              <p className="text-white/60 mb-6">
                {filter === "all" 
                  ? "No parties are available right now."
                  : filter === "joined"
                  ? "You haven't joined any parties yet."
                  : "You haven't created any parties yet."
                }
              </p>
              <a
                href="/dashboard/parties/create"
                className="inline-block px-6 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg font-medium transition-colors"
              >
                Create Party
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {parties.map((party) => (
                <SwipeGesture
                  key={party.id}
                  onTap={() => window.location.href = `/dashboard/parties/${party.id}`}
                  onSwipeLeft={() => {
                    // Could implement quick actions like join/leave
                  }}
                >
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 active:bg-white/10 transition-colors">
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {party.video?.thumbnail ? (
                          <img
                            src={party.video.thumbnail}
                            alt={party.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">🎉</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-white truncate pr-2">{party.title}</h3>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {party.is_active ? (
                              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            ) : (
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            )}
                            {party.is_public ? (
                              <span className="text-brand-cyan-light text-xs">🌐</span>
                            ) : (
                              <span className="text-brand-orange-light text-xs">🔒</span>
                            )}
                          </div>
                        </div>

                        {party.description && (
                          <p className="text-white/60 text-sm mb-2 line-clamp-2">
                            {party.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-xs text-white/60">
                            <div className="flex items-center gap-1">
                              {party.host.avatar && (
                                <img
                                  src={party.host.avatar}
                                  alt={party.host.username}
                                  className="w-4 h-4 rounded-full"
                                />
                              )}
                              <span>{party.host.username}</span>
                            </div>
                            <span>•</span>
                            <span>
                              {party.participant_count} member{party.participant_count !== 1 ? "s" : ""}
                              {party.max_participants && ` / ${party.max_participants}`}
                            </span>
                          </div>

                          <span className="text-xs text-white/60">
                            {formatDate(party.created_at)}
                          </span>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              window.location.href = `/dashboard/parties/${party.id}`
                            }}
                            className="flex-1 py-2 px-3 bg-brand-blue hover:bg-brand-blue-dark text-white text-sm rounded-lg font-medium transition-colors"
                          >
                            View
                          </button>
                          
                          {party.is_public && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                joinParty(party.id)
                              }}
                              className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                            >
                              Join
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </SwipeGesture>
              ))}
            </div>
          )}
        </div>
      </PullToRefresh>

      {/* Floating Action Button */}
      <a
        href="/dashboard/parties/create"
        className="fixed bottom-20 right-4 w-14 h-14 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-20"
      >
        <span className="text-2xl">+</span>
      </a>
    </div>
  )
}