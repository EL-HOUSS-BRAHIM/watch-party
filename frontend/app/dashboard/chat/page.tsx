"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ChatComponent from "@/components/chat/ChatComponent"
import ModerationPanel from "@/components/chat/ModerationPanel"
import { partiesApi, type Party, type User, authApi } from "@/lib/api-client"

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

      // Load accessible parties for the current user
      const partiesResponse = await partiesApi.list({ page_size: 100 })
      const partiesList = Array.isArray(partiesResponse)
        ? partiesResponse
        : (partiesResponse.results || [])

      setParties(partiesList)

      // Auto-select first party if available
      if (partiesList.length > 0 && !selectedParty) {
        setSelectedParty(partiesList[0])
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
      <div className="min-h-screen bg-gradient-to-br from-brand-neutral via-white to-brand-neutral-light">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-brand-navy/60">Loading chat...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)]">
      {/* Parties Sidebar - Always visible on desktop, hidden on mobile when party selected */}
      <div className={`${selectedParty ? 'hidden' : 'flex'} md:flex w-full md:w-80 glass-panel border-r border-brand-navy/10 flex-col page-sidebar`}>
          {/* Header */}
          <div className="p-6 border-b border-brand-navy/10">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-brand-navy">Chat</h1>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-brand-navy/60 hover:text-brand-navy transition-colors p-2 hover:bg-white/20 rounded-full"
              >
                ←
              </button>
            </div>
            
            <p className="text-brand-navy/60 text-sm font-medium">
              Select a party to join the chat
            </p>
          </div>

          {/* Parties List */}
          <div className="flex-1 overflow-y-auto p-6">
            {parties.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-brand-navy/60 mb-4 font-medium">No active parties</p>
                <button
                  onClick={() => router.push("/parties")}
                  className="px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-brand-purple/25 hover:-translate-y-0.5"
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
                    className={`w-full text-left p-4 rounded-2xl border transition-all group ${
                      selectedParty?.id === party.id
                        ? "bg-brand-blue/10 border-brand-blue/30 text-brand-navy shadow-lg"
                        : "bg-white/40 border-brand-navy/10 text-brand-navy/80 hover:bg-white/60 hover:shadow-md hover:-translate-y-0.5"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold truncate group-hover:text-brand-purple transition-colors">{party.name}</h3>
                      {isHost(party) && (
                        <span className="px-2 py-0.5 bg-brand-purple/10 text-brand-purple border border-brand-purple/30 rounded-full text-[10px] ml-2 font-bold uppercase tracking-wide">
                          Host
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-brand-navy/60 line-clamp-2 mb-3 font-medium">
                      {party.description || "No description"}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-brand-navy/50 font-bold">
                      <span>👥 {party.participants_count || 0}</span>
                      <span className={`px-2 py-0.5 rounded-full uppercase tracking-wide ${
                        party.status === "live" 
                          ? "bg-brand-cyan/10 text-brand-cyan"
                          : party.status === "scheduled"
                          ? "bg-brand-orange/10 text-brand-orange"
                          : "bg-brand-coral/10 text-brand-coral"
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
          <div className="p-6 border-t border-brand-navy/10 bg-white/20 backdrop-blur-sm">
            <div className="space-y-3">
              <button
                onClick={() => router.push("/dashboard/rooms")}
                className="w-full px-4 py-3 bg-white/60 border border-brand-navy/20 hover:bg-white text-brand-navy rounded-xl text-sm font-bold transition-all hover:shadow-md"
              >
                Manage Rooms
              </button>
              <button
                onClick={() => router.push("/parties")}
                className="w-full px-4 py-3 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-brand-purple/25 hover:-translate-y-0.5"
              >
                Find More Parties
              </button>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selectedParty ? 'flex' : 'hidden md:flex'} flex-1 flex-col glass-panel md:ml-4 md:rounded-3xl overflow-hidden border-brand-navy/10`}>
          {selectedParty ? (
            <>
              {/* Chat Header */}
              <div className="p-4 md:p-6 border-b border-brand-navy/10 bg-white/40 backdrop-blur-md z-10">
                <div className="flex items-center justify-between gap-4">
                  {/* Mobile back button */}
                  <button
                    onClick={() => setSelectedParty(null)}
                    className="md:hidden p-2 text-brand-navy/60 hover:text-brand-navy bg-white/40 rounded-full"
                  >
                    ←
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg md:text-xl font-bold text-brand-navy truncate">{selectedParty.name}</h2>
                    <p className="text-brand-navy/60 text-xs md:text-sm font-medium flex items-center gap-2">
                      <span>{selectedParty.participants_count || 0} participants</span>
                      <span className="w-1 h-1 rounded-full bg-brand-navy/30"></span>
                      <span className="uppercase tracking-wide text-[10px] font-bold">{selectedParty.status}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3">
                    {isHost(selectedParty) && (
                      <button
                        onClick={() => setShowModeration(true)}
                        className="hidden md:flex px-4 py-2 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue border border-brand-blue/30 rounded-xl text-sm font-bold transition-all"
                      >
                        🛡️ Moderation
                      </button>
                    )}
                    
                    <button
                      onClick={() => router.push(`/room/${selectedParty.id}`)}
                      className="px-4 py-2 bg-gradient-to-r from-brand-cyan to-brand-blue hover:from-brand-cyan-dark hover:to-brand-blue-dark text-white rounded-xl text-xs md:text-sm font-bold transition-all shadow-lg hover:shadow-brand-cyan/25 hover:-translate-y-0.5 whitespace-nowrap flex items-center gap-2"
                    >
                      <span>🎬</span> Join
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat Component */}
              <div className="flex-1 min-h-0 overflow-hidden bg-white/20">
                <ChatComponent
                  partyId={selectedParty.id}
                  currentUser={currentUser || undefined}
                  isHost={isHost(selectedParty)}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white/20">
              <div className="text-center p-8">
                <div className="text-6xl mb-6 opacity-50">💬</div>
                <h2 className="text-2xl font-bold text-brand-navy mb-4">
                  Welcome to Chat
                </h2>
                <p className="text-brand-navy/60 mb-8 max-w-md font-medium">
                  Select a party from the sidebar to start chatting with other members.
                </p>
                
                {parties.length === 0 && (
                  <button
                    onClick={() => router.push("/parties")}
                    className="px-8 py-4 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-brand-purple/25 hover:-translate-y-0.5"
                  >
                    Find Parties to Chat
                  </button>
                )}
              </div>
            </div>
          )}
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