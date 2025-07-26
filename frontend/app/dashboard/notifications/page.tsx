"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  X,
  Filter,
  Settings,
  UserPlus,
  Video,
  Calendar,
  MessageCircle,
  Heart,
  Star,
  Crown,
  Gift,
  AlertTriangle,
  Info,
  Trash2,
  MoreHorizontal,
  Eye,
  EyeOff,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  id: string
  type: "friend_request" | "friend_accepted" | "party_invite" | "party_started" | "video_like" | "video_comment" | "system" | "achievement"
  title: string
  message: string
  isRead: boolean
  createdAt: string
  data?: {
    userId?: string
    userName?: string
    userAvatar?: string
    partyId?: string
    partyName?: string
    videoId?: string
    videoTitle?: string
    requestId?: string
    achievementId?: string
    url?: string
  }
  priority: "low" | "normal" | "high" | "urgent"
  category: "social" | "content" | "system" | "achievement"
  requiresAction?: boolean
}

interface NotificationSettings {
  friendRequests: boolean
  friendAccepted: boolean
  partyInvites: boolean
  partyStarted: boolean
  videoLikes: boolean
  videoComments: boolean
  systemUpdates: boolean
  achievements: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

export default function NotificationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("all")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [filterType, setFilterType] = useState("all")
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const [settings, setSettings] = useState<NotificationSettings>({
    friendRequests: true,
    friendAccepted: true,
    partyInvites: true,
    partyStarted: true,
    videoLikes: true,
    videoComments: true,
    systemUpdates: true,
    achievements: true,
    emailNotifications: true,
    pushNotifications: true,
    quietHours: {
      enabled: false,
      start: "22:00",
      end: "08:00",
    },
  })

  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0,
    thisWeek: 0,
  })

  useEffect(() => {
    loadNotifications()
    loadNotificationSettings()
  }, [filterType, showUnreadOnly])

  const loadNotifications = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const params = new URLSearchParams()
      
      if (filterType !== "all") {
        params.append("category", filterType)
      }
      if (showUnreadOnly) {
        params.append("unread_only", "true")
      }

      const response = await fetch(`/api/users/notifications/?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.results || data.notifications || [])
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error("Failed to load notifications:", error)
      toast({
        title: "Error",
        description: "Failed to load notifications. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadNotificationSettings = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/notifications/settings/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSettings({ ...settings, ...data })
      }
    } catch (error) {
      console.error("Failed to load notification settings:", error)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/notifications/${notificationId}/read/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ))
        setStats(prev => ({ ...prev, unread: prev.unread - 1 }))
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/notifications/mark-all-read/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setStats(prev => ({ ...prev, unread: 0 }))
        toast({
          title: "Success",
          description: "All notifications marked as read.",
        })
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      })
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/notifications/${notificationId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        setStats(prev => ({ 
          ...prev, 
          total: prev.total - 1,
          unread: prev.unread - (notifications.find(n => n.id === notificationId)?.isRead ? 0 : 1)
        }))
        toast({
          title: "Deleted",
          description: "Notification deleted successfully.",
        })
      }
    } catch (error) {
      console.error("Failed to delete notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification.",
        variant: "destructive",
      })
    }
  }

  const deleteSelected = async () => {
    if (selectedNotifications.length === 0) return

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/notifications/bulk-delete/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notification_ids: selectedNotifications }),
      })

      if (response.ok) {
        setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)))
        const unreadCount = selectedNotifications.filter(id => 
          !notifications.find(n => n.id === id)?.isRead
        ).length
        setStats(prev => ({ 
          ...prev, 
          total: prev.total - selectedNotifications.length,
          unread: prev.unread - unreadCount
        }))
        setSelectedNotifications([])
        toast({
          title: "Deleted",
          description: `${selectedNotifications.length} notifications deleted.`,
        })
      }
    } catch (error) {
      console.error("Failed to delete selected notifications:", error)
      toast({
        title: "Error",
        description: "Failed to delete selected notifications.",
        variant: "destructive",
      })
    }
  }

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/notifications/settings/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSettings),
      })

      if (response.ok) {
        setSettings(prev => ({ ...prev, ...newSettings }))
        toast({
          title: "Settings Updated",
          description: "Your notification settings have been saved.",
        })
      }
    } catch (error) {
      console.error("Failed to update settings:", error)
      toast({
        title: "Error",
        description: "Failed to update notification settings.",
        variant: "destructive",
      })
    }
  }

  const handleNotificationAction = async (notification: Notification, action: "accept" | "decline" | "view") => {
    try {
      const token = localStorage.getItem("accessToken")

      if (notification.type === "friend_request") {
        const endpoint = action === "accept" 
          ? `/api/users/friends/${notification.data?.requestId}/accept/`
          : `/api/users/friends/${notification.data?.requestId}/decline/`

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          markAsRead(notification.id)
          toast({
            title: "Success",
            description: `Friend request ${action}ed.`,
          })
        }
      } else if (notification.type === "party_invite" && action === "view") {
        router.push(`/watch/${notification.data?.partyId}`)
      } else if (notification.data?.url) {
        router.push(notification.data.url)
      }
    } catch (error) {
      console.error("Failed to handle notification action:", error)
      toast({
        title: "Error",
        description: "Failed to process action.",
        variant: "destructive",
      })
    }
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "friend_request":
        return <UserPlus className="w-5 h-5 text-blue-500" />
      case "friend_accepted":
        return <UserPlus className="w-5 h-5 text-green-500" />
      case "party_invite":
      case "party_started":
        return <Calendar className="w-5 h-5 text-purple-500" />
      case "video_like":
        return <Heart className="w-5 h-5 text-red-500" />
      case "video_comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case "achievement":
        return <Star className="w-5 h-5 text-yellow-500" />
      case "system":
        return <Info className="w-5 h-5 text-gray-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getPriorityBadge = (priority: Notification["priority"]) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive" className="text-xs">Urgent</Badge>
      case "high":
        return <Badge variant="default" className="text-xs">High</Badge>
      case "normal":
        return <Badge variant="outline" className="text-xs">Normal</Badge>
      case "low":
        return <Badge variant="secondary" className="text-xs">Low</Badge>
      default:
        return null
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "unread" && notification.isRead) return false
    if (activeTab === "actions" && !notification.requiresAction) return false
    return true
  })

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
          <p className="text-gray-600 mt-2">Stay updated with your watch party activities</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          {stats.unread > 0 && (
            <Button onClick={markAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
            <div className="text-sm text-gray-600">Unread</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.today}</div>
            <div className="text-sm text-gray-600">Today</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.thisWeek}</div>
            <div className="text-sm text-gray-600">This Week</div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Customize how and when you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-4">Notification Types</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="friend-requests">Friend Requests</Label>
                    <Switch
                      id="friend-requests"
                      checked={settings.friendRequests}
                      onCheckedChange={(checked) => updateSettings({ friendRequests: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="friend-accepted">Friend Accepted</Label>
                    <Switch
                      id="friend-accepted"
                      checked={settings.friendAccepted}
                      onCheckedChange={(checked) => updateSettings({ friendAccepted: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="party-invites">Party Invites</Label>
                    <Switch
                      id="party-invites"
                      checked={settings.partyInvites}
                      onCheckedChange={(checked) => updateSettings({ partyInvites: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="party-started">Party Started</Label>
                    <Switch
                      id="party-started"
                      checked={settings.partyStarted}
                      onCheckedChange={(checked) => updateSettings({ partyStarted: checked })}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="video-likes">Video Likes</Label>
                    <Switch
                      id="video-likes"
                      checked={settings.videoLikes}
                      onCheckedChange={(checked) => updateSettings({ videoLikes: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="video-comments">Video Comments</Label>
                    <Switch
                      id="video-comments"
                      checked={settings.videoComments}
                      onCheckedChange={(checked) => updateSettings({ videoComments: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="system-updates">System Updates</Label>
                    <Switch
                      id="system-updates"
                      checked={settings.systemUpdates}
                      onCheckedChange={(checked) => updateSettings({ systemUpdates: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="achievements">Achievements</Label>
                    <Switch
                      id="achievements"
                      checked={settings.achievements}
                      onCheckedChange={(checked) => updateSettings({ achievements: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-4">Delivery Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch
                    id="email-notifications"
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <Switch
                    id="push-notifications"
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSettings({ pushNotifications: checked })}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-4">Quiet Hours</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="quiet-hours">Enable Quiet Hours</Label>
                  <Switch
                    id="quiet-hours"
                    checked={settings.quietHours.enabled}
                    onCheckedChange={(checked) => 
                      updateSettings({ 
                        quietHours: { ...settings.quietHours, enabled: checked }
                      })
                    }
                  />
                </div>
                {settings.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quiet-start">Start Time</Label>
                      <input
                        id="quiet-start"
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) => 
                          updateSettings({
                            quietHours: { ...settings.quietHours, start: e.target.value }
                          })
                        }
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <Label htmlFor="quiet-end">End Time</Label>
                      <input
                        id="quiet-end"
                        type="time"
                        value={settings.quietHours.end}
                        onChange={(e) => 
                          updateSettings({
                            quietHours: { ...settings.quietHours, end: e.target.value }
                          })
                        }
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="content">Content</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="achievement">Achievements</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Switch
              id="unread-only"
              checked={showUnreadOnly}
              onCheckedChange={setShowUnreadOnly}
            />
            <Label htmlFor="unread-only" className="text-sm">Unread only</Label>
          </div>
        </div>

        {selectedNotifications.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedNotifications.length} selected
            </span>
            <Button variant="outline" size="sm" onClick={deleteSelected}>
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedNotifications([])}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Notification Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({stats.unread})</TabsTrigger>
          <TabsTrigger value="actions">
            Requires Action ({notifications.filter(n => n.requiresAction && !n.isRead).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`p-4 cursor-pointer transition-colors ${
                    !notification.isRead ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    <Checkbox
                      checked={selectedNotifications.includes(notification.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedNotifications(prev => [...prev, notification.id])
                        } else {
                          setSelectedNotifications(prev => prev.filter(id => id !== notification.id))
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Avatar (if applicable) */}
                    {notification.data?.userAvatar && (
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={notification.data.userAvatar || "/placeholder-user.jpg"} />
                        <AvatarFallback className="text-sm">
                          {notification.data.userName?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${!notification.isRead ? "font-semibold" : ""}`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                          {getPriorityBadge(notification.priority)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{notification.message}</p>

                      {/* Actions */}
                      {notification.requiresAction && !notification.isRead && (
                        <div className="flex items-center gap-2">
                          {notification.type === "friend_request" && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleNotificationAction(notification, "accept")
                                }}
                              >
                                Accept
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleNotificationAction(notification, "decline")
                                }}
                              >
                                Decline
                              </Button>
                            </>
                          )}
                          {(notification.type === "party_invite" || notification.data?.url) && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleNotificationAction(notification, "view")
                              }}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BellOff className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
                <p className="text-gray-600">You're all caught up! No notifications to show.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {filteredNotifications.filter(n => !n.isRead).length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.filter(n => !n.isRead).map((notification) => (
                <Card 
                  key={notification.id} 
                  className="p-4 cursor-pointer bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors"
                  onClick={() => markAsRead(notification.id)}
                >
                  {/* Same notification content as above */}
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedNotifications.includes(notification.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedNotifications(prev => [...prev, notification.id])
                        } else {
                          setSelectedNotifications(prev => prev.filter(id => id !== notification.id))
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    {notification.data?.userAvatar && (
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={notification.data.userAvatar || "/placeholder-user.jpg"} />
                        <AvatarFallback className="text-sm">
                          {notification.data.userName?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{notification.title}</h3>
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {getPriorityBadge(notification.priority)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{notification.message}</p>
                      {notification.requiresAction && (
                        <div className="flex items-center gap-2">
                          {notification.type === "friend_request" && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleNotificationAction(notification, "accept")
                                }}
                              >
                                Accept
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleNotificationAction(notification, "decline")
                                }}
                              >
                                Decline
                              </Button>
                            </>
                          )}
                          {(notification.type === "party_invite" || notification.data?.url) && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleNotificationAction(notification, "view")
                              }}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCheck className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                <p className="text-gray-600">You have no unread notifications.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          {filteredNotifications.filter(n => n.requiresAction && !n.isRead).length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.filter(n => n.requiresAction && !n.isRead).map((notification) => (
                <Card 
                  key={notification.id} 
                  className="p-4 border-orange-200 bg-orange-50"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                    </div>
                    {notification.data?.userAvatar && (
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={notification.data.userAvatar || "/placeholder-user.jpg"} />
                        <AvatarFallback className="text-sm">
                          {notification.data.userName?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{notification.title}</h3>
                          {getPriorityBadge(notification.priority)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{notification.message}</p>
                      <div className="flex items-center gap-2">
                        {notification.type === "friend_request" && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleNotificationAction(notification, "accept")}
                            >
                              Accept
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleNotificationAction(notification, "decline")}
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        {(notification.type === "party_invite" || notification.data?.url) && (
                          <Button 
                            size="sm"
                            onClick={() => handleNotificationAction(notification, "view")}
                          >
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Check className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">No Actions Required</h3>
                <p className="text-gray-600">All notifications have been handled.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
