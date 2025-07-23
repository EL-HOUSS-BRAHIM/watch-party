"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { EmojiPicker } from "@/components/chat/emoji-picker"
import { Smile, Send, MoreHorizontal, Shield, UserX, AlertTriangle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"

interface Message {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: string
  type: "message" | "system" | "reaction"
  isDeleted?: boolean
  reactions?: { emoji: string; count: number; users: string[] }[]
}

interface MessageBubbleProps {
  message: Message
  isOwnMessage: boolean
  isHost: boolean
  isModerator: boolean
  onDeleteMessage?: (messageId: string) => void
  onReportUser?: (userId: string) => void
  onReactToMessage?: (messageId: string, emoji: string) => void
}

export function MessageBubble({ 
  message, 
  isOwnMessage, 
  isHost, 
  isModerator,
  onDeleteMessage,
  onReportUser,
  onReactToMessage 
}: MessageBubbleProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const { user } = useAuth()

  if (message.type === "system") {
    return (
      <div className="flex justify-center py-2">
        <div className="px-3 py-1 rounded-full bg-neo-border text-xs text-neo-text-secondary">
          {message.content}
        </div>
      </div>
    )
  }

  if (message.isDeleted) {
    return (
      <div className="flex gap-3 py-2 opacity-50">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-xs">?</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="text-xs text-neo-text-tertiary italic">
            This message was deleted
          </div>
        </div>
      </div>
    )
  }

  const handleEmojiSelect = (emoji: string) => {
    onReactToMessage?.(message.id, emoji)
    setShowEmojiPicker(false)
  }

  return (
    <div className={`flex gap-3 py-2 group hover:bg-neo-surface-elevated rounded-lg px-2 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      <Avatar className="w-8 h-8">
        <AvatarImage src={message.userAvatar} alt={message.userName} />
        <AvatarFallback className="text-xs bg-gradient-primary text-white">
          {message.userName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <span className="text-sm font-medium text-neo-text-primary">{message.userName}</span>
          <span className="text-xs text-neo-text-tertiary">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>

        <div className={`mt-1 ${isOwnMessage ? 'flex justify-end' : ''}`}>
          <div 
            className={`inline-block px-3 py-2 rounded-lg max-w-xs break-words ${
              isOwnMessage 
                ? 'chat-bubble-self' 
                : 'chat-bubble-other'
            }`}
          >
            <p className="text-sm">{message.content}</p>
          </div>
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.reactions.map((reaction, index) => (
              <button
                key={index}
                onClick={() => handleEmojiSelect(reaction.emoji)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${
                  reaction.users.includes(user?.id || '')
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-neo-surface border-neo-border hover:bg-neo-surface-elevated'
                }`}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Message Actions */}
      <div className={`opacity-0 group-hover:opacity-100 transition-opacity ${isOwnMessage ? 'order-first' : ''}`}>
        <div className="flex items-center gap-1">
          {/* React Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-3 w-3" />
            </Button>

            {showEmojiPicker && (
              <div className="absolute top-8 right-0 z-50">
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              </div>
            )}
          </div>

          {/* More Actions */}
          {(isHost || isModerator || isOwnMessage) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwnMessage && (
                  <DropdownMenuItem onClick={() => onDeleteMessage?.(message.id)}>
                    <UserX className="mr-2 h-3 w-3" />
                    Delete
                  </DropdownMenuItem>
                )}
                {(isHost || isModerator) && !isOwnMessage && (
                  <>
                    <DropdownMenuItem onClick={() => onDeleteMessage?.(message.id)}>
                      <Shield className="mr-2 h-3 w-3" />
                      Delete Message
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onReportUser?.(message.userId)}>
                      <AlertTriangle className="mr-2 h-3 w-3" />
                      Report User
                    </DropdownMenuItem>
                  </>
                )}
                {!isOwnMessage && !isHost && !isModerator && (
                  <DropdownMenuItem onClick={() => onReportUser?.(message.userId)}>
                    <AlertTriangle className="mr-2 h-3 w-3" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
}
