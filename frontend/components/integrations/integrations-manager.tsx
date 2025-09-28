'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useApiToast } from "@/hooks/use-toast"
import { 
  Link as LinkIcon, 
  Settings,
  Check,
  X,
  Shield,
  Zap,
  Globe,
  Music,
  Video,
  MessageSquare,
  Calendar,
  Users,
  Star,
  AlertTriangle,
  RefreshCw,
  ExternalLink
} from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  icon: string
  category: 'streaming' | 'social' | 'productivity' | 'entertainment' | 'communication'
  isConnected: boolean
  isEnabled: boolean
  lastSync?: string
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  permissions: string[]
  features: {
    name: string
    description: string
    enabled: boolean
  }[]
  config?: {
    [key: string]: unknown
  }
  stats?: {
    totalSyncs: number
    lastActivity: string
    errorCount: number
  }
}

const AVAILABLE_INTEGRATIONS: Omit<Integration, 'isConnected' | 'isEnabled' | 'status' | 'config' | 'stats'>[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    description: 'Sync your Netflix watchlist and viewing history',
    icon: '🎬',
    category: 'streaming',
    permissions: ['Read watchlist', 'Read viewing history'],
    features: [
      { name: 'Watchlist Sync', description: 'Import your Netflix watchlist', enabled: true },
      { name: 'Viewing History', description: 'Track what you\'ve watched', enabled: true },
      { name: 'Recommendations', description: 'Get personalized recommendations', enabled: false }
    ]
  },
  {
    id: 'spotify',
    name: 'Spotify',
    description: 'Share music and create collaborative playlists',
    icon: '🎵',
    category: 'entertainment',
    permissions: ['Read playlists', 'Create playlists', 'Control playback'],
    features: [
      { name: 'Playlist Sharing', description: 'Share playlists with your party', enabled: true },
      { name: 'Music Sync', description: 'Sync music with video content', enabled: false },
      { name: 'Background Music', description: 'Play music during breaks', enabled: true }
    ]
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Connect your Discord server for enhanced communication',
    icon: '💬',
    category: 'communication',
    permissions: ['Read server info', 'Send messages', 'Manage webhooks'],
    features: [
      { name: 'Server Integration', description: 'Connect to your Discord server', enabled: true },
      { name: 'Voice Channels', description: 'Create voice channels for parties', enabled: false },
      { name: 'Bot Commands', description: 'Control parties via Discord bot', enabled: true }
    ]
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Import playlists and subscriptions from YouTube',
    icon: '📺',
    category: 'streaming',
    permissions: ['Read playlists', 'Read subscriptions'],
    features: [
      { name: 'Playlist Import', description: 'Import your YouTube playlists', enabled: true },
      { name: 'Subscription Sync', description: 'Get updates from subscriptions', enabled: true },
      { name: 'Live Streams', description: 'Watch live streams together', enabled: false }
    ]
  },
  {
    id: 'twitch',
    name: 'Twitch',
    description: 'Stream live content and interact with Twitch chat',
    icon: '📻',
    category: 'streaming',
    permissions: ['Read channel info', 'Read chat', 'Follow channels'],
    features: [
      { name: 'Live Streaming', description: 'Watch Twitch streams together', enabled: true },
      { name: 'Chat Integration', description: 'Interact with Twitch chat', enabled: true },
      { name: 'Channel Following', description: 'Follow channels from parties', enabled: false }
    ]
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Schedule watch parties and sync with your calendar',
    icon: '📅',
    category: 'productivity',
    permissions: ['Read calendar', 'Create events'],
    features: [
      { name: 'Party Scheduling', description: 'Schedule parties in your calendar', enabled: true },
      { name: 'Reminders', description: 'Get notified before parties start', enabled: true },
      { name: 'Availability Sync', description: 'Share your availability', enabled: false }
    ]
  }
]

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case 'connected': return 'bg-green-500'
    case 'disconnected': return 'bg-gray-500'
    case 'error': return 'bg-red-500'
    case 'syncing': return 'bg-blue-500'
    default: return 'bg-gray-500'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'connected': return <Check className="h-3 w-3" />
    case 'disconnected': return <X className="h-3 w-3" />
    case 'error': return <AlertTriangle className="h-3 w-3" />
    case 'syncing': return <RefreshCw className="h-3 w-3 animate-spin" />
    default: return <X className="h-3 w-3" />
  }
}

