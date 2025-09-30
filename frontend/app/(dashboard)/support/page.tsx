"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api-client"

interface SupportTicket {
  id: string
  title: string
  description: string
  status: "open" | "in_progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  category: string
  created_at: string
  updated_at: string
  user: {
    id: string
    username: string
    avatar?: string
  }
  assigned_to?: {
    id: string
    username: string
    avatar?: string
  }
  messages: Array<{
    id: string
    content: string
    created_at: string
    author: {
      id: string
      username: string
      avatar?: string
      is_staff: boolean
    }
    attachments?: Array<{
      id: string
      filename: string
      url: string
      size: number
    }>
  }>
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateTicket, setShowCreateTicket] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as const
  })
  const [creating, setCreating] = useState(false)

  const categories = [
    { value: "technical", label: "Technical Issue" },
    { value: "account", label: "Account Problem" },
    { value: "billing", label: "Billing Question" },
    { value: "feature", label: "Feature Request" },
    { value: "bug", label: "Bug Report" },
    { value: "other", label: "Other" }
  ]

  useEffect(() => {
    loadTickets()
  }, [])

  const loadTickets = async () => {
    try {
      const response = await api.support.getTickets()
      setTickets(response.results || [])
    } catch (error) {
      console.error("Failed to load tickets:", error)
    } finally {
      setLoading(false)
    }
  }

  const createTicket = async () => {
    if (!newTicket.title.trim() || !newTicket.description.trim() || !newTicket.category) {
      alert("Please fill in all required fields")
      return
    }

    setCreating(true)
    try {
      await api.support.createTicket(newTicket)
      setNewTicket({
        title: "",
        description: "",
        category: "",
        priority: "medium"
      })
      setShowCreateTicket(false)
      await loadTickets()
    } catch (error) {
      alert("Failed to create ticket: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setCreating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "text-blue-400 bg-blue-600/20"
      case "in_progress": return "text-yellow-400 bg-yellow-600/20"
      case "resolved": return "text-green-400 bg-green-600/20"
      case "closed": return "text-gray-400 bg-gray-600/20"
      default: return "text-gray-400 bg-gray-600/20"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "text-green-400 bg-green-600/20"
      case "medium": return "text-yellow-400 bg-yellow-600/20"
      case "high": return "text-orange-400 bg-orange-600/20"
      case "urgent": return "text-red-400 bg-red-600/20"
      default: return "text-gray-400 bg-gray-600/20"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-white/10 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Support Center</h1>
            <p className="text-white/60">Get help with your account and technical issues</p>
          </div>
          <button
            onClick={() => setShowCreateTicket(!showCreateTicket)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            {showCreateTicket ? "Cancel" : "New Ticket"}
          </button>
        </div>

        {/* Quick Help Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <a
            href="/help/faq"
            className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors group"
          >
            <div className="text-2xl mb-3">❓</div>
            <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
              FAQ
            </h3>
            <p className="text-white/60 text-sm">Find answers to common questions</p>
          </a>

          <a
            href="/help/docs"
            className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors group"
          >
            <div className="text-2xl mb-3">📚</div>
            <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
              Documentation
            </h3>
            <p className="text-white/60 text-sm">Detailed guides and tutorials</p>
          </a>

          <a
            href="/help/community"
            className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors group"
          >
            <div className="text-2xl mb-3">👥</div>
            <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
              Community
            </h3>
            <p className="text-white/60 text-sm">Connect with other users</p>
          </a>
        </div>

        {/* Create Ticket Form */}
        {showCreateTicket && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Create Support Ticket</h2>
            
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Title *</label>
                <input
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief description of your issue"
                  maxLength={200}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Category *</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Description *</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Please provide detailed information about your issue..."
                  rows={6}
                  maxLength={2000}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <div className="text-white/40 text-xs mt-1">
                  {newTicket.description.length}/2000 characters
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={createTicket}
                  disabled={creating}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {creating ? "Creating..." : "Create Ticket"}
                </button>
                <button
                  onClick={() => setShowCreateTicket(false)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tickets List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Your Support Tickets</h2>
            <div className="text-white/60 text-sm">
              {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
            </div>
          </div>

          {tickets.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold text-white mb-2">No Support Tickets</h3>
              <p className="text-white/60 mb-6">
                You haven't created any support tickets yet.
              </p>
              <button
                onClick={() => setShowCreateTicket(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Create Your First Ticket
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-6 cursor-pointer transition-colors"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2">{ticket.title}</h3>
                      <p className="text-white/60 text-sm line-clamp-2 mb-3">
                        {ticket.description}
                      </p>
                    </div>
                    <div className="text-white/40 text-sm ml-4">
                      #{ticket.id.slice(-6)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace("_", " ").toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.toUpperCase()}
                      </span>
                      <span className="text-white/60 text-sm">
                        {categories.find(c => c.value === ticket.category)?.label || ticket.category}
                      </span>
                    </div>

                    <div className="text-white/60 text-sm">
                      {formatDate(ticket.updated_at)}
                    </div>
                  </div>

                  {ticket.assigned_to && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-white/60">
                      <span>Assigned to:</span>
                      {ticket.assigned_to.avatar && (
                        <img
                          src={ticket.assigned_to.avatar}
                          alt={ticket.assigned_to.username}
                          className="w-4 h-4 rounded-full"
                        />
                      )}
                      <span>{ticket.assigned_to.username}</span>
                    </div>
                  )}

                  {ticket.messages.length > 0 && (
                    <div className="mt-3 text-sm text-white/60">
                      Last reply: {formatDate(ticket.messages[ticket.messages.length - 1].created_at)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Detail Modal */}
        {selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onUpdate={loadTickets}
          />
        )}
      </div>
    </div>
  )
}

// Ticket Detail Modal Component
interface TicketDetailModalProps {
  ticket: SupportTicket
  onClose: () => void
  onUpdate: () => void
}

function TicketDetailModal({ ticket, onClose, onUpdate }: TicketDetailModalProps) {
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    setSending(true)
    try {
      await api.support.addTicketMessage(ticket.id, {
        content: newMessage.trim()
      })
      setNewMessage("")
      onUpdate()
    } catch (error) {
      alert("Failed to send message: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
      <div className="bg-gray-900 border border-white/20 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-white">{ticket.title}</h2>
            <p className="text-white/60 text-sm">Ticket #{ticket.id.slice(-6)}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-96 p-6">
          {/* Original Description */}
          <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">📝</span>
              </div>
              <span className="font-medium text-white">Original Issue</span>
              <span className="text-white/60 text-sm">{ticket.created_at}</span>
            </div>
            <p className="text-white/80">{ticket.description}</p>
          </div>

          {/* Messages */}
          {ticket.messages.length > 0 && (
            <div className="space-y-4 mb-6">
              {ticket.messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    {message.author.avatar ? (
                      <img
                        src={message.author.avatar}
                        alt={message.author.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm">
                        {message.author.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{message.author.username}</span>
                      {message.author.is_staff && (
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                          Staff
                        </span>
                      )}
                      <span className="text-white/60 text-sm">{message.created_at}</span>
                    </div>
                    <div className="text-white/80">{message.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Form */}
        <div className="border-t border-white/10 p-6">
          <div className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your reply..."
              rows={3}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}