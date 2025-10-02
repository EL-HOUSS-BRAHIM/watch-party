"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api-client"
import { GradientCard } from "@/components/ui/gradient-card"
import { IconButton } from "@/components/ui/icon-button"
import { LiveIndicator } from "@/components/ui/live-indicator"
import { LoadingState, ErrorMessage, EmptyState } from "@/components/ui/feedback"
import { useDesignSystem } from "@/hooks/use-design-system"

interface SocialGroup {
  id: string
  name: string
  description?: string
  member_count: number
  max_members?: number
  is_member: boolean
  is_public: boolean
  created_by: {
    id: string
    username: string
    avatar?: string
  }
  created_at: string
  avatar?: string
  tags?: string[]
}

interface Friend {
  id: string
  username: string
  first_name?: string
  last_name?: string
  avatar?: string
  is_online: boolean
  last_seen?: string
  mutual_friends_count?: number
}

export default function SocialPage() {
  const router = useRouter()
  const { formatNumber } = useDesignSystem()
  const [groups, setGroups] = useState<SocialGroup[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"groups" | "friends" | "discover">("groups")
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    loadSocialData()
  }, [activeTab])

  const loadSocialData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (activeTab === "groups" || activeTab === "discover") {
        // Load social groups
        const groupsResponse = await api.get('/api/social/groups/')
        setGroups(groupsResponse.results || [])
      }
      
      if (activeTab === "friends") {
        // Load friends
        const friendsResponse = await api.get('/api/users/friends/')
        setFriends(friendsResponse.results || [])
      }
    } catch (err) {
      console.error("Failed to load social data:", err)
      setError(err instanceof Error ? err.message : 'Failed to load social data from API')
      setGroups([])
      setFriends([])
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = async (groupId: string) => {
    try {
      await api.post(`/api/social/groups/${groupId}/join/`)
      await loadSocialData()
    } catch (error) {
      console.error("Failed to join group:", error)
    }
  }

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await api.post(`/api/social/groups/${groupId}/leave/`)
      await loadSocialData()
    } catch (error) {
      console.error("Failed to leave group:", error)
    }
  }

  const handleAddFriend = async (userId: string) => {
    try {
      await api.post('/api/users/friends/request/', { user_id: userId })
      // Could show a toast notification here
    } catch (error) {
      console.error("Failed to send friend request:", error)
    }
  }

  const getOnlineStatus = (isOnline: boolean, lastSeen?: string) => {
    if (isOnline) {
      return { text: "Online", color: "text-brand-cyan-light", dot: "bg-green-400" }
    }
    if (lastSeen) {
      const lastSeenDate = new Date(lastSeen)
      const now = new Date()
      const diffHours = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60))
      
      if (diffHours < 24) {
        return { text: `${diffHours}h ago`, color: "text-brand-orange-light", dot: "bg-yellow-400" }
      } else {
        const diffDays = Math.floor(diffHours / 24)
        return { text: `${diffDays}d ago`, color: "text-gray-400", dot: "bg-gray-400" }
      }
    }
    return { text: "Offline", color: "text-gray-400", dot: "bg-gray-400" }
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <LoadingState message="Loading social content..." />
  }

  return (
    <div className="space-y-8">
      {error && (
        <ErrorMessage 
          message={error} 
          type="error"
          onDismiss={() => setError(null)}
        />
      )}
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/20 via-pink-600/20 to-brand-purple/20 rounded-3xl blur-xl"></div>
        <GradientCard className="relative border-orange-500/30">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-orange-200 to-pink-200 bg-clip-text text-transparent">
                  🎆 Social Hub
                </h1>
                <LiveIndicator 
                  isLive={true} 
                  count={1247}
                  label="Online Users" 
                />
              </div>
              <p className="text-white/80 text-lg">Connect with {formatNumber(25620)} movie enthusiasts worldwide</p>
              <div className="flex items-center gap-4 text-sm text-white/60">
                <span>🌍 Global Community</span>
                <span>•</span>
                <span>👥 Find Friends</span>
                <span>•</span>
                <span>🌟 Join Groups</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex gap-1 bg-black/20 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  ☰
                </button>
              </div>
              <IconButton
                onClick={() => router.push("/dashboard/social/groups/create")}
                gradient="from-brand-orange to-brand-magenta"
                className="shadow-lg hover:shadow-orange-500/25"
              >
                <span>✨</span>
                <span className="hidden sm:inline">Create Group</span>
              </IconButton>
              <IconButton
                onClick={() => router.push("/dashboard/friends/find")}
                variant="secondary"
              >
                <span>🔍</span>
                <span className="hidden sm:inline">Find Friends</span>
              </IconButton>
            </div>
          </div>
        </GradientCard>
      </div>

      {/* Enhanced Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-white/50 text-xl">🔍</span>
        </div>
        <input
          type="text"
          placeholder={`Search ${activeTab === "friends" ? "friends" : "groups"}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/50 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Enhanced Tabs */}
      <div className="flex gap-1 bg-black/20 p-1 rounded-2xl border border-white/10 w-fit mx-auto">
        {[
          { id: "groups", label: "My Groups", icon: "👥", count: groups.filter(g => g.is_member).length },
          { id: "friends", label: "Friends", icon: "👫", count: friends.length },
          { id: "discover", label: "Discover", icon: "🌟", count: groups.filter(g => !g.is_member && g.is_public).length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-brand-orange to-brand-magenta text-white shadow-lg scale-105"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
            <span className="bg-white/20 text-xs px-2 py-1 rounded-full font-bold">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "friends" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFriends.map((friend) => {
            const status = getOnlineStatus(friend.is_online, friend.last_seen)
            return (
              <div key={friend.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.username} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        friend.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${status.dot} rounded-full border-2 border-gray-900`}></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">
                      {friend.first_name && friend.last_name
                        ? `${friend.first_name} ${friend.last_name}`
                        : friend.username
                      }
                    </h3>
                    <p className="text-sm text-white/60">@{friend.username}</p>
                    <p className={`text-xs ${status.color}`}>{status.text}</p>
                  </div>
                </div>

                {friend.mutual_friends_count && friend.mutual_friends_count > 0 && (
                  <p className="text-xs text-white/50 mb-3">
                    {friend.mutual_friends_count} mutual friends
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/social/friends/${friend.id}`)}
                    className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/chat/direct/${friend.id}`)}
                    className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-brand-blue-light rounded-lg text-sm font-medium transition-colors"
                  >
                    💬
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups
            .filter(group => activeTab === "discover" ? !group.is_member : group.is_member)
            .map((group) => (
            <div key={group.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200">
              {/* Group Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold">
                  {group.avatar ? (
                    <img src={group.avatar} alt={group.name} className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    group.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{group.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <span>👥 {group.member_count} members</span>
                    {!group.is_public && <span>🔒</span>}
                  </div>
                </div>
              </div>

              {/* Group Description */}
              {group.description && (
                <p className="text-sm text-white/70 mb-4 line-clamp-2">{group.description}</p>
              )}

              {/* Tags */}
              {group.tags && group.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {group.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-white/10 text-xs text-white/70 rounded-full">
                      {tag}
                    </span>
                  ))}
                  {group.tags.length > 3 && (
                    <span className="px-2 py-1 bg-white/10 text-xs text-white/70 rounded-full">
                      +{group.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Created By */}
              <div className="flex items-center gap-2 text-xs text-white/50 mb-4">
                <span>Created by {group.created_by.username}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {group.is_member ? (
                  <>
                    <button
                      onClick={() => router.push(`/dashboard/social/groups/${group.id}`)}
                      className="flex-1 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-brand-blue-light rounded-lg font-medium transition-colors"
                    >
                      Open Group
                    </button>
                    <button
                      onClick={() => handleLeaveGroup(group.id)}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-brand-coral-light rounded-lg font-medium transition-colors"
                    >
                      Leave
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      className="flex-1 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-brand-cyan-light rounded-lg font-medium transition-colors"
                    >
                      Join Group
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/social/groups/${group.id}`)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                    >
                      View
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {((activeTab === "friends" && filteredFriends.length === 0) ||
        (activeTab !== "friends" && filteredGroups.filter(group => activeTab === "discover" ? !group.is_member : group.is_member).length === 0)) && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            {activeTab === "friends" ? "👫" : activeTab === "groups" ? "👥" : "🌟"}
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {activeTab === "friends"
              ? "No friends yet"
              : activeTab === "groups"
              ? "No groups joined"
              : "No groups to discover"
            }
          </h3>
          <p className="text-white/60 mb-6">
            {searchQuery
              ? "Try adjusting your search criteria"
              : activeTab === "friends"
              ? "Start connecting with other users"
              : activeTab === "groups"
              ? "Join some groups to get started"
              : "All public groups have been joined"
            }
          </p>
          {!searchQuery && (
            <div className="flex gap-3 justify-center">
              {activeTab === "friends" && (
                <button
                  onClick={() => router.push("/dashboard/friends/find")}
                  className="px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white rounded-xl font-medium transition-all duration-200"
                >
                  Find Friends
                </button>
              )}
              {activeTab === "groups" && (
                <button
                  onClick={() => router.push("/dashboard/social/groups/create")}
                  className="px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white rounded-xl font-medium transition-all duration-200"
                >
                  Create Group
                </button>
              )}
              {activeTab === "discover" && (
                <button
                  onClick={() => setActiveTab("groups")}
                  className="px-6 py-3 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white rounded-xl font-medium transition-all duration-200"
                >
                  View My Groups
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}