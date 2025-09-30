"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api, { Notification } from "@/lib/api-client"

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [filter])

  const loadNotifications = async () => {
    try {
      const params: any = { page_size: 50 }
      if (filter === "unread") params.is_read = false
      if (filter === "read") params.is_read = true

      const response = await api.get("/notifications/", { params })
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

  const markAllAsRead = async () => {
    try {
      await api.post("/notifications/mark-all-read/")
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}/`)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      setSelectedNotifications(prev => {
        const newSet = new Set(prev)
        newSet.delete(notificationId)
        return newSet
      })
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const bulkDelete = async () => {
    if (selectedNotifications.size === 0) return

    try {
      await Promise.all(
        Array.from(selectedNotifications).map(id => 
          api.delete(`/notifications/${id}/`)
        )
      )
      
      setNotifications(prev => 
        prev.filter(n => !selectedNotifications.has(n.id))
      )
      setSelectedNotifications(new Set())
    } catch (error) {
      console.error("Failed to delete notifications:", error)
    }
  }

  const toggleSelection = (notificationId: string) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev)
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId)
      } else {
        newSet.add(notificationId)
      }
      return newSet
    })
  }

  const selectAll = () => {
    if (selectedNotifications.size === notifications.length) {
      setSelectedNotifications(new Set())
    } else {
      setSelectedNotifications(new Set(notifications.map(n => n.id)))
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

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "party_invite": return "text-blue-400"
      case "friend_request": return "text-green-400"
      case "message": return "text-yellow-400"
      case "video_processed": return "text-purple-400"
      case "party_started": return "text-red-400"
      case "system": return "text-gray-400"
      default: return "text-white/60"
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread") return !notification.is_read
    if (filter === "read") return notification.is_read
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white/60">Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <div className="bg-black/20 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-white/60 hover:text-white transition-colors"
              >
                ←
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Notifications</h1>
                <p className="text-white/60 text-sm">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up!"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Mark All Read
                </button>
              )}
              
              {selectedNotifications.size > 0 && (
                <button
                  onClick={bulkDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Delete Selected ({selectedNotifications.size})
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-black/10 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: "all", label: "All", count: notifications.length },
              { id: "unread", label: "Unread", count: unreadCount },
              { id: "read", label: "Read", count: notifications.length - unreadCount }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                  filter === tab.id
                    ? "text-blue-400 border-blue-400"
                    : "text-white/60 border-transparent hover:text-white"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {filter === "unread" ? "No unread notifications" : 
               filter === "read" ? "No read notifications" : 
               "No notifications"}
            </h3>
            <p className="text-white/60">
              {filter === "all" 
                ? "We'll notify you when something interesting happens!"
                : `You have no ${filter} notifications at the moment.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Bulk Actions */}
            {filteredNotifications.length > 0 && (
              <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.size === filteredNotifications.length && filteredNotifications.length > 0}
                    onChange={selectAll}
                    className="rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-white/80 text-sm">
                    {selectedNotifications.size > 0 
                      ? `${selectedNotifications.size} selected`
                      : "Select all"
                    }
                  </span>
                </div>
                
                <div className="text-white/60 text-sm">
                  {filteredNotifications.length} notifications
                </div>
              </div>
            )}

            {/* Notifications List */}
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                    !notification.is_read
                      ? "bg-blue-500/10 border-blue-500/20"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  } ${
                    selectedNotifications.has(notification.id)
                      ? "ring-2 ring-blue-500/50"
                      : ""
                  }`}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.has(notification.id)}
                    onChange={() => toggleSelection(notification.id)}
                    className="mt-1 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500"
                  />

                  {/* Notification Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    !notification.is_read ? "bg-blue-500/20" : "bg-white/10"
                  }`}>
                    <span className="text-xl">
                      {getNotificationIcon(notification.type)}
                    </span>
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`font-medium ${
                        !notification.is_read ? "text-white" : "text-white/80"
                      }`}>
                        {notification.title}
                      </h3>
                      <span className="text-white/40 text-xs flex-shrink-0 ml-4">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>
                    
                    <p className={`text-sm mb-3 ${
                      !notification.is_read ? "text-white/80" : "text-white/60"
                    }`}>
                      {notification.message}
                    </p>

                    {/* Notification Data */}
                    {notification.data && (
                      <div className="text-xs text-white/50 mb-3">
                        {notification.data.party_name && (
                          <span>Party: {notification.data.party_name}</span>
                        )}
                        {notification.data.user_name && (
                          <span>From: {notification.data.user_name}</span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                      
                      {notification.action_url && (
                        <a
                          href={notification.action_url}
                          className="text-green-400 hover:text-green-300 text-sm transition-colors"
                        >
                          View
                        </a>
                      )}
                      
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.is_read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}