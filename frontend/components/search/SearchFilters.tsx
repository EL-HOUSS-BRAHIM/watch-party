"use client"

import { useState, useEffect } from "react"

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void
  initialFilters?: Partial<SearchFilters>
  availableTypes?: Array<{ value: string; label: string }>
  showAdvanced?: boolean
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

const DEFAULT_TYPES = [
  { value: "all", label: "All Types" },
  { value: "parties", label: "Parties" },
  { value: "users", label: "Users" },
  { value: "videos", label: "Videos" }
]

const VISIBILITY_OPTIONS = [
  { value: "all", label: "All Visibility" },
  { value: "public", label: "Public Only" },
  { value: "private", label: "Private Only" }
]

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active Only" },
  { value: "inactive", label: "Inactive Only" }
]

const DATE_RANGE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" }
]

const SORT_OPTIONS = [
  { value: "relevance", label: "Most Relevant" },
  { value: "recent", label: "Most Recent" },
  { value: "popular", label: "Most Popular" },
  { value: "alphabetical", label: "Alphabetical" }
]

export default function SearchFilters({
  onFiltersChange,
  initialFilters = {},
  availableTypes = DEFAULT_TYPES,
  showAdvanced = false
}: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    type: "all",
    visibility: "all",
    status: "all",
    date_range: "all",
    sort_by: "relevance",
    tags: [],
    ...initialFilters
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(showAdvanced)
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const addTag = () => {
    if (tagInput.trim() && !filters.tags?.includes(tagInput.trim())) {
      updateFilter("tags", [...(filters.tags || []), tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    updateFilter("tags", filters.tags?.filter(t => t !== tag) || [])
  }

  const resetFilters = () => {
    setFilters({
      type: "all",
      visibility: "all",
      status: "all",
      date_range: "all",
      sort_by: "relevance",
      tags: []
    })
  }

  const hasActiveFilters = () => {
    return filters.type !== "all" ||
           filters.visibility !== "all" ||
           filters.status !== "all" ||
           filters.date_range !== "all" ||
           filters.sort_by !== "relevance" ||
           (filters.tags && filters.tags.length > 0) ||
           filters.location ||
           filters.min_members ||
           filters.max_members
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-white">Filters</h3>
        <div className="flex gap-2">
          {showAdvanced && (
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded transition-colors"
            >
              {showAdvancedFilters ? "Hide Advanced" : "Show Advanced"}
            </button>
          )}
          {hasActiveFilters() && (
            <button
              onClick={resetFilters}
              className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-brand-coral-light text-sm rounded transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Type Filter */}
          <div>
            <label className="block text-white/80 text-sm mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => updateFilter("type", e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {availableTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Visibility Filter */}
          <div>
            <label className="block text-white/80 text-sm mb-1">Visibility</label>
            <select
              value={filters.visibility}
              onChange={(e) => updateFilter("visibility", e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {VISIBILITY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-white/80 text-sm mb-1">Date Range</label>
            <select
              value={filters.date_range}
              onChange={(e) => updateFilter("date_range", e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {DATE_RANGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <label className="block text-white/80 text-sm mb-1">Sort By</label>
            <select
              value={filters.sort_by}
              onChange={(e) => updateFilter("sort_by", e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags Filter */}
        <div>
          <label className="block text-white/80 text-sm mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag()
                }
              }}
              placeholder="Add tag..."
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
            <button
              onClick={addTag}
              disabled={!tagInput.trim()}
              className="px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
          {filters.tags && filters.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-brand-blue-light text-sm rounded"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-brand-blue-light transition-colors"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="pt-4 border-t border-white/10 space-y-4">
            <h4 className="font-medium text-white/90 text-sm">Advanced Filters</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-white/80 text-sm mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => updateFilter("status", e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-white/80 text-sm mb-1">Location</label>
                <input
                  type="text"
                  value={filters.location || ""}
                  onChange={(e) => updateFilter("location", e.target.value)}
                  placeholder="Enter location..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              {/* Member Count Range */}
              <div>
                <label className="block text-white/80 text-sm mb-1">Member Count</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.min_members || ""}
                    onChange={(e) => updateFilter("min_members", e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Min"
                    className="flex-1 px-2 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                  <span className="text-white/60 self-center">-</span>
                  <input
                    type="number"
                    value={filters.max_members || ""}
                    onChange={(e) => updateFilter("max_members", e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Max"
                    className="flex-1 px-2 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Summary */}
        {hasActiveFilters() && (
          <div className="pt-4 border-t border-white/10">
            <p className="text-white/60 text-sm mb-2">Active filters:</p>
            <div className="flex flex-wrap gap-2">
              {filters.type !== "all" && (
                <span className="px-2 py-1 bg-purple-600/20 text-brand-purple-light text-xs rounded">
                  Type: {availableTypes.find(t => t.value === filters.type)?.label}
                </span>
              )}
              {filters.visibility !== "all" && (
                <span className="px-2 py-1 bg-green-600/20 text-brand-cyan-light text-xs rounded">
                  Visibility: {VISIBILITY_OPTIONS.find(o => o.value === filters.visibility)?.label}
                </span>
              )}
              {filters.date_range !== "all" && (
                <span className="px-2 py-1 bg-blue-600/20 text-brand-blue-light text-xs rounded">
                  Date: {DATE_RANGE_OPTIONS.find(o => o.value === filters.date_range)?.label}
                </span>
              )}
              {filters.sort_by !== "relevance" && (
                <span className="px-2 py-1 bg-yellow-600/20 text-brand-orange-light text-xs rounded">
                  Sort: {SORT_OPTIONS.find(o => o.value === filters.sort_by)?.label}
                </span>
              )}
              {filters.tags && filters.tags.length > 0 && (
                <span className="px-2 py-1 bg-red-600/20 text-brand-coral-light text-xs rounded">
                  Tags: {filters.tags.length}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}