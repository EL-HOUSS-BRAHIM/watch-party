"use client"

import { useState, useEffect } from "react"
import { useVirtualKeyboard } from "@/components/mobile"

interface Message {
  id: string
  content: string
  author: {
    id: string
    username: string
    avatar?: string
  }
  timestamp: string
  type: "text" | "emoji" | "system"
}

interface MobileChatProps {
  partyId: string
  currentUser?: any
}

export default function MobileChat({ partyId, currentUser }: MobileChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  
  const { keyboardHeight, isKeyboardVisible, getContainerStyle } = useVirtualKeyboard()

  const commonEmojis = [
    "😀", "😂", "😍", "🤔", "😭", "😱", "👍", "👎", 
    "❤️", "🔥", "👏", "🎉", "😴", "🤮", "💯", "🚀"
  ]

  useEffect(() => {
    loadMessages()
    
    // Simulate real-time updates
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [partyId])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      // Mock messages for demo
      const mockMessages: Message[] = [
        {
          id: "1",
          content: "Welcome to the party! 🎉",
          author: { id: "host", username: "PartyHost", avatar: undefined },
          timestamp: new Date().toISOString(),
          type: "text"
        },
        {
          id: "2",
          content: "This movie is amazing!",
          author: { id: "user1", username: "MovieLover", avatar: undefined },
          timestamp: new Date().toISOString(),
          type: "text"
        },
        {
          id: "3",
          content: "🍿",
          author: { id: "user2", username: "SnackFan", avatar: undefined },
          timestamp: new Date().toISOString(),
          type: "emoji"
        }
      ]
      setMessages(mockMessages)
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    setSending(true)
    try {
      // Mock sending message
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        author: {
          id: currentUser?.id || "user",
          username: currentUser?.username || "You",
          avatar: currentUser?.avatar
        },
        timestamp: new Date().toISOString(),
        type: "text"
      }
      
      setMessages(prev => [...prev, message])
      setNewMessage("")
      setShowEmojiPicker(false)
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSending(false)
    }
  }

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji)
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      const chatContainer = document.getElementById("mobile-chat-messages")
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight
      }
    }, 100)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Messages */}
      <div
        id="mobile-chat-messages"
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={getContainerStyle()}
      >
        {messages.map((message) => {
          const isOwnMessage = message.author.id === currentUser?.id
          
          return (
            <div
              key={message.id}
              className={`flex gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
            >
              {!isOwnMessage && (
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  {message.author.avatar ? (
                    <img
                      src={message.author.avatar}
                      alt={message.author.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm">
                      {message.author.username[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
              )}

              <div className={`max-w-[80%] ${isOwnMessage ? "text-right" : "text-left"}`}>
                {!isOwnMessage && (
                  <div className="text-white/60 text-xs mb-1">{message.author.username}</div>
                )}
                
                <div
                  className={`inline-block px-4 py-2 rounded-2xl ${
                    isOwnMessage
                      ? "bg-blue-600 text-white"
                      : "bg-white/10 text-white"
                  } ${message.type === "emoji" ? "text-2xl py-1" : ""}`}
                >
                  {message.content}
                </div>
                
                <div className="text-white/40 text-xs mt-1">
                  {formatTime(message.timestamp)}
                </div>
              </div>

              {isOwnMessage && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  {currentUser?.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-sm">
                      {currentUser?.username?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="border-t border-white/10 bg-white/5 p-3">
          <div className="grid grid-cols-8 gap-2">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="w-10 h-10 flex items-center justify-center text-xl hover:bg-white/10 rounded-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/10 bg-gray-900 p-4">
        <div className="flex gap-2 items-end">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-3 rounded-full transition-colors ${
              showEmojiPicker ? "bg-yellow-600 text-white" : "bg-white/10 text-white/70"
            }`}
          >
            😊
          </button>

          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                minHeight: "48px",
                maxHeight: "120px"
              }}
            />
          </div>

          <button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span className="text-lg">→</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}