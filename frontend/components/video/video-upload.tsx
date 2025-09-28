"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDropzone } from "react-dropzone"
import { Upload, File, CheckCircle, AlertCircle, Cloud, HardDrive } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/hooks/use-api"
import { integrationsAPI } from "@/lib/api"

interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export function VideoUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<"local" | "drive">(&quot;local")
  const [videoDetails, setVideoDetails] = useState({
    title: "",
    description: "",
    tags: "",
    genre: "",
    visibility: "public"
  })
  
  const { toast } = useToast()
  const api = useApi()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFile(file)
      setVideoDetails(prev => ({
        ...prev,
        title: file.name.replace(/\.[^/.]+$/, "")
      }))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
    },
    maxFiles: 1,
    disabled: isUploading
  })

  const uploadFile = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 })

    try {
      const formData = new FormData()
      formData.append('video', file)
      formData.append('title', videoDetails.title)
      formData.append('description', videoDetails.description)
      formData.append('tags', videoDetails.tags)
      formData.append('genre', videoDetails.genre)
      formData.append('visibility', videoDetails.visibility)

      const response = await api.post('/videos/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent: unknown) => {
          if (progressEvent.total) {
            const loaded = progressEvent.loaded
            const total = progressEvent.total
            const percentage = Math.round((loaded * 100) / total)
            setUploadProgress({ loaded, total, percentage })
          }
        }
      })

      setUploadComplete(true)
      toast({
        title: "Upload successful!",
        description: "Your video has been uploaded and is being processed",
      })
    } catch (err: unknown) {
      toast({
        title: "Upload failed",
        description: err.response?.data?.message || "Failed to upload video",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const connectGoogleDrive = async () => {
    try {
      const { auth_url } = await integrationsAPI.getGoogleDriveAuthUrl()
      window.location.assign(auth_url)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to connect to Google Drive",
        variant: "destructive"
      })
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (uploadComplete) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-green-600 dark:text-green-400">Upload Complete!</CardTitle>
          <CardDescription>
            Your video has been successfully uploaded and is being processed
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            You'll receive a notification when processing is complete and your video is ready to share.
          </p>
          <div className="flex space-x-2 justify-center">
            <Button onClick={() => window.location.reload()}>
              Upload Another Video
            </Button>
            <Button variant="outline" onClick={() => window.location.href = &quot;/videos/manage"}>
              Manage Videos
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={uploadMethod} onValueChange={(value: unknown) => setUploadMethod(value)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="local" className="flex items-center space-x-2">
            <HardDrive className="w-4 h-4" />
            <span>Local Upload</span>
          </TabsTrigger>
          <TabsTrigger value="drive" className="flex items-center space-x-2">
            <Cloud className="w-4 h-4" />
            <span>Google Drive</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="local" className="space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Video File</CardTitle>
              <CardDescription>
                Select a video file from your computer to upload
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                } ${isUploading ? "cursor-not-allowed opacity-50" : ""}`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                {file ? (
                  <div className="space-y-2">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)} • Ready to upload
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-lg font-medium">
                      {isDragActive ? "Drop the video here" : "Drag & drop your video file"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse • MP4, AVI, MOV, WMV supported
                    </p>
                  </div>
                )}
              </div>

              {uploadProgress && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress.percentage}%</span>
                  </div>
                  <Progress value={uploadProgress.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadProgress.loaded)} of {formatFileSize(uploadProgress.total)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video Details */}
          {file && (
            <Card>
              <CardHeader>
                <CardTitle>Video Details</CardTitle>
                <CardDescription>
                  Provide information about your video
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={videoDetails.title}
                    onChange={(e) => setVideoDetails(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter video title"
                    disabled={isUploading}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={videoDetails.description}
                    onChange={(e) => setVideoDetails(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your video..."
                    rows={3}
                    disabled={isUploading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="genre">Genre</Label>
                    <select
                      id="genre"
                      value={videoDetails.genre}
                      onChange={(e) => setVideoDetails(prev => ({ ...prev, genre: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md"
                      disabled={isUploading}
                    >
                      <option value="">Select genre</option>
                      <option value="action">Action</option>
                      <option value="comedy">Comedy</option>
                      <option value="drama">Drama</option>
                      <option value="horror">Horror</option>
                      <option value="sci-fi">Sci-Fi</option>
                      <option value="documentary">Documentary</option>
                      <option value="animation">Animation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="visibility">Visibility</Label>
                    <select
                      id="visibility"
                      value={videoDetails.visibility}
                      onChange={(e) => setVideoDetails(prev => ({ ...prev, visibility: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-md"
                      disabled={isUploading}
                    >
                      <option value="public">Public</option>
                      <option value="unlisted">Unlisted</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={videoDetails.tags}
                    onChange={(e) => setVideoDetails(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Enter tags separated by commas"
                    disabled={isUploading}
                  />
                </div>

                <Button
                  onClick={uploadFile}
                  disabled={!videoDetails.title || isUploading}
                  className="w-full"
                >
                  {isUploading ? "Uploading..." : "Upload Video"}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="drive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload from Google Drive</CardTitle>
              <CardDescription>
                Connect your Google Drive to upload videos directly
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Cloud className="w-16 h-16 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Connect Google Drive</h3>
                <p className="text-sm text-muted-foreground">
                  Access your videos stored in Google Drive and upload them directly to Watch Party
                </p>
              </div>
              <Button onClick={connectGoogleDrive} data-testid="connect-google-drive-upload">
                Connect Google Drive
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Guidelines */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Upload Guidelines:</strong> Maximum file size is 2GB. 
          Supported formats: MP4, AVI, MOV, WMV, FLV, WebM, MKV. 
          Processing time varies based on file size and may take several minutes.
        </AlertDescription>
      </Alert>
    </div>
  )
}
