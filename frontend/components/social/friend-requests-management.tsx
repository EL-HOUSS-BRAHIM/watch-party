"use client"

import { useState, useEffect } from "react"
import { UserPlus, UserCheck, UserX, Clock, Mail, Calendar, MapPin, Star, Loader2, Users, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { formatDistanceToNow } from "date-fns"

interface FriendRequest {
  id: string
  sender: {
    id: string
    username: string
    firstName: string
    lastName: string
    email: string
    avatar?: string
    bio?: string
    location?: string
    isOnline: boolean
    joinedDate: string
    stats: {
      partiesHosted: number
      partiesJoined: number
      friendsCount: number
    }
  }
  recipient: {
    id: string
    username: string
    firstName: string
    lastName: string
  }
  createdAt: string
  message?: string
  mutualFriends: number
  requestType: "received" | "sent"
}

interface FriendRequestsManagementProps {
  className?: string
}

export default function FriendRequestsManagement({ className }: FriendRequestsManagementProps) {
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set())
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      
      // Load received requests
      const receivedResponse = await fetch("/api/users/friends/requests/received/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Load sent requests
      const sentResponse = await fetch("/api/users/friends/requests/sent/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (receivedResponse.ok && sentResponse.ok) {
        const receivedData = await receivedResponse.json()
        const sentData = await sentResponse.json()
        
        setReceivedRequests(receivedData.requests || [])
        setSentRequests(sentData.requests || [])
      }
    } catch (error) {
      console.error("Failed to load friend requests:", error)
      toast({
        title: "Failed to load requests",
        description: "Please try refreshing the page",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const acceptRequest = async (requestId: string) => {
    setProcessingRequests(prev => new Set(prev).add(requestId))

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/friends/requests/${requestId}/accept/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setReceivedRequests(prev => prev.filter(req => req.id !== requestId))
        toast({
          title: "Friend request accepted",
          description: "You are now friends!",
        })
      } else {
        throw new Error("Failed to accept request")
      }
    } catch (error) {
      console.error("Failed to accept request:", error)
      toast({
        title: "Failed to accept request",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }
  }

  const rejectRequest = async (requestId: string) => {
    setProcessingRequests(prev => new Set(prev).add(requestId))

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/friends/requests/${requestId}/reject/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setReceivedRequests(prev => prev.filter(req => req.id !== requestId))
        toast({
          title: "Friend request rejected",
          description: "The request has been declined",
        })
      } else {
        throw new Error("Failed to reject request")
      }
    } catch (error) {
      console.error("Failed to reject request:", error)
      toast({
        title: "Failed to reject request",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }
  }

  const cancelRequest = async (requestId: string) => {
    setProcessingRequests(prev => new Set(prev).add(requestId))

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/friends/requests/${requestId}/cancel/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setSentRequests(prev => prev.filter(req => req.id !== requestId))
        toast({
          title: "Friend request cancelled",
          description: "Your request has been cancelled",
        })
      } else {
        throw new Error("Failed to cancel request")
      }
    } catch (error) {
      console.error("Failed to cancel request:", error)
      toast({
        title: "Failed to cancel request",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
      setRequestToDelete(null)
    }
  }

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
  }

  const ReceivedRequestCard = ({ request }: { request: FriendRequest }) => {
    const isProcessing = processingRequests.has(request.id)
    const { sender } = request

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={sender.avatar} />
                <AvatarFallback>{getUserInitials(sender.firstName, sender.lastName)}</AvatarFallback>
              </Avatar>
              {sender.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">
                    {sender.firstName} {sender.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">@{sender.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => rejectRequest(request.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <UserX className="h-3 w-3 mr-1" />
                    )}
                    Decline
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => acceptRequest(request.id)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <UserCheck className="h-3 w-3 mr-1" />
                    )}
                    Accept
                  </Button>
                </div>
              </div>

              {sender.bio && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{sender.bio}</p>
              )}

              {request.message && (
                <div className="bg-muted/50 rounded-lg p-3 mb-2">
                  <p className="text-sm italic">"{request.message}"</p>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                {sender.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {sender.location}
                  </div>
                )}
                {request.mutualFriends > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {request.mutualFriends} mutual friends
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined {formatDistanceToNow(new Date(sender.joinedDate), { addSuffix: true })}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{sender.stats.partiesHosted} parties hosted</span>
                  <span>{sender.stats.partiesJoined} parties joined</span>
                  <span>{sender.stats.friendsCount} friends</span>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const SentRequestCard = ({ request }: { request: FriendRequest }) => {
    const isProcessing = processingRequests.has(request.id)
    const { recipient } = request

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{getUserInitials(recipient.firstName, recipient.lastName)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium">
                    {recipient.firstName} {recipient.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">@{recipient.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Pending
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setRequestToDelete(request.id)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Sent {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading friend requests...</span>
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
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Friend Requests
            {(receivedRequests.length > 0 || sentRequests.length > 0) && (
              <Badge variant="secondary">
                {receivedRequests.length + sentRequests.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="received" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="received" className="relative">
                Received
                {receivedRequests.length > 0 && (
                  <Badge variant="destructive" className="ml-2 text-xs">
                    {receivedRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="relative">
                Sent
                {sentRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {sentRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="space-y-4">
              {receivedRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending friend requests</p>
                  <p className="text-sm">When someone sends you a friend request, it will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedRequests.map((request) => (
                    <ReceivedRequestCard key={request.id} request={request} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sent" className="space-y-4">
              {sentRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No sent requests</p>
                  <p className="text-sm">Friend requests you send will appear here until they're responded to</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <SentRequestCard key={request.id} request={request} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Cancel Request Confirmation Dialog */}
      <AlertDialog open={!!requestToDelete} onOpenChange={() => setRequestToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Friend Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this friend request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Request</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => requestToDelete && cancelRequest(requestToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
