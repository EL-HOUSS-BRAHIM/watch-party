"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Play,
  Download,
  Share2,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  FileVideo,
  Loader2,
  CheckCircle,
  AlertCircle,
  Grid,
  List,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

interface Video {
  id: string
  title: string
  description: string
  filename: string
  fileSize: number
  duration: number
  thumbnail?: string
  uploadedAt: string
  status: "processing" | "ready" | "failed"
  processingProgress?: number
  views: number
  isPublic: boolean
  tags: string[]
  qualityVariants: Array<{
    quality: string
    url: string
    fileSize: number
  }>
}

interface VideoLibraryProps {
  onVideoSelect?: (video: Video) => void
  selectionMode?: boolean
  className?: string
}

export default function VideoLibrary({ onVideoSelect, selectionMode = false, className }: VideoLibraryProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("uploadedAt")
  const [filterBy, setFilterBy] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">(&quot;grid")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    loadVideos()
  }, [sortBy, filterBy])

  const loadVideos = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const params = new URLSearchParams({
        sort: sortBy,
        filter: filterBy,
      })

      const response = await fetch(`/api/videos/?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setVideos(data.results || data)
      }
    } catch (error) {
      console.error("Failed to load videos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/videos/${videoId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setVideos((prev) => prev.filter((v) => v.id !== videoId))
      }
    } catch (error) {
      console.error("Failed to delete video:", error)
    }
  }

  const regenerateThumbnail = async (videoId: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      await fetch(`/api/videos/${videoId}/regenerate-thumbnail/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Reload videos to get updated thumbnail
      loadVideos()
    } catch (error) {
      console.error("Failed to regenerate thumbnail:", error)
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "ready" && video.status === "ready") ||
      (filterBy === "processing" && video.status === "processing") ||
      (filterBy === "public" && video.isPublic) ||
      (filterBy === "private" && !video.isPublic)

    return matchesSearch && matchesFilter
  })

  const VideoCard = ({ video }: { video: Video }) => (
    <Card
      className={cn("hover:shadow-lg transition-shadow cursor-pointer", selectionMode && "hover:border-blue-500")}
      onClick={() => (selectionMode ? onVideoSelect?.(video) : setSelectedVideo(video))}
    >
      <div className="relative">
        <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
          {video.thumbnail ? (
            <img src={video.thumbnail || "/placeholder.svg"} alt={video.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileVideo className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {formatDuration(video.duration)}
        </div>

        <div className="absolute top-2 left-2 flex items-center gap-1">
          {getStatusIcon(video.status)}
          {video.status === "processing" && video.processingProgress && (
            <div className="bg-black/70 text-white text-xs px-2 py-1 rounded">{video.processingProgress}%</div>
          )}
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="text-base line-clamp-2">{video.title}</CardTitle>
        <CardDescription className="line-clamp-2">{video.description}</CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>{formatFileSize(video.fileSize)}</span>
          <span>{video.views} views</span>
        </div>

        {video.status === "processing" && video.processingProgress && (
          <Progress value={video.processingProgress} className="mb-2" />
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {video.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {video.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{video.tags.length - 2}
              </Badge>
            )}
          </div>

          {!selectionMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Play className="mr-2 h-4 w-4" />
                  Play
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => regenerateThumbnail(video.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Regenerate Thumbnail
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => deleteVideo(video.id)} className=&quot;text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const VideoListItem = ({ video }: { video: Video }) => (
    <Card
      className={cn("hover:shadow-md transition-shadow cursor-pointer", selectionMode && "hover:border-blue-500")}
      onClick={() => (selectionMode ? onVideoSelect?.(video) : setSelectedVideo(video))}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative w-32 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            {video.thumbnail ? (
              <img
                src={video.thumbnail || "/placeholder.svg"}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileVideo className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
              {formatDuration(video.duration)}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium line-clamp-1">{video.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{video.description}</p>

                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{formatFileSize(video.fileSize)}</span>
                  <span>{video.views} views</span>
                  <span>{new Date(video.uploadedAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(video.status)}
                    <span className="capitalize">{video.status}</span>
                  </div>
                </div>

                {video.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {video.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {!selectionMode && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Play className="mr-2 h-4 w-4" />
                      Play
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => regenerateThumbnail(video.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Regenerate Thumbnail
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteVideo(video.id)} className=&quot;text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Video Library</h2>
          <p className="text-gray-600">Manage your uploaded videos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === &quot;grid" ? "list" : "grid")}>
            {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className=&quot;h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="uploadedAt">Recently Uploaded</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
            <SelectItem value="views">Most Viewed</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
            <SelectItem value="fileSize">File Size</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Videos</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your videos...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="text-center py-8">
          <FileVideo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No videos found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? "Try adjusting your search terms" : "Upload your first video to get started"}
          </p>
        </div>
      ) : (
        <div
          className={cn(viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4")}
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

      {/* Video Details Dialog */}
      {selectedVideo && (
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedVideo.title}</DialogTitle>
              <DialogDescription>{selectedVideo.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {selectedVideo.thumbnail ? (
                  <img
                    src={selectedVideo.thumbnail || "/placeholder.svg"}
                    alt={selectedVideo.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileVideo className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Duration:</span>
                  <p>{formatDuration(selectedVideo.duration)}</p>
                </div>
                <div>
                  <span className="font-medium">File Size:</span>
                  <p>{formatFileSize(selectedVideo.fileSize)}</p>
                </div>
                <div>
                  <span className="font-medium">Views:</span>
                  <p>{selectedVideo.views}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(selectedVideo.status)}
                    <span className="capitalize">{selectedVideo.status}</span>
                  </div>
                </div>
              </div>

              {selectedVideo.qualityVariants.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Available Qualities:</h4>
                  <div className="space-y-2">
                    {selectedVideo.qualityVariants.map((variant) => (
                      <div key={variant.quality} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>{variant.quality}</span>
                        <span className="text-sm text-gray-600">{formatFileSize(variant.fileSize)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button>
                  <Play className="mr-2 h-4 w-4" />
                  Play
                </Button>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export { VideoLibrary }
