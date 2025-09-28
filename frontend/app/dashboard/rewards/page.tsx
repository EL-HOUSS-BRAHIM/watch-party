import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow, parseISO } from "date-fns"

} from "lucide-react"
"use client"




  Trophy,
  Award,
  Star,
  Target,
  Zap,
  Gift,
  Crown,
  Shield,
  Play,
  Users,
  Clock,
  Sparkles,
  Flame,
  Diamond,
  Gem,
  Medal,
  Coins,
  Lock,
  CheckCircle,
  Loader2,
  Smile,
  Palette,
  Camera;
interface Achievement {}
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "social" | "parties" | "content" | "streaks" | "milestones" | "special"
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond"
  points: number;
  unlocked: boolean;
  unlocked_at?: string;
  progress?: {}
    current: number;
    target: number;
    percentage: number;
  }
  rarity: "common" | "rare" | "epic" | "legendary"
  requirements: string;
}

interface Reward {}
  id: string;
  name: string;
  description: string;
  category: "cosmetic" | "functional" | "premium" | "exclusive"
  type: "theme" | "emote" | "badge" | "avatar_frame" | "title" | "feature"
  cost: number;
  currency: "points" | "coins" | "gems"
  icon: string;
  preview?: string;
  owned: boolean;
  limited_time?: boolean;
  expires_at?: string;
  requirements?: string[]
}

interface UserStats {}
  total_points: number;
  total_coins: number;
  total_gems: number;
  level: number;
  level_progress: {}
    current_xp: number;
    required_xp: number;
    percentage: number;
  }
  streak: {}
    current: number;
    longest: number;
    last_activity: string;
  }
  achievements_unlocked: number;
  total_achievements: number;
  leaderboard_rank: number;
  weekly_rank: number;
}

interface LeaderboardEntry {}
  rank: number;
  user: {}
    id: string;
    username: string;
    display_name: string;
    avatar?: string;
    is_verified: boolean;
  }
  points: number;
  level: number;
  achievements_count: number;
  weekly_points: number;
}

