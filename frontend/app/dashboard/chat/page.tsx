"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ChatComponent from "@/components/chat/ChatComponent"
import ModerationPanel from "@/components/chat/ModerationPanel"
import api, { Party, User, authApi } from "@/lib/api-client"

export default function ChatPage() {
  const router = useRouter()
  const [parties, setParties] = useState<Party[]>([])
  const [selectedParty, setSelectedParty] = useState<Party | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModeration, setShowModeration] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load current user
      const userResponse = await authApi.getProfile()
      setCurrentUser(userResponse)

      // Load user's parties (both hosting and joined)
      const [hostingResponse, joinedResponse] = await Promise.all([
        api.get("/parties/", { params: { hosting: true } }),
        api.get("/parties/joined/")
      ])

      const hostingParties = Array.isArray(hostingResponse) ? hostingResponse : (hostingResponse.results || [])
      const joinedParties = Array.isArray(joinedResponse) ? joinedResponse : (joinedResponse.results || [])

      // Combine and deduplicate parties
      const allParties = [...hostingParties, ...joinedParties]
      const uniqueParties = allParties.filter((party, index, self) => 
        index === self.findIndex(p => p.id === party.id)
      )

      setParties(uniqueParties)

      // Auto-select first party if available
      if (uniqueParties.length > 0 && !selectedParty) {
        setSelectedParty(uniqueParties[0])
      }
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const isHost = (party: Party) => {
    return party.host?.id === currentUser?.id
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white/60">Loading chat...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      <div className="flex h-screen">
        {/* Parties Sidebar */}
        <div className="w-80 bg-black/20 border-r border-white/10 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">Chat</h1>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-white/60 hover:text-white transition-colors"
              >
                ←
              </button>
            </div>
            
            <p className="text-white/60 text-sm">
              Select a party to join the chat
            </p>
          </div>

          {/* Parties List */}
          <div className="flex-1 overflow-y-auto p-6">
            {parties.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-white/60 mb-4">No active parties</p>
                <button
                  onClick={() => router.push("/parties")}
                  className="px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg text-sm transition-colors"
                >
                  Browse Parties
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {parties.map((party) => (
                  <button
                    key={party.id}
                    onClick={() => setSelectedParty(party)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedParty?.id === party.id
                        ? "bg-brand-blue/20 border-brand-blue/30 text-white"
                        : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium truncate">{party.name}</h3>
                      {isHost(party) && (
                        <span className="px-2 py-1 bg-purple-600/20 text-brand-purple-light rounded text-xs ml-2">
                          Host
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-white/60 line-clamp-2 mb-2">
                      {party.description || "No description"}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <span>👥 {party.participants_count || 0}</span>
                      <span className={`px-2 py-1 rounded ${
                        party.status === "live" 
                          ? "bg-brand-cyan/20 text-brand-cyan-light"
                          : party.status === "scheduled"
                          ? "bg-brand-orange/20 text-brand-orange-light"
                          : "bg-brand-coral/20 text-brand-coral-light"
                      }`}>
                        {party.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-white/10">
            <div className="space-y-3">
              <button
                onClick={() => router.push("/dashboard/rooms")}
                className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
              >
                Manage Rooms
              </button>
              <button
                onClick={() => router.push("/parties")}
                className="w-full px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg text-sm transition-colors"
              >
                Find More Parties
              </button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedParty ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-white/10 bg-black/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedParty.name}</h2>
                    <p className="text-white/60 text-sm">
                      {selectedParty.participants_count || 0} participants • {selectedParty.status}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {isHost(selectedParty) && (
                      <button
                        onClick={() => setShowModeration(true)}
                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-brand-blue-light rounded-lg text-sm font-medium transition-colors"
                      >
                        🛡️ Moderation
                      </button>
                    )}
                    
                    <button
                      onClick={() => router.push(`/room/${selectedParty.id}`)}
                      className="px-4 py-2 bg-brand-cyan hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      🎬 Join Room
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat Component */}
              <div className="flex-1 min-h-0">
                <ChatComponent
                  partyId={selectedParty.id}
                  currentUser={currentUser || undefined}
                  isHost={isHost(selectedParty)}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-6">💬</div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Welcome to Chat
                </h2>
                <p className="text-white/60 mb-8 max-w-md">
                  Select a party from the sidebar to start chatting with other members.
                </p>
                
                {parties.length === 0 && (
                  <button
                    onClick={() => router.push("/parties")}
                    className="px-6 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg font-medium transition-colors"
                  >
                    Find Parties to Chat
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Moderation Panel */}
      {showModeration && selectedParty && (
        <ModerationPanel
          partyId={selectedParty.id}
          isHost={isHost(selectedParty)}
          onClose={() => setShowModeration(false)}
        />
      )}
    </div>
  )
}