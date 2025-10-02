'use client'

import { useState, useEffect, useRef } from "react"
import { ConfirmDialog } from "@/components/ui/feedback"

export interface PublicPartyViewModel {
  id: string
  title: string
  description?: string
  roomCode: string
  host: {
    id: string
    name: string
    avatar?: string | null
    isPremium?: boolean
  }
  participantCount: number
  allowChat: boolean
  allowReactions: boolean
  status: string
  statusLabel: string
  isPlaying: boolean
  playbackPosition: string
  lastSyncAt?: string
  video?: {
    id: string
    title: string
    durationLabel?: string
  }
}

interface Message {
  id: string
  user: string
  text: string
  timestamp: Date
  isGuest: boolean
}

interface PublicPartyLayoutProps {
  party: PublicPartyViewModel
  guestName: string
  onLeave: () => void
}

/**
 * PublicPartyLayout - Limited feature party room for anonymous users
 * Features: Video sync + basic text chat ONLY
 * No: Voice, emoji reactions, polls, games, advanced controls
 */
export function PublicPartyLayout({ party, guestName, onLeave }: PublicPartyLayoutProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const statusTone = party.status.toLowerCase()
  const statusBadgeStyles =
    statusTone === "live"
      ? "border-green-500/30 bg-green-500/15 text-green-300"
      : statusTone === "paused"
        ? "border-yellow-500/30 bg-yellow-500/15 text-yellow-300"
        : "border-white/20 bg-white/10 text-white/70"

  const chatDisabled = !party.allowChat
  const lastSyncLabel = party.lastSyncAt
    ? new Date(party.lastSyncAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Simulate receiving messages (replace with WebSocket in production)
  useEffect(() => {
    // Add welcome message
    const welcomeMsg: Message = {
      id: Date.now().toString(),
      user: "System",
      text: `${guestName} joined the party`,
      timestamp: new Date(),
      isGuest: false
    }
    setMessages([welcomeMsg])
  }, [guestName])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      user: guestName,
      text: newMessage,
      timestamp: new Date(),
      isGuest: true
    }

    setMessages(prev => [...prev, message])
    setNewMessage("")

    // TODO: Send to WebSocket/API
  }

  const handleLeaveParty = () => {
    setShowLeaveDialog(true)
  }

  const confirmLeave = () => {
    setShowLeaveDialog(false)
    onLeave()
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Simple Header */}
      <header className="border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Party Info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-purple to-brand-blue">
                <span className="text-xl">🎬</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">{party.title}</h1>
                <p className="text-xs text-white/50">Code: {party.roomCode}</p>
                <p className="text-[11px] text-white/40">Hosted by {party.host.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5">
              <span className="text-sm">👥</span>
              <span className="text-sm font-medium text-white">{party.participantCount}</span>
            </div>
            <div className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${statusBadgeStyles}`}>
              Status: {party.statusLabel}
            </div>
          </div>

          {/* Guest Badge & Leave */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/20 border border-blue-500/30 px-3 py-1.5">
              <span className="text-sm font-medium text-blue-300">👁️ Guest: {guestName}</span>
            </div>
            <button
              onClick={handleLeaveParty}
              className="rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/30 transition-colors"
            >
              Leave Party
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Player Section */}
        <div className="flex flex-1 flex-col p-6">
          <div className="flex-1 rounded-2xl bg-black/40 border border-white/10 overflow-hidden">
            {party.video ? (
              <div className="flex h-full flex-col">
                {/* Video Player Placeholder */}
                <div className="relative flex-1 bg-black">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="mb-4 text-6xl">📹</div>
                      <p className="mb-2 text-2xl font-bold text-white">{party.video.title}</p>
                      <p className="text-white/50">Video player would render here</p>
                      <p className="mt-2 text-sm text-white/30">Synced with host</p>
                    </div>
                  </div>
                </div>

                {/* Simple Controls */}
                <div className="border-t border-white/10 bg-gray-900/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/70">
                    <div className="flex flex-wrap items-center gap-4">
                      <span data-testid="playback-status">
                        Playback: <span className="font-semibold text-white">{party.isPlaying ? "Playing" : "Paused"}</span>
                      </span>
                      <span data-testid="playback-position">
                        Position: <span className="font-semibold text-white">{party.playbackPosition}</span>
                      </span>
                      {party.video.durationLabel && (
                        <span data-testid="playback-duration">
                          Duration: <span className="font-semibold text-white">{party.video.durationLabel}</span>
                        </span>
                      )}
                    </div>
                    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/15 px-3 py-1.5 text-xs font-medium text-yellow-200">
                      🔒 Host controls playback
                    </div>
                  </div>
                  {lastSyncLabel && (
                    <p className="mt-2 text-xs text-white/40">Last synced at {lastSyncLabel}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 text-6xl">🎬</div>
                  <p className="mb-2 text-xl font-semibold text-white">No video playing</p>
                  <p className="text-white/50">Waiting for host to start a video...</p>
                  <div className="mt-4 flex flex-col items-center gap-1 text-xs text-white/60">
                    <span>Status: {party.statusLabel}</span>
                    <span data-testid="playback-status-fallback">Playback: {party.isPlaying ? "Playing" : "Paused"}</span>
                    <span data-testid="playback-position-fallback">Position: {party.playbackPosition}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Guest Mode Notice */}
          <div className="mt-4 rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
            <p className="text-sm text-blue-300">
              <strong>Guest Mode Limitations:</strong> You can watch synced video and send text messages only. 
              <a href="/auth/register" className="ml-1 underline hover:text-blue-200">Sign up</a> for 
              voice chat, emoji reactions, polls, and more!
            </p>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-96 border-l border-white/10 bg-gray-950/50 backdrop-blur-xl flex flex-col">
          {/* Chat Header */}
          <div className="border-b border-white/10 p-4">
            <h2 className="text-lg font-bold text-white">💬 Chat</h2>
            {chatDisabled ? (
              <p className="text-xs text-yellow-300">Chat is disabled by the host for guests.</p>
            ) : (
              <p className="text-xs text-white/50">Text messages only</p>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-white/50">No messages yet...</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="rounded-lg bg-white/5 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`text-sm font-semibold ${msg.isGuest ? 'text-blue-300' : 'text-purple-300'}`}>
                      {msg.user}
                    </span>
                    {msg.isGuest && (
                      <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-blue-light">
                        GUEST
                      </span>
                    )}
                    <span className="ml-auto text-xs text-white/40">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-white/90">{msg.text}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="border-t border-white/10 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                maxLength={500}
                aria-label="Chat message"
                disabled={chatDisabled}
                className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder-white/50 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={chatDisabled || !newMessage.trim()}
                className="rounded-lg bg-brand-purple px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-purple-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <p className="mt-2 text-xs text-white/40">
              {chatDisabled ? "Chat is currently disabled." : `${newMessage.length}/500 characters`}
            </p>
          </form>
        </div>
      </div>

      {/* Leave Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLeaveDialog}
        title="Leave Party?"
        message="Are you sure you want to leave the party? You'll need to enter your name again to rejoin."
        confirmLabel="Leave"
        cancelLabel="Stay"
        onConfirm={confirmLeave}
        onCancel={() => setShowLeaveDialog(false)}
        variant="warning"
      />
    </div>
  )
}
