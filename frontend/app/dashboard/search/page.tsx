"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api-client"
import { useRouter } from "next/navigation"
import { GradientCard } from "@/components/ui/gradient-card"
import { IconButton } from "@/components/ui/icon-button"
import { LiveIndicator } from "@/components/ui/live-indicator"
import { useDesignSystem } from "@/hooks/use-design-system"

interface SearchResult {
  id: string
  type: "party" | "user" | "video"
  title: string
  description?: string
  subtitle?: string
  thumbnail?: string
  avatar?: string
  metadata?: any
  relevance_score?: number
}

interface SearchFilters {
  type: "all" | "parties" | "users" | "videos"
  visibility?: "all" | "public" | "private"
  status?: "all" | "active" | "inactive"
  date_range?: "all" | "today" | "week" | "month" | "year"
  sort_by?: "relevance" | "recent" | "popular" | "alphabetical"
}

export default function SearchPage() {
  const router = useRouter()
  const { formatNumber } = useDesignSystem()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    type: "all",
    visibility: "all",
    status: "all",
    date_range: "all",
    sort_by: "relevance"
  })
  const [totalResults, setTotalResults] = useState(0)
  const [searchTime, setSearchTime] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem("recent_searches")
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error("Failed to parse recent searches:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (query.length > 2) {
      const debounceTimer = setTimeout(() => {
        loadSuggestions()
      }, 300)
      return () => clearTimeout(debounceTimer)
    } else {
      setSuggestions([])
    }
  }, [query])

  const loadSuggestions = async () => {
    try {
      const response = await api.search.getSuggestions(query)
      setSuggestions(response.suggestions || [])
    } catch (error) {
      console.error("Failed to load suggestions:", error)
    }
  }

  const performSearch = async (searchQuery?: string) => {
    const q = searchQuery || query
    if (!q.trim()) return

    setLoading(true)
    const startTime = Date.now()

    try {
      const params = {
        q: q.trim(),
        type: filters.type,
        ...(filters.visibility !== "all" && { visibility: filters.visibility }),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.date_range !== "all" && { date_range: filters.date_range }),
        sort_by: filters.sort_by || "relevance"
      }

      const response = await api.search.search(params)
      setResults(response.results || [])
      setTotalResults(response.count || 0)
      setSearchTime(Date.now() - startTime)

      // Save to recent searches
      saveRecentSearch(q.trim())
      setSuggestions([])
    } catch (error) {
      console.error("Search failed:", error)
      setResults([])
      setTotalResults(0)
    } finally {
      setLoading(false)
    }
  }

  const saveRecentSearch = (searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem("recent_searches", JSON.stringify(updated))
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem("recent_searches")
  }

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case "party":
        router.push(`/dashboard/parties/${result.id}`)
        break
      case "user":
        router.push(`/dashboard/profile/${result.id}`)
        break
      case "video":
        router.push(`/dashboard/videos/${result.id}`)
        break
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case "party": return "🎉"
      case "user": return "👤"
      case "video": return "🎬"
      default: return "📄"
    }
  }

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case "party": return "Party"
      case "user": return "User"
      case "video": return "Video"
      default: return "Item"
    }
  }

  const quickSearchOptions = [
    {
      title: "Active Parties",
      description: "Find parties currently live",
      icon: "🎉",
      gradient: "from-brand-blue to-purple-500",
      action: () => {
        setFilters(prev => ({ ...prev, type: "parties" }))
        setQuery("active")
        performSearch("active")
      }
    },
    {
      title: "Popular Videos", 
      description: "Discover trending content",
      icon: "🎬",
      gradient: "from-brand-purple to-brand-magenta",
      action: () => {
        setFilters(prev => ({ ...prev, type: "videos" }))
        setQuery("popular")
        performSearch("popular")
      }
    },
    {
      title: "Active Users",
      description: "Connect with the community", 
      icon: "👥",
      gradient: "from-brand-cyan to-brand-blue",
      action: () => {
        setFilters(prev => ({ ...prev, type: "users" }))
        setQuery("active")
        performSearch("active")
      }
    }
  ]

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/20 via-brand-blue/20 to-brand-purple/20 rounded-3xl blur-3xl opacity-60 pointer-events-none"></div>
        <div className="glass-panel relative rounded-3xl p-8 border-brand-cyan/20 text-center">
          <div className="space-y-4">
            <div className="text-6xl mb-4 opacity-80">🔍</div>
            <h1 className="text-4xl font-bold text-brand-navy">
              <span className="gradient-text">Universal Search</span>
            </h1>
            <p className="text-brand-navy/70 text-lg max-w-2xl mx-auto">
              Find parties, users, videos, and more across the entire Watch Party platform
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-brand-navy/60 font-medium">
              <span>🎬 Movies & Shows</span>
              <span>•</span>
              <span>👥 Community</span>
              <span>•</span>
              <span>🎉 Live Parties</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="space-y-6">
        {/* Main Search Bar */}
        <div className="relative max-w-4xl mx-auto group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <span className="text-brand-navy/40 text-2xl">🔍</span>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                performSearch()
              }
            }}
            placeholder="Search for parties, users, videos, or anything else..."
            className="w-full pl-16 pr-32 py-5 bg-white/50 border border-brand-navy/10 rounded-2xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-cyan/10 focus:border-brand-cyan/30 backdrop-blur-sm transition-all text-lg shadow-lg shadow-brand-navy/5"
          />
          <div className="absolute right-3 top-3">
            <button
              onClick={() => performSearch()}
              disabled={loading || !query.trim()}
              className="btn-gradient px-6 py-2.5 rounded-xl font-bold text-white shadow-lg hover:shadow-brand-cyan/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "🔄" : "Search"}
            </button>
          </div>
          
          {/* Search Suggestions */}
          {suggestions.length > 0 && query.length > 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-xl border border-brand-navy/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion)
                    performSearch(suggestion)
                  }}
                  className="w-full px-6 py-3 text-left text-brand-navy hover:bg-brand-navy/5 transition-colors flex items-center gap-3 font-medium"
                >
                  <span className="text-brand-navy/30">🔍</span>
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap justify-center gap-4">
          {/* Type Filter */}
          <div className="flex gap-1 bg-white/40 p-1 rounded-xl border border-brand-navy/5 backdrop-blur-sm">
            {[
              { key: "all", label: "All", icon: "🔍" },
              { key: "parties", label: "Parties", icon: "🎉" },
              { key: "users", label: "Users", icon: "👥" },
              { key: "videos", label: "Videos", icon: "🎬" }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setFilters(prev => ({ ...prev, type: key as any }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all duration-200 ${
                  filters.type === key
                    ? "bg-brand-navy text-white shadow-md"
                    : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Additional Filters */}
          <select
            value={filters.sort_by}
            onChange={(e) => setFilters(prev => ({ ...prev, sort_by: e.target.value as any }))}
            className="px-4 py-2 bg-white/40 border border-brand-navy/10 rounded-xl text-brand-navy font-medium focus:outline-none focus:ring-2 focus:ring-brand-cyan/20 cursor-pointer hover:bg-white/60 transition-colors"
          >
            <option value="relevance">Most Relevant</option>
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Recent Searches */}
      {!query && recentSearches.length > 0 && (
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-brand-navy flex items-center gap-2">
              <span>🕒</span>
              Recent Searches
            </h3>
            <button
              onClick={clearRecentSearches}
              className="text-brand-coral hover:text-brand-coral-dark text-sm font-bold transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => {
                  setQuery(search)
                  performSearch(search)
                }}
                className="px-4 py-2 bg-brand-navy/5 hover:bg-brand-navy/10 text-brand-navy rounded-lg text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
              >
                {search}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {query && (
        <div className="space-y-6">
          {/* Results Header */}
          {totalResults > 0 && !loading && (
            <div className="flex items-center justify-between px-2">
              <p className="text-brand-navy/60 font-medium flex items-center gap-2">
                <span>📊</span>
                Found {formatNumber(totalResults)} results in {searchTime}ms
              </p>
              <LiveIndicator isLive={totalResults > 0} count={totalResults} label="Results" />
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="glass-card rounded-2xl p-4 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-brand-navy/5 rounded-xl"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-brand-navy/5 rounded w-3/4"></div>
                      <div className="h-4 bg-brand-navy/5 rounded w-1/2"></div>
                      <div className="h-4 bg-brand-navy/5 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results List */}
          {!loading && results.length > 0 && (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="cursor-pointer group"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="glass-card rounded-2xl p-4 hover:border-brand-cyan/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-navy/5">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail/Avatar */}
                      <div className="w-16 h-16 bg-gradient-to-br from-brand-cyan/10 to-brand-blue/10 rounded-xl flex items-center justify-center overflow-hidden border border-brand-navy/5 group-hover:scale-105 transition-transform">
                        {result.thumbnail || result.avatar ? (
                          <img
                            src={result.thumbnail || result.avatar}
                            alt={result.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">{getResultIcon(result.type)}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-brand-navy/5 text-brand-navy/60 text-xs font-bold uppercase tracking-wide rounded">
                            {getResultTypeLabel(result.type)}
                          </span>
                          {result.relevance_score && (
                            <span className="text-brand-cyan text-xs font-bold">
                              {Math.round(result.relevance_score * 100)}% match
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-bold text-brand-navy mb-1 truncate group-hover:text-brand-blue transition-colors">{result.title}</h3>
                        
                        {result.subtitle && (
                          <p className="text-brand-navy/60 text-sm font-medium mb-2">{result.subtitle}</p>
                        )}
                        
                        {result.description && (
                          <p className="text-brand-navy/60 text-sm line-clamp-2">{result.description}</p>
                        )}
                        
                        {result.metadata && (
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-brand-navy/40 font-medium">
                            {Object.entries(result.metadata).map(([key, value]) => (
                              <span key={key} className="bg-brand-navy/5 px-2 py-1 rounded">
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="text-brand-navy/20 text-xl group-hover:text-brand-blue group-hover:translate-x-1 transition-all">→</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && query && results.length === 0 && (
            <div className="glass-card rounded-3xl p-12 text-center">
              <div className="text-6xl mb-6 opacity-80">🔍</div>
              <h3 className="text-2xl font-bold text-brand-navy mb-3">No Results Found</h3>
              <p className="text-brand-navy/60 mb-8 max-w-md mx-auto text-lg">
                No results found for "{query}". Try adjusting your search terms or filters.
              </p>
              <div className="space-y-2 text-brand-navy/50 text-sm mb-8">
                <p className="font-bold uppercase tracking-wide">Suggestions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check your spelling</li>
                  <li>Try different keywords</li>
                  <li>Use broader search terms</li>
                  <li>Remove filters to see more results</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setQuery("")
                  setFilters({
                    type: "all",
                    visibility: "all",
                    status: "all", 
                    date_range: "all",
                    sort_by: "relevance"
                  })
                }}
                className="bg-brand-navy hover:bg-brand-navy-light text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Search Shortcuts */}
      {!query && (
        <div>
          <h3 className="text-2xl font-bold text-brand-navy mb-6 flex items-center gap-2">
            <span>⚡</span>
            Quick Search
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickSearchOptions.map((option, index) => (
              <div
                key={index}
                className="cursor-pointer group"
                onClick={option.action}
              >
                <div className="glass-card rounded-3xl p-6 text-center hover:border-brand-cyan/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5 h-full flex flex-col">
                  <div className={`w-16 h-16 bg-gradient-to-br ${option.gradient} rounded-2xl flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-brand-navy mb-2">{option.title}</h4>
                    <p className="text-brand-navy/60 text-sm mb-6">{option.description}</p>
                  </div>
                  <button className="w-full py-2.5 rounded-xl bg-brand-navy/5 text-brand-navy font-bold group-hover:bg-brand-navy group-hover:text-white transition-colors">
                    Search Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}