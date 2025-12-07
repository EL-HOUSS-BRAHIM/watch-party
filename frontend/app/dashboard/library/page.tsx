"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { videosApi, type VideoSummary } from "@/lib/api-client"
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
        <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 via-brand-blue/20 to-brand-cyan/20 rounded-3xl blur-3xl opacity-60 pointer-events-none"></div>
        <div className="glass-panel relative rounded-3xl p-8 border-brand-purple/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy">
                  <span className="gradient-text">Media Library</span>
                </h1>
                <LiveIndicator isLive={true} count={media.length} label="Videos" />
              </div>
              <p className="text-brand-navy/70 text-lg">Curate your watch night catalogue with style and ambience</p>
              <div className="flex items-center gap-4 text-sm text-brand-navy/60 font-medium">
                <span>🎬 Movies & Shows</span>
                <span>•</span>
                <span>🎨 Custom Ambience</span>
                <span>•</span>
                <span>⚡ Instant Launch</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard/videos/upload")}
                className="btn-gradient px-6 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-brand-purple/25 transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>📤</span>
                <span className="hidden sm:inline">Upload Video</span>
              </button>
              <button
                onClick={() => router.push("/dashboard/library/playlists")}
                className="px-6 py-3 bg-white border border-brand-navy/10 hover:bg-brand-navy/5 text-brand-navy rounded-xl font-bold transition-colors flex items-center gap-2"
              >
                <span>📋</span>
                <span className="hidden sm:inline">Playlists</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {/* Filter */}
          <div className="flex gap-1 bg-white/40 p-1 rounded-xl border border-brand-navy/5 backdrop-blur-sm">
            {[
              { key: "all", label: "All", count: media.length },
              { key: "public", label: "Public", count: media.filter(m => m.visibility === "public").length },
              { key: "private", label: "Private", count: media.filter(m => m.visibility === "private").length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilterBy(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all duration-200 ${
                  filterBy === key
                    ? "bg-brand-navy text-white shadow-md"
                    : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
                }`}
              >
                <span>{label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${filterBy === key ? "bg-white/20 text-white" : "bg-brand-navy/5 text-brand-navy/60"}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-white/40 border border-brand-navy/10 rounded-xl text-brand-navy font-medium focus:outline-none focus:ring-2 focus:ring-brand-purple/20 cursor-pointer hover:bg-white/60 transition-colors"
          >
            <option value="recent">Recent</option>
            <option value="popular">Popular</option>
            <option value="name">Name</option>
          </select>
        </div>

        {/* View Mode */}
        <div className="flex gap-1 bg-white/40 p-1 rounded-xl border border-brand-navy/5 backdrop-blur-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-2 rounded-lg transition-all ${
              viewMode === "grid" ? "bg-brand-navy text-white shadow-md" : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
            }`}
          >
            ▦
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-2 rounded-lg transition-all ${
              viewMode === "list" ? "bg-brand-navy text-white shadow-md" : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
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
            <div key={item.id} className="glass-card rounded-2xl p-4 hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5 group">
              {/* Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 rounded-xl mb-4 overflow-hidden group-hover:shadow-inner">
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-5xl opacity-50 group-hover:scale-110 transition-transform duration-300">{getTypeIcon(item.type)}</span>
                  </div>
                )}
                
                {/* Overlay Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                  <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-xs font-bold border border-white/10">
                    {item.duration}
                  </span>
                  <span className={`bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold border border-white/10 ${getVisibilityColor(item.visibility)}`}>
                    {item.visibility === "public" ? "🌍" : "🔒"} {item.visibility.charAt(0).toUpperCase() + item.visibility.slice(1)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-brand-navy font-bold text-lg line-clamp-1 group-hover:text-brand-purple transition-colors">{item.title}</h3>
                  <p className="text-brand-navy/60 text-xs font-bold uppercase tracking-wide flex items-center gap-2 mt-1">
                    <span>{getTypeIcon(item.type)}</span>
                    {item.type}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs font-medium text-brand-navy/50 bg-brand-navy/5 rounded-lg p-2">
                  <span>👀 {formatNumber(item.views)}</span>
                  <span>❤️ {formatNumber(item.likes)}</span>
                  <span>{new Date(item.upload_date).toLocaleDateString()}</span>
                </div>

                {/* Ambience Tag */}
                <div className="flex items-center gap-2">
                  <span className="text-brand-navy/40 text-xs font-bold uppercase">Ambience</span>
                  <span className="bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 px-2.5 py-0.5 rounded-full text-xs font-bold text-brand-purple-dark border border-brand-purple/20">
                    🎨 {item.ambience}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-brand-navy/5">
                  <button
                    onClick={() => router.push(`/dashboard/videos/${item.id}`)}
                    className="flex-1 px-3 py-2 bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple-dark rounded-lg text-sm font-bold transition-colors"
                  >
                    ▶️ Play
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/videos/${item.id}/edit`)}
                    className="px-3 py-2 bg-white border border-brand-navy/10 hover:bg-brand-navy/5 text-brand-navy rounded-lg text-sm font-bold transition-colors"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/parties/create?video=${item.id}`)}
                    className="px-3 py-2 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue-dark rounded-lg text-sm font-bold transition-colors"
                    title="Create Party"
                  >
                    🎬
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {filteredAndSortedMedia.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl p-4 hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-navy/5 group">
              <div className="flex items-center gap-6">
                {/* Thumbnail */}
                <div className="w-32 h-20 bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 rounded-xl overflow-hidden flex-shrink-0 relative group-hover:shadow-md transition-all">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl opacity-50">{getTypeIcon(item.type)}</span>
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-white border border-white/10">
                    {item.duration}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-brand-navy font-bold text-lg truncate group-hover:text-brand-purple transition-colors">{item.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-brand-navy/60 text-xs font-bold uppercase tracking-wide">{item.type}</span>
                    <span className="text-brand-navy/20">•</span>
                    <span className="bg-brand-purple/5 text-brand-purple-dark px-2 py-0.5 rounded-full text-xs font-bold border border-brand-purple/10">
                      🎨 {item.ambience}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-brand-navy/50 mt-2">
                    <span>👀 {formatNumber(item.views)}</span>
                    <span>❤️ {formatNumber(item.likes)}</span>
                    <span className={getVisibilityColor(item.visibility)}>
                      {item.visibility === "public" ? "🌍" : "🔒"} {item.visibility.charAt(0).toUpperCase() + item.visibility.slice(1)}
                    </span>
                    <span>📅 {new Date(item.upload_date).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/videos/${item.id}`)}
                    className="px-4 py-2 bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple-dark rounded-lg text-sm font-bold transition-colors"
                  >
                    ▶️ Play
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/videos/${item.id}/edit`)}
                    className="p-2 bg-white border border-brand-navy/10 hover:bg-brand-navy/5 text-brand-navy rounded-lg transition-colors"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/parties/create?video=${item.id}`)}
                    className="p-2 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue-dark rounded-lg transition-colors"
                    title="Create Party"
                  >
                    🎬
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
