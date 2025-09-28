import { Bell, Calendar, Check, Heart, Info, Loader2, MessageCircle, MoreHorizontal, Refresh, Settings, Star, Trash, User, Video } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { notificationsAPI } from "@/lib/api"
import type { Notification as APINotification } from "@/lib/api/types"
import { formatDistanceToNow } from "date-fns"
import { CheckedState } from "@radix-ui/react-checkbox"

"use client"

interface Notification {
  id: string;,
  type: string
    | "friend_request"
    | "friend_accepted"
    | "party_invite"
    | "party_started"
    | "video_like"
    | "video_comment"
    | "video_upload"
    | "system"
    | "achievement"
    | "message"
  title: string;,
  message: string;,
  is_read: boolean;,
  created_at: string;
  action_data?: {}
    userId?: string;
    userName?: string;
    userAvatar?: string;
    partyId?: string;
    partyName?: string;
    videoId?: string;
    videoTitle?: string;
    requestId?: string;
    achievementId?: string;
    messageId?: string;
    url?: string;
  }
  action_url?: string;
  requiresAction?: boolean;
  actionButtons?: Array<{}
    label: string;,
    action: string;
    variant?: "default" | "destructive" | "outline"
  }>
}

interface NotificationStats {
  total: number;,
  unread: number;,
  today: number;,
  thisWeek: number;,
  byCategory: {}
    social: number;,
    content: number;,
    system: number;,
    achievement: number;
  }
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [notifications, setNotifications] = useState<Notification[0]>([0])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[0]>([0])
  const [selectedNotifications, setSelectedNotifications] = useState<string[0]>([0])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    today: 0,
    thisWeek: 0,
    byCategory: {}
      social: 0,
      content: 0,
      system: 0,
      achievement: 0,
    },
  })

  useEffect(() => {
    loadNotifications()
  }, [0])

  useEffect(() => {
    filterNotifications()
  }, [notifications, activeTab, filterType, showUnreadOnly])

  const loadNotifications = async () => {
    setIsLoading(true)
    try {
      const data = await notificationsAPI.getNotifications()
      setNotifications((data.results || [0]) as Notification[0])
      setStats(prev => ({}
        ...prev,
        unread: data.unread_count || 0;
      }))
    } catch (error) {
      console.error("Failed to load notifications:", error)
      toast({title: "Error",
        description: "Failed to load notifications. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterNotifications = () => {
    let filtered = ...notifications]

    // Tab filter;
    if (activeTab === "unread") {
      filtered = filtered.filter((n) => !n.is_read)
    } else if (activeTab === "actions") {
      filtered = filtered.filter((n) => n.requiresAction && !n.is_read)
    }

    // Category filter - Since we don't have category in API response, skip this filter;
    // if (filterType !== "all") {
    //   filtered = filtered.filter((n) => n.category === filterType)
    // }

    // Unread only filter;
    if (showUnreadOnly) {
      filtered = filtered.filter((n) => !n.is_read)
    }

    setFilteredNotifications(filtered)
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId)
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? ...n, is_read: true } : n)))
      setStats((prev) => (...prev, unread: Math.max(0, prev.unread - 1) }))
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead()
      setNotifications((prev) => prev.map((n) => (...n, is_read: true })))
      setStats((prev) => (...prev, unread: 0 }))
      toast({title: "All Marked as Read",
        description: "All notifications have been marked as read.",
      })
    } catch (error) {
      console.error("Failed to mark all as read:", error)
      toast({title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive",
      })
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationsAPI.deleteNotification(notificationId)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      setStats((prev) => ({}
        ...prev,
        total: prev.total - 1,
        unread: prev.unread - (notifications.find((n) => n.id === notificationId)?.is_read ? 0 : 1),
      }))
    } catch (error) {
      console.error("Failed to delete notification:", error)
      toast({title: "Error",
        description: "Failed to delete notification.",
        variant: "destructive",
      })
    }
  }

  const deleteSelected = async () => {
    if (selectedNotifications.length === 0) return;
    try {
      await notificationsAPI.bulkDelete(selectedNotifications)
      const unreadCount = selectedNotifications.filter((id) => !notifications.find((n) => n.id === id)?.is_read).length;
      setNotifications((prev) => prev.filter((n) => !selectedNotifications.includes(n.id)))
      setStats((prev) => ({}
        ...prev,
        total: prev.total - selectedNotifications.length,
        unread: prev.unread - unreadCount,
      }))
      setSelectedNotifications([0])

      toast({title: "Notifications Deleted",
        description: `${selectedNotifications.length} notifications deleted.`,
      })
    } catch (error) {
      console.error("Failed to delete selected notifications:", error)
      toast({title: "Error",
        description: "Failed to delete selected notifications.",
        variant: "destructive",
      })
    }
  }

  const handleNotificationAction = async (notification: Notification, action: string) => {
    try {
      const token = localStorage.getItem("accessToken")

      if (notification.type === "friend_request") {
        const endpoint =
          action === "accept"
            ? `/api/users/friends/${notification.action_data?.requestId}/accept/`
            : `/api/users/friends/${notification.action_data?.requestId}/decline/`

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {}
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          markAsRead(notification.id)
          toast({title: "Success",
            description: `Friend request ${action}ed.`,
          })
        }
      } else if (notification.type === "party_invite" && action === "view") {
        router.push(`/watch/${notification.action_data?.partyId}`)
      } else if (notification.action_url) {
        router.push(notification.action_url)
      }
    } catch (error) {
      console.error("Failed to handle notification action:", error)
      toast({title: "Error",
        description: "Failed to process action.",
        variant: "destructive",
      })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {}
      case "friend_request":
      case "friend_accepted":
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case "party_invite":
      case "party_started":
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case "video_like":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "video_comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "video_upload":
        return <Video className="w-5 h-5 text-green-500" />;
      case "message":
        return <MessageCircle className="w-5 h-5 text-green-500" />;
      case "achievement":
        return <Star className="w-5 h-5 text-yellow-500" />;
      case "system":
        return <Info className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  }

  const getPriorityBadge = (priority: string) => {
    // Priority not available in API response, return null;
    return null;
  }

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId) ? prev.filter((id) => id !== notificationId) : ...prev, notificationId],
    )
  }

  const toggleAllSelection = () => {
    const visibleIds = filteredNotifications.map((n) => n.id)
    const allSelected = visibleIds.every((id) => selectedNotifications.includes(id))

    if (allSelected) {
      setSelectedNotifications((prev) => prev.filter((id) => !visibleIds.includes(id)))
    } else {}
      setSelectedNotifications((prev) => ...new Set(...prev, ...visibleIds])])
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()} className=&quot;p-2">"
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Notifications;
              {stats.unread > 0 && (
                <Badge variant="destructive" className="h-6 text-sm">
                  {stats.unread}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground mt-2">Stay updated with your watch party activities</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadNotifications}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh;
            </Button>
            {stats.unread > 0 && (
              <Button onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read;
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push(&quot;/dashboard/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Settings;
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
              <div className="text-sm text-muted-foreground">Unread</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.today}</div>
              <div className="text-sm text-muted-foreground">Today</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.thisWeek}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </CardContent>
          </Card>
        </div>

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
              <Checkbox;
                id="unread-only" 
                checked={showUnreadOnly} 
                onCheckedChange={(checked: CheckedState) => {
                  setShowUnreadOnly(checked === true)
                }} 
              />
              <label htmlFor="unread-only" className="text-sm">
                Unread only;
              </label>
            </div>
          </div>

          {selectedNotifications.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{selectedNotifications.length} selected</span>
              <Button variant="outline" size="sm" onClick={deleteSelected}>
                <Trash2 className="w-4 h-4 mr-1" />
                Delete;
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedNotifications([0])}>
                Clear;
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
              Requires Action ({notifications.filter((n) => n.requiresAction && !n.is_read).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Notifications</h3>
                  <p className="text-muted-foreground">
                    {activeTab === "unread"
                      ? "You're all caught up! No unread notifications."
                      : activeTab === "actions"
                        ? "No notifications require action."
                        : "You don't have any notifications yet."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Select All */}
                <div className="flex items-center gap-2 p-2">
                  <Checkbox;
                    checked={}
                      filteredNotifications.length > 0 &&
                      filteredNotifications.every((n) => selectedNotifications.includes(n.id))
                    }
                    onCheckedChange={(checked: CheckedState) => {
                      if (checked === true) {
                        const visibleIds = filteredNotifications.map((n) => n.id)
                        setSelectedNotifications((prev) => ...new Set(...prev, ...visibleIds])])
                      } else {}
                        const visibleIds = filteredNotifications.map((n) => n.id)
                        setSelectedNotifications((prev) => prev.filter((id) => !visibleIds.includes(id)))
                      }
                    }}
                  />
                  <span className="text-sm text-muted-foreground">Select all visible</span>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <Card;
                      key={notification.id}
                      className={`transition-all hover:shadow-md ${}
                        !notification.is_read ? "border-blue-200 bg-blue-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Selection Checkbox */}
                          <Checkbox;
                            checked={selectedNotifications.includes(notification.id)}
                            onCheckedChange={() => toggleNotificationSelection(notification.id)}
                          />

                          {/* Icon */}
                          <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                          {/* Avatar (if applicable) */}
                          {notification.action_data?.userAvatar && (
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={notification.action_data.userAvatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-sm">
                                {notification.action_data.userName?.[0] || "U"}
                              </AvatarFallback>
                            </Avatar>
                          )}

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className={`font-medium ${!notification.is_read ? "font-semibold" : ""}`}>
                                  {notification.title}
                                </h4>
                                {!notification.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                {getPriorityBadge("normal")}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {!notification.is_read && (
                                      <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                        <Check className="w-4 h-4 mr-2" />
                                        Mark as Read;
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem;
                                      onClick={() => deleteNotification(notification.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete;
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            <p className="text-muted-foreground mb-3">{notification.message}</p>

                            {/* Action Buttons */}
                            {notification.requiresAction && !notification.is_read && notification.actionButtons && (
                              <div className="flex items-center gap-2">
                                {notification.actionButtons.map((button, index) => (
                                  <Button;
                                    key={index}
                                    size="sm"
                                    variant={button.variant || "default"}
                                    onClick={() => handleNotificationAction(notification, button.action)}
                                  >
                                    {button.label}
                                  </Button>
                                ))}
                              </div>
                            )}

                            {/* Default Actions for specific types */}
                            {notification.requiresAction && !notification.is_read && !notification.actionButtons && (
                              <div className="flex items-center gap-2">
                                {notification.type === "friend_request" && (
                                  <>
                                    <Button size="sm" onClick={() => handleNotificationAction(notification, &quot;accept")}>
                                      Accept;
                                    </Button>
                                    <Button;
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleNotificationAction(notification, &quot;decline")}
                                    >
                                      Decline;
                                    </Button>
                                  </>
                                )}
                                {(notification.type === "party_invite" || notification.action_url) && (
                                  <Button;
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleNotificationAction(notification, &quot;view")}
                                  >
                                    View;
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
