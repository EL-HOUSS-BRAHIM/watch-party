"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { MoreHorizontal, MessageCircle, Video, UserMinus, UserX, Play, Crown, Users, UserPlus } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Friend {
  id: string
  user: {
    id: string
    username: string
    avatar?: string
    first_name: string
    last_name: string
    is_online: boolean
    last_seen?: string
  }
  status: "accepted"
  created_at: string
  current_activity?: {
    type: "watching" | "hosting"
    party_title: string
    party_id: string
    participants: number
  }
}

interface FriendsListProps {
  searchQuery: string
}

// Mock friends data
const mockFriends: Friend[] = [
  {
    id: "1",
    user: {
      id: "user-1",
      username: "sarah_j",
      avatar: "/placeholder.svg?height=40&width=40",
      first_name: "Sarah",
      last_name: "Johnson",
      is_online: true,
    },
    status: "accepted",
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
    current_activity: {
      type: "hosting",
      party_title: "Movie Night",
      party_id: "party-1",
      participants: 8,
    },
  },
  {
    id: "2",
    user: {
      id: "user-2",
      username: "mike_c",
      avatar: "/placeholder.svg?height=40&width=40",
      first_name: "Mike",
      last_name: "Chen",
      is_online: true,
      last_seen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    },
    status: "accepted",
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(), // 15 days ago
    current_activity: {
      type: "watching",
      party_title: "Documentary Series",
      party_id: "party-2",
      participants: 5,
    },
  },
  {
    id: "3",
    user: {
      id: "user-3",
      username: "alex_r",
      avatar: "/placeholder.svg?height=40&width=40",
      first_name: "Alex",
      last_name: "Rivera",
      is_online: false,
      last_seen: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    },
    status: "accepted",
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(), // 60 days ago
  },
  {
    id: "4",
    user: {
      id: "user-4",
      username: "emma_w",
      avatar: "/placeholder.svg?height=40&width=40",
      first_name: "Emma",
      last_name: "Wilson",
      is_online: true,
    },
    status: "accepted",
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
  },
]

export function FriendsList({ searchQuery }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>(mockFriends)

  const filteredFriends = friends.filter(
    (friend) =>
      friend.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.user.last_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const onlineFriends = filteredFriends.filter((friend) => friend.user.is_online)
  const offlineFriends = filteredFriends.filter((friend) => !friend.user.is_online)

  const removeFriend = (friendId: string) => {
    setFriends((prev) => prev.filter((friend) => friend.id !== friendId))
  }

  const blockUser = (friendId: string) => {
    // Implement block functionality
    console.log("Block user:", friendId)
  }

  const startChat = (friendId: string) => {
    // Implement chat functionality
    console.log("Start chat with:", friendId)
  }

  const inviteToParty = (friendId: string) => {
    // Implement party invitation
    console.log("Invite to party:", friendId)
  }

  const joinActivity = (partyId: string) => {
    // Navigate to party
    window.location.href = `/watch/${partyId}`
  }

  const renderFriend = (friend: Friend) => (
    <Card key={friend.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="w-12 h-12">
              <AvatarImage src={friend.user.avatar || "/placeholder.svg"} />
              <AvatarFallback>
                {friend.user.first_name[0]}
                {friend.user.last_name[0]}
              </AvatarFallback>
            </Avatar>
            {/* Online Status */}
            <div
              className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background",
                friend.user.is_online ? "bg-accent-success" : "bg-muted-foreground",
              )}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium truncate">
                {friend.user.first_name} {friend.user.last_name}
              </h3>
              <span className="text-sm text-muted-foreground">@{friend.user.username}</span>
            </div>

            {friend.user.is_online ? (
              friend.current_activity ? (
                <div className="flex items-center space-x-2 mt-1">
                  {friend.current_activity.type === "hosting" ? (
                    <Crown className="w-3 h-3 text-accent-premium" />
                  ) : (
                    <Play className="w-3 h-3 text-accent-primary" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {friend.current_activity.type === "hosting" ? "Hosting" : "Watching"}{" "}
                    <span className="text-foreground font-medium">{friend.current_activity.party_title}</span>
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {friend.current_activity.participants} watching
                  </Badge>
                </div>
              ) : (
                <p className="text-sm text-accent-success mt-1">Online</p>
              )
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                Last seen {formatDistanceToNow(new Date(friend.user.last_seen!), { addSuffix: true })}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {friend.current_activity && (
              <Button size="sm" onClick={() => joinActivity(friend.current_activity!.party_id)}>
                <Play className="w-4 h-4 mr-1" />
                Join
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={() => startChat(friend.id)}>
              <MessageCircle className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={() => inviteToParty(friend.id)}>
              <Video className="w-4 h-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => startChat(friend.id)}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => inviteToParty(friend.id)}>
                  <Video className="w-4 h-4 mr-2" />
                  Invite to Party
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => removeFriend(friend.id)} className="text-destructive">
                  <UserMinus className="w-4 h-4 mr-2" />
                  Remove Friend
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => blockUser(friend.id)} className="text-destructive">
                  <UserX className="w-4 h-4 mr-2" />
                  Block User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (filteredFriends.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No friends found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? "Try adjusting your search terms" : "Start connecting with people to build your network"}
          </p>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Find Friends
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Online Friends */}
      {onlineFriends.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Online</h2>
            <Badge variant="secondary">{onlineFriends.length}</Badge>
          </div>
          <div className="space-y-3">{onlineFriends.map(renderFriend)}</div>
        </div>
      )}

      {/* Offline Friends */}
      {offlineFriends.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Offline</h2>
            <Badge variant="secondary">{offlineFriends.length}</Badge>
          </div>
          <div className="space-y-3">{offlineFriends.map(renderFriend)}</div>
        </div>
      )}
    </div>
  )
}
