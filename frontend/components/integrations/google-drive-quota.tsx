'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { HardDrive, AlertTriangle, Info } from 'lucide-react'

interface QuotaData {
  limit: number
  usage: number
  remaining: number
  limit_gb: number
  usage_gb: number
  usage_percent: number
  user_email: string
}

export function GoogleDriveQuota() {
  const [quota, setQuota] = useState<QuotaData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadQuota()
  }, [])

  const loadQuota = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.integrations.googleDrive.getQuota()
      setQuota(response.data)
    } catch (err: any) {
      console.error('Failed to load quota:', err)
      setError(err.message || 'Failed to load quota information')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Google Drive Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Google Drive Storage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!quota) return null

  const isNearLimit = quota.usage_percent > 80
  const isAtLimit = quota.usage_percent > 95

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Google Drive Storage
        </CardTitle>
        <CardDescription>
          {quota.user_email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Storage usage bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {quota.usage_gb.toFixed(2)} GB used
            </span>
            <span className="text-muted-foreground">
              {quota.limit_gb.toFixed(2)} GB total
            </span>
          </div>
          <Progress 
            value={quota.usage_percent} 
            className={`h-2 ${isAtLimit ? 'bg-red-200' : isNearLimit ? 'bg-yellow-200' : ''}`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{quota.usage_percent.toFixed(1)}% used</span>
            <span>{((quota.remaining / (1024**3))).toFixed(2)} GB remaining</span>
          </div>
        </div>

        {/* Warnings */}
        {isAtLimit && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Storage is almost full! Videos may fail to stream. Consider deleting unused files or upgrading your Google Drive storage.
            </AlertDescription>
          </Alert>
        )}

        {isNearLimit && !isAtLimit && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Storage is getting low. You're using over 80% of your Google Drive quota.
            </AlertDescription>
          </Alert>
        )}

        {/* API Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">API Usage Notes:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Google Drive API has a quota of 1,000 requests per 100 seconds per user</li>
            <li>Each video stream consumes API quota</li>
            <li>If you hit the limit, you'll see "Quota exceeded" errors</li>
            <li>Quota resets automatically - wait a few minutes and try again</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
