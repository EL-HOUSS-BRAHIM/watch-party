/**
 * WebSocketChat Component
 * Real-time chat with WebSocket, typing indicators, and instant messaging
 */

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { User } from "@/lib/api-client"
import { useWebSocket } from "@/hooks/useWebSocket"
import {
  ChatMessage as WSChatMessage,
  TypingMessage,
  UserJoinedMessage,
  UserLeftMessage,
} from "@/types/websocket"

interface ChatMessage {
  id: string
  user: {
    id: string
    username: string
    avatar?: string
    is_verified?: boolean
    is_premium?: boolean
  }
  content: string
  timestamp: string
  message_type?: 'text' | 'system' | 'reaction'
  edited_at?: string
}

interface WebSocketChatProps {
  partyId: string
  currentUser?: User
  isHost?: boolean
}

export default function WebSocketChat({ partyId, currentUser, isHost: _isHost = false }: WebSocketChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map()) // userId -> username
  const [sending, setSending] = useState(false)
  const [showUsers, setShowUsers] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize WebSocket
  const { status: wsStatus, isConnected, send, subscribe } = useWebSocket({
    partyId,
    autoConnect: true,
  })

  // Handle incoming chat messages
  useEffect(() => {
    const unsubscribe = subscribe<WSChatMessage>('chat_message', (message) => {
      const chatMessage: ChatMessage = {
        id: Date.now().toString() + Math.random(),
        user: {
          id: message.user_id,
          username: message.username,
        },
        content: message.message,
        timestamp: message.timestamp || new Date().toISOString(),
        message_type: 'text',
      }

      setMessages((prev) => [...prev, chatMessage])
    })

    return unsubscribe
  }, [subscribe])

  // Handle typing indicators
  useEffect(() => {
    const unsubscribe = subscribe<TypingMessage>('typing', (message) => {
      if (message.user_id === currentUser?.id) return // Ignore own typing

      setTypingUsers((prev) => {
        const next = new Map(prev)
        if (message.is_typing && message.username) {
          next.set(message.user_id, message.username)
        } else {
          next.delete(message.user_id)
        }
        return next
      })

      // Auto-remove typing indicator after 5 seconds
      if (message.is_typing) {
        setTimeout(() => {
          setTypingUsers((prev) => {
            const next = new Map(prev)
            next.delete(message.user_id)
            return next
          })
        }, 5000)
      }
    })

    return unsubscribe
  }, [subscribe, currentUser?.id])

  // Handle user joined
  useEffect(() => {
    const unsubscribe = subscribe<UserJoinedMessage>('user_joined', (message) => {
      setOnlineUsers((prev) => new Set([...prev, message.user_id]))

      // Add system message
      const systemMessage: ChatMessage = {
        id: Date.now().toString() + Math.random(),
        user: {
          id: 'system',
          username: 'System',
        },
        content: `${message.username} joined the party`,
        timestamp: new Date().toISOString(),
        message_type: 'system',
      }
      setMessages((prev) => [...prev, systemMessage])
    })

    return unsubscribe
  }, [subscribe])

  // Handle user left
  useEffect(() => {
    const unsubscribe = subscribe<UserLeftMessage>('user_left', (message) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev)
        next.delete(message.user_id)
        return next
      })

      // Add system message
      const systemMessage: ChatMessage = {
        id: Date.now().toString() + Math.random(),
        user: {
          id: 'system',
          username: 'System',
        },
        content: `${message.username} left the party`,
        timestamp: new Date().toISOString(),
        message_type: 'system',
      }
      setMessages((prev) => [...prev, systemMessage])

      // Remove from typing users
      setTypingUsers((prev) => {
        const next = new Map(prev)
        next.delete(message.user_id)
        return next
      })
    })

    return unsubscribe
  }, [subscribe])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Send message
  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending || !isConnected) return

    setSending(true)

    try {
      const message: WSChatMessage = {
        type: 'chat_message',
        message: newMessage.trim(),
        user_id: currentUser?.id || 'guest',
        username: currentUser?.username || 'Guest',
        timestamp: new Date().toISOString(),
      }

      send(message)
      setNewMessage("")

      // Stop typing indicator
      if (currentUser?.id) {
        send<TypingMessage>({
          type: 'typing',
          is_typing: false,
          user_id: currentUser.id,
          username: currentUser.username,
        })
      }

    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }, [newMessage, sending, isConnected, send, currentUser])

  // Handle typing indicator with debounce
  const handleTyping = useCallback(() => {
    if (!currentUser?.id || !isConnected) return

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Send typing=true
    send<TypingMessage>({
      type: 'typing',
      is_typing: true,
      user_id: currentUser.id,
      username: currentUser.username,
    })

    // After 3 seconds of no typing, send typing=false
    typingTimeoutRef.current = setTimeout(() => {
      send<TypingMessage>({
        type: 'typing',
        is_typing: false,
        user_id: currentUser.id,
        username: currentUser.username,
      })
    }, 3000)
  }, [currentUser, isConnected, send])

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    handleTyping()
  }, [handleTyping])

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const typingUsersArray = Array.from(typingUsers.values())
  const typingText = typingUsersArray.length > 0
    ? typingUsersArray.length === 1
      ? `${typingUsersArray[0]} is typing...`
      : typingUsersArray.length === 2
        ? `${typingUsersArray[0]} and ${typingUsersArray[1]} are typing...`
        : `${typingUsersArray.length} people are typing...`
    : null

  return (
    <div className="flex flex-col h-full bg-white/5 border border-brand-navy/10 rounded-lg overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">Chat</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-white/60">
              {onlineUsers.size} online
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-brand-navy rounded text-sm transition-colors"
          >
            👥 Users
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Messages Area */}
        <div className="flex flex-col flex-1">
          {/* Messages Container */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
          >
            {!isConnected && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-3">
                <p className="text-yellow-300 text-sm">
                  {wsStatus === 'connecting' && '🔄 Connecting to chat...'}
                  {wsStatus === 'reconnecting' && '🔄 Reconnecting to chat...'}
                  {wsStatus === 'disconnected' && '❌ Disconnected from chat'}
                  {wsStatus === 'error' && '❌ Connection error'}
                </p>
              </div>
            )}

            {messages.length === 0 && isConnected && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-white/60">No messages yet. Start the conversation!</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.message_type === "system" ? "justify-center" : ""
                }`}
              >
                {message.message_type !== "system" && (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {message.user.avatar ? (
                      <img
                        src={message.user.avatar}
                        alt={message.user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-white/60">
                        {message.user.username?.charAt(0).toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                )}

                <div className={`flex-1 min-w-0 ${
                  message.message_type === "system" ? "text-center" : ""
                }`}>
                  {message.message_type !== "system" && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-sm">
                        {message.user.username}
                      </span>
                      {message.user.is_verified && (
                        <span className="text-brand-cyan-light text-xs">✓</span>
                      )}
                      {message.user.is_premium && (
                        <span className="text-brand-orange-light text-xs">⭐</span>
                      )}
                      <span className="text-white/40 text-xs">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  )}

                  <div className={`text-sm ${
                    message.message_type === "system" 
                      ? "text-brand-navy/60 italic bg-white/5 rounded-lg px-3 py-2 inline-block"
                      : "text-white/90"
                  }`}>
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator */}
          {typingText && (
            <div className="px-4 pb-2">
              <p className="text-xs text-white/50 italic">{typingText}</p>
            </div>
          )}

          {/* Message Input */}
          <div className="p-4 border-t border-white/10">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                disabled={sending || !isConnected}
                className="flex-1 px-3 py-2 bg-white/10 border border-brand-navy/20 rounded-lg text-brand-navy text-sm placeholder-brand-navy/50 focus:outline-none focus:ring-2 focus:ring-brand-blue disabled:opacity-50"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim() || !isConnected}
                className="px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark disabled:bg-blue-600/50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {sending ? "..." : "Send"}
              </button>
            </form>
            
            {newMessage.length > 400 && (
              <div className="text-xs text-white/60 mt-1">
                {500 - newMessage.length} characters remaining
              </div>
            )}
          </div>
        </div>

        {/* Active Users Sidebar */}
        {showUsers && (
          <div className="w-64 border-l border-white/10 bg-white/5 flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h4 className="font-semibold text-white">Online ({onlineUsers.size})</h4>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {Array.from(onlineUsers).map((userId) => (
                <div
                  key={userId}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-xs text-white/60">👤</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <span className="text-white text-sm truncate">User {userId.slice(0, 8)}</span>
                  </div>
                </div>
              ))}

              {onlineUsers.size === 0 && (
                <div className="text-center py-4">
                  <p className="text-white/60 text-sm">No users online</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
