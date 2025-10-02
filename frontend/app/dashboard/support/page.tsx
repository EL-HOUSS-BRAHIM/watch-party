"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api-client";
import { GradientCard } from "@/components/ui/gradient-card";
import { IconButton } from "@/components/ui/icon-button";
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
      case "open": return "bg-brand-blue/20 text-brand-blue-light border-brand-blue/30";
      case "in_progress": return "bg-brand-orange/20 text-brand-orange-light border-brand-orange/30";
      case "resolved": return "bg-brand-cyan/20 text-brand-cyan-light border-brand-cyan/30";
      case "closed": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-brand-cyan/20 text-brand-cyan-light";
      case "medium": return "bg-brand-orange/20 text-brand-orange-light";
      case "high": return "bg-orange-500/20 text-orange-400";
      case "urgent": return "bg-brand-coral/20 text-brand-coral-light";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="space-y-8">
      <GradientCard>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Support</h1>
            <LiveIndicator count={tickets.filter(t => t.status === "open").length} label="Open" />
          </div>
          <IconButton onClick={() => setShowForm(!showForm)} variant="primary" size="md">
            {showForm ? "Cancel" : "New Ticket"}
          </IconButton>
        </div>
      </GradientCard>

      {showForm && (
        <GradientCard>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Create Support Ticket</h2>
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-brand-purple focus:outline-none"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-brand-purple focus:outline-none"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-brand-purple focus:outline-none"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-brand-purple focus:outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <IconButton onClick={createTicket} disabled={creating} variant="primary" size="md">
              {creating ? "Creating..." : "Create Ticket"}
            </IconButton>
          </div>
        </GradientCard>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <GradientCard>
            <div className="text-center py-8 text-gray-400">No support tickets yet</div>
          </GradientCard>
        ) : (
          tickets.map((ticket) => (
            <GradientCard key={ticket.id}>
              <div className="flex items-start justify-between cursor-pointer" onClick={() => setSelected(ticket)}>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{ticket.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{ticket.description.substring(0, 100)}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded border ${statusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${priorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </div>
              </div>
            </GradientCard>
          ))
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{ticket.title}</h2>
              <p className="text-gray-400 mt-2">{ticket.description}</p>
            </div>
            <IconButton onClick={onClose} variant="ghost" size="sm">×</IconButton>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          {ticket.messages.map((msg) => (
            <div key={msg.id} className={`p-4 rounded-lg ${msg.author.is_staff ? 'bg-brand-purple/10 border border-brand-purple/20' : 'bg-gray-800'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{msg.author.username}</span>
                {msg.author.is_staff && <span className="text-xs bg-brand-purple px-2 py-0.5 rounded">Staff</span>}
                <span className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString()}</span>
              </div>
              <p className="text-gray-300">{msg.content}</p>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-gray-800">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your reply..."
            rows={3}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-brand-purple focus:outline-none mb-3"
          />
          <IconButton onClick={send} disabled={sending || !message.trim()} variant="primary" size="md">
            {sending ? "Sending..." : "Send Reply"}
          </IconButton>
        </div>
      </div>
    </div>
  );
}
