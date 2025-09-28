"use client"

import { useState, useEffect , useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/hooks/use-api"
import { formatDistanceToNow } from "date-fns"

} from "lucide-react"

  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  MapPin, 
  Clock, 
  LogOut, 
  AlertTriangle,
  Shield,
  RefreshCw
interface Session {}
  id: string
  device_type: "desktop" | "mobile" | "tablet" | "unknown"
  browser: string
  os: string
  ip_address: string
  location: {}
    city?: string
    country?: string
    region?: string
  }
  last_activity: string
  created_at: string
  is_current: boolean
  user_agent: string
}

const deviceIcons = { desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
  unknown: Globe,
}

export function SessionsManager() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRevoking, setIsRevoking] = useState<string | null>(null)
  const [isRevokingAll, setIsRevokingAll] = useState(false)
  const { toast } = useToast()
  const api = useApi()

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      setIsLoading(true)
      const response = await api.get("/auth/sessions/")
      setSessions((response.data as Record<string, unknown>).sessions || [])
    } catch (err) {
      toast({title: "Error",
        description: "Failed to load sessions",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const revokeSession = async (sessionId: string) => {}
    setIsRevoking(sessionId)
    try {
      await api.delete(`/auth/sessions/${sessionId}/`)
      setSessions(sessions.filter(s => s.id !== sessionId))
      toast({title: "Session revoked",
        description: "The session has been successfully terminated",
      })
    } catch (err) {
      toast({title: "Error",
        description: "Failed to revoke session",
        variant: "destructive"
      })
    } finally {
      setIsRevoking(null)
    }
  }

  const revokeAllOtherSessions = async () => {
    setIsRevokingAll(true)
    try {
      await api.post("/auth/sessions/revoke-all/")
      setSessions(sessions.filter(s => s.is_current))
      toast({title: "Sessions revoked",
        description: "All other sessions have been terminated",
      })
    } catch (err) {
      toast({title: "Error",
        description: "Failed to revoke sessions",
        variant: "destructive"
      })
    } finally {
      setIsRevokingAll(false)
    }
  }

  const getLocationString = (location: Session["location"]) => {}
    const parts = [location.city, location.region, location.country].filter(Boolean)
    return parts.length > 0 ? parts.join(&quot;, &quot;) : &quot;Unknown location"
  }

  const getDeviceString = (session: Session) => {}
    const parts = []
    if (session.browser) parts.push(session.browser)
    if (session.os) parts.push(session.os)
    return parts.join(" on ") || "Unknown device"
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading sessions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentSession = sessions.find(s => s.is_current)
  const otherSessions = sessions.filter(s => !s.is_current)

  return (
    <div className="space-y-6">
      {/* Security Alert */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          If you see any sessions you don't recognize, revoke them immediately and consider changing your password.
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={fetchSessions}
          disabled={isLoading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>

        {otherSessions.length > 0 && (
          <Button
            variant="destructive"
            onClick={revokeAllOtherSessions}
            disabled={isRevokingAll}
          >
            {isRevokingAll ? "Revoking..." : `Revoke All Other Sessions (${otherSessions.length})`}
          </Button>
        )}
      </div>

      {/* Current Session */}
      {currentSession && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  {(() => {}
                    const Icon = deviceIcons[currentSession.device_type]
                    return <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  })()}
                </div>
                <div>
                  <CardTitle className="text-lg">Current Session</CardTitle>
                  <CardDescription>This device</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Active now
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span>{getDeviceString(currentSession)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{getLocationString(currentSession.location)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Started {formatDistanceToNow(new Date(currentSession.created_at))} ago</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground">IP:</span>
                <code className="text-xs bg-muted px-1 py-0.5 rounded">{currentSession.ip_address}</code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Sessions */}
      {otherSessions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold">Other Sessions</h3>
            <Badge variant="outline">{otherSessions.length}</Badge>
          </div>

          {otherSessions.map((session) => {}
            const Icon = deviceIcons[session.device_type]
            const lastActivity = new Date(session.last_activity)
            const isRecent = Date.now() - lastActivity.getTime() < 24 * 60 * 60 * 1000 // 24 hours
            return (
              <Card key={session.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium truncate">{getDeviceString(session)}</h4>
                          {isRecent && (
                            <Badge variant="secondary" className="text-xs">Recent</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{getLocationString(session.location)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Last active {formatDistanceToNow(lastActivity)} ago</span>
                          </div>
                          <div className="flex items-center space-x-1 md:col-span-2">
                            <span>IP:</span>
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">{session.ip_address}</code>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => revokeSession(session.id)}
                      disabled={isRevoking === session.id}
                    >
                      {isRevoking === session.id ? (
                        "Revoking..."
                      ) : (
                        <>
                          <LogOut className="w-4 h-4 mr-1" />
                          Revoke
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {otherSessions.length === 0 && (
        <Card>
          <CardContent className="text-center p-8">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No other active sessions</h3>
            <p className="text-muted-foreground">
              You're only signed in on this device. Your account is secure!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Security Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Always sign out from shared or public computers</li>
            <li>Regularly review your active sessions</li>
            <li>Revoke any sessions you don&apos;t recognize immediately</li>
            <li>Enable two-factor authentication for extra security</li>
            <li>Use strong, unique passwords</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
