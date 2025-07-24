"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCheck, UserX, Clock, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface FriendRequest {
  id: string
  user: {
    id: string
    username: string
    avatar?: string
    first_name: string
    last_name: string
  }
  message?: string
  created_at: string
  mutual_friends: number
}

// Mock data
const incomingRequests: FriendRequest[] = [
  {
    id: "1",
    user: {
      id: "user-5",
      username: "john_d",
      avatar: "/placeholder.svg?height=40&width=40",
      first_name: "John",
      last_name: "Doe",
    },
    message: "Hey! We met at the conference last week. Would love to watch some movies together!",
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    mutual_friends: 3,
  },
  {
    id: "2",
    user: {
      id: "user-6",
      username: "lisa_k",
      avatar: "/placeholder.svg?height=40&width=40",
      first_name: "Lisa",
      last_name: "Kim",
    },
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    mutual_friends: 1,
  },
  {
    id: "3",
    user: {
      id: "user-7",
      username: "david_m",
      avatar: "/placeholder.svg?height=40&width=40",
      first_name: "David",
      last_name: "Miller",
    },
    message: "Love your movie taste! Let's be friends 🎬",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    mutual_friends: 0,
  },
]

const sentRequests: FriendRequest[] = [
  {
    id: "4",
    user: {
      id: "user-8",
      username: "anna_s",
      avatar: "/placeholder.svg?height=40&width=40",
      first_name: "Anna",
      last_name: "Smith",
    },
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    mutual_friends: 2,
  },
  {
    id: "5",
    user: {
      id: "user-9",
      username: "tom_w",
      avatar: "/placeholder.svg?height=40&width=40",
      first_name: "Tom",
      last_name: "Wilson",
    },
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
    mutual_friends: 1,
  },
]

export function FriendRequests() {
  const [incoming, setIncoming] = useState<FriendRequest[]>(incomingRequests)
  const [sent, setSent] = useState<FriendRequest[]>(sentRequests)

  const acceptRequest = (requestId: string) => {
    setIncoming((prev) => prev.filter((req) => req.id !== requestId))
    // Add to friends list logic here
  }

  const declineRequest = (requestId: string) => {
    setIncoming((prev) => prev.filter((req) => req.id !== requestId))
  }

  const cancelRequest = (requestId: string) => {
    setSent((prev) => prev.filter((req) => req.id !== requestId))
  }

  const renderIncomingRequest = (request: FriendRequest) => (
    <Card key={request.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={request.user.avatar || "/placeholder.svg"} />
            <AvatarFallback>
              {request.user.first_name[0]}
              {request.user.last_name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium">
                {request.user.first_name} {request.user.last_name}
              </h3>
              <span className="text-sm text-muted-foreground">@{request.user.username}</span>
            </div>

            {request.mutual_friends > 0 && (
              <p className="text-sm text-muted-foreground mb-2">
                {request.mutual_friends} mutual friend{request.mutual_friends !== 1 ? "s" : ""}
              </p>
            )}

            {request.message && (
              <div className="bg-background-secondary p-3 rounded-lg mb-3">
                <p className="text-sm">{request.message}</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
            </p>
          </div>

          <div className="flex space-x-2">
            <Button size="sm" onClick={() => acceptRequest(request.id)}>
              <UserCheck className="w-4 h-4 mr-1" />
              Accept
            </Button>
            <Button variant="outline" size="sm" onClick={() => declineRequest(request.id)}>
              <UserX className="w-4 h-4 mr-1" />
              Decline
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderSentRequest = (request: FriendRequest) => (
    <Card key={request.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={request.user.avatar || "/placeholder.svg"} />
            <AvatarFallback>
              {request.user.first_name[0]}
              {request.user.last_name[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium">
                {request.user.first_name} {request.user.last_name}
              </h3>
              <span className="text-sm text-muted-foreground">@{request.user.username}</span>
            </div>

            {request.mutual_friends > 0 && (
              <p className="text-sm text-muted-foreground mb-1">
                {request.mutual_friends} mutual friend{request.mutual_friends !== 1 ? "s" : ""}
              </p>
            )}

            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Sent {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => cancelRequest(request.id)}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Tabs defaultValue="incoming" className="space-y-6">
      <TabsList>
        <TabsTrigger value="incoming" className="flex items-center space-x-2">
          <UserCheck className="w-4 h-4" />
          <span>Incoming</span>
          {incoming.length > 0 && (
            <Badge variant="destructive" className="ml-1">
              {incoming.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="sent" className="flex items-center space-x-2">
          <Send className="w-4 h-4" />
          <span>Sent</span>
          {sent.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {sent.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="incoming" className="space-y-4">
        {incoming.length === 0 ? (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
              <p className="text-muted-foreground">You're all caught up! New friend requests will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Incoming Requests</h2>
              <Badge variant="secondary">{incoming.length}</Badge>
            </div>
            {incoming.map(renderIncomingRequest)}
          </div>
        )}
      </TabsContent>

      <TabsContent value="sent" className="space-y-4">
        {sent.length === 0 ? (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sent requests</h3>
              <p className="text-muted-foreground">Friend requests you send will be tracked here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sent Requests</h2>
              <Badge variant="secondary">{sent.length}</Badge>
            </div>
            {sent.map(renderSentRequest)}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
