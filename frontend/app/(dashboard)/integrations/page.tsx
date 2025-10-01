"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api-client"

interface Integration {
  id: string
  type: string
  name: string
  description?: string
  status: 'connected' | 'disconnected' | 'pending' | 'error'
  connected_at?: string
  last_sync?: string
  account_info?: {
    email?: string
    username?: string
    avatar?: string
  }
  settings?: Record<string, any>
  features?: string[]
  icon?: string
}

interface IntegrationType {
  id: string
  name: string
  description: string
  icon: string
  features: string[]
  category: 'storage' | 'streaming' | 'social' | 'productivity'
  is_premium?: boolean
}

export default function IntegrationsPage() {
  const router = useRouter()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [integrationTypes, setIntegrationTypes] = useState<IntegrationType[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"connected" | "available">("connected")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    loadIntegrations()
    loadIntegrationTypes()
  }, [])

  const loadIntegrations = async () => {
    try {
      const response = await api.get('/api/integrations/connections/')
      setIntegrations(response.results || mockIntegrations)
    } catch (error) {
      console.error("Failed to load integrations:", error)
      setIntegrations(mockIntegrations)
    }
  }

  const loadIntegrationTypes = async () => {
    try {
      const response = await api.get('/api/integrations/types/')
      setIntegrationTypes(response.results || mockIntegrationTypes)
    } catch (error) {
      console.error("Failed to load integration types:", error)
      setIntegrationTypes(mockIntegrationTypes)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (integrationType: string) => {
    try {
      // Different connection flows for different integrations
      if (integrationType === 'google-drive') {
        const authResponse = await api.get('/api/integrations/google-drive/auth-url/')
        window.location.href = authResponse.auth_url
      } else if (integrationType === 'oauth') {
        const authResponse = await api.get(`/api/integrations/oauth/${integrationType}/auth-url/`)
        window.location.href = authResponse.auth_url
      } else {
        // Generic connection flow
        await api.post(`/api/integrations/${integrationType}/connect/`)
        await loadIntegrations()
      }
    } catch (error) {
      console.error(`Failed to connect ${integrationType}:`, error)
    }
  }

  const handleDisconnect = async (connectionId: string) => {
    try {
      await api.post(`/api/integrations/connections/${connectionId}/disconnect/`)
      await loadIntegrations()
    } catch (error) {
      console.error("Failed to disconnect integration:", error)
    }
  }

  const handleTestConnection = async (connectionId: string) => {
    try {
      await api.post(`/api/integrations/test/`, { connection_id: connectionId })
      // Could show a success toast here
    } catch (error) {
      console.error("Connection test failed:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected": return "bg-green-500/20 text-green-400"
      case "disconnected": return "bg-gray-500/20 text-gray-400"
      case "pending": return "bg-yellow-500/20 text-yellow-400"
      case "error": return "bg-red-500/20 text-red-400"
      default: return "bg-gray-500/20 text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected": return "✅"
      case "disconnected": return "⚫"
      case "pending": return "⏳"
      case "error": return "❌"
      default: return "⚫"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "storage": return "💾"
      case "streaming": return "📺"
      case "social": return "👥"
      case "productivity": return "⚡"
      default: return "🔧"
    }
  }

  const categories = [
    { id: "all", label: "All", icon: "🌐" },
    { id: "storage", label: "Storage", icon: "💾" },
    { id: "streaming", label: "Streaming", icon: "📺" },
    { id: "social", label: "Social", icon: "👥" },
    { id: "productivity", label: "Productivity", icon: "⚡" }
  ]

  const filteredIntegrationTypes = integrationTypes.filter(type => {
    const matchesSearch = type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         type.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || type.category === selectedCategory
    const isNotConnected = !integrations.some(int => int.type === type.id && int.status === "connected")
    
    return matchesSearch && matchesCategory && (activeTab === "available" ? isNotConnected : true)
  })

  const connectedIntegrations = integrations.filter(integration =>
    integration.status === "connected" &&
    (integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     integration.type.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white/60">Loading integrations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Integrations</h1>
          <p className="text-white/70">Connect your favorite services and tools</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/integrations/custom")}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
        >
          <span className="flex items-center gap-2">
            <span>🔧</span>
            Custom Integration
          </span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">🔍</span>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category.id
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
        {[
          { id: "connected", label: "Connected", icon: "✅", count: connectedIntegrations.length },
          { id: "available", label: "Available", icon: "🌐", count: filteredIntegrationTypes.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white/10 text-white shadow-lg"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className="bg-white/20 text-xs px-2 py-1 rounded-full">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "connected" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connectedIntegrations.map((integration) => (
            <div key={integration.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200">
              {/* Integration Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{integration.icon || "🔗"}</div>
                  <div>
                    <h3 className="font-semibold text-white">{integration.name}</h3>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(integration.status)}`}>
                      <span>{getStatusIcon(integration.status)}</span>
                      {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              {integration.account_info && (
                <div className="mb-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-sm text-white/70 mb-1">Connected Account</p>
                  <p className="text-sm text-white">
                    {integration.account_info.email || integration.account_info.username || "Connected"}
                  </p>
                </div>
              )}

              {/* Last Sync */}
              {integration.last_sync && (
                <div className="mb-4 text-sm text-white/60">
                  Last sync: {new Date(integration.last_sync).toLocaleDateString()}
                </div>
              )}

              {/* Features */}
              {integration.features && integration.features.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-white/70 mb-2">Features</p>
                  <div className="flex flex-wrap gap-1">
                    {integration.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                    {integration.features.length > 3 && (
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                        +{integration.features.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleTestConnection(integration.id)}
                  className="flex-1 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-sm font-medium transition-colors"
                >
                  Test
                </button>
                <button
                  onClick={() => router.push(`/dashboard/integrations/${integration.id}/settings`)}
                  className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Settings
                </button>
                <button
                  onClick={() => handleDisconnect(integration.id)}
                  className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrationTypes.map((type) => (
            <div key={type.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200">
              {/* Type Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{type.icon}</div>
                  <div>
                    <h3 className="font-semibold text-white">{type.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70`}>
                        {getCategoryIcon(type.category)} {type.category}
                      </span>
                      {type.is_premium && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                          ⭐ Premium
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-white/70 mb-4">{type.description}</p>

              {/* Features */}
              <div className="mb-4">
                <p className="text-sm text-white/70 mb-2">Features</p>
                <div className="flex flex-wrap gap-1">
                  {type.features.slice(0, 3).map((feature, index) => (
                    <span key={index} className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full">
                      {feature}
                    </span>
                  ))}
                  {type.features.length > 3 && (
                    <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded-full">
                      +{type.features.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleConnect(type.id)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Connect
                </button>
                <button
                  onClick={() => router.push(`/dashboard/integrations/info/${type.id}`)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                >
                  Info
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty States */}
      {activeTab === "connected" && connectedIntegrations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔗</div>
          <h3 className="text-xl font-semibold text-white mb-2">No integrations connected</h3>
          <p className="text-white/60 mb-6">
            {searchQuery
              ? "No connected integrations match your search"
              : "Connect your favorite services to enhance your watch party experience"
            }
          </p>
          {!searchQuery && (
            <button
              onClick={() => setActiveTab("available")}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200"
            >
              Browse Available Integrations
            </button>
          )}
        </div>
      )}

      {activeTab === "available" && filteredIntegrationTypes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌐</div>
          <h3 className="text-xl font-semibold text-white mb-2">No integrations found</h3>
          <p className="text-white/60 mb-6">
            {searchQuery || selectedCategory !== "all"
              ? "Try adjusting your search or filter criteria"
              : "All available integrations are already connected"
            }
          </p>
          {(searchQuery || selectedCategory !== "all") && (
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setSearchQuery("")}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
              >
                Clear Search
              </button>
              <button
                onClick={() => setSelectedCategory("all")}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
              >
                Show All Categories
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Mock data for fallback
const mockIntegrations: Integration[] = [
  {
    id: "1",
    type: "google-drive",
    name: "Google Drive",
    status: "connected",
    connected_at: "2025-09-15T10:00:00Z",
    last_sync: "2025-10-01T08:00:00Z",
    account_info: {
      email: "user@gmail.com"
    },
    features: ["File Storage", "Video Streaming", "Auto Sync"],
    icon: "📁"
  },
  {
    id: "2",
    type: "spotify",
    name: "Spotify",
    status: "connected",
    connected_at: "2025-09-20T14:00:00Z",
    last_sync: "2025-10-01T12:00:00Z",
    account_info: {
      username: "musiclover123"
    },
    features: ["Music Sync", "Playlist Sharing"],
    icon: "🎵"
  }
]

const mockIntegrationTypes: IntegrationType[] = [
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Stream videos directly from your Google Drive",
    icon: "📁",
    features: ["File Storage", "Video Streaming", "Auto Sync", "Sharing"],
    category: "storage"
  },
  {
    id: "netflix",
    name: "Netflix",
    description: "Sync with Netflix watch parties",
    icon: "📺",
    features: ["Watch Parties", "Content Sync", "Progress Tracking"],
    category: "streaming",
    is_premium: true
  },
  {
    id: "spotify",
    name: "Spotify",
    description: "Add music to your watch parties",
    icon: "🎵",
    features: ["Music Sync", "Playlist Sharing", "Audio Controls"],
    category: "social"
  },
  {
    id: "discord",
    name: "Discord",
    description: "Connect Discord voice channels to watch parties",
    icon: "🎮",
    features: ["Voice Chat", "Screen Share", "Bot Integration"],
    category: "social"
  },
  {
    id: "notion",
    name: "Notion",
    description: "Create watch party notes and planning docs",
    icon: "📝",
    features: ["Note Taking", "Planning", "Templates"],
    category: "productivity"
  },
  {
    id: "trello",
    name: "Trello",
    description: "Organize your movie watchlists",
    icon: "📋",
    features: ["Task Management", "Watchlists", "Collaboration"],
    category: "productivity"
  }
]