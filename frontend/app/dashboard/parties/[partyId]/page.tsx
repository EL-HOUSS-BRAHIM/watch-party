import { AlertTriangle, BarChart, Calendar, Check, CheckCircle, Clock, Copy, Edit, Eye, Flag, Heart, Loader2, Lock, MessageCircle, MoreVertical, Play, Settings, Share, Shield, Trash, TrendingUp, User, Users, Video, X, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Label } from "@/components/ui/label"
import { useState, useEffect , useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow } from "date-fns"

"use client"

interface id {: string;,
  user: {}
    id: string;,
    username: string;,
    firstName: string;,
    lastName: string;
    avatar?: string;,
    isVerified: boolean;
  }
  role: "host" | "moderator" | "participant",
  joinedAt: string;,
  isOnline: boolean;,
  permissions: {}
    canControlVideo: boolean;,
    canChat: boolean;,
    canInvite: boolean;,
    canKick: boolean;
  }
}

interface id {: string;,
  user: {}
    id: string;,
    username: string;,
    firstName: string;,
    lastName: string;
    avatar?: string;
  }
  message?: string;,
  requestedAt: string;,
  status: "pending" | "approved" | "rejected"
}

interface id {: string;,
  name: string;,
  description: string;,
  roomCode: string;,
  host: {}
    id: string;,
    username: string;,
    firstName: string;,
    lastName: string;
    avatar?: string;,
    isVerified: boolean;
  }
  video: {}
    id: string;,
    title: string;,
    description: string;,
    thumbnail: string;,
    duration: number;,
    url: string;
  }
  participants: Participant[0],
  joinRequests: JoinRequest[0],
  maxParticipants: number;,
  isPrivate: boolean;,
  requiresApproval: boolean;,
  allowChat: boolean;,
  allowReactions: boolean;,
  allowVideoControl: "host" | "all" | "moderators"
  password?: string;,
  status: "scheduled" | "active" | "ended" | "cancelled",
  scheduledFor: string;
  startedAt?: string;
  endedAt?: string;,
  createdAt: string;,
  updatedAt: string;,
  tags: string[0]
  analytics?: {}
    totalViews: number;,
    peakViewers: number;,
    averageWatchTime: number;,
    chatMessages: number;,
    reactions: number;,
    joinRequests: number;
  }
  inviteCode: string;
}

