"use client"

import { VideoFilter } from "@/hooks/useVideos"

interface FilterItem {
  key: VideoFilter
  label: string
  icon: string
  count: number
}

interface VideoSearchFilterProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filter: VideoFilter
  onFilterChange: (filter: VideoFilter) => void
  videoCounts: {
    all: number
    ready: number
    processing: number
    failed: number
  }
}

export function VideoSearchFilter({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  videoCounts,
}: VideoSearchFilterProps) {
  const filters: FilterItem[] = [
    { key: "all", label: "All Videos", icon: "📹", count: videoCounts.all },
    { key: "ready", label: "Ready", icon: "✅", count: videoCounts.ready },
    { key: "processing", label: "Processing", icon: "⚡", count: videoCounts.processing },
    { key: "failed", label: "Failed", icon: "❌", count: videoCounts.failed },
  ]

  return (
    <section className="glass-card rounded-3xl p-6" aria-label="Search and filter videos">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative group">
            <div 
              className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none"
              aria-hidden="true"
            >
              <svg 
                className="w-5 h-5 sm:w-6 sm:h-6 text-brand-navy/40 group-focus-within:text-brand-purple transition-colors" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>
            <label htmlFor="video-search" className="sr-only">Search videos</label>
            <input
              id="video-search"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search your video library..."
              className="w-full pl-12 sm:pl-14 pr-6 py-3 sm:py-4 text-base bg-white/50 border border-brand-navy/10 rounded-2xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple/30 focus:bg-white transition-all"
            />
          </div>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {filters.map(({ key, label, icon, count }) => (
              <button
                key={key}
                onClick={() => onFilterChange(key)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-3 rounded-xl font-bold transition-all duration-300 min-h-[44px] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand-navy/30 focus:ring-offset-2 ${
                  filter === key
                    ? "bg-brand-navy text-white shadow-lg sm:scale-105"
                    : "bg-white/50 text-brand-navy/60 hover:bg-white hover:text-brand-navy sm:hover:scale-105 border border-brand-navy/5"
                }`}
                aria-pressed={filter === key}
              >
                <span aria-hidden="true">{icon}</span>
                <span className="hidden sm:inline">{label}</span>
                <span 
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    filter === key ? "bg-white/20 text-white" : "bg-brand-navy/5 text-brand-navy/40"
                  }`}
                  aria-label={`${count} ${label.toLowerCase()}`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
