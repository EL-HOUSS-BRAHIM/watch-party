"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useSocket } from "@/contexts/socket-context"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { Send, Smile, ImageIcon, Crown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ChatMessage {
  id: string
  content: string
  user: {
    id: string
    username: string
    avatar?: string
  }
  timestamp: string
  type: "message" | "system" | "reaction"
  reactions?: { emoji: string; count: number; users: string[] }[]
}

interface ChatInterfaceProps {
  partyId: string
  className?: string
}

// Mock messages
const mockMessages: ChatMessage[] = [
  {
    id: "1",
    content: "Hey everyone! Ready for movie night? 🍿",
    user: {
      id: "host-1",
      username: "sarah_j",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
    type: "message",
    reactions: [
      { emoji: "👍", count: 3, users: ["user-2", "user-3", "user-4"] },
      { emoji: "🍿", count: 2, users: ["user-2", "user-3"] },
    ],
  },
  {
    id: "2",
    content: "mike_c joined the party",
    user: {
      id: "system",
      username: "System",
    },
    timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    type: "system",
  },
  {
    id: "3",
    content: "This is going to be epic! Can't wait 🎬",
    user: {
      id: "user-2",
      username: "mike_c",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    timestamp: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
    type: "message",
  },
]

const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "😡"]

export function ChatInterface({ partyId, className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { socket } = useSocket(`/chat/${partyId}`)
  const { user } = useAuth()

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Socket event handlers
  useEffect(() => {
    if (!socket) return

    socket.on("chat:message", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message])
    })

    socket.on("chat:reaction", (data: { messageId: string; emoji: string; userId: string }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId) {
            const reactions = msg.reactions || []
            const existingReaction = reactions.find((r) => r.emoji === data.emoji)

            if (existingReaction) {
              if (existingReaction.users.includes(data.userId)) {
                // Remove reaction
                existingReaction.count--
                existingReaction.users = existingReaction.users.filter((id) => id !== data.userId)
                if (existingReaction.count === 0) {
                  return { ...msg, reactions: reactions.filter((r) => r.emoji !== data.emoji) }
                }
              } else {
                // Add reaction
                existingReaction.count++
                existingReaction.users.push(data.userId)
              }
            } else {
              // New reaction
              reactions.push({ emoji: data.emoji, count: 1, users: [data.userId] })
            }

            return { ...msg, reactions }
          }
          return msg
        }),
      )
    })

    socket.on("chat:typing", (data: { userId: string; isTyping: boolean }) => {
      // Handle typing indicator
      setIsTyping(data.isTyping)
    })

    return () => {
      socket.off("chat:message")
      socket.off("chat:reaction")
      socket.off("chat:typing")
    }
  }, [socket])

  const sendMessage = () => {
    if (!inputValue.trim() || !socket || !user) return

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      },
      timestamp: new Date().toISOString(),
      type: "message",
    }

    socket.emit("chat:message", message)
    setInputValue("")
  }

  const addReaction = (messageId: string, emoji: string) => {
    if (!socket || !user) return

    socket.emit("chat:reaction", {
      messageId,
      emoji,
      userId: user.id,
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const renderMessage = (message: ChatMessage) => {
    if (message.type === "system") {
      return (
        <div className="text-center py-2">
          <Badge variant="secondary" className="text-xs">
            {message.content}
          </Badge>
        </div>
      )
    }

    const isOwnMessage = message.user.id === user?.id

    return (
      <div className={cn("flex space-x-3", isOwnMessage && "flex-row-reverse space-x-reverse")}>
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={message.user.avatar || "/placeholder.svg"} />
          <AvatarFallback>{message.user.username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className={cn("flex-1 min-w-0", isOwnMessage && "text-right")}>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium">{message.user.username}</span>
            {message.user.id === "host-1" && <Crown className="w-3 h-3 text-accent-premium" />}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </span>
          </div>

          <div
            className={cn(
              "inline-block p-3 rounded-lg max-w-xs break-words",
              isOwnMessage ? "bg-primary text-primary-foreground" : "bg-background-secondary",
            )}
          >
            <p className="text-sm">{message.content}</p>
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction) => (
                <Button
                  key={reaction.emoji}
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs bg-transparent"
                  onClick={() => addReaction(message.id, reaction.emoji)}
                >
                  {reaction.emoji} {reaction.count}
                </Button>
              ))}
            </div>
          )}

          {/* Quick Reactions */}
          <div className="flex space-x-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {quickReactions.slice(0, 3).map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-xs hover:bg-background-secondary"
                onClick={() => addReaction(message.id, emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="group">
              {renderMessage(message)}
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
              <span className="text-sm">Someone is typing...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/40">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-20"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Smile className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <ImageIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Button onClick={sendMessage} disabled={!inputValue.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick Reactions */}
        <div className="flex space-x-1 mt-2">
          {quickReactions.map((emoji) => (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => {
                // Send as quick message
                if (socket && user) {
                  const message: ChatMessage = {
                    id: Date.now().toString(),
                    content: emoji,
                    user: {
                      id: user.id,
                      username: user.username,
                      avatar: user.avatar,
                    },
                    timestamp: new Date().toISOString(),
                    type: "reaction",
                  }
                  socket.emit("chat:message", message)
                }
              }}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
