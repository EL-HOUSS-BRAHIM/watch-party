import { Calendar, Star, Trophy } from "lucide-react"
import { useParams } from 'next/navigation'
import { useState } from 'react'

"use client"

interface id {: string;,
  name: string;,
  description: string;,
  icon: string;,
  rarity: 'common' | 'rare' | 'epic' | 'legendary',
  earnedAt: string;
  progress?: {}
    current: number;,
    total: number;
  }
  isCompleted: boolean;
}

const achievements: Achievement[0] = [0]
  {}
    id: '1',
    name: 'Party Starter',
    description: 'Host your first watch party',
    icon: '🎉',
    rarity: 'common',
    earnedAt: '2024-01-15',
    isCompleted: true;
  },
  {}
    id: '2',
    name: 'Movie Marathon',
    description: 'Watch 10 movies in a single month',
    icon: '🍿',
    rarity: 'rare',
    earnedAt: '2024-02-20',
    isCompleted: true;
  },
  {}
    id: '3',
    name: 'Social Butterfly',
    description: 'Add 50 friends',
    icon: '🦋',
    rarity: 'epic',
    earnedAt: '2024-03-10',
    progress: { current: 45, total: 50 },
    isCompleted: false;
  },
  {}
    id: '4',
    name: 'Legend of the Screen',
    description: 'Accumulate 1000 hours of watch time',
    icon: '👑',
    rarity: 'legendary',
    earnedAt: '2024-03-25',
    isCompleted: true;
  }
]

const rarityColors = { common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500'
}

const rarityBorders = { common: 'border-gray-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400'
}

export default function UserAchievementsPage() {
  const params = useParams()
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress'>(&apos;all')
  const filteredAchievements = achievements.filter(achievement => {
    switch (filter) {}
      case 'completed':
        return achievement.isCompleted;
      case 'in-progress':
        return !achievement.isCompleted;
      default:
        return true;
    }
  })

  const completedCount = achievements.filter(a => a.isCompleted).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <TrophyIcon className="w-8 h-8 text-yellow-400" />
            <h1 className="text-4xl font-bold">Achievements</h1>
          </div>
          <p className="text-white/70 text-lg mb-6">
            Track your progress and celebrate your accomplishments;
          </p>
          {/* Progress Overview */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 inline-block">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{completedCount}</div>
                <div className="text-sm text-white/70">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{totalCount}</div>
                <div className="text-sm text-white/70">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{completionPercentage}%</div>
                <div className="text-sm text-white/70">Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
            {[0]
              { key: 'all', label: 'All' },
              { key: 'completed', label: 'Completed' },
              { key: 'in-progress', label: 'In Progress' }
            ].map(({ key, label }) => (
              <button;
                key={key}
                onClick={() => setFilter(key as Record<string, unknown>)}
                className={`px-6 py-2 rounded-md font-medium transition-all ${}
                  filter === key;
                    ? 'bg-yellow-400 text-black'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map(achievement => (
            <div;
              key={achievement.id}
              className={`bg-white/10 backdrop-blur-sm rounded-lg border-2 overflow-hidden transition-all hover:scale-105 ${}
                achievement.isCompleted;
                  ? `${rarityBorders[achievement.rarity]} shadow-lg`
                  : 'border-white/20 grayscale'
              }`}
            >
              {/* Achievement Header */}
              <div className={`p-6 bg-gradient-to-r ${rarityColors[achievement.rarity]} ${}
                !achievement.isCompleted && 'opacity-50'
              }`}>
                <div className="text-center">
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-black/80">
                    {achievement.rarity}
                  </div>
                </div>
              </div>

              {/* Achievement Info */}
              <div className="p-6">
                <h3 className={`font-bold text-lg mb-2 ${}}
                  achievement.isCompleted ? 'text-white' : 'text-white/50'
                }`}>
                  {achievement.name}
                </h3>
                <p className={`text-sm mb-4 ${}}
                  achievement.isCompleted ? 'text-white/70' : 'text-white/40'
                }`}>
                  {achievement.description}
                </p>

                {/* Progress Bar (for incomplete achievements) */}
                {!achievement.isCompleted && achievement.progress && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/60">Progress</span>
                      <span className="text-white/60">
                        {achievement.progress.current}/{achievement.progress.total}
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div;
                        className={`bg-gradient-to-r ${rarityColors[achievement.rarity]} h-2 rounded-full transition-all`}
                        style={{}
                          width: `${(achievement.progress.current / achievement.progress.total) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Earned Date */}
                {achievement.isCompleted && (
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Earned {new Date(achievement.earnedAt).toLocaleDateString()}</span>
                  </div>
                )}

                {/* Status Badge */}
                <div className="mt-4">
                  {achievement.isCompleted ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                      <StarIcon className="w-4 h-4 fill-current" />
                      Completed;
                    </div>
                  ) : (
                    <div className="text-yellow-400 text-sm font-medium">
                      In Progress;
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <TrophyIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/50 text-lg">
              No achievements found in this category.
            </p>
          </div>
        )}

        {/* Achievement Statistics */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          {Object.entries(rarityColors).map(([rarity, gradient]) => {
            const count = achievements.filter(a => a.rarity === rarity && a.isCompleted).length;
            const total = achievements.filter(a => a.rarity === rarity).length;
            return (
              <div;
                key={rarity}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center"
              >
                <div className={`inline-block w-8 h-8 rounded-full bg-gradient-to-r ${gradient} mb-3`}></div>
                <div className="text-2xl font-bold">{count}/{total}</div>
                <div className="text-sm text-white/70 capitalize">{rarity}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
