"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { messagingAPI } from "@/lib/api"
import type {
  Message as APIMessage,
  Conversation as APIConversation,
  PaginatedResponse,
  User
} from "@/lib/api/types"

interface Message {
  id: string
  content: string
  type: "text" | "image" | "file" | "system"
  senderId: string
  conversationId: string
  createdAt: string
  isRead: boolean
}

interface Conversation {
  id: string
  name: string
  type: "direct" | "group"
  participants: Array<{
    id: string
    firstName: string
    lastName: string
    avatar?: string
    isOnline: boolean
  }>
  lastMessage?: Message
  unreadCount: number
  createdAt: string
  updatedAt: string
}

interface OnlineUser {
  id: string
  firstName: string
  lastName: string
  avatar?: string
  isOnline: boolean
}

const adaptMessage = (apiMessage: APIMessage): Message => ({
  id: apiMessage.id,
  content: apiMessage.content,
  type: (apiMessage.message_type as Message['type']) || "text",
  senderId: apiMessage.sender.id,
  conversationId: apiMessage.conversation.toString(),
  createdAt: apiMessage.sent_at,
  isRead: apiMessage.is_read,
})

const adaptConversation = (apiConv: APIConversation): Conversation => ({
  id: apiConv.id.toString(),
  name: `Conversation ${apiConv.id}`,
  type: "direct",
  participants: (apiConv.participants || []).map(p => ({
    id: p.id,
    firstName: p.first_name || '',
    lastName: p.last_name || '',
    avatar: p.avatar || undefined,
    isOnline: false,
  })),
  lastMessage: apiConv.last_message ? adaptMessage(apiConv.last_message) : undefined,
  unreadCount: apiConv.unread_count,
  createdAt: apiConv.created_at,
  updatedAt: apiConv.updated_at,
})

export default function MessagesPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

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
      const data = await messagingAPI.getConversations()
      const adaptedConversations = (data.results || []).map(adaptConversation)
      setConversations(adaptedConversations)
    } catch (error) {
      console.error("Failed to load conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await messagingAPI.getMessages(conversationId)
      const adaptedMessages = (data.results || []).map(adaptMessage)
      setMessages(adaptedMessages)
    } catch (error) {
      console.error("Failed to load messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      })
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !selectedConversation || isSending) {
      return
    }

    setIsSending(true)
    const messageContent = newMessage.trim()
    setNewMessage("")

    try {
      const data = await messagingAPI.sendMessage(selectedConversation.id, {
        content: messageContent,
        type: "text",
      })
      
      const adaptedMessage = adaptMessage(data)
      setMessages(prev => [...prev, adaptedMessage])
      
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation.id 
          ? { ...conv, lastMessage: adaptedMessage, updatedAt: adaptedMessage.createdAt }
          : conv
      ))
    } catch (error) {
      console.error("Failed to send message:", error)
      setNewMessage(messageContent)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  if (!user) {
    return <div className="p-4">Please log in to access messages.</div>
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Loading conversations...
            </div>
          ) : conversations.length > 0 ? (
            <div className="space-y-1 p-2">
              {conversations.map(conversation => (
                <div
                  key={conversation.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                    selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {conversation.participants[0]?.firstName[0] || 'U'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">
                        {conversation.name}
                      </p>
                    </div>
                    
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                    
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No conversations found
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  {selectedConversation.participants[0]?.firstName[0] || 'U'}
                </div>
                
                <div>
                  <h3 className="font-medium">{selectedConversation.name}</h3>
                  <p className="text-sm text-gray-500">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === user.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.senderId === user.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs opacity-70">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t bg-white">
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSending}
                />
                
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || isSending}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
              <p className="text-gray-500">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
