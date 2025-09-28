import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Filter, Flag, MessageCircle, MoreHorizontal, Reply, Search, Send, ThumbsDown, ThumbsUp } from "lucide-react"
import {}
import {}

'use client'

  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface VideoCommentsProps {}
  videoId: string;
  className?: string;
}

interface Comment {}
  id: string;
  user: {}
    id: string;
    username: string;
    avatar: string;
    isVerified: boolean;
    role?: 'admin' | 'moderator' | 'vip'
  }
  content: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  dislikes: number;
  replyCount: number;
  isLiked: boolean;
  isDisliked: boolean;
  isPinned: boolean;
  isEdited: boolean;
  parentId?: string;
  replies: Comment[]
  reactions: {}
    heart: number;
    laugh: number;
    wow: number;
    sad: number;
    angry: number;
  }
}

interface CommentStats {}
  total: number;
  today: number;
  thisWeek: number;
  averageRating: number;
}

export function VideoComments({ videoId, className }: VideoCommentsProps) {}
  const [comments, setComments] = useState<Comment[]>([])
  const [stats, setStats] = useState<CommentStats>({ total: 0, today: 0, thisWeek: 0, averageRating: 0 })
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [filterBy, setFilterBy] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadComments()
    loadStats()
  }, [videoId, sortBy, filterBy, searchQuery])

  const loadComments = async (page = 1, append = false) => {}
    try {
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams({}
        page: page.toString(),
        sort: sortBy,
        filter: filterBy,
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/videos/${videoId}/comments/?${params}`, {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (append) {
          setComments(prev => [...prev, ...(data.results || [])])
        } else {}
          setComments(data.results || [])
        }
        setHasMore(data.hasNext || false)
        setCurrentPage(page)
      }
    } } catch {
      console.error('Failed to load comments:', error)
      toast({}
        title: 'Error',
        description: 'Failed to load comments.',
        variant: 'destructive',
      })
    } finally {}
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/videos/${videoId}/comments/stats/`, {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } } catch {
      console.error('Failed to load comment stats:', error)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/videos/${videoId}/comments/`, {}
        method: 'POST',
        headers: {}
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}
          content: newComment,
        }),
      })

      if (response.ok) {
        const newCommentData = await response.json()
        setComments(prev => [newCommentData, ...prev])
        setNewComment('')
        setStats(prev => ({ ...prev, total: prev.total + 1, today: prev.today + 1 }))
        toast({}
          title: 'Success',
          description: 'Comment posted successfully!',
        })
      }
    } } catch {
      console.error('Failed to post comment:', error)
      toast({}
        title: 'Error',
        description: 'Failed to post comment.',
        variant: 'destructive',
      })
    } finally {}
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {}
    if (!replyContent.trim()) return;
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/videos/${videoId}/comments/`, {}
        method: 'POST',
        headers: {}
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}
          content: replyContent,
          parentId,
        }),
      })

      if (response.ok) {
        const replyData = await response.json()
        setComments(prev => prev.map(comment => 
          comment.id === parentId;
            ? { ...comment, replies: [...comment.replies, replyData], replyCount: comment.replyCount + 1 }
            : comment;
        ))
        setReplyContent('')
        setReplyingTo(null)
        toast({}
          title: 'Success',
          description: 'Reply posted successfully!',
        })
      }
    } } catch {
      console.error('Failed to post reply:', error)
      toast({}
        title: 'Error',
        description: 'Failed to post reply.',
        variant: 'destructive',
      })
    } finally {}
      setIsSubmitting(false)
    }
  }

  const handleLikeComment = async (commentId: string) => {}
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/comments/${commentId}/like/`, {}
        method: 'POST',
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setComments(prev => prev.map(comment => {}
          if (comment.id === commentId) {
            return {
              ...comment,
              isLiked: !comment.isLiked,
              isDisliked: false,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              dislikes: comment.isDisliked ? comment.dislikes - 1 : comment.dislikes;
            }
          }
          // Handle replies;
          return {
            ...comment,
            replies: comment.replies.map(reply => 
              reply.id === commentId;
                ? {}
                    ...reply,
                    isLiked: !reply.isLiked,
                    isDisliked: false,
                    likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                    dislikes: reply.isDisliked ? reply.dislikes - 1 : reply.dislikes;
                  }
                : reply;
            )
          }
        }))
      }
    } } catch {
      console.error('Failed to like comment:', error)
    }
  }

  const handleDislikeComment = async (commentId: string) => {}
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/comments/${commentId}/dislike/`, {}
        method: 'POST',
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setComments(prev => prev.map(comment => {}
          if (comment.id === commentId) {
            return {
              ...comment,
              isDisliked: !comment.isDisliked,
              isLiked: false,
              dislikes: comment.isDisliked ? comment.dislikes - 1 : comment.dislikes + 1,
              likes: comment.isLiked ? comment.likes - 1 : comment.likes;
            }
          }
          // Handle replies;
          return {
            ...comment,
            replies: comment.replies.map(reply => 
              reply.id === commentId;
                ? {}
                    ...reply,
                    isDisliked: !reply.isDisliked,
                    isLiked: false,
                    dislikes: reply.isDisliked ? reply.dislikes - 1 : reply.dislikes + 1,
                    likes: reply.isLiked ? reply.likes - 1 : reply.likes;
                  }
                : reply;
            )
          }
        }))
      }
    } } catch {
      console.error('Failed to dislike comment:', error)
    }
  }

  const handleReportComment = async (commentId: string) => {}
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/comments/${commentId}/report/`, {}
        method: 'POST',
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({}
          title: 'Success',
          description: 'Comment reported successfully. We will review it shortly.',
        })
      }
    } } catch {
      console.error('Failed to report comment:', error)
      toast({}
        title: 'Error',
        description: 'Failed to report comment.',
        variant: 'destructive',
      })
    }
  }

  const handleDeleteComment = async (commentId: string) => {}
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/comments/${commentId}/`, {}
        method: 'DELETE',
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId))
        setStats(prev => ({ ...prev, total: prev.total - 1 }))
        toast({}
          title: 'Success',
          description: 'Comment deleted successfully.',
        })
      }
    } } catch {
      console.error('Failed to delete comment:', error)
      toast({}
        title: 'Error',
        description: 'Failed to delete comment.',
        variant: 'destructive',
      })
    }
  }

  const loadMoreComments = () => {}
    if (hasMore && !isLoading) {
      loadComments(currentPage + 1, true)
    }
  }

  const getRoleBadge = (role?: string) => {}
    switch (role) {
      case 'admin':
        return <Badge variant="destructive" className="text-xs">Admin</Badge>
      case 'moderator':
        return <Badge variant="secondary" className="text-xs">Mod</Badge>
      case 'vip':
        return <Badge variant="outline" className="text-xs">VIP</Badge>
      default:
        return null;
    }
  }

  const formatDate = (dateString: string) => {}
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    if (diffInMinutes < 1) return 'just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    return date.toLocaleDateString()
  }

  const CommentCard = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-8 mt-2' : ''}`}>
      {comment.isPinned && !isReply && (
        <div className="flex items-center gap-1 mb-2 text-sm text-muted-foreground">
          <MessageCircle className="w-3 h-3" />
          Pinned comment;
        </div>
      )}
      <Card className={comment.isPinned && !isReply ? 'border-primary' : ''}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.user.avatar} />
              <AvatarFallback>{comment.user.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{comment.user.username}</span>
                {comment.user.isVerified && <Badge variant="secondary" className="text-xs">✓</Badge>}
                {getRoleBadge(comment.user.role)}
                <span className="text-sm text-muted-foreground">
                  {formatDate(comment.createdAt)}
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-muted-foreground">(edited)</span>
                )}
              </div>
              <p className="text-sm mb-3 whitespace-pre-wrap">{comment.content}</p>
              {/* Reactions */}
              <div className="flex items-center gap-4 mb-2">
                <Button;
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikeComment(comment.id)}
                  className={comment.isLiked ? 'text-primary' : ''}
                >
                  <ThumbsUp className={`w-3 h-3 mr-1 ${comment.isLiked ? 'fill-current' : ''}`} />
                  {comment.likes}
                </Button>
                <Button;
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDislikeComment(comment.id)}
                  className={comment.isDisliked ? 'text-destructive' : ''}
                >
                  <ThumbsDown className={`w-3 h-3 mr-1 ${comment.isDisliked ? 'fill-current' : ''}`} />
                  {comment.dislikes}
                </Button>

                {!isReply && (
                  <Button;
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(comment.id)}
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply;
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleReportComment(comment.id)}>
                      <Flag className="w-4 h-4 mr-2" />
                      Report;
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteComment(comment.id)}>
                      Delete Comment;
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Reply form */}
              {replyingTo === comment.id && (
                <div className="mt-3 space-y-2">
                  <Textarea;
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button;
                      size="sm"
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={isSubmitting || !replyContent.trim()}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Reply;
                    </Button>
                    <Button;
                      variant="outline"
                      size="sm"
                      onClick={() => {}
                        setReplyingTo(null)
                        setReplyContent('')
                      }}
                    >
                      Cancel;
                    </Button>
                  </div>
                </div>
              )}

              {/* Show replies count */}
              {!isReply && comment.replyCount > 0 && comment.replies.length === 0 && (
                <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                  View {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      {comment.replies.map(reply => (
        <CommentCard key={reply.id} comment={reply} isReply />
      ))}
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Comment Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comments ({stats.total})</CardTitle>
          <CardDescription>
            {stats.today} today • {stats.thisWeek} this week • Average rating: {stats.averageRating.toFixed(1)}/5;
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input;
              placeholder="Search comments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="most_liked">Most Liked</SelectItem>
              <SelectItem value="most_replies">Most Replies</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-28">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pinned">Pinned</SelectItem>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="popular">Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* New Comment Form */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Textarea;
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                {newComment.length}/500 characters;
              </div>
              <Button;
                onClick={handleSubmitComment}
                disabled={isSubmitting || !newComment.trim() || newComment.length > 500}
              >
                <Send className="w-4 h-4 mr-2" />
                Post Comment;
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map(comment => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
        {hasMore && (
          <div className="text-center">
            <Button;
              variant="outline"
              onClick={loadMoreComments}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load More Comments'}
            </Button>
          </div>
        )}
        {comments.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">No comments yet</h3>
            <p className="text-muted-foreground">Be the first to comment on this video!</p>
          </div>
        )}
      </div>
    </div>
  )
}
