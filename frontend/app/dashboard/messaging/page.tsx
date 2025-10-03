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
    <div className="space-y-8">
      {error && (
        <ErrorMessage
          message={error}
          type="error"
          onDismiss={() => setError(null)}
        />
      )}

      <header className="rounded-3xl border border-brand-navy/10 bg-white/90 p-6 shadow-[0_24px_70px_rgba(28,28,46,0.12)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue transition-colors hover:text-brand-blue-dark"
            >
              ← Back to dashboard
            </button>
            <h1 className="mt-3 text-3xl font-bold text-brand-navy">Messages</h1>
            <p className="mt-1 text-sm text-brand-navy/70">
              Stay connected with co-hosts and guests. Continue conversations across watch parties and private groups.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/messaging/new")}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-orange px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-magenta/25 transition-all hover:-translate-y-0.5"
          >
            ✉️ Start new chat
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.38fr,0.62fr]">
        <aside className="flex h-full flex-col gap-4 rounded-3xl border border-brand-navy/10 bg-white/90 p-5 shadow-[0_18px_55px_rgba(28,28,46,0.1)]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-brand-navy">Conversations</h2>
              <p className="text-xs uppercase tracking-[0.35em] text-brand-navy/40">{conversations.length} threads</p>
            </div>
            <button
              onClick={loadConversations}
              className="rounded-full border border-brand-blue/20 bg-brand-blue/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-brand-blue-dark hover:border-brand-blue/40"
            >
              Refresh
            </button>
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/30">🔍</span>
            <input
              type="text"
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-brand-navy/10 bg-white/70 py-2 pl-10 pr-4 text-sm font-medium text-brand-navy placeholder:text-brand-navy/40 focus:border-brand-blue/40 focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </div>

          <div className="space-y-2 overflow-y-auto pr-1">
            {filteredConversations.length === 0 ? (
              <EmptyState
                title="No conversations"
                description="Start a new chat to see it listed here."
                icon="💬"
              />
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${selectedConversation?.id === conversation.id
                    ? "border-brand-purple/30 bg-brand-purple/10 text-brand-purple"
                    : "border-brand-navy/10 bg-white/70 text-brand-navy/70 hover:border-brand-navy/20 hover:text-brand-navy"}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-neutral text-lg">
                      {getConversationAvatar(conversation)
                        ? <img src={getConversationAvatar(conversation)!} alt={getConversationName(conversation)} className="h-full w-full rounded-2xl object-cover" />
                        : conversation.type === "group"
                          ? "👥"
                          : conversation.type === "party"
                            ? "🎬"
                            : "💬"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-sm font-semibold text-brand-navy">{getConversationName(conversation)}</h3>
                        <span className="text-[11px] uppercase tracking-[0.3em] text-brand-navy/40">{formatTime(conversation.last_message?.timestamp || conversation.created_at)}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-brand-navy/50">
                        {conversation.last_message
                          ? `${conversation.last_message.sender.username}: ${conversation.last_message.content}`
                          : "No messages yet"}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        {conversation.participants.slice(0, 3).map(participant => (
                          <span
                            key={participant.id}
                            className={`h-2 w-2 rounded-full ${participant.is_online ? 'bg-brand-cyan' : 'bg-brand-navy/20'}`}
                          />
                        ))}
                        {conversation.unread_count > 0 && (
                          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-brand-blue/20 bg-brand-blue/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-blue-dark">
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

        <section className="flex min-h-[520px] flex-col rounded-3xl border border-brand-navy/10 bg-white/90 p-6 text-brand-navy shadow-[0_18px_55px_rgba(28,28,46,0.1)]">
          {selectedConversation ? (
            <>
              <div className="flex flex-col gap-3 border-b border-brand-navy/10 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-brand-navy">{getConversationName(selectedConversation)}</h2>
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-navy/40">
                    {selectedConversation.participants.length} participants · {selectedConversation.unread_count} unread
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/dashboard/messaging/${selectedConversation.id}`)}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-blue/20 bg-brand-blue/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-blue-dark hover:border-brand-blue/40"
                >
                  Open full view
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                {loadingMessages ? (
                  <LoadingState message="Loading messages..." />
                ) : messages.length === 0 ? (
                  <EmptyState
                    title="No messages yet"
                    description="Start the conversation with a friendly hello."
                    icon="💬"
                  />
                ) : (
                  messages.map(message => (
                    <div
                      key={message.id}
                      className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm shadow-sm ${message.sender.username === "You"
                        ? "ml-auto border-brand-purple/20 bg-brand-purple/10 text-brand-purple-dark"
                        : "border-brand-navy/10 bg-white/80 text-brand-navy"}`}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-semibold">{message.sender.username}</span>
                        <span className="text-[11px] uppercase tracking-[0.3em] text-brand-navy/40">{formatTime(message.timestamp)}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.edited_at && (
                        <span className="mt-2 block text-[10px] uppercase tracking-[0.3em] text-brand-navy/40">
                          Edited {formatTime(message.edited_at)}
                        </span>
                      )}
                      {message.reply_to && (
                        <div className="mt-2 rounded-xl border border-brand-navy/10 bg-white/70 px-3 py-2 text-xs text-brand-navy/60">
                          Replying to {message.reply_to.sender.username}: {message.reply_to.content}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 border-t border-brand-navy/10 pt-4">
                <div className="flex flex-col gap-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full rounded-2xl border border-brand-navy/10 bg-white/75 px-4 py-3 text-sm text-brand-navy placeholder:text-brand-navy/40 focus:border-brand-purple/40 focus:outline-none focus:ring-2 focus:ring-brand-purple/20"
                    rows={3}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-brand-navy/50">
                      <button className="rounded-xl border border-brand-navy/10 bg-white/70 px-3 py-2 text-sm">📎</button>
                      <button className="rounded-xl border border-brand-navy/10 bg-white/70 px-3 py-2 text-sm">😊</button>
                      <button className="rounded-xl border border-brand-navy/10 bg-white/70 px-3 py-2 text-sm">🎙️</button>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-magenta to-brand-orange px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-magenta/25 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Send message
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                title="Select a conversation"
                description="Choose a thread from the list to see the messages."
                icon="💬"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
