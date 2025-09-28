"use client"

import { Clock, Eye, Filter, Flag, Settings, Shield, Trash, X } from "lucide-react"
import { useState, useEffect } from 'react'
import Image from "next/image"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSocket } from '@/contexts/socket-context'

interface ChatModerationProps {}
  partyId: string
  isHost: boolean
  isModerator: boolean
  messages: Array<{}
    id: string
    content: string
    author: {}
      id: string
      username: string
      avatar: string
    }
    timestamp: string
    isDeleted: boolean
    isHidden: boolean
    reports: number
  }>
  participants: Array<{}
    id: string
    username: string
    avatar: string
    role: 'host' | 'moderator' | 'participant'
    isMuted: boolean
    isBanned: boolean
    warnings: number
  }>
}

interface ModerationSettings {}
  slowMode: boolean
  slowModeDelay: number // seconds
  wordFilter: boolean
  bannedWords: string[]
  linkFilter: boolean
  spamProtection: boolean
  requireApproval: boolean
  autoModeration: boolean
}

interface ModerationAction {}
  id: string
  type: 'mute' | 'ban' | 'warn' | 'delete' | 'timeout'
  targetId: string
  targetUsername: string
  moderatorId: string
  moderatorUsername: string
  reason: string
  duration?: number // minutes
  timestamp: string
}

