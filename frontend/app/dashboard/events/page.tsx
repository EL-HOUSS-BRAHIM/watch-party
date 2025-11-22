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
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/20 via-brand-blue/20 to-brand-purple/20 rounded-3xl blur-3xl opacity-60"></div>
        <div className="glass-panel relative rounded-3xl p-8 border-brand-cyan/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy">
                  <span className="gradient-text">Events</span>
                </h1>
                <LiveIndicator 
                  isLive={true} 
                  count={events.filter(e => e.status === 'upcoming').length} 
                  label="Upcoming" 
                />
              </div>
              <p className="text-brand-navy/70 text-lg">Join epic movie marathons and community celebrations</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-brand-navy/60 font-medium">
                <span>🎬 Movie Marathons</span>
                <span>•</span>
                <span>🎉 Special Screenings</span>
                <span>•</span>
                <span>🏆 Competitions</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex gap-1 bg-white/50 p-1 rounded-xl border border-brand-navy/10 backdrop-blur-sm">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid" ? "bg-brand-navy text-white shadow-md" : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
                  }`}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list" ? "bg-brand-navy text-white shadow-md" : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
                  }`}
                >
                  ☰
                </button>
              </div>
              <button
                onClick={() => router.push("/dashboard/events/create")}
                className="btn-gradient px-6 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-brand-cyan/25 transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>✨</span>
                <span className="hidden sm:inline">Create Event</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-brand-navy/40 text-xl">🔍</span>
        </div>
        <input
          type="text"
          placeholder="Search events by title, organizer, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 sm:pl-14 pr-10 sm:pr-6 py-4 bg-white/50 border border-brand-navy/10 rounded-2xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-cyan/10 focus:border-brand-cyan/30 transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-brand-navy/40 hover:text-brand-navy min-w-[44px] justify-center"
          >
            ✕
          </button>
        )}
      </div>

      {/* Enhanced Tabs */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-1 bg-white/40 p-2 sm:p-1 rounded-2xl border border-brand-navy/5 backdrop-blur-sm w-full sm:w-fit mx-auto">
        {[
          { id: "upcoming", label: "Upcoming", icon: "📅", count: events.filter(e => e.status === "upcoming").length },
          { id: "my-events", label: "My Events", icon: "🎯", count: events.filter(e => e.is_attending).length },
          { id: "past", label: "Past Events", icon: "📚", count: events.filter(e => e.status === "ended").length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all duration-300 min-h-[44px] ${
              activeTab === tab.id
                ? "bg-brand-navy text-white shadow-lg sm:scale-105"
                : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
            }`}
          >
            <span className="text-base sm:text-lg">{tab.icon}</span>
            <span className="text-sm sm:text-base">{tab.label}</span>
            <span className="bg-white/20 text-xs px-2 py-1 rounded-full font-bold">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const dateTime = formatDateTime(event.start_time)
          return (
            <div key={event.id} className="glass-card rounded-2xl p-6 hover:border-brand-cyan/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5 group">
              {/* Event Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-brand-navy mb-2 group-hover:text-brand-blue transition-colors">{event.title}</h3>
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
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
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-sm text-brand-navy/70 font-medium">
                  <span className="text-lg">📅</span>
                  <span>{dateTime.date}</span>
                  <span className="text-brand-navy/20">•</span>
                  <span className="text-lg">🕐</span>
                  <span>{dateTime.time}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-brand-navy/70 font-medium">
                  <span className="text-lg">👥</span>
                  <span>{event.attendee_count} attending</span>
                  {event.max_attendees && (
                    <>
                      <span className="text-brand-navy/20">•</span>
                      <span>Max {event.max_attendees}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm text-brand-navy/70 font-medium">
                  <span className="text-lg">👤</span>
                  <span>by <span className="text-brand-navy font-bold">{event.organizer.username}</span></span>
                </div>

                {event.description && (
                  <p className="text-sm text-brand-navy/60 line-clamp-2 leading-relaxed">{event.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-brand-navy/5">
                {event.status === "upcoming" && (
                  <>
                    {event.is_attending ? (
                      <button
                        onClick={() => handleLeaveEvent(event.id)}
                        className="flex-1 px-4 py-2.5 bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral-dark rounded-xl font-bold transition-colors text-sm"
                      >
                        Leave Event
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinEvent(event.id)}
                        className="flex-1 px-4 py-2.5 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan-dark rounded-xl font-bold transition-colors text-sm"
                      >
                        Join Event
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => router.push(`/dashboard/events/${event.id}`)}
                  className="flex-1 px-4 py-2.5 bg-white border border-brand-navy/10 hover:bg-brand-navy hover:text-white text-brand-navy rounded-xl font-bold transition-colors text-sm shadow-sm"
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