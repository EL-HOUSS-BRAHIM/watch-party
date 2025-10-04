"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { notificationsApi, type Notification } from "@/lib/api-client"
import NotificationToast from "./NotificationToast"

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  showToast: (notification: Omit<Notification, "id">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  dismissNotification: (id: string) => void
  refreshNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export default function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [toasts, setToasts] = useState<Array<Notification & { toastId: string }>>([])

  const computeUnreadCount = (items: Notification[]) =>
    items.filter(notification => !notification.is_read && notification.status !== "dismissed").length

  useEffect(() => {
    loadNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    
    // Request notification permissions
    requestNotificationPermission()
    
    return () => clearInterval(interval)
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await notificationsApi.list({ page_size: 50 })
      const notificationsList = Array.isArray(response)
        ? response
        : (response.results || [])

      // Check for new notifications
      const currentIds = new Set(notifications.map(n => n.id))
      const newNotifications = notificationsList.filter((n: Notification) => !currentIds.has(n.id))
      
      // Show toasts for new notifications
      newNotifications.forEach((notification: Notification) => {
        showToast(notification)
      })
      
      setNotifications(notificationsList)
      setUnreadCount(computeUnreadCount(notificationsList))
    } catch (error) {
      console.error("Failed to load notifications:", error)
    }
  }

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission()
    }
  }

  const showToast = (notification: Omit<Notification, "id">) => {
    const toastId = Math.random().toString(36).substr(2, 9)
    const fullNotification = {
      ...notification,
      id: toastId,
      content: notification.content ?? notification.message,
      message: notification.message ?? notification.content ?? "",
      template_type: notification.template_type ?? notification.type ?? "system",
      type: notification.type ?? notification.template_type ?? "system",
    }
    const toastNotification = { ...fullNotification, toastId }
    
    setToasts(prev => [...prev, toastNotification])
    
    // Show browser notification if permission granted
    if ("Notification" in window && window.Notification.permission === "granted") {
      try {
        const browserNotification = new window.Notification(notification.title, {
          body: notification.content ?? notification.message,
          icon: "/favicon.ico",
          tag: toastId
        })
        
        browserNotification.onclick = () => {
          window.focus()
          browserNotification.close()
          
          // Navigate to notification action URL if available
          if (notification.action_url) {
            window.location.href = notification.action_url
          }
        }
      } catch (error) {
        console.error("Failed to show browser notification:", error)
      }
    }
  }

  const removeToast = (toastId: string) => {
    setToasts(prev => prev.filter(toast => toast.toastId !== toastId))
  }

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id)
      setNotifications(prev => {
        const next = prev.map(n =>
          n.id === id
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

  const dismissNotification = async (id: string) => {
    try {
      await notificationsApi.dismiss(id)
      setNotifications(prev => {
        const next = prev.filter(n => n.id !== id)
        setUnreadCount(computeUnreadCount(next))
        return next
      })
    } catch (error) {
      console.error("Failed to dismiss notification:", error)
    }
  }

  const refreshNotifications = () => {
    loadNotifications()
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        showToast,
        markAsRead,
        markAllAsRead,
        dismissNotification,
        refreshNotifications
      }}
    >
      {children}
      
      {/* Toast notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <NotificationToast
            key={toast.toastId}
            notification={toast}
            onClose={() => removeToast(toast.toastId)}
            onAction={() => {
              if (toast.action_url) {
                window.location.href = toast.action_url
              }
              removeToast(toast.toastId)
            }}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  )
}