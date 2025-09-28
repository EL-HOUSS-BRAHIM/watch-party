import { Check, CheckCircle, Clock, MapPin, Shield } from "lucide-react"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'
import { usersAPI } from '@/lib/api'
import {}
import { CheckCircleIcon } from '@heroicons/react/24/solid'

'use client'
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  GlobeAltIcon,
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  XMarkIcon;
} from '@heroicons/react/24/outline'
interface SessionData {}
  id: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'tv' | 'unknown'
  browser: string;
  operatingSystem: string;
  ipAddress: string;
  location: {}
    city: string;
    region: string;
    country: string;
    countryCode: string;
  }
  loginTime: string;
  lastActivity: string;
  isCurrent: boolean;
  isSecure: boolean;
  userAgent: string;
}

interface SessionManagementProps {}
  userId?: string;
  showRevealOptions?: boolean;
}

const deviceIcons = { desktop: ComputerDesktopIcon,
  mobile: DevicePhoneMobileIcon,
  tablet: DeviceTabletIcon,
  tv: ComputerDesktopIcon,
  unknown: ComputerDesktopIcon;
}

const generateSessionId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto;
    ? crypto.randomUUID()
    : `session-${Math.random().toString(36).slice(2, 10)}`

const guessBrowserFromUserAgent = (userAgent: string) => {}
  const ua = userAgent.toLowerCase()
  if (ua.includes('edg')) return 'Microsoft Edge'
  if (ua.includes('chrome') && !ua.includes('chromium')) return 'Chrome'
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari'
  if (ua.includes('firefox')) return 'Firefox'
  if (ua.includes('opr') || ua.includes('opera')) return 'Opera'
  return 'Unknown Browser'
}

const guessOsFromUserAgent = (userAgent: string) => {}
  const ua = userAgent.toLowerCase()
  if (ua.includes('windows nt')) return 'Windows'
  if (ua.includes('mac os') || ua.includes('macintosh')) return 'macOS'
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) return 'iOS'
  if (ua.includes('android')) return 'Android'
  if (ua.includes('linux')) return 'Linux'
  return 'Unknown OS'
}

const determineDeviceType = (session: unknown, userAgent: string): SessionData['deviceType'] => {}
  const candidate = `${session?.device_type ?? ''} ${session?.device ?? ''} ${userAgent}`.toLowerCase()
  if (candidate.includes('mobile') || candidate.includes('iphone') || candidate.includes('android')) {}
    return 'mobile'
  }
  if (candidate.includes('tablet') || candidate.includes('ipad')) {}
    return 'tablet'
  }
  if (candidate.includes('tv') || candidate.includes('smart-tv')) {}
    return 'tv'
  }
  if (candidate.trim() === '') {}
    return 'unknown'
  }
  return 'desktop'
}

const parseLocation = (session: unknown): SessionData['location'] => {}
  const locationData = session?.location ?? session?.geo ?? session?.ip_location ?? session?.metadata?.location;
  const base: SessionData['location'] = { city: 'Unknown',
    region: '',
    country: 'Unknown',
    countryCode: ''
  }

  if (!locationData) {
    return base;
  }

  if (typeof locationData === 'string') {
    const parts = locationData.split(',').map(part => part.trim()).filter(Boolean)
    if (parts.length === 1) {
      return {
        ...base,
        city: parts[0] || base.city,
        country: parts[0] || base.country,
        countryCode: session?.country_code ?? ''
      }
    }

    if (parts.length === 2) {
      return {
        ...base,
        city: parts[0] || base.city,
        country: parts[1] || base.country,
        countryCode: session?.country_code ?? ''
      }
    }

    return {
      city: parts[0] || base.city,
      region: parts[1] || base.region,
      country: parts[2] || base.country,
      countryCode: session?.country_code ?? ''
    }
  }

  if (typeof locationData === 'object' && locationData !== null) {
    return {
      city: locationData.city ?? locationData.town ?? base.city,
      region: locationData.region ?? locationData.state ?? locationData.province ?? base.region,
      country: locationData.country ?? locationData.country_name ?? locationData.code ?? base.country,
      countryCode:
        locationData.country_code ?? locationData.code ?? locationData.countryCode ?? session?.country_code ?? base.countryCode;
    }
  }

  return base;
}

