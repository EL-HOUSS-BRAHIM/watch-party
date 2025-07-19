'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { UserPlus, UserMinus, Clock, Check, X } from 'lucide-react'

interface FriendCardProps {
  friend: {
    id: string
    name: string
    username: string
    avatar?: string
    status: 'pending' | 'accepted' | 'declined' | 'suggestion'
    isOnline?: boolean
    mutualFriends?: number
  }
  onAccept?: (id: string) => void
  onDecline?: (id: string) => void
  onRemove?: (id: string) => void
  onSendRequest?: (id: string) => void
}

export function FriendCard({ 
  friend, 
  onAccept, 
  onDecline, 
  onRemove, 
  onSendRequest 
}: FriendCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (action: () => void) => {
    setIsLoading(true)
    try {
      action()
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    switch (friend.status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'accepted':
        return friend.isOnline ? (
          <Badge className="bg-success text-success-foreground">Online</Badge>
        ) : (
          <Badge variant="outline">Offline</Badge>
        )
      case 'suggestion':
        return <Badge variant="outline">Suggestion</Badge>
      default:
        return null
    }
  }

  return (
    <Card className="card hover:card-elevated transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar with Online Indicator */}
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={friend.avatar} alt={friend.name} />
              <AvatarFallback className="bg-neo-surface text-neo-text-primary">
                {friend.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {friend.isOnline && friend.status === 'accepted' && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-success rounded-full border-2 border-neo-background"></div>
            )}
          </div>

          {/* Friend Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-neo-text-primary truncate">
                {friend.name}
              </h3>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-neo-text-secondary mb-1">
              @{friend.username}
            </p>
            {friend.mutualFriends && friend.mutualFriends > 0 && (
              <p className="text-xs text-neo-text-secondary">
                {friend.mutualFriends} mutual friends
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-1">
            {friend.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  className="btn-primary h-8"
                  disabled={isLoading}
                  onClick={() => handleAction(() => onAccept?.(friend.id))}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-neo-text-secondary hover:text-error"
                  disabled={isLoading}
                  onClick={() => handleAction(() => onDecline?.(friend.id))}
                >
                  <X className="h-3 w-3 mr-1" />
                  Decline
                </Button>
              </>
            )}

            {friend.status === 'accepted' && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-neo-text-secondary hover:text-error"
                disabled={isLoading}
                onClick={() => handleAction(() => onRemove?.(friend.id))}
              >
                <UserMinus className="h-3 w-3 mr-1" />
                Remove
              </Button>
            )}

            {friend.status === 'suggestion' && (
              <Button
                size="sm"
                className="btn-primary h-8"
                disabled={isLoading}
                onClick={() => handleAction(() => onSendRequest?.(friend.id))}
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Add
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
