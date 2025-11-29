"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api-client"
import { LoadingState, ErrorMessage, EmptyState } from "@/components/ui/feedback"

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
  const [error, setError] = useState<string | null>(null)
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
      setLoading(true)
      setError(null)
      const response = await api.get('/api/messaging/conversations/')
      setConversations(response.results || [])

      if (response.results?.length > 0) {
        setSelectedConversation(response.results[0])
      }
    } catch (err) {
      console.error("Failed to load conversations:", err)
      setError(err instanceof Error ? err.message : 'Failed to load conversations from API')
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true)
      const response = await api.get(`/api/messaging/conversations/${conversationId}/messages/`)
      setMessages(response.results || [])
    } catch (err) {
      console.error("Failed to load messages:", err)
      setMessages([])
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

      setConversations(prev => prev.map(conv =>
        conv.id === selectedConversation.id
          ? {
            ...conv,
            last_message: {
              id: message.id,
              content: message.content,
              sender: message.sender,
              timestamp: message.timestamp
            }
          }
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
        .filter(p => p.id !== "current-user")
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
    return <LoadingState message="Loading conversations..." />
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {error && (
        <ErrorMessage
          message={error}
          type="error"
          onDismiss={() => setError(null)}
        />
      )}

      <header className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-brand-navy/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br from-brand-magenta/10 to-brand-orange/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-blue transition-colors hover:text-brand-blue-dark group min-h-[44px]"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to dashboard
            </button>
            <h1 className="mt-2 sm:mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-navy">Messages</h1>
            <p className="mt-1 text-xs sm:text-sm font-medium text-brand-navy/70">
              Stay connected with co-hosts and guests across watch parties.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/messaging/new")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-orange px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-brand-magenta/25 transition-all hover:-translate-y-0.5 min-h-[44px]"
          >
            <span>✉️</span> Start new chat
          </button>
        </div>
      </header>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[0.38fr,0.62fr]">
        <aside className="flex h-full flex-col gap-3 sm:gap-4 glass-panel rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-5 page-sidebar">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-brand-navy">Conversations</h2>
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.35em] text-brand-navy/40 font-bold mt-1">{conversations.length} threads</p>
            </div>
            <button
              onClick={loadConversations}
              className="rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-brand-blue-dark hover:border-brand-blue/40 transition-colors min-h-[32px] sm:min-h-[36px]"
            >
              Refresh
            </button>
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-brand-navy/30 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg sm:rounded-xl border border-brand-navy/10 bg-white/40 py-2.5 sm:py-3 pl-9 sm:pl-10 pr-3 sm:pr-4 text-xs sm:text-sm font-medium text-brand-navy placeholder:text-brand-navy/40 focus:border-brand-blue/40 focus:bg-white/60 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
            />
          </div>

          <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar max-h-[300px] lg:max-h-none">
            {filteredConversations.length === 0 ? (
              <EmptyState
                title="No conversations"
                message="Start a new chat to see it listed here."
                icon="💬"
              />
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full rounded-xl sm:rounded-2xl border px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-all group min-h-[64px] ${selectedConversation?.id === conversation.id
                    ? "border-brand-purple/30 bg-brand-purple/10 text-brand-purple shadow-md"
                    : "border-brand-navy/10 bg-white/40 text-brand-navy/70 hover:bg-white/60 hover:border-brand-navy/20 hover:text-brand-navy hover:shadow-sm hover:-translate-y-0.5"}`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 text-base sm:text-lg shadow-inner shrink-0">
                      {getConversationAvatar(conversation)
                        ? <img src={getConversationAvatar(conversation)!} alt={getConversationName(conversation)} className="h-full w-full rounded-lg sm:rounded-xl object-cover" />
                        : conversation.type === "group"
                          ? "👥"
                          : conversation.type === "party"
                            ? "🎬"
                            : "💬"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-xs sm:text-sm font-bold text-brand-navy group-hover:text-brand-purple transition-colors">{getConversationName(conversation)}</h3>
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-brand-navy/40 font-bold shrink-0">{formatTime(conversation.last_message?.timestamp || conversation.created_at)}</span>
                      </div>
                      <p className="mt-1 truncate text-[10px] sm:text-xs font-medium text-brand-navy/50">
                        {conversation.last_message
                          ? `${conversation.last_message.sender.username}: ${conversation.last_message.content}`
                          : "No messages yet"}
                      </p>
                      <div className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2">
                        {conversation.participants.slice(0, 3).map(participant => (
                          <span
                            key={participant.id}
                            className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ring-1 ring-white ${participant.is_online ? 'bg-brand-cyan shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'bg-brand-navy/20'}`}
                          />
                        ))}
                        {conversation.unread_count > 0 && (
                          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-brand-blue/20 bg-brand-blue/10 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-brand-blue-dark">
                            {conversation.unread_count} new
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="flex min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] flex-col glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 text-brand-navy relative overflow-hidden">
          {selectedConversation ? (
            <>
              <div className="flex flex-col gap-3 sm:gap-4 border-b border-brand-navy/10 pb-3 sm:pb-4 sm:flex-row sm:items-center sm:justify-between bg-white/20 -mx-4 sm:-mx-5 lg:-mx-6 -mt-4 sm:-mt-5 lg:-mt-6 p-4 sm:p-5 lg:p-6 backdrop-blur-sm z-10">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-brand-navy">{getConversationName(selectedConversation)}</h2>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-brand-navy/40 font-bold mt-1">
                    {selectedConversation.participants.length} participants · {selectedConversation.unread_count} unread
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/messaging/${selectedConversation.id}`)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg sm:rounded-xl border border-brand-blue/20 bg-brand-blue/10 px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-brand-blue-dark hover:border-brand-blue/40 hover:bg-brand-blue/20 transition-all min-h-[40px] sm:min-h-[44px]"
                >
                  Open full view
                </button>
              </div>

              <div className="flex-1 space-y-3 sm:space-y-4 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar py-3 sm:py-4">
                {loadingMessages ? (
                  <LoadingState message="Loading messages..." />
                ) : messages.length === 0 ? (
                  <EmptyState
                    title="No messages yet"
                    message="Start the conversation with a friendly hello."
                    icon="💬"
                  />
                ) : (
                  messages.map(message => (
                    <div
                      key={message.id}
                      className={`max-w-[90%] sm:max-w-[85%] rounded-xl sm:rounded-2xl border px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 text-xs sm:text-sm shadow-sm transition-all hover:shadow-md ${message.sender.username === "You"
                        ? "ml-auto border-brand-purple/20 bg-brand-purple/10 text-brand-purple-dark rounded-tr-none"
                        : "border-brand-navy/10 bg-white/60 text-brand-navy rounded-tl-none"}`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2 sm:gap-4">
                        <span className="font-bold text-[10px] sm:text-xs">{message.sender.username}</span>
                        <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] opacity-60 font-bold">{formatTime(message.timestamp)}</span>
                      </div>
                      <p className="whitespace-pre-wrap leading-relaxed font-medium">{message.content}</p>
                      {message.edited_at && (
                        <span className="mt-2 block text-[8px] sm:text-[9px] uppercase tracking-[0.15em] sm:tracking-[0.2em] opacity-50 font-bold">
                          Edited {formatTime(message.edited_at)}
                        </span>
                      )}
                      {message.reply_to && (
                        <div className="mt-2 rounded-lg sm:rounded-xl border border-black/5 bg-black/5 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs opacity-70 italic">
                          Replying to {message.reply_to.sender.username}: {message.reply_to.content}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 sm:mt-4 border-t border-brand-navy/10 pt-3 sm:pt-4 bg-white/20 -mx-4 sm:-mx-5 lg:-mx-6 -mb-4 sm:-mb-5 lg:-mb-6 p-4 sm:p-5 lg:p-6 backdrop-blur-sm">
                <div className="flex flex-col gap-2 sm:gap-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full rounded-xl sm:rounded-2xl border border-brand-navy/10 bg-white/60 px-3 sm:px-4 lg:px-5 py-3 sm:py-4 text-xs sm:text-sm text-brand-navy placeholder:text-brand-navy/40 focus:border-brand-purple/40 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-purple/10 transition-all font-medium"
                    rows={2}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-brand-navy/50">
                      <button className="rounded-lg sm:rounded-xl border border-brand-navy/10 bg-white/60 p-2 sm:px-3 sm:py-2 text-xs sm:text-sm hover:bg-white hover:text-brand-purple transition-colors min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px]">📎</button>
                      <button className="rounded-lg sm:rounded-xl border border-brand-navy/10 bg-white/60 p-2 sm:px-3 sm:py-2 text-xs sm:text-sm hover:bg-white hover:text-brand-purple transition-colors min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px]">😊</button>
                      <button className="rounded-lg sm:rounded-xl border border-brand-navy/10 bg-white/60 p-2 sm:px-3 sm:py-2 text-xs sm:text-sm hover:bg-white hover:text-brand-purple transition-colors min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px]">🎙️</button>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-brand-magenta to-brand-orange px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-brand-magenta/25 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 min-h-[44px]"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                title="Select a conversation"
                message="Choose a thread from the list to see the messages."
                icon="💬"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
