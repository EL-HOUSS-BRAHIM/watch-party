"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useVideos } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { videosAPI } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  Plus,
  Search,
  Play,
  Eye,
  Heart,
  Clock,
  Filter,
  Grid3X3,
  List,
  Video as VideoIcon,
  Upload,
  Loader2,
  Trash2,
  Edit,
  Share2,
  MoreVertical,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Video } from "@/lib/api/types"

export default function VideosPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">(&quot;grid&quot;)
  const [sortBy, setSortBy] = useState("created")
  const [visibility, setVisibility] = useState("all")
  
  const { videos, loading, error, refresh } = useVideos({
    search: searchQuery,
    visibility: visibility === "all" ? undefined : visibility as Record<string, unknown>,
  })

  const deleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return
    }

    try {
      if (!videosAPI) {
        console.error('Videos API not available')
        return
      }
      
      await videosAPI.deleteVideo(videoId)
      
      toast({
        title: "Video Deleted",
        description: "The video has been successfully deleted.",
      })
      refresh()
    } catch {
      console.error("Failed to delete video:", error)
      toast({
        title: "Error",
        description: "Failed to delete the video. Please try again.",
        variant: "destructive",
      })
        })
        return
      }
      console.error("Failed to delete video:", error)
      toast({
        title: "Error",
        description: "Failed to delete video. Please try again.",
        variant: "destructive",
      })
    }
  }

  const shareVideo = async (video: Video) => {
    const shareUrl = `${window.location.origin}/videos/${video.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: shareUrl,
        })
      } catch {
        console.log("Share cancelled")
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link Copied",
        description: "Video link copied to clipboard.",
      })
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const VideoCard = ({ video }: { video: Video }) => (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg overflow-hidden">
          {video.thumbnail ? (
            <img
              src={video.thumbnail || "/placeholder.svg"}
              alt={video.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <VideoIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
            {video.duration_formatted}
          </div>

          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              {video.visibility}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          
          {video.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{video.description}</p>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {video.view_count.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {video.likes}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(video.created_at || video.createdAt || new Date()).toLocaleDateString()}
            </div>
          </div>

          {/* Remove tags section since it's not in the Video interface */}

          <div className="flex items-center justify-between">
            <Button onClick={() => router.push(`/videos/${video.id}`)} size=&quot;sm&quot; className=&quot;flex-1 mr-2">
              <Play className="h-4 w-4 mr-2" />
              Watch
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/videos/${video.id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareVideo(video)}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => deleteVideo(video.id)} className=&quot;text-destructive&quot;>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-white" />
          <h1 className="text-2xl font-semibold text-white mb-2">Loading Videos...</h1>
          <p className="text-white/60">Fetching your video library</p>
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
              <VideoIcon className="h-8 w-8" />
              Video Library
            </h1>
            <p className="text-muted-foreground mt-2">Manage and organize your video content</p>
          </div>
          <Link href="/dashboard/videos/upload">
            <Button size="lg" className="shadow-lg">
              <Upload className="h-5 w-5 mr-2" />
              Upload Video
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search videos by title, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Videos</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="likes">Likes</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(&quot;grid&quot;)}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(&quot;list&quot;)}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {error ? (
          <div className="text-center py-12">
            <VideoIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Error Loading Videos</h3>
            <p className="text-muted-foreground mb-4">There was an error loading your videos.</p>
            <Button onClick={refresh}>Try Again</Button>
          </div>
        ) : !videos?.results?.length ? (
          <div className="text-center py-12">
            <VideoIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Videos Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "No videos match your search criteria." : "You haven't uploaded any videos yet."}
            </p>
            <Link href="/dashboard/videos/upload">
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Your First Video
              </Button>
            </Link>
          </div>
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4",
            )}
          >
            {videos.results.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}

        {/* Pagination would go here if needed */}
        {videos?.results && videos.results.length > 0 && (
          <div className="mt-8 text-center text-muted-foreground">
            Showing {videos.results.length} of {videos?.count || videos.results.length} videos
          </div>
        )}
      </div>
    </div>
  )
}
