"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { notificationsApi, type Notification } from "@/lib/api-client"

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

  const computeUnreadCount = (items: Notification[]) =>
    items.filter(notification => !notification.is_read && notification.status !== "dismissed").length

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

      const response = await notificationsApi.list(params)
      const notificationsList = Array.isArray(response)
        ? response
        : (response.results || [])

      setNotifications(notificationsList)
      setUnreadCount(computeUnreadCount(notificationsList))
    } catch (error) {
      console.error("Failed to load notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId)
      setNotifications(prev => {
        const next = prev.map(n =>
          n.id === notificationId
            ? { ...n, is_read: true, status: "read", read_at: n.read_at ?? new Date().toISOString() }
            : n
        )
        setUnreadCount(computeUnreadCount(next))
        return next
      })
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications(prev => {
        const next = prev.map(n => ({ ...n, is_read: true, status: "read", read_at: n.read_at ?? new Date().toISOString() }))
        setUnreadCount(computeUnreadCount(next))
        return next
      })
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const dismissNotification = async (notificationId: string) => {
    try {
      await notificationsApi.dismiss(notificationId)
      setNotifications(prev => {
        const next = prev.filter(n => n.id !== notificationId)
        setUnreadCount(computeUnreadCount(next))
        return next
      })
      setSelectedNotifications(prev => {
        const newSet = new Set(prev)
        newSet.delete(notificationId)
        return newSet
      })
    } catch (error) {
      console.error("Failed to dismiss notification:", error)
    }
  }

  const bulkDismiss = async () => {
    if (selectedNotifications.size === 0) return

    try {
      await Promise.all(Array.from(selectedNotifications).map(id => notificationsApi.dismiss(id)))
      setNotifications(prev => {
        const next = prev.filter(n => !selectedNotifications.has(n.id))
        setUnreadCount(computeUnreadCount(next))
        return next
      })
      setSelectedNotifications(new Set())
    } catch (error) {
      console.error("Failed to dismiss notifications:", error)
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <header className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-brand-navy/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-blue transition-colors hover:text-brand-blue-dark group min-h-[44px]"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to dashboard
            </button>
            <h1 className="mt-2 sm:mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-navy">Inbox center</h1>
            <p className="mt-1 text-xs sm:text-sm font-medium text-brand-navy/70">
              Manage invites, system alerts, and watch party updates from a single organized feed.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-brand-purple/20 bg-brand-purple/10 px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-brand-purple hover:bg-brand-purple/20 transition-colors min-h-[40px] sm:min-h-[44px]"
              >
                ✅ Mark all read
              </button>
            )}
            {selectedNotifications.size > 0 && (
              <button
                onClick={bulkDismiss}
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-brand-coral/20 bg-brand-coral/10 px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-brand-coral-dark hover:bg-brand-coral/20 transition-colors min-h-[40px] sm:min-h-[44px]"
              >
                🗑️ Dismiss ({selectedNotifications.size})
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 sm:mt-6 lg:mt-8 flex flex-wrap gap-2 sm:gap-3 relative z-10">
          {filters.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl border px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all duration-300 min-h-[40px] sm:min-h-[44px] ${
                filter === item.id
                  ? "border-brand-purple/30 bg-brand-purple/10 text-brand-purple shadow-lg shadow-brand-purple/5"
                  : "border-brand-navy/10 bg-white/40 text-brand-navy/60 hover:border-brand-navy/20 hover:text-brand-navy hover:bg-white/60"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <section className="space-y-4 sm:space-y-6">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 text-xs sm:text-sm text-brand-navy/60 px-2">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={selectAll}
              className="rounded-full border border-brand-navy/10 bg-white/40 px-3 sm:px-4 py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-brand-navy/60 hover:border-brand-navy/20 hover:bg-white/60 transition-all min-h-[32px] sm:min-h-[36px]"
            >
              {selectedNotifications.size === notifications.length ? "Clear" : "Select all"}
            </button>
            <span className="font-medium text-xs sm:text-sm">{filteredNotifications.length} notifications</span>
          </div>
          {unreadCount > 0 && (
            <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-brand-magenta/20 bg-brand-magenta/10 px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-brand-magenta-dark">
              <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-magenta opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-brand-magenta"></span>
              </span>
              {unreadCount} unread
            </span>
          )}
        </div>

        <div className="grid gap-3 sm:gap-4">
          {filteredNotifications.length === 0 ? (
            <div className="rounded-2xl sm:rounded-3xl border-2 border-dashed border-brand-navy/10 bg-white/20 p-8 sm:p-12 text-center text-brand-navy/60">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 opacity-50">📭</div>
              <p className="font-bold text-base sm:text-lg">You're all caught up!</p>
              <p className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] opacity-70">No notifications for this filter</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const isSelected = selectedNotifications.has(notification.id)
              return (
                <article
                  key={notification.id}
                  className={`glass-card flex flex-col gap-3 sm:gap-4 rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                    !notification.is_read ? "border-brand-blue/30 bg-brand-blue/5" : ""
                  } ${isSelected ? "border-brand-purple/30 bg-brand-purple/5" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-2 sm:gap-3 lg:gap-4">
                      <button
                        onClick={() => toggleSelection(notification.id)}
                        className={`mt-0.5 sm:mt-1 flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full border transition-all min-w-[20px] sm:min-w-[24px] ${
                          isSelected
                            ? "border-brand-purple bg-brand-purple text-white shadow-md scale-110"
                            : "border-brand-navy/20 bg-white/40 text-transparent hover:border-brand-purple/50"
                        }`}
                        aria-label={isSelected ? "Deselect notification" : "Select notification"}
                      >
                        ✓
                      </button>
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 text-lg sm:text-xl shadow-inner">
                        {getNotificationIcon(notification.template_type || notification.type || "system")}
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base sm:text-lg font-bold text-brand-navy">{notification.title || "Notification"}</h2>
                        <p className="text-xs sm:text-sm font-medium text-brand-navy/70 mt-1 leading-relaxed line-clamp-2">{notification.content ?? notification.message}</p>
                      </div>
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-brand-navy/40 whitespace-nowrap shrink-0">
                      {formatTime(notification.created_at)}
                    </div>
                  </div>

                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 sm:gap-3 pl-8 sm:pl-14">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className={`rounded-full border px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide ${
                        notification.is_read
                          ? "border-brand-navy/10 bg-brand-navy/5 text-brand-navy/50"
                          : "border-brand-blue/20 bg-brand-blue/10 text-brand-blue-dark"
                      }`}>
                        {notification.is_read ? "Read" : "Unread"}
                      </span>
                      {notification.action_url && (
                        <a
                          href={notification.action_url}
                          className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-blue transition-colors hover:text-brand-blue-dark hover:underline min-h-[32px] sm:min-h-[36px]"
                        >
                          View details →
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-brand-blue-dark hover:border-brand-blue/40 hover:bg-brand-blue/20 transition-all min-h-[28px] sm:min-h-[32px]"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => dismissNotification(notification.id)}
                        className="rounded-full border border-brand-coral/20 bg-brand-coral/10 px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-brand-coral-dark hover:border-brand-coral/40 hover:bg-brand-coral/20 transition-all min-h-[28px] sm:min-h-[32px]"
                      >
                        Dismiss
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
