"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api, { Notification } from "@/lib/api-client"

const filters: { id: "all" | "unread" | "read"; label: string; icon: string }[] = [
  { id: "all", label: "All", icon: "🌐" },
  { id: "unread", label: "Unread", icon: "🔔" },
  { id: "read", label: "Archive", icon: "📚" }
]

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadNotifications()

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
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n))
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
      await Promise.all(Array.from(selectedNotifications).map(id => api.delete(`/notifications/${id}/`)))
      setNotifications(prev => prev.filter(n => !selectedNotifications.has(n.id)))
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
      <div className="flex min-h-[420px] items-center justify-center text-brand-navy/60">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-brand-blue border-t-transparent" />
          <p className="text-sm font-semibold uppercase tracking-[0.3em]">Loading notifications…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-brand-navy/10 bg-white/90 p-6 shadow-[0_24px_70px_rgba(28,28,46,0.12)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue transition-colors hover:text-brand-blue-dark"
            >
              ← Back to dashboard
            </button>
            <h1 className="mt-3 text-2xl font-bold text-brand-navy">Inbox center</h1>
            <p className="mt-1 text-sm text-brand-navy/70">
              Manage invites, system alerts, and watch party updates from a single organized feed.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-2 rounded-full border border-brand-purple/20 bg-brand-purple/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-purple"
              >
                ✅ Mark all read
              </button>
            )}
            {selectedNotifications.size > 0 && (
              <button
                onClick={bulkDelete}
                className="inline-flex items-center gap-2 rounded-full border border-brand-coral/20 bg-brand-coral/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-coral-dark"
              >
                🗑️ Delete selected ({selectedNotifications.size})
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-all ${
                filter === item.id
                  ? "border-brand-purple/30 bg-brand-purple/10 text-brand-purple"
                  : "border-brand-navy/10 bg-white/70 text-brand-navy/60 hover:border-brand-navy/20 hover:text-brand-navy"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between text-sm text-brand-navy/60">
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="rounded-full border border-brand-navy/10 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-navy/60 hover:border-brand-navy/20"
            >
              {selectedNotifications.size === notifications.length ? "Clear selection" : "Select all"}
            </button>
            <span>{filteredNotifications.length} notifications</span>
          </div>
          {unreadCount > 0 && (
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/20 bg-brand-magenta/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-magenta-dark">
              🔴 {unreadCount} unread
            </span>
          )}
        </div>

        <div className="grid gap-3">
          {filteredNotifications.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-brand-navy/15 bg-white/70 p-10 text-center text-sm text-brand-navy/60">
              <div className="text-4xl">📭</div>
              <p className="mt-3 font-semibold">You're all caught up!</p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em]">No notifications for this filter</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const isSelected = selectedNotifications.has(notification.id)
              return (
                <article
                  key={notification.id}
                  className={`flex flex-col gap-3 rounded-3xl border border-brand-navy/10 bg-white/90 p-5 shadow-[0_14px_45px_rgba(28,28,46,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(28,28,46,0.12)] ${
                    !notification.is_read ? "ring-1 ring-brand-blue/30" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleSelection(notification.id)}
                        className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold transition-colors ${
                          isSelected
                            ? "border-brand-purple bg-brand-purple text-white"
                            : "border-brand-navy/20 bg-white text-brand-navy/50"
                        }`}
                        aria-label={isSelected ? "Deselect notification" : "Select notification"}
                      >
                        {isSelected ? "✓" : ""}
                      </button>
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-neutral text-lg">
                        {getNotificationIcon(notification.type || "system")}
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-brand-navy">{notification.title || "Notification"}</h2>
                        <p className="text-sm text-brand-navy/70">{notification.message}</p>
                      </div>
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-navy/40">
                      {formatTime(notification.created_at)}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-brand-navy/60">
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full border px-3 py-1 font-semibold ${
                        notification.is_read
                          ? "border-brand-navy/15 bg-brand-neutral/80 text-brand-navy/60"
                          : "border-brand-blue/20 bg-brand-blue/10 text-brand-blue-dark"
                      }`}>
                        {notification.is_read ? "Read" : "Unread"}
                      </span>
                      {notification.action_url && (
                        <a
                          href={notification.action_url}
                          className="inline-flex items-center gap-1 text-brand-blue transition-colors hover:text-brand-blue-dark"
                        >
                          View details →
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="rounded-full border border-brand-blue/20 bg-brand-blue/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-blue-dark hover:border-brand-blue/40"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="rounded-full border border-brand-coral/20 bg-brand-coral/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-coral-dark hover:border-brand-coral/40"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}
