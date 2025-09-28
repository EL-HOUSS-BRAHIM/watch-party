"use client"

import { useState, useEffect, Suspense } from "react"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { partiesAPI } from "@/lib/api"
import {
  Users,
  Calendar,
  Clock,
  Lock,
  Globe,
  Film,
  Tv,
  Play,
  UserPlus,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Share2,
  MessageCircle,
  Star,
  Timer,
  Eye,
  Heart,
  Loader2,
  ArrowRight,
  PartyPopper,
  Shield,
  AlertTriangle
} from "lucide-react"
import { formatDistanceToNow, format, parseISO } from "date-fns"

interface PartyInvite {
  id: string
  title: string
  description?: string
  scheduled_for?: string
  is_public: boolean
  max_participants?: number
  current_participants: number
  status: "scheduled" | "active" | "completed" | "cancelled"
  video: {
    id: string
    title: string
    thumbnail?: string
    duration_minutes: number
    type: "movie" | "series" | "youtube"
    description?: string
    release_year?: number
    genre?: string[]
  }
  host: {
    id: string
    username: string
    first_name: string
    last_name: string
    avatar?: string
    is_verified?: boolean
  }
  participants: Array<{
    id: string
    user: {
      id: string
      username: string
      first_name: string
      last_name: string
      avatar?: string
    }
    joined_at: string
  }>
  invite_code: string
  requires_approval: boolean
  allow_chat: boolean
  allow_reactions: boolean
  created_at: string
  user_can_join: boolean
  user_is_participant: boolean
  user_is_host: boolean
  join_deadline?: string
}

function QuickInviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [party, setParty] = useState<PartyInvite | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requiresLogin, setRequiresLogin] = useState(false)

  const inviteCode = searchParams.get("code")

  useEffect(() => {
    if (inviteCode) {
      loadPartyInvite()
    } else {
      setError("No invite code provided")
      setIsLoading(false)
    }
  }, [inviteCode])

  const loadPartyInvite = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const headers: Record<string, string> = {}
      
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`/api/parties/invite/${inviteCode}/`, {
        headers
      })

      if (response.ok) {
        const partyData = await response.json()
        setParty(partyData)
        
        // Check if user needs to log in
        if (!isAuthenticated && !partyData.is_public) {
          setRequiresLogin(true)
        }
      } else if (response.status === 404) {
        setError("This invite link is invalid or has expired")
      } else if (response.status === 403) {
        setError("You don't have permission to view this party")
      } else {
        setError("Failed to load party details")
      }
    } catch (error) {
      console.error("Failed to load party invite:", error)
      setError("Something went wrong while loading the invite")
    } finally {
      setIsLoading(false)
    }
  }

  const joinParty = async () => {
    if (!isAuthenticated) {
      setRequiresLogin(true)
      return
    }

    if (!party) return

    setIsJoining(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/parties/${party.id}/join/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ invite_code: inviteCode }),
      })

      if (response.ok) {
        toast({
          title: "Successfully Joined! 🎉",
          description: "You've joined the watch party. Redirecting...",
        })
        
        // Redirect to party room
        router.push(`/watch/${party.id}`)
      } else {
        const errorData = await response.json()
        let errorMessage = "Failed to join the party"
        
        if (response.status === 409) {
          errorMessage = "You're already a member of this party"
        } else if (response.status === 403) {
          errorMessage = "This party requires approval from the host"
        } else if (response.status === 400) {
          errorMessage = errorData.message || "Party is full or no longer accepting participants"
        }
        
        toast({
          title: "Cannot Join Party",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Join party error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  const shareInvite = async () => {
    const shareUrl = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join "${party?.title}" on Watch Party`,
          text: `Watch ${party?.video.title} together!`,
          url: shareUrl,
        })
      } catch (error) {
        // User cancelled sharing or share failed
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Link Copied",
          description: "Invite link copied to clipboard!",
        })
      } catch (error) {
        toast({
          title: "Share Failed",
          description: "Unable to copy link to clipboard.",
          variant: "destructive",
        })
      }
    }
  }

  const getVideoTypeIcon = (type: string) => {
    switch (type) {
      case "movie":
        return <Film className="h-5 w-5" />
      case "series":
        return <Tv className="h-5 w-5" />
      case "youtube":
        return <Play className="h-5 w-5" />
      default:
        return <Film className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const canJoinParty = () => {
    if (!party) return false
    if (party.user_is_participant) return false
    if (party.status === "completed" || party.status === "cancelled") return false
    if (party.max_participants && party.current_participants >= party.max_participants) return false
    if (party.join_deadline && new Date() > parseISO(party.join_deadline)) return false
    return party.user_can_join
  }

  const getJoinButtonText = () => {
    if (!isAuthenticated) return "Sign In to Join"
    if (party?.user_is_participant) return "Already Joined"
    if (party?.user_is_host) return "You're the Host"
    if (party?.status === "active") return "Join Now"
    if (party?.status === "scheduled") return "Join Party"
    if (party?.status === "completed") return "Party Ended"
    if (party?.status === "cancelled") return "Party Cancelled"
    return "Join Party"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading invite details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardContent className="pt-6">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Invite Not Found</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => router.push(&quot;/discover")}>
                Browse Public Parties
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (requiresLogin && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Shield className="h-6 w-6" />
                Sign In Required
              </CardTitle>
              <CardDescription>
                You need to sign in to join this private watch party
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <PartyPopper className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">
                  This party is waiting for you! Sign in to join the fun.
                </p>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}>
                  Sign In
                </Button>
                <Button variant="outline" onClick={() => router.push(&quot;/register")}>
                  Sign Up
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!party) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Invite Header */}
          <div className="text-center mb-8">
            <PartyPopper className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">You&apos;re Invited!</h1>
            <p className="text-gray-600">Join this awesome watch party</p>
          </div>

          {/* Party Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{party.title}</CardTitle>
                  <CardDescription>{party.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(party.status)}>
                    {party.status === "active" ? "Live Now" : party.status}
                  </Badge>
                  {party.is_public ? (
                    <Globe className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Video Info */}
              <div className="flex items-start gap-4">
                <div className="w-24 h-36 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  {party.video.thumbnail ? (
                    <img
                      src={party.video.thumbnail}
                      alt={party.video.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    getVideoTypeIcon(party.video.type)
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{party.video.title}</h3>
                  {party.video.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{party.video.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      {formatDuration(party.video.duration_minutes)}
                    </span>
                    {party.video.release_year && (
                      <span>{party.video.release_year}</span>
                    )}
                    {party.video.genre && party.video.genre.length > 0 && (
                      <span>{party.video.genre.slice(0, 2).join(&quot;, ")}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Party Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    Participants
                  </span>
                  <span>
                    {party.current_participants}
                    {party.max_participants && ` / ${party.max_participants}`}
                  </span>
                </div>

                {party.scheduled_for && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      Scheduled
                    </span>
                    <span>{format(parseISO(party.scheduled_for), &quot;MMM d, yyyy &apos;at' h:mm a")}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    Created
                  </span>
                  <span>{formatDistanceToNow(parseISO(party.created_at), { addSuffix: true })}</span>
                </div>

                {party.join_deadline && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600">
                      <AlertTriangle className="h-4 w-4" />
                      Join Deadline
                    </span>
                    <span className="text-orange-600">
                      {format(parseISO(party.join_deadline), "MMM d 'at' h:mm a")}
                    </span>
                  </div>
                )}
              </div>

              {/* Host Info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={party.host.avatar} />
                  <AvatarFallback>
                    {party.host.first_name?.[0] || party.host.username?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {party.host.first_name || party.host.username}
                    {party.host.is_verified && (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Party Host</p>
                </div>
              </div>

              {/* Party Features */}
              {(party.allow_chat || party.allow_reactions || party.requires_approval) && (
                <div className="flex flex-wrap gap-2">
                  {party.allow_chat && (
                    <Badge variant="outline" className="text-xs">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      Chat Enabled
                    </Badge>
                  )}
                  {party.allow_reactions && (
                    <Badge variant="outline" className="text-xs">
                      <Heart className="h-3 w-3 mr-1" />
                      Reactions Enabled
                    </Badge>
                  )}
                  {party.requires_approval && (
                    <Badge variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Requires Approval
                    </Badge>
                  )}
                </div>
              )}

              {/* Participants Preview */}
              {party.participants.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Participants ({party.participants.length})</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {party.participants.slice(0, 5).map((participant) => (
                        <Avatar key={participant.id} className="w-8 h-8 border-2 border-white">
                          <AvatarImage src={participant.user.avatar} />
                          <AvatarFallback className="text-xs">
                            {participant.user.first_name?.[0] || participant.user.username?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    {party.participants.length > 5 && (
                      <span className="text-sm text-gray-500">
                        +{party.participants.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Warning messages */}
              {party.max_participants && party.current_participants >= party.max_participants && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This party is full. You can still request to join in case someone leaves.
                  </AlertDescription>
                </Alert>
              )}

              {party.requires_approval && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    This party requires host approval. Your request will be reviewed before you can join.
                  </AlertDescription>
                </Alert>
              )}

              {party.status === "active" && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    This party is live now! Join to start watching immediately.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={joinParty}
              disabled={!canJoinParty() || isJoining || party.user_is_participant || party.user_is_host}
              className="flex-1"
              size="lg"
            >
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  {getJoinButtonText()}
                  {canJoinParty() && party.status === "active" && (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={shareInvite} size="lg">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              New to Watch Party?{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => router.push(&quot;/register")}>
                Create your free account
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function QuickInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading invite details...</p>
        </div>
      </div>
    }>
      <QuickInviteContent />
    </Suspense>
  )
}