export function ChatModeration({ partyId, isHost, isModerator, messages, participants }: ChatModerationProps) {}
  const [settings, setSettings] = useState<ModerationSettings>({}
    slowMode: false,
    slowModeDelay: 5,
    wordFilter: true,
    bannedWords: [],
    linkFilter: false,
    spamProtection: true,
    requireApproval: false,
    autoModeration: false
  })
  const [actions, setActions] = useState<ModerationAction[]>([])
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showLogs, setShowLogs] = useState(false)
  const [newBannedWord, setNewBannedWord] = useState('')
  const [banReason, setBanReason] = useState('')
  const [banDuration, setBanDuration] = useState('60') // minutes
  const { socket } = useSocket()

  useEffect(() => {
    if (isHost || isModerator) {
      fetchModerationSettings()
      fetchModerationLogs()
    }
  }, [partyId, isHost, isModerator])

  useEffect(() => {
    if (socket) {
      socket.on('moderation-action', handleModerationAction)
      socket.on('message-reported', handleMessageReported)
      socket.on('user-warned', handleUserWarned)
      return () => {}
        socket.off('moderation-action')
        socket.off('message-reported')
        socket.off('user-warned')
      }
    }
  }, [socket])

  const fetchModerationSettings = async () => {
    try {
      const response = await fetch(`/api/parties/${partyId}/moderation/settings`)
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (err) {
      console.error('Failed to fetch moderation settings:', error)
    }
  }

  const fetchModerationLogs = async () => {
    try {
      const response = await fetch(`/api/parties/${partyId}/moderation/logs`)
      if (response.ok) {
        const data = await response.json()
        setActions(data.actions)
      }
    } catch (err) {
      console.error('Failed to fetch moderation logs:', error)
    }
  }

  const updateSettings = async (newSettings: Partial<ModerationSettings>) => {}
    try {
      const updatedSettings = { ...settings, ...newSettings }
      const response = await fetch(`/api/parties/${partyId}/moderation/settings`, {}
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      })

      if (response.ok) {
        setSettings(updatedSettings)
        socket?.emit('moderation-settings-updated', { partyId, settings: updatedSettings })
      }
    } catch (err) {
      console.error('Failed to update moderation settings:', error)
    }
  }

  const moderateUser = async (
    userId: string, 
    action: 'mute' | 'ban' | 'warn' | 'timeout',
    reason: string,
    duration?: number
  ) => {}
    try {
      const response = await fetch(`/api/parties/${partyId}/moderation/users/${userId}`, {}
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason, duration })
      })

      if (response.ok) {
        const result = await response.json()
        socket?.emit('user-moderated', {}
          partyId, 
          userId, 
          action, 
          reason, 
          duration,
          moderator: 'current-user'
        })
      }
    } catch (err) {
      console.error('Failed to moderate user:', error)
    }
  }

  const deleteMessage = async (messageId: string, reason: string) => {}
    try {
      const response = await fetch(`/api/parties/${partyId}/moderation/messages/${messageId}`, {}
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        socket?.emit('message-deleted', { partyId, messageId, reason })
      }
    } catch (err) {
      console.error('Failed to delete message:', error)
    }
  }

  const addBannedWord = () => {}
    if (newBannedWord.trim() && !settings.bannedWords.includes(newBannedWord.trim())) {}
      const updatedWords = [...settings.bannedWords, newBannedWord.trim()]
      updateSettings({ bannedWords: updatedWords })
      setNewBannedWord('')
    }
  }

  const removeBannedWord = (word: string) => {}
    const updatedWords = settings.bannedWords.filter(w => w !== word)
    updateSettings({ bannedWords: updatedWords })
  }

  const handleModerationAction = (action: ModerationAction) => {}
    setActions(prev => [action, ...prev])
  }

  const handleMessageReported = (data: { messageId: string; reporterId: string; reason: string }) => {}
    // Handle message report
    console.log('Message reported:', data)
  }

  const handleUserWarned = (data: { userId: string; warnings: number }) => {}
    // Handle user warning
    console.log('User warned:', data)
  }

  const getActionColor = (action: string) => {}
    switch (action) {
      case 'ban': return 'destructive'
      case 'mute': return 'secondary'
      case 'warn': return 'outline'
      case 'timeout': return 'secondary'
      default: return 'outline'
    }
  }

  const formatDuration = (minutes: number) => {}
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  if (!isHost && !isModerator) {
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Chat Moderation</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLogs(true)}
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant={settings.slowMode ? "default" : "outline"}
            size="sm"
            onClick={() => updateSettings({ slowMode: !settings.slowMode })}
          >
            <Clock className="h-3 w-3 mr-1" />
            Slow Mode
          </Button>
          <Button
            variant={settings.wordFilter ? "default" : "outline"}
            size="sm"
            onClick={() => updateSettings({ wordFilter: !settings.wordFilter })}
          >
            <Filter className="h-3 w-3 mr-1" />
            Word Filter
          </Button>
          <Button
            variant={settings.requireApproval ? "default" : "outline"}
            size="sm"
            onClick={() => updateSettings({ requireApproval: !settings.requireApproval })}
          >
            <Eye className="h-3 w-3 mr-1" />
            Approve Messages
          </Button>
        </div>

        {/* Flagged Messages */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Flagged Messages</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {messages
              .filter(msg => msg.reports > 0)
              .map((message) => (
                <div key={message.id} className="p-2 rounded-md border border-orange-200 bg-orange-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{message.author.username}</span>
                        <Flag className="h-3 w-3" />
                        <span>{message.reports} reports</span>
                      </div>
                      <p className="text-sm mt-1">{message.content}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMessage(message.id, 'Reported content')}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Participant Management */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Participants</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-2 rounded-md border">
                <div className="flex items-center space-x-2">
                  <img
                    src={participant.avatar || '/placeholder-user.jpg'}
                    alt={participant.username}
                    className="w-6 h-6 rounded-full"
                  />
                  <div>
                    <span className="text-sm font-medium">{participant.username}</span>
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline" className="text-xs">
                        {participant.role}
                      </Badge>
                      {participant.warnings > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {participant.warnings} warnings
                        </Badge>
                      )}
                      {participant.isMuted && <VolumeX className="h-3 w-3 text-muted-foreground" />}
                      {participant.isBanned && <Ban className="h-3 w-3 text-destructive" />}
                    </div>
                  </div>
                </div>
                {participant.role === 'participant' && (
                  <div className="flex items-center space-x-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Shield className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Moderate {participant.username}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Action</Label>
                            <Select defaultValue="warn">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="warn">Warn</SelectItem>
                                <SelectItem value="mute">Mute</SelectItem>
                                <SelectItem value="timeout">Timeout</SelectItem>
                                <SelectItem value="ban">Ban</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Duration (for mute/timeout/ban)</Label>
                            <Select value={banDuration} onValueChange={setBanDuration}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="360">6 hours</SelectItem>
                                <SelectItem value="1440">24 hours</SelectItem>
                                <SelectItem value="0">Permanent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Reason</Label>
                            <Textarea
                              placeholder="Reason for moderation action..."
                              value={banReason}
                              onChange={(e) => setBanReason(e.target.value)}
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline">Cancel</Button>
                            <Button
                              onClick={() => {}
                                moderateUser(participant.id, 'warn', banReason, parseInt(banDuration))
                                setBanReason('')
                              }}
                            >
                              Apply Action
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Moderation Settings</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="filters">Filters</TabsTrigger>
                <TabsTrigger value="automation">Automation</TabsTrigger>
              </TabsList>
              <TabsContent value="general" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Slow Mode</Label>
                      <p className="text-sm text-muted-foreground">Limit message frequency</p>
                    </div>
                    <Switch
                      checked={settings.slowMode}
                      onCheckedChange={(checked) => updateSettings({ slowMode: checked })}
                    />
                  </div>
                  {settings.slowMode && (
                    <div className="space-y-2">
                      <Label>Slow Mode Delay (seconds)</Label>
                      <Select
                        value={settings.slowModeDelay.toString()}
                        onValueChange={(value) => updateSettings({ slowModeDelay: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 seconds</SelectItem>
                          <SelectItem value="10">10 seconds</SelectItem>
                          <SelectItem value="30">30 seconds</SelectItem>
                          <SelectItem value="60">1 minute</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Message Approval</Label>
                      <p className="text-sm text-muted-foreground">All messages need approval</p>
                    </div>
                    <Switch
                      checked={settings.requireApproval}
                      onCheckedChange={(checked) => updateSettings({ requireApproval: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Spam Protection</Label>
                      <p className="text-sm text-muted-foreground">Automatically detect spam</p>
                    </div>
                    <Switch
                      checked={settings.spamProtection}
                      onCheckedChange={(checked) => updateSettings({ spamProtection: checked })}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="filters" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Word Filter</Label>
                      <p className="text-sm text-muted-foreground">Block banned words</p>
                    </div>
                    <Switch
                      checked={settings.wordFilter}
                      onCheckedChange={(checked) => updateSettings({ wordFilter: checked })}
                    />
                  </div>
                  {settings.wordFilter && (
                    <div className="space-y-2">
                      <Label>Banned Words</Label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add banned word..."
                          value={newBannedWord}
                          onChange={(e) => setNewBannedWord(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addBannedWord()}
                        />
                        <Button onClick={addBannedWord}>Add</Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {settings.bannedWords.map((word) => (
                          <Badge key={word} variant="secondary" className="cursor-pointer">
                            {word}
                            <X
                              className="h-3 w-3 ml-1" 
                              onClick={() => removeBannedWord(word)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Link Filter</Label>
                      <p className="text-sm text-muted-foreground">Block external links</p>
                    </div>
                    <Switch
                      checked={settings.linkFilter}
                      onCheckedChange={(checked) => updateSettings({ linkFilter: checked })}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="automation" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Moderation</Label>
                      <p className="text-sm text-muted-foreground">Automatically moderate based on rules</p>
                    </div>
                    <Switch
                      checked={settings.autoModeration}
                      onCheckedChange={(checked) => updateSettings({ autoModeration: checked })}
                    />
                  </div>
                  {settings.autoModeration && (
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Auto moderation rules:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Warn users after 3 reports</li>
                        <li>Timeout users after 2 warnings</li>
                        <li>Ban users after repeated violations</li>
                        <li>Auto-delete messages with banned words</li>
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Logs Dialog */}
        <Dialog open={showLogs} onOpenChange={setShowLogs}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Moderation Logs</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {actions.map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 rounded-md border">
                  <div className="flex items-center space-x-3">
                    <Badge variant={getActionColor(action.type) as Record<string, unknown>}>
                      {action.type}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">
                        {action.moderatorUsername} {action.type}ed {action.targetUsername}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {action.reason}
                        {action.duration && ` (${formatDuration(action.duration)})`}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(action.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
