"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api-client"

interface SearchBarProps {
  onSearchResults?: (results: any[], query: string) => void
  placeholder?: string
  autoFocus?: boolean
  size?: "sm" | "md" | "lg"
  scope?: "global" | "parties" | "users" | "videos"
  showFilters?: boolean
  className?: string
}

export default function SearchBar({
  onSearchResults,
  placeholder = "Search...",
  autoFocus = false,
  size = "md",
  scope = "global",
  showFilters = false,
  className = ""
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: scope === "global" ? "all" : scope,
    sort_by: "relevance"
  })

  useEffect(() => {
    if (query.length > 2) {
      const debounceTimer = setTimeout(() => {
        loadSuggestions()
      }, 300)
      return () => clearTimeout(debounceTimer)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [query])

  const loadSuggestions = async () => {
    try {
      const response = await api.get(`/search/suggestions/?q=${encodeURIComponent(query)}&scope=${scope}`)
      setSuggestions(response.suggestions || [])
      setShowSuggestions(true)
    } catch (error) {
      console.error("Failed to load suggestions:", error)
      setSuggestions([])
    }
  }

  const performSearch = async (searchQuery?: string) => {
    const q = searchQuery || query
    if (!q.trim()) return

    setLoading(true)
    setShowSuggestions(false)

    try {
      const params = new URLSearchParams({
        q: q.trim(),
        ...filters
      })

      const response = await api.get(`/search/?${params.toString()}`)
      onSearchResults?.(response.results || [], q.trim())
    } catch (error) {
      console.error("Search failed:", error)
      onSearchResults?.([], q.trim())
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    performSearch(suggestion)
  }

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-2 text-sm"
      case "lg":
        return "px-5 py-4 text-lg"
      default:
        return "px-4 py-3"
    }
  }

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return "text-sm"
      case "lg":
        return "text-lg"
      default:
        return "text-base"
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Search Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              performSearch()
            } else if (e.key === "Escape") {
              setShowSuggestions(false)
            }
          }}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          onBlur={() => {
            // Delay hiding suggestions to allow clicks
            setTimeout(() => setShowSuggestions(false), 200)
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full pl-10 pr-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${getSizeClasses()}`}
        />

        {/* Search Icon */}
        <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 ${getIconSize()}`}>
          {loading ? (
            <div className="animate-spin">⟲</div>
          ) : (
            <span>🔍</span>
          )}
        </div>

        {/* Clear Button */}
        {query && (
          <button
            onClick={() => {
              setQuery("")
              setSuggestions([])
              setShowSuggestions(false)
              onSearchResults?.([], "")
            }}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors ${getIconSize()}`}
          >
            ✕
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-2 text-left text-white hover:bg-white/10 first:rounded-t-lg last:rounded-b-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-white/50">🔍</span>
                <span>{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="mt-2 flex gap-2">
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="parties">Parties</option>
            <option value="users">Users</option>
            <option value="videos">Videos</option>
          </select>

          <select
            value={filters.sort_by}
            onChange={(e) => setFilters(prev => ({ ...prev, sort_by: e.target.value }))}
            className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="relevance">Relevance</option>
            <option value="recent">Recent</option>
            <option value="popular">Popular</option>
          </select>
        </div>
      )}
    </div>
  )
}