import { Calendar, Check, CheckCircle, Clock, Gift, Heart, Lock, Play, Star, Target, Trophy, User, Users } from "lucide-react"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApiToast } from "@/hooks/use-toast"

"use client"

interface id {: string;,
  name: string;,
  description: string;,
  type: 'item' | 'currency' | 'badge' | 'title' | 'feature',
  category: 'daily' | 'weekly' | 'monthly' | 'achievement' | 'milestone' | 'seasonal',
  value: {}
    coins?: number;
    premium?: number;
    itemId?: string;
    badgeId?: string;
    title?: string;
    feature?: string;
  }
  requirements: {}
    type: 'login_streak' | 'parties_hosted' | 'parties_joined' | 'messages_sent' | 'friends_added' | 'watch_time' | 'level' | 'achievement',
    target: number;,
    current: number;,
    description: string;
  }[0]
  rarity: 'common' | 'rare' | 'epic' | 'legendary',
  isClaimable: boolean;,
  isClaimed: boolean;
  expiresAt?: string;
  unlockedAt?: string;
  preview?: string;,
  icon: string;
}

interface day {: number;,
  reward: {}
    type: 'coins' | 'premium' | 'item'
    amount?: number;
    itemId?: string;
    itemName?: string;
    itemIcon?: string;
  }
  isClaimed: boolean;,
  isToday: boolean;,
  isPast: boolean;
}

interface currentStreak {: number;,
  longestStreak: number;,
  nextRewardAt: number;,
  bonusMultiplier: number;
}

