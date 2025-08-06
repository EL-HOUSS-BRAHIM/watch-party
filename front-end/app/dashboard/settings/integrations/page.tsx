'use client'

import { useState } from 'react'
import { 
  Cog6ToothIcon,
  LinkIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  CloudIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  isConnected: boolean
  connectedAt?: string
  permissions: string[]
  status: 'active' | 'error' | 'pending'
  errorMessage?: string
}

const availableIntegrations: Integration[] = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Store and sync your videos with Google Drive',
    icon: <CloudIcon className="w-6 h-6" />,
    isConnected: true,
    connectedAt: '2024-03-15',
    permissions: ['Read files', 'Upload files', 'Manage folders'],
    status: 'active'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Import videos from your YouTube channel',
    icon: <VideoCameraIcon className="w-6 h-6" />,
    isConnected: false,
    permissions: ['Read channel data', 'Access video library'],
    status: 'pending'
  },
  {
    id: 'spotify',
    name: 'Spotify',
    description: 'Sync music for watch party soundtracks',
    icon: <MusicalNoteIcon className="w-6 h-6" />,
    isConnected: true,
    connectedAt: '2024-02-20',
    permissions: ['Read playlists', 'Control playback'],
    status: 'error',
    errorMessage: 'Authentication expired. Please reconnect.'
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Send watch party notifications to Discord servers',
    icon: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
    isConnected: false,
    permissions: ['Send messages', 'Create invites'],
    status: 'pending'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'text-green-400'
    case 'error':
      return 'text-red-400'
    default:
      return 'text-yellow-400'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircleIcon className="w-5 h-5" />
    case 'error':
      return <XMarkIcon className="w-5 h-5" />
    default:
      return <Cog6ToothIcon className="w-5 h-5 animate-spin" />
  }
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(availableIntegrations)
  const [showDisconnectModal, setShowDisconnectModal] = useState<string | null>(null)

  const handleConnect = async (integrationId: string) => {
    // In real app, this would trigger OAuth flow
    console.log('Connecting to:', integrationId)
    
    // Simulate OAuth process
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'pending' as const }
        : integration
    ))

    // Simulate successful connection after delay
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration => 
        integration.id === integrationId 
          ? { 
              ...integration, 
              isConnected: true, 
              status: 'active' as const,
              connectedAt: new Date().toISOString().split('T')[0]
            }
          : integration
      ))
    }, 2000)
  }

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            isConnected: false, 
            status: 'pending' as const,
            connectedAt: undefined,
            errorMessage: undefined
          }
        : integration
    ))
    setShowDisconnectModal(null)
  }

  const handleReconnect = (integrationId: string) => {
    handleConnect(integrationId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <LinkIcon className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Integrations</h1>
          </div>
          <p className="text-white/70 text-lg">
            Connect WatchParty with your favorite services to enhance your experience
          </p>
        </div>

        {/* Connected Services Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {integrations.filter(i => i.isConnected && i.status === 'active').length}
            </div>
            <div className="text-white/70">Active Connections</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {integrations.filter(i => i.status === 'error').length}
            </div>
            <div className="text-white/70">Need Attention</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {integrations.filter(i => !i.isConnected).length}
            </div>
            <div className="text-white/70">Available</div>
          </div>
        </div>

        {/* Integrations List */}
        <div className="space-y-6">
          {integrations.map(integration => (
            <div
              key={integration.id}
              className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-lg">
                    {integration.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-white text-lg">{integration.name}</h3>
                      <div className={`flex items-center gap-1 ${getStatusColor(integration.status)}`}>
                        {getStatusIcon(integration.status)}
                        <span className="text-sm font-medium capitalize">{integration.status}</span>
                      </div>
                    </div>
                    
                    <p className="text-white/70 mb-4">{integration.description}</p>
                    
                    {/* Error Message */}
                    {integration.errorMessage && (
                      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                        <p className="text-red-200 text-sm">{integration.errorMessage}</p>
                      </div>
                    )}
                    
                    {/* Connection Details */}
                    {integration.isConnected && integration.connectedAt && (
                      <div className="text-sm text-white/60 mb-4">
                        Connected on {new Date(integration.connectedAt).toLocaleDateString()}
                      </div>
                    )}
                    
                    {/* Permissions */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-white/80 mb-2">Permissions:</h4>
                      <div className="flex flex-wrap gap-2">
                        {integration.permissions.map((permission, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-white/10 rounded text-xs text-white/70"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  {integration.isConnected ? (
                    <>
                      {integration.status === 'error' && (
                        <button
                          onClick={() => handleReconnect(integration.id)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                        >
                          Reconnect
                        </button>
                      )}
                      <button
                        onClick={() => setShowDisconnectModal(integration.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Disconnect
                      </button>
                      {integration.id === 'google-drive' && (
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors">
                          Settings
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(integration.id)}
                      disabled={integration.status === 'pending'}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 text-white rounded-lg font-medium transition-colors"
                    >
                      {integration.status === 'pending' ? (
                        <>
                          <Cog6ToothIcon className="w-4 h-4 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <PlusIcon className="w-4 h-4" />
                          Connect
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add More Integrations */}
        <div className="mt-12 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-2">Need More Integrations?</h3>
            <p className="text-white/70 mb-4">
              We're always adding new integrations. Let us know what services you'd like to connect!
            </p>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
              Request Integration
            </button>
          </div>
        </div>

        {/* Disconnect Confirmation Modal */}
        {showDisconnectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Disconnect Integration?</h2>
              <p className="text-white/70 mb-6">
                This will remove the connection to{' '}
                {integrations.find(i => i.id === showDisconnectModal)?.name}.
                You can reconnect at any time.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDisconnectModal(null)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDisconnect(showDisconnectModal)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
