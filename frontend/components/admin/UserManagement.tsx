"use client"

import { useState, useEffect } from "react"
import { adminApi, User } from "@/lib/api-client"

interface UserManagementProps {
  onBack: () => void
}

export default function UserManagement({ onBack }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "verified" | "premium" | "banned">("all")
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadUsers()
  }, [currentPage, filter, searchQuery])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: currentPage,
        page_size: 20,
        search: searchQuery || undefined
      }

      if (filter === "verified") params.is_verified = true
      if (filter === "premium") params.is_premium = true
      if (filter === "banned") params.is_banned = true

      const response = await adminApi.getUsers(params)
      const usersList = Array.isArray(response) ? response : (response.results || [])
      const total = response.count || usersList.length
      
      setUsers(usersList)
      setTotalPages(Math.ceil(total / 20))
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers)
    if (newSelection.has(userId)) {
      newSelection.delete(userId)
    } else {
      newSelection.add(userId)
    }
    setSelectedUsers(newSelection)
  }

  const selectAllUsers = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)))
    }
  }

  const banUser = async (userId: string, username: string) => {
    const reason = prompt(`Reason for banning ${username}:`)
    if (!reason) return

    try {
      await adminApi.banUser(userId, reason)
      await loadUsers()
      alert(`${username} has been banned.`)
    } catch (error) {
      alert("Failed to ban user: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const unbanUser = async (userId: string, username: string) => {
    try {
      await adminApi.unbanUser(userId)
      await loadUsers()
      alert(`${username} has been unbanned.`)
    } catch (error) {
      alert("Failed to unban user: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const verifyUser = async (userId: string, username: string) => {
    try {
      await adminApi.verifyUser(userId)
      await loadUsers()
      alert(`${username} has been verified.`)
    } catch (error) {
      alert("Failed to verify user: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const bulkAction = async (action: string) => {
    if (selectedUsers.size === 0) {
      alert("No users selected")
      return
    }

    const confirm = window.confirm(`Are you sure you want to ${action} ${selectedUsers.size} users?`)
    if (!confirm) return

    try {
      for (const userId of selectedUsers) {
        if (action === "ban") {
          await adminApi.banUser(userId, "Bulk action")
        } else if (action === "verify") {
          await adminApi.verifyUser(userId)
        }
      }
      
      setSelectedUsers(new Set())
      await loadUsers()
      alert(`Successfully ${action}ned ${selectedUsers.size} users.`)
    } catch (error) {
      alert(`Failed to ${action} users: ` + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-white/60 hover:text-white transition-colors"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">User Management</h2>
            <p className="text-white/60">Manage user accounts and permissions</p>
          </div>
        </div>

        {selectedUsers.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-white/60">{selectedUsers.size} selected</span>
            <button
              onClick={() => bulkAction("verify")}
              className="px-3 py-2 bg-brand-cyan hover:bg-green-700 text-white rounded text-sm transition-colors"
            >
              Verify Selected
            </button>
            <button
              onClick={() => bulkAction("ban")}
              className="px-3 py-2 bg-brand-coral hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              Ban Selected
            </button>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="all">All Users</option>
            <option value="verified">Verified Only</option>
            <option value="premium">Premium Only</option>
            <option value="banned">Banned Users</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === users.length && users.length > 0}
                    onChange={selectAllUsers}
                    className="rounded border-white/20 bg-white/10 text-blue-600 focus:ring-brand-blue"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/80">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Last Active</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white/80">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-white/60">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-white/60">No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-white/20 bg-white/10 text-blue-600 focus:ring-brand-blue"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
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
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white">{user.username}</p>
                            {user.is_verified && (
                              <span className="text-brand-cyan-light text-sm">✓</span>
                            )}
                            {user.is_premium && (
                              <span className="text-brand-orange-light text-sm">⭐</span>
                            )}
                            {user.is_staff && (
                              <span className="px-2 py-1 bg-purple-600/20 text-brand-purple-light rounded text-xs">
                                Staff
                              </span>
                            )}
                          </div>
                          <p className="text-white/60 text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active
                            ? "bg-brand-cyan/20 text-brand-cyan-light"
                            : "bg-brand-coral/20 text-brand-coral-light"
                        }`}>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                        {(user as any).is_banned && (
                          <span className="inline-flex px-2 py-1 bg-brand-coral/20 text-brand-coral-light rounded-full text-xs font-medium">
                            Banned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white/80 text-sm">
                        {new Date(user.date_joined || "").toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white/80 text-sm">
                        {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {!user.is_verified && (
                          <button
                            onClick={() => verifyUser(user.id, user.username)}
                            className="px-2 py-1 bg-brand-cyan hover:bg-green-700 text-white rounded text-xs transition-colors"
                          >
                            Verify
                          </button>
                        )}
                        
                        {(user as any).is_banned ? (
                          <button
                            onClick={() => unbanUser(user.id, user.username)}
                            className="px-2 py-1 bg-brand-blue hover:bg-brand-blue-dark text-white rounded text-xs transition-colors"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => banUser(user.id, user.username)}
                            className="px-2 py-1 bg-brand-coral hover:bg-red-700 text-white rounded text-xs transition-colors"
                          >
                            Ban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-white/5 border-t border-white/10">
            <div className="flex items-center justify-between">
              <p className="text-white/60 text-sm">
                Page {currentPage} of {totalPages}
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
                >
                  Previous
                </button>
                
                <span className="px-3 py-2 text-white text-sm">
                  {currentPage}
                </span>
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}