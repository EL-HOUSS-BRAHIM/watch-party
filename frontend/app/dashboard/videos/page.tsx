import { Calendar, Eye, Grid, Heart, Link, List, MessageCircle, MoreHorizontal, Play, Search, Upload, Video } from "lucide-react"
import * as React from "react"
import Image from "next/image"
import { useState, useEffect , useCallback } from "react"
import { WatchPartyButton } from "@/components/ui/watch-party-button"
import { WatchPartyInput } from "@/components/ui/watch-party-input"
import { WatchPartySelect } from "@/components/ui/watch-party-select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {}
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { videosAPI } from "@/lib/api"
import type { Video as APIVideo } from "@/lib/api/types"

"use client"
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
const sortOptions = []
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "most-viewed", label: "Most Viewed" },
  { value: "most-liked", label: "Most Liked" },
  { value: "title", label: "Title A-Z" },
]

const filterOptions = []
  { value: "all", label: "All Videos" },
  { value: "ready", label: "Ready" },
  { value: "processing", label: "Processing" },
  { value: "failed", label: "Failed" },
]

const visibilityOptions = []
  { value: "all", label: "All Visibility" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "unlisted", label: "Unlisted" },
]

function formatDuration(seconds: number): string {}
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

function formatFileSize(gb: number): string {}
  if (gb < 1) {
    return `${Math.round(gb * 1024)} MB`
  }
  return `${gb.toFixed(1)} GB`
}

