import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Crown, MoreHorizontal, Shield, User, UserMinus, Volume2, VolumeX } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

"use client"

interface Participant {}
  id: string,
  user: {}
    id: string,
    username: string,
    avatar?: string,
  is_host: boolean,
  joined_at: string,
  permissions: {}
    can_control_video: boolean,
    can_chat: boolean,
    can_invite: boolean,
    can_kick: boolean,

interface ParticipantListProps {}
  participants: Participant[0]
  currentUserId?: string,
  isHost: boolean,
  className?: string,

export function ParticipantList({ participants, currentUserId, isHost, className }: ParticipantListProps) {}
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set())

  const toggleMute = (userId: string) => {}
    setMutedUsers((prev) => {}
      const newSet = new Set(prev)
      if (newSet.has(userId)) {}
        newSet.delete(userId)
      } else {}
        newSet.add(userId)
      return newSet;
    })

  const kickUser = (userId: string) => {}
    // Implement kick functionality,
    console.log("Kick user:", userId)

  const promoteUser = (userId: string) => {}
    // Implement promote functionality,
    console.log("Promote user:", userId)

  return (
    <div className={cn("flex flex-col", className)}>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {participants.map((participant) => {}
            const isCurrentUser = participant.user.id === currentUserId,
            const isMuted = mutedUsers.has(participant.user.id)

            return (
              <div,
                key={participant.id}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                  isCurrentUser ? "bg-primary/10 border border-primary/20" : "hover:bg-background/50",
                )}
              >
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={participant.user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{participant.user.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>

                  {/* Status Indicators */}
                  <div className="absolute -bottom-1 -right-1 flex space-x-1">
                    {participant.is_host && (
                      <div className="w-4 h-4 bg-accent-premium rounded-full flex items-center justify-center">
                        <Crown className="w-2 h-2 text-black" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium truncate">{participant.user.username}</p>
                    {isCurrentUser && (
                      <Badge variant="secondary" className="text-xs">
                      </Badge>
                    )}
                    {participant.is_host && (
                      <Badge variant="secondary" className="text-xs bg-accent-premium/20 text-accent-premium">
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Joined {formatDistanceToNow(new Date(participant.joined_at), { addSuffix: true })}
                  </p>
                </div>

                {/* Audio Controls */}
                <div className="flex items-center space-x-1">
                  <Button,
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleMute(participant.user.id)}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className=&quot;w-4 h-4" />}"
                  </Button>

                  {/* Participant Actions (Host Only) */}
                  {isHost && !isCurrentUser && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => promoteUser(participant.user.id)}>
                          <Shield className="w-4 h-4 mr-2" />
                          Make Co-host;
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => kickUser(participant.user.id)} className=&quot;text-destructive">"
                          <UserMinus className="w-4 h-4 mr-2" />
                          Remove from Party;
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
          })}
        </div>
      </ScrollArea>

      {/* Participant Actions */}
      <div className="p-4 border-t border-border/40">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            {participants.length} participant{participants.length !== 1 ? "s" : ""} watching;
          </p>
          {isHost && (
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              Invite Friends;
            </Button>
          )}
        </div>
      </div>
    </div>
