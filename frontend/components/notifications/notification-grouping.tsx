import { Bell, Calendar, Check, ChevronDown, Filter, Mail, Search, Settings, Star, Trash, User, Users, Zap } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns"
import { notificationsAPI } from "@/lib/api"

"use client"

  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
interface Notification {}
  id: string;
  type: "friend_request" | "party_invite" | "message" | "achievement" | "store" | "system"
  title: string;
  message: string;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
  actionData?: unknown;
  priority: "low" | "normal" | "high"
  sender?: {}
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }
  groupKey?: string;
  groupCount?: number;
  isGrouped?: boolean;
}

interface NotificationGroup {}
  key: string;
  type: string;
  notifications: Notification[]
  latestAt: string;
  unreadCount: number;
  isExpanded: boolean;
}

interface NotificationGroupingProps {}
  className?: string;
}

export default function NotificationGrouping({ className }: NotificationGroupingProps) {}
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [groups, setGroups] = useState<NotificationGroup[]>([])
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [filters, setFilters] = useState({types: [] as string[],
    priority: [] as string[],
    readStatus: "all" as "all" | "unread" | "read",
    timeRange: "all" as "all" | "today" | "week" | "month",
  })

  const { toast } = useToast()

  useEffect(() => {}
    loadNotifications()
  }, [])

  useEffect(() => {}
    groupNotifications()
  }, [notifications, searchQuery, filters])

  const loadNotifications = async () => {}
    try {}
      const data = await notificationsAPI.getNotifications()
      const items = Array.isArray((data as Record<string, unknown>)?.results)
        ? (data as Record<string, unknown>).results;
        : Array.isArray((data as Record<string, unknown>)?.notifications)
          ? (data as Record<string, unknown>).notifications;
          : []

      const mapped = items.map((item: unknown) => ({}
        id: item.id,
        type: item.type || "system",
        title: item.title || item.message || "Notification",
        message: item.message || item.body || "",
        createdAt: item.created_at || item.createdAt || new Date().toISOString(),
        readAt: item.read_at || item.readAt || (item.is_read ? item.updated_at || new Date().toISOString() : undefined),
        actionUrl: item.action_url || item.actionUrl,
        actionData: item.action_data || item.actionData,
        priority: (item.priority || "normal") as Notification["priority"],
        sender: item.sender;
          ? {}
              id: item.sender.id,
              username: item.sender.username,
              firstName: item.sender.first_name || item.sender.firstName || "",
              lastName: item.sender.last_name || item.sender.lastName || "",
              avatar: item.sender.avatar,
            }
          : undefined,
        groupKey: item.group_key,
        groupCount: item.group_count,
      }))

      setNotifications(mapped)
    } catch {}
      console.error("Failed to load notifications:", error)
      toast({title: "Failed to load notifications",
        description: "Please try refreshing the page",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(false)
    }
  }

  const groupNotifications = () => {}
    let filtered = notifications;
    // Apply search filter;
    if (searchQuery) {}
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.sender?.firstName?.toLowerCase().includes(query) ||
        n.sender?.lastName?.toLowerCase().includes(query)
      )
    }

    // Apply type filter;
    if (filters.types.length > 0) {}
      filtered = filtered.filter(n => filters.types.includes(n.type))
    }

    // Apply priority filter;
    if (filters.priority.length > 0) {}
      filtered = filtered.filter(n => filters.priority.includes(n.priority))
    }

    // Apply read status filter;
    if (filters.readStatus !== "all") {}
      filtered = filtered.filter(n => 
        filters.readStatus === "unread" ? !n.readAt : !!n.readAt;
      )
    }

    // Apply time range filter;
    if (filters.timeRange !== "all") {}
      const now = new Date()
      const cutoff = new Date()
      switch (filters.timeRange) {}
        case "today":
          cutoff.setHours(0, 0, 0, 0)
          break;
        case "week":
          cutoff.setDate(now.getDate() - 7)
          break;
        case "month":
          cutoff.setMonth(now.getMonth() - 1)
          break;
      }
      filtered = filtered.filter(n => new Date(n.createdAt) >= cutoff)
    }

    // Group similar notifications;
    const groupMap = new Map<string, Notification[]>()
    filtered.forEach(notification => {}
      // Create grouping key based on type and sender;
      let groupKey = notification.type;
      if (notification.sender) {}
        groupKey += `_${notification.sender.id}`
      }
      if (!groupMap.has(groupKey)) {}
        groupMap.set(groupKey, [])
      }
      groupMap.get(groupKey)!.push(notification)
    })

    // Convert to group objects;
    const newGroups: NotificationGroup[] = Array.from(groupMap.entries()).map(([key, notifications]) => {}
      const sortedNotifications = notifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      return {}
        key,
        type: notifications[0].type,
        notifications: sortedNotifications,
        latestAt: sortedNotifications[0].createdAt,
        unreadCount: sortedNotifications.filter(n => !n.readAt).length,
        isExpanded: notifications.length === 1 || selectedNotifications.size > 0,
      }
    }).sort((a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime())

    setGroups(newGroups)
  }

  const markAsRead = async (notificationIds: string[]) => {}
    try {}
      await Promise.all(notificationIds.map(id => notificationsAPI.markAsRead(id)))
      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n.id)
            ? { ...n, readAt: new Date().toISOString() }
            : n;
        )
      )
      toast({title: "Marked as read",
        description: `${notificationIds.length} notification(s) marked as read`,
      })
    } catch {}
      console.error("Failed to mark as read:", error)
      toast({title: "Failed to mark as read",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const markAsUnread = async (notificationIds: string[]) => {}
    try {}
      setNotifications(prev =>
        prev.map(n =>
          notificationIds.includes(n.id)
            ? { ...n, readAt: undefined }
            : n;
        )
      )
      toast({title: "Marked locally",
        description: "Notifications marked as unread locally. Backend does not support this action yet.",
      })
    } catch {}
      console.error("Failed to mark as unread:", error)
      toast({title: "Failed to mark as unread",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const deleteNotifications = async (notificationIds: string[]) => {}
    try {}
      await Promise.all(notificationIds.map(id => notificationsAPI.deleteNotification(id)))
      setNotifications(prev => prev.filter(n => !notificationIds.includes(n.id)))
      setSelectedNotifications(new Set())
      toast({title: "Notifications deleted",
        description: `${notificationIds.length} notification(s) deleted`,
      })
    } catch {}
      console.error("Failed to delete notifications:", error)
      toast({title: "Failed to delete notifications",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const toggleGroupExpansion = (groupKey: string) => {}
    setGroups(prev => 
      prev.map(group => 
        group.key === groupKey;
          ? { ...group, isExpanded: !group.isExpanded }
          : group;
      )
    )
  }

  const selectNotification = (notificationId: string, checked: boolean) => {}
    setSelectedNotifications(prev => {}
      const newSet = new Set(prev)
      if (checked) {}
        newSet.add(notificationId)
      } else {}
        newSet.delete(notificationId)
      }
      return newSet;
    })
  }

  const selectAllInGroup = (group: NotificationGroup, checked: boolean) => {}
    setSelectedNotifications(prev => {}
      const newSet = new Set(prev)
      group.notifications.forEach(n => {}
        if (checked) {}
          newSet.add(n.id)
        } else {}
          newSet.delete(n.id)
        }
      })
      return newSet;
    })
  }

  const getNotificationIcon = (type: string) => {}
    switch (type) {}
      case "friend_request": return <Users className="h-4 w-4" />
      case "party_invite": return <Calendar className="h-4 w-4" />
      case "message": return <MessageSquare className="h-4 w-4" />
      case "achievement": return <Star className="h-4 w-4" />
      case "store": return <Zap className="h-4 w-4" />
      case "system": return <Settings className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getTimeGroupLabel = (createdAt: string) => {}
    const date = new Date(createdAt)
    if (isToday(date)) return "Today"
    if (isYesterday(date)) return "Yesterday"
    return format(date, "MMM d, yyyy")
  }

  const getUserInitials = (firstName: string, lastName: string) => {}
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
  }

  const NotificationCard = ({ notification, isInGroup = false }: { notification: Notification; isInGroup?: boolean }) => {}
    const isSelected = selectedNotifications.has(notification.id)
    const isUnread = !notification.readAt;
    return (
      <Card className={`transition-all ${isUnread ? 'border-l-4 border-l-primary' : ''} ${isSelected ? 'ring-2 ring-primary' : ''} ${isInGroup ? 'ml-4' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox;
              checked={isSelected}
              onCheckedChange={(checked) => selectNotification(notification.id, checked as boolean)}
            />

            <div className="flex items-start gap-3 flex-1">
              {notification.sender ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={notification.sender.avatar} />
                  <AvatarFallback className="text-xs">
                    {getUserInitials(notification.sender.firstName, notification.sender.lastName)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="p-2 rounded-full bg-muted">
                  {getNotificationIcon(notification.type)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h4 className={`font-medium ${isUnread ? 'font-semibold' : ''}`}>
                    {notification.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    {notification.priority === "high" && (
                      <Badge variant="destructive" className="text-xs">High</Badge>
                    )}
                    {isUnread && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {notification.message}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                  {notification.actionUrl && (
                    <Button size="sm" variant="outline" className="h-6 text-xs">
                      View;
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const NotificationGroupCard = ({ group }: { group: NotificationGroup }) => {}
    const isGroupSelected = group.notifications.every(n => selectedNotifications.has(n.id))
    const isSomeSelected = group.notifications.some(n => selectedNotifications.has(n.id))

    if (group.notifications.length === 1) {}
      return <NotificationCard notification={group.notifications[0]} />
    }

    return (
      <div className="space-y-2">
        <Collapsible open={group.isExpanded} onOpenChange={() => toggleGroupExpansion(group.key)}>
          <Card className={`transition-all ${group.unreadCount > 0 ? &apos;border-l-4 border-l-primary' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Checkbox;
                  checked={isGroupSelected}
                  onCheckedChange={(checked) => selectAllInGroup(group, checked as boolean)}
                />

                <div className="p-2 rounded-full bg-muted">
                  {getNotificationIcon(group.type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        {group.notifications[0].title}
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({group.notifications.length} notifications)
                        </span>
                      </h4>
                      {group.unreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {group.unreadCount} unread;
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(group.latestAt), { addSuffix: true })}
                      </span>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <ChevronDown className={`h-4 w-4 transition-transform ${group.isExpanded ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <CollapsibleContent className="space-y-2">
            {group.notifications.map((notification) => (
              <NotificationCard;
                key={notification.id} 
                notification={notification} 
                isInGroup={true}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.readAt).length;
  const selectedArray = Array.from(selectedNotifications)

  if (isLoading) {}
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Loading notifications...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications;
              {unreadCount > 0 && (
                <Badge variant="destructive">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>

            {/* Bulk Actions */}
            {selectedArray.length > 0 && (
              <div className="flex items-center gap-2">
                <Button;
                  size="sm"
                  variant="outline"
                  onClick={() => markAsRead(selectedArray)}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark Read;
                </Button>
                <Button;
                  size="sm"
                  variant="outline"
                  onClick={() => markAsUnread(selectedArray)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Mark Unread;
                </Button>
                <Button;
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteNotifications(selectedArray)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete;
                </Button>
              </div>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input;
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters;
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                {["friend_request", "party_invite", "message", "achievement", "store", "system"].map((type) => (
                  <DropdownMenuCheckboxItem;
                    key={type}
                    checked={filters.types.includes(type)}
                    onCheckedChange={(checked) => {}
                      setFilters(prev => ({}
                        ...prev,
                        types: checked;
                          ? [...prev.types, type]
                          : prev.types.filter(t => t !== type)
                      }))
                    }}
                  >
                    {type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
                {["high", "normal", "low"].map((priority) => (
                  <DropdownMenuCheckboxItem;
                    key={priority}
                    checked={filters.priority.includes(priority)}
                    onCheckedChange={(checked) => {}
                      setFilters(prev => ({}
                        ...prev,
                        priority: checked;
                          ? [...prev.priority, priority]
                          : prev.priority.filter(p => p !== priority)
                      }))
                    }}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority;
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="read">
                Read ({notifications.length - unreadCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {groups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groups.map((group) => (
                    <NotificationGroupCard key={group.key} group={group} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4 mt-4">
              {groups.filter(g => g.unreadCount > 0).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>All caught up!</p>
                  <p className="text-sm">No unread notifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groups;
                    .filter(group => group.unreadCount > 0)
                    .map((group) => (
                      <NotificationGroupCard key={group.key} group={group} />
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="read" className="space-y-4 mt-4">
              {groups.filter(g => g.unreadCount === 0).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No read notifications</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groups;
                    .filter(group => group.unreadCount === 0)
                    .map((group) => (
                      <NotificationGroupCard key={group.key} group={group} />
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
