"use client"

import { useState } from "react"
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

interface SearchResultsProps {
  results: SearchResult[]
  query: string
  loading?: boolean
  totalResults?: number
  searchTime?: number
  onResultClick?: (result: SearchResult) => void
  showMetadata?: boolean
  layout?: "list" | "grid"
}

export default function SearchResults({
  results,
  query,
  loading = false,
  totalResults,
  searchTime,
  onResultClick,
  showMetadata = true,
  layout = "list"
}: SearchResultsProps) {
  const router = useRouter()
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result)
    } else {
      // Default navigation
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "party": return "bg-purple-600/20 text-purple-400"
      case "user": return "bg-green-600/20 text-green-400"
      case "video": return "bg-blue-600/20 text-blue-400"
      default: return "bg-gray-600/20 text-gray-400"
    }
  }

  const handleImageError = (resultId: string) => {
    setImageErrors(prev => new Set([...prev, resultId]))
  }

  if (loading) {
    return (
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
    )
  }

  if (results.length === 0 && query) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Results Found</h3>
        <p className="text-white/60 mb-6">
          No results found for "{query}". Try adjusting your search terms.
        </p>
        <div className="space-y-2 text-white/40 text-sm">
          <p>Suggestions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Check your spelling</li>
            <li>Try different keywords</li>
            <li>Use broader search terms</li>
          </ul>
        </div>
      </div>
    )
  }

  const ResultCard = ({ result }: { result: SearchResult }) => {
    const hasImageError = imageErrors.has(result.id)
    const imageUrl = result.thumbnail || result.avatar

    return (
      <button
        onClick={() => handleResultClick(result)}
        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-6 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
      >
        <div className="flex items-start gap-4">
          {/* Thumbnail/Avatar */}
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {imageUrl && !hasImageError ? (
              <img
                src={imageUrl}
                alt={result.title}
                className="w-full h-full object-cover"
                onError={() => handleImageError(result.id)}
              />
            ) : (
              <span className="text-xl">{getResultIcon(result.type)}</span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 text-xs rounded ${getTypeColor(result.type)}`}>
                {getResultTypeLabel(result.type)}
              </span>
              {result.relevance_score && showMetadata && (
                <span className="text-white/40 text-xs">
                  {Math.round(result.relevance_score * 100)}% match
                </span>
              )}
            </div>
            
            <h3 className="font-semibold text-white mb-1 truncate">{result.title}</h3>
            
            {result.subtitle && (
              <p className="text-white/60 text-sm mb-2 truncate">{result.subtitle}</p>
            )}
            
            {result.description && (
              <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">{result.description}</p>
            )}
            
            {result.metadata && showMetadata && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/40">
                {Object.entries(result.metadata).slice(0, 3).map(([key, value]) => (
                  <span key={key} className="px-2 py-1 bg-white/5 rounded">
                    {key}: {String(value)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="text-white/40 flex-shrink-0">
            →
          </div>
        </div>
      </button>
    )
  }

  const GridCard = ({ result }: { result: SearchResult }) => {
    const hasImageError = imageErrors.has(result.id)
    const imageUrl = result.thumbnail || result.avatar

    return (
      <button
        onClick={() => handleResultClick(result)}
        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-left transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
      >
        {/* Image */}
        <div className="w-full h-32 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden mb-4">
          {imageUrl && !hasImageError ? (
            <img
              src={imageUrl}
              alt={result.title}
              className="w-full h-full object-cover"
              onError={() => handleImageError(result.id)}
            />
          ) : (
            <span className="text-3xl">{getResultIcon(result.type)}</span>
          )}
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs rounded ${getTypeColor(result.type)}`}>
              {getResultTypeLabel(result.type)}
            </span>
            {result.relevance_score && showMetadata && (
              <span className="text-white/40 text-xs">
                {Math.round(result.relevance_score * 100)}%
              </span>
            )}
          </div>
          
          <h3 className="font-semibold text-white mb-1 truncate">{result.title}</h3>
          
          {result.subtitle && (
            <p className="text-white/60 text-sm mb-2 truncate">{result.subtitle}</p>
          )}
          
          {result.description && (
            <p className="text-white/60 text-sm line-clamp-2 leading-relaxed">{result.description}</p>
          )}
        </div>
      </button>
    )
  }

  return (
    <div>
      {/* Results Header */}
      {totalResults !== undefined && (
        <div className="mb-6">
          <p className="text-white/60 text-sm">
            Found {totalResults.toLocaleString()} results
            {searchTime && ` in ${searchTime}ms`}
            {query && ` for "${query}"`}
          </p>
        </div>
      )}

      {/* Results */}
      {layout === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((result) => (
            <GridCard key={`${result.type}-${result.id}`} result={result} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <ResultCard key={`${result.type}-${result.id}`} result={result} />
          ))}
        </div>
      )}
    </div>
  )
}