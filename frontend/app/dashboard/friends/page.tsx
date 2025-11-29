"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { userApi, User } from "@/lib/api-client"

interface FriendRequest {
  id: string
  from_user: User
  to_user: User
  created_at: string
  status: 'pending' | 'accepted' | 'declined'
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<User[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "suggestions" | "search">("friends")

  // Initial load
  useEffect(() => {
    setLoading(true)
    loadFriends()
    loadFriendRequests()
    loadSuggestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers()
        setActiveTab("search")
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const loadFriends = async () => {
    try {
      const response = await userApi.getFriends()
      const friendsList = Array.isArray(response) ? response : (response.results || [])
      setFriends(friendsList)
    } catch (error) {
      console.error("Failed to load friends:", error)
    }
  }

  const loadFriendRequests = async () => {
    try {
      const response = await userApi.getFriendRequests()
      const requestsList = Array.isArray(response) ? response : (response.results || [])
      setFriendRequests(requestsList)
    } catch (error) {
      console.error("Failed to load friend requests:", error)
    }
  }

  const loadSuggestions = async () => {
    try {
      const response = await userApi.getFriendSuggestions()
      const suggestionsList = Array.isArray(response) ? response : (response.results || [])
      setSuggestions(suggestionsList)
    } catch (error) {
      console.error("Failed to load suggestions:", error)
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) return

    try {
      const response = await userApi.search(searchQuery)
      const usersList = Array.isArray(response) ? response : (response.results || [])
      setSearchResults(usersList)
    } catch (error) {
      console.error("Failed to search users:", error)
    }
  }

  const sendFriendRequest = async (userId: string) => {
    try {
      await userApi.sendFriendRequest(userId)
      // Remove from suggestions and search results
      setSuggestions(prev => prev.filter(u => u.id !== userId))
      setSearchResults(prev => prev.filter(u => u.id !== userId))
      loadFriendRequests() // Refresh requests
    } catch (error) {
      alert("Failed to send friend request: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const acceptFriendRequest = async (requestId: string) => {
    try {
      await userApi.acceptFriendRequest(requestId)
      loadFriends()
      loadFriendRequests()
    } catch (error) {
      alert("Failed to accept friend request: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }
  const declineFriendRequest = async (requestId: string) => {
    try {
      await userApi.declineFriendRequest(requestId)
      loadFriendRequests()
    } catch (error) {
      alert("Failed to decline friend request: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const removeFriend = async (username: string) => {
    if (!confirm("Are you sure you want to remove this friend?")) return

    try {
      await userApi.removeFriend(username)
      loadFriends()
    } catch (error) {
      alert("Failed to remove friend: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const blockUser = async (userId: string) => {
    if (!confirm("Are you sure you want to block this user?")) return

    try {
      await userApi.blockUser(userId)
      // Remove from all lists
      setFriends(prev => prev.filter(u => u.id !== userId))
      setSuggestions(prev => prev.filter(u => u.id !== userId))
      setSearchResults(prev => prev.filter(u => u.id !== userId))
    } catch (error) {
      alert("Failed to block user: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const UserCard = ({ user, actions }: { user: User; actions: React.ReactNode }) => (
    <div className="glass-card rounded-2xl p-4 hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-navy/5">
      <div className="flex items-center gap-4">
        <div className="relative">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} className="w-14 h-14 rounded-full object-cover border-2 border-white/20 shadow-sm" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-purple/20 to-brand-blue/20 flex items-center justify-center border-2 border-white/20 shadow-sm">
              <span className="text-xl font-bold text-brand-navy/60">{user.username?.charAt(0).toUpperCase() || "?"}</span>
            </div>
          )}
          <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${user.is_online ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-brand-navy truncate text-lg">
              {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
            </h3>
            {user.is_verified && <span className="text-brand-cyan text-sm" title="Verified">✓</span>}
            {user.is_premium && <span className="text-brand-orange text-sm" title="Premium">⭐</span>}
          </div>
          <p className="text-brand-navy/60 text-sm font-medium">@{user.username}</p>
        </div>

        <div className="flex gap-2">
          {actions}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 via-brand-magenta/20 to-brand-orange/20 rounded-3xl blur-3xl opacity-60"></div>
        <div className="glass-panel relative rounded-3xl p-8 border-brand-purple/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy">
                <span className="gradient-text">Friends & Community</span>
              </h1>
              <p className="text-brand-navy/70 text-lg">Connect with friends and discover new people to watch with</p>
            </div>
            
            <div className="w-full md:w-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-brand-navy/40 text-lg">🔍</span>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find users..."
                className="w-full md:w-64 pl-10 pr-4 py-3 bg-white/50 border border-brand-navy/10 rounded-xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple/30 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex flex-wrap gap-2">
            {[
              { key: "friends", label: "Friends", count: friends.length, icon: "👥" },
              { key: "requests", label: "Requests", count: friendRequests.length, icon: "📬" },
              { key: "suggestions", label: "Suggestions", count: suggestions.length, icon: "✨" },
              ...(searchQuery.trim() ? [{ key: "search", label: "Search Results", count: searchResults.length, icon: "🔍" }] : []),
            ].map(({ key, label, count, icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all duration-300 ${
                  activeTab === key
                    ? "bg-brand-navy text-white shadow-lg shadow-brand-navy/20 scale-105"
                    : "bg-white/40 text-brand-navy/70 hover:bg-white hover:text-brand-navy border border-transparent hover:border-white/60"
                }`}
              >
                <span>{icon}</span>
                {label}
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === key ? "bg-white/20 text-white" : "bg-brand-navy/5 text-brand-navy/60"}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-brand-navy/5"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-brand-navy/5 rounded w-3/4"></div>
                  <div className="h-4 bg-brand-navy/5 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div className="min-h-[400px]">
          {/* Friends Tab */}
          {activeTab === "friends" && (
            <>
              {friends.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {friends.map((friend) => (
                    <UserCard
                      key={friend.id}
                      user={friend}
                      actions={
                        <div className="flex gap-2">
                          <Link
                            href={`/dashboard/users/${friend.id}`}
                            className="p-2 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue-dark rounded-lg transition-colors"
                            title="View Profile"
                          >
                            👤
                          </Link>
                          <button
                            onClick={() => friend.username && removeFriend(friend.username)}
                            className="p-2 bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral-dark rounded-lg transition-colors"
                            title="Remove Friend"
                          >
                            ✕
                          </button>
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-3xl p-12 text-center">
                  <div className="text-6xl mb-6 opacity-80">👥</div>
                  <h3 className="text-2xl font-bold text-brand-navy mb-3">No friends yet</h3>
                  <p className="text-brand-navy/60 mb-8 max-w-md mx-auto text-lg">
                    Add friends to start watching together and sharing experiences!
                  </p>
                  <button
                    onClick={() => setActiveTab("suggestions")}
                    className="btn-gradient px-8 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-brand-purple/25 transition-all hover:-translate-y-0.5"
                  >
                    Find Friends
                  </button>
                </div>
              )}
            </>
          )}

          {/* Friend Requests Tab */}
          {activeTab === "requests" && (
            <>
              {friendRequests.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {friendRequests.map((request) => (
                    <UserCard
                      key={request.id}
                      user={request.from_user}
                      actions={
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptFriendRequest(request.id)}
                            className="px-4 py-2 bg-brand-cyan hover:bg-brand-cyan-dark text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => declineFriendRequest(request.id)}
                            className="px-4 py-2 bg-white border border-brand-navy/10 hover:bg-brand-coral/10 text-brand-coral-dark rounded-lg text-sm font-bold transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-3xl p-12 text-center">
                  <div className="text-6xl mb-6 opacity-80">📬</div>
                  <h3 className="text-2xl font-bold text-brand-navy mb-3">No friend requests</h3>
                  <p className="text-brand-navy/60 text-lg">
                    When someone sends you a friend request, it will appear here.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Suggestions Tab */}
          {activeTab === "suggestions" && (
            <>
              {suggestions.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {suggestions.map((suggestion) => (
                    <UserCard
                      key={suggestion.id}
                      user={suggestion}
                      actions={
                        <div className="flex gap-2">
                          <button
                            onClick={() => sendFriendRequest(suggestion.id)}
                            className="px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
                          >
                            Add Friend
                          </button>
                          <button
                            onClick={() => blockUser(suggestion.id)}
                            className="p-2 bg-white border border-brand-navy/10 hover:bg-brand-navy/5 text-brand-navy/40 hover:text-brand-navy/70 rounded-lg transition-colors"
                            title="Hide"
                          >
                            ✕
                          </button>
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-3xl p-12 text-center">
                  <div className="text-6xl mb-6 opacity-80">✨</div>
                  <h3 className="text-2xl font-bold text-brand-navy mb-3">No suggestions</h3>
                  <p className="text-brand-navy/60 text-lg">
                    We'll suggest friends based on your activity and mutual connections.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Search Tab */}
          {activeTab === "search" && searchQuery.trim() && (
            <>
              {searchResults.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      actions={
                        <div className="flex gap-2">
                          <button
                            onClick={() => sendFriendRequest(user.id)}
                            className="px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
                          >
                            Add Friend
                          </button>
                          <Link
                            href={`/dashboard/users/${user.id}`}
                            className="p-2 bg-white border border-brand-navy/10 hover:bg-brand-navy/5 text-brand-navy rounded-lg transition-colors"
                            title="View Profile"
                          >
                            👤
                          </Link>
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-3xl p-12 text-center">
                  <div className="text-6xl mb-6 opacity-80">🔍</div>
                  <h3 className="text-2xl font-bold text-brand-navy mb-3">No users found</h3>
                  <p className="text-brand-navy/60 text-lg">
                    No users match "{searchQuery}". Try a different search term.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}