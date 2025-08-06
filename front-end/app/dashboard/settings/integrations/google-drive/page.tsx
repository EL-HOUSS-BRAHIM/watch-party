'use client'

import { useState } from 'react'
import { 
  CloudIcon,
  FolderIcon,
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface GoogleDriveFolder {
  id: string
  name: string
  type: 'folder' | 'file'
  size?: string
  modified: string
  synced: boolean
  path: string
}

const mockFolders: GoogleDriveFolder[] = [
  {
    id: '1',
    name: 'WatchParty Videos',
    type: 'folder',
    modified: '2024-03-20',
    synced: true,
    path: '/WatchParty Videos'
  },
  {
    id: '2',
    name: 'movie-collection.mp4',
    type: 'file',
    size: '2.4 GB',
    modified: '2024-03-19',
    synced: true,
    path: '/WatchParty Videos/movie-collection.mp4'
  },
  {
    id: '3',
    name: 'party-highlights.mp4',
    type: 'file',
    size: '156 MB',
    modified: '2024-03-18',
    synced: false,
    path: '/WatchParty Videos/party-highlights.mp4'
  },
  {
    id: '4',
    name: 'Shared Movies',
    type: 'folder',
    modified: '2024-03-15',
    synced: true,
    path: '/Shared Movies'
  }
]

export default function GoogleDriveIntegrationPage() {
  const [isConnected, setIsConnected] = useState(true)
  const [autoSync, setAutoSync] = useState(true)
  const [syncQuality, setSyncQuality] = useState<'original' | 'high' | 'medium'>('high')
  const [selectedFolder, setSelectedFolder] = useState('/WatchParty Videos')
  const [isSyncing, setIsSyncing] = useState(false)
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)

  const handleSync = async () => {
    setIsSyncing(true)
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsSyncing(false)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setShowDisconnectModal(false)
  }

  const handleReconnect = async () => {
    // Simulate OAuth reconnection
    setIsConnected(true)
  }

  const usedStorage = '4.2 GB'
  const totalStorage = '15 GB'
  const storagePercentage = (4.2 / 15) * 100

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <CloudIcon className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">Google Drive</h1>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-12 border border-white/20">
              <XCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Not Connected</h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Connect your Google Drive account to automatically sync your videos and access them from anywhere.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-white/80">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>Automatic video backup</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>Access videos from any device</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>Secure cloud storage</span>
                </div>
              </div>
              
              <button
                onClick={handleReconnect}
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Connect Google Drive
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
              <CloudIcon className="w-8 h-8 text-blue-400" />
              <h1 className="text-4xl font-bold text-white">Google Drive Integration</h1>
            </div>
            <p className="text-white/70 text-lg">
              Manage your Google Drive connection and sync settings
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
            <span className="text-green-400 font-medium">Connected</span>
          </div>
        </div>

        {/* Storage Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="font-semibold text-white mb-2">Storage Used</h3>
            <div className="text-2xl font-bold text-blue-400 mb-2">{usedStorage}</div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-blue-400 h-2 rounded-full"
                style={{ width: `${storagePercentage}%` }}
              ></div>
            </div>
            <div className="text-sm text-white/60 mt-1">of {totalStorage}</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="font-semibold text-white mb-2">Synced Files</h3>
            <div className="text-2xl font-bold text-green-400">
              {mockFolders.filter(f => f.synced).length}
            </div>
            <div className="text-sm text-white/60">of {mockFolders.length} items</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="font-semibold text-white mb-2">Last Sync</h3>
            <div className="text-lg font-bold text-white">2 hours ago</div>
            <div className="text-sm text-white/60">Automatic sync enabled</div>
          </div>
        </div>

        {/* Sync Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Sync Settings</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Auto Sync</h4>
                  <p className="text-sm text-white/60">Automatically sync new videos</p>
                </div>
                <button
                  onClick={() => setAutoSync(!autoSync)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    autoSync ? 'bg-blue-500' : 'bg-white/20'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      autoSync ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  ></div>
                </button>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Sync Quality</h4>
                <select
                  value={syncQuality}
                  onChange={(e) => setSyncQuality(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/20 text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="original">Original Quality</option>
                  <option value="high">High Quality (1080p)</option>
                  <option value="medium">Medium Quality (720p)</option>
                </select>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Sync Folder</h4>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/20 text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="/WatchParty Videos">/WatchParty Videos</option>
                  <option value="/Shared Movies">/Shared Movies</option>
                  <option value="/Custom">/Custom Folder</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
            
            <div className="space-y-4">
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {isSyncing ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="w-5 h-5" />
                    Sync Now
                  </>
                )}
              </button>
              
              <button className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition-colors">
                <Cog6ToothIcon className="w-5 h-5" />
                Advanced Settings
              </button>
              
              <button
                onClick={() => setShowDisconnectModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                <XCircleIcon className="w-5 h-5" />
                Disconnect
              </button>
            </div>
          </div>
        </div>

        {/* Files and Folders */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-bold text-white">Synced Content</h3>
          </div>
          
          <div className="divide-y divide-white/10">
            {mockFolders.map(item => (
              <div key={item.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 rounded">
                      {item.type === 'folder' ? (
                        <FolderIcon className="w-5 h-5 text-blue-400" />
                      ) : (
                        <DocumentIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-white">{item.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <span>Modified {new Date(item.modified).toLocaleDateString()}</span>
                        {item.size && (
                          <>
                            <span>•</span>
                            <span>{item.size}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.synced ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span className="text-sm">Synced</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <ArrowPathIcon className="w-4 h-4" />
                        <span className="text-sm">Pending</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Notice */}
        <div className="mt-8 bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-300 mb-1">About Google Drive Integration</h4>
              <p className="text-blue-200 text-sm">
                Your videos are securely stored in your Google Drive account. WatchParty only accesses 
                files in the designated sync folder and never accesses your personal files or data.
              </p>
            </div>
          </div>
        </div>

        {/* Disconnect Confirmation Modal */}
        {showDisconnectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Disconnect Google Drive?</h2>
              <p className="text-white/70 mb-6">
                This will stop syncing your videos with Google Drive. Your files will remain in your Drive, 
                but new uploads won't be backed up automatically.
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
