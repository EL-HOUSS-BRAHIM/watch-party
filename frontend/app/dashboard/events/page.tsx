"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api-client"
import { GradientCard } from "@/components/ui/gradient-card"
import { IconButton } from "@/components/ui/icon-button"
import { LiveIndicator } from "@/components/ui/live-indicator"
import { LoadingState, ErrorMessage, EmptyState } from "@/components/ui/feedback"
import { useDesignSystem } from "@/hooks/use-design-system"

interface Event {
  id: string
  title: string
  description?: string
  start_time: string
  end_time?: string
  organizer: {
    id: string
    username: string
    avatar?: string
  }
  attendee_count: number
  max_attendees?: number
  status: 'upcoming' | 'live' | 'ended' | 'cancelled'
  created_at: string
  is_attending?: boolean
  rsvp_status?: 'yes' | 'no' | 'maybe'
}

export default function EventsPage() {
  const router = useRouter()
  const { formatNumber: _formatNumber } = useDesignSystem()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"upcoming" | "my-events" | "past">("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    loadEvents()
  }, [activeTab])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      // Since events API endpoints exist in backend, we'll implement them
      const response = await api.get('/api/events/', {
        params: {
          status: activeTab === "past" ? "ended" : "upcoming",
          page_size: 20
        }
      })
      setEvents(response.results || [])
    } catch (err) {
      console.error("Failed to load events:", err)
      setError(err instanceof Error ? err.message : 'Failed to load events from API')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleJoinEvent = async (eventId: string) => {
    try {
      await api.post(`/api/events/${eventId}/join/`)
      await loadEvents() // Reload to update attendee count
    } catch (error) {
      console.error("Failed to join event:", error)
    }
  }

  const handleLeaveEvent = async (eventId: string) => {
    try {
      await api.post(`/api/events/${eventId}/leave/`)
      await loadEvents()
    } catch (error) {
      console.error("Failed to leave event:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-brand-blue/20 text-brand-blue-light"
      case "live": return "bg-brand-cyan/20 text-brand-cyan-light"
      case "ended": return "bg-gray-500/20 text-gray-400"
      case "cancelled": return "bg-brand-coral/20 text-brand-coral-light"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming": return "📅"
      case "live": return "🔴"
      case "ended": return "✅"
      case "cancelled": return "❌"
      default: return "📅"
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <LoadingState message="Loading events..." />
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {error && (
        <ErrorMessage 
          message={error} 
          type="error"
          onDismiss={() => setError(null)}
        />
      )}
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/20 via-brand-blue/20 to-brand-purple/20 rounded-2xl sm:rounded-3xl blur-3xl opacity-60 pointer-events-none"></div>
        <div className="glass-panel relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-brand-cyan/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
            <div className="space-y-2">
              <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 sm:gap-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-navy">
                  <span className="gradient-text">Events</span>
                </h1>
                <LiveIndicator 
                  isLive={true} 
                  count={events.filter(e => e.status === 'upcoming').length} 
                  label="Upcoming" 
                />
              </div>
              <p className="text-brand-navy/70 text-sm sm:text-base lg:text-lg">Join epic movie marathons and community celebrations</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-brand-navy/60 font-medium">
                <span>🎬 Movie Marathons</span>
                <span className="hidden xs:inline">•</span>
                <span>🎉 Special Screenings</span>
                <span className="hidden xs:inline">•</span>
                <span>🏆 Competitions</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 w-full xs:w-auto">
              <div className="flex gap-1 bg-white/50 p-1 rounded-xl border border-brand-navy/10 backdrop-blur-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-lg transition-all flex items-center justify-center ${
                    viewMode === "grid" ? "bg-brand-navy text-white shadow-md" : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
                  }`}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-lg transition-all flex items-center justify-center ${
                    viewMode === "list" ? "bg-brand-navy text-white shadow-md" : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
                  }`}
                >
                  ☰
                </button>
              </div>
              <button
                onClick={() => router.push("/dashboard/events/create")}
                className="btn-gradient px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-brand-cyan/25 transition-all hover:-translate-y-0.5 flex items-center gap-2 min-h-[44px] flex-1 xs:flex-none justify-center"
              >
                <span>✨</span>
                <span className="hidden xs:inline">Create Event</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
          <span className="text-brand-navy/40 text-lg sm:text-xl">🔍</span>
        </div>
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 sm:pl-12 lg:pl-14 pr-10 sm:pr-6 py-3 sm:py-4 text-sm sm:text-base bg-white/50 border border-brand-navy/10 rounded-xl sm:rounded-2xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-cyan/10 focus:border-brand-cyan/30 transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-brand-navy/40 hover:text-brand-navy min-w-[44px] justify-center"
          >
            ✕
          </button>
        )}
      </div>

      {/* Enhanced Tabs */}
      <div className="flex flex-col xs:flex-row gap-2 xs:gap-1 bg-white/40 p-2 xs:p-1 rounded-xl sm:rounded-2xl border border-brand-navy/5 backdrop-blur-sm w-full xs:w-fit mx-auto overflow-x-auto">
        {[
          { id: "upcoming", label: "Upcoming", icon: "📅", count: events.filter(e => e.status === "upcoming").length },
          { id: "my-events", label: "My Events", icon: "🎯", count: events.filter(e => e.is_attending).length },
          { id: "past", label: "Past", icon: "📚", count: events.filter(e => e.status === "ended").length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 lg:gap-3 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all duration-300 min-h-[44px] whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-brand-navy text-white shadow-lg"
                : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
            }`}
          >
            <span className="text-sm sm:text-base lg:text-lg">{tab.icon}</span>
            <span className="text-xs sm:text-sm lg:text-base">{tab.label}</span>
            <span className="bg-white/20 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-bold">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {filteredEvents.map((event) => {
          const dateTime = formatDateTime(event.start_time)
          return (
            <div key={event.id} className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 hover:border-brand-cyan/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5 group">
              {/* Event Header */}
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-brand-navy mb-2 group-hover:text-brand-blue transition-colors">{event.title}</h3>
                  <div className={`inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide ${
                    event.status === "upcoming" ? "bg-brand-blue/10 text-brand-blue" :
                    event.status === "live" ? "bg-brand-cyan/10 text-brand-cyan-dark animate-pulse" :
                    event.status === "ended" ? "bg-brand-navy/5 text-brand-navy/40" :
                    "bg-brand-coral/10 text-brand-coral-dark"
                  }`}>
                    <span>{getStatusIcon(event.status)}</span>
                    {event.status}
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-2 sm:space-y-3 lg:space-y-4 mb-4 sm:mb-5 lg:mb-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-brand-navy/70 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="text-base sm:text-lg">📅</span>
                    <span>{dateTime.date}</span>
                  </span>
                  <span className="text-brand-navy/20">•</span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-base sm:text-lg">🕐</span>
                    <span>{dateTime.time}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-brand-navy/70 font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="text-base sm:text-lg">👥</span>
                    <span>{event.attendee_count} attending</span>
                  </span>
                  {event.max_attendees && (
                    <>
                      <span className="text-brand-navy/20">•</span>
                      <span>Max {event.max_attendees}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-brand-navy/70 font-medium">
                  <span className="text-base sm:text-lg">👤</span>
                  <span>by <span className="text-brand-navy font-bold">{event.organizer.username}</span></span>
                </div>

                {event.description && (
                  <p className="text-xs sm:text-sm text-brand-navy/60 line-clamp-2 leading-relaxed">{event.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-brand-navy/5">
                {event.status === "upcoming" && (
                  <>
                    {event.is_attending ? (
                      <button
                        onClick={() => handleLeaveEvent(event.id)}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral-dark rounded-lg sm:rounded-xl font-bold transition-colors text-xs sm:text-sm min-h-[44px]"
                      >
                        Leave Event
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinEvent(event.id)}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan-dark rounded-lg sm:rounded-xl font-bold transition-colors text-xs sm:text-sm min-h-[44px]"
                      >
                        Join Event
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => router.push(`/dashboard/events/${event.id}`)}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-brand-navy/10 hover:bg-brand-navy hover:text-white text-brand-navy rounded-lg sm:rounded-xl font-bold transition-colors text-xs sm:text-sm shadow-sm min-h-[44px]"
                >
                  View Details
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredEvents.length === 0 && (
        <EmptyState
          icon="🎭"
          title="No events found"
          message={
            searchQuery
              ? "Try adjusting your search criteria"
              : activeTab === "upcoming"
              ? "No upcoming events at the moment"
              : activeTab === "my-events"
              ? "You haven't joined any events yet"
              : "No past events to show"
          }
          actionLabel={activeTab === "upcoming" && !searchQuery ? "Create First Event" : undefined}
          onAction={activeTab === "upcoming" && !searchQuery ? () => router.push("/dashboard/events/create") : undefined}
        />
      )}
    </div>
  )
}