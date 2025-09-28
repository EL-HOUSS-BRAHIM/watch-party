"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserPlus, Users, MessageCircle, Crown, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useAuthGuard } from "@/components/auth/auth-guard"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"

interface SearchUser {
  id: string
  username: string
  firstName: string
  lastName: string
  avatar?: string
  isOnline: boolean
  mutualFriends: number
  friendshipStatus: "none" | "pending_sent" | "pending_received" | "friends" | "blocked"
  isPremium: boolean
  lastActive?: string
  bio?: string
  location?: string
}

interface UserSearchProps {
  onUserSelect?: (user: SearchUser) => void
  className?: string
}

export default function UserSearch({ onUserSelect, className }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<SearchUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState("relevance")
  const [filterBy, setFilterBy] = useState("all")
  const [hasSearched, setHasSearched] = useState(false)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const { user } = useAuth()
  const { canMakeApiCall, getAuthToken } = useAuthGuard()
  const { toast } = useToast()

  const searchUsers = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setUsers([])
        setHasSearched(false)
        return
      }

      if (!canMakeApiCall()) {
        console.log("Cannot search users: user not authenticated")
        return
      }

      setIsLoading(true)
      setHasSearched(true)

      try {
        const token = getAuthToken()
        const params = new URLSearchParams({
          q: query,
          sort: sortBy,
          filter: filterBy,
        })

        const response = await fetch(`/api/users/search/?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUsers(data.results || data)
        }
      } catch (error) {
        console.error("Failed to search users:", error)
        toast({
          title: "Search Error",
          description: "Failed to search users. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [sortBy, filterBy, toast, canMakeApiCall, getAuthToken],
  )

  useEffect(() => {
    searchUsers(debouncedSearchQuery)
  }, [debouncedSearchQuery, searchUsers])

  const sendFriendRequest = async (userId: string) => {
    if (!canMakeApiCall()) {
      console.log("Cannot send friend request: user not authenticated")
      return
    }

    try {
      const token = getAuthToken()
      const response = await fetch(`/api/users/${userId}/friend-request/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, friendshipStatus: &quot;pending_sent" } : u)))
        toast({
          title: "Friend request sent",
          description: "Your friend request has been sent successfully.",
        })
      }
    } catch (error) {
      console.error("Failed to send friend request:", error)
      toast({
        title: "Error",
        description: "Failed to send friend request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const acceptFriendRequest = async (userId: string) => {
    if (!canMakeApiCall()) {
      console.log("Cannot accept friend request: user not authenticated")
      return
    }

    try {
      const token = getAuthToken()
      // Find the request ID (this would come from the user data in a real implementation)
      const response = await fetch(`/api/users/friend-requests/accept/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      })

      if (response.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, friendshipStatus: "friends" } : u)))
        toast({
          title: "Friend request accepted",
          description: "You are now friends!",
        })
      }
    } catch (error) {
      console.error("Failed to accept friend request:", error)
      toast({
        title: "Error",
        description: "Failed to accept friend request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const startChat = (userId: string) => {
    // TODO: Implement chat functionality
    toast({
      title: "Chat feature",
      description: "Direct messaging coming soon!",
    })
  }

  const getFriendshipStatusButton = (user: SearchUser) => {
    switch (user.friendshipStatus) {
      case "none":
        return (
          <Button size="sm" onClick={() => sendFriendRequest(user.id)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Friend
          </Button>
        )
      case "pending_sent":
        return (
          <Button size="sm" variant="outline" disabled>
            <UserPlus className="mr-2 h-4 w-4" />
            Request Sent
          </Button>
        )
      case "pending_received":
        return (
          <Button size="sm" onClick={() => acceptFriendRequest(user.id)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Accept Request
          </Button>
        )
      case "friends":
        return (
          <Button size="sm" variant="outline" onClick={() => startChat(user.id)}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Message
          </Button>
        )
      case "blocked":
        return (
          <Button size="sm" variant="outline" disabled>
            Blocked
          </Button>
        )
      default:
        return null
    }
  }

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getStatusIndicator = (user: SearchUser) => {
    if (user.isOnline) {
      return <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
    }
    return <div className="w-3 h-3 bg-gray-400 rounded-full border-2 border-white" />
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
          <Search className="h-6 w-6" />
          Find Friends
        </h2>
        <p className="text-gray-600">Search for users to connect with</p>
      </div>

      {/* Search Controls */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by username, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Most Relevant</SelectItem>
              <SelectItem value="mutual_friends">Mutual Friends</SelectItem>
              <SelectItem value="last_active">Recently Active</SelectItem>
              <SelectItem value="username">Username A-Z</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="online">Online Only</SelectItem>
              <SelectItem value="mutual_friends">Has Mutual Friends</SelectItem>
              <SelectItem value="premium">Premium Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Searching users...</p>
          </div>
        ) : !hasSearched ? (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Start searching</h3>
            <p className="text-gray-600">Enter a username, name, or email to find users</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((searchUser) => (
              <Card
                key={searchUser.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onUserSelect?.(searchUser)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={searchUser.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{getUserInitials(searchUser.firstName, searchUser.lastName)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1">{getStatusIndicator(searchUser)}</div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {searchUser.firstName} {searchUser.lastName}
                            </h3>
                            {searchUser.isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                            {searchUser.isOnline && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Online
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">@{searchUser.username}</p>

                          {searchUser.bio && (
                            <p className="text-sm text-gray-700 mt-1 line-clamp-2">{searchUser.bio}</p>
                          )}

                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            {searchUser.mutualFriends > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {searchUser.mutualFriends} mutual friend{searchUser.mutualFriends !== 1 ? "s" : ""}
                              </span>
                            )}
                            {searchUser.location && <span>{searchUser.location}</span>}
                            {!searchUser.isOnline && searchUser.lastActive && (
                              <span>Last active {new Date(searchUser.lastActive).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>

                        <div className="ml-4" onClick={(e) => e.stopPropagation()}>
                          {getFriendshipStatusButton(searchUser)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
