"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface Participant {
  id: string
  user: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
    isVerified: boolean
  }
  role: "host" | "moderator" | "participant"
  joinedAt: string
  isOnline: boolean
  isMuted: boolean
  hasVideo: boolean
  reactions: {
    hearts: number
    likes: number
  }
}

interface ChatMessage {
  id: string
  user: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
  }
  message: string
  timestamp: string
  type: "message" | "system" | "reaction"
  reactions?: {
    hearts: number
    likes: number
    userReacted?: "heart" | "like" | null
  }
}

interface Party {
  id: string
  title: string
  description?: string
  video: {
    id: string
    title: string
    url: string
    thumbnail?: string
    duration: number
  }
  host: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
  }
  status: "waiting" | "playing" | "paused" | "ended"
  currentTime: number
  scheduledFor: string
  startedAt?: string
  endedAt?: string
  isPrivate: boolean
  maxParticipants: number
  settings: {
    allowChat: boolean
    allowReactions: boolean
    allowParticipantControls: boolean
    requireApproval: boolean
  }
}

interface SyncState {
  isPlaying: boolean
  currentTime: number
  playbackRate: number
  lastUpdate: string
}

export default function WatchRoomPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  const roomId = params.roomId as string

  const [party, setParty] = useState<Party | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [syncState, setSyncState] = useState<SyncState>({
    isPlaying: false,
    currentTime: 0,
    playbackRate: 1,
    lastUpdate: new Date().toISOString(),
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [showParticipants, setShowParticipants] = useState(true)
  const [showChat, setShowChat] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [isHost, setIsHost] = useState(false)
  const [userRole, setUserRole] = useState<"host" | "moderator" | "participant">(&quot;participant&quot;)

  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    loadPartyData()
    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [roomId])

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatMessages])

  const loadPartyData = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/parties/${roomId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const partyData = await response.json()
        setParty(partyData)
        setIsHost(partyData.host.id === user?.id)

        const participant = partyData.participants?.find((p: unknown) => p.user.id === user?.id)
        setUserRole(participant?.role || "participant")
      } else {
        throw new Error("Failed to load party data")
      }
    } catch {
      console.error("Failed to load party:", error)
      // Mock data for demonstration
      setParty({
        id: roomId,
        title: "Friday Night Movie Club",
        description: "Weekly gathering for movie enthusiasts",
        video: {
          id: "1",
          title: "The Matrix",
          url: "/placeholder.mp4",
          thumbnail: "/placeholder.jpg",
          duration: 8160,
        },
        host: {
          id: "host1",
          username: "moviemaster",
          firstName: "John",
          lastName: "Doe",
          avatar: "/placeholder-user.jpg",
        },
        status: "playing",
        currentTime: 1200,
        scheduledFor: new Date().toISOString(),
        isPrivate: false,
        maxParticipants: 50,
        settings: {
          allowChat: true,
          allowReactions: true,
          allowParticipantControls: false,
          requireApproval: false,
        },
      })

      setParticipants([
        {
          id: "1",
          user: {
            id: "host1",
            username: "moviemaster",
            firstName: "John",
            lastName: "Doe",
            avatar: "/placeholder-user.jpg",
            isVerified: true,
          },
          role: "host",
          joinedAt: new Date().toISOString(),
          isOnline: true,
          isMuted: false,
          hasVideo: true,
          reactions: { hearts: 0, likes: 0 },
        },
        {
          id: "2",
          user: {
            id: "user2",
            username: "cinephile",
            firstName: "Jane",
            lastName: "Smith",
            avatar: "/placeholder-user.jpg",
            isVerified: false,
          },
          role: "participant",
          joinedAt: new Date().toISOString(),
          isOnline: true,
          isMuted: false,
          hasVideo: false,
          reactions: { hearts: 5, likes: 2 },
        },
      ])

      setChatMessages([
        {
          id: "1",
          user: {
            id: "host1",
            username: "moviemaster",
            firstName: "John",
            lastName: "Doe",
            avatar: "/placeholder-user.jpg",
          },
          message: "Welcome everyone! Let's start the movie!",
          timestamp: new Date().toISOString(),
          type: "message",
        },
        {
          id: "2",
          user: {
            id: "user2",
            username: "cinephile",
            firstName: "Jane",
            lastName: "Smith",
            avatar: "/placeholder-user.jpg",
          },
          message: "So excited for this! 🍿",
          timestamp: new Date().toISOString(),
          type: "message",
        },
      ])

      setIsConnected(true)
    } finally {
      setIsLoading(false)
    }
  }

  const connectWebSocket = () => {
    const token = localStorage.getItem("accessToken")
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/ws/party/${roomId}/sync/?token=${token}`

    wsRef.current = new WebSocket(wsUrl)

    wsRef.current.onopen = () => {
      setIsConnected(true)
      console.log("WebSocket connected")
    }

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleWebSocketMessage(data)
    }

    wsRef.current.onclose = () => {
      setIsConnected(false)
      console.log("WebSocket disconnected")

      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CLOSED) {
          connectWebSocket()
        }
      }, 3000)
    }

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error)
      setIsConnected(false)
    }
  }

  const handleWebSocketMessage = (data: unknown) => {
    switch (data.type) {
      case "sync_state":
        setSyncState(data.sync_state)
        syncVideo(data.sync_state)
        break
      case "participant_joined":
        setParticipants((prev) => [...prev, data.participant])
        addSystemMessage(`${data.participant.user.firstName} joined the party`)
        break
      case "participant_left":
        setParticipants((prev) => prev.filter((p) => p.id !== data.participant_id))
        addSystemMessage(`${data.username} left the party`)
        break
      case "chat_message":
        setChatMessages((prev) => [...prev, data.message])
        break
      case "reaction":
        // Handle reactions
        break
      default:
        console.log("Unknown message type:", data.type)
    }
  }

  const syncVideo = (state: SyncState) => {
    if (videoRef.current) {
      const video = videoRef.current
      const timeDiff = Math.abs(video.currentTime - state.currentTime)

      if (timeDiff > 1) {
        video.currentTime = state.currentTime
      }

      if (state.isPlaying && video.paused) {
        video.play().catch(console.error)
      } else if (!state.isPlaying && !video.paused) {
        video.pause()
      }
    }
  }

  const addSystemMessage = (message: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      user: { id: "system", username: "system", firstName: "System", lastName: "" },
      message,
      timestamp: new Date().toISOString(),
      type: "system",
    }
    setChatMessages((prev) => [...prev, systemMessage])
  }

  const sendChatMessage = () => {
    if (!newMessage.trim() || !user) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        avatar: user.avatar || undefined,
      },
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: "message",
    }

    setChatMessages((prev) => [...prev, message])
    setNewMessage("")

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat_message",
          message: message.message,
        })
      )
    }
  }

  const sendReaction = (type: "heart" | "like") => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "reaction",
          reaction: type,
        })
      )
    }
  }

  const kickParticipant = (participantId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "kick_participant",
          participant_id: participantId,
        })
      )
    }
  }

  const handleVideoControl = (action: "play" | "pause" | "seek", value?: number) => {
    if (!isHost && !party?.settings.allowParticipantControls) {
      toast({
        title: "Permission Denied",
        description: "Only the host can control playback.",
        variant: "destructive",
      })
      return
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "video_control",
          action,
          value,
        })
      )
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
          <p className="text-white">Loading watch party...</p>
        </div>
      </div>
    )
  }

  if (!party) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-white/10 border-white/20 max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-white mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Party Not Found</h2>
            <p className="text-white/70 mb-6">This watch party doesn&apos;t exist or you don&apos;t have access to it.</p>
            <Button onClick={() => router.push(&quot;/dashboard&quot;)} className=&quot;bg-white text-black hover:bg-white/90">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="bg-white/10 border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push(&quot;/dashboard&quot;)}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Leave Party
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">{party.title}</h1>
              {party.description && <p className="text-white/70 text-sm">{party.description}</p>}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge className={`${isConnected ? "bg-white/20 text-white" : "bg-white/30 text-white"} border-white/30`}>
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>

            <Button
              variant="ghost"
              onClick={() => setShowParticipants(!showParticipants)}
              className="text-white hover:bg-white/10"
            >
              <Users className="h-4 w-4 mr-2" />
              {participants.length}
            </Button>

            <Button variant="ghost" className="text-white hover:bg-white/10">
              <Share2 className="h-4 w-4" />
            </Button>

            {isHost && (
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Section */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="flex-1 bg-black relative group">
            <video
              ref={videoRef}
              src={party.video.url}
              poster={party.video.thumbnail}
              className="w-full h-full object-contain"
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setSyncState((prev) => ({
                    ...prev,
                    currentTime: videoRef.current!.currentTime,
                  }))
                }
              }}
            />

            {/* Video Controls Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200">
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Progress Bar */}
                <div className="mb-4">
                  <Slider
                    value={[syncState.currentTime]}
                    max={party.video.duration}
                    step={1}
                    className="w-full"
                    onValueChange={([value]) => handleVideoControl(&quot;seek&quot;, value)}
                  />
                  <div className="flex justify-between text-xs text-white/70 mt-1">
                    <span>{formatTime(syncState.currentTime)}</span>
                    <span>{formatTime(party.video.duration)}</span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVideoControl(syncState.isPlaying ? &quot;pause&quot; : &quot;play")}
                      className="text-white hover:bg-white/20"
                    >
                      {syncState.isPlaying ? <Pause className="h-5 w-5" /> : <Play className=&quot;h-5 w-5&quot; />}
                    </Button>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-white hover:bg-white/20"
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className=&quot;h-4 w-4&quot; />}
                      </Button>
                      <Slider
                        value={[volume]}
                        max={100}
                        step={1}
                        className="w-20"
                        onValueChange={([value]) => setVolume(value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-white">
                      <span className="text-white/70">Now playing:</span> {party.video.title}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="text-white hover:bg-white/20"
                    >
                      {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className=&quot;h-4 w-4&quot; />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reaction Buttons */}
            {party.settings.allowReactions && (
              <div className="absolute bottom-20 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => sendReaction(&quot;heart&quot;)}
                  className="bg-black/50 text-white hover:bg-black/70"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => sendReaction(&quot;like&quot;)}
                  className="bg-black/50 text-white hover:bg-black/70"
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white/10 border-l border-white/20 flex flex-col">
          {/* Participants Panel */}
          {showParticipants && (
            <div className="border-b border-white/20">
              <div className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-white">
                  <Users className="h-4 w-4" />
                  Participants ({participants.length})
                </h3>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {participant.user.firstName[0]}
                              {participant.user.lastName[0]}
                            </div>
                            <div
                              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border border-black ${
                                participant.isOnline ? "bg-white" : "bg-white/40"
                              }`}
                            />
                          </div>
                          <span className="text-sm text-white">
                            {participant.user.firstName} {participant.user.lastName}
                          </span>
                          {participant.role === "host" && <Crown className="h-3 w-3 text-white" />}
                        </div>

                        {(isHost || userRole === "moderator") && participant.role !== "host" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => kickParticipant(participant.id)}
                                className="text-red-600"
                              >
                                <UserMinus className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Chat Panel */}
          {showChat && party.settings.allowChat && (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-white/20">
                <h3 className="font-semibold flex items-center gap-2 text-white">
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </h3>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={chatScrollRef}>
                <div className="space-y-3">
                  {chatMessages.map((message) => (
                    <div key={message.id} className={`${message.type === "system" ? "text-center" : ""}`}>
                      {message.type === "system" ? (
                        <div className="text-xs text-white/60 italic">{message.message}</div>
                      ) : (
                        <div className="flex gap-2">
                          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {message.user.firstName[0]}
                            {message.user.lastName[0]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-white">
                                {message.user.firstName} {message.user.lastName}
                              </span>
                              <span className="text-xs text-white/60">
                                {new Date(message.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-white/80">{message.message}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-white/20">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === &quot;Enter&quot; && sendChatMessage()}
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-white/40"
                  />
                  <Button onClick={sendChatMessage} className="bg-white text-black hover:bg-white/90">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface Participant {
  id: string
  user: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
    isVerified: boolean
  }
  role: "host" | "moderator" | "participant"
  joinedAt: string
  isOnline: boolean
  isMuted: boolean
  hasVideo: boolean
  reactions: {
    hearts: number
    likes: number
  }
}

interface ChatMessage {
  id: string
  user: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
  }
  message: string
  timestamp: string
  type: "message" | "system" | "reaction"
  reactions?: {
    hearts: number
    likes: number
    userReacted?: "heart" | "like" | null
  }
}

interface Party {
  id: string
  title: string
  description?: string
  video: {
    id: string
    title: string
    url: string
    thumbnail?: string
    duration: number
  }
  host: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
  }
  status: "waiting" | "playing" | "paused" | "ended"
  currentTime: number
  scheduledFor: string
  startedAt?: string
  endedAt?: string
  isPrivate: boolean
  maxParticipants: number
  settings: {
    allowChat: boolean
    allowReactions: boolean
    allowParticipantControls: boolean
    requireApproval: boolean
  }
}

interface SyncState {
  isPlaying: boolean
  currentTime: number
  playbackRate: number
  lastUpdate: string
}

