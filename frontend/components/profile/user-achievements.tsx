import { Calendar, Lock, Target, Trophy } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApi } from "@/hooks/use-api"
import { formatDistanceToNow } from "date-fns"

"use client"

interface Achievement {}
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: "common" | "rare" | "epic" | "legendary"
  earned_at?: string;
  progress?: {}
    current: number;
    required: number;
  }
}

interface AchievementCategory {}
  name: string;
  achievements: Achievement[]
  total_points: number;
  earned_points: number;
}

const rarityColors = { common: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  rare: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
  epic: "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200",
  legendary: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
}

const rarityIcons = { common: Star,
  rare: Award,
  epic: Trophy,
  legendary: Trophy,
}

interface UserAchievementsProps {}
  userId: string;
}

export function UserAchievements({ userId }: UserAchievementsProps) {}
  const [categories, setCategories] = useState<AchievementCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const api = useApi()

  useEffect(() => {}
    fetchAchievements()
  }, [userId])

  const fetchAchievements = async () => {}
    try {}
      setIsLoading(true)
      const response = await api.get(`/users/${userId}/achievements/`)
      setCategories((response.data as Record<string, unknown>).categories || [])
    } catch {}
      console.error("Failed to load achievements:", err)
    } finally {}
      setIsLoading(false)
    }
  }

  const allAchievements = categories.flatMap(cat => cat.achievements)
  const earnedAchievements = allAchievements.filter(a => a.earned_at)
  const totalPoints = categories.reduce((sum, cat) => sum + cat.total_points, 0)
  const earnedPoints = categories.reduce((sum, cat) => sum + cat.earned_points, 0)

  if (isLoading) {}
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading achievements...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const filteredAchievements = selectedCategory === "all" 
    ? allAchievements;
    : categories.find(cat => cat.name === selectedCategory)?.achievements || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Achievements</h1>
        <div className="flex justify-center space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{earnedAchievements.length}</div>
            <div className="text-sm text-muted-foreground">Achievements Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{earnedPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Completion</div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Overall Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Achievement Progress</span>
                <span>{earnedAchievements.length} / {allAchievements.length}</span>
              </div>
              <Progress;
                value={allAchievements.length > 0 ? (earnedAchievements.length / allAchievements.length) * 100 : 0} 
                className="h-2"
              />
            </div>
            {categories.map((category) => (
              <div key={category.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span>{category.name}</span>
                  <span>{category.earned_points} / {category.total_points} pts</span>
                </div>
                <Progress;
                  value={category.total_points > 0 ? (category.earned_points / category.total_points) * 100 : 0} 
                  className="h-1"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full">
          <TabsTrigger value="all">All Achievements</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.name} value={category.name}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => {}
              const isEarned = !!achievement.earned_at;
              const RarityIcon = rarityIcons[achievement.rarity]
              return (
                <Card;
                  key={achievement.id} 
                  className={`relative ${isEarned ? "ring-2 ring-primary" : "opacity-60"}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        {isEarned ? (
                          <RarityIcon className="w-6 h-6 text-primary" />
                        ) : (
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <Badge className={rarityColors[achievement.rarity]}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{achievement.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {achievement.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Points</span>
                        <span className="font-semibold">{achievement.points}</span>
                      </div>
                      {achievement.progress && !isEarned && (
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress.current} / {achievement.progress.required}</span>
                          </div>
                          <Progress;
                            value={(achievement.progress.current / achievement.progress.required) * 100} 
                            className="h-1"
                          />
                        </div>
                      )}
                      {isEarned && achievement.earned_at && (
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>Earned {formatDistanceToNow(new Date(achievement.earned_at))} ago</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {filteredAchievements.length === 0 && (
            <Card>
              <CardContent className="text-center p-8">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No achievements yet</h3>
                <p className="text-muted-foreground">
                  Start watching videos and participating in parties to earn achievements!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
