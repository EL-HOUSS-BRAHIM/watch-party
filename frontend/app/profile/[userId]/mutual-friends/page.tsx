import { User } from "lucide-react"
import { useParams } from 'next/navigation'
import Image from "next/image"
import { useState } from 'react'
import { UserGroupIcon, UserPlusIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'

"use client"

interface MutualFriend {}
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isOnline: boolean;
  mutualCount: number;
  lastSeen: string;
  commonFriends: string[]
}

const mutualFriends: MutualFriend[] = []
  {}
    id: '1',
    username: 'movie_buff_alex',
    displayName: 'Alex Johnson',
    avatar: '/placeholder-user.jpg',
    isOnline: true,
    mutualCount: 12,
    lastSeen: '',
    commonFriends: ['sarah_films', 'mike_cinema', 'john_watches']
  },
  {}
    id: '2',
    username: 'cinema_sarah',
    displayName: 'Sarah Chen',
    avatar: '/placeholder-user.jpg',
    isOnline: false,
    mutualCount: 8,
    lastSeen: '2 hours ago',
    commonFriends: ['alex_movies', 'emma_shows']
  },
  {}
    id: '3',
    username: 'film_enthusiast_mike',
    displayName: 'Mike Rodriguez',
    avatar: '/placeholder-user.jpg',
    isOnline: true,
    mutualCount: 15,
    lastSeen: '',
    commonFriends: ['alex_movies', 'sarah_films', 'david_streams', 'lisa_watches']
  },
  {}
    id: '4',
    username: 'tv_show_emma',
    displayName: 'Emma Wilson',
    avatar: '/placeholder-user.jpg',
    isOnline: false,
    mutualCount: 6,
    lastSeen: '1 day ago',
    commonFriends: ['sarah_films', 'mike_cinema']
  }
]

export default function MutualFriendsPage() {}
  const params = useParams()
  const [sortBy, setSortBy] = useState<'mutualCount' | 'name' | 'online'>(&apos;mutualCount')

  const sortedFriends = [...mutualFriends].sort((a, b) => {}
    switch (sortBy) {}
      case 'mutualCount':
        return b.mutualCount - a.mutualCount;
      case 'name':
        return a.displayName.localeCompare(b.displayName)
      case 'online':
        if (a.isOnline && !b.isOnline) return -1;
        if (!a.isOnline && b.isOnline) return 1;
        return b.mutualCount - a.mutualCount;
      default:
        return 0;
    }
  })

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <UserGroupIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-bold">Mutual Friends</h1>
          </div>
          <p className="text-white/70 text-lg">
            Friends you have in common with {params.userId}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
          <div className="flex items-center gap-4">
            <span className="text-white/70">Found {mutualFriends.length} mutual friends</span>
          </div>

          <select;
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as Record<string, unknown>)}
            className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 text-white focus:outline-none focus:border-blue-400"
          >
            <option value="mutualCount">Most Mutual Friends</option>
            <option value="name">Name A-Z</option>
            <option value="online">Online First</option>
          </select>
        </div>

        {/* Friends List */}
        <div className="space-y-4">
          {sortedFriends.map(friend => (
            <div;
              key={friend.id}
              className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 hover:border-blue-400/50 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <img;
                      src={friend.avatar}
                      alt={friend.displayName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    {/* Online Status */}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${}}
                      friend.isOnline ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                  </div>

                  {/* User Info */}
                  <div>
                    <h3 className="font-bold text-lg">{friend.displayName}</h3>
                    <p className="text-white/70">@{friend.username}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-blue-400 text-sm font-medium">
                        {friend.mutualCount} mutual friends;
                      </span>
                      {!friend.isOnline && (
                        <span className="text-white/50 text-sm">
                          Last seen {friend.lastSeen}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors">
                    <UserPlusIcon className="w-4 h-4" />
                    Add Friend;
                  </button>
                  <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                    <ChatBubbleLeftIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Common Friends Preview */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm mb-2">Common friends:</p>
                <div className="flex flex-wrap gap-2">
                  {friend.commonFriends.slice(0, 4).map((commonFriend, index) => (
                    <span;
                      key={index}
                      className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/70"
                    >
                      @{commonFriend}
                    </span>
                  ))}
                  {friend.commonFriends.length > 4 && (
                    <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/70">
                      +{friend.commonFriends.length - 4} more;
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {mutualFriends.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/50 text-lg mb-4">
              No mutual friends found.
            </p>
            <p className="text-white/40">
              You and this user don't have any friends in common yet.
            </p>
          </div>
        )}

        {/* Statistics */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {mutualFriends.length}
            </div>
            <div className="text-white/70">Mutual Friends</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {mutualFriends.filter(f => f.isOnline).length}
            </div>
            <div className="text-white/70">Online Now</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {Math.round(mutualFriends.reduce((acc, f) => acc + f.mutualCount, 0) / mutualFriends.length || 0)}
            </div>
            <div className="text-white/70">Avg. Connections</div>
          </div>
        </div>
      </div>
    </div>
  )
}
