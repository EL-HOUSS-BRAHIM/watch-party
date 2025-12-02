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
  const [streamError, setStreamError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
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
      setStreamError(null)
      return
    }

    let isActive = true
    setLoadingStream(true)
    setStreamError(null)

    const fetchStreamUrl = async () => {
      // Exponential backoff delays: 1s, 2s, 5s
      const delays = [0, 1000, 2000, 5000]
      const delay = delays[Math.min(retryCount, delays.length - 1)]
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      try {
        const response = await videosApi.getStreamUrl(party.video!.id)
        if (!isActive) return
        setStreamUrl(response.stream_url)
        setStreamError(null)
        setRetryCount(0) // Reset retry count on success
      } catch (err: any) {
        console.error('Failed to fetch stream URL:', err)
        if (!isActive) return
        
        // Parse error type from response
        const errorData = err?.response?.data
        const errorType = errorData?.error || 'unknown'
        
        let errorMessage = 'Failed to load video'
        
        if (errorType === 'drive_token_expired' || errorType === 'drive_disconnected') {
          errorMessage = 'Google Drive disconnected. Please reconnect in settings.'
        } else if (errorType === 'video_not_ready') {
          errorMessage = 'Video is still processing. Try again in a moment.'
        } else if (errorType === 'file_not_found') {
          errorMessage = 'Video file not found on Google Drive.'
        } else if (errorType === 'proxy_error' || errorType === 'stream_failed') {
          errorMessage = 'Unable to stream video. Please try again.'
        } else if (err?.message) {
          errorMessage = err.message
        }
        
        setStreamUrl(null)
        setStreamError(errorMessage)
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
  }, [party.video?.id, retryCount])

  // Load existing messages and add welcome message
  useEffect(() => {
    if (loadedMessagesRef.current) return
    loadedMessagesRef.current = true

    const loadMessages = async () => {
      // Add welcome message for all users
      const welcomeMsg: Message = {
        id: `welcome-${Date.now()}`,
        user: "System",
        text: `${guestName} joined the party`,
        timestamp: new Date(),
        isGuest: false
      }

      // Only try to load messages for authenticated users
      if (isAuthenticated) {
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
          
          setMessages([...existingMessages, welcomeMsg])
        } catch (err) {
          // Silently handle error for authenticated users, still show welcome
          console.log('Chat history unavailable, starting fresh')
          setMessages([welcomeMsg])
        }
      } else {
        // Guest mode: no API call, just welcome message
        setMessages([welcomeMsg])
      }
    }

    void loadMessages()
  }, [party.id, guestName, isAuthenticated])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sendingMessage) return

    const messageText = newMessage.trim()
    setNewMessage("")
    setSendingMessage(true)

    // Optimistic update - add message immediately for both guests and members
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
      // Only try to persist for authenticated users
      if (isAuthenticated) {
        const savedMessage = await chatApi.sendMessage(party.id, messageText)
        // Replace temp message with saved one (will have real ID from server)
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, id: savedMessage.id }
            : msg
        ))
      }
      // For guests: message stays with temp ID (client-side only)
      // This is intentional - guest messages are ephemeral and not persisted
    } catch (err) {
      // Silently handle errors - message already visible optimistically
      console.log('Message sent locally:', messageText)
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
    <div className="relative min-h-screen bg-gradient-to-br from-brand-navy via-brand-purple/30 to-brand-navy overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-brand-magenta/30 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-brand-cyan/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-64 sm:w-96 h-64 sm:h-96 bg-brand-purple/30 rounded-full blur-3xl" />
      </div>

      {/* Header with Glass Effect - Responsive */}
      <header className="relative border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-[1800px] mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            {/* Party Info Card - Mobile Optimized */}
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 sm:gap-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 shadow-xl flex-1 sm:flex-initial">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-brand-magenta via-brand-purple to-brand-cyan shadow-lg flex-shrink-0">
                  <span className="text-xl sm:text-2xl">🎬</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-xl font-bold text-white drop-shadow-lg truncate">{party.title}</h1>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
                    <span className="text-[10px] sm:text-xs font-semibold text-brand-cyan-light">#{party.roomCode}</span>
                    <span className="text-[10px] sm:text-xs text-white/40">•</span>
                    <span className="text-[10px] sm:text-xs text-white/60 truncate">{party.host.name}</span>
                  </div>
                </div>
              </div>

              {/* Stats Pills - Compact on Mobile */}
              <div className="hidden xs:flex items-center gap-2">
                <div className="backdrop-blur-xl bg-gradient-to-br from-brand-purple/20 to-brand-blue/20 border border-brand-purple/30 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1.5 sm:gap-2 shadow-lg">
                  <span className="text-base sm:text-lg">👥</span>
                  <span className="text-xs sm:text-sm font-bold text-white">{party.participantCount}</span>
                </div>
                <div className={`backdrop-blur-xl border rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold shadow-lg ${statusBadgeStyles}`}>
                  {party.statusLabel}
                </div>
              </div>
            </div>

            {/* User Badge & Actions - Responsive */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Mobile Stats (shown only on small screens) */}
              <div className="flex xs:hidden items-center gap-2 flex-1">
                <div className="backdrop-blur-xl bg-gradient-to-br from-brand-purple/20 to-brand-blue/20 border border-brand-purple/30 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-lg">
                  <span className="text-base">👥</span>
                  <span className="text-xs font-bold text-white">{party.participantCount}</span>
                </div>
                <div className={`backdrop-blur-xl border rounded-xl px-2.5 py-1.5 text-[10px] font-bold shadow-lg ${statusBadgeStyles}`}>
                  {party.statusLabel}
                </div>
              </div>

              <div className={`backdrop-blur-xl border rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg ${
                isHost 
                  ? 'bg-gradient-to-r from-brand-coral/20 to-brand-coral/10 border-brand-coral/40' 
                  : isAuthenticated 
                    ? 'bg-gradient-to-r from-brand-purple/20 to-brand-purple/10 border-brand-purple/40' 
                    : 'bg-gradient-to-r from-brand-cyan/20 to-brand-blue/10 border-brand-cyan/40'
              }`}>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg">{isHost ? '👑' : isAuthenticated ? '👤' : '👁️'}</span>
                  <span className={`text-xs sm:text-sm font-bold truncate max-w-[80px] sm:max-w-none ${
                    isHost ? 'text-brand-coral-light' : isAuthenticated ? 'text-purple-300' : 'text-brand-cyan-light'
                  }`}>
                    {guestName}
                  </span>
                  {isHost && <span className="hidden sm:inline text-xs font-bold text-brand-coral/80 ml-1">HOST</span>}
                </div>
              </div>
              <button
                onClick={handleLeaveParty}
                className="backdrop-blur-xl bg-gradient-to-r from-brand-coral/20 to-red-500/20 border border-brand-coral/40 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-red-200 hover:from-brand-coral/30 hover:to-red-500/30 transition-all shadow-lg hover:shadow-brand-coral/25"
              >
                <span className="hidden sm:inline">🚪 Leave</span>
                <span className="sm:hidden">🚪</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid - Responsive */}
      <div className="relative max-w-[1800px] mx-auto p-3 sm:p-6 grid lg:grid-cols-[1fr_400px] gap-3 sm:gap-6 min-h-[calc(100vh-120px)]">
        {/* Video Player Card - Mobile First */}
        <div className="flex flex-col gap-3 sm:gap-4 order-1">
          <div className="flex-1 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/20 min-h-[300px] sm:min-h-[400px]">
            {party.video && streamUrl && !loadingStream ? (
              <div className="flex h-full flex-col">
                {/* Video Info Header - Responsive */}
                <div className="backdrop-blur-xl bg-gradient-to-r from-brand-purple/30 via-brand-magenta/20 to-brand-cyan/20 border-b border-white/10 px-3 sm:px-5 py-3 sm:py-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple shadow-lg flex-shrink-0">
                        <span className="text-base sm:text-xl">🎥</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm sm:text-base text-white drop-shadow-lg truncate">{party.video.title}</h3>
                        {party.video.durationLabel && (
                          <p className="text-[10px] sm:text-xs text-white/60 mt-0.5">⏱ {party.video.durationLabel}</p>
                        )}
                      </div>
                    </div>
                    {isHost && (
                      <>
                        <a
                          href={`/dashboard/parties/${party.id}/edit`}
                          className="hidden sm:flex backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-brand-cyan-light hover:bg-white/20 transition-all shadow-lg"
                        >
                          ⚙️ Settings
                        </a>
                        <a
                          href={`/dashboard/parties/${party.id}/edit`}
                          className="sm:hidden backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-bold text-brand-cyan-light hover:bg-white/20 transition-all shadow-lg"
                        >
                          ⚙️
                        </a>
                      </>
                    )}
                  </div>
                </div>

                {/* Video Player - Responsive */}
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

                {/* Playback Info Bar - Mobile Optimized */}
                <div className="backdrop-blur-xl bg-gradient-to-r from-brand-navy/80 to-brand-purple/40 border-t border-white/10 px-3 sm:px-5 py-3 sm:py-4">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className={`w-2 h-2 rounded-full ${party.isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                      <span className="text-white/70" data-testid="playback-status">
                        <span className="font-bold text-white">{party.isPlaying ? "Playing" : "Paused"}</span>
                      </span>
                    </div>
                    <div className="hidden sm:block h-4 w-px bg-white/20" />
                    <span className="text-white/70" data-testid="playback-position">
                      <span className="hidden sm:inline">Position: </span>
                      <span className="font-bold text-brand-cyan-light">{party.playbackPosition}</span>
                    </span>
                    {party.video.durationLabel && (
                      <>
                        <div className="hidden sm:block h-4 w-px bg-white/20" />
                        <span className="text-white/70" data-testid="playback-duration">
                          <span className="hidden sm:inline">Duration: </span>
                          <span className="font-bold text-white">{party.video.durationLabel}</span>
                        </span>
                      </>
                    )}
                  </div>
                  {lastSyncLabel && (
                    <p className="mt-2 text-[10px] sm:text-xs text-white/40">🔄 Last synced at {lastSyncLabel}</p>
                  )}
                </div>
              </div>
            ) : loadingStream ? (
              <div className="flex h-full items-center justify-center p-4">
                <div className="text-center">
                  <div className="mb-4 inline-block h-12 w-12 sm:h-16 sm:w-16 animate-spin rounded-full border-4 border-brand-purple/20 border-t-brand-magenta"></div>
                  <p className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">Loading video...</p>
                  <p className="mt-2 text-xs sm:text-sm text-white/60">Preparing your stream</p>
                </div>
              </div>
            ) : streamError ? (
              <div className="flex h-full items-center justify-center p-4 sm:p-8">
                <div className="text-center max-w-md">
                  <div className="mb-4 sm:mb-6 text-5xl sm:text-7xl drop-shadow-2xl">⚠️</div>
                  <p className="mb-2 sm:mb-3 text-xl sm:text-2xl font-bold text-white drop-shadow-lg">Video Unavailable</p>
                  <p className="text-white/70 mb-4 text-sm sm:text-base leading-relaxed bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                    {streamError}
                  </p>
                  
                  {/* Google Drive specific help */}
                  {video?.source_type === 'gdrive' && (
                    <div className="mb-6 text-white/60 text-xs sm:text-sm bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl p-4">
                      <p className="font-semibold mb-2">💡 This is a Google Drive video</p>
                      <p>Make sure your Google Drive connection is active in Settings → Integrations</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => {
                        setRetryCount(prev => prev + 1)
                        setStreamError(null)
                      }}
                      className="inline-block rounded-xl bg-gradient-to-r from-brand-magenta to-brand-orange px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-white shadow-xl shadow-brand-magenta/30 transition-all hover:scale-[1.02] hover:shadow-2xl"
                    >
                      🔄 Retry
                    </button>
                    {isHost && (
                      <a
                        href={`/dashboard/parties/${party.id}/edit`}
                        className="inline-block rounded-xl border-2 border-white/20 bg-white/10 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-white shadow-xl transition-all hover:bg-white/20"
                      >
                        ⚙️ Change Video
                      </a>
                    )}
                  </div>
                  {retryCount > 0 && (
                    <p className="mt-4 text-xs text-white/40">Retry attempt: {retryCount}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center p-4 sm:p-8">
                <div className="text-center max-w-md">
                  <div className="mb-4 sm:mb-6 text-5xl sm:text-7xl drop-shadow-2xl">🎬</div>
                  <p className="mb-2 sm:mb-3 text-xl sm:text-2xl font-bold text-white drop-shadow-lg">No Video Yet</p>
                  <p className="text-white/60 mb-6 sm:mb-8 text-xs sm:text-sm leading-relaxed">
                    {isHost 
                      ? "Attach a video from your library to start the watch party!"
                      : "The host will attach a video soon. Hang tight!"}
                  </p>
                  {isHost && (
                    <a
                      href={`/dashboard/parties/${party.id}/edit`}
                      className="inline-block rounded-xl bg-gradient-to-r from-brand-magenta via-brand-purple to-brand-cyan px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-white shadow-xl shadow-brand-purple/30 transition-all hover:scale-[1.02] hover:shadow-2xl"
                    >
                      📹 Attach Video
                    </a>
                  )}
                  <div className="mt-6 sm:mt-8 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-2 text-[10px] sm:text-xs text-white/50">
                    <div className="flex items-center justify-center gap-2">
                      <span>Status:</span>
                      <span className="font-bold text-white">{party.statusLabel}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2" data-testid="playback-status-fallback">
                      <span>Playback:</span>
                      <span className="font-bold text-white">{party.isPlaying ? "Playing" : "Paused"}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2" data-testid="playback-position-fallback">
                      <span>Position:</span>
                      <span className="font-bold text-white">{party.playbackPosition}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mode Notice Card - Mobile Optimized */}
          {!isHost && (
            <div className="backdrop-blur-xl bg-gradient-to-r from-brand-cyan/10 to-brand-blue/10 border border-brand-cyan/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl flex-shrink-0">ℹ️</span>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed flex-1">
                  {isAuthenticated ? (
                    <><strong className="text-brand-cyan-light">Member Mode:</strong> Watch synced video and chat with everyone. Only the host controls playback.</>
                  ) : (
                    <>
                      <strong className="text-brand-cyan-light">Guest Mode:</strong> Limited to watching and text chat. 
                      <a href="/auth/register" className="ml-1 underline text-brand-magenta-light hover:text-brand-magenta font-bold">Sign up free</a> for 
                      reactions, voice chat, polls, and host your own parties!
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
          {isHost && (
            <div className="backdrop-blur-xl bg-gradient-to-r from-brand-coral/10 to-brand-coral/5 border border-brand-coral/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg">
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl flex-shrink-0">👑</span>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed flex-1">
                  <strong className="text-brand-coral-light">Host Controls:</strong> You have full control! Use the video player to play, pause, and seek. Everyone syncs to you.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar Card - Mobile: Full Width Below Video */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/20 flex flex-col order-2 h-[500px] lg:h-auto">
          {/* Chat Header - Mobile Optimized */}
          <div className="backdrop-blur-xl bg-gradient-to-r from-brand-purple/30 via-brand-magenta/20 to-brand-cyan/20 border-b border-white/10 px-3 sm:px-5 py-3 sm:py-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg sm:text-xl">💬</span>
              <h2 className="text-base sm:text-lg font-bold text-white drop-shadow-lg">Live Chat</h2>
            </div>
            {chatDisabled ? (
              <p className="text-[10px] sm:text-xs text-brand-coral-light font-semibold">🚫 Chat disabled by host</p>
            ) : !isAuthenticated ? (
              <p className="text-[10px] sm:text-xs text-brand-cyan-light/80">
                💡 Guest messages are visible only to you
              </p>
            ) : (
              <p className="text-[10px] sm:text-xs text-white/50">Share your thoughts in real-time</p>
            )}
          </div>

          {/* Messages Area - Mobile Optimized Scrolling */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 opacity-30">💬</div>
                  <p className="text-xs sm:text-sm text-white/40">No messages yet...</p>
                  <p className="text-[10px] sm:text-xs text-white/30 mt-1">Be the first to say hi!</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-2.5 sm:p-3 shadow-lg hover:bg-white/10 transition-colors"
                >
                  <div className="mb-1.5 sm:mb-2 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span className={`text-xs sm:text-sm font-bold drop-shadow-lg ${
                      msg.user === 'System' ? 'text-yellow-300' : msg.isGuest ? 'text-brand-cyan-light' : 'text-brand-magenta-light'
                    }`}>
                      {msg.user}
                    </span>
                    {msg.isGuest && msg.user !== 'System' && (
                      <span className="rounded-lg bg-brand-cyan/20 border border-brand-cyan/30 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-brand-cyan-light">
                        GUEST
                      </span>
                    )}
                    {!msg.isGuest && msg.user !== 'System' && (
                      <span className="rounded-lg bg-brand-purple/20 border border-brand-purple/30 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-purple-300">
                        MEMBER
                      </span>
                    )}
                    <span className="ml-auto text-[10px] sm:text-xs text-white/40">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed break-words">{msg.text}</p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input - Mobile Touch Friendly */}
          <form onSubmit={handleSendMessage} className="backdrop-blur-xl bg-gradient-to-r from-brand-navy/80 to-brand-purple/40 border-t border-white/10 p-3 sm:p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                maxLength={500}
                aria-label="Chat message"
                disabled={chatDisabled}
                className="flex-1 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-white/40 focus:border-brand-magenta/50 focus:outline-none focus:ring-2 focus:ring-brand-magenta/20 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg"
              />
              <button
                type="submit"
                disabled={chatDisabled || !newMessage.trim()}
                className="backdrop-blur-xl bg-gradient-to-r from-brand-magenta to-brand-purple rounded-lg sm:rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-brand-magenta/30 transition-all hover:shadow-xl hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 active:scale-95"
              >
                Send
              </button>
            </div>
            <p className="mt-2 text-[10px] sm:text-xs text-white/40">
              {chatDisabled ? "💬 Chat is currently disabled" : `${newMessage.length}/500 characters`}
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