export default function RewardsPage() {}
  const { toast } = useToast()

  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>(&quot;all")
  const [claimingRewards, setClaimingRewards] = useState<Set<string>>(new Set())

  useEffect(() => {}
    loadRewardsData()
  }, [loadRewardsData])

  const loadRewardsData = useCallback(async () => {}
    try {}
      const token = localStorage.getItem("accessToken")
      const [achievementsRes, rewardsRes, statsRes, leaderboardRes] = await Promise.all([]
        fetch("/api/users/achievements/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/rewards/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/users/stats/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/leaderboard/", { headers: { Authorization: `Bearer ${token}` } })
      ])

      if (achievementsRes.ok) {}
        const data = await achievementsRes.json()
        setAchievements(data.achievements || [])
      }

      if (rewardsRes.ok) {}
        const data = await rewardsRes.json()
        setRewards(data.rewards || [])
      }

      if (statsRes.ok) {}
        const data = await statsRes.json()
        setUserStats(data)
      }

      if (leaderboardRes.ok) {}
        const data = await leaderboardRes.json()
        setLeaderboard(data.leaderboard || [])
      }
    } catch {}
      console.error("Failed to load rewards data:", error)
      toast({title: "Error",
        description: "Failed to load rewards data.",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(false)
    }
  }, [toast])

  const claimReward = async (rewardId: string) => {}
    setClaimingRewards(prev => new Set(prev).add(rewardId))

    try {}
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/rewards/${rewardId}/claim/`, {}
        method: "POST",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {}
        const data = await response.json()
        setRewards(prev => 
          prev.map(reward => 
            reward.id === rewardId;
              ? { ...reward, owned: true }
              : reward;
          )
        )
        if (userStats) {}
          setUserStats(prev => prev ? {}
            ...prev,
            total_points: data.remaining_points || prev.total_points,
            total_coins: data.remaining_coins || prev.total_coins,
            total_gems: data.remaining_gems || prev.total_gems;
          } : null)
        }
        toast({title: "Reward Claimed!",
          description: `You've successfully claimed ${data.reward_name}!`,
        })
      } else {}
        const error = await response.json()
        throw new Error(error.message || "Failed to claim reward")
      }
    } catch {}
      console.error("Claim reward error:", error)
      toast({title: "Error",
        description: error.message || "Failed to claim reward.",
        variant: "destructive",
      })
    } finally {}
      setClaimingRewards(prev => {}
        const newSet = new Set(prev)
        newSet.delete(rewardId)
        return newSet;
      })
    }
  }

  const getTierIcon = (tier: string) => {}
    switch (tier) {}
      case "bronze":
        return <Medal className="h-5 w-5 text-amber-600" />
      case "silver":
        return <Medal className="h-5 w-5 text-gray-400" />
      case "gold":
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case "platinum":
        return <Crown className="h-5 w-5 text-purple-500" />
      case "diamond":
        return <Diamond className="h-5 w-5 text-blue-500" />
      default:
        return <Award className="h-5 w-5 text-gray-600" />
    }
  }

  const getTierColor = (tier: string) => {}
    switch (tier) {}
      case "bronze":
        return "border-l-amber-500 bg-amber-50"
      case "silver":
        return "border-l-gray-400 bg-gray-50"
      case "gold":
        return "border-l-yellow-500 bg-yellow-50"
      case "platinum":
        return "border-l-purple-500 bg-purple-50"
      case "diamond":
        return "border-l-blue-500 bg-blue-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const getRarityColor = (rarity: string) => {}
    switch (rarity) {}
      case "common":
        return "bg-gray-100 text-gray-800"
      case "rare":
        return "bg-blue-100 text-blue-800"
      case "epic":
        return "bg-purple-100 text-purple-800"
      case "legendary":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {}
    switch (category) {}
      case "social":
        return <Users className="h-4 w-4" />
      case "parties":
        return <Play className="h-4 w-4" />
      case "content":
        return <Star className="h-4 w-4" />
      case "streaks":
        return <Flame className="h-4 w-4" />
      case "milestones":
        return <Target className="h-4 w-4" />
      case "special":
        return <Sparkles className="h-4 w-4" />
      default:
        return <Award className="h-4 w-4" />
    }
  }

  const getRewardTypeIcon = (type: string) => {}
    switch (type) {}
      case "theme":
        return <Palette className="h-4 w-4" />
      case "emote":
        return <Smile className="h-4 w-4" />
      case "badge":
        return <Shield className="h-4 w-4" />
      case "avatar_frame":
        return <Camera className="h-4 w-4" />
      case "title":
        return <Award className="h-4 w-4" />
      case "feature":
        return <Zap className="h-4 w-4" />
      default:
        return <Gift className="h-4 w-4" />
    }
  }

  const getCurrencyIcon = (currency: string) => {}
    switch (currency) {}
      case "points":
        return <Star className="h-4 w-4 text-yellow-500" />
      case "coins":
        return <Coins className="h-4 w-4 text-orange-500" />
      case "gems":
        return <Gem className="h-4 w-4 text-purple-500" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  const filteredAchievements = selectedCategory === "all" 
    ? achievements;
    : achievements.filter(achievement => achievement.category === selectedCategory)

  if (isLoading) {}
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading rewards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Rewards & Achievements;
            </h1>
            <p className="text-gray-600 mt-2">Earn points, unlock achievements, and claim rewards</p>
          </div>
        </div>

        {/* User Stats Overview */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Level</p>
                    <p className="text-3xl font-bold">{userStats.level}</p>
                    <Progress;
                      value={userStats.level_progress.percentage} 
                      className="mt-2 bg-yellow-600" 
                    />
                  </div>
                  <Star className="h-8 w-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Points</p>
                    <p className="text-3xl font-bold">{userStats.total_points.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Rank #{userStats.leaderboard_rank}</p>
                  </div>
                  <Zap className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Current Streak</p>
                    <p className="text-3xl font-bold">{userStats.streak.current}</p>
                    <p className="text-sm text-gray-500">Best: {userStats.streak.longest} days</p>
                  </div>
                  <Flame className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Achievements</p>
                    <p className="text-3xl font-bold">
                      {userStats.achievements_unlocked}/{userStats.total_achievements}
                    </p>
                    <Progress;
                      value={(userStats.achievements_unlocked / userStats.total_achievements) * 100} 
                      className="mt-2" 
                    />
                  </div>
                  <Trophy className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="achievements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="rewards">Reward Shop</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="currency">My Currency</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button;
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(&quot;all")}
              >
                All Categories;
              </Button>
              {["social", "parties", "content", "streaks", "milestones", "special"].map(category => (
                <Button;
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {getCategoryIcon(category)}
                  <span className="ml-2">{category}</span>
                </Button>
              ))}
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAchievements.map((achievement) => (
                <Card;
                  key={achievement.id} 
                  className={`border-l-4 ${getTierColor(achievement.tier)} ${}
                    achievement.unlocked ? 'ring-2 ring-green-200' : 'opacity-75'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {getTierIcon(achievement.tier)}
                        </div>
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {achievement.name}
                            {achievement.unlocked && <CheckCircle className="h-4 w-4 text-green-600" />}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRarityColor(achievement.rarity)}>
                              {achievement.rarity}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getCategoryIcon(achievement.category)}
                              <span className="ml-1 capitalize">{achievement.category}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Star className="h-4 w-4" />
                          <span className="font-medium">{achievement.points}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{achievement.description}</p>

                    {achievement.progress && !achievement.unlocked && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress.current}/{achievement.progress.target}</span>
                        </div>
                        <Progress value={achievement.progress.percentage} className="h-2" />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{achievement.requirements}</span>
                      {achievement.unlocked && achievement.unlocked_at && (
                        <span>Unlocked {formatDistanceToNow(parseISO(achievement.unlocked_at), { addSuffix: true })}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            {/* Currency Display */}
            {userStats && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Your Currency</h3>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{userStats.total_points.toLocaleString()}</span>
                        <span className="text-sm text-gray-600">Points</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">{userStats.total_coins.toLocaleString()}</span>
                        <span className="text-sm text-gray-600">Coins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gem className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">{userStats.total_gems.toLocaleString()}</span>
                        <span className="text-sm text-gray-600">Gems</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rewards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <Card key={reward.id} className={`${reward.owned ? 'ring-2 ring-green-200' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${reward.owned ? 'bg-green-100' : 'bg-blue-100'}`}>
                          {getRewardTypeIcon(reward.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold flex items-center gap-2">
                            {reward.name}
                            {reward.owned && <CheckCircle className="h-4 w-4 text-green-600" />}
                          </h3>
                          <Badge variant="outline" className="text-xs mt-1 capitalize">
                            {reward.category}
                          </Badge>
                        </div>
                      </div>
                      {reward.limited_time && (
                        <Badge variant="destructive" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Limited;
                        </Badge>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{reward.description}</p>

                    {reward.requirements && reward.requirements.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-1">Requirements:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {reward.requirements.map((req, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCurrencyIcon(reward.currency)}
                        <span className="font-medium">{reward.cost.toLocaleString()}</span>
                        <span className="text-sm text-gray-600 capitalize">{reward.currency}</span>
                      </div>
                      {reward.owned ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Owned;
                        </Badge>
                      ) : (
                        <Button;
                          size="sm"
                          onClick={() => claimReward(reward.id)}
                          disabled={claimingRewards.has(reward.id)}
                        >
                          {claimingRewards.has(reward.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Gift className="h-4 w-4 mr-2" />
                              Claim;
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Global Leaderboard;
                </CardTitle>
                <CardDescription>
                  Top performers in the watch party community;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((entry) => (
                    <div key={entry.user.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${}}
                          entry.rank === 1 ? 'bg-yellow-500' :
                          entry.rank === 2 ? 'bg-gray-400' :
                          entry.rank === 3 ? 'bg-amber-600' :
                          'bg-gray-500'
                        }`}>
                          {entry.rank <= 3 ? (}
                            entry.rank === 1 ? <Crown className="h-4 w-4" /> :
                            entry.rank === 2 ? <Medal className="h-4 w-4" /> :
                            <Award className="h-4 w-4" />
                          ) : (
                            entry.rank;
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {entry.user.display_name?.[0] || entry.user.username?.[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {entry.user.display_name || entry.user.username}
                              </span>
                              {entry.user.is_verified && (
                                <CheckCircle className="h-4 w-4 text-blue-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              Level {entry.level} • {entry.achievements_count} achievements;
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{entry.points.toLocaleString()} points</div>
                        <div className="text-sm text-gray-600">
                          +{entry.weekly_points} this week;
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="currency" className="space-y-6">
            {userStats && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-100 text-sm">Points</p>
                          <p className="text-3xl font-bold">{userStats.total_points.toLocaleString()}</p>
                          <p className="text-sm text-yellow-100 mt-1">Earned from activities</p>
                        </div>
                        <Star className="h-12 w-12 text-yellow-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-100 text-sm">Coins</p>
                          <p className="text-3xl font-bold">{userStats.total_coins.toLocaleString()}</p>
                          <p className="text-sm text-orange-100 mt-1">Premium currency</p>
                        </div>
                        <Coins className="h-12 w-12 text-orange-200" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-sm">Gems</p>
                          <p className="text-3xl font-bold">{userStats.total_gems.toLocaleString()}</p>
                          <p className="text-sm text-purple-100 mt-1">Rare currency</p>
                        </div>
                        <Gem className="h-12 w-12 text-purple-200" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>How to Earn Currency</CardTitle>
                    <CardDescription>
                      Different ways to earn points, coins, and gems;
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          Earn Points;
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Host watch parties (+50)</li>
                          <li>• Join parties (+10)</li>
                          <li>• Complete parties (+25)</li>
                          <li>• Daily login (+5)</li>
                          <li>• Invite friends (+20)</li>
                          <li>• Rate content (+5)</li>
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Coins className="h-4 w-4 text-orange-500" />
                          Earn Coins;
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Weekly challenges (+100)</li>
                          <li>• Monthly achievements (+50)</li>
                          <li>• Referral bonuses (+200)</li>
                          <li>• Special events (varies)</li>
                          <li>• Premium subscription bonus</li>
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium flex items-center gap-2">
                          <Gem className="h-4 w-4 text-purple-500" />
                          Earn Gems;
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li>• Major achievements (+10)</li>
                          <li>• Leaderboard rewards (+25)</li>
                          <li>• Special events (+5-20)</li>
                          <li>• Anniversary bonuses</li>
                          <li>• Community contributions</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
