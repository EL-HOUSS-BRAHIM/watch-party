"use client"

import { useState } from "react"

interface Activity {
  id: string
  type: "user_joined" | "party_created" | "video_uploaded" | "message_sent" | "user_left"
  user?: {
    username: string
    avatar?: string
  }
  party?: {
    name: string
  }
  video?: {
    title: string
  }
  description: string
  timestamp: string
}

interface RealTimeActivityFeedProps {
  activities: Activity[]
  maxItems?: number
}

export default function RealTimeActivityFeed({ 
  activities, 
  maxItems = 10 
}: RealTimeActivityFeedProps) {
  const [isLive, setIsLive] = useState(true)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_joined": return "👋"
      case "party_created": return "🎬"
      case "video_uploaded": return "📹"
      case "message_sent": return "💬"
      case "user_left": return "👋"
      default: return "📝"
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "user_joined": return "text-brand-cyan-dark"
      case "party_created": return "text-brand-blue-dark"
      case "video_uploaded": return "text-brand-purple-dark"
      case "message_sent": return "text-brand-orange-dark"
      case "user_left": return "text-brand-coral-dark"
      default: return "text-brand-navy/60"
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return date.toLocaleDateString()
  }

  const displayedActivities = activities.slice(0, maxItems)

  return (
    <div className="rounded-3xl border border-brand-navy/10 bg-white/95 p-6 text-brand-navy shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Live activity feed</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition-colors ${
              isLive
                ? "border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan-dark"
                : "border-brand-navy/10 bg-white/70 text-brand-navy/60"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              isLive ? "bg-brand-cyan animate-pulse" : "bg-brand-navy/30"
            }`} />
            {isLive ? "Live" : "Paused"}
          </button>
        </div>
      </div>

      <div className="max-h-96 space-y-3 overflow-y-auto">
        {displayedActivities.length === 0 ? (
          <div className="py-8 text-center text-sm text-brand-navy/60">
            <div className="mb-2 text-4xl">📊</div>
            No recent activity
          </div>
        ) : (
          displayedActivities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start gap-4 rounded-2xl border border-brand-navy/10 bg-white/90 p-4 shadow-[0_12px_32px_rgba(28,28,46,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(28,28,46,0.12)] ring-1 ring-offset-2 ring-offset-white ${
                getActivityColor(activity.type).replace('text-', 'ring-')
              }`}
            >
              {/* Activity Icon */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-neutral">
                <span className="text-lg">{getActivityIcon(activity.type)}</span>
              </div>

              {/* User Avatar */}
              {activity.user && (
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-navy/10 bg-white">
                  {activity.user.avatar ? (
                    <img
                      src={activity.user.avatar}
                      alt={activity.user.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-brand-navy/60">
                      {activity.user.username?.charAt(0).toUpperCase() || "?"}
                    </span>
                  )}
                </div>
              )}

              {/* Activity Content */}
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${getActivityColor(activity.type)}`}>
                  {activity.description}
                </p>

                {/* Additional context */}
                {activity.party && (
                  <p className="mt-1 text-xs text-brand-navy/50">
                    in "{activity.party.name}"
                  </p>
                )}

                {activity.video && (
                  <p className="mt-1 text-xs text-brand-navy/50">
                    "{activity.video.title}"
                  </p>
                )}
              </div>

              {/* Timestamp */}
              <div className="flex-shrink-0 text-xs font-medium uppercase tracking-[0.3em] text-brand-navy/40">
                {formatTime(activity.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Activity Stats */}
      <div className="mt-6 border-t border-brand-navy/10 pt-4">
        <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
          <div>
            <div className="text-lg font-bold text-brand-cyan-dark">
              {activities.filter(a => a.type === "user_joined").length}
            </div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-navy/50">Users joined</div>
          </div>

          <div>
            <div className="text-lg font-bold text-brand-blue-dark">
              {activities.filter(a => a.type === "party_created").length}
            </div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-navy/50">Parties created</div>
          </div>

          <div>
            <div className="text-lg font-bold text-brand-purple-dark">
              {activities.filter(a => a.type === "video_uploaded").length}
            </div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-navy/50">Videos uploaded</div>
          </div>

          <div>
            <div className="text-lg font-bold text-brand-orange-dark">
              {activities.filter(a => a.type === "message_sent").length}
            </div>
            <div className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-navy/50">Messages sent</div>
          </div>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      {isLive && (
        <div className="mt-4 text-center text-[11px] uppercase tracking-[0.3em] text-brand-navy/40">
          Auto-refreshing every 30 seconds
        </div>
      )}
    </div>
  )
}