"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api-client"
import { useRouter } from "next/navigation"

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Search</h1>
          <p className="text-white/60">Find parties, users, videos, and more</p>
        </div>

        {/* Search Form */}
        <div className="mb-8">
          <div className="relative">
            <div className="flex gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      performSearch()
                    }
                  }}
                  placeholder="Search for parties, users, videos..."
                  className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <span className="text-white/50">🔍</span>
                </div>
                
                {/* Search Suggestions */}
                {suggestions.length > 0 && query.length > 2 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg z-50">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(suggestion)
                          performSearch(suggestion)
                        }}
                        className="w-full px-4 py-2 text-left text-white hover:bg-white/10 first:rounded-t-lg last:rounded-b-lg transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button
                onClick={() => performSearch()}
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="mt-4 flex flex-wrap gap-4">
            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="parties">Parties</option>
              <option value="users">Users</option>
              <option value="videos">Videos</option>
            </select>

            {/* Visibility Filter */}
            <select
              value={filters.visibility}
              onChange={(e) => setFilters(prev => ({ ...prev, visibility: e.target.value as any }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Visibility</option>
              <option value="public">Public Only</option>
              <option value="private">Private Only</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={filters.date_range}
              onChange={(e) => setFilters(prev => ({ ...prev, date_range: e.target.value as any }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>

            {/* Sort Filter */}
            <select
              value={filters.sort_by}
              onChange={(e) => setFilters(prev => ({ ...prev, sort_by: e.target.value as any }))}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Searches</h3>
              <button
                onClick={clearRecentSearches}
                className="text-red-400 hover:text-red-300 text-sm transition-colors"
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
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {query && (
          <div>
            {/* Results Header */}
            {totalResults > 0 && (
              <div className="mb-6">
                <p className="text-white/60 text-sm">
                  Found {totalResults.toLocaleString()} results in {searchTime}ms
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-6 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-6 bg-white/10 rounded w-3/4"></div>
                        <div className="h-4 bg-white/10 rounded w-1/2"></div>
                        <div className="h-4 bg-white/10 rounded w-2/3"></div>
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
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-6 text-left transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Thumbnail/Avatar */}
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden">
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
                          <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
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
                              <span key={key}>
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="text-white/40">
                        →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && query && results.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
                <p className="text-white/60 mb-6">
                  No results found for "{query}". Try adjusting your search terms or filters.
                </p>
                <div className="space-y-2 text-white/40 text-sm">
                  <p>Suggestions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Check your spelling</li>
                    <li>Try different keywords</li>
                    <li>Use broader search terms</li>
                    <li>Remove filters to see more results</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Search Shortcuts */}
        {!query && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Quick Search</h3>
              <a
                href="/dashboard/search/advanced"
                className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
              >
                Advanced Search →
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, type: "parties" }))
                  setQuery("active")
                  performSearch("active")
                }}
                className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-colors"
              >
                <div className="text-2xl mb-3">🎉</div>
                <h4 className="font-medium text-white mb-1">Active Parties</h4>
                <p className="text-white/60 text-sm">Find parties currently live</p>
              </button>

              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, type: "videos" }))
                  setQuery("popular")
                  performSearch("popular")
                }}
                className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-colors"
              >
                <div className="text-2xl mb-3">🎬</div>
                <h4 className="font-medium text-white mb-1">Popular Videos</h4>
                <p className="text-white/60 text-sm">Discover trending content</p>
              </button>

              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, type: "users" }))
                  setQuery("active")
                  performSearch("active")
                }}
                className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-colors"
              >
                <div className="text-2xl mb-3">👥</div>
                <h4 className="font-medium text-white mb-1">Active Users</h4>
                <p className="text-white/60 text-sm">Connect with the community</p>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}