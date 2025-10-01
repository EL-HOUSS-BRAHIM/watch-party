"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api-client"

interface Conversation {
  id: string
  type: "direct" | "group" | "party"
  name?: string
  participants: Array<{
    id: string
    username: string
    avatar?: string
    is_online: boolean
  }>
  last_message?: {
    id: string
    content: string
    sender: {
      id: string
      username: string
    }
    timestamp: string
  }
  unread_count: number
  created_at: string
}

interface Message {
  id: string
  content: string
  sender: {
    id: string
    username: string
    avatar?: string
  }
  timestamp: string
  message_type: "text" | "system" | "image" | "file"
  edited_at?: string
  reply_to?: {
    id: string
    content: string
    sender: {
      username: string
    }
  }
}

export default function MessagingPage() {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const loadConversations = async () => {
    try {
      const response = await api.get('/api/messaging/conversations/')
      setConversations(response.results || mockConversations)
      
      // Auto-select first conversation
      if (response.results?.length > 0) {
        setSelectedConversation(response.results[0])
      }
    } catch (error) {
      console.error("Failed to load conversations:", error)
      setConversations(mockConversations)
      if (mockConversations.length > 0) {
        setSelectedConversation(mockConversations[0])
      }
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true)
      const response = await api.get(`/api/messaging/conversations/${conversationId}/messages/`)
      setMessages(response.results || mockMessages)
    } catch (error) {
      console.error("Failed to load messages:", error)
      setMessages(mockMessages)
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const message = await api.post(`/api/messaging/conversations/${selectedConversation.id}/messages/`, {
        content: newMessage,
        message_type: "text"
      })
      
      setMessages(prev => [...prev, message])
      setNewMessage("")
      
      // Update conversation last message
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, last_message: { 
              id: message.id, 
              content: message.content, 
              sender: message.sender, 
              timestamp: message.timestamp 
            }} 
          : conv
      ))
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const getConversationName = (conversation: Conversation) => {
    if (conversation.name) return conversation.name
    if (conversation.type === "direct") {
      return conversation.participants
        .filter(p => p.id !== "current-user") // In real app, filter current user
        .map(p => p.username)
        .join(", ")
    }
    return `${conversation.type} chat`
  }

  const getConversationAvatar = (conversation: Conversation) => {
    if (conversation.type === "direct" && conversation.participants.length === 2) {
      const otherUser = conversation.participants.find(p => p.id !== "current-user")
      return otherUser?.avatar
    }
    return null
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return "now"
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  const filteredConversations = conversations.filter(conv =>
    getConversationName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white/60">Loading conversations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-white/60 hover:text-white transition-colors"
            >
              ←
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Messages</h1>
              <p className="text-white/70">Stay connected with your watch party friends</p>
            </div>
          </div>
          
          <button
            onClick={() => router.push("/dashboard/messaging/new")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            <span className="flex items-center gap-2">
              <span>✉️</span>
              New Message
            </span>
          </button>
        </div>

        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Conversations Sidebar */}
          <div className="w-1/3 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">🔍</span>
              </div>
            </div>

            {/* Conversations List */}
            <div className="overflow-y-auto h-full">
              {filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full p-4 border-b border-white/5 hover:bg-white/10 transition-colors text-left ${
                    selectedConversation?.id === conversation.id ? "bg-white/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative">
                      {getConversationAvatar(conversation) ? (
                        <img
                          src={getConversationAvatar(conversation)!}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {conversation.type === "direct" ? "👤" : 
                           conversation.type === "group" ? "👥" : "🎬"}
                        </div>
                      )}
                      
                      {conversation.type === "direct" && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white truncate">
                          {getConversationName(conversation)}
                        </h3>
                        {conversation.unread_count > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {conversation.unread_count}
                          </span>
                        )}
                      </div>
                      
                      {conversation.last_message && (
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-white/60 truncate">
                            {conversation.last_message.sender.username}: {conversation.last_message.content}
                          </p>
                          <span className="text-xs text-white/40 ml-2">
                            {formatTime(conversation.last_message.timestamp)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              
              {filteredConversations.length === 0 && (
                <div className="p-8 text-center">
                  <div className="text-4xl mb-4">💬</div>
                  <h3 className="text-white font-medium mb-2">No conversations found</h3>
                  <p className="text-white/60 text-sm">
                    {searchQuery ? "Try a different search term" : "Start a new conversation!"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-white/5 border border-white/10 rounded-xl flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getConversationAvatar(selectedConversation) ? (
                        <img
                          src={getConversationAvatar(selectedConversation)!}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white">
                          {selectedConversation.type === "direct" ? "👤" : 
                           selectedConversation.type === "group" ? "👥" : "🎬"}
                        </div>
                      )}
                      
                      <div>
                        <h2 className="font-semibold text-white">
                          {getConversationName(selectedConversation)}
                        </h2>
                        <p className="text-sm text-white/60">
                          {selectedConversation.participants.length} participants
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        📞
                      </button>
                      <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        📹
                      </button>
                      <button className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        ⚙️
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <div className="flex justify-center">
                      <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div key={message.id} className="flex gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {message.sender.username.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white">{message.sender.username}</span>
                            <span className="text-xs text-white/40">{formatTime(message.timestamp)}</span>
                          </div>
                          
                          {message.reply_to && (
                            <div className="p-2 bg-white/5 border-l-2 border-purple-500 rounded mb-2">
                              <p className="text-xs text-white/60 mb-1">
                                Replying to {message.reply_to.sender.username}
                              </p>
                              <p className="text-sm text-white/80">{message.reply_to.content}</p>
                            </div>
                          )}
                          
                          <div className="bg-white/10 rounded-lg px-4 py-2 max-w-lg">
                            <p className="text-white">{message.content}</p>
                            {message.edited_at && (
                              <p className="text-xs text-white/40 mt-1">(edited)</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    
                    <button className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      📎
                    </button>
                    
                    <button className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      😊
                    </button>
                    
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                  <p className="text-white/60">Choose a conversation from the sidebar to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock data for fallback
const mockConversations: Conversation[] = [
  {
    id: "1",
    type: "direct",
    participants: [
      { id: "current-user", username: "you", is_online: true },
      { id: "2", username: "alex_movie", is_online: true }
    ],
    last_message: {
      id: "1",
      content: "Hey! Ready for movie night tonight?",
      sender: { id: "2", username: "alex_movie" },
      timestamp: "2025-10-01T14:30:00Z"
    },
    unread_count: 2,
    created_at: "2025-09-25T10:00:00Z"
  },
  {
    id: "2",
    type: "group",
    name: "Horror Movie Fans",
    participants: [
      { id: "current-user", username: "you", is_online: true },
      { id: "3", username: "sarah_scream", is_online: false },
      { id: "4", username: "mike_thriller", is_online: true }
    ],
    last_message: {
      id: "2",
      content: "Anyone up for watching The Conjuring tonight?",
      sender: { id: "3", username: "sarah_scream" },
      timestamp: "2025-10-01T12:15:00Z"
    },
    unread_count: 0,
    created_at: "2025-09-20T15:00:00Z"
  },
  {
    id: "3",
    type: "party",
    name: "Friday Night Movies Party",
    participants: [
      { id: "current-user", username: "you", is_online: true },
      { id: "5", username: "party_host", is_online: true },
      { id: "6", username: "movie_buff", is_online: false }
    ],
    last_message: {
      id: "3",
      content: "Starting the movie in 5 minutes!",
      sender: { id: "5", username: "party_host" },
      timestamp: "2025-10-01T11:45:00Z"
    },
    unread_count: 1,
    created_at: "2025-10-01T11:00:00Z"
  }
]

const mockMessages: Message[] = [
  {
    id: "1",
    content: "Hey! How's it going?",
    sender: { id: "2", username: "alex_movie" },
    timestamp: "2025-10-01T14:00:00Z",
    message_type: "text"
  },
  {
    id: "2",
    content: "Great! Just getting ready for tonight's movie marathon. What do you think we should watch?",
    sender: { id: "current-user", username: "you" },
    timestamp: "2025-10-01T14:02:00Z",
    message_type: "text"
  },
  {
    id: "3",
    content: "I was thinking maybe some classic sci-fi? Blade Runner or The Matrix?",
    sender: { id: "2", username: "alex_movie" },
    timestamp: "2025-10-01T14:05:00Z",
    message_type: "text",
    reply_to: {
      id: "2",
      content: "Great! Just getting ready for tonight's movie marathon. What do you think we should watch?",
      sender: { username: "you" }
    }
  },
  {
    id: "4",
    content: "The Matrix sounds perfect! I'll set up the party room.",
    sender: { id: "current-user", username: "you" },
    timestamp: "2025-10-01T14:30:00Z",
    message_type: "text"
  }
]