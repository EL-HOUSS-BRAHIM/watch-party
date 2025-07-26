"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Settings,
  Users,
  Video,
  MessageCircle,
  Calendar,
  Crown,
  AlertTriangle,
  Info,
  X,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useSocket } from "@/contexts/socket-context"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  type: "friend_request" | "party_invite" | "party_started" | "message" | "system" | "achievement"
  title: string
  message: string
  timestamp: string
  isRead: boolean
  actionUrl?: string
  actionData?: any
  priority: "low" | "medium" | "high"
  category: "social" | "party" | "system" | "achievement"
  sender?: {
    id: string
    username: string
    avatar?: string
  }
}

interface NotificationPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  friendRequests: boolean
  partyInvites: boolean
  partyUpdates: boolean
  messages: boolean
  systemUpdates: boolean
  achievements: boolean
  soundEnabled: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

interface NotificationCenterProps {
  className?: string
}

export default function NotificationCenter({ className }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    friendRequests: true,
    partyInvites: true,
    partyUpdates: true,
    messages: true,
    systemUpdates: true,
    achievements: true,
    soundEnabled: true,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeTab, setActiveTab] = useState("all")
  const [showSettings, setShowSettings] = useState(false)

  const { user } = useAuth()
  const { onMessage, sendMessage } = useSocket()

  // Load notifications on mount
  useEffect(() => {
    loadNotifications()
    loadPreferences()
  }, [])

  // Listen for real-time notifications
  useEffect(() => {
    const unsubscribe = onMessage((message) => {
      if (message.type === "notification") {
        handleNewNotification(message.data)
      }
    })

    return unsubscribe
  }, [onMessage])

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/notifications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.results || data)
        setUnreadCount(data.unread_count || data.filter((n: Notification) => !n.isRead).length)
      }
    } catch (error) {
      console.error("Failed to load notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPreferences = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/notifications/preferences/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPreferences(data)
      }
    } catch (error) {
      console.error("Failed to load notification preferences:", error)
    }
  }

  const handleNewNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev])
    setUnreadCount((prev) => prev + 1)

    // Show browser notification if enabled
    if (preferences.pushNotifications && "Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: notification.id,
      })
    }

    // Play sound if enabled
    if (preferences.soundEnabled) {
      const audio = new Audio("/notification-sound.mp3")
      audio.play().catch(() => {
        // Ignore audio play errors
      })
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      await fetch(`/api/notifications/${notificationId}/read/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      await fetch("/api/notifications/mark-all-read/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      await fetch(`/api/notifications/${notificationId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const token = localStorage.getItem("accessToken")
      const updatedPreferences = { ...preferences, ...newPreferences }

      await fetch("/api/notifications/preferences/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedPreferences),
      })

      setPreferences(updatedPreferences)
    } catch (error) {
      console.error("Failed to update notification preferences:", error)
    }
  }

  const handleNotificationAction = async (notification: Notification, action: "accept" | "decline") => {
    try {
      const token = localStorage.getItem("accessToken")

      if (notification.type === "friend_request") {
        await fetch(`/api/users/friend-requests/${notification.actionData.requestId}/${action}/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } else if (notification.type === "party_invite") {
        if (action === "accept") {
          await fetch(`/api/parties/${notification.actionData.partyId}/join/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        }
      }

      // Mark notification as read and remove it
      await markAsRead(notification.id)
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
    } catch (error) {
      console.error("Failed to handle notification action:", error)
    }
  }

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = cn(
      "h-5 w-5",
      priority === "high" ? "text-red-500" : priority === "medium" ? "text-yellow-500" : "text-blue-500",
    )

    switch (type) {
      case "friend_request":
        return <Users className={iconClass} />
      case "party_invite":
        return <Video className={iconClass} />
      case "party_started":
        return <Calendar className={iconClass} />
      case "message":
        return <MessageCircle className={iconClass} />
      case "achievement":
        return <Crown className={iconClass} />
      case "system":
        return priority === "high" ? <AlertTriangle className={iconClass} /> : <Info className={iconClass} />
      default:
        return <Bell className={iconClass} />
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.isRead
    return notification.category === activeTab
  })

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <Card className={cn("mb-3 transition-all hover:shadow-md", !notification.isRead && "border-blue-200 bg-blue-50")}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type, notification.priority)}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={cn("font-medium text-sm", !notification.isRead && "font-semibold")}>
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>

                {notification.sender && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      {notification.sender.avatar ? (
                        <img
                          src={notification.sender.avatar || "/placeholder.svg"}
                          alt={notification.sender.username}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <span className="text-xs font-medium">
                          {notification.sender.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{notification.sender.username}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                  </span>
                  {!notification.isRead && (
                    <Badge variant="secondary" className="text-xs">
                      New
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 ml-2">
                {!notification.isRead && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)} className="h-8 w-8 p-0">
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteNotification(notification.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action buttons for interactive notifications */}
            {(notification.type === "friend_request" || notification.type === "party_invite") &&
              !notification.isRead && (
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => handleNotificationAction(notification, "accept")} className="h-8">
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleNotificationAction(notification, "decline")}
                    className="h-8"
                  >
                    Decline
                  </Button>
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (showSettings) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Notification Settings</h2>
            <p className="text-gray-600">Manage your notification preferences</p>
          </div>
          <Button variant="outline" onClick={() => setShowSettings(false)}>
            <Bell className="mr-2 h-4 w-4" />
            Back to Notifications
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Methods</CardTitle>
            <CardDescription>Choose how you want to receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <Switch
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => updatePreferences({ emailNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-gray-500">Receive browser push notifications</p>
              </div>
              <Switch
                checked={preferences.pushNotifications}
                onCheckedChange={(checked) => updatePreferences({ pushNotifications: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sound Notifications</Label>
                <p className="text-sm text-gray-500">Play sound when receiving notifications</p>
              </div>
              <Switch
                checked={preferences.soundEnabled}
                onCheckedChange={(checked) => updatePreferences({ soundEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Types</CardTitle>
            <CardDescription>Choose which types of notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Friend Requests</Label>
                <p className="text-sm text-gray-500">When someone sends you a friend request</p>
              </div>
              <Switch
                checked={preferences.friendRequests}
                onCheckedChange={(checked) => updatePreferences({ friendRequests: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Party Invites</Label>
                <p className="text-sm text-gray-500">When someone invites you to a watch party</p>
              </div>
              <Switch
                checked={preferences.partyInvites}
                onCheckedChange={(checked) => updatePreferences({ partyInvites: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Party Updates</Label>
                <p className="text-sm text-gray-500">When parties you're in start or have updates</p>
              </div>
              <Switch
                checked={preferences.partyUpdates}
                onCheckedChange={(checked) => updatePreferences({ partyUpdates: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Messages</Label>
                <p className="text-sm text-gray-500">When you receive direct messages</p>
              </div>
              <Switch
                checked={preferences.messages}
                onCheckedChange={(checked) => updatePreferences({ messages: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>System Updates</Label>
                <p className="text-sm text-gray-500">Important system announcements and updates</p>
              </div>
              <Switch
                checked={preferences.systemUpdates}
                onCheckedChange={(checked) => updatePreferences({ systemUpdates: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Achievements</Label>
                <p className="text-sm text-gray-500">When you unlock achievements or milestones</p>
              </div>
              <Switch
                checked={preferences.achievements}
                onCheckedChange={(checked) => updatePreferences({ achievements: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quiet Hours</CardTitle>
            <CardDescription>Set times when you don't want to receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Quiet Hours</Label>
                <p className="text-sm text-gray-500">Disable notifications during specified hours</p>
              </div>
              <Switch
                checked={preferences.quietHours.enabled}
                onCheckedChange={(checked) =>
                  updatePreferences({
                    quietHours: { ...preferences.quietHours, enabled: checked },
                  })
                }
              />
            </div>

            {preferences.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <input
                    type="time"
                    value={preferences.quietHours.start}
                    onChange={(e) =>
                      updatePreferences({
                        quietHours: { ...preferences.quietHours, start: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <input
                    type="time"
                    value={preferences.quietHours.end}
                    onChange={(e) =>
                      updatePreferences({
                        quietHours: { ...preferences.quietHours, end: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-gray-600">Stay updated with your latest activities</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowSettings(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread {unreadCount > 0 && `(${unreadCount})`}</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="party">Parties</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="achievement">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p className="text-gray-600">
                {activeTab === "unread"
                  ? "You're all caught up! No unread notifications."
                  : "You don't have any notifications yet."}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { NotificationCenter }
