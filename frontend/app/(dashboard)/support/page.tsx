"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api-client"
import { GradientCard } from "@/components/ui/gradient-card"
import { IconButton } from "@/components/ui/icon-button"
import { LiveIndicator } from "@/components/ui/live-indicator"
import { useDesignSystem } from "@/hooks/use-design-system"

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
  }>
}

export default function SupportPage() {
  const router = useRouter()
  const { formatNumber } = useDesignSystem()
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
    { value: "technical", label: "Technical Issue", icon: "⚙️", color: "from-blue-500 to-cyan-500" },
    { value: "account", label: "Account Problem", icon: "👤", color: "from-purple-500 to-pink-500" },
    { value: "billing", label: "Billing Question", icon: "💳", color: "from-green-500 to-emerald-500" },
    { value: "feature", label: "Feature Request", icon: "✨", color: "from-yellow-500 to-orange-500" },
    { value: "bug", label: "Bug Report", icon: "🐛", color: "from-red-500 to-pink-500" },
    { value: "other", label: "Other", icon: "❓", color: "from-gray-500 to-slate-500" }
  ]

  const quickHelpOptions = [
    {
      title: "FAQ",
      description: "Find answers to common questions",
      icon: "❓",
      href: "/dashboard/help",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      title: "Documentation", 
      description: "Detailed guides and tutorials",
      icon: "📚",
      href: "/docs",
      gradient: "from-green-500 to-blue-500"
    },
    {
      title: "Community",
      description: "Connect with other users",
      icon: "👥", 
      href: "/community",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Live Chat",
      description: "Chat with support agents",
      icon: "💬",
      href: "#",
      gradient: "from-orange-500 to-red-500"
    }
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
      case "open": return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      case "in_progress": return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "resolved": return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      case "closed": return "bg-gradient-to-r from-gray-500 to-slate-500 text-white"
      default: return "bg-white/20 text-white/60"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      case "medium": return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "high": return "bg-gradient-to-r from-orange-500 to-red-500 text-white"
      case "urgent": return "bg-gradient-to-r from-red-500 to-pink-500 text-white"
      default: return "bg-white/20 text-white/60"
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/60">Loading support center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-red-600/20 to-pink-600/20 rounded-3xl blur-xl"></div>
        <GradientCard className="relative border-orange-500/30">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent">
                  🆘 Support Center
                </h1>
                <LiveIndicator 
                  isLive={tickets.some(t => t.status === "open" || t.status === "in_progress")} 
                  count={tickets.filter(t => t.status === "open" || t.status === "in_progress").length} 
                  label="Active" 
                />
              </div>
              <p className="text-white/80 text-lg">Get help with your account and technical issues</p>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>🎫 Support Tickets</span>
                <span>•</span>
                <span>💬 Live Chat</span>
                <span>•</span>
                <span>📚 Knowledge Base</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <IconButton
                onClick={() => setShowCreateTicket(!showCreateTicket)}
                gradient="from-orange-600 to-red-600"
                className="shadow-lg hover:shadow-orange-500/25"
              >
                <span>🎫</span>
                <span className="hidden sm:inline">{showCreateTicket ? "Cancel" : "New Ticket"}</span>
              </IconButton>
              <IconButton
                onClick={() => router.push("/dashboard/help")}
                variant="secondary"
              >
                <span>❓</span>
                <span className="hidden sm:inline">Help Center</span>
              </IconButton>
            </div>
          </div>
        </GradientCard>
      </div>

      {/* Quick Help Links */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>⚡</span>
          Quick Help
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickHelpOptions.map((option, index) => (
            <div
              key={index}
              className="cursor-pointer"
              onClick={() => option.href !== "#" && router.push(option.href)}
            >
              <GradientCard
                gradient={`${option.gradient}/10`
                }
                className="text-center hover:border-orange-400/40 transition-all duration-300"
              >
              <div className="space-y-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${option.gradient} rounded-xl flex items-center justify-center text-white text-xl mx-auto`}>
                  {option.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">{option.title}</h3>
                  <p className="text-white/60 text-sm">{option.description}</p>
                </div>
                <IconButton
                  gradient={option.gradient}
                  size="sm"
                  className="w-full"
                  disabled={option.href === "#"}
                >
                  {option.href === "#" ? "Coming Soon" : "Open"}
                </IconButton>
              </div>
            </GradientCard>
            </div>
          ))}
        </div>
      </div>

      {/* Create Ticket Form */}
      {showCreateTicket && (
        <GradientCard className="border-green-500/30">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🎫</span>
            Create Support Ticket
          </h2>
          
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={newTicket.title}
                onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of your issue"
                maxLength={200}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
              />
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">Category *</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">Priority</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Description *</label>
              <textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Please provide detailed information about your issue..."
                rows={6}
                maxLength={2000}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all resize-none"
              />
              <div className="text-white/40 text-xs mt-2 text-right">
                {newTicket.description.length}/2000 characters
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <IconButton
                onClick={createTicket}
                disabled={creating}
                gradient="from-green-600 to-emerald-600"
                className="shadow-lg hover:shadow-green-500/25"
              >
                <span>{creating ? "🔄" : "🎫"}</span>
                {creating ? "Creating..." : "Create Ticket"}
              </IconButton>
              <IconButton
                onClick={() => setShowCreateTicket(false)}
                variant="secondary"
              >
                <span>❌</span>
                Cancel
              </IconButton>
            </div>
          </div>
        </GradientCard>
      )}

      {/* Tickets List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🎫</span>
            Your Support Tickets
          </h2>
          <div className="text-white/60 text-sm">
            {formatNumber(tickets.length)} ticket{tickets.length !== 1 ? "s" : ""}
          </div>
        </div>

        {tickets.length === 0 ? (
          <GradientCard className="text-center py-16">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Support Tickets</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              You haven't created any support tickets yet. If you need help, feel free to create one!
            </p>
            <IconButton
              onClick={() => setShowCreateTicket(true)}
              className="shadow-lg hover:shadow-orange-500/25"
            >
              <span>🎫</span>
              Create Your First Ticket
            </IconButton>
          </GradientCard>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <GradientCard
                  className="hover:border-orange-400/40 transition-all duration-300"
                >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white mb-2 line-clamp-1">{ticket.title}</h3>
                    <p className="text-white/60 text-sm line-clamp-2 mb-3">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="text-white/40 text-sm ml-4 flex-shrink-0">
                    #{ticket.id.slice(-6)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace("_", " ").toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 bg-white/10 text-white/70 text-xs rounded-full">
                    {categories.find(c => c.value === ticket.category)?.icon}{" "}
                    {categories.find(c => c.value === ticket.category)?.label || ticket.category}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-white/60">
                  <div className="flex items-center gap-4">
                    {ticket.assigned_to && (
                      <div className="flex items-center gap-2">
                        <span>👨‍💻 Assigned to:</span>
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
                      <span>💬 {ticket.messages.length} replies</span>
                    )}
                  </div>
                  <div>
                    Updated {formatDate(ticket.updated_at)}
                  </div>
                </div>
              </GradientCard>
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-orange-600/10 to-red-600/10">
          <div>
            <h2 className="text-xl font-bold text-white">{ticket.title}</h2>
            <p className="text-white/60 text-sm">Ticket #{ticket.id.slice(-6)}</p>
          </div>
          <IconButton
            onClick={onClose}
            variant="secondary"
            size="sm"
          >
            ✕
          </IconButton>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-96 p-6">
          {/* Original Description */}
            <GradientCard gradient="from-blue-900/30 to-purple-900/30" className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📝</span>
                </div>
                <div>
                  <span className="font-medium text-white">Original Issue</span>
                  <div className="text-white/60 text-sm">{new Date(ticket.created_at).toLocaleString()}</div>
                </div>
              </div>
              <p className="text-white/80">{ticket.description}</p>
            </GradientCard>

            {/* Messages */}
            {ticket.messages.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="font-medium text-white flex items-center gap-2">
                  <span>💬</span>
                  Conversation ({ticket.messages.length})
                </h3>
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
                          <span className="px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full">
                            Staff
                          </span>
                        )}
                        <span className="text-white/60 text-sm">{new Date(message.created_at).toLocaleString()}</span>
                      </div>
                      <div className="text-white/80 bg-white/5 rounded-lg p-3">{message.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Reply Form */}
        <div className="border-t border-white/10 p-6 bg-white/5">
          <div className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your reply..."
              rows={3}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
            />
            <IconButton
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              gradient="from-orange-600 to-red-600"
              className="h-fit"
            >
              <span>{sending ? "🔄" : "📤"}</span>
              <span className="hidden sm:inline">{sending ? "Sending..." : "Send"}</span>
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  )
}

      <div>

        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">

          <span>⚡</span>

          Quick Help  const createTicket = async () => {  const createTicket = async () => {

        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">    if (!newTicket.title.trim() || !newTicket.description.trim() || !newTicket.category) {    if (!newTicket.title.trim() || !newTicket.description.trim() || !newTicket.category) {

          {quickHelpOptions.map((option, index) => (

            <div      alert("Please fill in all required fields")      alert("Please fill in all required fields")

              key={index}

              className="cursor-pointer"      return      return

              onClick={() => option.href !== "#" && router.push(option.href)}

            >    }    }

              <GradientCard

                gradient={`${option.gradient}/10`}

                className="text-center hover:border-orange-400/40 transition-all duration-300"

              >    setCreating(true)    setCreating(true)

                <div className="space-y-4">

                  <div className={`w-12 h-12 bg-gradient-to-br ${option.gradient} rounded-xl flex items-center justify-center text-white text-xl mx-auto`}>    try {    try {

                    {option.icon}

                  </div>      await api.support.createTicket(newTicket)      await api.support.createTicket(newTicket)

                  <div>

                    <h3 className="font-bold text-white mb-2">{option.title}</h3>      setNewTicket({      setNewTicket({

                    <p className="text-white/60 text-sm">{option.description}</p>

                  </div>        title: "",        title: "",

                  <IconButton

                    gradient={option.gradient}        description: "",        description: "",

                    size="sm"

                    className="w-full"        category: "",        category: "",

                    disabled={option.href === "#"}

                  >        priority: "medium"        priority: "medium"

                    {option.href === "#" ? "Coming Soon" : "Open"}

                  </IconButton>      })      })

                </div>

              </GradientCard>      setShowCreateTicket(false)      setShowCreateTicket(false)

            </div>

          ))}      await loadTickets()      await loadTickets()

        </div>

      </div>    } catch (error) {    } catch (error) {



      {/* Create Ticket Form */}      alert("Failed to create ticket: " + (error instanceof Error ? error.message : "Unknown error"))      alert("Failed to create ticket: " + (error instanceof Error ? error.message : "Unknown error"))

      {showCreateTicket && (

        <GradientCard className="border-green-500/30">    } finally {    } finally {

          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">

            <span>🎫</span>      setCreating(false)      setCreating(false)

            Create Support Ticket

          </h2>    }    }

          

          <div className="space-y-6">  }  }

            {/* Title */}

            <div>

              <label className="block text-white/90 text-sm font-medium mb-2">Title *</label>

              <input  const getStatusColor = (status: string) => {  const getStatusColor = (status: string) => {

                type="text"

                value={newTicket.title}    switch (status) {    switch (status) {

                onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}

                placeholder="Brief description of your issue"      case "open": return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"      case "open": return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"

                maxLength={200}

                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"      case "in_progress": return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"      case "in_progress": return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"

              />

            </div>      case "resolved": return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"      case "resolved": return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"



            {/* Category and Priority */}      case "closed": return "bg-gradient-to-r from-gray-500 to-slate-500 text-white"      case "closed": return "bg-gradient-to-r from-gray-500 to-slate-500 text-white"

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>      default: return "bg-white/20 text-white/60"      default: return "bg-white/20 text-white/60"

                <label className="block text-white/90 text-sm font-medium mb-2">Category *</label>

                <select    }    }

                  value={newTicket.category}

                  onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}  }  }

                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"

                >

                  <option value="">Select a category</option>

                  {categories.map(cat => (  const getPriorityColor = (priority: string) => {  const getPriorityColor = (priority: string) => {

                    <option key={cat.value} value={cat.value}>

                      {cat.icon} {cat.label}    switch (priority) {    switch (priority) {

                    </option>

                  ))}      case "low": return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"      case "low": return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"

                </select>

              </div>      case "medium": return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"      case "medium": return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"



              <div>      case "high": return "bg-gradient-to-r from-orange-500 to-red-500 text-white"      case "high": return "bg-gradient-to-r from-orange-500 to-red-500 text-white"

                <label className="block text-white/90 text-sm font-medium mb-2">Priority</label>

                <select      case "urgent": return "bg-gradient-to-r from-red-500 to-pink-500 text-white"      case "urgent": return "bg-gradient-to-r from-red-500 to-pink-500 text-white"

                  value={newTicket.priority}

                  onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}      default: return "bg-white/20 text-white/60"      default: return "bg-white/20 text-white/60"

                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"

                >    }    }

                  <option value="low">🟢 Low</option>

                  <option value="medium">🟡 Medium</option>  }  }

                  <option value="high">🟠 High</option>

                  <option value="urgent">🔴 Urgent</option>

                </select>

              </div>  const formatDate = (dateString: string) => {  const formatDate = (dateString: string) => {

            </div>

    return new Date(dateString).toLocaleDateString("en-US", {    return new Date(dateString).toLocaleDateString("en-US", {

            {/* Description */}

            <div>      year: "numeric",      year: "numeric",

              <label className="block text-white/90 text-sm font-medium mb-2">Description *</label>

              <textarea      month: "short",      month: "short",

                value={newTicket.description}

                onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}      day: "numeric",      day: "numeric",

                placeholder="Please provide detailed information about your issue..."

                rows={6}      hour: "2-digit",      hour: "2-digit",

                maxLength={2000}

                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all resize-none"      minute: "2-digit"      minute: "2-digit"

              />

              <div className="text-white/40 text-xs mt-2 text-right">    })    })

                {newTicket.description.length}/2000 characters

              </div>  }  }

            </div>



            {/* Actions */}

            <div className="flex gap-3 pt-4">  if (loading) {  if (loading) {

              <IconButton

                onClick={createTicket}    return (    return (

                disabled={creating}

                gradient="from-green-600 to-emerald-600"      <div className="flex items-center justify-center min-h-[400px]">      <div className="flex items-center justify-center min-h-[400px]">

                className="shadow-lg hover:shadow-green-500/25"

              >        <div className="text-center">        <div className="text-center">

                <span>{creating ? "🔄" : "🎫"}</span>

                {creating ? "Creating..." : "Create Ticket"}          <div className="animate-spin w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>          <div className="animate-spin w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>

              </IconButton>

              <IconButton          <p className="text-white/60">Loading support center...</p>          <p className="text-white/60">Loading support center...</p>

                onClick={() => setShowCreateTicket(false)}

                variant="secondary"        </div>        </div>

              >

                <span>❌</span>      </div>      </div>

                Cancel

              </IconButton>    )    )

            </div>

          </div>  }  }

        </GradientCard>

      )}



      {/* Tickets List */}  return (  return (

      <div>

        <div className="flex items-center justify-between mb-6">    <div className="space-y-8">    <div className="space-y-8">

          <h2 className="text-xl font-bold text-white flex items-center gap-2">

            <span>🎫</span>      {/* Enhanced Header */}      {/* Enhanced Header */}

            Your Support Tickets

          </h2>      <div className="relative">      <div className="relative">

          <div className="text-white/60 text-sm">

            {formatNumber(tickets.length)} ticket{tickets.length !== 1 ? "s" : ""}        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-red-600/20 to-pink-600/20 rounded-3xl blur-xl"></div>        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-red-600/20 to-pink-600/20 rounded-3xl blur-xl"></div>

          </div>

        </div>        <GradientCard className="relative border-orange-500/30">        <GradientCard className="relative border-orange-500/30">



        {tickets.length === 0 ? (          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">

          <GradientCard className="text-center py-16">

            <div className="text-6xl mb-4">🎫</div>            <div className="space-y-2">            <div className="space-y-2">

            <h3 className="text-2xl font-bold text-white mb-2">No Support Tickets</h3>

            <p className="text-white/60 mb-6 max-w-md mx-auto">              <div className="flex items-center gap-4">              <div className="flex items-center gap-4">

              You haven&apos;t created any support tickets yet. If you need help, feel free to create one!

            </p>                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent">                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent">

            <IconButton

              onClick={() => setShowCreateTicket(true)}                  🆘 Support Center                  🆘 Support Center

              className="shadow-lg hover:shadow-orange-500/25"

            >                </h1>                </h1>

              <span>🎫</span>

              Create Your First Ticket                <LiveIndicator                 <LiveIndicator 

            </IconButton>

          </GradientCard>                  isLive={tickets.some(t => t.status === "open" || t.status === "in_progress")}                   isLive={tickets.some(t => t.status === "open" || t.status === "in_progress")} 

        ) : (

          <div className="space-y-4">                  count={tickets.filter(t => t.status === "open" || t.status === "in_progress").length}                   count={tickets.filter(t => t.status === "open" || t.status === "in_progress").length} 

            {tickets.map((ticket) => (

              <div                  label="Active"                   label="Active" 

                key={ticket.id}

                className="cursor-pointer"                />                />

                onClick={() => setSelectedTicket(ticket)}

              >              </div>              </div>

                <GradientCard className="hover:border-orange-400/40 transition-all duration-300">

                  <div className="flex items-start justify-between mb-4">              <p className="text-white/80 text-lg">Get help with your account and technical issues</p>              <p className="text-white/80 text-lg">Get help with your account and technical issues</p>

                    <div className="flex-1 min-w-0">

                      <h3 className="font-bold text-white mb-2 line-clamp-1">{ticket.title}</h3>              <div className="flex items-center gap-4 text-sm text-white/60">              <div className="flex items-center gap-4 text-sm text-white/60">

                      <p className="text-white/60 text-sm line-clamp-2 mb-3">

                        {ticket.description}                <span>🎫 Support Tickets</span>                <span>🎫 Support Tickets</span>

                      </p>

                    </div>                <span>•</span>                <span>•</span>

                    <div className="text-white/40 text-sm ml-4 flex-shrink-0">

                      #{ticket.id.slice(-6)}                <span>💬 Live Chat</span>                <span>💬 Live Chat</span>

                    </div>

                  </div>                <span>•</span>                <span>•</span>



                  <div className="flex flex-wrap items-center gap-2 mb-4">                <span>📚 Knowledge Base</span>                <span>📚 Knowledge Base</span>

                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(ticket.status)}`}>

                      {ticket.status.replace("_", " ").toUpperCase()}              </div>              </div>

                    </span>

                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>            </div>            </div>

                      {ticket.priority.toUpperCase()}

                    </span>                        

                    <span className="px-3 py-1 bg-white/10 text-white/70 text-xs rounded-full">

                      {categories.find(c => c.value === ticket.category)?.icon}{" "}            <div className="flex items-center gap-3">            <div className="flex items-center gap-3">

                      {categories.find(c => c.value === ticket.category)?.label || ticket.category}

                    </span>              <IconButton              <IconButton

                  </div>

                onClick={() => setShowCreateTicket(!showCreateTicket)}                onClick={() => setShowCreateTicket(!showCreateTicket)}

                  <div className="flex items-center justify-between text-sm text-white/60">

                    <div className="flex items-center gap-4">                gradient="from-orange-600 to-red-600"                gradient="from-orange-600 to-red-600"

                      {ticket.assigned_to && (

                        <div className="flex items-center gap-2">                className="shadow-lg hover:shadow-orange-500/25"                className="shadow-lg hover:shadow-orange-500/25"

                          <span>👨‍💻 Assigned to:</span>

                          {ticket.assigned_to.avatar && (              >              >

                            <img

                              src={ticket.assigned_to.avatar}                <span>🎫</span>                <span>🎫</span>

                              alt={ticket.assigned_to.username}

                              className="w-4 h-4 rounded-full"                <span className="hidden sm:inline">{showCreateTicket ? "Cancel" : "New Ticket"}</span>                <span className="hidden sm:inline">{showCreateTicket ? "Cancel" : "New Ticket"}</span>

                            />

                          )}              </IconButton>              </IconButton>

                          <span>{ticket.assigned_to.username}</span>

                        </div>              <IconButton              <IconButton

                      )}

                      {ticket.messages.length > 0 && (                onClick={() => router.push("/dashboard/help")}                onClick={() => router.push("/dashboard/help")}

                        <span>💬 {ticket.messages.length} replies</span>

                      )}                variant="secondary"                variant="secondary"

                    </div>

                    <div>              >              >

                      Updated {formatDate(ticket.updated_at)}

                    </div>                <span>❓</span>                <span>❓</span>

                  </div>

                </GradientCard>                <span className="hidden sm:inline">Help Center</span>                <span className="hidden sm:inline">Help Center</span>

              </div>

            ))}              </IconButton>              </IconButton>

          </div>

        )}            </div>            </div>

      </div>

          </div>          </div>

      {/* Ticket Detail Modal */}

      {selectedTicket && (        </GradientCard>        </GradientCard>

        <TicketDetailModal

          ticket={selectedTicket}      </div>      </div>

          onClose={() => setSelectedTicket(null)}

          onUpdate={loadTickets}

        />

      )}      {/* Quick Help Links */}      {/* Quick Help Links */}

    </div>

  )      <div>      <div>

}

        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">

// Ticket Detail Modal Component

interface TicketDetailModalProps {          <span>⚡</span>          <span>⚡</span>

  ticket: SupportTicket

  onClose: () => void          Quick Help          Quick Help

  onUpdate: () => void

}        </h2>        </h2>



function TicketDetailModal({ ticket, onClose, onUpdate }: TicketDetailModalProps) {        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

  const [newMessage, setNewMessage] = useState("")

  const [sending, setSending] = useState(false)          {quickHelpOptions.map((option, index) => (          {quickHelpOptions.map((option, index) => (



  const sendMessage = async () => {            <div            <div

    if (!newMessage.trim()) return

              key={index}              key={index}

    setSending(true)

    try {              className="cursor-pointer"              className="cursor-pointer"

      await api.support.addTicketMessage(ticket.id, {

        content: newMessage.trim()              onClick={() => option.href !== "#" && router.push(option.href)}              onClick={() => option.href !== "#" && router.push(option.href)}

      })

      setNewMessage("")            >            >

      onUpdate()

    } catch (error) {              <GradientCard              <GradientCard

      alert("Failed to send message: " + (error instanceof Error ? error.message : "Unknown error"))

    } finally {                gradient={`${option.gradient}/10`}                gradient={`${option.gradient}/10`}

      setSending(false)

    }                className="text-center hover:border-orange-400/40 transition-all duration-300"                className="text-center hover:border-orange-400/40 transition-all duration-300"

  }

              >              >

  return (

    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">                <div className="space-y-4">                <div className="space-y-4">

      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">

        {/* Header */}                  <div className={`w-12 h-12 bg-gradient-to-br ${option.gradient} rounded-xl flex items-center justify-center text-white text-xl mx-auto`}>                  <div className={`w-12 h-12 bg-gradient-to-br ${option.gradient} rounded-xl flex items-center justify-center text-white text-xl mx-auto`}>

        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-orange-600/10 to-red-600/10">

          <div>                    {option.icon}                    {option.icon}

            <h2 className="text-xl font-bold text-white">{ticket.title}</h2>

            <p className="text-white/60 text-sm">Ticket #{ticket.id.slice(-6)}</p>                  </div>                  </div>

          </div>

          <IconButton                  <div>                  <div>

            onClick={onClose}

            variant="secondary"                    <h3 className="font-bold text-white mb-2">{option.title}</h3>                    <h3 className="font-bold text-white mb-2">{option.title}</h3>

            size="sm"

          >                    <p className="text-white/60 text-sm">{option.description}</p>                    <p className="text-white/60 text-sm">{option.description}</p>

            ✕

          </IconButton>                  </div>                  </div>

        </div>

                  <IconButton                  <IconButton

        {/* Content */}

        <div className="flex-1 overflow-y-auto max-h-96 p-6">                    gradient={option.gradient}                    gradient={option.gradient}

          {/* Original Description */}

          <GradientCard gradient="from-blue-900/30 to-purple-900/30" className="mb-6">                    size="sm"                    size="sm"

            <div className="flex items-center gap-3 mb-3">

              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">                    className="w-full"                    className="w-full"

                <span className="text-white text-sm">📝</span>

              </div>                    disabled={option.href === "#"}                    disabled={option.href === "#"}

              <div>

                <span className="font-medium text-white">Original Issue</span>                  >                  >

                <div className="text-white/60 text-sm">{new Date(ticket.created_at).toLocaleString()}</div>

              </div>                    {option.href === "#" ? "Coming Soon" : "Open"}                    {option.href === "#" ? "Coming Soon" : "Open"}

            </div>

            <p className="text-white/80">{ticket.description}</p>                  </IconButton>                  </IconButton>

          </GradientCard>

                </div>                </div>

          {/* Messages */}

          {ticket.messages.length > 0 && (              </GradientCard>              </GradientCard>

            <div className="space-y-4 mb-6">

              <h3 className="font-medium text-white flex items-center gap-2">            </div>            </div>

                <span>💬</span>

                Conversation ({ticket.messages.length})          ))}          ))}

              </h3>

              {ticket.messages.map((message) => (        </div>        </div>

                <div key={message.id} className="flex gap-3">

                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">      </div>      </div>

                    {message.author.avatar ? (

                      <img

                        src={message.author.avatar}

                        alt={message.author.username}      {/* Create Ticket Form */}      {/* Create Ticket Form */}

                        className="w-full h-full rounded-full object-cover"

                      />      {showCreateTicket && (      {showCreateTicket && (

                    ) : (

                      <span className="text-white text-sm">        <GradientCard className="border-green-500/30">        <GradientCard className="border-green-500/30">

                        {message.author.username[0].toUpperCase()}

                      </span>          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">

                    )}

                  </div>            <span>🎫</span>            <span>🎫</span>

                  <div className="flex-1">

                    <div className="flex items-center gap-2 mb-1">            Create Support Ticket            Create Support Ticket

                      <span className="font-medium text-white">{message.author.username}</span>

                      {message.author.is_staff && (          </h2>          </h2>

                        <span className="px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full">

                          Staff                    

                        </span>

                      )}          <div className="space-y-6">          <div className="space-y-6">

                      <span className="text-white/60 text-sm">{new Date(message.created_at).toLocaleString()}</span>

                    </div>            {/* Title */}            {/* Title */}

                    <div className="text-white/80 bg-white/5 rounded-lg p-3">{message.content}</div>

                  </div>            <div>            <div>

                </div>

              ))}              <label className="block text-white/90 text-sm font-medium mb-2">Title *</label>              <label className="block text-white/90 text-sm font-medium mb-2">Title *</label>

            </div>

          )}              <input              <input

        </div>

                type="text"                type="text"

        {/* Reply Form */}

        <div className="border-t border-white/10 p-6 bg-white/5">                value={newTicket.title}                value={newTicket.title}

          <div className="flex gap-3">

            <textarea                onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}                onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}

              value={newMessage}

              onChange={(e) => setNewMessage(e.target.value)}                placeholder="Brief description of your issue"                placeholder="Brief description of your issue"

              placeholder="Type your reply..."

              rows={3}                maxLength={200}                maxLength={200}

              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"

            />                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"

            <IconButton

              onClick={sendMessage}              />              />

              disabled={sending || !newMessage.trim()}

              gradient="from-orange-600 to-red-600"            </div>            </div>

              className="h-fit"

            >

              <span>{sending ? "🔄" : "📤"}</span>

              <span className="hidden sm:inline">{sending ? "Sending..." : "Send"}</span>            {/* Category and Priority */}            {/* Category and Priority */}

            </IconButton>

          </div>            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        </div>

      </div>              <div>              <div>

    </div>

  )                <label className="block text-white/90 text-sm font-medium mb-2">Category *</label>                <label className="block text-white/90 text-sm font-medium mb-2">Category *</label>

}
                <select                <select

                  value={newTicket.category}                  value={newTicket.category}

                  onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}                  onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}

                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"

                >                >

                  <option value="">Select a category</option>                  <option value="">Select a category</option>

                  {categories.map(cat => (                  {categories.map(cat => (

                    <option key={cat.value} value={cat.value}>                    <option key={cat.value} value={cat.value}>

                      {cat.icon} {cat.label}                      {cat.icon} {cat.label}

                    </option>                    </option>

                  ))}                  ))}

                </select>                </select>

              </div>              </div>



              <div>              <div>

                <label className="block text-white/90 text-sm font-medium mb-2">Priority</label>                <label className="block text-white/90 text-sm font-medium mb-2">Priority</label>

                <select                <select

                  value={newTicket.priority}                  value={newTicket.priority}

                  onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}                  onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}

                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"

                >                >

                  <option value="low">🟢 Low</option>                  <option value="low">🟢 Low</option>

                  <option value="medium">🟡 Medium</option>                  <option value="medium">🟡 Medium</option>

                  <option value="high">🟠 High</option>                  <option value="high">🟠 High</option>

                  <option value="urgent">🔴 Urgent</option>                  <option value="urgent">🔴 Urgent</option>

                </select>                </select>

              </div>              </div>

            </div>            </div>



            {/* Description */}            {/* Description */}

            <div>            <div>

              <label className="block text-white/90 text-sm font-medium mb-2">Description *</label>              <label className="block text-white/90 text-sm font-medium mb-2">Description *</label>

              <textarea              <textarea

                value={newTicket.description}                value={newTicket.description}

                onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}                onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}

                placeholder="Please provide detailed information about your issue..."                placeholder="Please provide detailed information about your issue..."

                rows={6}                rows={6}

                maxLength={2000}                maxLength={2000}

                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all resize-none"                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all resize-none"

              />              />

              <div className="text-white/40 text-xs mt-2 text-right">              <div className="text-white/40 text-xs mt-2 text-right">

                {newTicket.description.length}/2000 characters                {newTicket.description.length}/2000 characters

              </div>              </div>

            </div>            </div>



            {/* Actions */}            {/* Actions */}

            <div className="flex gap-3 pt-4">            <div className="flex gap-3 pt-4">

              <IconButton              <IconButton

                onClick={createTicket}                onClick={createTicket}

                disabled={creating}                disabled={creating}

                gradient="from-green-600 to-emerald-600"                gradient="from-green-600 to-emerald-600"

                className="shadow-lg hover:shadow-green-500/25"                className="shadow-lg hover:shadow-green-500/25"

              >              >

                <span>{creating ? "🔄" : "🎫"}</span>                <span>{creating ? "🔄" : "🎫"}</span>

                {creating ? "Creating..." : "Create Ticket"}                {creating ? "Creating..." : "Create Ticket"}

              </IconButton>              </IconButton>

              <IconButton              <IconButton

                onClick={() => setShowCreateTicket(false)}                onClick={() => setShowCreateTicket(false)}

                variant="secondary"                variant="secondary"

              >              >

                <span>❌</span>                <span>❌</span>

                Cancel                Cancel

              </IconButton>              </IconButton>

            </div>            </div>

          </div>          </div>

        </GradientCard>        </GradientCard>

      )}      )}



      {/* Tickets List */}      {/* Tickets List */}

      <div>      <div>

        <div className="flex items-center justify-between mb-6">        <div className="flex items-center justify-between mb-6">

          <h2 className="text-xl font-bold text-white flex items-center gap-2">          <h2 className="text-xl font-bold text-white flex items-center gap-2">

            <span>🎫</span>            <span>🎫</span>

            Your Support Tickets            Your Support Tickets

          </h2>          </h2>

          <div className="text-white/60 text-sm">          <div className="text-white/60 text-sm">

            {formatNumber(tickets.length)} ticket{tickets.length !== 1 ? "s" : ""}            {formatNumber(tickets.length)} ticket{tickets.length !== 1 ? "s" : ""}

          </div>          </div>

        </div>        </div>



        {tickets.length === 0 ? (        {tickets.length === 0 ? (

          <GradientCard className="text-center py-16">          <GradientCard className="text-center py-16">

            <div className="text-6xl mb-4">🎫</div>            <div className="text-6xl mb-4">🎫</div>

            <h3 className="text-2xl font-bold text-white mb-2">No Support Tickets</h3>            <h3 className="text-2xl font-bold text-white mb-2">No Support Tickets</h3>

            <p className="text-white/60 mb-6 max-w-md mx-auto">            <p className="text-white/60 mb-6 max-w-md mx-auto">

              You haven't created any support tickets yet. If you need help, feel free to create one!              You haven't created any support tickets yet. If you need help, feel free to create one!

            </p>            </p>

            <IconButton            <IconButton

              onClick={() => setShowCreateTicket(true)}              onClick={() => setShowCreateTicket(true)}

              className="shadow-lg hover:shadow-orange-500/25"              className="shadow-lg hover:shadow-orange-500/25"

            >            >

              <span>🎫</span>              <span>🎫</span>

              Create Your First Ticket              Create Your First Ticket

            </IconButton>            </IconButton>

          </GradientCard>          </GradientCard>

        ) : (        ) : (

          <div className="space-y-4">          <div className="space-y-4">

            {tickets.map((ticket) => (            {tickets.map((ticket) => (

              <div              <div

                key={ticket.id}                key={ticket.id}

                className="cursor-pointer"                className="cursor-pointer"

                onClick={() => setSelectedTicket(ticket)}                onClick={() => setSelectedTicket(ticket)}

              >              >

                <GradientCard className="hover:border-orange-400/40 transition-all duration-300">                <GradientCard className="hover:border-orange-400/40 transition-all duration-300">

                  <div className="flex items-start justify-between mb-4">                  <div className="flex items-start justify-between mb-4">

                    <div className="flex-1 min-w-0">                    <div className="flex-1 min-w-0">

                      <h3 className="font-bold text-white mb-2 line-clamp-1">{ticket.title}</h3>                      <h3 className="font-bold text-white mb-2 line-clamp-1">{ticket.title}</h3>

                      <p className="text-white/60 text-sm line-clamp-2 mb-3">                      <p className="text-white/60 text-sm line-clamp-2 mb-3">

                        {ticket.description}                        {ticket.description}

                      </p>                      </p>

                    </div>                    </div>

                    <div className="text-white/40 text-sm ml-4 flex-shrink-0">                    <div className="text-white/40 text-sm ml-4 flex-shrink-0">

                      #{ticket.id.slice(-6)}                      #{ticket.id.slice(-6)}

                    </div>                    </div>

                  </div>                  </div>



                  <div className="flex flex-wrap items-center gap-2 mb-4">                  <div className="flex flex-wrap items-center gap-2 mb-4">

                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(ticket.status)}`}>                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(ticket.status)}`}>

                      {ticket.status.replace("_", " ").toUpperCase()}                      {ticket.status.replace("_", " ").toUpperCase()}

                    </span>                    </span>

                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>

                      {ticket.priority.toUpperCase()}                      {ticket.priority.toUpperCase()}

                    </span>                    </span>

                    <span className="px-3 py-1 bg-white/10 text-white/70 text-xs rounded-full">                    <span className="px-3 py-1 bg-white/10 text-white/70 text-xs rounded-full">

                      {categories.find(c => c.value === ticket.category)?.icon}{" "}                      {categories.find(c => c.value === ticket.category)?.icon}{" "}

                      {categories.find(c => c.value === ticket.category)?.label || ticket.category}                      {categories.find(c => c.value === ticket.category)?.label || ticket.category}

                    </span>                    </span>

                  </div>                  </div>



                  <div className="flex items-center justify-between text-sm text-white/60">                  <div className="flex items-center justify-between text-sm text-white/60">

                    <div className="flex items-center gap-4">                    <div className="flex items-center gap-4">

                      {ticket.assigned_to && (                      {ticket.assigned_to && (

                        <div className="flex items-center gap-2">                        <div className="flex items-center gap-2">

                          <span>👨‍💻 Assigned to:</span>                          <span>👨‍💻 Assigned to:</span>

                          {ticket.assigned_to.avatar && (                          {ticket.assigned_to.avatar && (

                            <img                            <img

                              src={ticket.assigned_to.avatar}                              src={ticket.assigned_to.avatar}

                              alt={ticket.assigned_to.username}                              alt={ticket.assigned_to.username}

                              className="w-4 h-4 rounded-full"                              className="w-4 h-4 rounded-full"

                            />                            />

                          )}                          )}

                          <span>{ticket.assigned_to.username}</span>                          <span>{ticket.assigned_to.username}</span>

                        </div>                        </div>

                      )}                      )}

                      {ticket.messages.length > 0 && (                      {ticket.messages.length > 0 && (

                        <span>💬 {ticket.messages.length} replies</span>                        <span>💬 {ticket.messages.length} replies</span>

                      )}                      )}

                    </div>                    </div>

                    <div>                    <div>

                      Updated {formatDate(ticket.updated_at)}                      Updated {formatDate(ticket.updated_at)}

                    </div>                    </div>

                  </div>                  </div>

                </GradientCard>                </GradientCard>

              </div>              </div>

            ))}            ))}

          </div>          </div>

        )}        )}

      </div>      </div>



      {/* Ticket Detail Modal */}      {/* Ticket Detail Modal */}

      {selectedTicket && (      {selectedTicket && (

        <TicketDetailModal        <TicketDetailModal

          ticket={selectedTicket}          ticket={selectedTicket}

          onClose={() => setSelectedTicket(null)}          onClose={() => setSelectedTicket(null)}

          onUpdate={loadTickets}          onUpdate={loadTickets}

        />        />

      )}      )}

    </div>    </div>

  )  )

}}



// Ticket Detail Modal Component// Ticket Detail Modal Component

interface TicketDetailModalProps {interface TicketDetailModalProps {

  ticket: SupportTicket  ticket: SupportTicket

  onClose: () => void  onClose: () => void

  onUpdate: () => void  onUpdate: () => void

}}



function TicketDetailModal({ ticket, onClose, onUpdate }: TicketDetailModalProps) {function TicketDetailModal({ ticket, onClose, onUpdate }: TicketDetailModalProps) {

  const [newMessage, setNewMessage] = useState("")  const [newMessage, setNewMessage] = useState("")

  const [sending, setSending] = useState(false)  const [sending, setSending] = useState(false)



  const sendMessage = async () => {  const sendMessage = async () => {

    if (!newMessage.trim()) return    if (!newMessage.trim()) return



    setSending(true)    setSending(true)

    try {    try {

      await api.support.addTicketMessage(ticket.id, {      await api.support.addTicketMessage(ticket.id, {

        content: newMessage.trim()        content: newMessage.trim()

      })      })

      setNewMessage("")      setNewMessage("")

      onUpdate()      onUpdate()

    } catch (error) {    } catch (error) {

      alert("Failed to send message: " + (error instanceof Error ? error.message : "Unknown error"))      alert("Failed to send message: " + (error instanceof Error ? error.message : "Unknown error"))

    } finally {    } finally {

      setSending(false)      setSending(false)

    }    }

  }  }



  return (  return (

    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">

      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">

        {/* Header */}        {/* Header */}

        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-orange-600/10 to-red-600/10">        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-orange-600/10 to-red-600/10">

          <div>          <div>

            <h2 className="text-xl font-bold text-white">{ticket.title}</h2>            <h2 className="text-xl font-bold text-white">{ticket.title}</h2>

            <p className="text-white/60 text-sm">Ticket #{ticket.id.slice(-6)}</p>            <p className="text-white/60 text-sm">Ticket #{ticket.id.slice(-6)}</p>

          </div>          </div>

          <IconButton          <IconButton

            onClick={onClose}            onClick={onClose}

            variant="secondary"            variant="secondary"

            size="sm"            size="sm"

          >          >

            ✕            ✕

          </IconButton>          </IconButton>

        </div>        </div>



        {/* Content */}        {/* Content */}

        <div className="flex-1 overflow-y-auto max-h-96 p-6">        <div className="flex-1 overflow-y-auto max-h-96 p-6">

          {/* Original Description */}          {/* Original Description */}

          <GradientCard gradient="from-blue-900/30 to-purple-900/30" className="mb-6">          <GradientCard gradient="from-blue-900/30 to-purple-900/30" className="mb-6">

            <div className="flex items-center gap-3 mb-3">            <div className="flex items-center gap-3 mb-3">

              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">

                <span className="text-white text-sm">📝</span>                <span className="text-white text-sm">📝</span>

              </div>              </div>

              <div>              <div>

                <span className="font-medium text-white">Original Issue</span>                <span className="font-medium text-white">Original Issue</span>

                <div className="text-white/60 text-sm">{new Date(ticket.created_at).toLocaleString()}</div>                <div className="text-white/60 text-sm">{new Date(ticket.created_at).toLocaleString()}</div>

              </div>              </div>

            </div>            </div>

            <p className="text-white/80">{ticket.description}</p>            <p className="text-white/80">{ticket.description}</p>

          </GradientCard>          </GradientCard>



          {/* Messages */}          {/* Messages */}

          {ticket.messages.length > 0 && (          {ticket.messages.length > 0 && (

            <div className="space-y-4 mb-6">            <div className="space-y-4 mb-6">

              <h3 className="font-medium text-white flex items-center gap-2">              <h3 className="font-medium text-white flex items-center gap-2">

                <span>💬</span>                <span>💬</span>

                Conversation ({ticket.messages.length})                Conversation ({ticket.messages.length})

              </h3>              </h3>

              {ticket.messages.map((message) => (              {ticket.messages.map((message) => (

                <div key={message.id} className="flex gap-3">                <div key={message.id} className="flex gap-3">

                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">

                    {message.author.avatar ? (                    {message.author.avatar ? (

                      <img                      <img

                        src={message.author.avatar}                        src={message.author.avatar}

                        alt={message.author.username}                        alt={message.author.username}

                        className="w-full h-full rounded-full object-cover"                        className="w-full h-full rounded-full object-cover"

                      />                      />

                    ) : (                    ) : (

                      <span className="text-white text-sm">                      <span className="text-white text-sm">

                        {message.author.username[0].toUpperCase()}                        {message.author.username[0].toUpperCase()}

                      </span>                      </span>

                    )}                    )}

                  </div>                  </div>

                  <div className="flex-1">                  <div className="flex-1">

                    <div className="flex items-center gap-2 mb-1">                    <div className="flex items-center gap-2 mb-1">

                      <span className="font-medium text-white">{message.author.username}</span>                      <span className="font-medium text-white">{message.author.username}</span>

                      {message.author.is_staff && (                      {message.author.is_staff && (

                        <span className="px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full">                        <span className="px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full">

                          Staff                          Staff

                        </span>                        </span>

                      )}                      )}

                      <span className="text-white/60 text-sm">{new Date(message.created_at).toLocaleString()}</span>                      <span className="text-white/60 text-sm">{new Date(message.created_at).toLocaleString()}</span>

                    </div>                    </div>

                    <div className="text-white/80 bg-white/5 rounded-lg p-3">{message.content}</div>                    <div className="text-white/80 bg-white/5 rounded-lg p-3">{message.content}</div>

                  </div>                  </div>

                </div>                </div>

              ))}              ))}

            </div>            </div>

          )}          )}

        </div>        </div>



        {/* Reply Form */}        {/* Reply Form */}

        <div className="border-t border-white/10 p-6 bg-white/5">        <div className="border-t border-white/10 p-6 bg-white/5">

          <div className="flex gap-3">          <div className="flex gap-3">

            <textarea            <textarea

              value={newMessage}              value={newMessage}

              onChange={(e) => setNewMessage(e.target.value)}              onChange={(e) => setNewMessage(e.target.value)}

              placeholder="Type your reply..."              placeholder="Type your reply..."

              rows={3}              rows={3}

              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"

            />            />

            <IconButton            <IconButton

              onClick={sendMessage}              onClick={sendMessage}

              disabled={sending || !newMessage.trim()}              disabled={sending || !newMessage.trim()}

              gradient="from-orange-600 to-red-600"              gradient="from-orange-600 to-red-600"

              className="h-fit"              className="h-fit"

            >            >

              <span>{sending ? "🔄" : "📤"}</span>              <span>{sending ? "🔄" : "📤"}</span>

              <span className="hidden sm:inline">{sending ? "Sending..." : "Send"}</span>              <span className="hidden sm:inline">{sending ? "Sending..." : "Send"}</span>

            </IconButton>            </IconButton>

          </div>          </div>

        </div>        </div>

      </div>      </div>

    </div>    </div>

  )  )

}}

export default function SupportPage() {
  const router = useRouter()
  const { formatNumber } = useDesignSystem()
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
    { value: "technical", label: "Technical Issue", icon: "⚙️", color: "from-blue-500 to-cyan-500" },
    { value: "account", label: "Account Problem", icon: "👤", color: "from-purple-500 to-pink-500" },
    { value: "billing", label: "Billing Question", icon: "💳", color: "from-green-500 to-emerald-500" },
    { value: "feature", label: "Feature Request", icon: "✨", color: "from-yellow-500 to-orange-500" },
    { value: "bug", label: "Bug Report", icon: "🐛", color: "from-red-500 to-pink-500" },
    { value: "other", label: "Other", icon: "❓", color: "from-gray-500 to-slate-500" }
  ]

  const quickHelpOptions = [
    {
      title: "FAQ",
      description: "Find answers to common questions",
      icon: "❓",
      href: "/dashboard/help",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      title: "Documentation", 
      description: "Detailed guides and tutorials",
      icon: "📚",
      href: "/docs",
      gradient: "from-green-500 to-blue-500"
    },
    {
      title: "Community",
      description: "Connect with other users",
      icon: "👥", 
      href: "/community",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Live Chat",
      description: "Chat with support agents",
      icon: "💬",
      href: "#",
      gradient: "from-orange-500 to-red-500"
    }
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
      case "open": return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      case "in_progress": return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "resolved": return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      case "closed": return "bg-gradient-to-r from-gray-500 to-slate-500 text-white"
      default: return "bg-white/20 text-white/60"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      case "medium": return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
      case "high": return "bg-gradient-to-r from-orange-500 to-red-500 text-white"
      case "urgent": return "bg-gradient-to-r from-red-500 to-pink-500 text-white"
      default: return "bg-white/20 text-white/60"
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/60">Loading support center...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/20 via-red-600/20 to-pink-600/20 rounded-3xl blur-xl"></div>
        <GradientCard className="relative border-orange-500/30">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-orange-200 to-red-200 bg-clip-text text-transparent">
                  🆘 Support Center
                </h1>
                <LiveIndicator 
                  isLive={tickets.some(t => t.status === "open" || t.status === "in_progress")} 
                  count={tickets.filter(t => t.status === "open" || t.status === "in_progress").length} 
                  label="Active" 
                />
              </div>
              <p className="text-white/80 text-lg">Get help with your account and technical issues</p>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>🎫 Support Tickets</span>
                <span>•</span>
                <span>💬 Live Chat</span>
                <span>•</span>
                <span>📚 Knowledge Base</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <IconButton
                onClick={() => setShowCreateTicket(!showCreateTicket)}
                gradient="from-orange-600 to-red-600"
                className="shadow-lg hover:shadow-orange-500/25"
              >
                <span>🎫</span>
                <span className="hidden sm:inline">{showCreateTicket ? "Cancel" : "New Ticket"}</span>
              </IconButton>
              <IconButton
                onClick={() => router.push("/dashboard/help")}
                variant="secondary"
              >
                <span>❓</span>
                <span className="hidden sm:inline">Help Center</span>
              </IconButton>
            </div>
          </div>
        </GradientCard>
      </div>

      {/* Quick Help Links */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>⚡</span>
          Quick Help
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickHelpOptions.map((option, index) => (
            <div
              key={index}
              className="cursor-pointer"
              onClick={() => option.href !== "#" && router.push(option.href)}
            >
              <GradientCard
                gradient={`${option.gradient}/10`}
                className="text-center hover:border-orange-400/40 transition-all duration-300"
              >
              <div className="space-y-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${option.gradient} rounded-xl flex items-center justify-center text-white text-xl mx-auto`}>
                  {option.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">{option.title}</h3>
                  <p className="text-white/60 text-sm">{option.description}</p>
                </div>
                <IconButton
                  gradient={option.gradient}
                  size="sm"
                  className="w-full"
                  disabled={option.href === "#"}
                >
                  {option.href === "#" ? "Coming Soon" : "Open"}
                </IconButton>
              </div>
            </GradientCard>
            </div>
          ))}
        </div>
      </div>

      {/* Create Ticket Form */}
      {showCreateTicket && (
        <GradientCard className="border-green-500/30">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🎫</span>
            Create Support Ticket
          </h2>
          
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={newTicket.title}
                onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of your issue"
                maxLength={200}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
              />
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">Category *</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">Priority</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">Description *</label>
              <textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Please provide detailed information about your issue..."
                rows={6}
                maxLength={2000}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all resize-none"
              />
              <div className="text-white/40 text-xs mt-2 text-right">
                {newTicket.description.length}/2000 characters
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <IconButton
                onClick={createTicket}
                disabled={creating}
                gradient="from-green-600 to-emerald-600"
                className="shadow-lg hover:shadow-green-500/25"
              >
                <span>{creating ? "🔄" : "🎫"}</span>
                {creating ? "Creating..." : "Create Ticket"}
              </IconButton>
              <IconButton
                onClick={() => setShowCreateTicket(false)}
                variant="secondary"
              >
                <span>❌</span>
                Cancel
              </IconButton>
            </div>
          </div>
        </GradientCard>
      )}

      {/* Tickets List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🎫</span>
            Your Support Tickets
          </h2>
          <div className="text-white/60 text-sm">
            {formatNumber(tickets.length)} ticket{tickets.length !== 1 ? "s" : ""}
          </div>
        </div>

        {tickets.length === 0 ? (
          <GradientCard className="text-center py-16">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Support Tickets</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              You haven't created any support tickets yet. If you need help, feel free to create one!
            </p>
            <IconButton
              onClick={() => setShowCreateTicket(true)}
              className="shadow-lg hover:shadow-orange-500/25"
            >
              <span>🎫</span>
              Create Your First Ticket
            </IconButton>
          </GradientCard>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <GradientCard
                  className="hover:border-orange-400/40 transition-all duration-300"
                >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white mb-2 line-clamp-1">{ticket.title}</h3>
                    <p className="text-white/60 text-sm line-clamp-2 mb-3">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="text-white/40 text-sm ml-4 flex-shrink-0">
                    #{ticket.id.slice(-6)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status.replace("_", " ").toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 bg-white/10 text-white/70 text-xs rounded-full">
                    {categories.find(c => c.value === ticket.category)?.icon}{" "}
                    {categories.find(c => c.value === ticket.category)?.label || ticket.category}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-white/60">
                  <div className="flex items-center gap-4">
                    {ticket.assigned_to && (
                      <div className="flex items-center gap-2">
                        <span>👨‍💻 Assigned to:</span>
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
                      <span>💬 {ticket.messages.length} replies</span>
                    )}
                  </div>
                  <div>
                    Updated {formatDate(ticket.updated_at)}
                  </div>
                </div>
              </GradientCard>
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-orange-600/10 to-red-600/10">
          <div>
            <h2 className="text-xl font-bold text-white">{ticket.title}</h2>
            <p className="text-white/60 text-sm">Ticket #{ticket.id.slice(-6)}</p>
          </div>
          <IconButton
            onClick={onClose}
            variant="secondary"
            size="sm"
          >
            ✕
          </IconButton>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-96 p-6">
          {/* Original Description */}
          <GradientCard gradient="from-blue-900/30 to-purple-900/30" className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">📝</span>
              </div>
              <div>
                <span className="font-medium text-white">Original Issue</span>
                <div className="text-white/60 text-sm">{new Date(ticket.created_at).toLocaleString()}</div>
              </div>
            </div>
            <p className="text-white/80">{ticket.description}</p>
          </GradientCard>

          {/* Messages */}
          {ticket.messages.length > 0 && (
            <div className="space-y-4 mb-6">
              <h3 className="font-medium text-white flex items-center gap-2">
                <span>💬</span>
                Conversation ({ticket.messages.length})
              </h3>
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
                        <span className="px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-full">
                          Staff
                        </span>
                      )}
                      <span className="text-white/60 text-sm">{new Date(message.created_at).toLocaleString()}</span>
                    </div>
                    <div className="text-white/80 bg-white/5 rounded-lg p-3">{message.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Form */}
        <div className="border-t border-white/10 p-6 bg-white/5">
          <div className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your reply..."
              rows={3}
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
            />
            <IconButton
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              gradient="from-orange-600 to-red-600"
              className="h-fit"
            >
              <span>{sending ? "🔄" : "📤"}</span>
              <span className="hidden sm:inline">{sending ? "Sending..." : "Send"}</span>
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  )
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