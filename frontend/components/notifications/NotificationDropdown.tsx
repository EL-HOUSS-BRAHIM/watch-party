"use client"

import { useState, useEffect } from "react"
import api, { Notification } from "@/lib/api-client"

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
  onSettingsClick: () => void
}

export default function NotificationDropdown({ isOpen, onClose, onSettingsClick }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadRecentNotifications()
    }
  }, [isOpen])

  const loadRecentNotifications = async () => {
    setLoading(true)
    try {
      const response = await api.get("/notifications/", { 
        params: { page_size: 5, ordering: "-created_at" } 
      })
      const notificationsList = Array.isArray(response) ? response : (response.results || [])
      
      setNotifications(notificationsList)
      setUnreadCount(notificationsList.filter((n: any) => !n.is_read).length)
    } catch (error) {
      console.error("Failed to load notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/`, { is_read: true })
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "party_invite": return "🎬"
      case "friend_request": return "👋"
      case "message": return "💬"
      case "video_processed": return "📹"
      case "party_started": return "▶️"
      case "system": return "🔔"
      default: return "📢"
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    return `${Math.floor(diffInSeconds / 86400)}d`
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-semibold text-white">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                {unreadCount}
              </span>
            )}
            <button
              onClick={onSettingsClick}
              className="text-white/60 hover:text-white transition-colors"
              title="Settings"
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🔔</div>
              <p className="text-white/60 text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-white/5 transition-colors ${
                    !notification.is_read ? "bg-blue-500/10" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !notification.is_read ? "bg-blue-500/20" : "bg-white/10"
                    }`}>
                      <span className="text-sm">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium mb-1 ${
                        !notification.is_read ? "text-white" : "text-white/80"
                      }`}>
                        {notification.title}
                      </h4>
                      <p className={`text-xs mb-2 line-clamp-2 ${
                        !notification.is_read ? "text-white/80" : "text-white/60"
                      }`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-white/40 text-xs">
                          {formatTime(notification.created_at)}
                        </span>
                        
                        {!notification.is_read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <a
            href="/dashboard/notifications"
            className="block w-full text-center text-blue-400 hover:text-blue-300 text-sm transition-colors"
            onClick={onClose}
          >
            View all notifications
          </a>
        </div>
      </div>
    </>
  )
}