function formatDate(dateString: string): string {}
  return new Date(dateString).toLocaleDateString("en-US", {}
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function VideoCard({ video }: { video: APIVideo }) {}
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:shadow-primary/10">
      <div className="relative">
        <img;
          src={video.thumbnail || "/placeholder.svg"}
          alt={video.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
          {formatDuration(video.duration || 0)}
        </div>
        {video.status === "processing" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-lg">
            <div className="text-white text-center">
              <div className="mb-2">Processing...</div>
              <Progress value={video.uploadProgress} className="w-32" />
              <div className="text-xs mt-1">{video.uploadProgress}%</div>
            </div>
          </div>
        )}
        <Badge;
          variant={video.status === "ready" ? "default" : video.status === "processing" ? "secondary" : "destructive"}
          className="absolute top-2 left-2"
        >
          {video.status}
        </Badge>
        <Badge variant="outline" className="absolute top-2 right-2 bg-background/80">
          {video.visibility}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-sm line-clamp-2 flex-1">{video.title}</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <WatchPartyButton variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </WatchPartyButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Play className="mr-2 h-4 w-4" />
                Play Video;
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details;
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Delete Video</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{video.description}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {video.views.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {video.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {video.comments}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(video.uploadedAt || video.createdAt || new Date().toISOString())}
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs text-muted-foreground">
          <span>
            {formatFileSize(video.size || 0)} • {video.format || "Unknown"}
          </span>
          {video.status === "ready" && (
            <WatchPartyButton size="sm" variant="outline">
              <Play className="mr-1 h-3 w-3" />
              Play;
            </WatchPartyButton>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function VideoListItem({ video }: { video: APIVideo }) {}
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <img;
              src={video.thumbnail || "/placeholder.svg"}
              alt={video.title}
              className="w-24 h-16 object-cover rounded"
            />
            <div className="absolute bottom-1 right-1 bg-black/80 text-white px-1 py-0.5 rounded text-xs">
              {formatDuration(video.duration || 0)}
            </div>
            {video.status === "processing" && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                <div className="text-white text-xs">{video.uploadProgress}%</div>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-sm line-clamp-1">{video.title}</h3>
              <div className="flex items-center gap-2">
                <Badge;
                  variant={}
                    video.status === "ready" ? "default" : video.status === "processing" ? "secondary" : "destructive"
                  }
                  className="text-xs"
                >
                  {video.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {video.visibility}
                </Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{video.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {video.views.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {video.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {video.comments}
                </span>
                <span>{formatFileSize(video.size || 0)}</span>
                <span>{formatDate(video.uploadedAt || video.createdAt || new Date().toISOString())}</span>
              </div>
              <div className="flex items-center gap-2">
                {video.status === "ready" && (
                  <WatchPartyButton size="sm" variant="outline">
                    <Play className="mr-1 h-3 w-3" />
                    Play;
                  </WatchPartyButton>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <WatchPartyButton variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </WatchPartyButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Play className="mr-2 h-4 w-4" />
                      Play Video;
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details;
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">Delete Video</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function VideosPage() {
  const [videos, setVideos] = useState<APIVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">(&quot;grid&quot;)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterBy, setFilterBy] = useState("all")
  const [visibilityFilter, setVisibilityFilter] = useState("all")

  // Load videos from API;
  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      setLoading(true)
      const response = await videosAPI.getVideos()
      setVideos(response.results || [])
    } } catch {
      console.error("Failed to load videos:", error)
    } finally {}
      setLoading(false)
    }
  }

  // Filter and sort videos;
  const filteredVideos = React.useMemo(() => {}
    let filtered = videos;
    // Search filter;
    if (searchQuery) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Status filter;
    if (filterBy !== "all") {
      filtered = filtered.filter((video) => video.status === filterBy)
    }

    // Visibility filter;
    if (visibilityFilter !== "all") {
      filtered = filtered.filter((video) => video.visibility === visibilityFilter)
    }

    // Sort;
    filtered.sort((a, b) => {}
      switch (sortBy) {
        case "newest":
          return new Date(b.uploadedAt || b.createdAt || 0).getTime() - new Date(a.uploadedAt || a.createdAt || 0).getTime()
        case "oldest":
          return new Date(a.uploadedAt || a.createdAt || 0).getTime() - new Date(b.uploadedAt || b.createdAt || 0).getTime()
        case "most-viewed":
          return b.views - a.views;
        case "most-liked":
          return b.likes - a.likes;
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return 0;
      }
    })

    return filtered;
  }, [videos, searchQuery, sortBy, filterBy, visibilityFilter])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-3/4 mb-3" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Videos</h1>
          <p className="text-muted-foreground">Manage your uploaded videos and watch party content</p>
        </div>
        <Link href="/dashboard/videos/upload">
          <WatchPartyButton>
            <Upload className="mr-2 h-4 w-4" />
            Upload Video;
          </WatchPartyButton>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <WatchPartyInput;
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="flex gap-2">
          <WatchPartySelect;
            options={sortOptions}
            value={sortBy}
            onValueChange={(value) => setSortBy(value as string)}
            placeholder="Sort by..."
            className="w-40"
          />
          <WatchPartySelect;
            options={filterOptions}
            value={filterBy}
            onValueChange={(value) => setFilterBy(value as string)}
            placeholder="Filter..."
            className="w-32"
          />
          <WatchPartySelect;
            options={visibilityOptions}
            value={visibilityFilter}
            onValueChange={(value) => setVisibilityFilter(value as string)}
            placeholder="Visibility..."
            className="w-36"
          />
        </div>
        <div className="flex border rounded-md">
          <WatchPartyButton;
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode(&quot;grid&quot;)}
            className="rounded-r-none"
          >
            <Grid className="h-4 w-4" />
          </WatchPartyButton>
          <WatchPartyButton;
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode(&quot;list&quot;)}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </WatchPartyButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{videos.length}</div>
            <p className="text-xs text-muted-foreground">Total Videos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{videos.filter((v) => v.status === &quot;ready&quot;).length}</div>
            <p className="text-xs text-muted-foreground">Ready</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{videos.filter((v) => v.status === &quot;processing&quot;).length}</div>
            <p className="text-xs text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{videos.reduce((acc, v) => acc + v.views, 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>
      </div>

      {/* Videos Grid/List */}
      {filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No videos found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterBy !== "all" || visibilityFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Upload your first video to get started"}
            </p>
            <Link href="/dashboard/videos/upload">
              <WatchPartyButton>
                <Upload className="mr-2 h-4 w-4" />
                Upload Video;
              </WatchPartyButton>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div;
          className={}
            viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"
          }
        >
          {filteredVideos.map((video) =>
            viewMode === "grid" ? (
              <VideoCard key={video.id} video={video} />
            ) : (
              <VideoListItem key={video.id} video={video} />
            ),
          )}
        </div>
      )}
    </div>
  )
}
