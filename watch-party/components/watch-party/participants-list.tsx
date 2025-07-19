"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Crown, MoreHorizontal, UserMinus, Shield } from "lucide-react"

interface Participant {
  id: string
  name: string
  avatar?: string
  role: "host" | "moderator" | "participant"
  isOnline: boolean
}

interface ParticipantsListProps {
  participants: Participant[]
  hostId: string
  isHost: boolean
}

export function ParticipantsList({ participants = [], hostId, isHost }: ParticipantsListProps) {
  const [filter, setFilter] = useState<"all" | "online">("all")

  const filteredParticipants = participants.filter((p) => filter === "all" || p.isOnline)

  const handleKickUser = (userId: string) => {
    console.log("Kick user:", userId)
    // Implement kick user functionality
  }

  const handleMakeModerator = (userId: string) => {
    console.log("Make moderator:", userId)
    // Implement make moderator functionality
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-text-primary">Participants ({filteredParticipants.length})</h2>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter === "all" ? "default" : "ghost"}
            onClick={() => setFilter("all")}
            className="flex-1"
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === "online" ? "default" : "ghost"}
            onClick={() => setFilter("online")}
            className="flex-1"
          >
            Online
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredParticipants.map((participant) => (
            <div key={participant.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${
                      participant.isOnline ? "bg-success" : "bg-text-tertiary"
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-text-primary truncate">{participant.name}</span>
                    {participant.id === hostId && <Crown className="h-3 w-3 text-premium" />}
                    {participant.role === "moderator" && <Shield className="h-3 w-3 text-primary-400" />}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {participant.role}
                  </Badge>
                </div>
              </div>

              {isHost && participant.id !== hostId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {participant.role !== "moderator" && (
                      <DropdownMenuItem onClick={() => handleMakeModerator(participant.id)}>
                        <Shield className="mr-2 h-4 w-4" />
                        Make Moderator
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleKickUser(participant.id)} className="text-error">
                      <UserMinus className="mr-2 h-4 w-4" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
