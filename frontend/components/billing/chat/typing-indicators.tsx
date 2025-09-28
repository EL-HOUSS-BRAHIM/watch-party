'use client'

import { useEffect, useRef, useState } from 'react'
import { chatAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface TypingUser {
  id: string
  username: string
  displayName: string
  avatarUrl: string | null
}

interface TypingIndicatorsProps {
  partyId: string
  currentUserId: string
  onUserTyping: (isTyping: boolean) => void
  className?: string
}

const POLL_INTERVAL_MS = 5000
const TYPING_RECENCY_MS = 7000

export function TypingIndicators({
  partyId,
  currentUserId,
  onUserTyping,
  className = ''
}: TypingIndicatorsProps) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const errorNotifiedRef = useRef(false)
  const { toast } = useToast()

  useEffect(() => {
    let isMounted = true
    let pollTimeout: ReturnType<typeof setTimeout> | undefined

    const pollTypingUsers = async () => {
      if (!partyId || typeof chatAPI?.getActiveUsers !== 'function') {
        if (isMounted) {
          setTypingUsers([])
        }
        return
      }

      try {
        const response = await chatAPI.getActiveUsers(partyId)
        if (!isMounted) return

        const activeUsers = Array.isArray(response.active_users) ? response.active_users : []
        const now = Date.now()

        const normalizedUsers = activeUsers
          .map(user => {
            const id = String(user?.id ?? '')
            if (!id) return null

            const lastSeen = user?.last_seen ? new Date(user.last_seen).getTime() : undefined
            const isTyping = user?.is_typing ?? (typeof lastSeen === 'number' ? now - lastSeen <= TYPING_RECENCY_MS : false)

            if (!isTyping) {
              return null
            }

            return {
              id,
              username: user?.username ?? 'unknown-user',
              displayName: user?.display_name ?? user?.username ?? 'Unknown user',
              avatarUrl: user?.avatar_url ?? user?.avatar ?? null,
            }
          })
          .filter((user): user is TypingUser => Boolean(user && user.id !== currentUserId))

        setTypingUsers(normalizedUsers)

        if (errorNotifiedRef.current) {
          errorNotifiedRef.current = false
        }
      } catch {
        if (!errorNotifiedRef.current) {
          console.error('Failed to load typing indicators:', error)
          toast({
            title: 'Typing indicators unavailable',
            description: 'Unable to load live typing activity. Please try again later.',
            variant: 'destructive'
          })
          errorNotifiedRef.current = true
        }

        if (isMounted) {
          setTypingUsers([])
        }
      } finally {
        if (isMounted) {
          pollTimeout = setTimeout(pollTypingUsers, POLL_INTERVAL_MS)
        }
      }
    }

    pollTypingUsers()

    return () => {
      isMounted = false
      if (pollTimeout) {
        clearTimeout(pollTimeout)
      }
    }
  }, [partyId, currentUserId, toast])

  useEffect(() => {
    onUserTyping(typingUsers.length > 0)
  }, [typingUsers, onUserTyping])

  if (typingUsers.length === 0) {
    return null
  }

  return (
    <div className={`flex items-center gap-2 py-2 px-3 text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      <div className="flex -space-x-2">
        {typingUsers.slice(0, 3).map((user) => (
          <Avatar key={user.id} className="w-6 h-6 border-2 border-white dark:border-gray-800">
            <AvatarImage src={user.avatarUrl || ''} />
            <AvatarFallback className="text-xs">
              {user.displayName?.charAt(0) || user.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span>
          {typingUsers.length === 1 && (
            `${typingUsers[0].displayName || typingUsers[0].username} is typing`
          )}
          {typingUsers.length === 2 && (
            `${typingUsers[0].displayName || typingUsers[0].username} and ${typingUsers[1].displayName || typingUsers[1].username} are typing`
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