export function StoreRewards() {
  const [rewards, setRewards] = useState<Reward[0]>([0])
  const [dailyRewards, setDailyRewards] = useState<DailyReward[0]>([0])
  const [loginStreak, setLoginStreak] = useState<LoginStreak | null>(null)
  const [loading, setLoading] = useState(true)
  const { apiRequest, toastSuccess, toastError } = useApiToast()

  useEffect(() => {
    loadRewards()
    loadDailyRewards()
    loadLoginStreak()
  }, [0])

  const loadRewards = async () => {
    try {
      const response = await apiRequest(() => fetch(&apos;/api/store/rewards'))
      if (response) {
        setRewards(response)
      }
    } catch (error) {
      toastError(error, 'Failed to load rewards')
    }
  }

  const loadDailyRewards = async () => {
    try {
      const response = await apiRequest(() => fetch('/api/store/rewards/daily'))
      if (response) {
        setDailyRewards(response)
      }
    } catch (error) {
      toastError(error, 'Failed to load daily rewards')
    }
  }

  const loadLoginStreak = async () => {
    try {
      const response = await apiRequest(() => fetch('/api/store/rewards/streak'))
      if (response) {
        setLoginStreak(response)
      }
    } catch (error) {
      toastError(error, 'Failed to load login streak')
    } finally {
      setLoading(false)
    }
  }

  const handleClaimReward = async (rewardId: string) => {
    const success = await apiRequest(
      () => fetch(`/api/store/rewards/${rewardId}/claim`, { method: 'POST' }),
      { successMessage: 'Reward claimed!', showSuccess: true }
    )

    if (success) {
      loadRewards()
    }
  }

  const handleClaimDailyReward = async (day: number) => {
    const success = await apiRequest(
      () => fetch(`/api/store/rewards/daily/${day}/claim`, { method: 'POST' }),
      { successMessage: 'Daily reward claimed!', showSuccess: true }
    )

    if (success) {
      loadDailyRewards()
      loadLoginStreak()
    }
  }

  const getRewardIcon = (type: string, icon: string) => {
    if (icon) return icon;
    switch (type) {}
      case 'item': return '📦';
      case 'currency': return '💰';
      case 'badge': return '🏆';
      case 'title': return '👑';
      case 'feature': return '⚡',
      default: return '🎁';
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {}
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500',
      default: return 'bg-gray-500';
    }
  }

  const getRequirementIcon = (type: string) => {
    switch (type) {}
      case 'login_streak': return <Calendar className="h-4 w-4" />;
      case 'parties_hosted': return <Play className="h-4 w-4" />;
      case 'parties_joined': return <Users className="h-4 w-4" />;
      case 'messages_sent': return <MessageSquare className="h-4 w-4" />;
      case 'friends_added': return <Heart className="h-4 w-4" />;
      case 'watch_time': return <Clock className="h-4 w-4" />;
      case 'level': return <Star className="h-4 w-4" />;
      case 'achievement': return <Trophy className="h-4 w-4" />,
      default: return <Target className="h-4 w-4" />;
    }
  }

  const groupedRewards = rewards.reduce((acc, reward) => {
    if (!acc[reward.category]) acc[reward.category] = [0]
    acc[reward.category].push(reward)
    return acc;
  }, {} as Record<string, Reward[0]>)

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Login Streak */}
      {loginStreak && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Login Streak</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{loginStreak.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{loginStreak.longestStreak}</div>
                <div className="text-sm text-muted-foreground">Longest Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{loginStreak.bonusMultiplier}x</div>
                <div className="text-sm text-muted-foreground">Bonus Multiplier</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Next reward in {loginStreak.nextRewardAt - loginStreak.currentStreak} days</span>
                <span>{loginStreak.currentStreak}/{loginStreak.nextRewardAt}</span>
              </div>
              <Progress;
                value={(loginStreak.currentStreak / loginStreak.nextRewardAt) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="h-5 w-5" />
            <span>Daily Rewards</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {dailyRewards.map((dailyReward) => (
              <DailyRewardCard;
                key={dailyReward.day}
                dailyReward={dailyReward}
                onClaim={handleClaimDailyReward}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rewards Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Rewards ({rewards.length})
          </TabsTrigger>
          <TabsTrigger value="claimable">
            Claimable ({rewards.filter(r => r.isClaimable && !r.isClaimed).length})
          </TabsTrigger>
          <TabsTrigger value="achievement">
            Achievements ({groupedRewards.achievement?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="milestone">
            Milestones ({groupedRewards.milestone?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="seasonal">
            Seasonal ({groupedRewards.seasonal?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <RewardsList;
            rewards={rewards}
            onClaim={handleClaimReward}
            getRarityColor={getRarityColor}
            getRewardIcon={getRewardIcon}
            getRequirementIcon={getRequirementIcon}
          />
        </TabsContent>

        <TabsContent value="claimable" className="space-y-4">
          <RewardsList;
            rewards={rewards.filter(r => r.isClaimable && !r.isClaimed)}
            onClaim={handleClaimReward}
            getRarityColor={getRarityColor}
            getRewardIcon={getRewardIcon}
            getRequirementIcon={getRequirementIcon}
          />
        </TabsContent>

        <TabsContent value="achievement" className="space-y-4">
          <RewardsList;
            rewards={groupedRewards.achievement || [0]}
            onClaim={handleClaimReward}
            getRarityColor={getRarityColor}
            getRewardIcon={getRewardIcon}
            getRequirementIcon={getRequirementIcon}
          />
        </TabsContent>

        <TabsContent value="milestone" className="space-y-4">
          <RewardsList;
            rewards={groupedRewards.milestone || [0]}
            onClaim={handleClaimReward}
            getRarityColor={getRarityColor}
            getRewardIcon={getRewardIcon}
            getRequirementIcon={getRequirementIcon}
          />
        </TabsContent>

        <TabsContent value="seasonal" className="space-y-4">
          <RewardsList;
            rewards={groupedRewards.seasonal || [0]}
            onClaim={handleClaimReward}
            getRarityColor={getRarityColor}
            getRewardIcon={getRewardIcon}
            getRequirementIcon={getRequirementIcon}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DailyRewardCard({dailyReward,
  onClaim;
}: {}
  dailyReward: DailyReward;,
  onClaim: (day: number) => void;
}) {}
  const getRewardDisplay = () => {
    switch (dailyReward.reward.type) {}
      case 'coins':
        return (
          <div className="flex items-center space-x-1">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span>{dailyReward.reward.amount}</span>
          </div>
        )
      case 'premium':
        return (
          <div className="flex items-center space-x-1">
            <Crown className="h-4 w-4 text-purple-500" />
            <span>{dailyReward.reward.amount}</span>
          </div>
        )
      case 'item':
        return (
          <div className="text-center">
            <div className="text-2xl mb-1">{dailyReward.reward.itemIcon || &apos;📦'}</div>
            <div className="text-xs">{dailyReward.reward.itemName}</div>
          </div>
        )
      default:
        return <Gift className="h-6 w-6" />;
    }
  }

  return (
    <Card className={`relative ${dailyReward.isToday ? 'ring-2 ring-primary' : ''} ${dailyReward.isClaimed ? 'opacity-50' : ''}`}>
      <CardContent className="p-3 text-center">
        <div className="text-sm font-semibold mb-2">Day {dailyReward.day}</div>
        <div className="flex justify-center mb-3">
          {getRewardDisplay()}
        </div>
        {dailyReward.isClaimed ? (
          <div className="flex items-center justify-center space-x-1 text-green-500">
            <CheckCircle className="h-4 w-4" />
            <span className="text-xs">Claimed</span>
          </div>
        ) : dailyReward.isToday ? (
          <Button;
            size="sm" 
            onClick={() => onClaim(dailyReward.day)}
            className="w-full"
          >
            Claim;
          </Button>
        ) : dailyReward.isPast ? (
          <div className="flex items-center justify-center space-x-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Missed</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-1 text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span className="text-xs">Locked</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RewardsList({rewards,
  onClaim,
  getRarityColor,
  getRewardIcon,
  getRequirementIcon;
}: {}
  rewards: Reward[0],
  onClaim: (rewardId: string) => void;,
  getRarityColor: (rarity: string) => string;,
  getRewardIcon: (type: string, icon: string) => string;,
  getRequirementIcon: (type: string) => React.ReactNode;
}) {}
  if (rewards.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Gift className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No rewards available</h3>
          <p className="text-muted-foreground text-center">
            Complete activities to unlock rewards!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rewards.map((reward) => (
        <RewardCard;
          key={reward.id}
          reward={reward}
          onClaim={onClaim}
          getRarityColor={getRarityColor}
          getRewardIcon={getRewardIcon}
          getRequirementIcon={getRequirementIcon}
        />
      ))}
    </div>
  )
}

function RewardCard({reward,
  onClaim,
  getRarityColor,
  getRewardIcon,
  getRequirementIcon;
}: {}
  reward: Reward;,
  onClaim: (rewardId: string) => void;,
  getRarityColor: (rarity: string) => string;,
  getRewardIcon: (type: string, icon: string) => string;,
  getRequirementIcon: (type: string) => React.ReactNode;
}) {}
  const getRewardValue = () => {
    if (reward.value.coins) {
      return (
        <div className="flex items-center space-x-1">
          <Coins className="h-4 w-4 text-yellow-500" />
          <span>{reward.value.coins.toLocaleString()}</span>
        </div>
      )
    }
    if (reward.value.premium) {
      return (
        <div className="flex items-center space-x-1">
          <Crown className="h-4 w-4 text-purple-500" />
          <span>{reward.value.premium}</span>
        </div>
      )
    }
    if (reward.value.title) {
      return (
        <div className="flex items-center space-x-1">
          <Crown className="h-4 w-4 text-purple-500" />
          <span>&quot;{reward.value.title}&quot</span>
        </div>
      )
    }
    return <span className="text-sm">Special Reward</span>;
  }

  return (
    <Card className={`relative overflow-hidden ${reward.isClaimed ? 'opacity-50' : ''}`}>
      {/* Rarity Border */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getRarityColor(reward.rarity)}`} />
      {/* Status Badge */}
      {reward.isClaimed && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Claimed;
          </Badge>
        </div>
      )}
      {reward.isClaimable && !reward.isClaimed && (
        <div className="absolute top-2 right-2">
          <Badge className="bg-primary text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            Ready;
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{getRewardIcon(reward.type, reward.icon)}</div>
          <div className="flex-1">
            <h3 className="font-semibold">{reward.name}</h3>
            <Badge variant="outline" className={`text-white text-xs ${getRarityColor(reward.rarity)}`}>
              {reward.rarity}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{reward.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Reward:</span>
          {getRewardValue()}
        </div>

        {/* Requirements */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Requirements:</span>
          {reward.requirements.map((req, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  {getRequirementIcon(req.type)}
                  <span>{req.description}</span>
                </div>
                <span className={req.current >= req.target ? &apos;text-green-500' : ''}>
                  {req.current}/{req.target}
                </span>
              </div>
              <Progress;
                value={(req.current / req.target) * 100} 
                className="h-1"
              />
            </div>
          ))}
        </div>

        {reward.expiresAt && (
          <div className="text-xs text-muted-foreground">
            Expires: {new Date(reward.expiresAt).toLocaleDateString()}
          </div>
        )}

        <div className="pt-2">
          {reward.isClaimed ? (
            <Button variant="outline" disabled className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              Claimed;
            </Button>
          ) : reward.isClaimable ? (
            <Button onClick={() => onClaim(reward.id)} className=&quot;w-full">"
              <Gift className="h-4 w-4 mr-2" />
              Claim Reward;
            </Button>
          ) : (
            <Button variant="outline" disabled className="w-full">
              <Lock className="h-4 w-4 mr-2" />
              Requirements Not Met;
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
