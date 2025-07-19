"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, UserPlus, MoreHorizontal, MessageSquare, UserMinus, Users } from "lucide-react"
import { api } from "@/lib/api"

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: () => api.get("/friends"),
  })

  const { data: friendRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["friend-requests"],
    queryFn: () => api.get("/friends/requests"),
  })

  const mockFriends = [
    {
      id: 1,
      name: "Sarah Chen",
      avatar: "/placeholder.svg?height=40&width=40&text=SC",
      isOnline: true,
      lastSeen: "Online",
      mutualFriends: 5,
    },
    {
      id: 2,
      name: "Mike Johnson",
      avatar: "/placeholder.svg?height=40&width=40&text=MJ",
      isOnline: false,
      lastSeen: "2 hours ago",
      mutualFriends: 3,
    },
    {
      id: 3,
      name: "Elena Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40&text=ER",
      isOnline: true,
      lastSeen: "Online",
      mutualFriends: 8,
    },
  ]

  const mockRequests = [
    {
      id: 1,
      name: "Alex Thompson",
      avatar: "/placeholder.svg?height=40&width=40&text=AT",
      mutualFriends: 2,
      requestedAt: "2 days ago",
    },
    {
      id: 2,
      name: "Jessica Park",
      avatar: "/placeholder.svg?height=40&width=40&text=JP",
      mutualFriends: 1,
      requestedAt: "1 week ago",
    },
  ]

  const handleAcceptRequest = (requestId: number) => {
    console.log("Accept request:", requestId)
  }

  const handleDeclineRequest = (requestId: number) => {
    console.log("Decline request:", requestId)
  }

  const handleRemoveFriend = (friendId: number) => {
    console.log("Remove friend:", friendId)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Friends</h1>
          <p className="text-muted-foreground">Connect with friends and build your watch party network.</p>
        </div>

        <Button className="btn-primary">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Friends
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-base pl-10"
        />
      </div>

      <Tabs defaultValue="friends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="friends">Friends ({mockFriends.length})</TabsTrigger>
          <TabsTrigger value="requests">Requests ({mockRequests.length})</TabsTrigger>
          <TabsTrigger value="find">Find Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4">
          {friendsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-secondary rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-secondary rounded w-3/4" />
                        <div className="h-3 bg-secondary rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockFriends.map((friend) => (
                <Card key={friend.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={friend.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-background ${
                              friend.isOnline ? "bg-success" : "bg-muted-foreground"
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{friend.name}</h3>
                          <p className="text-sm text-muted-foreground">{friend.lastSeen}</p>
                          <p className="text-xs text-muted-foreground">{friend.mutualFriends} mutual friends</p>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            Invite to Party
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRemoveFriend(friend.id)} className="text-destructive">
                            <UserMinus className="mr-2 h-4 w-4" />
                            Remove Friend
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {mockRequests.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No friend requests</h3>
                <p className="text-muted-foreground">You don't have any pending friend requests.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {mockRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{request.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-foreground">{request.name}</h3>
                          <p className="text-sm text-muted-foreground">{request.mutualFriends} mutual friends</p>
                          <p className="text-xs text-muted-foreground">Requested {request.requestedAt}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleAcceptRequest(request.id)} className="btn-primary">
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeclineRequest(request.id)}>
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="find" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Find Friends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Discover new friends</h3>
                <p className="text-muted-foreground mb-4">
                  Connect with other football fans and expand your watch party network.
                </p>
                <Button className="btn-primary">Browse Suggested Friends</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
