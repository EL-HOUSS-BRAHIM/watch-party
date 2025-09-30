"use client"

import { useState } from "react"
import Link from "next/link"

export default function JoinPartyPage() {
  const [partyCode, setPartyCode] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!partyCode.trim()) {
      alert("Please enter a party code")
      return
    }
    
    setLoading(true)
    
    try {
      // TODO: Implement party joining logic
      // For now, just redirect to a party room
      window.location.href = `/party/${partyCode}`
    } catch (error) {
      console.error("Join party error:", error)
      alert("Could not join party. Please check the code and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Join a Party</h1>
          <p className="mt-2 text-white/70">Enter the party code to join your friends</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="partyCode" className="block text-sm font-medium text-white/90 mb-2">
              Party Code
            </label>
            <input
              id="partyCode"
              name="partyCode"
              type="text"
              required
              value={partyCode}
              onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
              className="block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-lg font-mono placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="ABC123"
              maxLength={10}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !partyCode.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
          >
            {loading ? "Joining..." : "Join Party"}
          </button>
        </form>

        <div className="text-center space-y-4">
          <div className="text-white/50 text-sm">
            Don't have a party code?
          </div>
          
          <Link 
            href="/auth/login" 
            className="inline-block text-blue-400 hover:text-blue-300 text-sm"
          >
            Login to create your own party
          </Link>
        </div>
      </div>
    </div>
  )
}