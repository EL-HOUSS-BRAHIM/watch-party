import { useState, useEffect } from 'react'
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Clock, Eye, Flag, Heart, MessageCircle, Play, Share, Share2, Star, ThumbsDown, ThumbsUp, Video } from "lucide-react"

"use client"




interface VideoDetailsProps {}
  videoId: string;
  onWatchParty?: () => void;
  onAddToWatchlist?: () => void;
}

interface VideoInfo {}
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnailUrl: string;
  uploadedBy: {}
    id: string;
    username: string;
    avatar: string;
  }
  uploadedAt: string;
  views: number;
  likes: number;
  dislikes: number;
  rating: number;
  tags: string[]
  genre: string[]
  quality: string;
  size: string;
  isLiked: boolean;
  isDisliked: boolean;
  inWatchlist: boolean;
}

interface Comment {}
  id: string;
  user: {}
    id: string;
    username: string;
    avatar: string;
  }
  content: string;
  createdAt: string;
  likes: number;
  replies: Comment[]
}

export function VideoDetails({ videoId, onWatchParty, onAddToWatchlist }: VideoDetailsProps) {}
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [relatedVideos, setRelatedVideos] = useState<VideoInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const { toast } = useToast()

  useEffect(() => {}
    loadVideoDetails()
    loadComments()
    loadRelatedVideos()
  }, [videoId])

  const loadVideoDetails = useCallback(async () => {}
    try {}
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/videos/${videoId}/`, {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {}
        const data = await response.json()
        setVideoInfo(data)
      }
    } catch {}
      console.error('Failed to load video details:', error)
      toast({title: 'Error',
        description: 'Failed to load video details.',
        variant: 'destructive',
      })
    } finally {}
      setIsLoading(false)
    }
  }, [])

  const loadComments = useCallback(async () => {}
    try {}
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/videos/${videoId}/comments/`, {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {}
        const data = await response.json()
        setComments(data.results || [])
      }
    } catch {}
      console.error('Failed to load comments:', error)
    }
  }, [])

  const loadRelatedVideos = useCallback(async () => {}
    try {}
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/videos/${videoId}/related/`, {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {}
        const data = await response.json()
        setRelatedVideos(data.results || [])
      }
    } catch {}
      console.error('Failed to load related videos:', error)
    }
  }, [])

  const handleLike = useCallback(async () => {}
    try {}
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/videos/${videoId}/like/`, {}
        method: 'POST',
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {}
        setVideoInfo(prev => prev ? {}
          ...prev,
          isLiked: !prev.isLiked,
          isDisliked: false,
          likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
          dislikes: prev.isDisliked ? prev.dislikes - 1 : prev.dislikes;
        } : null)
      }
    } catch {}
      console.error('Failed to like video:', error)
      toast({title: 'Error',
        description: 'Failed to like video.',
        variant: 'destructive',
      })
    }
  }, [])

  const handleDislike = useCallback(async () => {}
    try {}
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/videos/${videoId}/dislike/`, {}
        method: 'POST',
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {}
        setVideoInfo(prev => prev ? {}
          ...prev,
          isDisliked: !prev.isDisliked,
          isLiked: false,
          dislikes: prev.isDisliked ? prev.dislikes - 1 : prev.dislikes + 1,
          likes: prev.isLiked ? prev.likes - 1 : prev.likes;
        } : null)
      }
    } catch {}
      console.error('Failed to dislike video:', error)
      toast({title: 'Error',
        description: 'Failed to dislike video.',
        variant: 'destructive',
      })
    }
  }, [])

  const handleAddToWatchlist = useCallback(async () => {}
    try {}
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/videos/${videoId}/watchlist/`, {}
        method: videoInfo?.inWatchlist ? 'DELETE' : 'POST',
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {}
        setVideoInfo(prev => prev ? {}
          ...prev,
          inWatchlist: !prev.inWatchlist;
        } : null)
        toast({title: 'Success',
          description: videoInfo?.inWatchlist ? 'Removed from watchlist' : 'Added to watchlist',
        })
        onAddToWatchlist?.()
      }
    } catch {}
      console.error('Failed to update watchlist:', error)
      toast({title: 'Error',
        description: 'Failed to update watchlist.',
        variant: 'destructive',
      })
    }
  }, [])

  const formatDuration = (seconds: number) => {}
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60;
    if (hours > 0) {}
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {}
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {}
      size /= 1024;
      unitIndex++
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  if (isLoading) {}
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!videoInfo) {}
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Video not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Video Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
              <img;
                src={videoInfo.thumbnailUrl}
                alt={videoInfo.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold mb-2">{videoInfo.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {videoInfo.views.toLocaleString()} views;
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(videoInfo.duration)}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {videoInfo.rating.toFixed(1)}/5;
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={videoInfo.uploadedBy.avatar} />
                  <AvatarFallback>{videoInfo.uploadedBy.username[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{videoInfo.uploadedBy.username}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {new Date(videoInfo.uploadedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {videoInfo.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={onWatchParty} className="w-32">
                <Play className="w-4 h-4 mr-2" />
                Watch Party;
              </Button>
              <Button;
                variant="outline" 
                onClick={handleAddToWatchlist}
                className="w-32"
              >
                <Heart className={`w-4 h-4 mr-2 ${videoInfo.inWatchlist ? 'fill-current' : ''}`} />
                {videoInfo.inWatchlist ? 'In List' : 'Watchlist'}
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Button;
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={videoInfo.isLiked ? 'text-primary' : ''}
            >
              <ThumbsUp className={`w-4 h-4 mr-2 ${videoInfo.isLiked ? 'fill-current' : ''}`} />
              {videoInfo.likes}
            </Button>
            <Button;
              variant="ghost"
              size="sm"
              onClick={handleDislike}
              className={videoInfo.isDisliked ? 'text-destructive' : ''}
            >
              <ThumbsDown className={`w-4 h-4 mr-2 ${videoInfo.isDisliked ? 'fill-current' : ''}`} />
              {videoInfo.dislikes}
            </Button>

            <Button variant="ghost" size="sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              {comments.length} Comments;
            </Button>

            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share;
            </Button>

            <Button variant="ghost" size="sm">
              <Flag className="w-4 h-4 mr-2" />
              Report;
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Video Details Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
          <TabsTrigger value="related">Related Videos</TabsTrigger>
          <TabsTrigger value="details">Technical Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{videoInfo.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Genres</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {videoInfo.genre.map(g => (
                  <Badge key={g} variant="outline">{g}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          {comments.map(comment => (
            <Card key={comment.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.user.avatar} />
                    <AvatarFallback>{comment.user.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{comment.user.username}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{comment.content}</p>
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        {comment.likes}
                      </Button>
                      <Button variant="ghost" size="sm">
                        Reply;
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="related" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedVideos.map(video => (
              <Card key={video.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="relative w-full h-32 rounded-lg overflow-hidden mb-3">
                    <img;
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                  <h3 className="font-medium mb-1 line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {video.views.toLocaleString()} views;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Quality</label>
                  <p className="text-sm text-muted-foreground">{videoInfo.quality}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">File Size</label>
                  <p className="text-sm text-muted-foreground">{videoInfo.size}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <p className="text-sm text-muted-foreground">{formatDuration(videoInfo.duration)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Upload Date</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(videoInfo.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Rating Breakdown</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-12">Likes</span>
                    <Progress value={(videoInfo.likes / (videoInfo.likes + videoInfo.dislikes)) * 100} className="flex-1" />
                    <span className="text-sm text-muted-foreground">{videoInfo.likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm w-12">Dislikes</span>
                    <Progress value={(videoInfo.dislikes / (videoInfo.likes + videoInfo.dislikes)) * 100} className="flex-1" />
                    <span className="text-sm text-muted-foreground">{videoInfo.dislikes}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
