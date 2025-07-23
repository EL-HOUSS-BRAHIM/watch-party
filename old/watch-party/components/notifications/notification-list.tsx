'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Bell, 
  Users, 
  Play, 
  Heart, 
  MessageCircle, 
  Star, 
  Gift,
  AlertCircle
} from 'lucide-react'

interface Notification {
  id: string
  type: 'party_invite' | 'friend_request' | 'video_like' | 'comment' | 'system' | 'payment'
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  avatar?: string
  actionUrl?: string
}

const notificationIcons = {
  party_invite: Users,
  friend_request: Users,
  video_like: Heart,
  comment: MessageCircle,
  system: AlertCircle,
  payment: Gift,
}

const notificationColors = {
  party_invite: 'text-primary',
  friend_request: 'text-success',
  video_like: 'text-pink-500',
  comment: 'text-warning',
  system: 'text-violet',
  payment: 'text-premium',
}

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'party_invite',
      title: 'Party Invitation',
      message: 'John invited you to watch "Champions League Final"',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
      avatar: '/placeholder-user.jpg',
      actionUrl: '/watch/abc123'
    },
    {
      id: '2',
      type: 'friend_request',
      title: 'New Friend Request',
      message: 'Sarah wants to be your friend',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: false,
      avatar: '/placeholder-user.jpg',
    },
    {
      id: '3',
      type: 'video_like',
      title: 'Video Liked',
      message: '5 people liked your "Best Goals 2024" video',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
    },
    {
      id: '4',
      type: 'system',
      title: 'Premium Upgrade',
      message: 'Congratulations! Your account has been upgraded to Premium',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true,
    },
  ])

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    )
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="space-y-4">
      {/* Header with Mark All Read */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-neo-text-secondary" />
          <span className="text-neo-text-secondary">
            {unreadCount} unread notifications
          </span>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {notifications.length === 0 ? (
          <Card className="card">
            <CardContent className="p-6 text-center">
              <Bell className="h-12 w-12 text-neo-text-secondary mx-auto mb-4" />
              <p className="text-neo-text-secondary">No notifications yet</p>
              <p className="text-sm text-neo-text-secondary mt-1">
                We'll let you know when something happens
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map(notification => {
            const Icon = notificationIcons[notification.type]
            const iconColor = notificationColors[notification.type]

            return (
              <Card 
                key={notification.id}
                className={`card cursor-pointer hover:card-elevated transition-all duration-200 ${
                  !notification.isRead ? 'border-primary/30 bg-primary/5' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Icon or Avatar */}
                    <div className="flex-shrink-0">
                      {notification.avatar ? (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={notification.avatar} />
                          <AvatarFallback>
                            <Icon className={`h-5 w-5 ${iconColor}`} />
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-neo-surface flex items-center justify-center">
                          <Icon className={`h-5 w-5 ${iconColor}`} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-neo-text-primary">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-neo-text-secondary mt-1">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!notification.isRead && (
                            <div className="h-2 w-2 bg-primary rounded-full"></div>
                          )}
                          <span className="text-xs text-neo-text-secondary">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Load More Button */}
      {notifications.length > 0 && (
        <div className="text-center pt-4">
          <Button variant="ghost" size="sm">
            Load more notifications
          </Button>
        </div>
      )}
    </div>
  )
}
