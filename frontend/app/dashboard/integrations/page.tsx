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
      case "connected": return "bg-brand-cyan/20 text-brand-cyan-light"
      case "disconnected": return "bg-gray-500/20 text-gray-400"
      case "pending": return "bg-brand-orange/20 text-brand-orange-light"
      case "error": return "bg-brand-coral/20 text-brand-coral-light"
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
    <div className="space-y-8">
      {error && (
        <ErrorMessage 
          message={error} 
          type="error"
          onDismiss={() => setError(null)}
        />
      )}
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/20 via-brand-blue/20 to-brand-purple/20 rounded-3xl blur-3xl opacity-60"></div>
        <div className="glass-panel relative rounded-3xl p-8 border-brand-cyan/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy">
                <span className="gradient-text">Integrations</span>
              </h1>
              <p className="text-brand-navy/70 text-lg">Connect your favorite services and tools</p>
            </div>
            <button
              onClick={() => router.push("/dashboard/integrations/custom")}
              className="btn-gradient px-6 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-brand-purple/25 transition-all hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>🔧</span>
              Custom Integration
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-brand-navy/40 text-xl">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/50 border border-brand-navy/10 rounded-2xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple/30 transition-all shadow-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category.id
                  ? "bg-brand-navy text-white shadow-md"
                  : "bg-white/40 text-brand-navy/60 hover:text-brand-navy hover:bg-white/60 border border-brand-navy/5"
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/40 p-1.5 rounded-2xl border border-brand-navy/5 backdrop-blur-sm">
        {[
          { id: "connected", label: "Connected", icon: "✅", count: connectedIntegrations.length },
          { id: "available", label: "Available", icon: "🌐", count: filteredIntegrationTypes.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-brand-navy text-white shadow-lg"
                : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-brand-navy/5 text-brand-navy/60"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "connected" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connectedIntegrations.map((integration) => (
            <div key={integration.id} className="glass-card rounded-2xl p-6 hover:border-brand-cyan/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5 group">
              {/* Integration Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl p-2 bg-brand-navy/5 rounded-xl">{integration.icon || "🔗"}</div>
                  <div>
                    <h3 className="font-bold text-brand-navy text-lg group-hover:text-brand-blue transition-colors">{integration.name}</h3>
                    <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getStatusBadge(integration.status)}`}>
                      <span>{getStatusIcon(integration.status)}</span>
                      {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              {integration.account_info && (
                <div className="mb-4 p-3 bg-brand-navy/5 rounded-xl border border-brand-navy/5">
                  <p className="text-xs font-bold text-brand-navy/40 uppercase tracking-wide mb-1">Connected Account</p>
                  <p className="text-sm font-medium text-brand-navy truncate">
                    {integration.account_info.email || integration.account_info.username || "Connected"}
                  </p>
                </div>
              )}

              {/* Last Sync */}
              {integration.last_sync && (
                <div className="mb-4 text-xs font-medium text-brand-navy/40 flex items-center gap-1">
                  <span>🔄</span> Last sync: {new Date(integration.last_sync).toLocaleDateString()}
                </div>
              )}

              {/* Features */}
              {integration.features && integration.features.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-brand-navy/40 uppercase tracking-wide mb-2">Features</p>
                  <div className="flex flex-wrap gap-1.5">
                    {integration.features.slice(0, 3).map((feature, index) => (
                      <span key={index} className="px-2.5 py-1 bg-brand-blue/10 text-brand-blue-dark text-xs font-bold rounded-lg border border-brand-blue/20">
                        {feature}
                      </span>
                    ))}
                    {integration.features.length > 3 && (
                      <span className="px-2.5 py-1 bg-brand-blue/10 text-brand-blue-dark text-xs font-bold rounded-lg border border-brand-blue/20">
                        +{integration.features.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-brand-navy/5">
                <button
                  onClick={() => handleTestConnection(integration.id)}
                  className="flex-1 px-3 py-2 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue-dark rounded-lg text-sm font-bold transition-colors"
                >
                  Test
                </button>
                <button
                  onClick={() => router.push(`/dashboard/integrations/${integration.id}/settings`)}
                  className="flex-1 px-3 py-2 bg-white border border-brand-navy/10 hover:bg-brand-navy/5 text-brand-navy rounded-lg text-sm font-bold transition-colors"
                >
                  Settings
                </button>
                <button
                  onClick={() => handleDisconnect(integration.id)}
                  className="px-3 py-2 bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral-dark rounded-lg text-sm font-bold transition-colors"
                  title="Disconnect"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrationTypes.map((type) => (
            <div key={type.id} className="glass-card rounded-2xl p-6 hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5 group">
              {/* Type Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl p-2 bg-brand-navy/5 rounded-xl group-hover:scale-110 transition-transform duration-300">{type.icon}</div>
                  <div>
                    <h3 className="font-bold text-brand-navy text-lg group-hover:text-brand-purple transition-colors">{type.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold bg-brand-navy/5 text-brand-navy/60 border border-brand-navy/5`}>
                        {getCategoryIcon(type.category)} {type.category.charAt(0).toUpperCase() + type.category.slice(1)}
                      </span>
                      {type.is_premium && (
                        <span className="px-2 py-0.5 bg-brand-orange/10 text-brand-orange-dark rounded-lg text-xs font-bold border border-brand-orange/20">
                          ⭐ Premium
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-brand-navy/70 mb-6 leading-relaxed min-h-[40px]">{type.description}</p>

              {/* Features */}
              <div className="mb-6">
                <p className="text-xs font-bold text-brand-navy/40 uppercase tracking-wide mb-2">Features</p>
                <div className="flex flex-wrap gap-1.5">
                  {type.features.slice(0, 3).map((feature, index) => (
                    <span key={index} className="px-2.5 py-1 bg-brand-purple/10 text-brand-purple-dark text-xs font-bold rounded-lg border border-brand-purple/20">
                      {feature}
                    </span>
                  ))}
                  {type.features.length > 3 && (
                    <span className="px-2.5 py-1 bg-brand-purple/10 text-brand-purple-dark text-xs font-bold rounded-lg border border-brand-purple/20">
                      +{type.features.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-brand-navy/5">
                <button
                  onClick={() => handleConnect(type.id)}
                  className="flex-1 px-4 py-2.5 btn-gradient text-white rounded-xl font-bold transition-all shadow-md hover:shadow-brand-purple/20 hover:-translate-y-0.5"
                >
                  Connect
                </button>
                <button
                  onClick={() => router.push(`/dashboard/integrations/info/${type.id}`)}
                  className="px-4 py-2.5 bg-white border border-brand-navy/10 hover:bg-brand-navy/5 text-brand-navy rounded-xl font-bold transition-colors"
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
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="text-6xl mb-6 opacity-80">🔗</div>
          <h3 className="text-2xl font-bold text-brand-navy mb-3">No integrations connected</h3>
          <p className="text-brand-navy/60 mb-8 max-w-md mx-auto text-lg">
            {searchQuery
              ? "No connected integrations match your search"
              : "Connect your favorite services to enhance your watch party experience"
            }
          </p>
          {!searchQuery && (
            <button
              onClick={() => setActiveTab("available")}
              className="btn-gradient px-8 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-brand-purple/25 transition-all hover:-translate-y-0.5"
            >
              Browse Available Integrations
            </button>
          )}
        </div>
      )}

      {activeTab === "available" && filteredIntegrationTypes.length === 0 && (
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="text-6xl mb-6 opacity-80">🌐</div>
          <h3 className="text-2xl font-bold text-brand-navy mb-3">No integrations found</h3>
          <p className="text-brand-navy/60 mb-8 max-w-md mx-auto text-lg">
            {searchQuery || selectedCategory !== "all"
              ? "Try adjusting your search or filter criteria"
              : "All available integrations are already connected"
            }
          </p>
          {(searchQuery || selectedCategory !== "all") && (
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setSearchQuery("")}
                className="px-6 py-2.5 bg-white border border-brand-navy/10 hover:bg-brand-navy/5 text-brand-navy rounded-xl font-bold transition-colors"
              >
                Clear Search
              </button>
              <button
                onClick={() => setSelectedCategory("all")}
                className="px-6 py-2.5 bg-white border border-brand-navy/10 hover:bg-brand-navy/5 text-brand-navy rounded-xl font-bold transition-colors"
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