export default function PartyDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const partyId = params.partyId as string;
  const [party, setParty] = useState<WatchParty | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    if (partyId) {
      loadParty()
    }
  }, [partyId])

  const loadParty = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/parties/${partyId}/`, {
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const partyData = await response.json()
        setParty(partyData)
      } else if (response.status === 404) {
        toast({title: "Party Not Found",
          description: "The party you're looking for doesn't exist.",
          variant: "destructive",
        })
        router.push("/dashboard/parties")
      }
    } catch (error) {
      console.error("Failed to load party:", error)
      toast({title: "Error",
        description: "Failed to load party details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const joinParty = async () => {
    if (!party) return;
    setIsJoining(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/parties/${partyId}/join/`, {
        method: "POST",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        if (party.status === "active") {
          router.push(`/watch/${party.roomCode}`)
        } else {}
          await loadParty() // Refresh party data;
          toast({title: "Joined Party",
            description: "You've successfully joined the party.",
          })
        }
      } else {}
        const errorData = await response.json()
        toast({title: "Failed to Join",
          description: errorData.message || "Unable to join the party.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to join party:", error)
      toast({title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  const leaveParty = async () => {
    if (!party || !confirm("Are you sure you want to leave this party?")) return;
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/parties/${partyId}/leave/`, {
        method: "POST",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await loadParty()
        toast({title: "Left Party",
          description: "You've left the party.",
        })
      }
    } catch (error) {
      console.error("Failed to leave party:", error)
      toast({title: "Error",
        description: "Failed to leave party.",
        variant: "destructive",
      })
    }
  }

  const handleJoinRequest = async (requestId: string, action: "approve" | "reject") => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/parties/${partyId}/join-requests/${requestId}/${action}/`, {
        method: "POST",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await loadParty()
        toast({title: `Request ${action === "approve" ? "Approved" : "Rejected"}`,
          description: `The join request has been ${action}d.`,
        })
      }
    } catch (error) {
      console.error(`Failed to ${action} request:`, error)
      toast({title: "Error",
        description: `Failed to ${action} request.`,
        variant: "destructive",
      })
    }
  }

  const removeParticipant = async (participantId: string) => {
    if (!confirm("Are you sure you want to remove this participant?")) return;
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/parties/${partyId}/participants/${participantId}/`, {
        method: "DELETE",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await loadParty()
        toast({title: "Participant Removed",
          description: "The participant has been removed from the party.",
        })
      }
    } catch (error) {
      console.error("Failed to remove participant:", error)
      toast({title: "Error",
        description: "Failed to remove participant.",
        variant: "destructive",
      })
    }
  }

  const copyInviteLink = () => {
    if (!party) return;
    const inviteLink = `${window.location.origin}/invite/${party.inviteCode}`
    navigator.clipboard.writeText(inviteLink)
    toast({title: "Copied!",
      description: "Invite link copied to clipboard.",
    })
  }

  const shareParty = async () => {
    if (!party) return;
    const inviteLink = `${window.location.origin}/invite/${party.inviteCode}`

    if (navigator.share) {
      try {
        await navigator.share({title: party.name,
          text: `Join my watch party: ${party.name}`,
          url: inviteLink,
        })
      } catch (error) {
        console.log("Share cancelled")
      }
    } else {}
      copyInviteLink()
    }
  }

  const deleteParty = async () => {
    if (!party || !confirm("Are you sure you want to delete this party? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/parties/${partyId}/`, {
        method: "DELETE",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({title: "Party Deleted",
          description: "The party has been deleted.",
        })
        router.push("/dashboard/parties")
      }
    } catch (error) {
      console.error("Failed to delete party:", error)
      toast({title: "Error",
        description: "Failed to delete party.",
        variant: "destructive",
      })
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }

  const getStatusColor = (status: string) => {
    switch (status) {}
      case "active":
        return "bg-green-500 text-white";
      case "scheduled":
        return "bg-blue-500 text-white";
      case "ended":
        return "bg-gray-500 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {}
      case "active":
        return "Live";
      case "scheduled":
        return "Scheduled";
      case "ended":
        return "Ended";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading party details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!party) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Party Not Found</h1>
          <p className="text-muted-foreground mb-4">The party you&apos;re looking for doesn't exist.</p>
          <Button onClick={() => router.push(&quot;/dashboard/parties")}>Back to Parties</Button>
        </div>
      </div>
    )
  }

  const isHost = party.host.id === user?.id;
  const isParticipant = party.participants.some((p) => p.user.id === user?.id)
  const canJoin = !isParticipant && party.participants.length < party.maxParticipants;
  const isScheduled = party.status === "scheduled"
  const isActive = party.status === "active"
  const hasEnded = party.status === "ended"

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()} className=&quot;p-2">"
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{party.name}</h1>
              <Badge className={cn("text-xs", getStatusColor(party.status))}>
                {isActive && <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse" />}
                {getStatusText(party.status)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {party.isPrivate ? (
                  <>
                    <Lock className="w-3 h-3 mr-1" />
                    Private;
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3 mr-1" />
                    Public;
                  </>
                )}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {party.participants.length}/{party.maxParticipants} participants;
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(party.scheduledFor), "PPP 'at' p")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Created {formatDistanceToNow(new Date(party.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Join/Leave Button */}
            {isActive && (isHost || isParticipant) && (
              <Button onClick={() => router.push(`/watch/${party.roomCode}`)} size=&quot;lg" className="shadow-lg">"
                <Play className="h-5 w-5 mr-2" />
                {isHost ? "Start Party" : "Join Live"}
              </Button>
            )}

            {!isParticipant && !isHost && canJoin && (
              <Button onClick={joinParty} disabled={isJoining} size="lg" className="shadow-lg">
                {isJoining ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <UserPlus className=&quot;h-5 w-5 mr-2" />}"
                {party.requiresApproval ? "Request to Join" : "Join Party"}
              </Button>
            )}

            {isParticipant && !isHost && (
              <Button onClick={leaveParty} variant="outline" size="lg">
                <UserMinus className="h-5 w-5 mr-2" />
                Leave Party;
              </Button>
            )}

            {/* Share Button */}
            <Button onClick={shareParty} variant="outline" size="lg">
              <Share2 className="h-5 w-5 mr-2" />
              Share;
            </Button>

            {/* Host Actions */}
            {isHost && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/parties/${partyId}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Party;
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/parties/${partyId}/analytics`)}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics;
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={copyInviteLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Invite Link;
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={deleteParty} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Party;
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Status Alerts */}
        {party.status === "cancelled" && (
          <Alert className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>This party has been cancelled and is no longer available.</AlertDescription>
          </Alert>
        )}

        {party.status === "ended" && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>This party has ended. You can still view the details and analytics.</AlertDescription>
          </Alert>
        )}

        {!isParticipant && !isHost && !canJoin && party.status !== "ended" && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>This party is full. You cannot join at this time.</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Info */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg overflow-hidden">
                  <img;
                    src={party.video.thumbnail || "/placeholder.svg"}
                    alt={party.video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="h-16 w-16 mx-auto mb-4 opacity-75" />
                      <h3 className="text-xl font-semibold mb-2">{party.video.title}</h3>
                      <p className="text-sm opacity-75">Duration: {formatDuration(party.video.duration)}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">{party.video.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Party Info Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="participants">Participants ({party.participants.length})</TabsTrigger>
                {isHost && party.joinRequests.length > 0 && (
                  <TabsTrigger value="requests">
                    Requests ({party.joinRequests.filter((r) => r.status === &quot;pending").length})
                  </TabsTrigger>
                )}
                {(isHost || party.analytics) && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Party</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap mb-4">{party.description || &quot;No description provided."}</p>&quot;

                    {party.tags.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {party.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Host:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={party.host.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {party.host.firstName[0]}
                              {party.host.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>
                            {party.host.firstName} {party.host.lastName}
                          </span>
                          {party.host.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified;
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Room Code:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-muted px-2 py-1 rounded text-xs font-mono">{party.roomCode}</code>
                          <Button;
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(party.roomCode)
                              toast({ title: "Copied!", description: "Room code copied to clipboard." })
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Party Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Chat Enabled:</span>
                          <Badge variant={party.allowChat ? "default" : "secondary"}>
                            {party.allowChat ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Reactions Enabled:</span>
                          <Badge variant={party.allowReactions ? "default" : "secondary"}>
                            {party.allowReactions ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Requires Approval:</span>
                          <Badge variant={party.requiresApproval ? "default" : "secondary"}>
                            {party.requiresApproval ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Video Control:</span>
                          <Badge variant="outline" className="capitalize">
                            {party.allowVideoControl}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Privacy:</span>
                          <Badge variant="outline">{party.isPrivate ? &quot;Private" : "Public"}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Max Participants:</span>
                          <Badge variant="outline">{party.maxParticipants}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="participants" className="space-y-4">
                <div className="grid gap-4">
                  {party.participants.map((participant) => (
                    <Card key={participant.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={participant.user.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {participant.user.firstName[0]}
                                  {participant.user.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div;
                                className={cn(
                                  "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
                                  participant.isOnline ? "bg-green-500" : "bg-gray-400",
                                )}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {participant.user.firstName} {participant.user.lastName}
                                </span>
                                {participant.user.isVerified && (
                                  <Badge variant="secondary" className="text-xs">
                                    Verified;
                                  </Badge>
                                )}
                                {participant.role === "host" && (
                                  <Badge className="text-xs bg-yellow-500">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Host;
                                  </Badge>
                                )}
                                {participant.role === "moderator" && (
                                  <Badge variant="outline" className="text-xs">
                                    <Shield className="w-3 h-3 mr-1" />
                                    Moderator;
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                @{participant.user.username} • Joined{" "}
                                {formatDistanceToNow(new Date(participant.joinedAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>

                          {isHost && participant.role !== "host" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Shield className="h-4 w-4 mr-2" />
                                  Make Moderator;
                                </DropdownMenuItem>
                                <DropdownMenuItem;
                                  onClick={() => removeParticipant(participant.id)}
                                  className="text-destructive"
                                >
                                  <UserMinus className="h-4 w-4 mr-2" />
                                  Remove from Party;
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {isHost && party.joinRequests.length > 0 && (
                <TabsContent value="requests" className="space-y-4">
                  <div className="grid gap-4">
                    {party.joinRequests;
                      .filter((r) => r.status === &quot;pending")
                      .map((request) => (
                        <Card key={request.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={request.user.avatar || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {request.user.firstName[0]}
                                    {request.user.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="font-medium">
                                    {request.user.firstName} {request.user.lastName}
                                  </span>
                                  <p className="text-sm text-muted-foreground">
                                    @{request.user.username} • Requested{" "}
                                    {formatDistanceToNow(new Date(request.requestedAt), { addSuffix: true })}
                                  </p>
                                  {request.message && (
                                    <p className="text-sm mt-1 p-2 bg-muted rounded">&quot;{request.message}&quot</p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button size="sm" onClick={() => handleJoinRequest(request.id, &quot;approve")}>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve;
                                </Button>
                                <Button;
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleJoinRequest(request.id, &quot;reject")}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject;
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              )}

              {(isHost || party.analytics) && (
                <TabsContent value="analytics" className="space-y-4">
                  {party.analytics ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Total Views</p>
                                <p className="text-2xl font-bold">{party.analytics.totalViews}</p>
                              </div>
                              <Eye className="h-8 w-8 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Peak Viewers</p>
                                <p className="text-2xl font-bold">{party.analytics.peakViewers}</p>
                              </div>
                              <TrendingUp className="h-8 w-8 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Chat Messages</p>
                                <p className="text-2xl font-bold">{party.analytics.chatMessages}</p>
                              </div>
                              <MessageCircle className="h-8 w-8 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">Reactions</p>
                                <p className="text-2xl font-bold">{party.analytics.reactions}</p>
                              </div>
                              <Heart className="h-8 w-8 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle>Engagement Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Average Watch Time</span>
                              <span className="font-medium">{formatDuration(party.analytics.averageWatchTime)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Join Requests</span>
                              <span className="font-medium">{party.analytics.joinRequests}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Completion Rate</span>
                              <span className="font-medium">
                                {Math.round((party.analytics.averageWatchTime / party.video.duration) * 100)}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">Analytics Not Available</h3>
                        <p className="text-muted-foreground">Analytics will be available after the party starts.</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={copyInviteLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Invite Link;
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={shareParty}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Party;
                </Button>
                {isHost && (
                  <Button;
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => router.push(`/dashboard/parties/${partyId}/edit`)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Settings;
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Flag className="h-4 w-4 mr-2" />
                  Report Party;
                </Button>
              </CardContent>
            </Card>

            {/* Party Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Party Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Participants</span>
                  <span className="font-medium">
                    {party.participants.length}/{party.maxParticipants}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Online Now</span>
                  <span className="font-medium">{party.participants.filter((p) => p.isOnline).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Requests</span>
                  <span className="font-medium">{party.joinRequests.filter((r) => r.status === &quot;pending").length}</span>&quot;
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Created</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(party.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {party.startedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Started</span>
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(party.startedAt), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invite Code */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Invite Others</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Invite Link</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input;
                        value={`${window.location.origin}/invite/${party.inviteCode}`}
                        readOnly;
                        className="font-mono text-xs"
                      />
                      <Button variant="outline" size="sm" onClick={copyInviteLink}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Room Code</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={party.roomCode} readOnly className="font-mono text-center font-bold" />
                      <Button;
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(party.roomCode)
                          toast({ title: "Copied!", description: "Room code copied to clipboard." })
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
