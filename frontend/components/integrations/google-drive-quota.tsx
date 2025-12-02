'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'

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
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 19.5h7.8L12 15l2.2 4.5H22L12 2zm0 6l4.5 9h-9l4.5-9z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Google Drive Storage</h3>
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-2 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <span className="text-red-600 text-xl">⚠</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Google Drive Storage</h3>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!quota) return null

  const isNearLimit = quota.usage_percent > 80
  const isAtLimit = quota.usage_percent > 95

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 19.5h7.8L12 15l2.2 4.5H22L12 2zm0 6l4.5 9h-9l4.5-9z"/>
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Google Drive Storage</h3>
          <p className="text-sm text-gray-500">{quota.user_email}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 font-medium">
            {quota.usage_gb.toFixed(2)} GB used
          </span>
          <span className="text-gray-600 font-medium">
            {quota.limit_gb.toFixed(2)} GB total
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all ${
              isAtLimit 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : isNearLimit 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                  : 'bg-gradient-to-r from-blue-500 to-green-500'
            }`}
            style={{ width: `${Math.min(quota.usage_percent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{quota.usage_percent.toFixed(1)}% used</span>
          <span>{((quota.remaining / (1024**3))).toFixed(2)} GB remaining</span>
        </div>
      </div>

      {/* Warnings */}
      {isAtLimit && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-red-600 text-lg flex-shrink-0">⚠</span>
            <div>
              <p className="text-sm font-semibold text-red-900 mb-1">Storage Almost Full!</p>
              <p className="text-xs text-red-700">
                Videos may fail to stream. Consider deleting unused files or upgrading your Google Drive storage.
              </p>
            </div>
          </div>
        </div>
      )}

      {isNearLimit && !isAtLimit && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 text-lg flex-shrink-0">💡</span>
            <div>
              <p className="text-sm font-semibold text-yellow-900 mb-1">Storage Getting Low</p>
              <p className="text-xs text-yellow-700">
                You're using over 80% of your Google Drive quota.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* API Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-semibold text-blue-900 mb-2">📊 API Usage Limits:</p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Google Drive API: 1,000 requests per 100 seconds</li>
          <li>• Each video stream uses API quota</li>
          <li>• Quota errors reset automatically after a few minutes</li>
          <li>• Authenticated streaming ensures best compatibility</li>
        </ul>
      </div>
    </div>
  )
}
