"use client"

import { useState, useEffect, useRef } from "react"
import { chatApi, ChatMessage, User } from "@/lib/api-client"

interface ChatComponentProps {
  partyId: string
  currentUser?: User
  isHost?: boolean
}

export default function ChatComponent({ partyId, currentUser, isHost = false }: ChatComponentProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [activeUsers, setActiveUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const [showUsers, setShowUsers] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()
    loadActiveUsers()
    joinRoom()

    // Set up polling for new messages (in production, use WebSocket)
    const interval = setInterval(loadMessages, 3000)
    const usersInterval = setInterval(loadActiveUsers, 10000)

    return () => {
      clearInterval(interval)
      clearInterval(usersInterval)
      leaveRoom()
    }
  }, [partyId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      const response = await chatApi.getMessages(partyId, { page_size: 100 })
      const messagesList = Array.isArray(response) ? response : (response.results || [])
      setMessages(messagesList.reverse()) // Reverse to show oldest first
      setError("")
    } catch (_error) {
      setError("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  const loadActiveUsers = async () => {
    try {
      const users = await chatApi.getActiveUsers(partyId)
      setActiveUsers(users)
    } catch (error) {
      console.error("Failed to load active users:", error)
    }
  }

  const joinRoom = async () => {
    try {
      await chatApi.joinRoom(partyId)
    } catch (error) {
      console.error("Failed to join chat room:", error)
    }
  }

  const leaveRoom = async () => {
    try {
      await chatApi.leaveRoom(partyId)
    } catch (error) {
      console.error("Failed to leave chat room:", error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || sending) return

    setSending(true)

    try {
      const message = await chatApi.sendMessage(partyId, newMessage.trim())
      setMessages(prev => [...prev, message])
      setNewMessage("")
    } catch (_error) {
      setError("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  const banUser = async (userId: string, username: string) => {
    if (!isHost) return
    
    const reason = prompt(`Reason for banning ${username}:`)
    if (!reason) return

    try {
      await chatApi.banUser(partyId, userId, reason)
      await loadActiveUsers()
      alert(`${username} has been banned from the chat.`)
    } catch (error) {
      alert("Failed to ban user: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "system": return "🤖"
      case "reaction": return "😊"
      default: return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-white/5 border border-white/10 rounded-lg overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">Chat</h3>
          <span className="text-sm text-white/60">
            {activeUsers.length} online
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors"
          >
            👥 Users
          </button>
          
          {isHost && (
            <button
              onClick={() => {/* TODO: Open moderation panel */}}
              className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-sm transition-colors"
            >
              🛡️ Moderate
            </button>
          )}
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
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-white/60 text-sm">Loading messages...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {!loading && messages.length === 0 && (
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
                        <span className="text-green-400 text-xs">✓</span>
                      )}
                      {message.user.is_premium && (
                        <span className="text-yellow-400 text-xs">⭐</span>
                      )}
                      <span className="text-white/40 text-xs">
                        {formatTime(message.timestamp)}
                      </span>
                      
                      {isHost && message.user.id !== currentUser?.id && (
                        <button
                          onClick={() => banUser(message.user.id, message.user.username)}
                          className="text-red-400 hover:text-red-300 text-xs ml-2"
                          title="Ban user"
                        >
                          🚫
                        </button>
                      )}
                    </div>
                  )}

                  <div className={`text-sm ${
                    message.message_type === "system" 
                      ? "text-white/60 italic bg-white/5 rounded-lg px-3 py-2 inline-block"
                      : "text-white/90"
                  }`}>
                    {getMessageTypeIcon(message.message_type) && (
                      <span className="mr-2">
                        {getMessageTypeIcon(message.message_type)}
                      </span>
                    )}
                    {message.content}
                  </div>

                  {message.edited_at && (
                    <div className="text-xs text-white/40 mt-1">
                      (edited)
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-white/10">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg text-sm font-medium transition-colors"
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
              <h4 className="font-semibold text-white">Online ({activeUsers.length})</h4>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activeUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-white/60">
                        {user.username?.charAt(0).toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-white text-sm truncate">
                        {user.username}
                      </span>
                      {user.is_verified && (
                        <span className="text-green-400 text-xs">✓</span>
                      )}
                      {user.is_premium && (
                        <span className="text-yellow-400 text-xs">⭐</span>
                      )}
                    </div>
                  </div>

                  {isHost && user.id !== currentUser?.id && (
                    <button
                      onClick={() => banUser(user.id, user.username)}
                      className="text-red-400 hover:text-red-300 text-xs"
                      title="Ban user"
                    >
                      🚫
                    </button>
                  )}
                </div>
              ))}

              {activeUsers.length === 0 && (
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