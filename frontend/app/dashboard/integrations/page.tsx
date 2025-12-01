"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { integrationsApi, type ApiClientError } from "@/lib/api-client"
import { LoadingState, ErrorMessage } from "@/components/ui/feedback"
import { IconButton } from "@/components/ui/icon-button"

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
  iconUrl?: string
  features: string[]
  category: 'storage' | 'streaming' | 'social' | 'productivity'
  is_premium?: boolean
  is_available: boolean
}

// Hardcoded supported integrations - these are the integrations WatchParty officially supports
const SUPPORTED_INTEGRATIONS: IntegrationType[] = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Import and stream videos from your Google Drive. After connecting, move movies to the "Watch Party" folder in your Drive to import them.',
    icon: '☁️',
    iconUrl: 'https://www.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png',
    features: ['Import videos', 'Stream directly', 'Watch Party folder', 'No downloads needed'],
    category: 'storage',
    is_available: true,
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    description: 'Connect your Dropbox account to import and stream videos from your cloud storage.',
    icon: '📦',
    features: ['Import videos', 'Stream directly', 'Shared folders'],
    category: 'storage',
    is_available: false, // Coming soon
  },
  {
    id: 'onedrive',
    name: 'Microsoft OneDrive',
    description: 'Access your OneDrive videos and stream them directly in your watch parties.',
    icon: '☁️',
    features: ['Import videos', 'Stream directly', 'Office 365 integration'],
    category: 'storage',
    is_available: false, // Coming soon
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Watch YouTube videos together with synchronized playback for all party members.',
    icon: '▶️',
    features: ['Watch together', 'Playlists', 'Live streams'],
    category: 'streaming',
    is_available: false, // Coming soon
  },
  {
    id: 'twitch',
    name: 'Twitch',
    description: 'Watch Twitch streams together with your friends in synchronized viewing.',
    icon: '🎮',
    features: ['Live streams', 'VODs', 'Clips'],
    category: 'streaming',
    is_available: false, // Coming soon
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Connect your Discord account to invite friends and sync your watch parties with Discord servers.',
    icon: '💬',
    features: ['Friend invites', 'Server integration', 'Activity status'],
    category: 'social',
    is_available: false, // Coming soon
  },
]

