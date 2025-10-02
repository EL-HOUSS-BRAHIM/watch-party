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

  useEffect(() => {
    loadFriends()
    loadFriendRequests()
    loadSuggestions()
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers()
    } else {
      setSearchResults([])
    }
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
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg text-white/60">
              {user.username?.charAt(0).toUpperCase() || "?"}
            </span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">
              {user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user.username
              }
            </h3>
            {user.is_verified && <span className="text-brand-cyan-light text-sm">✓</span>}
            {user.is_premium && <span className="text-brand-orange-light text-sm">⭐</span>}
          </div>
          <p className="text-white/60 text-sm">@{user.username}</p>
        </div>
        
        <div className="flex gap-2">
          {actions}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Friends</h1>
        <p className="text-white/70">Connect with friends and discover new people to watch with</p>
      </div>

      {/* Search */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for users by username or email..."
          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-lg w-fit">
        {[
          { key: "friends", label: "Friends", count: friends.length },
          { key: "requests", label: "Requests", count: friendRequests.length },
          { key: "suggestions", label: "Suggestions", count: suggestions.length },
          ...(searchQuery.trim() ? [{ key: "search", label: "Search", count: searchResults.length }] : []),
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === key
                ? "bg-brand-blue text-white"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/20 rounded mb-2"></div>
                  <div className="h-3 bg-white/10 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      {!loading && (
        <div className="space-y-4">
          {/* Friends Tab */}
          {activeTab === "friends" && (
            <>
              {friends.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {friends.map((friend) => (
                    <UserCard
                      key={friend.id}
                      user={friend}
                      actions={
                        <>
                          <Link
                            href={`/dashboard/users/${friend.id}`}
                            className="px-3 py-1 bg-brand-blue hover:bg-brand-blue-dark text-white rounded text-sm transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => removeFriend(friend.username)}
                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-brand-coral-light rounded text-sm transition-colors"
                          >
                            Remove
                          </button>
                        </>
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No friends yet</h3>
                  <p className="text-white/70 mb-6">
                    Add friends to start watching together and sharing experiences!
                  </p>
                  <button
                    onClick={() => setActiveTab("suggestions")}
                    className="bg-brand-blue hover:bg-brand-blue-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
                <div className="space-y-4">
                  {friendRequests.map((request) => (
                    <UserCard
                      key={request.id}
                      user={request.from_user}
                      actions={
                        <>
                          <button
                            onClick={() => acceptFriendRequest(request.id)}
                            className="px-3 py-1 bg-brand-cyan hover:bg-green-700 text-white rounded text-sm transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => declineFriendRequest(request.id)}
                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/30 text-brand-coral-light rounded text-sm transition-colors"
                          >
                            Decline
                          </button>
                        </>
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📬</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No friend requests</h3>
                  <p className="text-white/70">
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {suggestions.map((suggestion) => (
                    <UserCard
                      key={suggestion.id}
                      user={suggestion}
                      actions={
                        <>
                          <button
                            onClick={() => sendFriendRequest(suggestion.id)}
                            className="px-3 py-1 bg-brand-blue hover:bg-brand-blue-dark text-white rounded text-sm transition-colors"
                          >
                            Add Friend
                          </button>
                          <button
                            onClick={() => blockUser(suggestion.id)}
                            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/70 rounded text-sm transition-colors"
                          >
                            Hide
                          </button>
                        </>
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No suggestions</h3>
                  <p className="text-white/70">
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      actions={
                        <>
                          <button
                            onClick={() => sendFriendRequest(user.id)}
                            className="px-3 py-1 bg-brand-blue hover:bg-brand-blue-dark text-white rounded text-sm transition-colors"
                          >
                            Add Friend
                          </button>
                          <Link
                            href={`/dashboard/users/${user.id}`}
                            className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-sm transition-colors"
                          >
                            View
                          </Link>
                        </>
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
                  <p className="text-white/70">
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