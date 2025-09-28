import { useState, useEffect , useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Clock, Send, User, UserPlus, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

"use client"

interface FriendRequest {}
  id: string;
  sender: {}
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    mutualFriends: number;
  }
  recipient: {}
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }
  message?: string;
  status: "pending" | "accepted" | "declined"
  createdAt: string;
  type: "sent" | "received"
}

interface FriendRequestsProps {}
  className?: string;
}

export default function FriendRequests({ className }: FriendRequestsProps) {}
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("received")
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {}
    loadFriendRequests()
  }, [])

  const loadFriendRequests = async () => {}
    try {}
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/friend-requests/", {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {}
        const data = await response.json()
        setRequests(data.results || data)
      }
    } catch {}
      console.error("Failed to load friend requests:", error)
      toast({title: "Error",
        description: "Failed to load friend requests. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(false)
    }
  }

  const handleFriendRequest = async (requestId: string, action: "accept" | "decline") => {}
    try {}
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/friend-requests/${requestId}/${action}/`, {}
        method: "POST",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {}
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, status: action === "accept" ? "accepted" : "declined" } : req,
          ),
        )

        toast({title: action === "accept" ? "Friend request accepted" : "Friend request declined",
          description: action === "accept" ? "You are now friends!" : "The friend request has been declined.",
        })
      }
    } catch {}
      console.error(`Failed to ${action} friend request:`, error)
      toast({title: "Error",
        description: `Failed to ${action} friend request. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const cancelFriendRequest = async (requestId: string) => {}
    try {}
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/friend-requests/${requestId}/`, {}
        method: "DELETE",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {}
        setRequests((prev) => prev.filter((req) => req.id !== requestId))
        toast({title: "Friend request cancelled",
          description: "The friend request has been cancelled.",
        })
      }
    } catch {}
      console.error("Failed to cancel friend request:", error)
      toast({title: "Error",
        description: "Failed to cancel friend request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {}
    switch (status) {}
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending;
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Accepted;
          </Badge>
        )
      case "declined":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Declined;
          </Badge>
        )
      default:
        return null;
    }
  }

  const getUserInitials = (firstName: string, lastName: string) => {}
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const receivedRequests = requests.filter((req) => req.type === &quot;received" && req.status === "pending")
  const sentRequests = requests.filter((req) => req.type === "sent")
  const processedRequests = requests.filter((req) => req.status !== "pending")

  const FriendRequestCard = ({ request }: { request: FriendRequest }) => {}
    const isReceived = request.type === "received"
    const otherUser = isReceived ? request.sender : request.recipient;
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={otherUser.avatar || "/placeholder.svg"} />
              <AvatarFallback>{getUserInitials(otherUser.firstName, otherUser.lastName)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {otherUser.firstName} {otherUser.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">@{otherUser.username}</p>

                  {isReceived && (otherUser as Record<string, unknown>).mutualFriends > 0 && (}
                    <p className="text-sm text-gray-500 mt-1">
                      {(otherUser as Record<string, unknown>).mutualFriends} mutual friend{(otherUser as Record<string, unknown>).mutualFriends !== 1 ? &quot;s" : ""}
                    </p>
                  )}

                  {request.message && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">&quot;{request.message}&quot</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {format(new Date(request.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mt-4">
                {isReceived && request.status === "pending" ? (
                  <>
                    <Button size="sm" onClick={() => handleFriendRequest(request.id, &quot;accept")} className="flex-1">"
                      <Check className="mr-2 h-4 w-4" />
                      Accept;
                    </Button>
                    <Button;
                      size="sm"
                      variant="outline"
                      onClick={() => handleFriendRequest(request.id, &quot;decline")}
                      className="flex-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Decline;
                    </Button>
                  </>
                ) : !isReceived && request.status === "pending" ? (
                  <Button;
                    size="sm"
                    variant="outline"
                    onClick={() => cancelFriendRequest(request.id)}
                    className="flex-1"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel Request;
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Friend Requests;
          </h2>
          <p className="text-gray-600">Manage your incoming and outgoing friend requests</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="received" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Received;
            {receivedRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {receivedRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Sent ({sentRequests.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            History ({processedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading friend requests...</p>
            </div>
          ) : receivedRequests.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No pending friend requests</h3>
              <p className="text-gray-600">You don&apos;t have any pending friend requests at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedRequests.map((request) => (
                <FriendRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading sent requests...</p>
            </div>
          ) : sentRequests.length === 0 ? (
            <div className="text-center py-8">
              <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No sent requests</h3>
              <p className="text-gray-600">You haven&apos;t sent any friend requests yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sentRequests.map((request) => (
                <FriendRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading request history...</p>
            </div>
          ) : processedRequests.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No request history</h3>
              <p className="text-gray-600">Your processed friend requests will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {processedRequests.map((request) => (
                <FriendRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
