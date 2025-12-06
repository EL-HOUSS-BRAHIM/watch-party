"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { partiesApi } from "@/lib/api-client"

export default function CreatePartyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Party details
  const [partyData, setPartyData] = useState({
    title: "",
    description: "",
    visibility: "public" as "public" | "friends" | "private",
    max_participants: 10,
    scheduled_start: ""
  })

  const handleCreateParty = async () => {
    if (!partyData.title.trim()) {
      alert("Please enter a party name")
      return
    }

    try {
      setLoading(true)
      
      const partyPayload: {
        title: string;
        description?: string;
        visibility?: string;
        max_participants?: number;
        scheduled_start?: string;
      } = {
        title: partyData.title.trim(),
      }
      
      if (partyData.description && partyData.description.trim()) {
        partyPayload.description = partyData.description.trim()
      }
      
      if (partyData.visibility) {
        partyPayload.visibility = partyData.visibility
      }
      
      if (partyData.max_participants) {
        partyPayload.max_participants = partyData.max_participants
      }
      
      if (partyData.scheduled_start && partyData.scheduled_start.trim()) {
        const dateValue = new Date(partyData.scheduled_start)
        if (!isNaN(dateValue.getTime())) {
          partyPayload.scheduled_start = dateValue.toISOString()
        }
      }
      
      const party = await partiesApi.create(partyPayload)
      const roomCode = (party as any).room_code || (party as any).id
      
      if (!roomCode || roomCode === 'undefined' || roomCode === 'null') {
        console.error('Party created but no valid room_code received:', party)
        throw new Error('Failed to get party room code. Party may have been created - check your parties list.')
      }
      
      router.push(`/party/${roomCode}`)
      
    } catch (error) {
      console.error("Failed to create party:", error)
      alert("Failed to create party. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg bg-white hover:bg-gray-50 shadow-sm transition-colors"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Watch Party</h1>
            <p className="text-sm text-gray-600">Set up your party in seconds</p>
          </div>
        </div>

        {/* Single Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          {/* Party Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Party Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={partyData.title}
              onChange={(e) => setPartyData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Movie Night, Horror Marathon..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              value={partyData.description}
              onChange={(e) => setPartyData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What's the vibe? What are you watching?"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "public", label: "Public", icon: "🌍" },
                { value: "friends", label: "Friends", icon: "👥" },
                { value: "private", label: "Private", icon: "🔒" }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPartyData(prev => ({ ...prev, visibility: option.value as any }))}
                  className={`p-2.5 rounded-lg border text-sm font-medium transition-all ${
                    partyData.visibility === option.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="text-lg mb-0.5">{option.icon}</div>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Max Participants */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Max Guests
              </label>
              <select
                value={partyData.max_participants}
                onChange={(e) => setPartyData(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[5, 10, 20, 50, 100].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            {/* Scheduled Start */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Start Time <span className="text-gray-400 text-xs">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={partyData.scheduled_start}
                onChange={(e) => setPartyData(prev => ({ ...prev, scheduled_start: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateParty}
            disabled={loading || !partyData.title.trim()}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed text-sm shadow-sm"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Creating...
              </span>
            ) : (
              "Create Party"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}