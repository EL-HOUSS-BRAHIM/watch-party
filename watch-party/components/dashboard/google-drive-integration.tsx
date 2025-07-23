/**
 * Google Drive connection and integration components
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { 
  Cloud, 
  CloudOff, 
  Link, 
  Unlink, 
  Check, 
  X, 
  RefreshCw,
  Info,
  ExternalLink,
  Shield,
  HardDrive
} from 'lucide-react'

interface DriveStatus {
  connected: boolean
  folder_id?: string
}

export const GoogleDriveIntegration: React.FC = () => {
  const [status, setStatus] = useState<DriveStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkDriveStatus()
  }, [])

  const checkDriveStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/google-drive/status/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStatus({
          connected: data.connected,
          folder_id: data.folder_id
        })
      }
    } catch (err) {
      console.error('Failed to check Google Drive status:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    try {
      setConnecting(true)

      // Get authorization URL
      const response = await fetch('/api/auth/google-drive/auth/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to get authorization URL')
      }

      const data = await response.json()
      
      if (data.success && data.authorization_url) {
        // Open authorization URL in a popup
        const popup = window.open(
          data.authorization_url,
          'google-drive-auth',
          'width=500,height=600,scrollbars=yes,resizable=yes'
        )

        // Listen for popup to close or send message
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed)
            setConnecting(false)
            // Check status after popup closes
            setTimeout(checkDriveStatus, 1000)
          }
        }, 1000)

        // Listen for messages from popup (if implementing client-side callback)
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return
          
          if (event.data.type === 'google-drive-auth-success') {
            popup?.close()
            window.removeEventListener('message', messageListener)
            handleAuthCallback(event.data.code, event.data.state)
          }
        }
        
        window.addEventListener('message', messageListener)
      } else {
        throw new Error('Failed to get authorization URL')
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to connect to Google Drive',
        variant: 'destructive'
      })
      setConnecting(false)
    }
  }

  const handleAuthCallback = async (code: string, state: string) => {
    try {
      const response = await fetch('/api/auth/google-drive/auth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ code, state })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Google Drive connected successfully'
        })
        await checkDriveStatus()
      } else {
        throw new Error(data.message || 'Failed to connect')
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to complete Google Drive connection',
        variant: 'destructive'
      })
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Drive? You will lose access to your uploaded movies.')) {
      return
    }

    try {
      setDisconnecting(true)

      const response = await fetch('/api/auth/google-drive/disconnect/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Google Drive disconnected successfully'
        })
        setStatus({ connected: false })
      } else {
        throw new Error(data.message || 'Failed to disconnect')
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect Google Drive',
        variant: 'destructive'
      })
    } finally {
      setDisconnecting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cloud className="h-5 w-5 mr-2" />
            Google Drive Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Cloud className="h-5 w-5 mr-2" />
            Google Drive Integration
          </div>
          <Badge variant={status?.connected ? 'default' : 'secondary'}>
            {status?.connected ? (
              <Check className="h-3 w-3 mr-1" />
            ) : (
              <X className="h-3 w-3 mr-1" />
            )}
            {status?.connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Connect your Google Drive to upload and manage movies for watch parties
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status?.connected ? (
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your Google Drive is connected. Movies are stored in the "Watch Party Movies" folder.
                {status.folder_id && (
                  <div className="mt-2">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => window.open(`https://drive.google.com/drive/folders/${status.folder_id}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View folder in Google Drive
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={checkDriveStatus}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleDisconnect}
                disabled={disconnecting}
              >
                {disconnecting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Unlink className="h-4 w-4 mr-2" />
                )}
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <CloudOff className="h-4 w-4" />
              <AlertDescription>
                Connect your Google Drive to start uploading and managing movies for your watch parties.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <h4 className="font-medium">What you'll get:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <HardDrive className="h-4 w-4 mr-2 text-green-500" />
                  Store movies directly in your Google Drive
                </li>
                <li className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-green-500" />
                  Keep full control of your files
                </li>
                <li className="flex items-center">
                  <Cloud className="h-4 w-4 mr-2 text-green-500" />
                  Stream movies without using our servers
                </li>
              </ul>
            </div>

            <Button 
              onClick={handleConnect}
              disabled={connecting}
              className="w-full"
            >
              {connecting ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Link className="h-4 w-4 mr-2" />
              )}
              Connect Google Drive
            </Button>

            <GoogleDrivePermissions />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const GoogleDrivePermissions: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" size="sm" className="text-xs">
          <Info className="h-3 w-3 mr-1" />
          What permissions are required?
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Google Drive Permissions</DialogTitle>
          <DialogDescription>
            We request the following permissions to provide the best experience:
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <HardDrive className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Create and manage files</h4>
                <p className="text-sm text-gray-600">
                  Upload movies to a dedicated "Watch Party Movies" folder in your Drive
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Cloud className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Read file information</h4>
                <p className="text-sm text-gray-600">
                  List and display your movies with metadata like duration and size
                </p>
              </div>
            </div>
          </div>
          
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              We never store your Google Drive files on our servers. All streaming is done directly from your Drive.
            </AlertDescription>
          </Alert>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GoogleDriveIntegration
