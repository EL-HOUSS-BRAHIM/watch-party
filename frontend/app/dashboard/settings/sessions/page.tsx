"use client"

import { Calendar, MapPin, Shield, Trash } from "lucide-react"
import { useState } from 'react'

interface Session {}
  id: string
  deviceName: string
  deviceType: 'desktop' | 'mobile' | 'tablet'
  browser: string
  location: string
  ipAddress: string
  lastActive: string
  isCurrent: boolean
}

const sessions: Session[] = []
  {}
    id: '1',
    deviceName: 'MacBook Pro',
    deviceType: 'desktop',
    browser: 'Chrome 121.0',
    location: 'San Francisco, CA',
    ipAddress: '192.168.1.100',
    lastActive: '2024-03-21T10:30:00Z',
    isCurrent: true
  },
  {}
    id: '2',
    deviceName: 'iPhone 15 Pro',
    deviceType: 'mobile',
    browser: 'Safari Mobile',
    location: 'San Francisco, CA',
    ipAddress: '192.168.1.101',
    lastActive: '2024-03-21T08:15:00Z',
    isCurrent: false
  },
  {}
    id: '3',
    deviceName: 'Windows Desktop',
    deviceType: 'desktop',
    browser: 'Firefox 124.0',
    location: 'Los Angeles, CA',
    ipAddress: '10.0.0.50',
    lastActive: '2024-03-20T22:45:00Z',
    isCurrent: false
  },
  {}
    id: '4',
    deviceName: 'iPad Air',
    deviceType: 'tablet',
    browser: 'Safari Mobile',
    location: 'New York, NY',
    ipAddress: '172.16.0.25',
    lastActive: '2024-03-19T14:20:00Z',
    isCurrent: false
  }
]

const getDeviceIcon = (type: string) => {}
  switch (type) {
    case 'mobile':
      return <DevicePhoneMobileIcon className="w-6 h-6" />
    case 'tablet':
      return <DevicePhoneMobileIcon className="w-6 h-6" />
    default:
      return <ComputerDesktopIcon className="w-6 h-6" />
  }
}

const getRelativeTime = (dateString: string) => {}
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hours ago`
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} days ago`
}

export default function SessionsPage() {
  const [showRevokeAll, setShowRevokeAll] = useState(false)

  const handleRevokeSession = (sessionId: string) => {}
    // In real app, call API to revoke session
    console.log('Revoking session:', sessionId)
  }

  const handleRevokeAllOther = () => {}
    // In real app, call API to revoke all other sessions
    console.log('Revoking all other sessions')
    setShowRevokeAll(false)
  }

  const activeSessions = sessions.filter(s => !s.isCurrent)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Active Sessions</h1>
          </div>
          <p className="text-white/70 text-lg">
            Manage your active login sessions across all devices
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-300 mb-1">Security Tip</h3>
              <p className="text-blue-200 text-sm">
                Review your active sessions regularly and revoke any that you don't recognize. 
                This helps keep your account secure.
              </p>
            </div>
          </div>
        </div>

        {/* Current Session */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Current Session</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  {getDeviceIcon(sessions[0].deviceType)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{sessions[0].deviceName}</h3>
                  <p className="text-green-400 text-sm font-medium mb-2">Current Session</p>
                  <div className="space-y-1 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <GlobeAltIcon className="w-4 h-4" />
                      <span>{sessions[0].browser}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{sessions[0].location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 text-center">🌐</span>
                      <span>{sessions[0].ipAddress}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Active now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Sessions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Other Sessions</h2>
            {activeSessions.length > 0 && (
              <button
                onClick={() => setShowRevokeAll(true)}
                className="text-red-400 hover:text-red-300 text-sm font-medium"
              >
                Revoke All Other Sessions
              </button>
            )}
          </div>

          <div className="space-y-4">
            {activeSessions.map(session => (
              <div
                key={session.id}
                className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/10 rounded-lg">
                      {getDeviceIcon(session.deviceType)}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{session.deviceName}</h3>
                      <p className="text-white/70 text-sm mb-2">
                        Last active {getRelativeTime(session.lastActive)}
                      </p>
                      <div className="space-y-1 text-sm text-white/70">
                        <div className="flex items-center gap-2">
                          <GlobeAltIcon className="w-4 h-4" />
                          <span>{session.browser}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{session.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 text-center">🌐</span>
                          <span>{session.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevokeSession(session.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activeSessions.length === 0 && (
            <div className="text-center py-12">
              <ShieldCheckIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/50 text-lg">
                No other active sessions found.
              </p>
              <p className="text-white/40">
                You're only logged in on this device.
              </p>
            </div>
          )}
        </div>

        {/* Session Statistics */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {sessions.length}
            </div>
            <div className="text-white/70">Total Sessions</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {sessions.filter(s => s.deviceType === &apos;desktop&apos;).length}
            </div>
            <div className="text-white/70">Desktop Sessions</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {sessions.filter(s => s.deviceType === &apos;mobile&apos; || s.deviceType === &apos;tablet').length}
            </div>
            <div className="text-white/70">Mobile Sessions</div>
          </div>
        </div>

        {/* Revoke All Confirmation Modal */}
        {showRevokeAll && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Revoke All Other Sessions?</h2>
              <p className="text-white/70 mb-6">
                This will sign you out of all other devices. You'll need to sign in again on those devices.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowRevokeAll(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRevokeAllOther}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Revoke All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
