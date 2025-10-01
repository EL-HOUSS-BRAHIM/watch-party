"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api-client"
import { GradientCard } from "@/components/ui/gradient-card"
import { IconButton } from "@/components/ui/icon-button"
import { LiveIndicator } from "@/components/ui/live-indicator"
import { FeatureCard } from "@/components/ui/feature-card"
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
  const { formatNumber, liveStats } = useDesignSystem()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"upcoming" | "my-events" | "past">("upcoming")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    loadEvents()
  }, [activeTab])

  const loadEvents = async () => {
    try {
      setLoading(true)
      // Since events API endpoints exist in backend, we'll implement them
      const response = await api.get('/api/events/', {
        params: {
          status: activeTab === "past" ? "ended" : "upcoming",
          page_size: 20
        }
      })
      setEvents(response.results || [])
    } catch (error) {
      console.error("Failed to load events:", error)
      // Fallback to mock data for now
      setEvents(mockEvents)
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
      case "upcoming": return "bg-blue-500/20 text-blue-400"
      case "live": return "bg-green-500/20 text-green-400"
      case "ended": return "bg-gray-500/20 text-gray-400"
      case "cancelled": return "bg-red-500/20 text-red-400"
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white/60">Loading events...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-blue-600/20 to-purple-600/20 rounded-3xl blur-xl"></div>
        <GradientCard className="relative border-cyan-500/30">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                  🎆 Events
                </h1>
                <LiveIndicator 
                  isLive={true} 
                  count={events.filter(e => e.status === 'upcoming').length} 
                  label="Upcoming" 
                />
              </div>
              <p className="text-white/80 text-lg">Join epic movie marathons and community celebrations</p>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>🎬 Movie Marathons</span>
                <span>•</span>
                <span>🎉 Special Screenings</span>
                <span>•</span>
                <span>🏆 Competitions</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex gap-1 bg-black/20 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  ☰
                </button>
              </div>
              <IconButton
                onClick={() => router.push("/dashboard/events/create")}
                gradient="from-cyan-600 to-blue-600"
                className="shadow-lg hover:shadow-cyan-500/25"
              >
                <span>✨</span>
                <span className="hidden sm:inline">Create Event</span>
              </IconButton>
            </div>
          </div>
        </GradientCard>
      </div>

      {/* Enhanced Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-white/50 text-xl">🔍</span>
        </div>
        <input
          type="text"
          placeholder="Search events by title, organizer, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 backdrop-blur-sm transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Enhanced Tabs */}
      <div className="flex gap-1 bg-black/20 p-1 rounded-2xl border border-white/10 w-fit mx-auto">
        {[
          { id: "upcoming", label: "Upcoming", icon: "📅", count: events.filter(e => e.status === "upcoming").length },
          { id: "my-events", label: "My Events", icon: "🎯", count: events.filter(e => e.is_attending).length },
          { id: "past", label: "Past Events", icon: "📚", count: events.filter(e => e.status === "ended").length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg scale-105"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
            <span className="bg-white/20 text-xs px-2 py-1 rounded-full font-bold">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => {
          const dateTime = formatDateTime(event.start_time)
          return (
            <div key={event.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200">
              {/* Event Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(event.status)}`}>
                    <span>{getStatusIcon(event.status)}</span>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <span>📅</span>
                  <span>{dateTime.date}</span>
                  <span>•</span>
                  <span>🕐</span>
                  <span>{dateTime.time}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-white/70">
                  <span>👥</span>
                  <span>{event.attendee_count} attending</span>
                  {event.max_attendees && (
                    <>
                      <span>•</span>
                      <span>Max {event.max_attendees}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3 text-sm text-white/70">
                  <span>👤</span>
                  <span>by {event.organizer.username}</span>
                </div>

                {event.description && (
                  <p className="text-sm text-white/60 line-clamp-2">{event.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {event.status === "upcoming" && (
                  <>
                    {event.is_attending ? (
                      <button
                        onClick={() => handleLeaveEvent(event.id)}
                        className="flex-1 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-medium transition-colors"
                      >
                        Leave Event
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinEvent(event.id)}
                        className="flex-1 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg font-medium transition-colors"
                      >
                        Join Event
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => router.push(`/dashboard/events/${event.id}`)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎭</div>
          <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
          <p className="text-white/60 mb-6">
            {searchQuery
              ? "Try adjusting your search criteria"
              : activeTab === "upcoming"
              ? "No upcoming events at the moment"
              : activeTab === "my-events"
              ? "You haven't joined any events yet"
              : "No past events to show"
            }
          </p>
          {activeTab === "upcoming" && !searchQuery && (
            <button
              onClick={() => router.push("/dashboard/events/create")}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200"
            >
              Create First Event
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Mock data for fallback
const mockEvents: Event[] = [
  {
    id: "1",
    title: "Movie Marathon Night",
    description: "Join us for an epic movie marathon featuring the best sci-fi films!",
    start_time: "2025-10-15T20:00:00Z",
    organizer: { id: "1", username: "filmmaker_alex", avatar: "" },
    attendee_count: 42,
    max_attendees: 100,
    status: "upcoming",
    created_at: "2025-10-01T10:00:00Z",
    is_attending: false
  },
  {
    id: "2",
    title: "Horror Movie Night",
    description: "Get ready for some scares! Classic horror movies all night long.",
    start_time: "2025-10-31T19:00:00Z",
    organizer: { id: "2", username: "horror_fan", avatar: "" },
    attendee_count: 28,
    max_attendees: 50,
    status: "upcoming",
    created_at: "2025-10-01T15:00:00Z",
    is_attending: true
  },
  {
    id: "3",
    title: "Anime Watch Party",
    description: "Let's watch the latest anime episodes together!",
    start_time: "2025-09-20T18:00:00Z",
    organizer: { id: "3", username: "anime_lover", avatar: "" },
    attendee_count: 67,
    status: "ended",
    created_at: "2025-09-15T12:00:00Z",
    is_attending: true
  }
]