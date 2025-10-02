"use client"

import { useState } from "react"
import { SearchBar, SearchResults, SearchFilters } from "@/components/search"

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
  type: string
  visibility?: string
  status?: string
  date_range?: string
  sort_by?: string
  tags?: string[]
  location?: string
  min_members?: number
  max_members?: number
}

interface AdvancedSearchPageProps {
  params: any
}

export default function AdvancedSearchPage({ params }: AdvancedSearchPageProps) {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [currentQuery, setCurrentQuery] = useState("")
  const [totalResults, setTotalResults] = useState(0)
  const [searchTime, setSearchTime] = useState(0)
  const [filters, setFilters] = useState<SearchFilters>({
    type: "all",
    visibility: undefined,
    status: undefined,
    date_range: undefined,
    sort_by: "relevance",
    tags: undefined,
    location: undefined,
    min_members: undefined,
    max_members: undefined,
  })
  const [layout, setLayout] = useState<"list" | "grid">("list")

  const handleSearch = async (searchResults: SearchResult[], query: string) => {
    setResults(searchResults)
    setCurrentQuery(query)
  }

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters)
    // Re-run search with new filters if there's an active query
    if (currentQuery) {
      // This would trigger a new search with the updated filters
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Advanced Search</h1>
          <p className="text-white/60">Use advanced filters to find exactly what you're looking for</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters
              onFiltersChange={handleFiltersChange}
              showAdvanced={true}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <SearchBar
                onSearchResults={handleSearch}
                placeholder="Search with advanced filters..."
                size="lg"
                autoFocus
              />
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-white/60 text-sm">
                {totalResults > 0 && (
                  <>Found {totalResults.toLocaleString()} results{searchTime > 0 && ` in ${searchTime}ms`}</>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm">View:</span>
                <button
                  onClick={() => setLayout("list")}
                  className={`p-2 rounded transition-colors ${
                    layout === "list"
                      ? "bg-brand-blue text-white"
                      : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
                  }`}
                  title="List view"
                >
                  ☰
                </button>
                <button
                  onClick={() => setLayout("grid")}
                  className={`p-2 rounded transition-colors ${
                    layout === "grid"
                      ? "bg-brand-blue text-white"
                      : "bg-white/10 text-white/60 hover:text-white hover:bg-white/20"
                  }`}
                  title="Grid view"
                >
                  ⊞
                </button>
              </div>
            </div>

            {/* Search Results */}
            <SearchResults
              results={results}
              query={currentQuery}
              loading={loading}
              totalResults={totalResults}
              searchTime={searchTime}
              layout={layout}
              showMetadata={true}
            />

            {/* Empty State */}
            {!currentQuery && results.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">Advanced Search</h3>
                <p className="text-white/60 mb-8">
                  Use the search bar above and filters on the left to find exactly what you need.
                </p>
                
                {/* Search Tips */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-left max-w-2xl mx-auto">
                  <h4 className="font-medium text-white mb-4">Search Tips</h4>
                  <div className="space-y-3 text-white/80 text-sm">
                    <div className="flex items-start gap-3">
                      <span className="text-brand-blue-light">💡</span>
                      <div>
                        <strong>Use quotes</strong> for exact phrases: "watch party tonight"
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-brand-cyan-light">💡</span>
                      <div>
                        <strong>Filter by type</strong> to narrow results to parties, users, or videos
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-brand-purple-light">💡</span>
                      <div>
                        <strong>Use date filters</strong> to find recent or older content
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-brand-orange-light">💡</span>
                      <div>
                        <strong>Add tags</strong> to find content with specific topics or themes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}