"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

export default function PartyPage() {
  const params = useParams()
  const partyId = params.id as string
  const [partyData, setPartyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chatMessage, setChatMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    // Load party data
    async function loadParty() {
      try {
        // TODO: Replace with actual API call
        // For now, use mock data
        setPartyData({
          id: partyId,
          title: "Movie Night Party",
          host: "John Doe",
          participants: 3,
          status: "live",
          video_url: "https://example.com/movie",
        })
        
        setMessages([
          { id: 1, user: "Host", message: "Welcome to the party!", time: "20:30" },
          { id: 2, user: "Alice", message: "Thanks for hosting!", time: "20:31" },
          { id: 3, user: "Bob", message: "Great movie choice 🍿", time: "20:32" },
        ])
      } catch (error) {
        console.error("Failed to load party:", error)
      } finally {
        setLoading(false)
      }
    }

    loadParty()
  }, [partyId])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim()) return

    const newMessage = {
      id: messages.length + 1,
      user: "You",
      message: chatMessage,
      time: new Date().toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: false 
      }),
    }

    setMessages(prev => [...prev, newMessage])
    setChatMessage("")
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-white">Loading party...</div>
      </div>
    )
  }

  if (!partyData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Party Not Found</h1>
          <p className="text-white/70">This party doesn't exist or has ended.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Party Header */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white">{partyData.title}</h1>
            <p className="text-white/70">
              Hosted by {partyData.host} • {partyData.participants} watching
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-400 text-sm">● {partyData.status}</span>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
              Leave Party
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video Player Area */}
        <div className="lg:col-span-2">
          <div className="bg-black border border-white/10 rounded-lg aspect-video flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-4xl">🎬</div>
              <div className="text-white">
                <h3 className="font-semibold">Video Player</h3>
                <p className="text-sm text-white/70">
                  Video player will be implemented here
                </p>
              </div>
              {partyData.video_url && (
                <a 
                  href={partyData.video_url}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                >
                  Open Video Link
                </a>
              )}
            </div>
          </div>

          {/* Video Controls */}
          <div className="mt-4 bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full flex items-center justify-center">
                  ▶️
                </button>
                <div className="text-white text-sm">
                  <span>00:45:32</span> / <span>02:15:00</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-white/70 text-sm">Synced</span>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col h-[500px]">
          <h3 className="text-lg font-semibold text-white mb-4">Chat</h3>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {messages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-blue-400">{msg.user}</span>
                  <span className="text-white/50 text-xs">{msg.time}</span>
                </div>
                <p className="text-white/80 mt-1">{msg.message}</p>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="flex space-x-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}