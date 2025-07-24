"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VideoPlayer } from "@/components/video/video-player"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ParticipantList } from "@/components/party/participant-list"
import { PartyControls } from "@/components/party/party-controls"
import { useSocket } from "@/contexts/socket-context"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Users, MessageCircle, Settings, Share, Crown } from "lucide-react"

// Mock party data
const mockParty = {
  id: "1",
  title: "Friday Movie Night",
  description: "Watching the latest Marvel movie together",
  room_code: "MARVEL123",
  host: {
    id: "host-1",
    username: "sarah_j",
    avatar: "/placeholder.svg?height=32&width=32",
    name: "Sarah Johnson",
  },
  video: {
    id: "video-1",
    title: "Spider-Man: No Way Home",
    src: "/placeholder-video.mp4",
    thumbnail: "/placeholder.svg?height=400&width=600",
    duration: 8880, // 2h 28m in seconds
  },
  settings: {
    allow_chat: true,
    allow_reactions: true,
    sync_tolerance: 2,
  },
  participants: [
    {
      id: "host-1",
      user: {
        id: "host-1",
        username: "sarah_j",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      is_host: true,
      joined_at: new Date().toISOString(),
      permissions: {
        can_control_video: true,
        can_chat: true,
        can_invite: true,
        can_kick: true,
      },
    },
    {
      id: "user-2",
      user: {
        id: "user-2",
        username: "mike_c",
        avatar: "/placeholder.svg?height=32&width=32",
      },
      is_host: false,
      joined_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      permissions: {
        can_control_video: false,
        can_chat: true,
        can_invite: false,
        can_kick: false,
      },
    },
  ],
}

export default function WatchPartyPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const { user } = useAuth()
  const { socket, isConnected } = useSocket(`/party/${roomId}`)

  const [party, setParty] = useState(mockParty)
  const [showChat, setShowChat] = useState(true)
  const [showParticipants, setShowParticipants] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentUser, setCurrentUser] = useState(party.participants[0])

  // Check if current user is host
  const isHost = currentUser?.is_host || false

  useEffect(() => {
    if (!socket) return

    // Join the party room
    socket.emit("party:join", { roomId, userId: user?.id })

    // Listen for party events
    socket.on("party:joined", (data) => {
      console.log("Joined party:", data)
    })

    socket.on("party:user_joined", (participant) => {
      setParty((prev) => ({
        ...prev,
        participants: [...prev.participants, participant],
      }))
    })

    socket.on("party:user_left", (userId) => {
      setParty((prev) => ({
        ...prev,
        participants: prev.participants.filter((p) => p.user.id !== userId),
      }))
    })

    return () => {
      socket.off("party:joined")
      socket.off("party:user_joined")
      socket.off("party:user_left")
    }
  }, [socket, roomId, user?.id])

  const toggleChat = () => setShowChat(!showChat)
  const toggleParticipants = () => setShowParticipants(!showParticipants)

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
              <VideoPlayer src={party.video.src} partyId={roomId} isHost={isHost} className="w-full h-full" />
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
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <Crown className="w-3 h-3" />
                        <span>Host</span>
                      </Badge>
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
                participants={party.participants}
                currentUserId={user?.id}
                isHost={isHost}
                className="h-full"
              />
            )}

            {showChat && party.settings.allow_chat && <ChatInterface partyId={roomId} className="h-full" />}
          </div>
        </div>
      </div>
    </div>
  )
}
