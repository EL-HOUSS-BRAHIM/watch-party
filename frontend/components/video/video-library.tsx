"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Play, MoreHorizontal, Edit, Trash2, Share, Download, Eye, Clock, Calendar, Upload } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Video {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  file_size: string
  views: number
  created_at: string
  is_public: boolean
  tags: string[]
  quality: string[]
}

interface VideoLibraryProps {
  searchQuery: string
  viewMode: "grid" | "list"
}

// Mock video data
const mockVideos: Video[] = [
  {
    id: "1",
    title: "Vacation Highlights 2024",
    description: "Amazing moments from our summer vacation in Europe",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: "12:34",
    file_size: "245 MB",
    views: 156,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    is_public: true,
    tags: ["vacation", "travel", "europe"],
    quality: ["1080p", "720p", "480p"],
  },
  {
    id: "2",
    title: "Cooking Tutorial: Pasta Carbonara",
    description: "Step-by-step guide to making authentic Italian carbonara",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: "25:18",
    file_size: "512 MB",
    views: 89,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(), // 1 week ago
    is_public: false,
    tags: ["cooking", "tutorial", "italian"],
    quality: ["1080p", "720p"],
  },
  {
    id: "3",
    title: "Birthday Party Memories",
    description: "Celebrating another year with friends and family",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: "8:45",
    file_size: "178 MB",
    views: 234,
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(), // 2 weeks ago
    is_public: false,
    tags: ["birthday", "family", "celebration"],
    quality: ["720p", "480p"],
  },
  {
    id: "4",
    title: "Guitar Practice Session",
    description: "Working on some new songs and techniques",
    thumbnail: "/placeholder.svg?height=200&width=300",
    duration: "45:22",
    file_size: "892 MB",
    views: 67,
    created_at: new Date(Date.now() - 86400000 * 21).toISOString(), // 3 weeks ago
    is_public: true,
    tags: ["music", "guitar", "practice"],
    quality: ["1080p", "720p", "480p"],
  },
]

export function VideoLibrary({ searchQuery, viewMode }: VideoLibraryProps) {
  const [videos, setVideos] = useState<Video[]>(mockVideos)

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const deleteVideo = (videoId: string) => {
    setVideos((prev) => prev.filter((video) => video.id !== videoId))
  }

  const togglePublic = (videoId: string) => {
    setVideos((prev) => prev.map((video) => (video.id === videoId ? { ...video, is_public: !video.is_public } : video)))
  }

  const renderGridView = (video: Video) => (
    <Card
      key={video.id}
      className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all group"
    >
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative">
          <img
            src={video.thumbnail || "/placeholder.svg"}
            alt={video.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg flex items-center justify-center">
            <Button size="icon" className="w-12 h-12 rounded-full">
              <Play className="w-6 h-6" />
            </Button>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
          <div className="absolute top-2 left-2">
            <Badge variant={video.is_public ? "secondary" : "outline"} className="text-xs">
              {video.is_public ? "Public" : "Private"}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-sm line-clamp-2 flex-1">{video.title}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => togglePublic(video.id)}>
                  <Share className="w-4 h-4 mr-2" />
                  {video.is_public ? "Make Private" : "Make Public"}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => deleteVideo(video.id)} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{video.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {video.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{video.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
              </div>
            </div>
            <span>{video.file_size}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderListView = (video: Video) => (
    <Card key={video.id} className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0">
            <img
              src={video.thumbnail || "/placeholder.svg"}
              alt={video.title}
              className="w-32 h-20 object-cover rounded-lg"
            />
            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
              {video.duration}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-medium mb-1">{video.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
              </div>
              <Badge variant={video.is_public ? "secondary" : "outline"} className="ml-2">
                {video.is_public ? "Public" : "Private"}
              </Badge>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-2">
              {video.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{video.views} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{video.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
                </div>
                <span>{video.file_size}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Button size="sm">
                  <Play className="w-4 h-4 mr-1" />
                  Play
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => togglePublic(video.id)}>
                      <Share className="w-4 h-4 mr-2" />
                      {video.is_public ? "Make Private" : "Make Public"}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteVideo(video.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (filteredVideos.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No videos found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? "Try adjusting your search terms" : "Upload your first video to get started"}
          </p>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload Video
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Videos</h2>
        <Badge variant="secondary">{filteredVideos.length} videos</Badge>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map(renderGridView)}
        </div>
      ) : (
        <div className="space-y-4">{filteredVideos.map(renderListView)}</div>
      )}
    </div>
  )
}
