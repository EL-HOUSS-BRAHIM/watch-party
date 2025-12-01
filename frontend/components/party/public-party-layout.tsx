'use client'

import { useState, useEffect, useRef } from "react"
import { ConfirmDialog } from "@/components/ui/feedback"
import { SyncedVideoPlayer } from "@/components/party/SyncedVideoPlayer"
import { chatApi, ChatMessage as ApiChatMessage, videosApi } from "@/lib/api-client"

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
  isAuthenticated?: boolean
  userId?: string
  isHost?: boolean
  onLeave: () => void
}

/**
 * PublicPartyLayout - Party room for both authenticated users and guests
 * Features: Video sync + basic text chat 
 * Host gets full controls, authenticated users get member features, guests get limited access
 */
export function PublicPartyLayout({ party, guestName, isAuthenticated, userId, isHost, onLeave }: PublicPartyLayoutProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [loadingStream, setLoadingStream] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const loadedMessagesRef = useRef(false)

  const statusTone = party.status.toLowerCase()
  const statusBadgeStyles =
    statusTone === "live"
      ? "border-brand-cyan/30 bg-brand-cyan/15 text-green-300"
      : statusTone === "paused"
        ? "border-brand-orange/30 bg-brand-orange/15 text-brand-orange-light"
      : "border-brand-navy/20 bg-white/10 text-brand-navy/70"

  const chatDisabled = !party.allowChat
  const lastSyncLabel = party.lastSyncAt
    ? new Date(party.lastSyncAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Fetch stream URL when video is attached
  useEffect(() => {
    if (!party.video?.id) {
      setStreamUrl(null)
      return
    }

    let isActive = true
    setLoadingStream(true)

    const fetchStreamUrl = async () => {
      try {
        const response = await videosApi.getStreamUrl(party.video!.id)
        if (!isActive) return
        setStreamUrl(response.stream_url)
      } catch (err) {
        console.error('Failed to fetch stream URL:', err)
        if (!isActive) return
        setStreamUrl(null)
      } finally {
        if (isActive) {
          setLoadingStream(false)
        }
      }
    }

    void fetchStreamUrl()

    return () => {
      isActive = false
    }
  }, [party.video?.id])

  // Load existing messages and add welcome message
  useEffect(() => {
    if (loadedMessagesRef.current) return
    loadedMessagesRef.current = true

    const loadMessages = async () => {
      try {
        // Load existing messages from API
        const response = await chatApi.getMessages(party.id, { page_size: 50 })
        const existingMessages: Message[] = response.results.map((msg: ApiChatMessage) => {
          // Construct display name from first_name and last_name
          const firstName = msg.user?.first_name || ''
          const lastName = msg.user?.last_name || ''
          const displayName = (firstName + ' ' + lastName).trim() || 'Unknown'
          
          return {
            id: msg.id,
            user: displayName,
            text: msg.content,
            timestamp: new Date(msg.created_at), // API returns created_at, not timestamp
            isGuest: false // API messages are from authenticated users
          }
        })
        
        // Add welcome message
        const welcomeMsg: Message = {
          id: `welcome-${Date.now()}`,
          user: "System",
          text: `${guestName} joined the party`,
          timestamp: new Date(),
          isGuest: false
        }
        
        setMessages([...existingMessages, welcomeMsg])
      } catch (err) {
        console.error('Failed to load chat messages:', err)
        // Still show welcome message even if loading fails
        const welcomeMsg: Message = {
          id: `welcome-${Date.now()}`,
          user: "System",
          text: `${guestName} joined the party`,
          timestamp: new Date(),
          isGuest: false
        }
        setMessages([welcomeMsg])
      }
    }

    void loadMessages()
  }, [party.id, guestName])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sendingMessage) return

    const messageText = newMessage.trim()
    setNewMessage("")
    setSendingMessage(true)

    // Optimistic update - add message immediately
    const tempId = `temp-${Date.now()}`
    const optimisticMessage: Message = {
      id: tempId,
      user: guestName,
      text: messageText,
      timestamp: new Date(),
      isGuest: !isAuthenticated
    }
    setMessages(prev => [...prev, optimisticMessage])

    try {
      // Send to API (only works for authenticated users)
      if (isAuthenticated) {
        const savedMessage = await chatApi.sendMessage(party.id, messageText)
        // Replace temp message with saved one
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, id: savedMessage.id }
            : msg
        ))
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      // Message is already shown optimistically, keep it visible
      // Could add error indicator here if needed
    } finally {
      setSendingMessage(false)
    }
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
              <span className="text-sm font-medium text-brand-navy">{party.participantCount}</span>
            </div>
            <div className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${statusBadgeStyles}`}>
              Status: {party.statusLabel}
            </div>
          </div>

          {/* User Badge & Leave */}
          <div className="flex items-center gap-3">
            <div className={`rounded-lg px-3 py-1.5 ${isHost ? 'bg-brand-coral/20 border border-brand-coral/30' : isAuthenticated ? 'bg-brand-purple/20 border border-brand-purple/30' : 'bg-brand-blue/20 border border-brand-blue/30'}`}>
              <span className={`text-sm font-medium ${isHost ? 'text-orange-300' : isAuthenticated ? 'text-purple-300' : 'text-blue-300'}`}>
                {isHost ? '👑 Host: ' : isAuthenticated ? '👤 ' : '👁️ Guest: '}{guestName}
              </span>
            </div>
            <button
              onClick={handleLeaveParty}
              className="rounded-lg bg-brand-coral/20 border border-brand-coral/30 px-4 py-2 text-sm font-medium text-red-300 hover:bg-brand-coral/30 transition-colors"
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
            {party.video && streamUrl && !loadingStream ? (
              <div className="flex h-full flex-col">
                {/* Video Info Bar */}
                <div className="border-b border-white/10 bg-gray-900/80 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-purple/20 text-xl">🎬</div>
                      <div>
                        <h3 className="font-semibold text-white">{party.video.title}</h3>
                        {party.video.durationLabel && (
                          <p className="text-xs text-white/50">Duration: {party.video.durationLabel}</p>
                        )}
                      </div>
                    </div>
                    {isHost && (
                      <div className="flex items-center gap-2">
                        <a
                          href={`/dashboard/parties/${party.id}/edit`}
                          className="rounded-lg bg-brand-purple/20 border border-brand-purple/30 px-3 py-1.5 text-sm font-medium text-purple-300 hover:bg-brand-purple/30 transition-colors"
                        >
                          ⚙️ Edit Party
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Synced Video Player */}
                <div className="relative flex-1 bg-black">
                  <SyncedVideoPlayer
                    partyId={party.id}
                    videoUrl={streamUrl}
                    isHost={isHost || false}
                    currentUserId={userId}
                    onPlayStateChange={(isPlaying) => {
                      console.log('Play state changed:', isPlaying);
                    }}
                    onTimeUpdate={(time) => {
                      // Could update progress display if needed
                    }}
                  />
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
                  </div>
                  {lastSyncLabel && (
                    <p className="mt-2 text-xs text-white/40">Last synced at {lastSyncLabel}</p>
                  )}
                </div>
              </div>
            ) : loadingStream ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand-purple/20 border-t-brand-purple"></div>
                  <p className="text-lg font-semibold text-white">Loading video...</p>
                  <p className="mt-2 text-sm text-white/50">Preparing stream</p>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center max-w-md px-4">
                  <div className="mb-4 text-6xl">🎬</div>
                  <p className="mb-2 text-xl font-semibold text-white">No video attached</p>
                  <p className="text-white/50 mb-6">
                    {isHost 
                      ? "Attach a video to start watching together!"
                      : "Waiting for host to attach a video..."}
                  </p>
                  {isHost && (
                    <a
                      href={`/dashboard/parties/${party.id}/edit`}
                      className="inline-block rounded-lg bg-gradient-to-r from-brand-purple to-brand-blue px-6 py-3 font-semibold text-white shadow-lg shadow-brand-purple/25 transition-all hover:-translate-y-0.5 hover:shadow-xl"
                    >
                      📹 Attach Video
                    </a>
                  )}
                  <div className="mt-6 flex flex-col items-center gap-1 text-xs text-white/60">
                    <span>Status: {party.statusLabel}</span>
                    <span data-testid="playback-status-fallback">Playback: {party.isPlaying ? "Playing" : "Paused"}</span>
                    <span data-testid="playback-position-fallback">Position: {party.playbackPosition}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mode Notice */}
          {!isHost && (
            <div className="mt-4 rounded-lg bg-brand-blue/10 border border-brand-blue/20 p-3">
              <p className="text-sm text-blue-300">
                {isAuthenticated ? (
                  <><strong>Member Mode:</strong> You can watch synced video and participate in chat. Only the host can control playback.</>
                ) : (
                  <><strong>Guest Mode Limitations:</strong> You can watch synced video and send text messages only. 
                  <a href="/auth/register" className="ml-1 underline hover:text-blue-200">Sign up</a> for 
                  voice chat, emoji reactions, polls, and more!</>
                )}
              </p>
            </div>
          )}
          {isHost && (
            <div className="mt-4 rounded-lg bg-brand-coral/10 border border-brand-coral/20 p-3">
              <p className="text-sm text-orange-300">
                <strong>Host Controls:</strong> You have full control over video playback. Use the video player controls to play, pause, and seek.
              </p>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="w-96 border-l border-white/10 bg-gray-950/50 backdrop-blur-xl flex flex-col">
          {/* Chat Header */}
          <div className="border-b border-white/10 p-4">
            <h2 className="text-lg font-bold text-white">💬 Chat</h2>
            {chatDisabled ? (
              <p className="text-xs text-brand-orange-light">Chat is disabled by the host for guests.</p>
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
                    <span className={`text-sm font-semibold ${msg.user === 'System' ? 'text-yellow-300' : msg.isGuest ? 'text-blue-300' : 'text-purple-300'}`}>
                      {msg.user}
                    </span>
                    {msg.isGuest && msg.user !== 'System' && (
                      <span className="rounded bg-brand-blue/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-blue-light">
                        GUEST
                      </span>
                    )}
                    {!msg.isGuest && msg.user !== 'System' && (
                      <span className="rounded bg-brand-purple/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-300">
                        MEMBER
                      </span>
                    )}
                    <span className="ml-auto text-xs text-brand-navy/40">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-brand-navy/90">{msg.text}</p>
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
                  className="flex-1 rounded-lg border border-brand-navy/20 bg-white/10 px-4 py-2 text-sm text-brand-navy placeholder-brand-navy/50 focus:border-brand-purple/50 focus:outline-none focus:ring-2 focus:ring-brand-purple/20 disabled:cursor-not-allowed disabled:opacity-50"
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