export function IntegrationsManager() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const { apiRequest, toastSuccess, toastError } = useApiToast()

  useEffect(() => {
    loadIntegrations()
  }, [])

  const loadIntegrations = async () => {
    try {
      const response = await apiRequest(() => fetch(&apos;/api/integrations'))
      if (response) {
        // Merge with available integrations to show all possible integrations
        const mergedIntegrations = AVAILABLE_INTEGRATIONS.map(available => {
          const connected = response.find((i: Integration) => i.id === available.id)
          return {
            ...available,
            isConnected: !!connected,
            isEnabled: connected?.isEnabled || false,
            status: connected?.status || 'disconnected',
            lastSync: connected?.lastSync,
            config: connected?.config,
            stats: connected?.stats
          } as Integration
        })
        setIntegrations(mergedIntegrations)
      }
    } catch (error) {
      toastError(error, 'Failed to load integrations')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (integrationId: string) => {
    const success = await apiRequest(
      () => fetch(`/api/integrations/${integrationId}/connect`, { method: 'POST' }),
      { successMessage: 'Integration connected successfully!', showSuccess: true }
    )

    if (success) {
      loadIntegrations()
    }
  }

  const handleDisconnect = async (integrationId: string) => {
    const success = await apiRequest(
      () => fetch(`/api/integrations/${integrationId}/disconnect`, { method: 'POST' }),
      { successMessage: 'Integration disconnected', showSuccess: true }
    )

    if (success) {
      loadIntegrations()
    }
  }

  const handleToggleEnabled = async (integrationId: string, enabled: boolean) => {
    const success = await apiRequest(
      () => fetch(`/api/integrations/${integrationId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      }),
      { successMessage: `Integration ${enabled ? 'enabled' : 'disabled'}`, showSuccess: true }
    )

    if (success) {
      loadIntegrations()
    }
  }

  const handleToggleFeature = async (integrationId: string, featureName: string, enabled: boolean) => {
    const success = await apiRequest(
      () => fetch(`/api/integrations/${integrationId}/features/${featureName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      }),
      { successMessage: `Feature ${enabled ? 'enabled' : 'disabled'}`, showSuccess: true }
    )

    if (success) {
      loadIntegrations()
    }
  }

  const handleSync = async (integrationId: string) => {
    const success = await apiRequest(
      () => fetch(`/api/integrations/${integrationId}/sync`, { method: 'POST' }),
      { successMessage: 'Sync started', showSuccess: true }
    )

    if (success) {
      loadIntegrations()
    }
  }

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'syncing': return 'bg-blue-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return <Check className="h-4 w-4" />
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'error': return <AlertTriangle className="h-4 w-4" />
      default: return <X className="h-4 w-4" />
    }
  }

  const getCategoryIcon = (category: Integration['category']) => {
    switch (category) {
      case 'streaming': return <Video className="h-5 w-5" />
      case 'social': return <Users className="h-5 w-5" />
      case 'productivity': return <Calendar className="h-5 w-5" />
      case 'entertainment': return <Music className="h-5 w-5" />
      case 'communication': return <MessageSquare className="h-5 w-5" />
      default: return <Globe className="h-5 w-5" />
    }
  }

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) acc[integration.category] = []
    acc[integration.category].push(integration)
    return acc
  }, {} as Record<string, Integration[]>)

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Connected</p>
                <p className="text-2xl font-bold">
                  {integrations.filter(i => i.isConnected).length}
                </p>
              </div>
              <LinkIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">
                  {integrations.filter(i => i.isEnabled).length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">{integrations.length}</p>
              </div>
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations by Category */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="streaming">Streaming</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="entertainment">Entertainment</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
            <div key={category}>
              <div className="flex items-center space-x-2 mb-4">
                {getCategoryIcon(category as Integration['category'])}
                <h3 className="text-lg font-semibold capitalize">{category}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryIntegrations.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    onToggleEnabled={handleToggleEnabled}
                    onSync={handleSync}
                    onConfigure={() => {
                      setSelectedIntegration(integration)
                      setConfigDialogOpen(true)
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="connected" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations
              .filter(i => i.isConnected)
              .map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onToggleEnabled={handleToggleEnabled}
                  onSync={handleSync}
                  onConfigure={() => {
                    setSelectedIntegration(integration)
                    setConfigDialogOpen(true)
                  }}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="streaming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations
              .filter(i => i.category === &apos;streaming')
              .map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onToggleEnabled={handleToggleEnabled}
                  onSync={handleSync}
                  onConfigure={() => {
                    setSelectedIntegration(integration)
                    setConfigDialogOpen(true)
                  }}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations
              .filter(i => i.category === &apos;social')
              .map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onToggleEnabled={handleToggleEnabled}
                  onSync={handleSync}
                  onConfigure={() => {
                    setSelectedIntegration(integration)
                    setConfigDialogOpen(true)
                  }}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="entertainment" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations
              .filter(i => i.category === &apos;entertainment')
              .map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onToggleEnabled={handleToggleEnabled}
                  onSync={handleSync}
                  onConfigure={() => {
                    setSelectedIntegration(integration)
                    setConfigDialogOpen(true)
                  }}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedIntegration && (
            <IntegrationConfig
              integration={selectedIntegration}
              onToggleFeature={handleToggleFeature}
              onClose={() => setConfigDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function IntegrationCard({
  integration,
  onConnect,
  onDisconnect,
  onToggleEnabled,
  onSync,
  onConfigure
}: {
  integration: Integration
  onConnect: (id: string) => void
  onDisconnect: (id: string) => void
  onToggleEnabled: (id: string, enabled: boolean) => void
  onSync: (id: string) => void
  onConfigure: () => void
}) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{integration.icon}</div>
            <div>
              <h3 className="font-semibold">{integration.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={`text-white text-xs ${getStatusColor(integration.status)}`}
                >
                  <span className="flex items-center space-x-1">
                    {getStatusIcon(integration.status)}
                    <span>{integration.status}</span>
                  </span>
                </Badge>
                {integration.isConnected && (
                  <Switch
                    checked={integration.isEnabled}
                    onCheckedChange={(enabled) => onToggleEnabled(integration.id, enabled)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4">
          {integration.description}
        </p>

        {integration.isConnected && integration.stats && (
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4">
            <div>Syncs: {integration.stats.totalSyncs}</div>
            <div>Errors: {integration.stats.errorCount}</div>
          </div>
        )}

        {integration.lastSync && (
          <p className="text-xs text-muted-foreground mb-4">
            Last sync: {new Date(integration.lastSync).toLocaleString()}
          </p>
        )}

        <div className="mt-auto space-y-2">
          {!integration.isConnected ? (
            <Button 
              size="sm" 
              onClick={() => onConnect(integration.id)}
              className="w-full"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Connect
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onConfigure}
                className="flex-1"
              >
                <Settings className="h-4 w-4 mr-1" />
                Configure
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSync(integration.id)}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Sync
              </Button>
            </div>
          )}
          
          {integration.isConnected && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDisconnect(integration.id)}
              className="w-full"
            >
              Disconnect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function IntegrationConfig({
  integration,
  onToggleFeature,
  onClose
}: {
  integration: Integration
  onToggleFeature: (integrationId: string, featureName: string, enabled: boolean) => void
  onClose: () => void
}) {
  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-3">
          <span className="text-2xl">{integration.icon}</span>
          <span>{integration.name} Configuration</span>
        </DialogTitle>
      </DialogHeader>

      {/* Permissions */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center space-x-2">
          <Shield className="h-4 w-4" />
          <span>Permissions</span>
        </h3>
        <div className="space-y-2">
          {integration.permissions.map(permission => (
            <div key={permission} className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">{permission}</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Features */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center space-x-2">
          <Star className="h-4 w-4" />
          <span>Features</span>
        </h3>
        <div className="space-y-4">
          {integration.features.map(feature => (
            <div key={feature.name} className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{feature.name}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <Switch
                checked={feature.enabled}
                onCheckedChange={(enabled) => onToggleFeature(integration.id, feature.name, enabled)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onClose}>Done</Button>
      </div>
    </div>
  )
}