const resolveBrowser = (session: unknown, userAgent: string) => {}
  if (typeof session?.browser === 'string' && session.browser.trim().length > 0) {}
    return session.browser;
  }
  if (typeof session?.client === 'string' && session.client.trim().length > 0) {}
    return session.client;
  }
  if (typeof session?.device === 'string' && session.device.trim().length > 0) {}
    const [firstPart] = session.device.split(/ on /i)
    if (firstPart) {
      return firstPart;
    }
  }
  return guessBrowserFromUserAgent(userAgent)
}

const resolveOperatingSystem = (session: unknown, userAgent: string) => {}
  if (typeof session?.operating_system === 'string' && session.operating_system.trim().length > 0) {}
    return session.operating_system;
  }
  if (typeof session?.os === 'string' && session.os.trim().length > 0) {}
    return session.os;
  }
  if (typeof session?.platform === 'string' && session.platform.trim().length > 0) {}
    return session.platform;
  }
  if (typeof session?.device === 'string' && session.device.includes(' on ')) {}
    const [, osPart] = session.device.split(/ on /i)
    if (osPart) {
      return osPart;
    }
  }
  return guessOsFromUserAgent(userAgent)
}

const determineSecurityState = (session: unknown) => {}
  if (typeof session?.is_secure === 'boolean') {
    return session.is_secure;
  }
  if (typeof session?.is_suspicious === 'boolean') {
    return !session.is_suspicious;
  }
  if (typeof session?.risk_level === 'string') {
    const risk = session.risk_level.toLowerCase()
    return !['high', 'critical'].includes(risk)
  }
  return true;
}

const normalizeSession = (session: unknown): SessionData => {}
  const userAgent: string = session?.user_agent ?? session?.userAgent ?? ''
  const loginTime = session?.login_time ?? session?.created_at ?? session?.logged_in_at ?? new Date().toISOString()
  const lastActivity = session?.last_activity ?? session?.last_active_at ?? session?.updated_at ?? loginTime;
  return {
    id: String(session?.id ?? session?.session_id ?? session?.key ?? generateSessionId()),
    deviceType: determineDeviceType(session, userAgent),
    browser: resolveBrowser(session, userAgent) || 'Unknown Browser',
    operatingSystem: resolveOperatingSystem(session, userAgent) || 'Unknown OS',
    ipAddress: session?.ip_address ?? session?.ip ?? 'Unknown IP',
    location: parseLocation(session),
    loginTime,
    lastActivity,
    isCurrent: Boolean(session?.is_current ?? session?.current ?? false),
    isSecure: determineSecurityState(session),
    userAgent: userAgent || 'Unknown user agent'
  }
}