export default function IntegrationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"all" | "connected" | "available">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Check for OAuth callback success/error
  useEffect(() => {
    const gdriveConnected = searchParams.get('gdrive_connected')
    const errorMsg = searchParams.get('error')
    
    if (gdriveConnected === 'true') {
      setSuccessMessage('🎉 Google Drive connected successfully! You can now import videos from your Media Library.')
      // Clear URL params
      window.history.replaceState({}, '', '/dashboard/integrations')
      loadIntegrations()
    } else if (errorMsg) {
      setError(decodeURIComponent(errorMsg))
      window.history.replaceState({}, '', '/dashboard/integrations')
    }
  }, [searchParams])

  useEffect(() => {
    loadIntegrations()
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

  const loadIntegrations = async () => {
    setLoading(true)
    try {
      const response = await integrationsApi.getConnections()
      const nextConnections = (response.data?.connections as Integration[]) || []
      setIntegrations(nextConnections)
    } catch (err) {
      console.error("Failed to load integrations:", err)
      setIntegrations([])
    } finally {
      setLoading(false)
    }
  }

  // Check if a specific integration type is connected
  const isConnected = (integrationTypeId: string): boolean => {
    return integrations.some(int => int.type === integrationTypeId && int.status === 'connected')
  }

  // Get connection details for an integration type
  const getConnection = (integrationTypeId: string): Integration | undefined => {
    return integrations.find(int => int.type === integrationTypeId && int.status === 'connected')
  }

  const handleConnect = async (integrationType: string) => {
    setConnecting(integrationType)
    setError(null)
    
    try {
      if (integrationType === 'google-drive') {
        // Get the Google Drive OAuth URL
        const response = await integrationsApi.googleDrive.getAuthUrl()
        const authData = response?.data || response
        
        let authUrl = (authData as any)?.authorization_url
        const state = (authData as any)?.state
        
        if (!authUrl) {
          throw new Error('Could not get authorization URL. Please try again.')
        }

        // Add state parameter if provided
        if (state && !authUrl.includes('state=')) {
          const separator = authUrl.includes('?') ? '&' : '?'
          authUrl = `${authUrl}${separator}state=${encodeURIComponent(state)}`
        }

        // Redirect to Google OAuth
        window.location.href = authUrl
        return
      }
      
      // For other integrations (future)
      setError(`${integrationType} integration is coming soon!`)
    } catch (err) {
      console.error(`Failed to connect ${integrationType}:`, err)
      setError(formatErrorMessage(err, `Failed to connect ${integrationType}. Please try again.`))
    } finally {
      setConnecting(null)
    }
  }

  const handleDisconnect = async (integrationTypeId: string) => {
    const connection = getConnection(integrationTypeId)
    if (!connection) return
    
    setConnecting(integrationTypeId)
    try {
      await integrationsApi.disconnectService(String(connection.id))
      setSuccessMessage(`${connection.name} disconnected successfully.`)
      await loadIntegrations()
    } catch (err) {
      console.error("Failed to disconnect integration:", err)
      setError(formatErrorMessage(err, 'Failed to disconnect integration. Please try again.'))
    } finally {
      setConnecting(null)
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

  // Filter integrations based on search, category, and tab
  const filteredIntegrations = SUPPORTED_INTEGRATIONS.filter(type => {
    const matchesSearch = type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         type.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || type.category === selectedCategory
    const connected = isConnected(type.id)
    
    if (activeTab === "connected") return matchesSearch && matchesCategory && connected
    if (activeTab === "available") return matchesSearch && matchesCategory && !connected
    return matchesSearch && matchesCategory // "all" tab
  })

  const connectedCount = SUPPORTED_INTEGRATIONS.filter(t => isConnected(t.id)).length
  const availableCount = SUPPORTED_INTEGRATIONS.filter(t => !isConnected(t.id) && t.is_available).length

  if (loading) {
    return <LoadingState message="Loading integrations..." />
  }

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="bg-brand-cyan/10 border border-brand-cyan/30 rounded-2xl p-4 flex items-center gap-3 animate-in slide-in-from-top-2"
        >
          <div className="text-2xl">✅</div>
          <div className="flex-1">
            <p className="text-brand-cyan-dark font-bold">{successMessage}</p>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-brand-cyan/60 hover:text-brand-cyan transition-colors p-1"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <ErrorMessage 
          message={error} 
          type="error"
          onDismiss={() => setError(null)}
        />
      )}
      
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/20 via-brand-blue/20 to-brand-purple/20 rounded-3xl blur-3xl opacity-60 pointer-events-none"></div>
        <div className="glass-panel relative rounded-3xl p-8 border-brand-cyan/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy">
                  <span className="gradient-text">Integrations</span>
                </h1>
                <div className="flex items-center gap-2 px-3 py-1 bg-brand-cyan/10 rounded-full border border-brand-cyan/20">
                  <div className="w-2 h-2 bg-brand-cyan rounded-full animate-pulse"></div>
                  <span className="text-brand-cyan-dark text-sm font-bold">{connectedCount} Connected</span>
                </div>
              </div>
              <p className="text-brand-navy/70 text-lg">Connect your favorite services to enhance your watch parties</p>
            </div>
            <Link
              href="/dashboard/videos"
              className="w-full md:w-auto px-6 py-3 rounded-xl font-bold bg-white border border-brand-navy/10 text-brand-navy hover:bg-brand-navy/5 transition-all flex items-center gap-2 justify-center text-center"
            >
              <span>📹</span>
              Go to Media Library
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Stats */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {[
          { label: "Connected", value: connectedCount, icon: "✅" },
          { label: "Available", value: availableCount, icon: "🌐" }
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <p className="text-sm text-brand-navy/60">{stat.label}</p>
              <p className="text-xl font-bold text-brand-navy">{stat.value}</p>
            </div>
          </div>
        ))}
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
            aria-label="Search integrations"
            className="w-full pl-12 pr-4 py-4 bg-white/50 border border-brand-navy/10 rounded-2xl text-brand-navy placeholder:text-brand-navy/40 focus:outline-none focus:ring-4 focus:ring-brand-purple/10 focus:border-brand-purple/30 transition-all shadow-sm"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 sm:gap-3 pb-1" role="tablist" aria-label="Integration categories">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              type="button"
              aria-pressed={selectedCategory === category.id}
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
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-1 bg-white/40 p-1.5 rounded-2xl border border-brand-navy/5 backdrop-blur-sm">
        {[
          { id: "all", label: "All Services", icon: "🔌", count: SUPPORTED_INTEGRATIONS.length },
          { id: "connected", label: "Connected", icon: "✅", count: connectedCount },
          { id: "available", label: "Available", icon: "🌐", count: availableCount }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            type="button"
            aria-pressed={activeTab === tab.id}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-brand-navy text-white shadow-lg"
                : "text-brand-navy/60 hover:text-brand-navy hover:bg-white/50"
            }`}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-brand-navy/5 text-brand-navy/60"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((integration) => {
          const connected = isConnected(integration.id)
          const connection = getConnection(integration.id)
          const isLoading = connecting === integration.id

          return (
            <div 
              key={integration.id} 
              className={`glass-card rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5 group flex flex-col h-full ${
                connected ? 'border-brand-cyan/30 bg-brand-cyan/5' : 'hover:border-brand-purple/30'
              } ${!integration.is_available && !connected ? 'opacity-60' : ''}`}
            >
              {/* Integration Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 p-2 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                    connected ? 'bg-brand-cyan/10' : 'bg-brand-navy/5'
                  }`}>
                    {integration.iconUrl ? (
                      <img src={integration.iconUrl} alt={integration.name} className="w-10 h-10" />
                    ) : (
                      <span className="text-4xl">{integration.icon}</span>
                    )}
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg transition-colors ${
                      connected ? 'text-brand-cyan-dark' : 'text-brand-navy group-hover:text-brand-purple'
                    }`}>
                      {integration.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {connected ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-cyan/20 text-brand-cyan-dark border border-brand-cyan/30">
                          <span>✅</span> Connected
                        </span>
                      ) : integration.is_available ? (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-brand-purple/10 text-brand-purple-dark border border-brand-purple/20">
                          Available
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-brand-orange/10 text-brand-orange-dark border border-brand-orange/20">
                          Coming Soon
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-brand-navy/5 text-brand-navy/60 border border-brand-navy/5">
                        {getCategoryIcon(integration.category)} {integration.category.charAt(0).toUpperCase() + integration.category.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {/* Description */}
                <p className="text-sm text-brand-navy/70 leading-relaxed">{integration.description}</p>

                {/* Connected Account Info */}
                {connected && connection?.account_info && (
                  <div className="p-3 bg-white/60 rounded-xl border border-brand-cyan/20">
                    <p className="text-xs font-bold text-brand-navy/40 uppercase tracking-wide mb-1">Connected Account</p>
                    <p className="text-sm font-medium text-brand-navy truncate">
                      {connection.account_info.email || connection.account_info.username || "Connected"}
                    </p>
                  </div>
                )}

                {/* Features */}
                <div>
                  <p className="text-xs font-bold text-brand-navy/40 uppercase tracking-wide mb-2">Features</p>
                  <div className="flex flex-wrap gap-1.5">
                    {integration.features.slice(0, 4).map((feature, index) => (
                      <span 
                        key={index} 
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                          connected 
                            ? 'bg-brand-cyan/10 text-brand-cyan-dark border-brand-cyan/20' 
                            : 'bg-brand-purple/10 text-brand-purple-dark border-brand-purple/20'
                        }`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4 mt-4 border-t border-brand-navy/5">
                {connected ? (
                  <>
                    {integration.id === 'google-drive' && (
                      <Link
                        href="/dashboard/videos"
                        className="flex-1 w-full sm:w-auto px-4 py-2.5 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan-dark rounded-xl text-sm font-bold transition-colors text-center"
                      >
                        📹 Open Library
                      </Link>
                    )}
                    <IconButton
                      onClick={() => handleDisconnect(integration.id)}
                      loading={isLoading}
                      variant="danger"
                      className="w-full sm:w-auto px-4 py-2.5"
                    >
                      Disconnect
                    </IconButton>
                  </>
                ) : integration.is_available ? (
                  <IconButton
                    onClick={() => handleConnect(integration.id)}
                    loading={isLoading}
                    className="flex-1 w-full sm:w-auto btn-gradient shadow-md hover:shadow-brand-purple/20"
                  >
                    <span>🔗</span>
                    Connect
                  </IconButton>
                ) : (
                  <button
                    disabled
                    className="flex-1 px-4 py-2.5 bg-brand-navy/5 text-brand-navy/40 rounded-xl font-bold cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredIntegrations.length === 0 && (
        <div className="glass-card rounded-3xl p-12 text-center">
          <div className="text-6xl mb-6 opacity-80">🔌</div>
          <h3 className="text-2xl font-bold text-brand-navy mb-3">No integrations found</h3>
          <p className="text-brand-navy/60 mb-8 max-w-md mx-auto text-lg">
            {searchQuery || selectedCategory !== "all"
              ? "Try adjusting your search or filter criteria"
              : activeTab === "connected" 
                ? "You haven't connected any integrations yet"
                : "No integrations available in this category"
            }
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="px-6 py-2.5 bg-white border border-brand-navy/10 hover:bg-brand-navy/5 text-brand-navy rounded-xl font-bold transition-colors"
              >
                Clear Search
              </button>
            )}
            {selectedCategory !== "all" && (
              <button
                onClick={() => setSelectedCategory("all")}
                className="px-6 py-2.5 bg-white border border-brand-navy/10 hover:bg-brand-navy/5 text-brand-navy rounded-xl font-bold transition-colors"
              >
                Show All Categories
              </button>
            )}
            {activeTab !== "all" && (
              <button
                onClick={() => setActiveTab("all")}
                className="px-6 py-2.5 btn-gradient text-white rounded-xl font-bold transition-colors"
              >
                View All Services
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
