import { Check, CheckCircle, Eye, Info, Play, X, XCircle } from "lucide-react"
import { useState, useEffect } from 'react'
import Image from "next/image"
import { integrationsAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import {}

'use client'
  FilmIcon,
  TvIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  EyeIcon,
  HeartIcon,
  StarIcon;
} from '@heroicons/react/24/outline'

interface NetflixProfile {}
  id: string;
  name: string;
  avatar: string;
  type: 'adult' | 'kids'
  isActive: boolean;
}

interface NetflixContent {}
  id: string;
  title: string;
  type: 'movie' | 'series'
  thumbnail: string;
  duration?: string;
  episodes?: number;
  rating: string;
  genre: string[]
  year: number;
  isWatched: boolean;
  progress?: number;
}

interface SyncSettings {}
  watchHistory: boolean;
  watchlist: boolean;
  ratings: boolean;
  profiles: boolean;
  autoImport: boolean;
}

export default function NetflixIntegrationPage() {
  const { toast } = useToast()
  const [isConnected, setIsConnected] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState('1')
  const [profiles, setProfiles] = useState<NetflixProfile[]>([])
  const [content, setContent] = useState<NetflixContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [syncSettings, setSyncSettings] = useState<SyncSettings>({}
    watchHistory: true,
    watchlist: true,
    ratings: false,
    profiles: true,
    autoImport: true;
  })
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)
  const [contentFilter, setContentFilter] = useState<'all' | 'movies' | 'series'>(&apos;all&apos;)

  useEffect(() => {
    checkNetflixConnection()
  }, [])

  const checkNetflixConnection = async () => {
    try {
      setIsLoading(true)
      // Check if Netflix integration is connected;
      const health = await integrationsAPI.getHealth()
      // For now, we'll use a placeholder check;
      setIsConnected(false) // Assuming not connected initially;
      if (isConnected) {
        await fetchNetflixData()
      }
    } } catch {
      console.error('Error checking Netflix connection:', error)
      toast({}
        title: "Error",
        description: "Failed to check Netflix connection status",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(false)
    }
  }

  const fetchNetflixData = async () => {
    try {
      // In a real implementation, these would be Netflix-specific API calls;
      // For now, we'll use placeholder data structure;
      setProfiles([]
        {}
          id: '1',
          name: 'Primary Profile',
          avatar: '/placeholder-user.jpg',
          type: 'adult',
          isActive: true;
        }
      ])
      setContent([])
      setLastSync(new Date(Date.now() - 3600000))
    } } catch {
      console.error('Error fetching Netflix data:', error)
      toast({}
        title: "Error",
        description: "Failed to fetch Netflix data",
        variant: "destructive",
      })
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      // Simulate Netflix data sync;
      await new Promise(resolve => setTimeout(resolve, 3000))
      await fetchNetflixData()
      setLastSync(new Date())
      toast({}
        title: "Success",
        description: "Netflix data synced successfully",
      })
    } } catch {
      console.error('Error syncing Netflix data:', error)
      toast({}
        title: "Error",
        description: "Failed to sync Netflix data",
        variant: "destructive",
      })
    } finally {}
      setIsSyncing(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      // In a real implementation, this would call the API to disconnect;
      setIsConnected(false)
      setProfiles([])
      setContent([])
      setShowDisconnectModal(false)
      toast({}
        title: "Success",
        description: "Netflix account disconnected",
      })
    } } catch {
      console.error('Error disconnecting Netflix:', error)
      toast({}
        title: "Error",
        description: "Failed to disconnect Netflix account",
        variant: "destructive",
      })
    }
  }

  const handleReconnect = async () => {
    try {
      // Get Netflix auth URL;
      const authResponse = await integrationsAPI.getAuthUrl('netflix')
      // In a real implementation, this would redirect to Netflix OAuth;
      window.location.href = authResponse.auth_url;
    } } catch {
      console.error('Error connecting to Netflix:', error)
      toast({}
        title: "Error",
        description: "Failed to connect to Netflix",
        variant: "destructive",
      })
    }
  }

  const updateSyncSetting = (key: keyof SyncSettings) => {}
    setSyncSettings(prev => ({}
      ...prev,
      [key]: !prev[key]
    }))
  }

  const filteredContent = content.filter(item => 
    contentFilter === 'all' || item.type === contentFilter;
  )

  const watchedCount = content.filter(item => item.isWatched).length;
  const inProgressCount = content.filter(item => item.progress && item.progress > 0).length;
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                <PlayIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">Netflix</h1>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-12 border border-white/20">
              <ArrowPathIcon className="w-16 h-16 text-white/50 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-white mb-4">Loading...</h2>
              <p className="text-white/70">Checking Netflix connection status...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                <PlayIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">Netflix</h1>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-12 border border-white/20">
              <XCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Not Connected</h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Connect your Netflix account to sync your watch history and create watch parties with your Netflix content.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-white/80">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>Sync watch history and watchlist</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>Create parties with Netflix content</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                  <span>Synchronized playback</span>
                </div>
              </div>
              <button;
                onClick={handleReconnect}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Connect Netflix;
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
              <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
                <PlayIcon className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white">Netflix Integration</h1>
            </div>
            <p className="text-white/70 text-lg">
              Manage your Netflix connection and sync settings;
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-6 h-6 text-green-400" />
            <span className="text-green-400 font-medium">Connected</span>
          </div>
        </div>

        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-8">
          <h3 className="font-semibold text-white mb-2">Content Synced</h3>
          <div className="text-2xl font-bold text-red-400 mb-2">{content.length}</div>
          <div className="text-sm text-white/60">movies & series</div>
        </div>          <div className=&quot;bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20&quot;>
            <h3 className="font-semibold text-white mb-2">Watched</h3>
            <div className="text-2xl font-bold text-green-400 mb-2">{watchedCount}</div>
            <div className="text-sm text-white/60">completed items</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="font-semibold text-white mb-2">In Progress</h3>
            <div className="text-2xl font-bold text-yellow-400 mb-2">{inProgressCount}</div>
            <div className="text-sm text-white/60">currently watching</div>
          </div>
        </div>

        {/* Profile Selection */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Netflix Profiles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profiles.map(profile => (
              <div;
                key={profile.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${}
                  selectedProfile === profile.id;
                    ? 'border-red-500 bg-red-500/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => setSelectedProfile(profile.id)}
              >
                <div className="flex items-center gap-3">
                  <img;
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-12 h-12 rounded bg-white/20"
                  />
                  <div>
                    <h4 className="font-medium text-white">{profile.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm px-2 py-1 rounded ${}}
                        profile.type === 'kids' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                      }`}>
                        {profile.type === 'kids' ? 'Kids' : 'Adult'}
                      </span>
                      {profile.isActive && (
                        <span className="text-xs text-green-400">Active</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sync Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Sync Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Watch History</h4>
                  <p className="text-sm text-white/60">Sync your viewing history</p>
                </div>
                <button;
                  onClick={() => updateSyncSetting(&apos;watchHistory&apos;)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${}
                    syncSettings.watchHistory ? 'bg-red-600' : 'bg-white/20'
                  }`}
                >
                  <div;
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${}
                      syncSettings.watchHistory ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">My List</h4>
                  <p className="text-sm text-white/60">Sync your watchlist</p>
                </div>
                <button;
                  onClick={() => updateSyncSetting(&apos;watchlist&apos;)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${}
                    syncSettings.watchlist ? 'bg-red-600' : 'bg-white/20'
                  }`}
                >
                  <div;
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${}
                      syncSettings.watchlist ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Ratings</h4>
                  <p className="text-sm text-white/60">Sync your ratings</p>
                </div>
                <button;
                  onClick={() => updateSyncSetting(&apos;ratings&apos;)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${}
                    syncSettings.ratings ? 'bg-red-600' : 'bg-white/20'
                  }`}
                >
                  <div;
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${}
                      syncSettings.ratings ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-white">Auto Import</h4>
                  <p className="text-sm text-white/60">Automatically sync new content</p>
                </div>
                <button;
                  onClick={() => updateSyncSetting(&apos;autoImport&apos;)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${}
                    syncSettings.autoImport ? 'bg-red-600' : 'bg-white/20'
                  }`}
                >
                  <div;
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${}
                      syncSettings.autoImport ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">Sync Status</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-white mb-2">Last Sync</h4>
                <p className="text-white/70">
                  {lastSync ? `${lastSync.toLocaleDateString()} at ${lastSync.toLocaleTimeString()}` : 'Never synced'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Next Auto Sync</h4>
                <p className="text-white/70">
                  In {syncSettings.autoImport ? '4 hours' : 'Never (disabled)'}
                </p>
              </div>

              <button;
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {isSyncing ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <ArrowPathIcon className="w-5 h-5" />
                    Sync Now;
                  </>
                )}
              </button>
              <button;
                onClick={() => setShowDisconnectModal(true)}
                className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-medium transition-colors"
              >
                <XCircleIcon className="w-5 h-5" />
                Disconnect;
              </button>
            </div>
          </div>
        </div>

        {/* Synced Content */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Synced Content</h3>
              <div className="flex gap-2">
                <button;
                  onClick={() => setContentFilter(&apos;all&apos;)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${}
                    contentFilter === 'all' ? 'bg-red-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  All;
                </button>
                <button;
                  onClick={() => setContentFilter(&apos;movies&apos;)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${}
                    contentFilter === 'movies' ? 'bg-red-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  Movies;
                </button>
                <button;
                  onClick={() => setContentFilter(&apos;series&apos;)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${}
                    contentFilter === 'series' ? 'bg-red-600 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  Series;
                </button>
              </div>
            </div>
          </div>
          <div className="divide-y divide-white/10">
            {filteredContent.map(item => (
              <div key={item.id} className="p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <img;
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-20 h-12 object-cover rounded bg-white/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white">{item.title}</h4>
                      <span className="text-xs px-2 py-1 bg-white/20 rounded text-white/70">
                        {item.rating}
                      </span>
                      <span className="text-xs text-white/60">({item.year})</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <div className="flex items-center gap-1">
                        {item.type === 'movie' ? (
                          <FilmIcon className="w-4 h-4" />
                        ) : (
                          <TvIcon className="w-4 h-4" />
                        )}
                        <span>{item.type === &apos;movie&apos; ? item.duration : `${item.episodes} episodes`}</span>
                      </div>
                      <span>{item.genre.join(&apos;, &apos;)}</span>
                    </div>

                    {item.progress && item.progress > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                          <span>Progress</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-1">
                          <div;
                            className="bg-red-600 h-1 rounded-full"
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {item.isWatched ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span className="text-sm">Watched</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <EyeIcon className="w-4 h-4" />
                        <span className="text-sm">In List</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Notice */}
        <div className="mt-8 bg-red-600/20 border border-red-500/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-300 mb-1">About Netflix Integration</h4>
              <p className="text-red-200 text-sm">
                This integration allows you to sync your Netflix viewing data to create better watch parties. 
                We only access basic viewing information and never store your Netflix credentials.
              </p>
            </div>
          </div>
        </div>

        {/* Disconnect Confirmation Modal */}
        {showDisconnectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">Disconnect Netflix?</h2>
              <p className="text-white/70 mb-6">
                This will stop syncing your Netflix data and remove access to Netflix content;
                in watch parties. Your existing synced data will be preserved.
              </p>
              <div className="flex gap-4">
                <button;
                  onClick={() => setShowDisconnectModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel;
                </button>
                <button;
                  onClick={handleDisconnect}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Disconnect;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
