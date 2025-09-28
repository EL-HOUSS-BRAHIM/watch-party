"use client"

import { Calendar, Clock, Download, Edit, Eye, Flag, Heart, Loader2, MessageCircle, MoreVertical, Settings, Share, Star, ThumbsDown, ThumbsUp, Trash, User, Users, Video } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow, format } from "date-fns"

interface Video {}
  id: string
  title: string
  description: string
  url: string
  thumbnail: string
  duration: number
  views: number
  likes: number
  dislikes: number
  uploadedAt: string
  updatedAt: string
  status: "processing" | "ready" | "failed"
  visibility: "public" | "private" | "unlisted"
  tags: string[]
  uploader: {}
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
    isVerified: boolean
  }
  metadata: {}
    resolution: string
    fileSize: number
    format: string
    bitrate: number
  }
  analytics: {}
    watchTime: number
    averageWatchTime: number
    retentionRate: number
    topCountries: Array<{ country: string; views: number }>
  }
}

interface Comment {}
  id: string
  content: string
  createdAt: string
  updatedAt: string
  likes: number
  dislikes: number
  author: {}
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
  }
  replies: Comment[]
  isLiked: boolean
  isDisliked: boolean
}

export default function VideoDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const videoId = params.videoId as string
  const [video, setVideo] = useState<Video | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (videoId) {
      loadVideo()
      loadComments()
    }
  }, [videoId])

  const loadVideo = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/videos/${videoId}/`, {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const videoData = await response.json()
        setVideo(videoData)
        setIsLiked(videoData.isLiked || false)
        setIsDisliked(videoData.isDisliked || false)
      } else if (response.status === 404) {
        toast({title: "Video Not Found",
          description: "The video you're looking for doesn't exist.",
          variant: "destructive",
        })
        router.push("/dashboard/videos")
      }
    } catch (err) {
      console.error("Failed to load video:", error)
      toast({title: "Error",
        description: "Failed to load video details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/videos/${videoId}/comments/`, {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const commentsData = await response.json()
        setComments(commentsData.results || [])
      }
    } catch (err) {
      console.error("Failed to load comments:", error)
    }
  }

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/videos/${videoId}/like/`, {}
        method: "POST",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setIsLiked(!isLiked)
        if (isDisliked) setIsDisliked(false)

        setVideo((prev) =>
          prev
            ? {}
                ...prev,
                likes: isLiked ? prev.likes - 1 : prev.likes + 1,
                dislikes: isDisliked ? prev.dislikes - 1 : prev.dislikes,
              }
            : null,
        )
      }
    } catch (err) {
      console.error("Failed to like video:", error)
    }
  }

  const handleDislike = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/videos/${videoId}/dislike/`, {}
        method: "POST",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setIsDisliked(!isDisliked)
        if (isLiked) setIsLiked(false)

        setVideo((prev) =>
          prev
            ? {}
                ...prev,
                dislikes: isDisliked ? prev.dislikes - 1 : prev.dislikes + 1,
                likes: isLiked ? prev.likes - 1 : prev.likes,
              }
            : null,
        )
      }
    } catch (err) {
      console.error("Failed to dislike video:", error)
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/videos/${videoId}`

    if (navigator.share) {
      try {
        await navigator.share({title: video?.title,
          text: video?.description,
          url: shareUrl,
        })
      } catch (err) {
        console.log("Share cancelled")
      }
    } else {}
      navigator.clipboard.writeText(shareUrl)
      toast({title: "Link Copied",
        description: "Video link copied to clipboard.",
      })
    }
  }

  const submitComment = async () => {
    if (!newComment.trim()) return
    setIsSubmittingComment(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/videos/${videoId}/comments/`, {}
        method: "POST",
        headers: {}
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      })

      if (response.ok) {
        const comment = await response.json()
        setComments((prev) => [comment, ...prev])
        setNewComment("")
        toast({title: "Comment Added",
          description: "Your comment has been posted.",
        })
      }
    } catch (err) {
      console.error("Failed to submit comment:", error)
      toast({title: "Error",
        description: "Failed to post comment.",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const deleteVideo = async () => {
    if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) {}
      return
    }

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/videos/${videoId}/`, {}
        method: "DELETE",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({title: "Video Deleted",
          description: "The video has been permanently deleted.",
        })
        router.push("/dashboard/videos")
      }
    } catch (err) {
      console.error("Failed to delete video:", error)
      toast({title: "Error",
        description: "Failed to delete video.",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number) => {}
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDuration = (seconds: number) => {}
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading video details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
          <p className="text-gray-600 mb-4">The video you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push(&quot;/dashboard/videos&quot;)}>Back to Videos</Button>
        </div>
      </div>
    )
  }

  const isOwner = video.uploader.id === user?.id
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()} className=&quot;p-2&quot;>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {video.views.toLocaleString()} views
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(video.uploadedAt), "MMM d, yyyy")}
              </span>
              <Badge variant={video.status === "ready" ? "default" : "secondary"}>{video.status}</Badge>
            </div>
          </div>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/dashboard/videos/${videoId}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Video
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/videos/${videoId}/analytics`)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Analytics
                </DropdownMenuItem>
                <DropdownMenuItem onClick={deleteVideo} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Video
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  {video.status === "ready" ? (
                    <>
                      <video
                        className="w-full h-full object-contain"
                        poster={video.thumbnail}
                        controls
                        preload="metadata"
                      >
                        <source src={video.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-white">
                        {video.status === "processing" ? (
                          <>
                            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                            <p className="text-lg">Processing video...</p>
                            <p className="text-sm opacity-75">This may take a few minutes</p>
                          </>
                        ) : (
                          <>
                            <Film className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">Video processing failed</p>
                            <p className="text-sm opacity-75">Please try uploading again</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Video Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  {video.likes.toLocaleString()}
                </Button>
                <Button
                  variant={isDisliked ? "default" : "outline"}
                  size="sm"
                  onClick={handleDislike}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="h-4 w-4" />
                  {video.dislikes.toLocaleString()}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </Button>
              </div>
            </div>

            {/* Video Info Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{video.description || &quot;No description provided.&quot;}</p>

                    {video.tags.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {video.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Technical Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Duration:</span>
                        <span className="ml-2">{formatDuration(video.duration)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Resolution:</span>
                        <span className="ml-2">{video.metadata.resolution}</span>
                      </div>
                      <div>
                        <span className="font-medium">File Size:</span>
                        <span className="ml-2">{formatFileSize(video.metadata.fileSize)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Format:</span>
                        <span className="ml-2">{video.metadata.format}</span>
                      </div>
                      <div>
                        <span className="font-medium">Bitrate:</span>
                        <span className="ml-2">{video.metadata.bitrate} kbps</span>
                      </div>
                      <div>
                        <span className="font-medium">Visibility:</span>
                        <span className="ml-2 capitalize">{video.visibility}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="space-y-4">
                {/* Add Comment */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {user?.first_name?.[0]}
                          {user?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[80px]"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setNewComment(&quot;&quot;)}
                            disabled={!newComment.trim()}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={submitComment}
                            disabled={!newComment.trim() || isSubmittingComment}
                          >
                            {isSubmittingComment ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <MessageCircle className="h-4 w-4 mr-2" />
                            )}
                            Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">No comments yet</h3>
                        <p className="text-muted-foreground">Be the first to share your thoughts!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    comments.map((comment) => (
                      <Card key={comment.id}>
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {comment.author.firstName[0]}
                                {comment.author.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {comment.author.firstName} {comment.author.lastName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm mb-2">{comment.content}</p>
                              <div className="flex items-center gap-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-6 px-2 ${comment.isLiked ? "text-blue-600" : ""}`}
                                >
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  {comment.likes}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`h-6 px-2 ${comment.isDisliked ? "text-red-600" : ""}`}
                                >
                                  <ThumbsDown className="h-3 w-3 mr-1" />
                                  {comment.dislikes}
                                </Button>
                                <Button variant="ghost" size="sm" className="h-6 px-2">
                                  Reply
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                {isOwner ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Total Watch Time</p>
                              <p className="text-2xl font-bold">{formatDuration(video.analytics.watchTime)}</p>
                            </div>
                            <Clock className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Avg. Watch Time</p>
                              <p className="text-2xl font-bold">{formatDuration(video.analytics.averageWatchTime)}</p>
                            </div>
                            <Eye className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Retention Rate</p>
                              <p className="text-2xl font-bold">{video.analytics.retentionRate}%</p>
                            </div>
                            <Star className="h-8 w-8 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Top Countries</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {video.analytics.topCountries.map((country, index) => (
                            <div key={country.country} className="flex items-center justify-between">
                              <span className="text-sm">
                                {index + 1}. {country.country}
                              </span>
                              <span className="text-sm font-medium">{country.views.toLocaleString()} views</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Analytics Not Available</h3>
                      <p className="text-muted-foreground">Only the video owner can view analytics.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Uploader Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={video.uploader.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {video.uploader.firstName[0]}
                      {video.uploader.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {video.uploader.firstName} {video.uploader.lastName}
                      </h3>
                      {video.uploader.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">@{video.uploader.username}</p>
                  </div>
                </div>
                {!isOwner && (
                  <Button className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Follow
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Video Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Views</span>
                  <span className="font-medium">{video.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Likes</span>
                  <span className="font-medium">{video.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Comments</span>
                  <span className="font-medium">{comments.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Duration</span>
                  <span className="font-medium">{formatDuration(video.duration)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uploaded</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(video.uploadedAt), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Related Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Users className="h-4 w-4 mr-2" />
                  Create Watch Party
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Heart className="h-4 w-4 mr-2" />
                  Add to Favorites
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download Video
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
