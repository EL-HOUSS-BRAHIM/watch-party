'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface TypingUser {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
}

interface TypingIndicatorsProps {
  partyId: string
  currentUserId: string
  onUserTyping: (isTyping: boolean) => void
  className?: string
}

export function TypingIndicators({ 
  partyId, 
  currentUserId, 
  onUserTyping, 
  className = '' 
}: TypingIndicatorsProps) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])

  useEffect(() => {
    // Simulate typing users (in real app, this would be WebSocket)
    const interval = setInterval(() => {
      if (Math.random() < 0.2) { // 20% chance someone starts typing
        const mockUser: TypingUser = {
          id: Math.random().toString(36),
          username: 'user' + Math.floor(Math.random() * 100),
          display_name: 'User ' + Math.floor(Math.random() * 100),
          avatar_url: null
        }
        
        setTypingUsers(prev => {
          if (prev.find(u => u.id === mockUser.id) || prev.length >= 3) {
            return prev
          }
          return [...prev, mockUser]
        })

        // Remove after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.id !== mockUser.id))
        }, 3000)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  if (typingUsers.length === 0) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 py-2 px-3 text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      <div className="flex -space-x-2">
        {typingUsers.slice(0, 3).map((user) => (
          <Avatar key={user.id} className="w-6 h-6 border-2 border-white dark:border-gray-800">
            <AvatarImage src={user.avatar_url || ''} />
            <AvatarFallback className="text-xs">
              {user.display_name?.charAt(0) || user.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span>
          {typingUsers.length === 1 && (
            `${typingUsers[0].display_name || typingUsers[0].username} is typing`
          )}
          {typingUsers.length === 2 && (
            `${typingUsers[0].display_name || typingUsers[0].username} and ${typingUsers[1].display_name || typingUsers[1].username} are typing`
          )}
          {typingUsers.length > 2 && (
            `${typingUsers.length} people are typing`
          )}
        </span>

        {/* Typing animation dots */}
        <div className="flex space-x-1">
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  )
}
