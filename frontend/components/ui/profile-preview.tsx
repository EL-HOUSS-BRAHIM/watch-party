import { Calendar, Link, MapPin, MessageCircle, User, Users } from "lucide-react"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

'use client'
interface UserProfile {}
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate: string;
  status: 'online' | 'offline' | 'away' | 'busy'
  friendsCount: number;
  partiesCount: number;
  isCurrentUser: boolean;
  isFriend: boolean;
  hasPendingRequest: boolean;
}

interface ProfilePreviewProps {}
  userId: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export function ProfilePreview({ userId, children, disabled = false }: ProfilePreviewProps) {}
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen && !profile && !loading) {
      loadProfile()
    }
  }, [isOpen, userId])

  const loadProfile = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/users/${userId}/profile`)
      if (!response.ok) {
        throw new Error('Failed to load profile')
      }
      const data = await response.json()
      setProfile(data)
    } } catch {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {}
      setLoading(false)
    }
  }

  const handleSendFriendRequest = async () => {
    try {
      const response = await fetch('/api/social/friend-requests', {}
        method: 'POST',
        headers: {}
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })
      if (response.ok) {
        setProfile(prev => prev ? { ...prev, hasPendingRequest: true } : null)
      }
    } } catch {
      console.error('Failed to send friend request:', err)
    }
  }

  const handleSendMessage = () => {}
    // Navigate to messages with this user;
    window.location.href = `/messages?user=${userId}`
  }

  const getStatusColor = (status: UserProfile['status']) => {}
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = (status: UserProfile['status']) => {}
    switch (status) {
      case 'online': return 'Online'
      case 'away': return 'Away'
      case 'busy': return 'Busy'
      default: return 'Offline'
    }
  }

  if (disabled) {
    return <>{children}</>
  }

  const profileContent = () => {}
    if (loading) {
      return (
        <Card className="w-80">
          <CardContent className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      )
    }

    if (error || !profile) {
      return (
        <Card className="w-80">
          <CardContent className="flex flex-col items-center justify-center h-48">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              {error || 'Profile not found'}
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="w-80">
        <CardHeader className="pb-3">
          <div className="flex items-start space-x-3">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar || ''} />
                <AvatarFallback className="text-lg">
                  {profile.displayName?.charAt(0)?.toUpperCase() || <User className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(profile.status)}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{profile.displayName}</h3>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              <Badge variant="outline" className="text-xs mt-1">
                {getStatusText(profile.status)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.bio && (
            <p className="text-sm">{profile.bio}</p>
          )}
          <div className="space-y-2">
            {profile.location && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.website && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <LinkIcon className="h-4 w-4" />
                <a;
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline truncate"
                >
                  {profile.website}
                </a>
              </div>
            )}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Joined {new Date(profile.joinedDate).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{profile.friendsCount} friends</span>
            </div>
            <div className="flex items-center space-x-1">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>{profile.partiesCount} parties</span>
            </div>
          </div>
          {!profile.isCurrentUser && (
            <div className="flex space-x-2 pt-2">
              <Button;
                variant="outline" 
                size="sm" 
                onClick={handleSendMessage}
                className="flex-1"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message;
              </Button>
              {!profile.isFriend && !profile.hasPendingRequest && (
                <Button;
                  size="sm" 
                  onClick={handleSendFriendRequest}
                  className="flex-1"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Friend;
                </Button>
              )}
              {profile.hasPendingRequest && (
                <Button;
                  variant="outline" 
                  size="sm" 
                  disabled;
                  className="flex-1"
                >
                  Request Sent;
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        {profileContent()}
      </PopoverContent>
    </Popover>
  )
}
