'use client'

import { useState, useEffect } from 'react'
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Video,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Download,
  Share2,
  Calendar,
  Clock,
  FileText,
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface VideoManagementProps {
  className?: string
}

interface VideoItem {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  duration: number
  fileSize: string
  quality: string
  status: 'active' | 'inactive' | 'processing' | 'failed'
  visibility: 'public' | 'private' | 'unlisted'
  uploadedBy: {
    id: string
    username: string
    avatar: string
  }
  uploadedAt: string
  views: number
  likes: number
  comments: number
  tags: string[]
  genre: string[]
  isPublished: boolean
  publishedAt?: string
  scheduledAt?: string
}

interface VideoStats {
  totalVideos: number
  activeVideos: number
  totalViews: number
  totalDuration: number
  storageUsed: string
  bandwidth: string
}

export function VideoManagement({ className }: VideoManagementProps) {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [stats, setStats] = useState<VideoStats>({
    totalVideos: 0,
    activeVideos: 0,
    totalViews: 0,
    totalDuration: 0,
    storageUsed: '0 GB',
    bandwidth: '0 GB'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const { toast } = useToast()

  useEffect(() => {
    loadVideos()
    loadStats()
  }, [currentPage, searchQuery, statusFilter, visibilityFilter, sortBy, activeTab])

  const loadVideos = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : '',
        visibility: visibilityFilter !== 'all' ? visibilityFilter : '',
        sort: sortBy,
        tab: activeTab
      })

      const response = await fetch(`/api/admin/videos/?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const results = data.results ?? []
        setVideos(results)
        const totalItems = data.pagination?.total ?? data.count ?? results.length
        const pageSize = data.pagination?.page_size ?? 20
        setTotalPages(totalItems ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1)
      }
    } catch (error) {
      console.error('Failed to load videos:', error)
      toast({
        title: 'Error',
        description: 'Failed to load videos.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/admin/videos/stats/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to load video stats:', error)
    }
  }

  const handleVideoAction = async (videoId: string, action: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/admin/videos/${videoId}/${action}/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await loadVideos()
        
        const actionMessages = {
          publish: 'Video published successfully',
          unpublish: 'Video unpublished successfully',
          activate: 'Video activated successfully',
          deactivate: 'Video deactivated successfully',
          delete: 'Video deleted successfully'
        }
        
        toast({
          title: 'Success',
          description: actionMessages[action as keyof typeof actionMessages] || 'Action completed successfully',
        })
      }
    } catch (error) {
      console.error(`Failed to ${action} video:`, error)
      toast({
        title: 'Error',
        description: `Failed to ${action} video.`,
        variant: 'destructive',
      })
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedVideos.length === 0) return

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/admin/videos/bulk/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: bulkAction,
          videoIds: selectedVideos,
        }),
      })

      if (response.ok) {
        await loadVideos()
        setSelectedVideos([])
        setBulkAction('')
        
        toast({
          title: 'Success',
          description: `Bulk ${bulkAction} completed successfully`,
        })
      }
    } catch (error) {
      console.error('Failed to perform bulk action:', error)
      toast({
        title: 'Error',
        description: 'Failed to perform bulk action.',
        variant: 'destructive',
      })
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'inactive':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'processing':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      active: 'default',
      inactive: 'secondary',
      processing: 'outline',
      failed: 'destructive'
    }
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getVisibilityBadge = (visibility: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      public: 'default',
      private: 'secondary',
      unlisted: 'outline'
    }
    
    return (
      <Badge variant={variants[visibility] || 'secondary'}>
        {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
      </Badge>
    )
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (sizeStr: string) => {
    const size = parseFloat(sizeStr)
    if (size >= 1024) {
      return `${(size / 1024).toFixed(1)} GB`
    }
    return `${size.toFixed(1)} MB`
  }

  const handleSelectVideo = (videoId: string, checked: boolean) => {
    if (checked) {
      setSelectedVideos(prev => [...prev, videoId])
    } else {
      setSelectedVideos(prev => prev.filter(id => id !== videoId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVideos(videos.map(video => video.id))
    } else {
      setSelectedVideos([])
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Videos</p>
                <p className="text-2xl font-bold">{stats.totalVideos}</p>
              </div>
              <Video className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Videos</p>
                <p className="text-2xl font-bold">{stats.activeVideos}</p>
              </div>
              <Play className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold">{stats.storageUsed}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="unlisted">Unlisted</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="most_viewed">Most Viewed</SelectItem>
                  <SelectItem value="most_liked">Most Liked</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="size">File Size</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedVideos.length > 0 && (
            <div className="flex items-center gap-4 mt-4 p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedVideos.length} video{selectedVideos.length > 1 ? &apos;s' : ''} selected
              </span>
              
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Bulk action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publish">Publish</SelectItem>
                  <SelectItem value="unpublish">Unpublish</SelectItem>
                  <SelectItem value="activate">Activate</SelectItem>
                  <SelectItem value="deactivate">Deactivate</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleBulkAction} disabled={!bulkAction}>
                Apply
              </Button>
              
              <Button variant="outline" onClick={() => setSelectedVideos([])}>
                Clear Selection
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Videos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Video Management</CardTitle>
          <CardDescription>
            Manage all videos in the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedVideos.length === videos.length && videos.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableHead>
                <TableHead>Video</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedVideos.includes(video.id)}
                      onChange={(e) => handleSelectVideo(video.id, e.target.checked)}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative w-16 h-10 rounded overflow-hidden bg-gray-200">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{video.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="w-4 h-4">
                            <AvatarImage src={video.uploadedBy.avatar} />
                            <AvatarFallback className="text-xs">
                              {video.uploadedBy.username[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {video.uploadedBy.username}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(video.status)}
                      {getStatusBadge(video.status)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getVisibilityBadge(video.visibility)}
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      <div>{video.views.toLocaleString()} views</div>
                      <div className="text-muted-foreground">
                        {video.likes} likes • {video.comments} comments
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(video.duration)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {formatFileSize(video.fileSize)}
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(video.uploadedAt).toLocaleDateString()}</div>
                      <div className="text-muted-foreground">
                        {new Date(video.uploadedAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Play className="w-4 h-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        
                        {video.status === 'active' ? (
                          <DropdownMenuItem onClick={() => handleVideoAction(video.id, &apos;deactivate')}>
                            <Pause className="w-4 h-4 mr-2" />
                            Deactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleVideoAction(video.id, &apos;activate')}>
                            <Play className="w-4 h-4 mr-2" />
                            Activate
                          </DropdownMenuItem>
                        )}
                        
                        {video.isPublished ? (
                          <DropdownMenuItem onClick={() => handleVideoAction(video.id, &apos;unpublish')}>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Unpublish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleVideoAction(video.id, &apos;publish')}>
                            <Eye className="w-4 h-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        
                        <DropdownMenuSeparator />
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Video</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{video.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleVideoAction(video.id, &apos;delete')}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {videos.length === 0 && (
            <div className="text-center py-8">
              <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No videos found</h3>
              <p className="text-muted-foreground">No videos match your current filters.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
