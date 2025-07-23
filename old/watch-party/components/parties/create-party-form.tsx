"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Calendar, Video, Lock, VideoIcon, Clock, Film, Copy, Check, Users, Globe, UserCheck, Settings, Plus } from "lucide-react"

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

export function CreatePartyForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "private",
    start_time: "",
    max_participants: 50,
    require_approval: false,
    allow_chat: true,
    allow_reactions: true,
  })
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [showMovieSelector, setShowMovieSelector] = useState(false)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loadingMovies, setLoadingMovies] = useState(false)
  const [createdParty, setCreatedParty] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (showMovieSelector) {
      fetchMovies()
    }
  }, [showMovieSelector])

  const fetchMovies = async () => {
    try {
      setLoadingMovies(true)
      const response = await fetch('/api/videos/movies/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMovies(data.movies || [])
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load movies from Google Drive',
        variant: 'destructive'
      })
    } finally {
      setLoadingMovies(false)
    }
  }

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie)
    setShowMovieSelector(false)
    toast({
      title: 'Movie Selected',
      description: `"${movie.name}" has been selected for the party`
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedMovie) {
      toast({
        title: 'Error',
        description: 'Please select a movie for the party',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      // Create the party
      const response = await api.post("/api/parties/", {
        ...formData,
        scheduled_start: formData.start_time || undefined
      })

      // Select the movie for the party
      await api.post(`/api/parties/${response.id}/select_gdrive_movie/`, {
        gdrive_file_id: selectedMovie.id
      })

      setCreatedParty({
        ...response,
        movie: selectedMovie
      })

      toast({
        title: "Party created!",
        description: "Your watch party has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create party. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const copyRoomCode = () => {
    if (createdParty?.room_code) {
      navigator.clipboard.writeText(createdParty.room_code)
      toast({
        title: 'Copied!',
        description: 'Room code copied to clipboard'
      })
    }
  }

  const copyInviteLink = () => {
    if (createdParty?.room_code) {
      const link = `${window.location.origin}/join?code=${createdParty.room_code}`
      navigator.clipboard.writeText(link)
      toast({
        title: 'Copied!',
        description: 'Invite link copied to clipboard'
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (createdParty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <Check className="h-5 w-5 mr-2" />
            Party Created Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div>
              <Label className="text-sm font-medium">Party Title</Label>
              <p className="text-lg font-semibold">{createdParty.title}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Selected Movie</Label>
              <p className="flex items-center">
                <Film className="h-4 w-4 mr-2" />
                {selectedMovie?.name}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div>
                <Label className="text-sm font-medium">Room Code</Label>
                <div className="flex items-center space-x-2">
                  <code className="bg-white px-3 py-1 rounded border text-lg font-mono">
                    {createdParty.room_code}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyRoomCode}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={() => router.push(`/dashboard/parties/${createdParty.id}`)}
              className="flex-1"
            >
              Go to Party
            </Button>
            <Button 
              variant="outline" 
              onClick={copyInviteLink}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Invite Link
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Party Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Movie Night with Friends"
              className="input-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Let's watch an awesome movie together!"
              className="input-base min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VideoIcon className="h-5 w-5" />
            Movie Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Selected Movie *</Label>
            <Dialog open={showMovieSelector} onOpenChange={setShowMovieSelector}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <VideoIcon className="h-4 w-4 mr-2" />
                  {selectedMovie ? 'Change Movie' : 'Select Movie'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Select Movie from Google Drive</DialogTitle>
                  <DialogDescription>
                    Choose a movie from your Google Drive to play during the party
                  </DialogDescription>
                </DialogHeader>
                
                {loadingMovies ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-200 h-20 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {movies.map((movie) => (
                      <Card
                        key={movie.id}
                        className={`cursor-pointer transition-colors ${
                          selectedMovie?.id === movie.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleMovieSelect(movie)}
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {selectedMovie ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                {selectedMovie.thumbnail_url ? (
                  <img 
                    src={selectedMovie.thumbnail_url} 
                    alt={selectedMovie.name}
                    className="w-16 h-12 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <VideoIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{selectedMovie.name}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{formatFileSize(selectedMovie.size)}</span>
                    {selectedMovie.resolution && (
                      <span>{selectedMovie.resolution}</span>
                    )}
                    {selectedMovie.duration && (
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {Math.round(selectedMovie.duration / 60000)} min
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Alert>
              <VideoIcon className="h-4 w-4" />
              <AlertDescription>
                Please select a movie from your Google Drive to continue
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Party Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => handleInputChange("start_time", e.target.value)}
                className="input-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) => handleInputChange("visibility", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Private
                    </div>
                  </SelectItem>
                  <SelectItem value="friends">
                    <div className="flex items-center">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Friends Only
                    </div>
                  </SelectItem>
                  <SelectItem value="public">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Public
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_participants">Max Participants</Label>
            <Select
              value={formData.max_participants.toString()}
              onValueChange={(value) => handleInputChange("max_participants", Number.parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    5 people
                  </div>
                </SelectItem>
                <SelectItem value="10">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    10 people
                  </div>
                </SelectItem>
                <SelectItem value="25">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    25 people
                  </div>
                </SelectItem>
                <SelectItem value="50">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    50 people
                  </div>
                </SelectItem>
                <SelectItem value="100">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    100 people
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Approval</Label>
                <p className="text-xs text-muted-foreground">Users need approval to join</p>
              </div>
              <Switch
                checked={formData.require_approval}
                onCheckedChange={(checked) => handleInputChange("require_approval", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Chat</Label>
                <p className="text-xs text-muted-foreground">Allow participants to chat during the party</p>
              </div>
              <Switch
                checked={formData.allow_chat}
                onCheckedChange={(checked) => handleInputChange("allow_chat", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Reactions</Label>
                <p className="text-xs text-muted-foreground">Allow emoji reactions during playback</p>
              </div>
              <Switch
                checked={formData.allow_reactions}
                onCheckedChange={(checked) => handleInputChange("allow_reactions", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading || !selectedMovie} 
          className="flex-1 btn-primary"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Party
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
