"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api-client"

interface Poll {
  id: string
  question: string
  options: Array<{
    id: string
    text: string
    votes: number
  }>
  created_by: {
    id: string
    username: string
    avatar?: string
  }
  created_at: string
  expires_at?: string
  is_active: boolean
  user_vote?: string
  total_votes: number
}

interface PollComponentProps {
  partyId: string
  currentUser?: any
  isHost?: boolean
}

export default function PollComponent({ partyId, currentUser, isHost = false }: PollComponentProps) {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreatePoll, setShowCreatePoll] = useState(false)
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", ""],
    duration: 300 // 5 minutes in seconds
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadPolls()
    
    // Poll for updates every 10 seconds
    const interval = setInterval(loadPolls, 10000)
    return () => clearInterval(interval)
  }, [partyId])

  const loadPolls = async () => {
    try {
      const response = await api.get(`/parties/${partyId}/polls/`)
      const pollsList = Array.isArray(response) ? response : (response.results || [])
      setPolls(pollsList)
    } catch (error) {
      console.error("Failed to load polls:", error)
    } finally {
      setLoading(false)
    }
  }

  const createPoll = async () => {
    if (!newPoll.question.trim() || newPoll.options.filter(opt => opt.trim()).length < 2) {
      alert("Please provide a question and at least 2 options")
      return
    }

    setCreating(true)
    try {
      const validOptions = newPoll.options.filter(opt => opt.trim())
      await api.post(`/parties/${partyId}/polls/`, {
        question: newPoll.question.trim(),
        options: validOptions,
        duration: newPoll.duration
      })
      
      setNewPoll({ question: "", options: ["", ""], duration: 300 })
      setShowCreatePoll(false)
      await loadPolls()
    } catch (error) {
      alert("Failed to create poll: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setCreating(false)
    }
  }

  const vote = async (pollId: string, optionId: string) => {
    try {
      await api.post(`/parties/${partyId}/polls/${pollId}/vote/`, {
        option_id: optionId
      })
      await loadPolls()
    } catch (error) {
      alert("Failed to vote: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const deletePoll = async (pollId: string) => {
    if (!confirm("Are you sure you want to delete this poll?")) return

    try {
      await api.delete(`/parties/${partyId}/polls/${pollId}/`)
      await loadPolls()
    } catch (error) {
      alert("Failed to delete poll: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const addOption = () => {
    if (newPoll.options.length < 6) {
      setNewPoll(prev => ({
        ...prev,
        options: [...prev.options, ""]
      }))
    }
  }

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      setNewPoll(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }))
    }
  }

  const updateOption = (index: number, value: string) => {
    setNewPoll(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }))
  }

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime()
    const expires = new Date(expiresAt).getTime()
    const remaining = expires - now

    if (remaining <= 0) return "Expired"

    const minutes = Math.floor(remaining / (1000 * 60))
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

    if (minutes > 0) {
      return `${minutes}m ${seconds}s remaining`
    }
    return `${seconds}s remaining`
  }

  if (loading) {
    return (
      <div className="bg-white/5 border border-brand-navy/10 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Polls</h3>
        {isHost && (
          <button
            onClick={() => setShowCreatePoll(!showCreatePoll)}
            className="px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg text-sm font-medium transition-colors"
          >
            {showCreatePoll ? "Cancel" : "Create Poll"}
          </button>
        )}
      </div>

      {/* Create Poll Form */}
      {showCreatePoll && (
  <div className="mb-6 p-4 bg-white/5 border border-brand-navy/10 rounded-lg">
          <h4 className="font-medium text-white mb-4">Create New Poll</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Question</label>
              <input
                type="text"
                value={newPoll.question}
                onChange={(e) => setNewPoll(prev => ({ ...prev, question: e.target.value }))}
                placeholder="What's your question?"
                maxLength={200}
                className="w-full px-3 py-2 bg-white/10 border border-brand-navy/20 rounded-lg text-brand-navy placeholder-brand-navy/50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Options</label>
              <div className="space-y-2">
                {newPoll.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      maxLength={100}
                      className="flex-1 px-3 py-2 bg-white/10 border border-brand-navy/20 rounded-lg text-brand-navy placeholder-brand-navy/50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    />
                    {newPoll.options.length > 2 && (
                      <button
                        onClick={() => removeOption(index)}
                        className="px-3 py-2 bg-brand-coral hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {newPoll.options.length < 6 && (
                <button
                  onClick={addOption}
                  className="mt-2 px-3 py-1 bg-white/10 hover:bg-white/20 text-brand-navy rounded text-sm transition-colors"
                >
                  + Add Option
                </button>
              )}
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Duration</label>
                <select
                value={newPoll.duration}
                onChange={(e) => setNewPoll(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="px-3 py-2 bg-white/10 border border-brand-navy/20 rounded-lg text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value={60}>1 minute</option>
                <option value={300}>5 minutes</option>
                <option value={600}>10 minutes</option>
                <option value={1800}>30 minutes</option>
                <option value={3600}>1 hour</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={createPoll}
                disabled={creating}
                className="px-4 py-2 bg-brand-cyan hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                {creating ? "Creating..." : "Create Poll"}
              </button>
              <button
                onClick={() => setShowCreatePoll(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-brand-navy rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Polls List */}
      <div className="space-y-4">
        {polls.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-white/60">No polls yet</p>
            {isHost && (
              <p className="text-white/40 text-sm mt-1">Create a poll to engage your audience!</p>
            )}
          </div>
        ) : (
          polls.map((poll) => (
            <div
              key={poll.id}
              className="p-4 bg-white/5 border border-brand-navy/10 rounded-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-2">{poll.question}</h4>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>By {poll.created_by.username}</span>
                    <span>{poll.total_votes} votes</span>
                    {poll.expires_at && poll.is_active && (
                      <span className="text-brand-orange-light">
                        {formatTimeRemaining(poll.expires_at)}
                      </span>
                    )}
                    {!poll.is_active && (
                      <span className="text-brand-coral-light">Expired</span>
                    )}
                  </div>
                </div>

                {(isHost || poll.created_by.id === currentUser?.id) && (
                  <button
                    onClick={() => deletePoll(poll.id)}
                    className="text-brand-coral-light hover:text-red-300 transition-colors"
                  >
                    🗑️
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {poll.options.map((option) => {
                  const percentage = poll.total_votes > 0 ? (option.votes / poll.total_votes) * 100 : 0
                  const isVoted = poll.user_vote === option.id
                  const canVote = poll.is_active && !poll.user_vote

                  return (
                    <button
                      key={option.id}
                      onClick={() => canVote && vote(poll.id, option.id)}
                      disabled={!canVote}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isVoted
                          ? "bg-brand-blue/20 border-brand-blue/30"
                          : canVote
                          ? "bg-white/5 border-brand-navy/10 hover:bg-white/10"
                          : "bg-white/5 border-brand-navy/10 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-brand-navy">{option.text}</span>
                        <div className="flex items-center gap-2">
                          {isVoted && <span className="text-brand-blue-light">✓</span>}
                          <span className="text-brand-navy/60 text-sm">
                            {option.votes} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            isVoted ? "bg-brand-blue" : "bg-white/30"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}