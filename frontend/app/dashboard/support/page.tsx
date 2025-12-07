"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api-client";
import { LiveIndicator } from "@/components/ui/live-indicator";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  created_at: string;
  updated_at: string;
  user: { id: string; username: string; avatar?: string };
  assigned_to?: { id: string; username: string; avatar?: string };
  messages: Array<{
    id: string;
    content: string;
    created_at: string;
    author: { id: string; username: string; avatar?: string; is_staff: boolean };
  }>;
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as const,
  });

  const categories = ["technical", "account", "billing", "feature", "bug", "other"] as const;

  const load = async () => {
    try {
      const data = await api.support.getTickets();
      setTickets(data.results || []);
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createTicket = async () => {
    if (!form.title || !form.description || !form.category) return;
    setCreating(true);
    try {
      await api.support.createTicket(form);
      setForm({ title: "", description: "", category: "", priority: "medium" });
      setShowForm(false);
      load();
    } catch (err) {
      console.error("Failed to create ticket", err);
    } finally {
      setCreating(false);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-brand-blue/10 text-brand-blue border-brand-blue/30";
      case "in_progress": return "bg-brand-orange/10 text-brand-orange border-brand-orange/30";
      case "resolved": return "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30";
      case "closed": return "bg-brand-navy/5 text-brand-navy/60 border-brand-navy/20";
      default: return "bg-brand-navy/5 text-brand-navy/60 border-brand-navy/20";
    }
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-brand-cyan/10 text-brand-cyan";
      case "medium": return "bg-brand-orange/10 text-brand-orange";
      case "high": return "bg-brand-coral/10 text-brand-coral";
      case "urgent": return "bg-brand-coral/20 text-brand-coral-dark";
      default: return "bg-brand-navy/5 text-brand-navy/60";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/20 via-brand-blue/20 to-brand-purple/20 rounded-2xl sm:rounded-3xl blur-3xl opacity-60 pointer-events-none"></div>
        <div className="glass-panel relative rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 border-brand-cyan/20">
          <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:justify-between md:items-center">
            <div className="space-y-1 sm:space-y-2">
              <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4">
                <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-brand-navy">
                  <span className="gradient-text">Support Center</span>
                </h1>
                <LiveIndicator count={tickets.filter(t => t.status === "open").length} label="Open Tickets" />
              </div>
              <p className="text-brand-navy/70 text-sm sm:text-base lg:text-lg">Get help with your account, billing, or technical issues</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all shadow-lg min-h-[44px] text-sm sm:text-base ${
                showForm 
                  ? "bg-white text-brand-navy hover:bg-brand-neutral border border-brand-navy/10" 
                  : "btn-gradient text-white hover:shadow-brand-cyan/25 hover:-translate-y-0.5"
              }`}
            >
              {showForm ? "Cancel" : "New Ticket"}
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-brand-navy flex items-center gap-2">
              <span>🎫</span> Create Support Ticket
            </h2>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-bold text-brand-navy/70 ml-1">Title</label>
                <input
                  type="text"
                  placeholder="Brief summary of the issue"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white/50 border border-brand-navy/10 rounded-lg sm:rounded-xl text-sm sm:text-base text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple/30 transition-all"
                />
              </div>
              
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-brand-navy/70 ml-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white/50 border border-brand-navy/10 rounded-lg sm:rounded-xl text-sm sm:text-base text-brand-navy focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple/30 transition-all cursor-pointer min-h-[44px]"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-navy/70 ml-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full px-4 py-3 bg-white/50 border border-brand-navy/10 rounded-xl text-brand-navy focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple/30 transition-all cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-navy/70 ml-1">Description</label>
                <textarea
                  placeholder="Detailed description of your issue..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 bg-white/50 border border-brand-navy/10 rounded-xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple/30 transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={createTicket}
                  disabled={creating || !form.title || !form.description || !form.category}
                  className="btn-gradient px-8 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-brand-purple/25 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {creating ? "Creating..." : "Submit Ticket"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-brand-navy/5 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-brand-navy/5 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center">
            <div className="text-6xl mb-6 opacity-80">🎫</div>
            <h3 className="text-2xl font-bold text-brand-navy mb-3">No support tickets</h3>
            <p className="text-brand-navy/60 text-lg">
              You haven't created any support tickets yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelected(ticket)}
                className="glass-card rounded-2xl p-6 cursor-pointer hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-navy/5 group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-brand-navy truncate group-hover:text-brand-purple transition-colors">{ticket.title}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border ${statusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-brand-navy/60 text-sm line-clamp-1">{ticket.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wide ${priorityColor(ticket.priority)}`}>
                      {ticket.priority} Priority
                    </span>
                    <span className="text-brand-navy/40 font-medium">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-brand-navy/20 text-xl group-hover:text-brand-purple group-hover:translate-x-1 transition-all">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && <TicketDetailModal ticket={selected} onClose={() => setSelected(null)} onUpdate={load} />}
    </div>
  );
}

function TicketDetailModal({
  ticket,
  onClose,
  onUpdate,
}: {
  ticket: SupportTicket;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.support.addTicketMessage(ticket.id, { content: message });
      setMessage("");
      onUpdate();
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white/90 border border-white/20 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl shadow-brand-navy/20 animate-in zoom-in-95 duration-200" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-brand-navy/10 bg-white/50 backdrop-blur-xl rounded-t-3xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-brand-navy">{ticket.title}</h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-brand-navy/5 text-brand-navy/60 font-bold uppercase tracking-wide border border-brand-navy/10">
                  #{ticket.id.slice(0, 8)}
                </span>
              </div>
              <p className="text-brand-navy/70 text-sm leading-relaxed">{ticket.description}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-brand-navy/5 rounded-full text-brand-navy/40 hover:text-brand-navy transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/30">
          {ticket.messages.length === 0 ? (
            <div className="text-center py-12 text-brand-navy/40">
              <p>No messages yet. Start the conversation below.</p>
            </div>
          ) : (
            ticket.messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 ${msg.author.is_staff ? 'flex-row-reverse' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  msg.author.is_staff ? 'bg-brand-purple text-white' : 'bg-brand-navy/10 text-brand-navy'
                }`}>
                  {msg.author.avatar ? (
                    <img src={msg.author.avatar} alt={msg.author.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="font-bold text-sm">{msg.author.username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                
                <div className={`flex-1 max-w-[80%] space-y-1 ${msg.author.is_staff ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 text-xs text-brand-navy/40 px-1">
                    <span className="font-bold text-brand-navy/60">{msg.author.username}</span>
                    {msg.author.is_staff && <span className="bg-brand-purple/10 text-brand-purple px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Staff</span>}
                    <span>•</span>
                    <span>{new Date(msg.created_at).toLocaleString()}</span>
                  </div>
                  
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.author.is_staff 
                      ? 'bg-brand-purple/10 text-brand-navy border border-brand-purple/10 rounded-tr-none' 
                      : 'bg-white border border-brand-navy/10 text-brand-navy rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply Area */}
        <div className="p-6 border-t border-brand-navy/10 bg-white/50 backdrop-blur-xl rounded-b-3xl">
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your reply..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-brand-navy/10 rounded-xl focus:border-brand-purple focus:ring-4 focus:ring-brand-purple/10 focus:outline-none text-brand-navy resize-none pr-32"
            />
            <div className="absolute bottom-3 right-3">
              <button
                onClick={send}
                disabled={sending || !message.trim()}
                className="bg-brand-navy hover:bg-brand-navy-light text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
