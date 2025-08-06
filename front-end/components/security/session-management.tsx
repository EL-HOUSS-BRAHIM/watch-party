'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'
import { 
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  GlobeAltIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

interface SessionData {
  id: string
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'tv' | 'unknown'
  browser: string
  operatingSystem: string
  ipAddress: string
  location: {
    city: string
    region: string
    country: string
    countryCode: string
  }
  loginTime: string
  lastActivity: string
  isCurrent: boolean
  isSecure: boolean
  userAgent: string
}

interface SessionManagementProps {
  userId?: string
  showRevealOptions?: boolean
}

const deviceIcons = {
  desktop: ComputerDesktopIcon,
  mobile: DevicePhoneMobileIcon,
  tablet: DeviceTabletIcon,
  tv: ComputerDesktopIcon,
  unknown: ComputerDesktopIcon
}

export default function SessionManagement({ userId, showRevealOptions = true }: SessionManagementProps) {
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetchSessions()
  }, [userId])

  const fetchSessions = async () => {
    try {
      // Mock data - replace with actual API call
      const mockSessions: SessionData[] = [
        {
          id: 'current-session',
          deviceType: 'desktop',
          browser: 'Chrome 120.0',
          operatingSystem: 'Windows 11',
          ipAddress: '192.168.1.100',
          location: {
            city: 'New York',
            region: 'New York',
            country: 'United States',
            countryCode: 'US'
          },
          loginTime: '2024-01-15T09:00:00Z',
          lastActivity: new Date().toISOString(),
          isCurrent: true,
          isSecure: true,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        {
          id: 'mobile-session-1',
          deviceType: 'mobile',
          browser: 'Safari 17.2',
          operatingSystem: 'iOS 17.2',
          ipAddress: '10.0.0.45',
          location: {
            city: 'New York',
            region: 'New York',
            country: 'United States',
            countryCode: 'US'
          },
          loginTime: '2024-01-14T14:30:00Z',
          lastActivity: '2024-01-15T08:45:00Z',
          isCurrent: false,
          isSecure: true,
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X)'
        },
        {
          id: 'suspicious-session',
          deviceType: 'desktop',
          browser: 'Firefox 121.0',
          operatingSystem: 'Ubuntu 22.04',
          ipAddress: '203.0.113.45',
          location: {
            city: 'London',
            region: 'England',
            country: 'United Kingdom',
            countryCode: 'GB'
          },
          loginTime: '2024-01-13T22:15:00Z',
          lastActivity: '2024-01-14T03:20:00Z',
          isCurrent: false,
          isSecure: false,
          userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0)'
        },
        {
          id: 'tablet-session',
          deviceType: 'tablet',
          browser: 'Chrome 120.0',
          operatingSystem: 'Android 14',
          ipAddress: '192.168.1.105',
          location: {
            city: 'New York',
            region: 'New York',
            country: 'United States',
            countryCode: 'US'
          },
          loginTime: '2024-01-12T16:20:00Z',
          lastActivity: '2024-01-14T20:10:00Z',
          isCurrent: false,
          isSecure: true,
          userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-T970) AppleWebKit/537.36'
        }
      ]
      
      setSessions(mockSessions)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
      toast({
        title: 'Error',
        description: 'Failed to load session data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const revokeSession = async (sessionId: string) => {
    if (sessionId === 'current-session') {
      toast({
        title: 'Cannot Revoke',
        description: 'You cannot revoke your current session',
        variant: 'destructive'
      })
      return
    }

    setRevoking(sessionId)
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSessions(prev => prev.filter(session => session.id !== sessionId))
      
      toast({
        title: 'Session Revoked',
        description: 'The session has been successfully terminated',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke session',
        variant: 'destructive'
      })
    } finally {
      setRevoking(null)
    }
  }

  const revokeAllOtherSessions = async () => {
    const otherSessions = sessions.filter(s => !s.isCurrent)
    if (otherSessions.length === 0) {
      toast({
        title: 'No Sessions',
        description: 'No other sessions to revoke',
      })
      return
    }

    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSessions(prev => prev.filter(session => session.isCurrent))
      
      toast({
        title: 'Sessions Revoked',
        description: `${otherSessions.length} session(s) have been terminated`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke sessions',
        variant: 'destructive'
      })
    }
  }

  const toggleDetails = (sessionId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) return `${diffInDays}d ago`
    
    return formatDate(dateString).split(',')[0]
  }

  if (loading) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5" />
            Session Management
          </CardTitle>
          <CardDescription>Loading session data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-white/10 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const activeSessions = sessions.length
  const suspiciousSessions = sessions.filter(s => !s.isSecure).length

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">{activeSessions}</div>
            <div className="text-white/70 text-sm">Active Sessions</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {sessions.filter(s => s.isSecure).length}
            </div>
            <div className="text-white/70 text-sm">Secure Sessions</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold mb-1 ${suspiciousSessions > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {suspiciousSessions}
            </div>
            <div className="text-white/70 text-sm">Suspicious Sessions</div>
          </CardContent>
        </Card>
      </div>

      {/* Session Management */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage your active login sessions across all devices
              </CardDescription>
            </div>
            
            {sessions.filter(s => !s.isCurrent).length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Revoke All Others
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-black/90 border-white/20">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke All Other Sessions?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will sign you out of all other devices. You'll need to sign in again on those devices.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={revokeAllOtherSessions}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Revoke All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {sessions.map(session => {
              const DeviceIcon = deviceIcons[session.deviceType]
              const isExpanded = showDetails[session.id]
              
              return (
                <Card key={session.id} className={`border transition-colors ${
                  session.isCurrent 
                    ? 'border-green-500/30 bg-green-500/5' 
                    : !session.isSecure 
                    ? 'border-red-500/30 bg-red-500/5'
                    : 'border-white/10 bg-white/5'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="relative">
                          <DeviceIcon className="w-8 h-8 text-white/70" />
                          {session.isCurrent && (
                            <CheckCircleIcon className="w-4 h-4 text-green-500 absolute -bottom-1 -right-1" />
                          )}
                          {!session.isSecure && (
                            <ExclamationTriangleIcon className="w-4 h-4 text-red-500 absolute -bottom-1 -right-1" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-white">
                              {session.browser} on {session.operatingSystem}
                            </h4>
                            {session.isCurrent && (
                              <Badge className="bg-green-500/20 text-green-400 text-xs">
                                Current
                              </Badge>
                            )}
                            {!session.isSecure && (
                              <Badge className="bg-red-500/20 text-red-400 text-xs">
                                Suspicious
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-white/60">
                            <div className="flex items-center gap-1">
                              <MapPinIcon className="w-4 h-4" />
                              <span>{session.location.city}, {session.location.country}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              <span>Last active {getTimeAgo(session.lastActivity)}</span>
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-sm">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <span className="text-white/50">IP Address:</span>
                                  <span className="ml-2">{session.ipAddress}</span>
                                </div>
                                <div>
                                  <span className="text-white/50">Login Time:</span>
                                  <span className="ml-2">{formatDate(session.loginTime)}</span>
                                </div>
                                <div>
                                  <span className="text-white/50">Device Type:</span>
                                  <span className="ml-2 capitalize">{session.deviceType}</span>
                                </div>
                                <div>
                                  <span className="text-white/50">Security:</span>
                                  <span className={`ml-2 ${session.isSecure ? 'text-green-400' : 'text-red-400'}`}>
                                    {session.isSecure ? 'Secure' : 'Potentially Suspicious'}
                                  </span>
                                </div>
                              </div>
                              
                              {showRevealOptions && (
                                <details className="mt-2">
                                  <summary className="text-white/50 cursor-pointer hover:text-white/70">
                                    User Agent
                                  </summary>
                                  <code className="text-xs text-white/60 block mt-1 p-2 bg-white/5 rounded">
                                    {session.userAgent}
                                  </code>
                                </details>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDetails(session.id)}
                        >
                          {isExpanded ? 'Less' : 'Details'}
                        </Button>
                        
                        {!session.isCurrent && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                disabled={revoking === session.id}
                              >
                                {revoking === session.id ? 'Revoking...' : 'Revoke'}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-black/90 border-white/20">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will sign out this device immediately. The user will need to sign in again.
                                  <div className="mt-2 p-2 bg-white/5 rounded text-sm">
                                    <strong>Device:</strong> {session.browser} on {session.operatingSystem}<br/>
                                    <strong>Location:</strong> {session.location.city}, {session.location.country}
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => revokeSession(session.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Revoke Session
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg">Security Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>Regularly review and revoke sessions from unfamiliar devices or locations</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>Enable two-factor authentication for additional security</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>Always sign out when using public or shared computers</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>Contact support immediately if you notice suspicious activity</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
