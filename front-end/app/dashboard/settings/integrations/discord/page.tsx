'use client'

import { useState } from 'react'
import { 
  MicrophoneIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  Cog6ToothIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string
  status: 'online' | 'away' | 'dnd' | 'offline'
}

interface DiscordServer {
  id: string
  name: string
  icon: string
  memberCount: number
  isConnected: boolean
}

const mockUser: DiscordUser = {
  id: '123456789',
  username: 'WatchPartyUser',
  discriminator: '1234',
  avatar: '/placeholder-user.jpg',
  status: 'online'
}

const mockServers: DiscordServer[] = [
  {
    id: '1',
    name: 'WatchParty Community',
    icon: '/placeholder-logo.svg',
    memberCount: 1523,
    isConnected: true
  },
  {
    id: '2',
    name: 'Movie Nights',
    icon: '/placeholder.svg',
    memberCount: 89,
    isConnected: true
  },
  {
    id: '3',
    name: 'Gaming Squad',
    icon: '/placeholder.svg',
    memberCount: 42,
    isConnected: false
  }
]

interface NotificationSettings {
  partyInvites: boolean
  friendRequests: boolean
  watchReminders: boolean
  systemUpdates: boolean
}

export default function DiscordIntegrationPage() {
  const [isConnected, setIsConnected] = useState(true)
  const [richPresence, setRichPresence] = useState(true)
  const [voiceIntegration, setVoiceIntegration] = useState(true)
  const [autoJoinVoice, setAutoJoinVoice] = useState(false)
  const [showActivity, setShowActivity] = useState(true)
  const [notifications, setNotifications] = useState<NotificationSettings>({
    partyInvites: true,
    friendRequests: true,
    watchReminders: false,
    systemUpdates: true
  })
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)
  const [isReconnecting, setIsReconnecting] = useState(false)

  const handleDisconnect = () => {
    setIsConnected(false)
    setShowDisconnectModal(false)
  }

  const handleReconnect = async () => {
    setIsReconnecting(true)
    // Simulate OAuth reconnection
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsConnected(true)
    setIsReconnecting(false)
  }

  const updateNotificationSetting = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <MicrophoneIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">Discord</h1>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-12 border border-white/20">
              <XCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Not Connected</h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Connect your Discord account to show your watch parties in your status and enable voice chat integration.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-white/80">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>Rich presence in Discord status</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>Voice chat integration</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>Party notifications</span>
                </div>
              </div>
              
              <button
                onClick={handleReconnect}
                disabled={isReconnecting}
                className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
              >
                {isReconnecting ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect Discord'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <MicrophoneIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">Discord Integration</h1>
            </div>
            <p className="text-white/70 text-lg">
              Manage your Discord connection and integration settings
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
            <span className="text-green-400 font-medium">Connected</span>
          </div>
        </div>

        {/* Connected Account */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Connected Account</h3>
          
          <div className="flex items-center gap-4 mb-6">
            <img
              src={mockUser.avatar}
              alt="Discord Avatar"
              className="w-16 h-16 rounded-full bg-white/20"
            />
            <div>
              <h4 className="text-xl font-bold text-white">
                {mockUser.username}#{mockUser.discriminator}
              </h4>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  mockUser.status === 'online' ? 'bg-green-400' :
                  mockUser.status === 'away' ? 'bg-yellow-400' :
                  mockUser.status === 'dnd' ? 'bg-red-400' : 'bg-gray-400'
                }`}></div>
                <span className="text-white/70 capitalize">{mockUser.status}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <h5 className="font-medium text-white mb-2">Connected Servers</h5>
              <div className="text-2xl font-bold text-indigo-400">
                {mockServers.filter(s => s.isConnected).length}
              </div>
              <div className="text-sm text-white/60">of {mockServers.length} servers</div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4">
              <h5 className="font-medium text-white mb-2">Total Members</h5>
              <div className="text-2xl font-bold text-indigo-400">
                {mockServers.reduce((sum, s) => sum + (s.isConnected ? s.memberCount : 0), 0)}
              </div>
              <div className="text-sm text-white/60">across connected servers</div>
            </div>
          </div>
        </div>

        {/* Integration Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Integration Features</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Rich Presence</h4>
                  <p className="text-sm text-white/60">Show what you're watching in Discord</p>
                </div>
                <button
                  onClick={() => setRichPresence(!richPresence)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    richPresence ? 'bg-indigo-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      richPresence ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Voice Integration</h4>
                  <p className="text-sm text-white/60">Enable Discord voice chat in parties</p>
                </div>
                <button
                  onClick={() => setVoiceIntegration(!voiceIntegration)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    voiceIntegration ? 'bg-indigo-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      voiceIntegration ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Auto-join Voice</h4>
                  <p className="text-sm text-white/60">Automatically join voice when party starts</p>
                </div>
                <button
                  onClick={() => setAutoJoinVoice(!autoJoinVoice)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoJoinVoice ? 'bg-indigo-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      autoJoinVoice ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Show Activity</h4>
                  <p className="text-sm text-white/60">Let friends see when you're watching</p>
                </div>
                <button
                  onClick={() => setShowActivity(!showActivity)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    showActivity ? 'bg-indigo-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      showActivity ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Notification Settings</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Party Invites</h4>
                  <p className="text-sm text-white/60">Get notified of party invitations</p>
                </div>
                <button
                  onClick={() => updateNotificationSetting('partyInvites')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.partyInvites ? 'bg-indigo-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      notifications.partyInvites ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Friend Requests</h4>
                  <p className="text-sm text-white/60">Get notified of new friend requests</p>
                </div>
                <button
                  onClick={() => updateNotificationSetting('friendRequests')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.friendRequests ? 'bg-indigo-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      notifications.friendRequests ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Watch Reminders</h4>
                  <p className="text-sm text-white/60">Reminders for scheduled parties</p>
                </div>
                <button
                  onClick={() => updateNotificationSetting('watchReminders')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.watchReminders ? 'bg-indigo-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      notifications.watchReminders ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">System Updates</h4>
                  <p className="text-sm text-white/60">Important system notifications</p>
                </div>
                <button
                  onClick={() => updateNotificationSetting('systemUpdates')}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.systemUpdates ? 'bg-indigo-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      notifications.systemUpdates ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Connected Servers */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden mb-8">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-bold text-white">Connected Servers</h3>
          </div>
          
          <div className="divide-y divide-white/10">
            {mockServers.map(server => (
              <div key={server.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={server.icon}
                      alt={server.name}
                      className="w-12 h-12 rounded-lg bg-white/20"
                    />
                    
                    <div>
                      <h4 className="font-medium text-white">{server.name}</h4>
                      <div className="text-sm text-white/60">
                        {server.memberCount.toLocaleString()} members
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {server.isConnected ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span className="text-sm">Connected</span>
                      </div>
                    ) : (
                      <button className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg transition-colors">
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Voice Settings */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Voice Chat Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-2">Input Device</h4>
              <select className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/20 text-white focus:outline-none focus:border-indigo-400">
                <option>Default Microphone</option>
                <option>USB Headset Microphone</option>
                <option>Blue Yeti Microphone</option>
              </select>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-2">Output Device</h4>
              <select className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/20 text-white focus:outline-none focus:border-indigo-400">
                <option>Default Speakers</option>
                <option>USB Headset</option>
                <option>Bluetooth Headphones</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            <Cog6ToothIcon className="w-5 h-5" />
            Advanced Settings
          </button>
          
          <button
            onClick={() => setShowDisconnectModal(true)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <XCircleIcon className="w-5 h-5" />
            Disconnect
          </button>
        </div>

        {/* Info Notice */}
        <div className="bg-indigo-500/20 border border-indigo-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-indigo-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-indigo-300 mb-1">About Discord Integration</h4>
              <p className="text-indigo-200 text-sm">
                WatchParty integrates with Discord to enhance your social viewing experience. We only access 
                basic profile information and server membership to provide integration features.
              </p>
            </div>
          </div>
        </div>

        {/* Disconnect Confirmation Modal */}
        {showDisconnectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Disconnect Discord?</h2>
              <p className="text-white/70 mb-6">
                This will disable Discord integration features like rich presence, voice chat, 
                and notifications. You can reconnect at any time.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDisconnectModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisconnect}
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