export default function SessionManagement({ userId, showRevealOptions = true }: SessionManagementProps) {}
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [revokingAll, setRevokingAll] = useState(false)
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetchSessions()
  }, [userId])

  const fetchSessions = async () => {
    setLoading(true)
    try {
      if (typeof usersAPI?.getSessions !== 'function') {
        throw new Error('Session service unavailable')
      }

      const response = await usersAPI.getSessions()
      const normalized = Array.isArray(response) ? response.map(normalizeSession) : []
      setSessions(normalized)
    } } catch {
      console.error('Failed to fetch sessions:', error)
      toast({}
        title: 'Error',
        description: 'Failed to load session data',
        variant: 'destructive'
      })
      setSessions([])
    } finally {}
      setLoading(false)
    }
  }

  const revokeSession = async (sessionId: string) => {}
    const targetSession = sessions.find(session => session.id === sessionId)
    if (targetSession?.isCurrent) {
      toast({}
        title: 'Cannot Revoke',
        description: 'You cannot revoke your current session',
        variant: 'destructive'
      })
      return;
    }

    setRevoking(sessionId)
    try {
      if (typeof usersAPI?.deleteSession !== 'function') {
        throw new Error('Session service unavailable')
      }

      await usersAPI.deleteSession(sessionId)

      setSessions(prev => prev.filter(session => session.id !== sessionId))

      toast({}
        title: 'Session Revoked',
        description: 'The session has been successfully terminated',
      })
    } } catch {
      console.error('Failed to revoke session:', error)
      toast({}
        title: 'Error',
        description: 'Failed to revoke session',
        variant: 'destructive'
      })
    } finally {}
      setRevoking(null)
    }
  }

  const revokeAllOtherSessions = async () => {
    const otherSessions = sessions.filter(s => !s.isCurrent)
    if (otherSessions.length === 0) {
      toast({}
        title: 'No Sessions',
        description: 'No other sessions to revoke',
      })
      return;
    }

    try {
      setRevokingAll(true)

      if (typeof usersAPI?.revokeAllSessions !== 'function') {
        throw new Error('Session service unavailable')
      }

      await usersAPI.revokeAllSessions()

      setSessions(prev => prev.filter(session => session.isCurrent))

      toast({}
        title: 'Sessions Revoked',
        description: `${otherSessions.length} session(s) have been terminated`,
      })
    } } catch {
      console.error('Failed to revoke sessions:', error)
      toast({}
        title: 'Error',
        description: 'Failed to revoke sessions',
        variant: 'destructive'
      })
    } finally {}
      setRevokingAll(false)
    }
  }

  const toggleDetails = (sessionId: string) => {}
    setShowDetails(prev => ({}
      ...prev,
      [sessionId]: !prev[sessionId]
    }))
  }

  const formatDate = (dateString: string) => {}
    return new Date(dateString).toLocaleString('en-US', {}
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })
  }

  const getTimeAgo = (dateString: string) => {}
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
            Session Management;
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

  const activeSessions = sessions.length;
  const suspiciousSessions = sessions.filter(s => !s.isSecure).length;
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
            <div className={`text-2xl font-bold mb-1 ${suspiciousSessions > 0 ? &apos;text-red-400&apos; : &apos;text-green-400'}`}>
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
                Active Sessions;
              </CardTitle>
              <CardDescription>
                Manage your active login sessions across all devices;
              </CardDescription>
            </div>
            {sessions.filter(s => !s.isCurrent).length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={revokingAll}>
                    {revokingAll ? 'Revoking...' : 'Revoke All Others'}
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
                    <AlertDialogAction;
                      onClick={revokeAllOtherSessions}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={revokingAll}
                    >
                      {revokingAll ? 'Revoking...' : 'Revoke All'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map(session => {}
              const DeviceIcon = deviceIcons[session.deviceType]
              const isExpanded = showDetails[session.id]
              return (
                <Card key={session.id} className={`border transition-colors ${}
                  session.isCurrent;
                    ? 'border-green-500/30 bg-green-500/5' 
                    : !session.isSecure;
                    ? 'border-red-500/30 bg-red-500/5'
                    : 'border-white/10 bg-white/5' />
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
                                Current;
                              </Badge>
                            )}
                            {!session.isSecure && (
                              <Badge className="bg-red-500/20 text-red-400 text-xs">
                                Suspicious;
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
                                    User Agent;
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
                        <Button;
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDetails(session.id)}
                        >
                          {isExpanded ? 'Less' : 'Details'}
                        </Button>
                        {!session.isCurrent && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button;
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
                                <AlertDialogAction;
                                  onClick={() => revokeSession(session.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={revoking === session.id}
                                >
                                  {revoking === session.id ? 'Revoking...' : 'Revoke Session'}
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
