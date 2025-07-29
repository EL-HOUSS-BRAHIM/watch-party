"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Users,
  MessageCircle,
  Send,
  Crown,
  UserMinus,
  MoreHorizontal,
  Share2,
  Heart,
  ThumbsUp,
  ArrowLeft,
  Loader2,
  Wifi,
  WifiOff,
  AlertTriangle,
} from "lucide-react"
import { format } from "date-fns"

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
  const [userRole, setUserRole] = useState<"host" | "moderator" | "participant">("participant")

  // WebSocket connection
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
    // Scroll chat to bottom when new messages arrive
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

        // Determine user role
        const participant = partyData.participants?.find((p: any) => p.user.id === user?.id)
        setUserRole(participant?.role || "participant")
      } else {
        throw new Error("Failed to load party data")
      }
    } catch (error) {
      console.error("Failed to load party:", error)
      toast({
        title: "Error",
        description: "Failed to load watch party. Please try again.",
        variant: "destructive",
      })
      router.push("/dashboard/parties")
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

      // Attempt to reconnect after 3 seconds
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

  const handleWebSocketMessage = (data: any) => {
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
        handleReaction(data.reaction)
        break
      case "party_updated":
        setParty((prev) => (prev ? { ...prev, ...data.updates } : null))
        break
      default:
        console.log("Unknown message type:", data.type)
    }
  }

  const syncVideo = (state: SyncState) => {
    if (!videoRef.current) return

    const video = videoRef.current
    const timeDiff = Math.abs(video.currentTime - state.currentTime)

    // Only sync if there's a significant difference (more than 1 second)
    if (timeDiff > 1) {
      video.currentTime = state.currentTime
    }

    if (state.isPlaying && video.paused) {
      video.play()
    } else if (!state.isPlaying && !video.paused) {
      video.pause()
    }

    video.playbackRate = state.playbackRate
  }

  const sendWebSocketMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }

  const addSystemMessage = (message: string) => {
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      user: {
        id: "system",
        username: "System",
        firstName: "System",
        lastName: "",
      },
      message,
      timestamp: new Date().toISOString(),
      type: "system",
    }
    setChatMessages((prev) => [...prev, systemMessage])
  }

  const handlePlayPause = () => {
    if (!videoRef.current || (!isHost && !party?.settings.allowParticipantControls)) return

    const video = videoRef.current
    const newIsPlaying = video.paused

    sendWebSocketMessage({
      type: "sync_update",
      sync_state: {
        isPlaying: newIsPlaying,
        currentTime: video.currentTime,
        playbackRate: video.playbackRate,
        lastUpdate: new Date().toISOString(),
      },
    })
  }

  const handleSeek = (time: number) => {
    if (!videoRef.current || (!isHost && !party?.settings.allowParticipantControls)) return

    const video = videoRef.current
    video.currentTime = time

    sendWebSocketMessage({
      type: "sync_update",
      sync_state: {
        isPlaying: !video.paused,
        currentTime: time,
        playbackRate: video.playbackRate,
        lastUpdate: new Date().toISOString(),
      },
    })
  }

  const handleVolumeChange = (newVolume: number[]) => {
    const volumeValue = newVolume[0]
    setVolume(volumeValue)
    setIsMuted(volumeValue === 0)

    if (videoRef.current) {
      videoRef.current.volume = volumeValue / 100
      videoRef.current.muted = volumeValue === 0
    }
  }

  const toggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)

    if (videoRef.current) {
      videoRef.current.muted = newMuted
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const sendChatMessage = () => {
    if (!newMessage.trim() || !party?.settings.allowChat) return

    sendWebSocketMessage({
      type: "chat_message",
      message: newMessage.trim(),
    })

    setNewMessage("")
  }

  const sendReaction = (type: "heart" | "like") => {
    if (!party?.settings.allowReactions) return

    sendWebSocketMessage({
      type: "reaction",
      reaction_type: type,
    })
  }

  const handleReaction = (reaction: any) => {
    // Update participant reactions or add visual effects
    console.log("Reaction received:", reaction)
  }

  const inviteParticipant = async () => {
    try {
      const inviteUrl = `${window.location.origin}/watch/${roomId}`
      await navigator.clipboard.writeText(inviteUrl)
      toast({
        title: "Invite Link Copied",
        description: "Share this link to invite others to the party.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy invite link.",
        variant: "destructive",
      })
    }
  }

  const kickParticipant = async (participantId: string) => {
    if (!isHost && userRole !== "moderator") return

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/parties/${roomId}/participants/${participantId}/kick/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Participant Removed",
          description: "The participant has been removed from the party.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove participant.",
        variant: "destructive",
      })
    }
  }

  const leaveParty = () => {
    if (confirm("Are you sure you want to leave this watch party?")) {
      router.push("/dashboard/parties")
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading watch party...</p>
        </div>
      </div>
    )
  }

  if (!party) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Party Not Found</h2>
          <p className="text-gray-400 mb-4">This watch party doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push("/dashboard/parties")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Parties
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={leaveParty} className="text-white hover:bg-gray-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Leave
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{party.title}</h1>
            <p className="text-sm text-gray-400">{party.video.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
            <span className="text-xs text-gray-400">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>

          {/* Participants Count */}
          <Button
            variant="ghost"
            onClick={() => setShowParticipants(!showParticipants)}
            className="text-white hover:bg-gray-800"
          >
            <Users className="h-4 w-4 mr-2" />
            {participants.length}
          </Button>

          {/* Chat Toggle */}
          <Button variant="ghost" onClick={() => setShowChat(!showChat)} className="text-white hover:bg-gray-800">
            <MessageCircle className="h-4 w-4 mr-2" />
            Chat
          </Button>

          {/* Invite */}
          <Button variant="ghost" onClick={inviteParticipant} className="text-white hover:bg-gray-800">
            <Share2 className="h-4 w-4 mr-2" />
            Invite
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="relative flex-1 bg-black">
            <video
              ref={videoRef}
              src={party.video.url}
              className="w-full h-full object-contain"
              onTimeUpdate={() => {
                if (videoRef.current && (isHost || party.settings.allowParticipantControls)) {
                  const currentTime = videoRef.current.currentTime
                  if (Math.abs(currentTime - syncState.currentTime) > 2) {
                    handleSeek(currentTime)
                  }
                }
              }}
            />

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-4">
                {/* Play/Pause */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  disabled={!isHost && !party.settings.allowParticipantControls}
                  className="text-white hover:bg-white/20"
                >
                  {syncState.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                {/* Progress Bar */}
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs text-white">{formatTime(syncState.currentTime)}</span>
                  <Slider
                    value={[syncState.currentTime]}
                    max={party.video.duration}
                    step={1}
                    onValueChange={(value) => handleSeek(value[0])}
                    disabled={!isHost && !party.settings.allowParticipantControls}
                    className="flex-1"
                  />
                  <span className="text-xs text-white">{formatTime(party.video.duration)}</span>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-white/20">
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider value={[volume]} max={100} step={1} onValueChange={handleVolumeChange} className="w-20" />
                </div>

                {/* Fullscreen */}
                <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                  {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Reaction Buttons */}
            {party.settings.allowReactions && (
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => sendReaction("heart")}
                  className="text-white hover:bg-white/20"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => sendReaction("like")}
                  className="text-white hover:bg-white/20"
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-gray-900 flex flex-col">
          {/* Participants Panel */}
          {showParticipants && (
            <div className="border-b border-gray-700">
              <div className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Participants ({participants.length})
                </h3>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={participant.user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {participant.user.firstName[0]}
                              {participant.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">
                            {participant.user.firstName} {participant.user.lastName}
                          </span>
                          {participant.role === "host" && <Crown className="h-3 w-3 text-yellow-500" />}
                          {!participant.isOnline && <div className="w-2 h-2 bg-gray-500 rounded-full" />}
                        </div>

                        {(isHost || userRole === "moderator") && participant.role !== "host" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
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
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold flex items-center gap-2">
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
                        <div className="text-xs text-gray-400 italic">{message.message}</div>
                      ) : (
                        <div className="flex gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={message.user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {message.user.firstName[0]}
                              {message.user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                {message.user.firstName} {message.user.lastName}
                              </span>
                              <span className="text-xs text-gray-400">
                                {format(new Date(message.timestamp), "HH:mm")}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300">{message.message}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                    className="flex-1 bg-gray-800 border-gray-600 text-white"
                  />
                  <Button onClick={sendChatMessage} size="sm">
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
