"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { videosApi, type VideoSummary } from "@/lib/api-client"
import { GradientCard } from "@/components/ui/gradient-card"
import { IconButton } from "@/components/ui/icon-button"
import { LiveIndicator } from "@/components/ui/live-indicator"
import { LoadingState, ErrorMessage, EmptyState } from "@/components/ui/feedback"
import { useDesignSystem } from "@/hooks/use-design-system"

export default function LibraryPage() {
  const router = useRouter()
  const { formatNumber } = useDesignSystem()
  const [videos, setVideos] = useState<VideoSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filterBy, setFilterBy] = useState<"all" | "public" | "private">("all")
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "name">("recent")

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await videosApi.list()
      setVideos(data?.results ?? [])
    } catch (err) {
      console.error('Failed to load videos:', err)
      setError(err instanceof Error ? err.message : 'Failed to load videos from API')
    } finally {
      setLoading(false)
    }
  }

  // Map API data to media format
  type MediaItem = {
    id: string;
    title: string;
    type: string;
    duration: string;
    ambience: string;
    thumbnail: string | null | undefined;
    visibility: "public" | "friends" | "private";
    views: number;
    likes: number;
    upload_date: string;
  };

  const media: MediaItem[] = videos.map(video => ({
    id: video.id,
    title: video.title || 'Untitled Video',
    type: video.source_type || 'Video',
    duration: video.duration_formatted || 'Unknown',
    ambience: video.visibility || 'private',
    thumbnail: video.thumbnail,
    visibility: (video.visibility || 'private') as "public" | "friends" | "private",
    views: (video as any).view_count || 0,
    likes: (video as any).like_count || 0,
    upload_date: video.created_at || new Date().toISOString()
  }));

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "feature film": return "🎬"
      case "live event": return "📡"
      case "anthology": return "📚"
      case "series": return "📺"
      case "documentary": return "🎥"
      default: return "🎞️"
    }
  }

  const getVisibilityColor = (visibility: string) => {
    return visibility === "public" ? "text-brand-cyan-light" : "text-brand-orange-light"
  }

  const filteredAndSortedMedia = media
    .filter(item => filterBy === "all" || item.visibility === filterBy)
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.views - a.views
        case "name":
          return a.title.localeCompare(b.title)
        case "recent":
        default:
          return new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime()
      }
    })

  if (loading) {
    return <LoadingState message="Loading your library..." />
  }

  return (
    <div className="space-y-8">
      {error && (
        <ErrorMessage 
          message={error} 
          type="error"
          onDismiss={() => setError(null)}
        />
      )}

      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-brand-cyan/20 rounded-3xl blur-xl"></div>
        <GradientCard className="relative border-brand-purple/30">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                  📚 Media Library
                </h1>
                <LiveIndicator isLive={true} count={media.length} label="Videos" />
              </div>
              <p className="text-white/80 text-lg">Curate your watch night catalogue with style and ambience</p>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>🎬 Movies & Shows</span>
                <span>•</span>
                <span>🎨 Custom Ambience</span>
                <span>•</span>
                <span>⚡ Instant Launch</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <IconButton
                onClick={() => router.push("/dashboard/videos/upload")}
                gradient="from-brand-purple to-brand-blue"
                className="shadow-lg hover:shadow-purple-500/25"
              >
                <span>📤</span>
                <span className="hidden sm:inline">Upload Video</span>
              </IconButton>
              <IconButton
                onClick={() => router.push("/dashboard/library/playlists")}
                variant="secondary"
              >
                <span>📋</span>
                <span className="hidden sm:inline">Playlists</span>
              </IconButton>
            </div>
          </div>
        </GradientCard>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {/* Filter */}
          <div className="flex gap-1 bg-black/20 p-1 rounded-xl border border-white/10">
            {[
              { key: "all", label: "All", count: media.length },
              { key: "public", label: "Public", count: media.filter(m => m.visibility === "public").length },
              { key: "private", label: "Private", count: media.filter(m => m.visibility === "private").length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilterBy(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filterBy === key
                    ? "bg-gradient-to-r from-brand-purple to-brand-blue text-white shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{label}</span>
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full font-bold">{count}</span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="recent">Recent</option>
            <option value="popular">Popular</option>
            <option value="name">Name</option>
          </select>
        </div>

        {/* View Mode */}
        <div className="flex gap-1 bg-black/20 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-2 rounded-lg transition-all ${
              viewMode === "grid" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            ▦
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 rounded-lg transition-all ${
              viewMode === "list" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Media Grid/List */}
      {filteredAndSortedMedia.length === 0 ? (
        <EmptyState
          icon="📚"
          title="Your Library is Empty"
          message="Upload your first video to start building your collection"
          actionLabel="📤 Upload First Video"
          onAction={() => router.push("/dashboard/videos/upload")}
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedMedia.map((item) => (
            <GradientCard key={item.id} className="hover:border-purple-400/40 transition-all duration-300">
              {/* Thumbnail */}
              <div className="relative h-40 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl mb-4 overflow-hidden">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl">{getTypeIcon(item.type)}</span>
                  </div>
                )}
                
                {/* Overlay Info */}
                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                  <span className="bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
                    {item.duration}
                  </span>
                  <span className={`bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs ${getVisibilityColor(item.visibility)}`}>
                    {item.visibility === "public" ? "🌍" : "🔒"} {item.visibility}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-white font-bold text-lg line-clamp-2">{item.title}</h3>
                  <p className="text-white/60 text-sm flex items-center gap-2">
                    <span>{getTypeIcon(item.type)}</span>
                    {item.type}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-white/60">
                  <span>👀 {formatNumber(item.views)}</span>
                  <span>❤️ {formatNumber(item.likes)}</span>
                  <span>{new Date(item.upload_date).toLocaleDateString()}</span>
                </div>

                {/* Ambience Tag */}
                <div className="flex items-center gap-2">
                  <span className="text-white/50 text-xs">Ambience:</span>
                  <span className="bg-gradient-to-r from-purple-600/20 to-brand-blue/20 px-3 py-1 rounded-full text-xs text-white border border-white/10">
                    🎨 {item.ambience}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <IconButton
                    onClick={() => router.push(`/dashboard/videos/${item.id}`)}
                    variant="primary"
                    size="sm"
                    className="flex-1"
                  >
                    ▶️ Play
                  </IconButton>
                  <IconButton
                    onClick={() => router.push(`/dashboard/videos/${item.id}/edit`)}
                    variant="secondary"
                    size="sm"
                  >
                    ✏️
                  </IconButton>
                  <IconButton
                    onClick={() => router.push(`/dashboard/parties/create?video=${item.id}`)}
                    variant="secondary"
                    size="sm"
                  >
                    🎬
                  </IconButton>
                </div>
              </div>
            </GradientCard>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredAndSortedMedia.map((item) => (
            <GradientCard key={item.id} className="hover:border-purple-400/40 transition-all duration-300">
              <div className="flex items-center gap-6">
                {/* Thumbnail */}
                <div className="w-24 h-16 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg overflow-hidden flex-shrink-0">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-xl">{getTypeIcon(item.type)}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg truncate">{item.title}</h3>
                  <p className="text-white/60 text-sm">{item.type} • {item.duration}</p>
                  <div className="flex items-center gap-4 text-xs text-white/50 mt-1">
                    <span>👀 {formatNumber(item.views)}</span>
                    <span>❤️ {formatNumber(item.likes)}</span>
                    <span className={getVisibilityColor(item.visibility)}>
                      {item.visibility === "public" ? "🌍" : "🔒"} {item.visibility}
                    </span>
                    <span>🎨 {item.ambience}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <IconButton
                    onClick={() => router.push(`/dashboard/videos/${item.id}`)}
                    variant="primary"
                    size="sm"
                  >
                    ▶️ Play
                  </IconButton>
                  <IconButton
                    onClick={() => router.push(`/dashboard/videos/${item.id}/edit`)}
                    variant="secondary"
                    size="sm"
                  >
                    ✏️
                  </IconButton>
                  <IconButton
                    onClick={() => router.push(`/dashboard/parties/create?video=${item.id}`)}
                    variant="secondary"
                    size="sm"
                  >
                    🎬
                  </IconButton>
                </div>
              </div>
            </GradientCard>
          ))}
        </div>
      )}
    </div>
  )
}
