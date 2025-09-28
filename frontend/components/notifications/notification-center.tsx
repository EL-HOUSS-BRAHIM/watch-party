import { useState, useEffect , useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {}
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { notificationsAPI } from "@/lib/api"
import type { Notification, NotificationPreferences } from "@/lib/api/types"

} from "lucide-react"
"use client"

  Bell,
  BellOff,
  Check,
  CheckCheck,
  X,
interface NotificationCenterProps {}
  className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {}
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences>({}
    email_notifications: true,
    push_notifications: true,
    friend_requests: true,
    party_invites: true,
    video_uploads: true,
    system_updates: true,
    marketing: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  // Load notifications;
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;
      try {
        setIsLoading(true)
        const data = await notificationsAPI.getNotifications()
        setNotifications(data.results || [])
      } } catch {
        console.error("Failed to load notifications:", error)
      } finally {}
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [user])

  // Load preferences;
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      try {
        const data = await notificationsAPI.getPreferences()
        setPreferences(data)
      } } catch {
        console.error("Failed to load preferences:", error)
      }
    }

    loadPreferences()
  }, [user])

  // Mark notification as read;
  const markAsRead = async (notificationId: string) => {}
    try {
      await notificationsAPI.markAsRead(notificationId)
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n;
      ))
    } } catch {
      console.error("Failed to mark notification as read:", error)
    }
  }

  // Mark all notifications as read;
  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } } catch {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  // Delete notification;
  const deleteNotification = async (notificationId: string) => {}
    try {
      await notificationsAPI.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } } catch {
      console.error("Failed to delete notification:", error)
    }
  }

  // Update preferences;
  const updatePreferences = async (updatedPreferences: Partial<NotificationPreferences>) => {}
    try {
      const newPreferences = { ...preferences, ...updatedPreferences }
      await notificationsAPI.updatePreferences(newPreferences)
      setPreferences(newPreferences)
    } } catch {
      console.error("Failed to update preferences:", error)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;
  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button;
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark all read;
              </Button>
            )}
          </div>
          <CardDescription>Manage your notifications and preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <BellOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No notifications found</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                {notifications.map((notification) => (
                  <Card key={notification.id} className={cn(
                    "mb-3 transition-all hover:shadow-md", 
                    !notification.is_read && "border-blue-200 bg-blue-50" />
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <Bell className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={cn(}
                              "font-medium text-sm", 
                              !notification.is_read && "font-semibold"
                            )}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1">
                              {!notification.is_read && (
                                <Button;
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                              <Button;
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Notification Preferences</CardTitle>
          <CardDescription>
            Customize when and how you receive notifications;
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch;
              id="email-notifications"
              checked={preferences.email_notifications}
              onCheckedChange={(checked) => updatePreferences({ email_notifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <Switch;
              id="push-notifications"
              checked={preferences.push_notifications}
              onCheckedChange={(checked) => updatePreferences({ push_notifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="friend-requests">Friend Requests</Label>
            <Switch;
              id="friend-requests"
              checked={preferences.friend_requests}
              onCheckedChange={(checked) => updatePreferences({ friend_requests: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="party-invites">Party Invitations</Label>
            <Switch;
              id="party-invites"
              checked={preferences.party_invites}
              onCheckedChange={(checked) => updatePreferences({ party_invites: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="system-updates">System Updates</Label>
            <Switch;
              id="system-updates"
              checked={preferences.system_updates}
              onCheckedChange={(checked) => updatePreferences({ system_updates: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="video-uploads">Video Upload Notifications</Label>
            <Switch;
              id="video-uploads"
              checked={preferences.video_uploads}
              onCheckedChange={(checked) => updatePreferences({ video_uploads: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="marketing">Marketing Communications</Label>
            <Switch;
              id="marketing"
              checked={preferences.marketing}
              onCheckedChange={(checked) => updatePreferences({ marketing: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotificationCenter;