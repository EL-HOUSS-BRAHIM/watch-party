"use client"

import { useState, useEffect , useCallback } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Clock, Filter, Grid, Heart, List, Play, Search } from "lucide-react"
import { useApi } from "@/hooks/use-api"
import { formatDistanceToNow } from "date-fns"


interface FavoriteVideo {}
  id: string
  video: {}
    id: string
    title: string
    description: string
    thumbnail_url?: string
    duration: number
    views: number
    genre?: string
    tags: string[]
  }
  added_at: string
}

interface UserFavoritesProps {}
  userId: string
}

export function UserFavorites({ userId }: UserFavoritesProps) {}
  const [favorites, setFavorites] = useState<FavoriteVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">(&quot;grid&quot;)
  const [genreFilter, setGenreFilter] = useState<string>(&quot;all&quot;)
  const api = useApi()

  useEffect(() => {
    fetchFavorites()
  }, [userId])

  const fetchFavorites = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/users/${userId}/favorites/`)
      setFavorites((response.data as Record<string, unknown>).favorites || [])
    } catch (err) {
      console.error("Failed to load favorites:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const removeFavorite = async (videoId: string) => {}
    try {
      await api.delete(`/users/${userId}/favorites/${videoId}/`)
      setFavorites(favorites.filter(fav => fav.video.id !== videoId))
    } catch (err) {
      console.error("Failed to remove favorite:", err)
    }
  }

  const filteredFavorites = favorites.filter(favorite => {}
    const matchesSearch = favorite.video.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = genreFilter === "all" || favorite.video.genre === genreFilter
    return matchesSearch && matchesGenre
  })

  const genres = Array.from(new Set(favorites.map(fav => fav.video.genre).filter(Boolean)))

  const formatDuration = (seconds: number) => {}
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading favorites...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Favorite Videos</h1>
        <p className="text-muted-foreground">
          Your collection of liked videos • {favorites.length} total
        </p>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Genres</option>
                {genres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode(&quot;grid&quot;)}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode(&quot;list&quot;)}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favorites */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFavorites.map((favorite) => (
            <Card key={favorite.id} className="group hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                  {favorite.video.thumbnail_url ? (
                    <img
                      src={favorite.video.thumbnail_url}
                      alt={favorite.video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFavorite(favorite.video.id)}
                >
                  <Heart className="w-4 h-4 fill-current" />
                </Button>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                  {favorite.video.title}
                </h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>{formatDuration(favorite.video.duration)}</span>
                    <span>{favorite.video.views} views</span>
                  </div>
                  <div>
                    Added {formatDistanceToNow(new Date(favorite.added_at))} ago
                  </div>
                  {favorite.video.genre && (
                    <Badge variant="secondary" className="text-xs">
                      {favorite.video.genre}
                    </Badge>
                  )}
                </div>

                <Button size="sm" className="w-full mt-3">
                  <Play className="w-4 h-4 mr-1" />
                  Watch
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFavorites.map((favorite) => (
            <Card key={favorite.id}>
              <CardContent className="p-4">
                <div className="flex space-x-4">
                  <div className="w-32 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {favorite.video.thumbnail_url ? (
                      <img
                        src={favorite.video.thumbnail_url}
                        alt={favorite.video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      {favorite.video.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {favorite.video.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(favorite.video.duration)}</span>
                      </div>
                      <span>{favorite.video.views} views</span>
                      <span>Added {formatDistanceToNow(new Date(favorite.added_at))} ago</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {favorite.video.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button size="sm">
                      <Play className="w-4 h-4 mr-1" />
                      Watch
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeFavorite(favorite.video.id)}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredFavorites.length === 0 && (
        <Card>
          <CardContent className="text-center p-8">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || genreFilter !== "all" ? "No matching favorites" : "No favorites yet"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery || genreFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Start adding videos to your favorites to see them here!"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
