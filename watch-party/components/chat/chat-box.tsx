"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSocket } from "@/contexts/socket-context"
import { useAuth } from "@/contexts/auth-context"
import { Send, Smile } from "lucide-react"
import { EmojiPicker } from "./emoji-picker"

interface Message {
  id: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  content: string
  timestamp: Date
  type: "message" | "reaction" | "system"
}

interface ChatBoxProps {
  roomId: string
}

export function ChatBox({ roomId }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { socket } = useSocket()
  const { user } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev, message])
    }

    const handleUserJoined = (data: { user: any }) => {
      const systemMessage: Message = {
        id: Date.now().toString(),
        user: { id: "system", name: "System" },
        content: `${data.user.name} joined the party`,
        timestamp: new Date(),
        type: "system",
      }
      setMessages((prev) => [...prev, systemMessage])
    }

    const handleUserLeft = (data: { user: any }) => {
      const systemMessage: Message = {
        id: Date.now().toString(),
        user: { id: "system", name: "System" },
        content: `${data.user.name} left the party`,
        timestamp: new Date(),
        type: "system",
      }
      setMessages((prev) => [...prev, systemMessage])
    }

    socket.on("new_message", handleNewMessage)
    socket.on("user_joined", handleUserJoined)
    socket.on("user_left", handleUserLeft)

    return () => {
      socket.off("new_message", handleNewMessage)
      socket.off("user_joined", handleUserJoined)
      socket.off("user_left", handleUserLeft)
    }
  }, [socket])

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !user) return

    const message: Message = {
      id: Date.now().toString(),
      user: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      },
      content: newMessage.trim(),
      timestamp: new Date(),
      type: "message",
    }

    socket.emit("send_message", { roomId, message })
    setNewMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
  }

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${message.type === "system" ? "justify-center" : ""}`}
            >
              {message.type === "system" ? (
                <div className="text-xs text-text-tertiary bg-surface rounded-full px-3 py-1">{message.content}</div>
              ) : (
                <>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-text-primary">{message.user.name}</span>
                      <span className="text-xs text-text-tertiary">{formatTime(message.timestamp)}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1 break-words">{message.content}</p>
                  </div>
                </>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="input-base pr-10"
              maxLength={500}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-1 top-1 h-8 w-8 p-0"
            >
              <Smile className="h-4 w-4" />
            </Button>

            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2">
                <EmojiPicker onEmojiSelect={addEmoji} />
              </div>
            )}
          </div>
          <Button onClick={sendMessage} disabled={!newMessage.trim()} size="sm" className="btn-primary">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
