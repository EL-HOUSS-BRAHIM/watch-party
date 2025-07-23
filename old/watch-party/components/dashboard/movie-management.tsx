/**
 * Movie management components for Google Drive integration
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { 
  Play, 
  Upload, 
  Trash2, 
  Download, 
  Eye, 
  Clock, 
  File, 
  Search,
  Grid,
  List,
  Filter,
  RefreshCw,
  Cloud,
  VideoIcon
} from 'lucide-react'

interface Movie {
  id: string
  name: string
  size: number
  mime_type: string
  thumbnail_url?: string
  created_time: string
  modified_time: string
  duration?: number
  resolution?: string
}

interface MovieListProps {
  onMovieSelect?: (movie: Movie) => void
  selectable?: boolean
  showUpload?: boolean
}

export const MovieList: React.FC<MovieListProps> = ({ 
  onMovieSelect, 
  selectable = false,
  showUpload = true 
}) => {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchMovies()
  }, [])

  const fetchMovies = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/videos/movies/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch movies')
      }

      const data = await response.json()
      setMovies(data.movies || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: 'Error',
        description: 'Failed to load movies from Google Drive',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMovieClick = (movie: Movie) => {
    if (selectable && onMovieSelect) {
      setSelectedMovie(movie)
      onMovieSelect(movie)
    }
  }

  const handleDeleteMovie = async (movie: Movie) => {
    if (!confirm(`Are you sure you want to delete "${movie.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/videos/movies/${movie.id}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete movie')
      }

      setMovies(movies.filter(m => m.id !== movie.id))
      toast({
        title: 'Success',
        description: 'Movie deleted successfully'
      })
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete movie',
        variant: 'destructive'
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDuration = (milliseconds?: number) => {
    if (!milliseconds) return 'Unknown'
    const seconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}` 
                     : `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  const filteredMovies = movies.filter(movie =>
    movie.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={fetchMovies} variant="outline" className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">My Movies</h2>
          <Badge variant="secondary" className="flex items-center">
            <Cloud className="h-3 w-3 mr-1" />
            Google Drive
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMovies}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          {showUpload && <MovieUpload onUploadComplete={fetchMovies} />}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search movies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Movies Grid/List */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-12">
          <VideoIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">
            {searchTerm ? 'No movies found matching your search.' : 'No movies found. Upload your first movie to get started.'}
          </p>
          {showUpload && !searchTerm && (
            <MovieUpload onUploadComplete={fetchMovies} className="mt-4" />
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-3"
        }>
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              viewMode={viewMode}
              selectable={selectable}
              selected={selectedMovie?.id === movie.id}
              onSelect={() => handleMovieClick(movie)}
              onDelete={() => handleDeleteMovie(movie)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface MovieCardProps {
  movie: Movie
  viewMode: 'grid' | 'list'
  selectable: boolean
  selected: boolean
  onSelect: () => void
  onDelete: () => void
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  viewMode,
  selectable,
  selected,
  onSelect,
  onDelete
}) => {
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (viewMode === 'list') {
    return (
      <Card 
        className={`cursor-pointer transition-colors ${
          selectable ? (selected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50') : ''
        }`}
        onClick={selectable ? onSelect : undefined}
      >
        <CardContent className="flex items-center space-x-4 p-4">
          <div className="flex-shrink-0">
            {movie.thumbnail_url ? (
              <img 
                src={movie.thumbnail_url} 
                alt={movie.name}
                className="w-16 h-12 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                <VideoIcon className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{movie.name}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{formatFileSize(movie.size)}</span>
              {movie.resolution && <span>{movie.resolution}</span>}
              {movie.duration && (
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {Math.round(movie.duration / 60000)} min
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline">
              <Play className="h-3 w-3 mr-1" />
              Play
            </Button>
            <Button size="sm" variant="outline" onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card 
      className={`cursor-pointer transition-colors ${
        selectable ? (selected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md') : 'hover:shadow-md'
      }`}
      onClick={selectable ? onSelect : undefined}
    >
      <CardHeader className="pb-2">
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2">
          {movie.thumbnail_url ? (
            <img 
              src={movie.thumbnail_url} 
              alt={movie.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <VideoIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        <CardTitle className="text-sm truncate" title={movie.name}>
          {movie.name}
        </CardTitle>
        <CardDescription className="text-xs">
          {formatFileSize(movie.size)}
          {movie.resolution && ` • ${movie.resolution}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {movie.duration && (
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {Math.round(movie.duration / 60000)} min
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Button size="sm" variant="outline">
              <Play className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface MovieUploadProps {
  onUploadComplete: () => void
  className?: string
}

const MovieUpload: React.FC<MovieUploadProps> = ({ onUploadComplete, className }) => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          setUploadProgress(progress)
        }
      })

      xhr.onload = () => {
        if (xhr.status === 200) {
          toast({
            title: 'Success',
            description: 'Movie uploaded successfully'
          })
          onUploadComplete()
        } else {
          throw new Error('Upload failed')
        }
        setUploading(false)
        setUploadProgress(0)
      }

      xhr.onerror = () => {
        throw new Error('Upload failed')
      }

      xhr.open('POST', '/api/videos/movies/upload/')
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('access_token')}`)
      xhr.send(formData)

    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to upload movie',
        variant: 'destructive'
      })
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const videoFile = files.find(file => file.type.startsWith('video/'))
    
    if (videoFile) {
      handleFileUpload(videoFile)
    } else {
      toast({
        title: 'Error',
        description: 'Please select a video file',
        variant: 'destructive'
      })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={className}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Movie
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Movie to Google Drive</DialogTitle>
          <DialogDescription>
            Upload a video file to your Google Drive for use in watch parties.
          </DialogDescription>
        </DialogHeader>
        
        {uploading ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Uploading...</p>
              <Progress value={uploadProgress} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}%</p>
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">Drop your video file here</p>
            <p className="text-sm text-gray-500 mb-4">or click to browse</p>
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleFileUpload(file)
                }
              }}
              className="hidden"
              id="video-upload"
            />
            <label htmlFor="video-upload">
              <Button asChild>
                <span>
                  <File className="h-4 w-4 mr-2" />
                  Choose File
                </span>
              </Button>
            </label>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default MovieList
