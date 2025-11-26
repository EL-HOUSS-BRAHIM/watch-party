"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api-client"

interface Reaction {
  id: string
  emoji: string
  count: number
  users: Array<{
    id: string
    username: string
    avatar?: string
  }>
  user_reacted: boolean
}

interface ReactionComponentProps {
  partyId: string
  currentUser?: any
}

const QUICK_REACTIONS = [
  { emoji: "👍", label: "Like" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😡", label: "Angry" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "👏", label: "Clap" },
  { emoji: "🎉", label: "Party" },
  { emoji: "💯", label: "100" }
]

export default function ReactionComponent({ partyId, currentUser }: ReactionComponentProps) {
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [loading, setLoading] = useState(true)
  const [animatingReactions, setAnimatingReactions] = useState<Set<string>>(new Set())
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{
    id: string
    emoji: string
    x: number
    y: number
  }>>([])

  useEffect(() => {
    loadReactions()
    
    // Poll for updates every 5 seconds
    const interval = setInterval(loadReactions, 5000)
    return () => clearInterval(interval)
  }, [partyId])

  const loadReactions = async () => {
    try {
      const response = await api.get(`/api/parties/${partyId}/reactions/`)
      const reactionsList = Array.isArray(response) ? response : (response.results || [])
      setReactions(reactionsList)
    } catch (error) {
      console.error("Failed to load reactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const addReaction = async (emoji: string) => {
    try {
      // Optimistic update
      setReactions(prev => {
        const existing = prev.find(r => r.emoji === emoji)
        if (existing) {
          if (existing.user_reacted) {
            // Remove reaction
            return prev.map(r => 
              r.emoji === emoji 
                ? { ...r, count: Math.max(0, r.count - 1), user_reacted: false }
                : r
            ).filter(r => r.count > 0)
          } else {
            // Add reaction
            return prev.map(r => 
              r.emoji === emoji 
                ? { ...r, count: r.count + 1, user_reacted: true }
                : r
            )
          }
        } else {
          // New reaction
          return [...prev, {
            id: `temp-${Date.now()}`,
            emoji,
            count: 1,
            users: [currentUser].filter(Boolean),
            user_reacted: true
          }]
        }
      })

      // Animate reaction
      setAnimatingReactions(prev => new Set([...prev, emoji]))
      setTimeout(() => {
        setAnimatingReactions(prev => {
          const newSet = new Set(prev)
          newSet.delete(emoji)
          return newSet
        })
      }, 300)

      // Add floating emoji
      addFloatingEmoji(emoji)

      await api.post(`/api/parties/${partyId}/reactions/`, { emoji })
      await loadReactions()
    } catch (error) {
      console.error("Failed to add reaction:", error)
      // Revert optimistic update
      await loadReactions()
    }
  }

  const addFloatingEmoji = (emoji: string) => {
    const id = `floating-${Date.now()}-${Math.random()}`
    const x = Math.random() * 100
    const y = Math.random() * 50 + 25

    setFloatingEmojis(prev => [...prev, { id, emoji, x, y }])

    // Remove after animation
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(fe => fe.id !== id))
    }, 2000)
  }

  const clearReactions = async () => {
    if (!confirm("Clear all reactions for this party?")) return

    try {
      await api.delete(`/api/parties/${partyId}/reactions/`)
      setReactions([])
    } catch (error) {
      console.error("Failed to clear reactions:", error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/5 border border-brand-navy/10 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/4"></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 w-16 bg-white/10 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
  <div className="bg-white/5 border border-brand-navy/10 rounded-lg p-6 relative overflow-hidden">
      {/* Floating Emojis */}
      {floatingEmojis.map((floating) => (
        <div
          key={floating.id}
          className="absolute pointer-events-none animate-bounce"
          style={{
            left: `${floating.x}%`,
            top: `${floating.y}%`,
            animation: "float-up 2s ease-out forwards"
          }}
        >
          <span className="text-2xl">{floating.emoji}</span>
        </div>
      ))}

      <div className="flex items-center justify-between mb-6">
  <h3 className="text-lg font-semibold text-brand-navy">Reactions</h3>
        {reactions.length > 0 && (
          <button
            onClick={clearReactions}
            className="text-brand-coral-light hover:text-red-300 text-sm transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Quick Reactions */}
      <div className="mb-6">
  <h4 className="text-brand-navy/80 text-sm mb-3">Quick Reactions</h4>
        <div className="grid grid-cols-5 gap-2">
          {QUICK_REACTIONS.map((reaction) => {
            const isAnimating = animatingReactions.has(reaction.emoji)
            const existingReaction = reactions.find(r => r.emoji === reaction.emoji)
            const userReacted = existingReaction?.user_reacted || false

            return (
              <button
                key={reaction.emoji}
                onClick={() => addReaction(reaction.emoji)}
                className={`group relative p-3 rounded-lg border transition-all duration-200 ${
                  userReacted
                    ? "bg-brand-blue/20 border-brand-blue/30 scale-105"
                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                } ${isAnimating ? "animate-pulse scale-110" : ""}`}
                title={reaction.label}
              >
                <div className="text-center">
                  <div className={`text-xl transition-transform ${isAnimating ? "scale-125" : "group-hover:scale-110"}`}>
                    {reaction.emoji}
                  </div>
                          {existingReaction && existingReaction.count > 0 && (
                            <div className="text-xs text-brand-navy/60 mt-1">
                              {existingReaction.count}
                            </div>
                          )}
                </div>

                {userReacted && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-blue rounded-full"></div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Reactions */}
      {reactions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-brand-navy/80 text-sm">Current Reactions</h4>
          <div className="space-y-2">
            {reactions
              .filter(reaction => reaction.count > 0)
              .sort((a, b) => b.count - a.count)
              .map((reaction) => (
                <div
                  key={reaction.id}
                  className="flex items-center justify-between p-3 bg-white/5 border border-brand-navy/10 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{reaction.emoji}</span>
                    <div>
                      <div className="text-brand-navy font-medium">
                        {reaction.count} {reaction.count === 1 ? "reaction" : "reactions"}
                      </div>
                      {reaction.users.length > 0 && (
                        <div className="text-brand-navy/60 text-sm">
                          {reaction.users.slice(0, 3).map(u => u.username).join(", ")}
                          {reaction.users.length > 3 && ` +${reaction.users.length - 3} more`}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => addReaction(reaction.emoji)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      reaction.user_reacted
                        ? "bg-brand-blue text-white"
                        : "bg-white/10 text-brand-navy/80 hover:bg-white/20"
                    }`}
                  >
                    {reaction.user_reacted ? "Remove" : "Add"}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {reactions.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">😊</div>
          <p className="text-brand-navy/60">No reactions yet</p>
          <p className="text-brand-navy/40 text-sm mt-1">Be the first to react!</p>
        </div>
      )}

      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-30px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-60px) scale(0.8);
          }
        }
      `}</style>
    </div>
  )
}