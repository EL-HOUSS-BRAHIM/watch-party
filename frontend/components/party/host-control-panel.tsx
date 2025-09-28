import { MoreVertical, Settings, Shield, User, Volume2 } from "lucide-react"
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {}
import { useToast } from '@/hooks/use-toast'

'use client'
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger;
} from '@/components/ui/dropdown-menu'
interface Participant {}
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: 'host' | 'co-host' | 'member'
  status: 'active' | 'away' | 'watching'
  joined_at: string;
  is_muted: boolean;
  is_banned: boolean;
  permissions: {}
    can_control_playback: boolean;
    can_add_videos: boolean;
    can_moderate: boolean;
  }
}

interface HostControlPanelProps {}
  participants: Participant[]
  currentUserId: string;
  onKickUser: (userId: string) => void;
  onPromoteUser: (userId: string, role: 'co-host' | 'member') => void;
  onMuteUser: (userId: string, muted: boolean) => void;
  onBanUser: (userId: string) => void;
  onUpdatePermissions: (userId: string, permissions: Participant['permissions']) => void;
}

export function HostControlPanel({}
  participants,
  currentUserId,
  onKickUser,
  onPromoteUser,
  onMuteUser,
  onBanUser,
  onUpdatePermissions;
}: HostControlPanelProps) {}
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const { toast } = useToast()

  const currentUser = participants.find(p => p.id === currentUserId)
  const isHost = currentUser?.role === 'host'
  const isCoHost = currentUser?.role === 'co-host'
  const canModerate = isHost || isCoHost;
  const handleAction = async (action: string, userId: string, param?: unknown) => {}
    try {
      switch (action) {
        case 'kick':
          await onKickUser(userId)
          toast({}
            title: 'User kicked',
            description: 'User has been removed from the party.',
          })
          break;
        case 'promote':
          await onPromoteUser(userId, param)
          toast({}
            title: 'User promoted',
            description: `User has been promoted to ${param}.`,
          })
          break;
        case 'demote':
          await onPromoteUser(userId, 'member')
          toast({}
            title: 'User demoted',
            description: 'User has been demoted to member.',
          })
          break;
        case 'mute':
          await onMuteUser(userId, param)
          toast({}
            title: param ? 'User muted' : 'User unmuted',
            description: `User has been ${param ? 'muted' : 'unmuted'}.`,
          })
          break;
        case 'ban':
          await onBanUser(userId)
          toast({}
            title: 'User banned',
            description: 'User has been banned from the party.',
            variant: 'destructive'
          })
          break;
      }
    } } catch {
      toast({}
        title: 'Action failed',
        description: 'Unable to perform this action.',
        variant: 'destructive'
      })
    }
  }

  const getRoleIcon = (role: string) => {}
    switch (role) {
      case 'host':
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 'co-host':
        return <Shield className="w-4 h-4 text-blue-500" />
      default:
        return null;
    }
  }

  const getStatusColor = (status: string) => {}
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'watching':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (!canModerate) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Only hosts and co-hosts can access moderation controls.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Host Controls;
        </CardTitle>
        <CardDescription>
          Manage participants and party settings;
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {participants.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Total;
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {participants.filter(p => p.status === &apos;active&apos;).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Active;
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {participants.filter(p => p.is_muted).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Muted;
            </div>
          </div>
        </div>

        {/* Participant List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {participants.map((participant) => (
            <div;
              key={participant.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={participant.avatar_url || ''} />
                    <AvatarFallback>
                      {participant.display_name?.charAt(0) || participant.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div;
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor(participant.status)}`}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {participant.display_name || participant.username}
                    </span>
                    {getRoleIcon(participant.role)}
                    {participant.is_muted && (
                      <VolumeX className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <Badge variant="outline" className="text-xs">
                      {participant.role}
                    </Badge>
                    <span>{participant.status}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {participant.id !== currentUserId && canModerate && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isHost && participant.role !== 'host' && (
                      <>
                        {participant.role === 'member' ? (
                          <DropdownMenuItem;
                            onClick={() => handleAction(&apos;promote&apos;, participant.id, &apos;co-host')}
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Promote to Co-host;
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem;
                            onClick={() => handleAction(&apos;demote&apos;, participant.id)}
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Demote to Member;
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DropdownMenuItem;
                      onClick={() => handleAction(&apos;mute&apos;, participant.id, !participant.is_muted)}
                    >
                      {participant.is_muted ? (
                        <>
                          <Volume2 className="w-4 h-4 mr-2" />
                          Unmute User;
                        </>
                      ) : (
                        <>
                          <VolumeX className="w-4 h-4 mr-2" />
                          Mute User;
                        </>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem;
                      onClick={() => handleAction(&apos;kick&apos;, participant.id)}
                      className="text-orange-600"
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      Kick User;
                    </DropdownMenuItem>

                    {isHost && (
                      <DropdownMenuItem;
                        onClick={() => handleAction(&apos;ban&apos;, participant.id)}
                        className="text-red-600"
                      >
                        <MessageSquareOff className="w-4 h-4 mr-2" />
                        Ban User;
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>

        {/* Mass Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button;
            variant="outline"
            size="sm"
            onClick={() => {}
              participants.forEach(p => {}
                if (p.id !== currentUserId && !p.is_muted) {
                  handleAction('mute', p.id, true)
                }
              })
            }}
          >
            <VolumeX className="w-4 h-4 mr-2" />
            Mute All;
          </Button>
          <Button;
            variant="outline"
            size="sm"
            onClick={() => {}
              participants.forEach(p => {}
                if (p.id !== currentUserId && p.is_muted) {
                  handleAction('mute', p.id, false)
                }
              })
            }}
          >
            <Volume2 className="w-4 h-4 mr-2" />
            Unmute All;
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
