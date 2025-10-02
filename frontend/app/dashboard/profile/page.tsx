"use client"

import { useState, useEffect } from "react"
import { userApi, User } from "@/lib/api-client"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const profile = await userApi.getProfile()
      setUser(profile)
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        username: profile.username || "",
        email: profile.email || "",
      })
    } catch (_error) {
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const updatedUser = await userApi.updateProfile(formData)
      setUser(updatedUser)
      setEditing(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const result = await userApi.uploadAvatar(file)
      setUser(prev => prev ? { ...prev, avatar: result.avatar_url } : null)
    } catch (_error) {
      setError("Failed to upload avatar")
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-4">Profile not found</h2>
          <button
            onClick={loadProfile}
            className="bg-brand-blue hover:bg-brand-blue-dark text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-white/70">Manage your account information and preferences</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-brand-blue hover:bg-brand-blue-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-brand-coral-light">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-white/60">
                      {user.username?.charAt(0).toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                {editing && (
                  <label className="absolute bottom-0 right-0 bg-brand-blue hover:bg-brand-blue-dark text-white p-2 rounded-full cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    📷
                  </label>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user.username
                  }
                </h2>
                <p className="text-white/60">@{user.username}</p>
                {user.is_verified && (
                  <span className="inline-flex items-center gap-1 mt-2 text-sm text-brand-cyan-light">
                    ✓ Verified
                  </span>
                )}
                {user.is_premium && (
                  <span className="inline-flex items-center gap-1 mt-2 text-sm text-brand-orange-light">
                    ⭐ Premium
                  </span>
                )}
              </div>

              <div className="text-sm text-white/60">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Profile Information</h3>
            
            {editing ? (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter first name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-brand-blue hover:bg-brand-blue-dark disabled:bg-blue-600/50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false)
                      setFormData({
                        first_name: user.first_name || "",
                        last_name: user.last_name || "",
                        username: user.username || "",
                        email: user.email || "",
                      })
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1">First Name</label>
                    <p className="text-white">{user.first_name || "Not set"}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-white/60 mb-1">Last Name</label>
                    <p className="text-white">{user.last_name || "Not set"}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-1">Username</label>
                  <p className="text-white">@{user.username}</p>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-1">Email Address</label>
                  <p className="text-white">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-1">Account Status</label>
                  <div className="flex gap-2">
                    {user.is_verified ? (
                      <span className="text-brand-cyan-light text-sm">✓ Email Verified</span>
                    ) : (
                      <span className="text-brand-coral-light text-sm">✗ Email Not Verified</span>
                    )}
                    {user.is_premium && (
                      <span className="text-brand-orange-light text-sm">⭐ Premium Member</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
          <h4 className="font-semibold text-white mb-2">Friends</h4>
          <p className="text-2xl font-bold text-brand-blue-light mb-2">0</p>
          <a href="/dashboard/friends" className="text-brand-blue-light hover:text-brand-blue-light text-sm">
            Manage Friends →
          </a>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
          <h4 className="font-semibold text-white mb-2">Parties Hosted</h4>
          <p className="text-2xl font-bold text-brand-cyan-light mb-2">0</p>
          <a href="/dashboard/rooms" className="text-brand-cyan-light hover:text-green-300 text-sm">
            View Parties →
          </a>
        </div>
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
          <h4 className="font-semibold text-white mb-2">Watch Time</h4>
          <p className="text-2xl font-bold text-brand-purple-light mb-2">0h</p>
          <a href="/dashboard/analytics" className="text-brand-purple-light hover:text-brand-purple-light text-sm">
            View Stats →
          </a>
        </div>
      </div>
    </div>
  )
}