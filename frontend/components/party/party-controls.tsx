"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSocket } from "@/contexts/socket-context"
import {
  Settings,
  Pause,
  Play,
  SkipForward,
  SkipBack,
  Volume2,
  Users,
  MessageCircle,
  Share,
  StopCircle,
} from "lucide-react"

interface PartyControlsProps {
  partyId: string
}

export function PartyControls({ partyId }: PartyControlsProps) {
  const { sendMessage } = useSocket()
  const [isPlaying, setIsPlaying] = useState(false)

  const emitControl = (action: string, data?: unknown) => {
    sendMessage("party:control", { 
      party_id: partyId,
      action, 
      ...data 
    })
  }

  const handlePlayPause = () => {
    const action = isPlaying ? "pause" : "play"
    emitControl(action)
    setIsPlaying(!isPlaying)
  }

  const handleSkip = (seconds: number) => {
    emitControl("skip", { seconds })
  }

  const handleEndParty = () => {
    emitControl("end_party")
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Quick Controls */}
      <Button variant="outline" size="sm" onClick={() => handleSkip(-10)}>
        <SkipBack className="w-4 h-4" />
      </Button>

      <Button variant="outline" size="sm" onClick={handlePlayPause}>
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className=&quot;w-4 h-4" />}
      </Button>

      <Button variant="outline" size="sm" onClick={() => handleSkip(10)}>
        <SkipForward className="w-4 h-4" />
      </Button>

      {/* More Controls */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Host Controls
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Users className="w-4 h-4 mr-2" />
            Manage Participants
          </DropdownMenuItem>
          <DropdownMenuItem>
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat Settings
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Volume2 className="w-4 h-4 mr-2" />
            Audio Settings
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Share className="w-4 h-4 mr-2" />
            Share Party
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEndParty} className="text-destructive">
            <StopCircle className="w-4 h-4 mr-2" />
            End Party
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
