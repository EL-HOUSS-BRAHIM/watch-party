'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface UserProfile {
  id: string
  username: string
  displayName: string
  avatar: string
  bio?: string
  location?: string
  joinedDate: string
  isOnline: boolean
  lastSeen?: string
  isVerified: boolean
  isPremium: boolean
  stats: {
    friendsCount: number
    partiesHosted: number
    watchTime: number
  }
  mutualFriends: Array<{
    id: string
    username: string
    avatar: string
  }>
  badges: Array<{
    id: string
    name: string
    icon: string
    color: string
  }>
  relationship?: 'friend' | 'pending_out' | 'pending_in' | 'blocked' | 'none'
}

interface ProfilePreviewProps {
  userId: string
  children: React.ReactNode
  trigger?: 'hover' | 'click'
  disabled?: boolean
}

export function ProfilePreview({ 
  userId, 
  children, 
  trigger = 'hover',
  disabled = false 
}: ProfilePreviewProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (isVisible && !profile && !loading) {
      fetchProfile()
    }
  }, [isVisible, profile, loading, userId])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${userId}/preview`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      }
    } catch {
      console.error('Failed to fetch profile preview:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendFriendRequest = async () => {
    try {
      const response = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: userId })
      })

      if (response.ok && profile) {
        setProfile({ ...profile, relationship: 'pending_out' })
      }
    } catch {
      console.error('Failed to send friend request:', error)
    }
  }

  const acceptFriendRequest = async () => {
    try {
      const response = await fetch(`/api/friends/requests/${userId}/accept`, {
        method: 'POST'
      })

      if (response.ok && profile) {
        setProfile({ ...profile, relationship: 'friend' })
      }
    } catch {
      console.error('Failed to accept friend request:', error)
    }
  }

  const removeFriend = async () => {
    try {
      const response = await fetch(`/api/friends/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok && profile) {
        setProfile({ ...profile, relationship: 'none' })
      }
    } catch {
      console.error('Failed to remove friend:', error)
    }
  }

  const blockUser = async () => {
    try {
      const response = await fetch('/api/users/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, blockType: 'full' })
      })

      if (response.ok && profile) {
        setProfile({ ...profile, relationship: 'blocked' })
      }
    } catch {
      console.error('Failed to block user:', error)
    }
  }

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (disabled || trigger !== 'hover') return
    
    const rect = event.currentTarget.getBoundingClientRect()
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8
    })
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    if (trigger !== 'hover') return
    setIsVisible(false)
  }

  const handleClick = (event: React.MouseEvent) => {
    if (disabled || trigger !== 'click') return
    
    event.preventDefault()
    event.stopPropagation()
    
    const rect = event.currentTarget.getBoundingClientRect()
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8
    })
    setIsVisible(!isVisible)
  }

  const getRelationshipButton = () => {
    if (!profile) return null

    switch (profile.relationship) {
      case 'friend':
        return (
          <Button variant="outline" size="sm" onClick={removeFriend}>
            <UserCheck className="h-3 w-3 mr-1" />
            Friends
          </Button>
        )
      case 'pending_out':
        return (
          <Button variant="secondary" size="sm" disabled>
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Button>
        )
      case 'pending_in':
        return (
          <Button size="sm" onClick={acceptFriendRequest}>
            <UserCheck className="h-3 w-3 mr-1" />
            Accept
          </Button>
        )
      case 'blocked':
        return (
          <Button variant="destructive" size="sm" disabled>
            <UserX className="h-3 w-3 mr-1" />
            Blocked
          </Button>
        )
      default:
        return (
          <Button size="sm" onClick={sendFriendRequest}>
            <UserPlus className="h-3 w-3 mr-1" />
            Add Friend
          </Button>
        )
    }
  }

  const formatWatchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    return hours > 0 ? `${hours}h` : `${minutes}m`
  }

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && (
        <>
          {/* Backdrop for click-outside to close */}
          {trigger === 'click' && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsVisible(false)}
            />
          )}
          
          {/* Profile Card */}
          <div
            className="fixed z-50 w-80"
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
              transform: 'translateX(-50%)'
            }}
          >
            <Card className="shadow-lg border-2">
              <CardContent className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : profile ? (
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={profile.avatar} alt={profile.username} />
                          <AvatarFallback>{profile.username[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {profile.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold truncate">{profile.displayName}</h3>
                          {profile.isVerified && (
                            <UserCheck className="h-4 w-4 text-blue-500" />
                          )}
                          {profile.isPremium && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">@{profile.username}</p>
                        
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                          {profile.isOnline ? (
                            <>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Online</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" />
                              <span>Last seen {profile.lastSeen ? new Date(profile.lastSeen).toLocaleDateString() : &apos;recently&apos;}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {profile.bio}
                      </p>
                    )}

                    {/* Location & Join Date */}
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {profile.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {new Date(profile.joinedDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-center">
                      <div>
                        <div className="text-sm font-semibold">{profile.stats.friendsCount}</div>
                        <div className="text-xs text-muted-foreground">Friends</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{profile.stats.partiesHosted}</div>
                        <div className="text-xs text-muted-foreground">Parties</div>
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{formatWatchTime(profile.stats.watchTime)}</div>
                        <div className="text-xs text-muted-foreground">Watched</div>
                      </div>
                    </div>

                    {/* Badges */}
                    {profile.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {profile.badges.slice(0, 3).map((badge) => (
                          <Badge 
                            key={badge.id} 
                            variant="secondary" 
                            className="text-xs"
                            style={{ backgroundColor: badge.color + '20', color: badge.color }}
                          >
                            <span className="mr-1">{badge.icon}</span>
                            {badge.name}
                          </Badge>
                        ))}
                        {profile.badges.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.badges.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Mutual Friends */}
                    {profile.mutualFriends.length > 0 && (
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {profile.mutualFriends.length} mutual friend{profile.mutualFriends.length !== 1 ? 's' : ''}
                        </div>
                        <div className="flex -space-x-1">
                          {profile.mutualFriends.slice(0, 4).map((friend) => (
                            <Avatar key={friend.id} className="w-6 h-6 border-2 border-white">
                              <AvatarImage src={friend.avatar} alt={friend.username} />
                              <AvatarFallback className="text-xs">{friend.username[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                          ))}
                          {profile.mutualFriends.length > 4 && (
                            <div className="w-6 h-6 rounded-full bg-muted border-2 border-white flex items-center justify-center">
                              <span className="text-xs">+{profile.mutualFriends.length - 4}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {getRelationshipButton()}
                      
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Profile
                      </Button>
                      
                      {profile.relationship !== 'blocked' && (
                        <Button variant="ghost" size="sm" onClick={blockUser}>
                          <UserX className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    Failed to load profile
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  )
}
