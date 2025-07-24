"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, Users, Loader2 } from "lucide-react"

interface User {
  id: string
  username: string
  avatar?: string
  first_name: string
  last_name: string
  mutual_friends: number
  is_friend: boolean
  request_sent: boolean
  bio?: string
  location?: string
}

interface UserSearchProps {
  searchQuery: string
}

// Mock search results
const mockUsers: User[] = [
  {
    id: "search-1",
    username: "movie_buff",
    avatar: "/placeholder.svg?height=40&width=40",
    first_name: "Jessica",
    last_name: "Brown",
    mutual_friends: 5,
    is_friend: false,
    request_sent: false,
    bio: "Love sci-fi and horror movies! Always up for a good watch party 🎬",
    location: "San Francisco, CA",
  },
  {
    id: "search-2",
    username: "cinema_lover",
    avatar: "/placeholder.svg?height=40&width=40",
    first_name: "Ryan",
    last_name: "Taylor",
    mutual_friends: 2,
    is_friend: false,
    request_sent: true,
    bio: "Film student and movie enthusiast",
    location: "Los Angeles, CA",
  },
  {
    id: "search-3",
    username: "netflix_addict",
    avatar: "/placeholder.svg?height=40&width=40",
    first_name: "Maya",
    last_name: "Patel",
    mutual_friends: 0,
    is_friend: false,
    request_sent: false,
    bio: "Binge-watcher extraordinaire. Let's discover new shows together!",
    location: "New York, NY",
  },
]

const suggestedUsers: User[] = [
  {
    id: "suggested-1",
    username: "alex_films",
    avatar: "/placeholder.svg?height=40&width=40",
    first_name: "Alex",
    last_name: "Johnson",
    mutual_friends: 8,
    is_friend: false,
    request_sent: false,
    bio: "Documentary filmmaker and movie critic",
    location: "Austin, TX",
  },
  {
    id: "suggested-2",
    username: "sarah_watches",
    avatar: "/placeholder.svg?height=40&width=40",
    first_name: "Sarah",
    last_name: "Davis",
    mutual_friends: 3,
    is_friend: false,
    request_sent: false,
    bio: "Anime and K-drama enthusiast",
    location: "Seattle, WA",
  },
]

export function UserSearch({ searchQuery }: UserSearchProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)

  useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    if (localSearchQuery.trim()) {
      setIsLoading(true)
      // Simulate API call
      setTimeout(() => {
        const filtered = mockUsers.filter(
          (user) =>
            user.username.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
            user.first_name.toLowerCase().includes(localSearchQuery.toLowerCase()) ||
            user.last_name.toLowerCase().includes(localSearchQuery.toLowerCase()),
        )
        setUsers(filtered)
        setIsLoading(false)
      }, 500)
    } else {
      setUsers(suggestedUsers)
    }
  }, [localSearchQuery])

  const sendFriendRequest = (userId: string) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, request_sent: true } : user)))
  }

  const cancelFriendRequest = (userId: string) => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, request_sent: false } : user)))
  }

  const renderUser = (user: User) => (
    <Card key={user.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatar || "/placeholder.svg"} />
            <AvatarFallback>
              {user.first_name[0]}
              {user.last_name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium">
                {user.first_name} {user.last_name}
              </h3>
              <span className="text-sm text-muted-foreground">@{user.username}</span>
            </div>

            {user.mutual_friends > 0 && (
              <div className="flex items-center space-x-1 mb-2">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {user.mutual_friends} mutual friend{user.mutual_friends !== 1 ? "s" : ""}
                </span>
              </div>
            )}

            {user.bio && <p className="text-sm text-muted-foreground mb-2">{user.bio}</p>}

            {user.location && <p className="text-xs text-muted-foreground">{user.location}</p>}
          </div>

          <div>
            {user.is_friend ? (
              <Badge variant="secondary">Friends</Badge>
            ) : user.request_sent ? (
              <Button variant="outline" size="sm" onClick={() => cancelFriendRequest(user.id)}>
                Cancel Request
              </Button>
            ) : (
              <Button size="sm" onClick={() => sendFriendRequest(user.id)}>
                <UserPlus className="w-4 h-4 mr-1" />
                Add Friend
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by username, name, or email..."
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Searching...</span>
        </div>
      )}

      {/* Results */}
      {!isLoading && (
        <div className="space-y-4">
          {localSearchQuery.trim() ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Search Results</h2>
                {users.length > 0 && <Badge variant="secondary">{users.length} found</Badge>}
              </div>
              {users.length === 0 ? (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No users found</h3>
                    <p className="text-muted-foreground">Try searching with different keywords or check the spelling</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">{users.map(renderUser)}</div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Suggested for You</h2>
                <Badge variant="secondary">{users.length}</Badge>
              </div>
              <div className="space-y-3">{users.map(renderUser)}</div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
