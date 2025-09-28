'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Shield, 
  UserX, 
  UserCheck, 
  Search, 
  AlertTriangle, 
  Clock,
  Eye,
  EyeOff,
  MessageCircle,
  Volume2,
  VolumeX,
  Ban,
  Undo,
  Filter,
  MoreHorizontal,
  Flag
} from 'lucide-react'

interface BlockedUser {
  id: string
  username: string
  displayName: string
  avatar: string
  blockedAt: string
  reason: string
  blockType: 'full' | 'messages' | 'parties' | 'profile'
  reportCount: number
  lastSeen: string
}

interface BlockReason {
  type: 'harassment' | 'spam' | 'inappropriate' | 'privacy' | 'other'
  description: string
}

const BLOCK_REASONS: BlockReason[] = [
  { type: 'harassment', description: 'Harassment or bullying' },
  { type: 'spam', description: 'Spam or unwanted messages' },
  { type: 'inappropriate', description: 'Inappropriate content' },
  { type: 'privacy', description: 'Privacy concerns' },
  { type: 'other', description: 'Other reason' }
]

export function BlockUnblockManager() {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'full' | 'messages' | 'parties' | 'profile'>(&apos;all')
  const [showBlockDialog, setShowBlockDialog] = useState(false)
  const [newBlockUser, setNewBlockUser] = useState('')
  const [blockReason, setBlockReason] = useState<BlockReason['type']>(&apos;other')
  const [customReason, setCustomReason] = useState('')
  const [blockType, setBlockType] = useState<BlockedUser['blockType']>(&apos;full')

  useEffect(() => {
    fetchBlockedUsers()
  }, [])

  const fetchBlockedUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users/blocked')
      if (response.ok) {
        const data = await response.json()
        setBlockedUsers(data.blockedUsers)
      }
    } catch (error) {
      console.error('Failed to fetch blocked users:', error)
    } finally {
      setLoading(false)
    }
  }

  const blockUser = async () => {
    if (!newBlockUser.trim()) return

    try {
      const reason = blockReason === 'other' ? customReason : BLOCK_REASONS.find(r => r.type === blockReason)?.description || ''
      
      const response = await fetch('/api/users/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newBlockUser,
          reason,
          blockType
        })
      })

      if (response.ok) {
        const newBlockedUser = await response.json()
        setBlockedUsers(prev => [newBlockedUser, ...prev])
        setShowBlockDialog(false)
        setNewBlockUser('')
        setCustomReason('')
        setBlockReason('other')
        setBlockType('full')
      }
    } catch (error) {
      console.error('Failed to block user:', error)
    }
  }

  const unblockUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/unblock/${userId}`, {
        method: 'POST'
      })

      if (response.ok) {
        setBlockedUsers(prev => prev.filter(user => user.id !== userId))
      }
    } catch (error) {
      console.error('Failed to unblock user:', error)
    }
  }

  const updateBlockType = async (userId: string, newBlockType: BlockedUser['blockType']) => {
    try {
      const response = await fetch(`/api/users/block/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockType: newBlockType })
      })

      if (response.ok) {
        setBlockedUsers(prev => 
          prev.map(user => 
            user.id === userId ? { ...user, blockType: newBlockType } : user
          )
        )
      }
    } catch (error) {
      console.error('Failed to update block type:', error)
    }
  }

  const reportUser = async (userId: string, reason: string) => {
    try {
      const response = await fetch('/api/users/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason })
      })

      if (response.ok) {
        // Update report count
        setBlockedUsers(prev => 
          prev.map(user => 
            user.id === userId ? { ...user, reportCount: user.reportCount + 1 } : user
          )
        )
      }
    } catch (error) {
      console.error('Failed to report user:', error)
    }
  }

  const filteredUsers = blockedUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || user.blockType === filter
    return matchesSearch && matchesFilter
  })

  const getBlockTypeIcon = (type: BlockedUser['blockType']) => {
    switch (type) {
      case 'full':
        return <Ban className="h-4 w-4" />
      case 'messages':
        return <MessageCircle className="h-4 w-4" />
      case 'parties':
        return <Eye className="h-4 w-4" />
      case 'profile':
        return <EyeOff className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const getBlockTypeColor = (type: BlockedUser['blockType']) => {
    switch (type) {
      case 'full':
        return 'destructive'
      case 'messages':
        return 'secondary'
      case 'parties':
        return 'outline'
      case 'profile':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getBlockTypeDescription = (type: BlockedUser['blockType']) => {
    switch (type) {
      case 'full':
        return 'Complete block - no interaction possible'
      case 'messages':
        return 'Cannot send messages'
      case 'parties':
        return 'Cannot join your parties'
      case 'profile':
        return 'Cannot view your profile'
      default:
        return 'Blocked'
    }
  }

  const BlockedUserCard = ({ user }: { user: BlockedUser }) => {
    const [showOptions, setShowOptions] = useState(false)

    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar} alt={user.username} />
              <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-medium truncate">{user.displayName}</h3>
                <Badge variant={getBlockTypeColor(user.blockType) as Record<string, unknown>}>
                  {getBlockTypeIcon(user.blockType)}
                  <span className="ml-1 capitalize">{user.blockType}</span>
                </Badge>
                {user.reportCount > 0 && (
                  <Badge variant="destructive">
                    <Flag className="h-3 w-3 mr-1" />
                    {user.reportCount}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">@{user.username}</p>
              
              <p className="text-sm text-muted-foreground mb-2">{getBlockTypeDescription(user.blockType)}</p>
              
              {user.reason && (
                <p className="text-sm bg-muted p-2 rounded mb-3">
                  <strong>Reason:</strong> {user.reason}
                </p>
              )}
              
              <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Blocked {new Date(user.blockedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>Last seen {new Date(user.lastSeen).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => unblockUser(user.id)}
                  variant="outline"
                  size="sm"
                >
                  <UserCheck className="h-3 w-3 mr-1" />
                  Unblock
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Shield className="h-3 w-3 mr-1" />
                      Modify
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modify Block for {user.displayName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Block Type</Label>
                        <Select
                          value={user.blockType}
                          onValueChange={(value: BlockedUser['blockType']) => updateBlockType(user.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Block</SelectItem>
                            <SelectItem value="messages">Block Messages</SelectItem>
                            <SelectItem value="parties">Block from Parties</SelectItem>
                            <SelectItem value="profile">Hide Profile</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Additional Report</Label>
                        <Select onValueChange={(reason) => reportUser(user.id, reason)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select reason to report" />
                          </SelectTrigger>
                          <SelectContent>
                            {BLOCK_REASONS.map((reason) => (
                              <SelectItem key={reason.type} value={reason.description}>
                                {reason.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOptions(!showOptions)}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <Shield className="h-6 w-6" />
            <span>Blocked Users</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage users you've blocked and their access levels
          </p>
        </div>
        
        <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserX className="h-4 w-4 mr-2" />
              Block User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Block User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input
                  placeholder="Enter username to block"
                  value={newBlockUser}
                  onChange={(e) => setNewBlockUser(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Block Type</Label>
                <Select value={blockType} onValueChange={(value: BlockedUser['blockType']) => setBlockType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Block</SelectItem>
                    <SelectItem value="messages">Block Messages Only</SelectItem>
                    <SelectItem value="parties">Block from Parties Only</SelectItem>
                    <SelectItem value="profile">Hide Profile Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Reason</Label>
                <Select value={blockReason} onValueChange={(value: BlockReason['type']) => setBlockReason(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOCK_REASONS.map((reason) => (
                      <SelectItem key={reason.type} value={reason.type}>
                        {reason.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {blockReason === 'other' && (
                <div className="space-y-2">
                  <Label>Custom Reason</Label>
                  <Textarea
                    placeholder="Please specify the reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                  />
                </div>
              )}
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={blockUser}
                  disabled={!newBlockUser.trim() || (blockReason === 'other' && !customReason.trim())}
                >
                  Block User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blocked users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filter} onValueChange={(value: unknown) => setFilter(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Blocks</SelectItem>
            <SelectItem value="full">Full Blocks</SelectItem>
            <SelectItem value="messages">Message Blocks</SelectItem>
            <SelectItem value="parties">Party Blocks</SelectItem>
            <SelectItem value="profile">Profile Blocks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Blocked Users ({filteredUsers.length})</span>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                <Ban className="h-3 w-3 mr-1" />
                Full: {blockedUsers.filter(u => u.blockType === &apos;full').length}
              </Badge>
              <Badge variant="outline">
                <MessageCircle className="h-3 w-3 mr-1" />
                Messages: {blockedUsers.filter(u => u.blockType === &apos;messages').length}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery || filter !== 'all' ? 'No blocked users match your filters' : 'No blocked users'}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery || filter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Users you block will appear here'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <BlockedUserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
