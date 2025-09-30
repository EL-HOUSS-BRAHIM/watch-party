"use client"

import { useState } from "react"
import Link from "next/link"

export default function DashboardPage() {
  const [newPartyName, setNewPartyName] = useState("")
  const [movieUrl, setMovieUrl] = useState("")

  const handleCreateParty = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPartyName.trim()) {
      alert("Please enter a party name")
      return
    }

    try {
      // TODO: API call to create party
      // For now, generate a simple party ID
      const partyId = Math.random().toString(36).substring(2, 8).toUpperCase()
      alert(`Party created! Share this code: ${partyId}`)
      setNewPartyName("")
    } catch (error) {
      console.error("Failed to create party:", error)
      alert("Failed to create party. Please try again.")
    }
  }

  const handleConnectDrive = () => {
    // TODO: Implement Google Drive OAuth
    alert("Google Drive integration coming soon!")
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Your Dashboard</h1>
        <p className="text-white/70">Create parties, add movies, and manage your watch sessions</p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Party */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">🎬 Create New Party</h2>
          <form onSubmit={handleCreateParty} className="space-y-4">
            <input
              type="text"
              value={newPartyName}
              onChange={(e) => setNewPartyName(e.target.value)}
              placeholder="Party name (e.g., Movie Night)"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors"
            >
              Create Party
            </button>
          </form>
        </div>

        {/* Add Movie URL */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">🔗 Add Movie Link</h2>
          <div className="space-y-4">
            <input
              type="url"
              value={movieUrl}
              onChange={(e) => setMovieUrl(e.target.value)}
              placeholder="Paste streaming URL here"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                if (movieUrl) {
                  alert("Movie link added! (Demo)")
                  setMovieUrl("")
                } else {
                  alert("Please enter a valid URL")
                }
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition-colors"
            >
              Add to Library
            </button>
          </div>
        </div>
      </div>

      {/* Drive Integration */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">☁️ Connect Your Drive</h2>
        <p className="text-white/70">
          Connect your Google Drive to access your personal movie collection
        </p>
        <button
          onClick={handleConnectDrive}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded transition-colors"
        >
          Connect Google Drive
        </button>
      </div>

      {/* Recent Parties */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">📺 Recent Parties</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/10">
            <div>
              <h3 className="text-white font-medium">Movie Night #1</h3>
              <p className="text-sm text-white/60">2 participants • Yesterday</p>
            </div>
            <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">Completed</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-white/5 rounded border border-white/10">
            <div>
              <h3 className="text-white font-medium">Football Watch Party</h3>
              <p className="text-sm text-white/60">5 participants • 3 days ago</p>
            </div>
            <span className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded">Completed</span>
          </div>
        </div>
        
        <Link 
          href="/dashboard/parties" 
          className="inline-block text-blue-400 hover:text-blue-300 text-sm"
        >
          View all parties →
        </Link>
      </div>
    </div>
  )
}
