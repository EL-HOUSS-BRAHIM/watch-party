"use client"

import { Check, Cloud, Folder, Trash } from "lucide-react"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'


  CloudArrowDownIcon,
  CloudArrowUpIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  FolderIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

interface DataCategory {}
  id: string
  name: string
  description: string
  size: string
  count: number
  required: boolean
  sensitive: boolean
}

interface ExportRequest {}
  id: string
  categories: string[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  requestedAt: string
  completedAt?: string
  downloadUrl?: string
  expiresAt?: string
  fileSize?: string
}

interface DataManagementProps {}
  userId?: string
}

const dataCategories: DataCategory[] = []
  {}
    id: 'profile',
    name: 'Profile Information',
    description: 'Basic profile data, settings, and preferences',
    size: '2.5 MB',
    count: 1,
    required: true,
    sensitive: false
  },
  {}
    id: 'watch_history',
    name: 'Watch History',
    description: 'Videos watched, watch time, and viewing preferences',
    size: '15.2 MB',
    count: 1248,
    required: false,
    sensitive: false
  },
  {}
    id: 'party_data',
    name: 'Watch Party Data',
    description: 'Parties created, joined, and participation data',
    size: '8.7 MB',
    count: 156,
    required: false,
    sensitive: false
  },
  {}
    id: 'social_data',
    name: 'Social Data',
    description: 'Friends, followers, and social interactions',
    size: '4.1 MB',
    count: 298,
    required: false,
    sensitive: true
  },
  {}
    id: 'messages',
    name: 'Messages',
    description: 'Direct messages and chat history',
    size: '12.8 MB',
    count: 2847,
    required: false,
    sensitive: true
  },
  {}
    id: 'payment_history',
    name: 'Payment History',
    description: 'Transaction history and billing information',
    size: '156 KB',
    count: 23,
    required: false,
    sensitive: true
  },
  {}
    id: 'achievements',
    name: 'Achievements & Progress',
    description: 'Earned achievements, progress, and statistics',
    size: '892 KB',
    count: 87,
    required: false,
    sensitive: false
  },
  {}
    id: 'uploaded_content',
    name: 'Uploaded Content',
    description: 'Videos and files uploaded by you',
    size: '2.1 GB',
    count: 45,
    required: false,
    sensitive: false
  }
]

