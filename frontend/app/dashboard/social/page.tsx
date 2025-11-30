"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api-client"
import { IconButton } from "@/components/ui/icon-button"
import { LiveIndicator } from "@/components/ui/live-indicator"
import { LoadingState, ErrorMessage } from "@/components/ui/feedback"
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
  const { formatNumber, liveStats } = useDesignSystem()
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

  const _handleAddFriend = async (userId: string) => {
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {error && (
        <ErrorMessage 
          message={error} 
          type="error"
          onDismiss={() => setError(null)}
        />
      )}
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/20 via-pink-600/20 to-brand-purple/20 rounded-2xl sm:rounded-3xl blur-3xl opacity-60 pointer-events-none"></div>
        <div className="glass-panel relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-brand-orange/20">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
            <div className="space-y-2">
              <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 sm:gap-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-navy">
                  <span className="gradient-text">Social Hub</span>
                </h1>
                <LiveIndicator 
                  isLive={true} 
                  count={liveStats.onlineUsers}
                  label="Online Users" 
                />
              </div>
              <p className="text-brand-navy/70 text-sm sm:text-base lg:text-lg font-medium">Connect with {formatNumber(liveStats.totalWatchTime)} movie enthusiasts worldwide</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-brand-navy/50 font-medium">
                <span>🌍 Global Community</span>
                <span className="hidden xs:inline">•</span>
                <span>👥 Find Friends</span>
                <span className="hidden xs:inline">•</span>
                <span>🌟 Join Groups</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full xs:w-auto">
              <div className="flex gap-1 bg-white/50 p-1 rounded-xl border border-brand-navy/5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-lg transition-all flex items-center justify-center ${
                    viewMode === "grid" ? "bg-brand-navy text-white shadow-md" : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
                  }`}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-lg transition-all flex items-center justify-center ${
                    viewMode === "list" ? "bg-brand-navy text-white shadow-md" : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
                  }`}
                >
                  ☰
                </button>
              </div>
              <IconButton
                onClick={() => router.push("/dashboard/social/groups/create")}
                className="btn-gradient shadow-lg hover:shadow-brand-orange/25 border-none min-h-[44px]"
              >
                <span>✨</span>
                <span className="hidden sm:inline">Create Group</span>
              </IconButton>
              <IconButton
                onClick={() => router.push("/dashboard/friends/find")}
                variant="secondary"
                className="bg-white hover:bg-brand-purple/10 hover:text-brand-purple border-brand-navy/10 min-h-[44px]"
              >
                <span>🔍</span>
                <span className="hidden sm:inline">Find Friends</span>
              </IconButton>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search Bar */}
      <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-5 flex items-center pointer-events-none">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-brand-navy/40 group-focus-within:text-brand-purple transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={`Search ${activeTab === "friends" ? "friends" : "groups"}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-14 pr-10 sm:pr-6 py-3 sm:py-4 text-sm sm:text-base bg-white/50 border border-brand-navy/10 rounded-xl sm:rounded-2xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple/30 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-brand-navy/40 hover:text-brand-navy min-w-[44px] justify-center"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="flex flex-col xs:flex-row gap-2 xs:gap-1 bg-white/50 p-2 xs:p-1 rounded-xl sm:rounded-2xl border border-brand-navy/5 backdrop-blur-sm w-full xs:w-fit mx-auto overflow-x-auto">
        {[
          { id: "groups", label: "My Groups", icon: "👥", count: groups.filter(g => g.is_member).length },
          { id: "friends", label: "Friends", icon: "👫", count: friends.length },
          { id: "discover", label: "Discover", icon: "🌟", count: groups.filter(g => !g.is_member && g.is_public).length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 lg:gap-3 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold transition-all duration-300 min-h-[44px] whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-brand-navy text-white shadow-lg"
                : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
            }`}
          >
            <span className="text-sm sm:text-base lg:text-lg">{tab.icon}</span>
            <span className="text-xs sm:text-sm lg:text-base">{tab.label}</span>
            <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold ${
              activeTab === tab.id ? "bg-white/20 text-white" : "bg-brand-navy/5 text-brand-navy/40"
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "friends" ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredFriends.map((friend) => {
            const status = getOnlineStatus(friend.is_online, friend.last_seen)
            return (
              <div key={friend.id} className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5">
                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-brand-purple to-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md">
                      {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.username} className="w-full h-full rounded-xl sm:rounded-2xl object-cover" />
                      ) : (
                        friend.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 ${status.dot} rounded-full border-2 sm:border-4 border-white shadow-sm`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-brand-navy text-base sm:text-lg truncate">
                      {friend.first_name && friend.last_name
                        ? `${friend.first_name} ${friend.last_name}`
                        : friend.username
                      }
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-navy/60 font-medium truncate">@{friend.username}</p>
                    <p className={`text-[10px] sm:text-xs font-bold mt-0.5 ${status.color}`}>{status.text}</p>
                  </div>
                </div>

                {friend.mutual_friends_count && friend.mutual_friends_count > 0 && (
                  <p className="text-[10px] sm:text-xs text-brand-navy/50 mb-3 sm:mb-4 font-medium bg-brand-navy/5 py-1 px-2 rounded-lg inline-block">
                    {friend.mutual_friends_count} mutual friends
                  </p>
                )}

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => router.push(`/dashboard/social/friends/${friend.id}`)}
                    className="flex-1 px-2 sm:px-3 py-2 sm:py-2.5 bg-brand-navy text-white hover:bg-brand-navy-light rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all shadow-lg shadow-brand-navy/10 min-h-[44px]"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/chat/direct/${friend.id}`)}
                    className="px-2 sm:px-3 py-2 sm:py-2.5 bg-white hover:bg-brand-purple/10 text-brand-purple border border-brand-navy/10 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-colors min-h-[44px]"
                  >
                    💬
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {filteredGroups
            .filter(group => activeTab === "discover" ? !group.is_member : group.is_member)
            .map((group) => (
            <div key={group.id} className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5 flex flex-col">
              {/* Group Header */}
              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-brand-purple to-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md shrink-0">
                  {group.avatar ? (
                    <img src={group.avatar} alt={group.name} className="w-full h-full rounded-xl sm:rounded-2xl object-cover" />
                  ) : (
                    group.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-brand-navy text-base sm:text-lg mb-1 truncate">{group.name}</h3>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-brand-navy/60 font-medium">
                    <span>👥 {group.member_count} members</span>
                    {!group.is_public && <span title="Private Group">🔒</span>}
                  </div>
                </div>
              </div>

              {/* Group Description */}
              {group.description && (
                <p className="text-xs sm:text-sm text-brand-navy/70 mb-3 sm:mb-4 line-clamp-2 font-medium leading-relaxed">{group.description}</p>
              )}

              {/* Tags */}
              {group.tags && group.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
                  {group.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-brand-navy/5 text-[10px] sm:text-xs font-bold text-brand-navy/60 rounded-lg border border-brand-navy/5">
                      {tag}
                    </span>
                  ))}
                  {group.tags.length > 3 && (
                    <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-brand-navy/5 text-[10px] sm:text-xs font-bold text-brand-navy/60 rounded-lg border border-brand-navy/5">
                      +{group.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Created By */}
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-brand-navy/40 mb-4 sm:mb-5 font-medium mt-auto">
                <span>Created by {group.created_by.username}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-brand-navy/5">
                {group.is_member ? (
                  <>
                    <button
                      onClick={() => router.push(`/dashboard/social/groups/${group.id}`)}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-brand-navy text-white hover:bg-brand-navy-light rounded-lg sm:rounded-xl font-bold transition-all shadow-lg shadow-brand-navy/10 text-xs sm:text-sm min-h-[44px]"
                    >
                      Open Group
                    </button>
                    <button
                      onClick={() => handleLeaveGroup(group.id)}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-red-50 text-brand-coral hover:text-red-600 border border-brand-navy/10 rounded-lg sm:rounded-xl font-bold transition-colors text-xs sm:text-sm min-h-[44px]"
                    >
                      Leave
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-brand-navy text-white hover:bg-brand-navy-light rounded-lg sm:rounded-xl font-bold transition-all shadow-lg shadow-brand-navy/10 text-xs sm:text-sm min-h-[44px]"
                    >
                      Join Group
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/social/groups/${group.id}`)}
                      className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white hover:bg-brand-purple/10 text-brand-navy hover:text-brand-purple border border-brand-navy/10 rounded-lg sm:rounded-xl font-bold transition-colors text-xs sm:text-sm min-h-[44px]"
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
        <div className="glass-card rounded-2xl sm:rounded-3xl text-center py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
          <div className="space-y-4 sm:space-y-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto bg-gradient-to-br from-brand-purple to-brand-blue rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl lg:text-5xl shadow-2xl shadow-brand-purple/20 animate-float">
              {activeTab === "friends" ? "👫" : activeTab === "groups" ? "👥" : "🌟"}
            </div>
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-navy">
                {activeTab === "friends"
                  ? "No friends yet"
                  : activeTab === "groups"
                  ? "No groups joined"
                  : "No groups to discover"
                }
              </h3>
              <p className="text-brand-navy/60 max-w-md mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : activeTab === "friends"
                  ? "Start connecting with other users"
                  : activeTab === "groups"
                  ? "Join some groups to get started"
                  : "All public groups have been joined"
                }
              </p>
            </div>
            {!searchQuery && (
              <div className="flex gap-3 justify-center pt-2 sm:pt-4">
                {activeTab === "friends" && (
                  <button
                    onClick={() => router.push("/dashboard/friends/find")}
                    className="px-6 sm:px-8 py-3 sm:py-4 btn-gradient text-white rounded-xl font-bold transition-all duration-200 shadow-xl hover:shadow-brand-purple/25 text-sm sm:text-base lg:text-lg min-h-[44px]"
                  >
                    Find Friends
                  </button>
                )}
                {activeTab === "groups" && (
                  <button
                    onClick={() => router.push("/dashboard/social/groups/create")}
                    className="px-6 sm:px-8 py-3 sm:py-4 btn-gradient text-white rounded-xl font-bold transition-all duration-200 shadow-xl hover:shadow-brand-purple/25 text-sm sm:text-base lg:text-lg min-h-[44px]"
                  >
                    Create Group
                  </button>
                )}
                {activeTab === "discover" && (
                  <button
                    onClick={() => setActiveTab("groups")}
                    className="px-6 sm:px-8 py-3 sm:py-4 btn-gradient text-white rounded-xl font-bold transition-all duration-200 shadow-xl hover:shadow-brand-purple/25 text-sm sm:text-base lg:text-lg min-h-[44px]"
                  >
                    View My Groups
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}