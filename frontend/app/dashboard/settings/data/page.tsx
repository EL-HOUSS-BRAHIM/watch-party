'use client'

import { useState } from 'react'
import { 
  DocumentArrowDownIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CalendarIcon,
  InformationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface DataExportRequest {
  id: string
  type: 'profile' | 'videos' | 'parties' | 'all'
  status: 'pending' | 'processing' | 'ready' | 'expired'
  requestedAt: string
  completedAt?: string
  downloadUrl?: string
  expiresAt?: string
  size?: string
}

const exportRequests: DataExportRequest[] = [
  {
    id: '1',
    type: 'all',
    status: 'ready',
    requestedAt: '2024-03-20T10:00:00Z',
    completedAt: '2024-03-20T10:30:00Z',
    downloadUrl: '/downloads/export-all-20240320.zip',
    expiresAt: '2024-03-27T10:30:00Z',
    size: '2.4 MB'
  },
  {
    id: '2',
    type: 'videos',
    status: 'processing',
    requestedAt: '2024-03-21T14:15:00Z'
  }
]

const exportTypes = [
  {
    key: 'profile',
    label: 'Profile Data',
    description: 'Your account information, settings, and preferences'
  },
  {
    key: 'videos',
    label: 'Video Data',
    description: 'Your uploaded videos, metadata, and analytics'
  },
  {
    key: 'parties',
    label: 'Watch Party Data',
    description: 'Your watch party history, invitations, and participation'
  },
  {
    key: 'all',
    label: 'All Data',
    description: 'Complete export of all your WatchParty data'
  }
]

const getStatusColor = (status: string) => {
  switch (status) {
    case 'ready':
      return 'text-green-400'
    case 'processing':
      return 'text-yellow-400'
    case 'expired':
      return 'text-red-400'
    default:
      return 'text-blue-400'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'ready':
      return 'Ready for Download'
    case 'processing':
      return 'Processing...'
    case 'expired':
      return 'Expired'
    default:
      return 'Pending'
  }
}

export default function DataManagementPage() {
  const [selectedExportType, setSelectedExportType] = useState<string>(&apos;')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleExportData = async () => {
    if (!selectedExportType) return

    setIsExporting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsExporting(false)
    setSelectedExportType('')
    
    // In real app, this would trigger the export process
    console.log('Exporting data type:', selectedExportType)
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) return

    setIsDeleting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsDeleting(false)
    
    // In real app, this would delete the account
    console.log('Deleting account')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpiringSoon = (expiresAt: string) => {
    const expiry = new Date(expiresAt)
    const now = new Date()
    const diffInHours = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diffInHours < 24
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Data Management</h1>
          </div>
          <p className="text-white/70 text-lg">
            Export your data or delete your account in compliance with privacy regulations
          </p>
        </div>

        {/* GDPR Notice */}
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-6 h-6 text-blue-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-300 mb-2">Your Data Rights</h3>
              <p className="text-blue-200 text-sm mb-3">
                Under GDPR and other privacy laws, you have the right to:
              </p>
              <ul className="text-blue-200 text-sm space-y-1 list-disc list-inside">
                <li>Request a copy of all data we have about you</li>
                <li>Have your data corrected if it&apos;s inaccurate</li>
                <li>Request deletion of your account and associated data</li>
                <li>Withdraw consent for data processing</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Export Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Export Your Data</h2>
          
          {/* Export Type Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">What would you like to export?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exportTypes.map(type => (
                <button
                  key={type.key}
                  onClick={() => setSelectedExportType(type.key)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedExportType === type.key
                      ? 'border-blue-400 bg-blue-500/20'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <h4 className="font-semibold text-white mb-1">{type.label}</h4>
                  <p className="text-white/70 text-sm">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Export Button */}
          {selectedExportType && (
            <div className="mb-6">
              <button
                onClick={handleExportData}
                disabled={isExporting}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                {isExporting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing Export...
                  </>
                ) : (
                  <>
                    <DocumentArrowDownIcon className="w-5 h-5" />
                    Request Export
                  </>
                )}
              </button>
            </div>
          )}

          {/* Export History */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Export History</h3>
            <div className="space-y-4">
              {exportRequests.map(request => (
                <div
                  key={request.id}
                  className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white mb-1">
                        {exportTypes.find(t => t.key === request.type)?.label}
                      </h4>
                      <div className="space-y-1 text-sm text-white/70">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Requested {formatDate(request.requestedAt)}</span>
                        </div>
                        {request.completedAt && (
                          <div className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span>Completed {formatDate(request.completedAt)}</span>
                          </div>
                        )}
                        {request.size && (
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 text-center">📦</span>
                            <span>Size: {request.size}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={`font-medium ${getStatusColor(request.status)}`}>
                        {getStatusLabel(request.status)}
                      </div>
                      
                      {request.status === 'ready' && request.downloadUrl && (
                        <div className="flex flex-col items-end gap-2">
                          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                            Download
                          </button>
                          {request.expiresAt && (
                            <span className={`text-xs ${
                              isExpiringSoon(request.expiresAt) ? 'text-red-400' : 'text-white/60'
                            }`}>
                              Expires {formatDate(request.expiresAt)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {exportRequests.length === 0 && (
              <div className="text-center py-8 text-white/50">
                <DocumentArrowDownIcon className="w-12 h-12 mx-auto mb-2" />
                <p>No export requests yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Account Deletion Section */}
        <div className="border-t border-red-500/30 pt-12">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-6">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-400 mt-0.5" />
              <div>
                <h2 className="text-2xl font-bold text-red-300 mb-2">Delete Account</h2>
                <p className="text-red-200 mb-4">
                  Permanently delete your WatchParty account and all associated data.
                </p>
                <div className="text-red-200 text-sm space-y-1">
                  <p><strong>This action cannot be undone.</strong> When you delete your account:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>All your videos will be removed</li>
                    <li>Your watch party history will be deleted</li>
                    <li>Your profile and settings will be permanently removed</li>
                    <li>You&apos;ll be removed from all friend lists</li>
                    <li>Any premium subscriptions will be cancelled</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <TrashIcon className="w-5 h-5" />
              Delete My Account
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md">
              <div className="text-center mb-6">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Delete Account?</h2>
                <p className="text-white/70">
                  This action is permanent and cannot be undone. All your data will be lost.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-white font-medium mb-2">
                  Enter your password to confirm:
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full px-4 py-2 bg-white/10 rounded-lg border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-red-400"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeletePassword('')
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={!deletePassword || isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