export default function DataExportImport({ userId }: DataManagementProps) {}
  const [selectedCategories, setSelectedCategories] = useState<string[]>([&apos;profile&apos;])
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([]
    {}
      id: 'export-1',
      categories: ['profile', 'watch_history'],
      status: 'completed',
      requestedAt: '2024-01-10T14:30:00Z',
      completedAt: '2024-01-10T14:35:00Z',
      downloadUrl: '/api/exports/export-1.zip',
      expiresAt: '2024-01-17T14:35:00Z',
      fileSize: '17.7 MB'
    },
    {}
      id: 'export-2',
      categories: ['messages', 'social_data'],
      status: 'processing',
      requestedAt: '2024-01-15T09:15:00Z'
    }
  ])
  const [requesting, setRequesting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importing, setImporting] = useState(false)

  const handleCategoryToggle = (categoryId: string) => {}
    const category = dataCategories.find(c => c.id === categoryId)
    if (category?.required) return
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const calculateTotalSize = () => {}
    const selected = dataCategories.filter(c => selectedCategories.includes(c.id))
    const totalBytes = selected.reduce((acc, category) => {}
      const sizeStr = category.size
      const value = parseFloat(sizeStr)
      const unit = sizeStr.split(' ')[1]
      let bytes = value
      if (unit === 'KB') bytes *= 1024
      else if (unit === 'MB') bytes *= 1024 * 1024
      else if (unit === 'GB') bytes *= 1024 * 1024 * 1024
      return acc + bytes
    }, 0)

    if (totalBytes < 1024) return `${totalBytes.toFixed(0)} B`
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`
    if (totalBytes < 1024 * 1024 * 1024) return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(totalBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  const requestExport = async () => {
    if (selectedCategories.length === 0) {
      toast({title: 'No Categories Selected',
        description: 'Please select at least one data category to export.',
        variant: 'destructive'
      })
      return
    }

    setRequesting(true)
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000))

      const newExport: ExportRequest = { id: `export-${Date.now()}`,
        categories: [...selectedCategories],
        status: 'pending',
        requestedAt: new Date().toISOString()
      }

      setExportRequests(prev => [newExport, ...prev])

      toast({title: 'Export Requested',
        description: 'Your data export has been queued. You\'ll be notified when it\'s ready.',
      })

      // Simulate processing
      setTimeout(() => {}
        setExportRequests(prev => prev.map(req => 
          req.id === newExport.id
            ? { ...req, status: 'processing' }
            : req
        ))
      }, 3000)

    } catch (err) {
      toast({title: 'Export Failed',
        description: 'Failed to request data export. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setRequesting(false)
    }
  }

  const downloadExport = async (exportRequest: ExportRequest) => {}
    if (!exportRequest.downloadUrl) return
    try {
      // Mock download - replace with actual implementation
      const link = document.createElement('a')
      link.href = exportRequest.downloadUrl
      link.download = `watchparty-data-export-${exportRequest.id}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({title: 'Download Started',
        description: 'Your data export is being downloaded.',
      })
    } catch (err) {
      toast({title: 'Download Failed',
        description: 'Failed to download export. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const deleteAllData = async () => {
    setDeleting(true)
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 3000))

      toast({title: 'Account Deletion Initiated',
        description: 'Your account deletion request has been submitted. This process cannot be undone.',
        variant: 'destructive'
      })

      // In real implementation, this would redirect to a confirmation page
      // or log the user out after successful deletion
    } catch (err) {
      toast({title: 'Deletion Failed',
        description: 'Failed to delete account data. Please contact support.',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {}
    const file = event.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportProgress(0)

    try {
      // Mock import process with progress updates
      const progressInterval = setInterval(() => {}
        setImportProgress(prev => {}
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + Math.random() * 15
        })
      }, 500)

      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 5000))

      clearInterval(progressInterval)
      setImportProgress(100)

      toast({title: 'Import Completed',
        description: 'Your data has been successfully imported.',
      })

    } catch (err) {
      toast({title: 'Import Failed',
        description: 'Failed to import data. Please check the file format.',
        variant: 'destructive'
      })
    } finally {
      setTimeout(() => {}
        setImporting(false)
        setImportProgress(0)
      }, 2000)
    }
  }

  const formatDate = (dateString: string) => {}
    return new Date(dateString).toLocaleString('en-US', {}
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: ExportRequest['status']) => {}
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'processing': return 'text-blue-400'
      case 'pending': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      default: return 'text-white/70'
    }
  }

  const getStatusIcon = (status: ExportRequest['status']) => {}
    switch (status) {
      case 'completed': return CheckCircleIcon
      case 'processing': return ClockIcon
      case 'pending': return ClockIcon
      case 'failed': return ExclamationTriangleIcon
      default: return ClockIcon
    }
  }

  return (
    <div className="space-y-6">
      {/* Data Export Section */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudArrowDownIcon className="w-5 h-5" />
            Export Your Data
          </CardTitle>
          <CardDescription>
            Download a copy of your data in a portable format. This is useful for backups or if you want to transfer your data elsewhere.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Select Data Categories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dataCategories.map(category => (
                <div key={category.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                    disabled={category.required}
                  />
                  <div className="flex-1">
                    <Label htmlFor={category.id} className="cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{category.name}</span>
                        {category.required && (
                          <Badge variant="secondary" className="text-xs">Required</Badge>
                        )}
                        {category.sensitive && (
                          <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-400">
                            Sensitive
                          </Badge>
                        )}
                      </div>
                      <p className="text-white/60 text-sm">{category.description}</p>
                      <div className="text-white/50 text-xs mt-1">
                        {category.count} items • {category.size}
                      </div>
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Summary */}
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Selected Categories:</span>
                  <span className="ml-2">{selectedCategories.length}</span>
                </div>
                <div>
                  <span className="font-medium">Estimated Size:</span>
                  <span className="ml-2 text-blue-400">{calculateTotalSize()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={requestExport}
            disabled={requesting || selectedCategories.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
            {requesting ? 'Requesting Export...' : 'Request Data Export'}
          </Button>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderIcon className="w-5 h-5" />
            Export History
          </CardTitle>
          <CardDescription>
            View and download your previous data exports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {exportRequests.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No export requests yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exportRequests.map(request => {}
                const StatusIcon = getStatusIcon(request.status)
                return (
                  <Card key={request.id} className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3">
                          <StatusIcon className={`w-5 h-5 mt-0.5 ${getStatusColor(request.status)}`} />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                Export #{request.id.split('-')[1]}
                              </span>
                              <Badge variant="secondary" className={getStatusColor(request.status)}>
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-white/60 text-sm mb-2">
                              Categories: {request.categories.join(', ')}
                            </p>
                            <div className="text-white/50 text-xs">
                              Requested: {formatDate(request.requestedAt)}
                              {request.completedAt && (
                                <span> • Completed: {formatDate(request.completedAt)}</span>
                              )}
                              {request.fileSize && (
                                <span> • Size: {request.fileSize}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {request.status === 'completed' && request.downloadUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadExport(request)}
                          >
                            <CloudArrowDownIcon className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Import Section */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudArrowUpIcon className="w-5 h-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Import previously exported data or migrate from another platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".zip,.json"
                onChange={handleFileImport}
                className="hidden"
                id="import-file"
                disabled={importing}
              />
              <Label
                htmlFor="import-file"
                className="cursor-pointer space-y-2 block"
              >
                <CloudArrowUpIcon className="w-12 h-12 mx-auto text-white/40" />
                <div>
                  <p className="text-white font-medium">
                    {importing ? 'Importing...' : 'Click to upload data file'}
                  </p>
                  <p className="text-white/60 text-sm">
                    Supports ZIP and JSON files up to 100MB
                  </p>
                </div>
              </Label>
            </div>

            {importing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing data...</span>
                  <span>{Math.round(importProgress)}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-red-500/5 border-red-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <ExclamationTriangleIcon className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that will permanently delete your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <h4 className="font-semibold text-red-400 mb-2">Delete All Data</h4>
              <p className="text-white/70 text-sm mb-4">
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={deleting}>
                    <TrashIcon className="w-4 h-4 mr-2" />
                    {deleting ? 'Deleting...' : 'Delete All My Data'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-black/90 border-red-500/30">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-400">
                      Delete All Data?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will permanently delete your account and all associated data including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Profile information and settings</li>
                        <li>Watch history and preferences</li>
                        <li>Watch party data and social connections</li>
                        <li>Messages and uploaded content</li>
                        <li>Payment history and achievements</li>
                      </ul>
                      <strong className="block mt-3 text-red-400">
                        This action cannot be undone.
                      </strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={deleteAllData}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Yes, Delete Everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
