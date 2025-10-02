"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api, { type ApiClientError } from "@/lib/api-client"
import { LoadingState, ErrorMessage } from "@/components/ui/feedback"

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
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"connected" | "available">("connected")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    loadIntegrations()
    loadIntegrationTypes()
  }, [])

  const formatErrorMessage = (err: unknown, fallback: string) => {
    if (!err) return fallback
    if (typeof err === "string") return err

    if (err instanceof Error) {
      const apiError = err as ApiClientError
      let message = err.message || fallback
      const detailParts: string[] = []

      if (apiError.status) {
        const codeSuffix = apiError.code ? ` (${apiError.code})` : ""
        detailParts.push(`Error ${apiError.status}${codeSuffix}`)
      }

      if (apiError.details) {
        const details = Object.entries(apiError.details)
          .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
        if (details.length > 0) {
          detailParts.push(details.join(" | "))
        }
      }

      if (detailParts.length > 0) {
        message = `${message} – ${detailParts.join(" – ")}`
      }

      return message
    }

    if (typeof err === "object" && "message" in (err as any)) {
      const message = (err as { message?: string }).message
      if (typeof message === "string" && message.trim().length > 0) {
        return message
      }
    }

    return fallback
  }

  const resolveAuthorizationUrl = (data?: { authorization_url?: string; state?: string }) => {
    if (!data?.authorization_url) return null

    if (data.state && !data.authorization_url.includes("state=")) {
      try {
        const url = new URL(data.authorization_url)
        url.searchParams.set("state", data.state)
        return url.toString()
      } catch {
        const separator = data.authorization_url.includes("?") ? "&" : "?"
        return `${data.authorization_url}${separator}state=${encodeURIComponent(data.state)}`
      }
    }

    return data.authorization_url
  }

  const loadIntegrations = async () => {
    try {
      const response = await api.get<{ data?: { connections?: Integration[] } }>('/api/integrations/connections/')
      setIntegrations(response.data?.connections || [])
    } catch (err) {
      console.error("Failed to load integrations:", err)
      setError(formatErrorMessage(err, 'Failed to load integrations from API'))
      setIntegrations([])
    }
  }

  const loadIntegrationTypes = async () => {
    try {
      const response = await api.get<{ data?: { types?: IntegrationType[] } }>('/api/integrations/types/')
      setIntegrationTypes(response.data?.types || [])
    } catch (err) {
      console.error("Failed to load integration types:", err)
      setError(formatErrorMessage(err, 'Failed to load integration types from API'))
      setIntegrationTypes([])
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (integrationType: string) => {
    try {
      // Different connection flows for different integrations
      if (integrationType === 'google-drive') {
        const authResponse = await api.get<{ data?: { authorization_url?: string; state?: string } }>(
          '/api/integrations/google-drive/auth-url/'
        )
        const authorizationUrl = resolveAuthorizationUrl(authResponse.data)

        if (!authorizationUrl) {
          throw new Error('Authorization URL was not provided by the server. Please try again later.')
        }

        window.location.href = authorizationUrl
      } else if (integrationType === 'oauth') {
        const authResponse = await api.get<{ data?: { authorization_url?: string; state?: string } }>(
          `/api/integrations/oauth/${integrationType}/auth-url/`
        )
        const authorizationUrl = resolveAuthorizationUrl(authResponse.data)

        if (!authorizationUrl) {
          throw new Error('Authorization URL was not provided by the server. Please try again later.')
        }

        window.location.href = authorizationUrl
      } else {
        // Generic connection flow
        await api.post(`/api/integrations/${integrationType}/connect/`)
        await loadIntegrations()
      }
    } catch (error) {
      console.error(`Failed to connect ${integrationType}:`, error)
      setError(formatErrorMessage(error, `Failed to connect ${integrationType}. Please try again later.`))
    }
  }

  const handleDisconnect = async (connectionId: string) => {
    try {
      await api.post(`/api/integrations/connections/${connectionId}/disconnect/`)
      await loadIntegrations()
    } catch (error) {
      console.error("Failed to disconnect integration:", error)
      setError(formatErrorMessage(error, 'Failed to disconnect integration. Please try again later.'))
    }
  }

  const handleTestConnection = async (connectionId: string) => {
    try {
      await api.post(`/api/integrations/test/`, { connection_id: connectionId })
      // Could show a success toast here
    } catch (error) {
      console.error("Connection test failed:", error)
      setError(formatErrorMessage(error, 'Connection test failed. Please try again later.'))
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
    return <LoadingState message="Loading integrations..." />
  }

  return (
    <div className="space-y-6">
      {error && (
        <ErrorMessage 
          message={error} 
          type="error"
          onDismiss={() => setError(null)}
        />
      )}
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
