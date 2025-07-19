"use client"

import { useState, useEffect } from "react"
import { VideoPlayer } from "@/components/video/video-player"
import { ChatBox } from "@/components/chat/chat-box"
import { ParticipantsList } from "@/components/watch-party/participants-list"
import { PartyControls } from "@/components/watch-party/party-controls"
import { useSocket } from "@/contexts/socket-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users } from "lucide-react"

interface WatchPartyRoomProps {
  party: any
}

export function WatchPartyRoom({ party }: WatchPartyRoomProps) {
  const [showChat, setShowChat] = useState(true)
  const [showParticipants, setShowParticipants] = useState(false)
  const { user } = useAuth()
  const { socket, joinRoom, leaveRoom } = useSocket()

  useEffect(() => {
    if (socket && party.id) {
      joinRoom(party.id)
      return () => leaveRoom(party.id)
    }
  }, [socket, party.id, joinRoom, leaveRoom])

  const isHost = user?.id === party.host_id

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="flex-1 bg-black relative">
            <VideoPlayer src={party.video_url} poster={party.thumbnail} roomId={party.id} isHost={isHost} />

            {/* Video Overlay Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowParticipants(!showParticipants)}
                className="bg-black/50 backdrop-blur-sm"
              >
                <Users className="h-4 w-4 mr-2" />
                {party.participants?.length || 0}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowChat(!showChat)}
                className="bg-black/50 backdrop-blur-sm lg:hidden"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Party Info & Controls */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-text-primary">{party.title}</h1>
                <p className="text-text-secondary">{party.description}</p>
              </div>

              {isHost && <PartyControls partyId={party.id} />}
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 border-l border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-text-primary">Live Chat</h2>
            </div>
            <ChatBox roomId={party.id} />
          </div>
        )}

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-64 border-l border-border">
            <ParticipantsList participants={party.participants} hostId={party.host_id} isHost={isHost} />
          </div>
        )}
      </div>
    </div>
  )
}
