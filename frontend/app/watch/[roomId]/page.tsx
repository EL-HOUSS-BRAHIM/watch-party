"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VideoPlayer } from "@/components/video/video-player"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ParticipantList } from "@/components/party/participant-list"
import { PartyControls } from "@/components/party/party-controls"
import { useSocket } from "@/contexts/socket-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Users, MessageCircle, Settings, Share, Crown, Loader2 } from "lucide-react"

interface Party {
  id: string
  title: string
  description: string
  room_code: string
  host: {
    id: string
    name: string
    avatar?: string
  }
  video: {
    id: string
    title: string
    thumbnail?: string
    duration?: number
    source_url?: string
  }
  settings: {
    allow_chat: boolean
    allow_reactions: boolean
    sync_tolerance: number
  }
  participants: Array<{
    id: string
    user: {
      id: string
      name: string
      avatar?: string
    }
    role: string
    status: string
    joined_at: string
  }>
  visibility: string
  status: string
  can_join: boolean
  can_edit: boolean
}

export default function WatchPartyPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const { user } = useAuth()
  const { socket, isConnected, sendMessage, onMessage, joinRoom } = useSocket()
  const { toast } = useToast()

  const [party, setParty] = useState<Party | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showChat, setShowChat] = useState(true)
  const [showParticipants, setShowParticipants] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Check if current user is host
  const isHost = party?.participants.find(p => p.user.id === user?.id)?.role === 'host'

  // Fetch party data
  useEffect(() => {
    const fetchParty = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("accessToken")
        const response = await fetch(`/api/parties/${roomId}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const partyData = await response.json()
          setParty(partyData)
        } else if (response.status === 404) {
          setError("Party not found")
        } else if (response.status === 403) {
          setError("You don't have permission to view this party")
        } else {
          setError("Failed to load party")
        }
      } catch (error) {
        console.error("Failed to fetch party:", error)
        setError("Failed to load party")
        toast({
          title: "Error",
          description: "Failed to load party. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (roomId) {
      fetchParty()
    }
  }, [roomId, toast])

  useEffect(() => {
    if (!isConnected || !party || !user) return

    // Join the party room
    joinRoom(roomId)

    // Listen for party events
    const unsubscribe = onMessage((message) => {
      switch (message.type) {
        case "party:joined":
          console.log("Joined party:", message.data)
          break
        case "party:user_joined":
          setParty((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              participants: [...prev.participants, message.data],
            }
          })
          break
        case "party:user_left":
          setParty((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              participants: prev.participants.filter((p) => p.user.id !== message.data.userId),
            }
          })
          break
        case "party:updated":
          setParty(message.data)
          break
      }
    })

    return unsubscribe
  }, [isConnected, roomId, user?.id, party, joinRoom, onMessage])

  const toggleChat = () => setShowChat(!showChat)
  const toggleParticipants = () => setShowParticipants(!showParticipants)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading party...</p>
        </div>
      </div>
    )
  }

  if (error || !party) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Party Not Found</h1>
          <p className="text-muted-foreground mb-6">{error || "The party you're looking for doesn't exist."}</p>
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Party Header */}
      <header className="bg-background-secondary border-b border-border/40 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl font-bold font-display">{party.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Room: {party.room_code}</span>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{party.participants.length} watching</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-accent-success" : "bg-accent-error")} />
                  <span>{isConnected ? "Connected" : "Disconnected"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            {isHost && (
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Video Section */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="flex-1 p-6">
            <div className="h-full max-h-[70vh]">
              <VideoPlayer 
                src={party.video.source_url || ""} 
                roomId={roomId} 
                isHost={isHost} 
                className="w-full h-full" 
              />
            </div>
          </div>

          {/* Video Info */}
          <div className="px-6 pb-4">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{party.video.title}</h2>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <span>Hosted by {party.host.name}</span>
                      {isHost && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>Host</span>
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Party Controls */}
                  {isHost && <PartyControls partyId={roomId} />}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-border/40 bg-background-secondary flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border/40">
            <div className="flex items-center space-x-2">
              <Button
                variant={showParticipants ? "secondary" : "ghost"}
                size="sm"
                onClick={toggleParticipants}
                className="flex-1"
              >
                <Users className="w-4 h-4 mr-2" />
                Participants ({party.participants.length})
              </Button>
              <Button variant={showChat ? "secondary" : "ghost"} size="sm" onClick={toggleChat} className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat
              </Button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden">
            {showParticipants && (
              <ParticipantList
                participants={party.participants.map(p => ({
                  id: p.id,
                  user: {
                    id: p.user.id,
                    username: p.user.name,
                    avatar: p.user.avatar
                  },
                  is_host: p.role === 'host',
                  joined_at: p.joined_at,
                  permissions: {
                    can_control_video: p.role === 'host',
                    can_chat: true,
                    can_invite: p.role === 'host',
                    can_kick: p.role === 'host'
                  }
                }))}
                currentUserId={user?.id}
                isHost={isHost || false}
                className="h-full"
              />
            )}

            {showChat && party.settings.allow_chat && <ChatInterface roomId={roomId} className="h-full" />}
          </div>
        </div>
      </div>
    </div>
  )
}
