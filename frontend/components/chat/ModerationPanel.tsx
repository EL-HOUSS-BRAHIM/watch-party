"use client"

import { useState, useEffect } from "react"
import { chatApi, User, ModerationAction } from "@/lib/api-client"
// adminApi available for future admin features
// import { adminApi } from "@/lib/api-client"

interface ModerationPanelProps {
  partyId: string
  isHost: boolean
  onClose: () => void
}

export default function ModerationPanel({ partyId, isHost, onClose }: ModerationPanelProps) {
  const [activeUsers, setActiveUsers] = useState<User[]>([])
  const [bannedUsers, setBannedUsers] = useState<User[]>([])
  const [moderationHistory, setModerationHistory] = useState<ModerationAction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"users" | "banned" | "history">("users")

  useEffect(() => {
    if (isHost) {
      loadData()
    }
  }, [partyId, isHost])

  const loadData = async () => {
    setLoading(true)
    try {
      const [users, banned, history] = await Promise.all([
        chatApi.getActiveUsers(partyId),
        chatApi.getBannedUsers(partyId),
        chatApi.getModerationHistory(partyId)
      ])
      
      setActiveUsers(users)
      setBannedUsers(banned)
      setModerationHistory(history)
    } catch (error) {
      console.error("Failed to load moderation data:", error)
    } finally {
      setLoading(false)
    }
  }

  const banUser = async (userId: string, username: string) => {
    const reason = prompt(`Reason for banning ${username}:`)
    if (!reason) return

    try {
      await chatApi.banUser(partyId, userId, reason)
      await loadData()
    } catch (error) {
      alert("Failed to ban user: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const unbanUser = async (userId: string, username: string) => {
    if (!confirm(`Unban ${username}?`)) return

    try {
      await chatApi.unbanUser(partyId, userId)
      await loadData()
    } catch (error) {
      alert("Failed to unban user: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const kickUser = async (userId: string, username: string) => {
    const reason = prompt(`Reason for kicking ${username}:`)
    if (!reason) return

    try {
      await chatApi.kickUser(partyId, userId, reason)
      await loadData()
    } catch (error) {
      alert("Failed to kick user: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const clearChat = async () => {
    if (!confirm("Are you sure you want to clear all chat messages? This action cannot be undone.")) {
      return
    }

    try {
      await chatApi.clearChat(partyId)
      alert("Chat cleared successfully")
    } catch (error) {
      alert("Failed to clear chat: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  if (!isHost) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Moderation Panel</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "users"
                ? "text-brand-blue-light border-b-2 border-blue-400"
                : "text-white/60 hover:text-white"
            }`}
          >
            Active Users ({activeUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("banned")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "banned"
                ? "text-brand-blue-light border-b-2 border-blue-400"
                : "text-white/60 hover:text-white"
            }`}
          >
            Banned Users ({bannedUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "history"
                ? "text-brand-blue-light border-b-2 border-blue-400"
                : "text-white/60 hover:text-white"
            }`}
          >
            Moderation History
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {/* Active Users Tab */}
              {activeTab === "users" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Active Users</h3>
                    <button
                      onClick={clearChat}
                      className="px-4 py-2 bg-brand-coral hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Clear Chat
                    </button>
                  </div>

                  <div className="grid gap-3">
                    {activeUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white/60">
                              {user.username?.charAt(0).toUpperCase() || "?"}
                            </span>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white">{user.username}</h4>
                            {user.is_verified && (
                              <span className="text-brand-cyan-light text-sm">✓</span>
                            )}
                            {user.is_premium && (
                              <span className="text-brand-orange-light text-sm">⭐</span>
                            )}
                          </div>
                          <p className="text-white/60 text-sm">{user.email}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => kickUser(user.id, user.username)}
                            className="px-3 py-1 bg-brand-orange hover:bg-yellow-700 text-white rounded text-sm transition-colors"
                          >
                            Kick
                          </button>
                          <button
                            onClick={() => banUser(user.id, user.username)}
                            className="px-3 py-1 bg-brand-coral hover:bg-red-700 text-white rounded text-sm transition-colors"
                          >
                            Ban
                          </button>
                        </div>
                      </div>
                    ))}

                    {activeUsers.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-white/60">No active users</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Banned Users Tab */}
              {activeTab === "banned" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Banned Users</h3>

                  <div className="grid gap-3">
                    {bannedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white/60">
                              {user.username?.charAt(0).toUpperCase() || "?"}
                            </span>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-white">{user.username}</h4>
                            <span className="px-2 py-1 bg-red-500/20 text-brand-coral-light rounded text-xs">
                              Banned
                            </span>
                          </div>
                          <p className="text-white/60 text-sm">{user.email}</p>
                        </div>

                        <button
                          onClick={() => unbanUser(user.id, user.username)}
                          className="px-3 py-1 bg-brand-cyan hover:bg-green-700 text-white rounded text-sm transition-colors"
                        >
                          Unban
                        </button>
                      </div>
                    ))}

                    {bannedUsers.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-white/60">No banned users</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Moderation History Tab */}
              {activeTab === "history" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Moderation History</h3>

                  <div className="space-y-3">
                    {moderationHistory.map((action) => (
                      <div
                        key={action.id}
                        className="p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              action.action_type === "ban" 
                                ? "bg-red-500/20 text-brand-coral-light"
                                : action.action_type === "kick"
                                ? "bg-yellow-500/20 text-brand-orange-light"
                                : "bg-brand-cyan/20 text-brand-cyan-light"
                            }`}>
                              {action.action_type.toUpperCase()}
                            </span>
                            <span className="text-white font-medium">
                              {action.target_user?.username || "Unknown User"}
                            </span>
                          </div>
                          <span className="text-white/60 text-sm">
                            {new Date(action.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-white/80 mb-2">{action.reason}</p>

                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <span>By: {action.moderator?.username || "System"}</span>
                        </div>
                      </div>
                    ))}

                    {moderationHistory.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-white/60">No moderation history</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-white/60 text-sm">
              Use moderation tools responsibly. All actions are logged.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}