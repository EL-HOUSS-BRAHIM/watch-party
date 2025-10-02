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
      gradient: "from-green-500 to-blue-500",
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
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-brand-purple/20 rounded-3xl blur-xl"></div>
        <GradientCard className="relative border-cyan-500/30">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
              Universal Search
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Find parties, users, videos, and more across the entire Watch Party platform
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-white/60">
              <span>🎬 Movies & Shows</span>
              <span>•</span>
              <span>👥 Community</span>
              <span>•</span>
              <span>🎉 Live Parties</span>
            </div>
          </div>
        </GradientCard>
      </div>

      {/* Search Form */}
      <div className="space-y-6">
        {/* Main Search Bar */}
        <div className="relative max-w-4xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-white/50 text-xl">🔍</span>
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
            className="w-full pl-14 pr-24 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur-sm transition-all text-lg"
          />
          <div className="absolute right-2 top-2">
            <IconButton
              onClick={() => performSearch()}
              disabled={loading || !query.trim()}
              gradient="from-cyan-600 to-brand-blue"
              className="shadow-lg"
            >
              {loading ? "🔄" : "🔍"}
              <span className="hidden sm:inline">{loading ? "Searching..." : "Search"}</span>
            </IconButton>
          </div>
          
          {/* Search Suggestions */}
          {suggestions.length > 0 && query.length > 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion)
                    performSearch(suggestion)
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/10 first:rounded-t-xl last:rounded-b-xl transition-colors flex items-center gap-3"
                >
                  <span className="text-white/50">🔍</span>
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap justify-center gap-4">
          {/* Type Filter */}
          <div className="flex gap-1 bg-black/20 p-1 rounded-xl border border-white/10">
            {[
              { key: "all", label: "All", icon: "🔍" },
              { key: "parties", label: "Parties", icon: "🎉" },
              { key: "users", label: "Users", icon: "👥" },
              { key: "videos", label: "Videos", icon: "🎬" }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setFilters(prev => ({ ...prev, type: key as any }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filters.type === key
                    ? "bg-gradient-to-r from-cyan-600 to-brand-blue text-white shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/10"
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
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
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
        <GradientCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>🕒</span>
              Recent Searches
            </h3>
            <button
              onClick={clearRecentSearches}
              className="text-brand-coral-light hover:text-red-300 text-sm transition-colors"
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
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all duration-200 hover:scale-105"
              >
                {search}
              </button>
            ))}
          </div>
        </GradientCard>
      )}

      {/* Search Results */}
      {query && (
        <div className="space-y-6">
          {/* Results Header */}
          {totalResults > 0 && !loading && (
            <div className="flex items-center justify-between">
              <p className="text-white/60 text-sm flex items-center gap-2">
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
                <GradientCard key={i} className="animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-6 bg-white/10 rounded w-3/4"></div>
                      <div className="h-4 bg-white/10 rounded w-1/2"></div>
                      <div className="h-4 bg-white/10 rounded w-2/3"></div>
                    </div>
                  </div>
                </GradientCard>
              ))}
            </div>
          )}

          {/* Results List */}
          {!loading && results.length > 0 && (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="cursor-pointer"
                  onClick={() => handleResultClick(result)}
                >
                  <GradientCard className="hover:border-cyan-400/40 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail/Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center overflow-hidden">
                      {result.thumbnail || result.avatar ? (
                        <img
                          src={result.thumbnail || result.avatar}
                          alt={result.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl">{getResultIcon(result.type)}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-gradient-to-r from-cyan-600/20 to-brand-blue/20 text-cyan-400 text-xs rounded border border-cyan-500/30">
                          {getResultTypeLabel(result.type)}
                        </span>
                        {result.relevance_score && (
                          <span className="text-white/40 text-xs">
                            {Math.round(result.relevance_score * 100)}% match
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-white mb-1 truncate">{result.title}</h3>
                      
                      {result.subtitle && (
                        <p className="text-white/60 text-sm mb-2">{result.subtitle}</p>
                      )}
                      
                      {result.description && (
                        <p className="text-white/60 text-sm line-clamp-2">{result.description}</p>
                      )}
                      
                      {result.metadata && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/40">
                          {Object.entries(result.metadata).map(([key, value]) => (
                            <span key={key} className="bg-white/5 px-2 py-1 rounded">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="text-white/40 text-xl">→</div>
                  </div>
                </GradientCard>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && query && results.length === 0 && (
            <GradientCard className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
              <p className="text-white/60 mb-6">
                No results found for "{query}". Try adjusting your search terms or filters.
              </p>
              <div className="space-y-2 text-white/40 text-sm mb-6">
                <p className="font-medium">Suggestions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check your spelling</li>
                  <li>Try different keywords</li>
                  <li>Use broader search terms</li>
                  <li>Remove filters to see more results</li>
                </ul>
              </div>
              <IconButton
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
                variant="secondary"
              >
                <span>🔄</span>
                Clear Search
              </IconButton>
            </GradientCard>
          )}
        </div>
      )}

      {/* Quick Search Shortcuts */}
      {!query && (
        <div>
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>⚡</span>
            Quick Search
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickSearchOptions.map((option, index) => (
              <div
                key={index}
                className="cursor-pointer"
                onClick={option.action}
              >
                <GradientCard
                  gradient={`${option.gradient}/10`}
                  className="text-center hover:border-cyan-400/40 transition-all duration-300"
                >
                <div className="space-y-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${option.gradient} rounded-2xl flex items-center justify-center text-white text-2xl mx-auto`}>
                    {option.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-2">{option.title}</h4>
                    <p className="text-white/60 text-sm">{option.description}</p>
                  </div>
                  <IconButton
                    gradient={option.gradient}
                    size="sm"
                    className="w-full"
                  >
                    Search Now
                  </IconButton>
                </div>
              </GradientCard>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}