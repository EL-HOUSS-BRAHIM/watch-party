"use client"

import { Bell, Calendar, Check, CheckCircle, Heart, Info, Mail, Play, Settings, Smartphone, Star, Trash, User, Users, X } from "lucide-react"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useApiToast } from "@/hooks/use-toast"

interface Notification {}
  id: string
  type: 'friend_request' | 'party_invite' | 'party_start' | 'message' | 'reaction' | 'follow' | 'achievement' | 'system' | 'reminder'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  data?: {}
    userId?: string
    partyId?: string
    messageId?: string
    achievementId?: string
    [key: string]: unknown
  }
  sender?: {}
    id: string
    displayName: string
    avatar: string | null
  }
  actionUrl?: string
  canReply?: boolean
  canDismiss?: boolean
}

interface NotificationSettings {}
  enabled: boolean
  categories: {}
    friend_requests: boolean
    party_invites: boolean
    party_updates: boolean
    messages: boolean
    reactions: boolean
    achievements: boolean
    system: boolean
    reminders: boolean
  }
  delivery: {}
    push: boolean
    email: boolean
    inApp: boolean
  }
  schedule: {}
    quietHours: {}
      enabled: boolean
      start: string
      end: string
    }
    weekends: boolean
  }
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
}

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const { apiRequest, toastSuccess, toastError } = useApiToast()

  useEffect(() => {
    loadNotifications()
    loadSettings()
  }, [])

  const loadNotifications = async () => {
    try {
      const response = await apiRequest(() => fetch(&apos;/api/notifications&apos;))
      if (response) {
        setNotifications(response)
      }
    } catch (err) {
      toastError(error, 'Failed to load notifications')
    }
  }

  const loadSettings = async () => {
    try {
      const response = await apiRequest(() => fetch(&apos;/api/notifications/settings'))
      if (response) {
        setSettings(response)
      }
    } catch (err) {
      toastError(error, 'Failed to load notification settings')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {}
    const success = await apiRequest(
      () => fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' }),
      { showSuccess: false }
    )

    if (success) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
    }
  }

  const handleMarkAllAsRead = async () => {
    const success = await apiRequest(
      () => fetch('/api/notifications/read-all', { method: 'POST' }),
      { successMessage: 'All notifications marked as read', showSuccess: true }
    )

    if (success) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    }
  }

  const handleDelete = async (notificationId: string) => {}
    const success = await apiRequest(
      () => fetch(`/api/notifications/${notificationId}`, { method: 'DELETE' }),
      { successMessage: 'Notification deleted', showSuccess: true }
    )

    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    }
  }

  const handleDeleteAll = async () => {
    const success = await apiRequest(
      () => fetch('/api/notifications', { method: 'DELETE' }),
      { successMessage: 'All notifications deleted', showSuccess: true }
    )

    if (success) {
      setNotifications([])
    }
  }

  const handleUpdateSettings = async (updatedSettings: NotificationSettings) => {}
    const success = await apiRequest(
      () => fetch('/api/notifications/settings', {}
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      }),
      { successMessage: 'Settings updated', showSuccess: true }
    )

    if (success) {
      setSettings(updatedSettings)
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {}
    switch (type) {
      case 'friend_request': return <UserPlus className="h-4 w-4" />
      case 'party_invite': return <Users className="h-4 w-4" />
      case 'party_start': return <Play className="h-4 w-4" />
      case 'message': return <MessageSquare className="h-4 w-4" />
      case 'reaction': return <Heart className="h-4 w-4" />
      case 'follow': return <UserPlus className="h-4 w-4" />
      case 'achievement': return <Star className="h-4 w-4" />
      case 'system': return <Info className="h-4 w-4" />
      case 'reminder': return <Calendar className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {}
    switch (type) {
      case 'friend_request': return 'text-blue-500'
      case 'party_invite': return 'text-purple-500'
      case 'party_start': return 'text-green-500'
      case 'message': return 'text-blue-500'
      case 'reaction': return 'text-red-500'
      case 'follow': return 'text-green-500'
      case 'achievement': return 'text-yellow-500'
      case 'system': return 'text-gray-500'
      case 'reminder': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  const filteredNotifications = notifications.filter(notification => {}
    switch (activeTab) {
      case 'unread': return !notification.isRead
      case 'social': return ['friend_request', 'follow', 'party_invite'].includes(notification.type)
      case 'parties': return ['party_invite', 'party_start', 'party_update'].includes(notification.type)
      case 'messages': return ['message', 'reaction'].includes(notification.type)
      default: return true
    }
  })

  const unreadCount = notifications.filter(n => !n.isRead).length
  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDeleteAll}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete All
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="social">
            Social
          </TabsTrigger>
          <TabsTrigger value="parties">
            Parties
          </TabsTrigger>
          <TabsTrigger value="messages">
            Messages
          </TabsTrigger>
          <TabsTrigger value="settings">
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="parties" className="space-y-4">
          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {settings && (
            <NotificationSettings
              settings={settings}
              onUpdate={handleUpdateSettings}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NotificationList({notifications,
  onMarkAsRead,
  onDelete
}: {}
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void
}) {}
  const getNotificationIcon = (type: Notification['type']) => {}
    switch (type) {
      case 'friend_request': return <UserPlus className="h-4 w-4" />
      case 'party_invite': return <Users className="h-4 w-4" />
      case 'party_start': return <Play className="h-4 w-4" />
      case 'message': return <MessageSquare className="h-4 w-4" />
      case 'reaction': return <Heart className="h-4 w-4" />
      case 'follow': return <UserPlus className="h-4 w-4" />
      case 'achievement': return <Star className="h-4 w-4" />
      case 'system': return <Info className="h-4 w-4" />
      case 'reminder': return <Calendar className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {}
    switch (type) {
      case 'friend_request': return 'text-blue-500'
      case 'party_invite': return 'text-purple-500'
      case 'party_start': return 'text-green-500'
      case 'message': return 'text-blue-500'
      case 'reaction': return 'text-red-500'
      case 'follow': return 'text-green-500'
      case 'achievement': return 'text-yellow-500'
      case 'system': return 'text-gray-500'
      case 'reminder': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No notifications</h3>
          <p className="text-muted-foreground text-center">
            You're all caught up! Check back later for updates.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {notifications.map((notification) => (
        <Card
          key={notification.id} 
          className={`transition-colors ${!notification.isRead ? 'bg-muted/50' : ''}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-full bg-muted ${getNotificationColor(notification.type)}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{notification.title}</h3>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                    {notification.sender && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={notification.sender.avatar || ''} />
                          <AvatarFallback className="text-xs">
                            {notification.sender.displayName.charAt(0) || <User className="h-3 w-3" />}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {notification.sender.displayName}
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMarkAsRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {notification.canDismiss !== false && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {notification.actionUrl && (
                  <Button variant="outline" size="sm" className="mt-3">
                    View Details
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function NotificationSettings({settings,
  onUpdate
}: {}
  settings: NotificationSettings
  onUpdate: (settings: NotificationSettings) => void
}) {}
  const handleToggleCategory = (category: keyof NotificationSettings['categories']) => {}
    onUpdate({...settings,
      categories: {}
        ...settings.categories,
        [category]: !settings.categories[category]
      }
    })
  }

  const handleToggleDelivery = (method: keyof NotificationSettings['delivery']) => {}
    onUpdate({...settings,
      delivery: {}
        ...settings.delivery,
        [method]: !settings.delivery[method]
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Notification Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Enable Notifications</h3>
              <p className="text-sm text-muted-foreground">
                Turn on/off all notifications
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => onUpdate({ ...settings, enabled })}
            />
          </div>

          <Separator />

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Notification Categories</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium">Friend Requests</p>
                    <p className="text-sm text-muted-foreground">New friend requests</p>
                  </div>
                </div>
                <Switch
                  checked={settings.categories.friend_requests}
                  onCheckedChange={() => handleToggleCategory(&apos;friend_requests&apos;)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="font-medium">Party Invites</p>
                    <p className="text-sm text-muted-foreground">Invitations to watch parties</p>
                  </div>
                </div>
                <Switch
                  checked={settings.categories.party_invites}
                  onCheckedChange={() => handleToggleCategory(&apos;party_invites&apos;)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Play className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="font-medium">Party Updates</p>
                    <p className="text-sm text-muted-foreground">When parties start or end</p>
                  </div>
                </div>
                <Switch
                  checked={settings.categories.party_updates}
                  onCheckedChange={() => handleToggleCategory(&apos;party_updates&apos;)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="font-medium">Messages</p>
                    <p className="text-sm text-muted-foreground">Direct messages and mentions</p>
                  </div>
                </div>
                <Switch
                  checked={settings.categories.messages}
                  onCheckedChange={() => handleToggleCategory(&apos;messages&apos;)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="font-medium">Reactions</p>
                    <p className="text-sm text-muted-foreground">Likes and reactions to your content</p>
                  </div>
                </div>
                <Switch
                  checked={settings.categories.reactions}
                  onCheckedChange={() => handleToggleCategory(&apos;reactions&apos;)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div>
                    <p className="font-medium">Achievements</p>
                    <p className="text-sm text-muted-foreground">New badges and milestones</p>
                  </div>
                </div>
                <Switch
                  checked={settings.categories.achievements}
                  onCheckedChange={() => handleToggleCategory(&apos;achievements&apos;)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Delivery Methods */}
          <div>
            <h3 className="font-semibold mb-4">Delivery Methods</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Mobile and desktop notifications</p>
                  </div>
                </div>
                <Switch
                  checked={settings.delivery.push}
                  onCheckedChange={() => handleToggleDelivery(&apos;push&apos;)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Important updates via email</p>
                  </div>
                </div>
                <Switch
                  checked={settings.delivery.email}
                  onCheckedChange={() => handleToggleDelivery(&apos;email&apos;)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <div>
                    <p className="font-medium">In-App Notifications</p>
                    <p className="text-sm text-muted-foreground">Notifications within the app</p>
                  </div>
                </div>
                <Switch
                  checked={settings.delivery.inApp}
                  onCheckedChange={() => handleToggleDelivery(&apos;inApp&apos;)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
