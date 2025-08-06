"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Calendar, Filter, Search, Eye } from "lucide-react"
import { useApi } from "@/hooks/use-api"
import { formatDistanceToNow, formatDuration } from "date-fns"

interface WatchHistoryItem {
  id: string
  video: {
    id: string
    title: string
    thumbnail_url?: string
    duration: number
    views: number
  }
  watched_at: string
  watch_time: number
  completion_percentage: number
  party?: {
    id: string
    name: string
  }
}

interface UserWatchHistoryProps {
  userId: string
}

export function UserWatchHistory({ userId }: UserWatchHistoryProps) {
  const [history, setHistory] = useState<WatchHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBy, setFilterBy] = useState<"all" | "solo" | "party">("all")
  
  const api = useApi()

  useEffect(() => {
    fetchWatchHistory()
  }, [userId])

  const fetchWatchHistory = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/users/${userId}/watch-history/`)
      setHistory(response.data.history || [])
    } catch (err) {
      console.error("Failed to load watch history:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.video.title.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filterBy === "solo") return matchesSearch && !item.party
    if (filterBy === "party") return matchesSearch && !!item.party
    return matchesSearch
  })

  const totalWatchTime = history.reduce((sum, item) => sum + item.watch_time, 0)
  const totalVideos = history.length
  const averageCompletion = history.length > 0 
    ? history.reduce((sum, item) => sum + item.completion_percentage, 0) / history.length
    : 0

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading watch history...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Watch History</h1>
        <div className="flex justify-center space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalVideos}</div>
            <div className="text-sm text-muted-foreground">Videos Watched</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round(totalWatchTime / 3600)}h
            </div>
            <div className="text-sm text-muted-foreground">Total Watch Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round(averageCompletion)}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Completion</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={filterBy === "all" ? "default" : "outline"}
                onClick={() => setFilterBy("all")}
                size="sm"
              >
                All
              </Button>
              <Button
                variant={filterBy === "solo" ? "default" : "outline"}
                onClick={() => setFilterBy("solo")}
                size="sm"
              >
                Solo
              </Button>
              <Button
                variant={filterBy === "party" ? "default" : "outline"}
                onClick={() => setFilterBy("party")}
                size="sm"
              >
                Party
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Watch History */}
      <div className="space-y-4">
        {filteredHistory.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex space-x-4">
                {/* Thumbnail */}
                <div className="relative w-32 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  {item.video.thumbnail_url ? (
                    <img 
                      src={item.video.thumbnail_url}
                      alt={item.video.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${item.completion_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 truncate">
                    {item.video.title}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{Math.round(item.video.duration / 60)}m</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{item.video.views} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Watched {formatDistanceToNow(new Date(item.watched_at))} ago</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {item.completion_percentage}% complete
                    </Badge>
                    <Badge variant="outline">
                      {Math.round(item.watch_time / 60)}m watched
                    </Badge>
                    {item.party && (
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200">
                        Party: {item.party.name}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2">
                  <Button size="sm" onClick={() => window.open(`/videos/${item.video.id}`, '_blank')}>
                    <Play className="w-4 h-4 mr-1" />
                    Watch Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <Card>
          <CardContent className="text-center p-8">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || filterBy !== "all" ? "No matching videos" : "No watch history"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || filterBy !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Start watching videos to build your history!"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
