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
      case "user_joined": return "text-brand-cyan-light"
      case "party_created": return "text-brand-blue-light"
      case "video_uploaded": return "text-brand-purple-light"
      case "message_sent": return "text-brand-orange-light"
      case "user_left": return "text-brand-coral-light"
      default: return "text-white/60"
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
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Live Activity Feed</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors ${
              isLive 
                ? "bg-green-500/20 text-brand-cyan-light" 
                : "bg-white/10 text-white/60"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              isLive ? "bg-green-400 animate-pulse" : "bg-white/40"
            }`} />
            {isLive ? "Live" : "Paused"}
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-white/60">No recent activity</p>
          </div>
        ) : (
          displayedActivities.map((activity) => (
            <div
              key={activity.id}
              className={`flex items-start gap-3 p-3 bg-white/5 rounded-lg border-l-2 transition-all duration-200 ${
                getActivityColor(activity.type).replace('text-', 'border-')
              }`}
            >
              {/* Activity Icon */}
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-lg">{getActivityIcon(activity.type)}</span>
              </div>

              {/* User Avatar */}
              {activity.user && (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {activity.user.avatar ? (
                    <img
                      src={activity.user.avatar}
                      alt={activity.user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white/60 text-sm">
                      {activity.user.username?.charAt(0).toUpperCase() || "?"}
                    </span>
                  )}
                </div>
              )}

              {/* Activity Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${getActivityColor(activity.type)}`}>
                  {activity.description}
                </p>
                
                {/* Additional context */}
                {activity.party && (
                  <p className="text-white/60 text-xs mt-1">
                    in "{activity.party.name}"
                  </p>
                )}
                
                {activity.video && (
                  <p className="text-white/60 text-xs mt-1">
                    "{activity.video.title}"
                  </p>
                )}
              </div>

              {/* Timestamp */}
              <div className="text-white/40 text-xs flex-shrink-0">
                {formatTime(activity.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Activity Stats */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-brand-cyan-light">
              {activities.filter(a => a.type === "user_joined").length}
            </div>
            <div className="text-white/60 text-xs">Users Joined</div>
          </div>
          
          <div>
            <div className="text-lg font-bold text-brand-blue-light">
              {activities.filter(a => a.type === "party_created").length}
            </div>
            <div className="text-white/60 text-xs">Parties Created</div>
          </div>
          
          <div>
            <div className="text-lg font-bold text-brand-purple-light">
              {activities.filter(a => a.type === "video_uploaded").length}
            </div>
            <div className="text-white/60 text-xs">Videos Uploaded</div>
          </div>
          
          <div>
            <div className="text-lg font-bold text-brand-orange-light">
              {activities.filter(a => a.type === "message_sent").length}
            </div>
            <div className="text-white/60 text-xs">Messages Sent</div>
          </div>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      {isLive && (
        <div className="mt-4 text-center">
          <span className="text-white/40 text-xs">
            Auto-refreshing every 30 seconds
          </span>
        </div>
      )}
    </div>
  )
}