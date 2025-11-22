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
          <h2 className="text-xl font-semibold text-brand-navy mb-4">Profile not found</h2>
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
    <div className="space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 via-brand-magenta/20 to-brand-orange/20 rounded-3xl blur-3xl opacity-60"></div>
        <div className="glass-panel relative rounded-3xl p-8 border-brand-purple/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy">
                <span className="gradient-text">Profile</span>
              </h1>
              <p className="text-brand-navy/70 text-lg">Manage your account information and preferences</p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-gradient shadow-lg hover:shadow-brand-purple/25 px-6 py-3 rounded-xl font-bold transition-all duration-300"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-card border-brand-coral/30 bg-brand-coral/5 rounded-2xl p-6 flex items-center gap-4">
          <div className="text-3xl">⚠️</div>
          <p className="text-brand-coral-dark font-bold">{error}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Avatar Section */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-3xl p-8 text-center h-full">
            <div className="space-y-6">
              <div className="relative inline-block group">
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-brand-purple to-brand-blue p-1 shadow-xl shadow-brand-purple/20">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl text-brand-navy/40 font-bold">
                        {user.username?.charAt(0).toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                </div>
                {editing && (
                  <label className="absolute bottom-2 right-2 bg-brand-blue hover:bg-brand-blue-dark text-white p-3 rounded-full cursor-pointer transition-all shadow-lg hover:scale-110">
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
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-brand-navy">
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user.username
                  }
                </h2>
                <p className="text-brand-navy/60 font-medium text-lg">@{user.username}</p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {user.is_verified && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-cyan/10 text-brand-cyan-dark text-xs font-bold border border-brand-cyan/20">
                      ✓ Verified
                    </span>
                  )}
                  {user.is_premium && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-orange/10 text-brand-orange-dark text-xs font-bold border border-brand-orange/20">
                      ⭐ Premium
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-brand-navy/5">
                <p className="text-sm text-brand-navy/40 font-medium uppercase tracking-wider">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-3xl p-8 h-full">
            <h3 className="text-2xl font-bold text-brand-navy mb-8 flex items-center gap-3">
              <span>📝</span>
              Profile Information
            </h3>
            
            {editing ? (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-brand-navy/80 ml-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/50 border border-brand-navy/10 rounded-xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple/30 transition-all"
                      placeholder="Enter first name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-brand-navy/80 ml-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/50 border border-brand-navy/10 rounded-xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple/30 transition-all"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-brand-navy/80 ml-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/50 border border-brand-navy/10 rounded-xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple/30 transition-all"
                    placeholder="Enter username"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-brand-navy/80 ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/50 border border-brand-navy/10 rounded-xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple/30 transition-all"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-6 border-t border-brand-navy/5">
                  <button
                      type="submit"
                      disabled={saving}
                      className="bg-brand-navy hover:bg-brand-navy-light disabled:bg-brand-navy/50 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-navy/20"
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
                    className="bg-white hover:bg-brand-neutral text-brand-navy px-8 py-3 rounded-xl font-bold transition-colors border border-brand-navy/10"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-brand-navy/40 uppercase tracking-wider">First Name</label>
                    <p className="text-brand-navy text-lg font-medium border-b border-brand-navy/5 pb-2">{user.first_name || "Not set"}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-brand-navy/40 uppercase tracking-wider">Last Name</label>
                    <p className="text-brand-navy text-lg font-medium border-b border-brand-navy/5 pb-2">{user.last_name || "Not set"}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-brand-navy/40 uppercase tracking-wider">Username</label>
                  <p className="text-brand-navy text-lg font-medium border-b border-brand-navy/5 pb-2">@{user.username}</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-brand-navy/40 uppercase tracking-wider">Email Address</label>
                  <p className="text-brand-navy text-lg font-medium border-b border-brand-navy/5 pb-2">{user.email}</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-brand-navy/40 uppercase tracking-wider">Account Status</label>
                  <div className="flex gap-3">
                    {user.is_verified ? (
                      <span className="flex items-center gap-2 text-brand-cyan-dark font-bold bg-brand-cyan/10 px-3 py-1.5 rounded-lg">
                        <span>✓</span> Email Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-brand-coral-dark font-bold bg-brand-coral/10 px-3 py-1.5 rounded-lg">
                        <span>✗</span> Email Not Verified
                      </span>
                    )}
                    {user.is_premium && (
                      <span className="flex items-center gap-2 text-brand-orange-dark font-bold bg-brand-orange/10 px-3 py-1.5 rounded-lg">
                        <span>⭐</span> Premium Member
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-card rounded-3xl p-6 text-center hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5 group">
          <h4 className="font-bold text-brand-navy mb-2">Friends</h4>
          <p className="text-4xl font-bold text-brand-blue mb-4 group-hover:scale-110 transition-transform">0</p>
          <a href="/dashboard/friends" className="inline-block bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue-dark px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            Manage Friends →
          </a>
        </div>
        
        <div className="glass-card rounded-3xl p-6 text-center hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5 group">
          <h4 className="font-bold text-brand-navy mb-2">Parties Hosted</h4>
          <p className="text-4xl font-bold text-brand-cyan mb-4 group-hover:scale-110 transition-transform">0</p>
          <a href="/dashboard/rooms" className="inline-block bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan-dark px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            View Parties →
          </a>
        </div>
        
        <div className="glass-card rounded-3xl p-6 text-center hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5 group">
          <h4 className="font-bold text-brand-navy mb-2">Watch Time</h4>
          <p className="text-4xl font-bold text-brand-purple mb-4 group-hover:scale-110 transition-transform">0h</p>
          <a href="/dashboard/analytics" className="inline-block bg-brand-purple/10 hover:bg-brand-purple/20 text-brand-purple-dark px-4 py-2 rounded-lg text-sm font-bold transition-colors">
            View Stats →
          </a>
        </div>
      </div>
    </div>
  )
}