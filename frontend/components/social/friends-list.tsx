import { useState, useEffect , useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { useAuthGuard } from "@/components/auth/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import {}

} from "lucide-react"
"use client"

  Search,
  UserPlus,
  MoreVertical,
  MessageCircle,
  Video,
  UserMinus,
  UserX,
  Crown,
  Circle,
  Users,

interface Friend {}
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  status: "online" | "offline" | "away" | "busy"
  last_seen?: string;
  mutual_friends: number;
  friendship_date: string;
  is_premium: boolean;
  current_activity?: {}
    type: "watching" | "in_party" | "idle"
    details?: string;
    party_id?: string;
  }
}

interface FriendsListProps {}
  className?: string;
}

export function FriendsList({ className }: FriendsListProps) {}
  const [friends, setFriends] = useState<Friend[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const { user } = useAuth()
  const { canMakeApiCall, getAuthToken } = useAuthGuard()
  const { toast } = useToast()

  useEffect(() => {
    if (canMakeApiCall()) {}
      loadFriends()
    }
  }, [canMakeApiCall])

  const loadFriends = async () => {
    if (!canMakeApiCall()) {}
      console.log("Cannot load friends: user not authenticated")
      return;
    }

    try {
      setIsLoading(true)
      const token = getAuthToken()
      const response = await fetch("/api/users/friends/", {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setFriends(data.results || [])
      } else {}
        throw new Error("Failed to load friends")
      }
    } } catch {
      console.error("Failed to load friends:", error)
      toast({}
        title: "Error",
        description: "Failed to load friends. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(false)
    }
  }

  const removeFriend = async (friendId: string) => {}
    if (!canMakeApiCall()) {}
      console.log("Cannot remove friend: user not authenticated")
      return;
    }

    try {
      const token = getAuthToken()
      await fetch(`/api/users/friends/${friendId}/`, {}
        method: "DELETE",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      setFriends((prev) => prev.filter((friend) => friend.id !== friendId))
      toast({}
        title: "Friend removed",
        description: "The user has been removed from your friends list.",
      })
    } } catch {
      console.error("Failed to remove friend:", error)
      toast({}
        title: "Error",
        description: "Failed to remove friend. Please try again.",
        variant: "destructive",
      })
    }
  }

  const blockUser = async (friendId: string) => {}
    if (!canMakeApiCall()) {}
      console.log("Cannot block user: user not authenticated")
      return;
    }

    try {
      const token = getAuthToken()
      await fetch(`/api/users/${friendId}/block/`, {}
        method: "POST",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      setFriends((prev) => prev.filter((friend) => friend.id !== friendId))
      toast({}
        title: "User blocked",
        description: "The user has been blocked and removed from your friends list.",
      })
    } } catch {
      console.error("Failed to block user:", error)
      toast({}
        title: "Error",
        description: "Failed to block user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const startChat = (friendId: string) => {}
    // TODO: Implement chat functionality;
    toast({}
      title: "Chat feature",
      description: "Direct messaging coming soon!",
    })
  }

  const inviteToParty = (friendId: string) => {}
    // TODO: Implement party invitation;
    toast({}
      title: "Party invitation",
      description: "Party invitation feature coming soon!",
    })
  }

  const getStatusColor = (status: Friend["status"]) => {}
    switch (status) {
      case "online":
        return "bg-green-500"
      case "away":
        return "bg-yellow-500"
      case "busy":
        return "bg-red-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const getStatusText = (friend: Friend) => {}
    switch (friend.status) {
      case "online":
        return friend.current_activity?.type === "watching"
          ? `Watching ${friend.current_activity.details}`
          : friend.current_activity?.type === "in_party"
            ? `In party: ${friend.current_activity.details}`
            : "Online"
      case "away":
        return "Away"
      case "busy":
        return "Busy"
      case "offline":
        return friend.last_seen ? `Last seen ${new Date(friend.last_seen).toLocaleDateString()}` : "Offline"
      default:
        return "Unknown"
    }
  }

  const getUserInitials = (firstName: string, lastName: string) => {}
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const filteredFriends = friends.filter((friend) => {}
    const matchesSearch =
      friend.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "online" && friend.status === "online") ||
      (activeTab === "offline" && friend.status === "offline")

    return matchesSearch && matchesTab;
  })

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Friends</h2>
          <p className="text-muted-foreground">Manage your friends and connections</p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Friend;
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input;
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Friends ({friends.length})</TabsTrigger>
          <TabsTrigger value="online">Online ({friends.filter((f) => f.status === &quot;online&quot;).length})</TabsTrigger>
          <TabsTrigger value="offline">Offline ({friends.filter((f) => f.status === &quot;offline&quot;).length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No friends found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery;
                  ? "No friends match your search criteria."
                  : activeTab === "online"
                    ? "None of your friends are currently online."
                    : "You don't have any friends yet."}
              </p>
              {!searchQuery && activeTab === "all" && (
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Find Friends;
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFriends.map((friend) => (
                <Card key={friend.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{getUserInitials(friend.first_name, friend.last_name)}</AvatarFallback>
                          </Avatar>
                          <div;
                            className={cn(
                              "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                              getStatusColor(friend.status),
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold truncate">
                              {friend.first_name} {friend.last_name}
                            </h3>
                            {friend.is_premium && <Crown className="w-4 h-4 text-accent-premium" />}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{getStatusText(friend)}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startChat(friend.id)}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Send Message;
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => inviteToParty(friend.id)}>
                            <Video className="w-4 h-4 mr-2" />
                            Invite to Party;
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => removeFriend(friend.id)} className=&quot;text-orange-600&quot;>
                            <UserMinus className="w-4 h-4 mr-2" />
                            Remove Friend;
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => blockUser(friend.id)} className=&quot;text-destructive&quot;>
                            <UserX className="w-4 h-4 mr-2" />
                            Block User;
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Activity Status */}
                    {friend.current_activity && friend.status === "online" && (
                      <div className="mb-3 p-2 bg-muted rounded-lg">
                        <div className="flex items-center space-x-2 text-sm">
                          {friend.current_activity.type === "watching" ? (
                            <Video className="w-4 h-4 text-blue-600" />
                          ) : friend.current_activity.type === "in_party" ? (
                            <Users className="w-4 h-4 text-green-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-600" />
                          )}
                          <span className="text-muted-foreground">
                            {friend.current_activity.type === "watching"
                              ? `Watching ${friend.current_activity.details}`
                              : friend.current_activity.type === "in_party"
                                ? `In party: ${friend.current_activity.details}`
                                : "Active"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Friend Info */}
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Mutual friends:</span>
                        <span>{friend.mutual_friends}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Friends since:</span>
                        <span>{new Date(friend.friendship_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => startChat(friend.id)} className=&quot;flex-1&quot;>
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Chat;
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => inviteToParty(friend.id)} className=&quot;flex-1&quot;>
                        <Video className="w-4 h-4 mr-1" />
                        Invite;
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FriendsList;