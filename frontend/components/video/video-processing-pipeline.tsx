"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { videosAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface ProcessingJob {
  id: string
  filename: string
  originalSize: number
  status: "queued" | "processing" | "completed" | "failed" | "cancelled"
  progress: number
  startedAt: string
  completedAt?: string
  duration?: number
  tasks: ProcessingTask[]
  outputFiles: OutputFile[]
  metadata: VideoMetadata
}

interface ProcessingTask {
  id: string
  name: string
  status: "pending" | "running" | "completed" | "failed"
  progress: number
  estimatedTime?: number
  error?: string
}

interface OutputFile {
  id: string
  type: "video" | "thumbnail" | "preview" | "subtitle" | "metadata"
  quality?: string
  format: string
  size: number
  url: string
}

interface VideoMetadata {
  duration: number
  resolution: string
  bitrate: number
  codec: string
  fps: number
  aspectRatio: string
  audioCodec: string
  audioChannels: number
}

interface ProcessingSettings {
  videoQualities: string[]
  thumbnailCount: number
  previewDuration: number
  enableSubtitles: boolean
  enableMetadataExtraction: boolean
  enableContentAnalysis: boolean
  outputFormats: string[]
}

const mockSettings: ProcessingSettings = {
  videoQualities: ["1080p", "720p", "480p"],
  thumbnailCount: 5,
  previewDuration: 30,
  enableSubtitles: true,
  enableMetadataExtraction: true,
  enableContentAnalysis: true,
  outputFormats: ["mp4", "webm"],
}

export function VideoProcessingPipeline() {
  const [jobs, setJobs] = useState<ProcessingJob[]>([])
  const [settings, setSettings] = useState<ProcessingSettings>({
    videoQualities: ["1080p", "720p", "480p"],
    thumbnailCount: 5,
    previewDuration: 30,
    enableSubtitles: true,
    enableMetadataExtraction: true,
    enableContentAnalysis: true,
    outputFormats: ["mp4", "webm"],
  })
  const [selectedJob, setSelectedJob] = useState<ProcessingJob | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>(&quot;all&quot;)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const normalizeProcessingJob = (job: unknown): ProcessingJob => {
    return {
      id: String(job.id ?? job.job_id ?? Math.random().toString(36).substr(2, 9)),
      filename: job.filename ?? job.original_filename ?? job.name ?? "Unknown File",
      originalSize: job.original_size ?? job.file_size ?? 0,
      status: normalizeStatus(job.status ?? job.state),
      progress: Math.max(0, Math.min(100, job.progress ?? job.completion_percentage ?? 0)),
      startedAt: job.started_at ?? job.created_at ?? new Date().toISOString(),
      completedAt: job.completed_at ?? job.finished_at ?? undefined,
      duration: job.duration ?? job.processing_duration ?? undefined,
      tasks: Array.isArray(job.tasks) ? job.tasks.map(normalizeTask) : [],
      outputFiles: Array.isArray(job.output_files) ? job.output_files.map(normalizeOutputFile) : [],
      metadata: normalizeMetadata(job.metadata ?? job.video_metadata ?? {})
    }
  }

  const normalizeStatus = (status: string): ProcessingJob['status'] => {
    const statusMap: Record<string, ProcessingJob['status']> = {
      'pending': 'queued',
      'queued': 'queued',
      'running': 'processing',
      'processing': 'processing',
      'in_progress': 'processing',
      'completed': 'completed',
      'finished': 'completed',
      'success': 'completed',
      'failed': 'failed',
      'error': 'failed',
      'cancelled': 'cancelled',
      'canceled': 'cancelled'
    }
    return statusMap[status?.toLowerCase()] ?? 'queued'
  }

  const normalizeTask = (task: unknown): ProcessingTask => {
    return {
      id: String(task.id ?? task.task_id ?? Math.random().toString(36).substr(2, 9)),
      name: task.name ?? task.task_name ?? task.type ?? "Processing Task",
      status: normalizeTaskStatus(task.status ?? task.state),
      progress: Math.max(0, Math.min(100, task.progress ?? 0)),
      estimatedTime: task.estimated_time ?? task.eta ?? undefined,
      error: task.error ?? task.error_message ?? undefined
    }
  }

  const normalizeTaskStatus = (status: string): ProcessingTask['status'] => {
    const statusMap: Record<string, ProcessingTask['status']> = {
      'pending': 'pending',
      'waiting': 'pending',
      'running': 'running',
      'processing': 'running',
      'in_progress': 'running',
      'completed': 'completed',
      'finished': 'completed',
      'success': 'completed',
      'failed': 'failed',
      'error': 'failed'
    }
    return statusMap[status?.toLowerCase()] ?? 'pending'
  }

  const normalizeOutputFile = (file: unknown): OutputFile => {
    return {
      id: String(file.id ?? file.file_id ?? Math.random().toString(36).substr(2, 9)),
      type: normalizeFileType(file.type ?? file.file_type),
      quality: file.quality ?? file.resolution ?? undefined,
      format: file.format ?? file.extension ?? file.file_extension ?? "mp4",
      size: file.size ?? file.file_size ?? 0,
      url: file.url ?? file.download_url ?? file.path ?? ""
    }
  }

  const normalizeFileType = (type: string): OutputFile['type'] => {
    const typeMap: Record<string, OutputFile['type']> = {
      'video': 'video',
      'thumbnail': 'thumbnail',
      'thumb': 'thumbnail',
      'preview': 'preview',
      'subtitle': 'subtitle',
      'subtitles': 'subtitle',
      'srt': 'subtitle',
      'vtt': 'subtitle',
      'metadata': 'metadata',
      'meta': 'metadata'
    }
    return typeMap[type?.toLowerCase()] ?? 'video'
  }

  const normalizeMetadata = (metadata: unknown): VideoMetadata => {
    return {
      duration: metadata.duration ?? 0,
      resolution: metadata.resolution ?? metadata.dimensions ?? "Unknown",
      bitrate: metadata.bitrate ?? metadata.bit_rate ?? 0,
      codec: metadata.codec ?? metadata.video_codec ?? "Unknown",
      fps: metadata.fps ?? metadata.frame_rate ?? 0,
      aspectRatio: metadata.aspect_ratio ?? metadata.ratio ?? "Unknown",
      audioCodec: metadata.audio_codec ?? metadata.audio ?? "Unknown",
      audioChannels: metadata.audio_channels ?? metadata.channels ?? 0
    }
  }

  const fetchProcessingJobs = useCallback(async () => {
    setLoading(true)
    try {
      const response = await videosAPI.getProcessingJobs()
      // The API now returns an array directly
      const jobsData = Array.isArray(response) ? response : []
      setJobs(jobsData.map(normalizeProcessingJob))
    } catch {
      console.error('Failed to fetch processing jobs:', error)
      toast({
        title: 'Processing Jobs Unavailable',
        description: 'Unable to load video processing jobs. Please try again later.',
        variant: 'destructive'
      })
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchProcessingJobs()
    
    // Set up polling for active jobs
    const interval = setInterval(() => {
      const hasActiveJobs = jobs.some(job => job.status === &apos;processing&apos; || job.status === &apos;queued')
      if (hasActiveJobs) {
        fetchProcessingJobs()
      }
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(interval)
  }, [fetchProcessingJobs, jobs])

  const filteredJobs = jobs.filter((job) => filterStatus === &quot;all&quot; || job.status === filterStatus)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "queued":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "cancelled":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "running":
        return <Zap className="h-4 w-4 text-blue-600" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pending":
        return <Clock className="h-4 w-4 text-gray-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
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
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleJobAction = (jobId: string, action: "pause" | "resume" | "cancel" | "retry") => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          switch (action) {
            case "cancel":
              return { ...job, status: "cancelled" as const }
            case "retry":
              return { ...job, status: "queued" as const, progress: 0 }
            default:
              return job
          }
        }
        return job
      }),
    )
  }

  const stats = {
    total: jobs.length,
    processing: jobs.filter((j) => j.status === &quot;processing&quot;).length,
    completed: jobs.filter((j) => j.status === &quot;completed").length,
    failed: jobs.filter((j) => j.status === "failed").length,
    queued: jobs.filter((j) => j.status === "queued").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Video Processing Pipeline</h1>
          <p className="text-gray-600 dark:text-gray-400">Automated video transcoding and optimization</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setSettingsDialogOpen(true)} variant=&quot;outline&quot;>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload Video
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queued</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.queued}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label>Filter by status:</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Processing Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Processing Jobs</CardTitle>
          <CardDescription>Monitor video processing progress and manage jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span className="font-medium">{job.filename}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatFileSize(job.originalSize)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={job.progress} className="w-20" />
                      <span className="text-sm">{job.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{job.duration ? formatDuration(job.duration) : &quot;-&quot;}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{new Date(job.startedAt).toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedJob(job)
                          setDetailsDialogOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {job.status === "processing" && (
                        <Button size="sm" variant="outline" onClick={() => handleJobAction(job.id, &quot;pause&quot;)}>
                          <Pause className="h-4 w-4" />
                        </Button>
                      )}
                      {job.status === "failed" && (
                        <Button size="sm" variant="outline" onClick={() => handleJobAction(job.id, &quot;retry&quot;)}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      {(job.status === "processing" || job.status === "queued") && (
                        <Button size="sm" variant="outline" onClick={() => handleJobAction(job.id, &quot;cancel&quot;)}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Job Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>Detailed information about the processing job</DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <Tabs defaultValue="tasks" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="outputs">Outputs</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="space-y-4">
                <div className="space-y-3">
                  {selectedJob.tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTaskStatusIcon(task.status)}
                        <div>
                          <h4 className="font-medium">{task.name}</h4>
                          {task.error && <p className="text-sm text-red-600">{task.error}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {task.estimatedTime && task.status === "running" && (
                          <span className="text-sm text-muted-foreground">
                            ~{Math.round(task.estimatedTime / 60)}min remaining
                          </span>
                        )}
                        <div className="flex items-center gap-2">
                          <Progress value={task.progress} className="w-20" />
                          <span className="text-sm">{task.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="metadata" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration</Label>
                    <p>{formatDuration(selectedJob.metadata.duration)}</p>
                  </div>
                  <div>
                    <Label>Resolution</Label>
                    <p>{selectedJob.metadata.resolution}</p>
                  </div>
                  <div>
                    <Label>Bitrate</Label>
                    <p>{(selectedJob.metadata.bitrate / 1000000).toFixed(1)} Mbps</p>
                  </div>
                  <div>
                    <Label>Codec</Label>
                    <p>{selectedJob.metadata.codec}</p>
                  </div>
                  <div>
                    <Label>Frame Rate</Label>
                    <p>{selectedJob.metadata.fps} fps</p>
                  </div>
                  <div>
                    <Label>Aspect Ratio</Label>
                    <p>{selectedJob.metadata.aspectRatio}</p>
                  </div>
                  <div>
                    <Label>Audio Codec</Label>
                    <p>{selectedJob.metadata.audioCodec}</p>
                  </div>
                  <div>
                    <Label>Audio Channels</Label>
                    <p>{selectedJob.metadata.audioChannels}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="outputs" className="space-y-4">
                <div className="space-y-3">
                  {selectedJob.outputFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {file.type === "video" && <Video className="h-4 w-4" />}
                        {file.type === "thumbnail" && <ImageIcon className="h-4 w-4" />}
                        {file.type === "subtitle" && <FileText className="h-4 w-4" />}
                        <div>
                          <h4 className="font-medium">
                            {file.type} {file.quality && `(${file.quality})`}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {file.format.toUpperCase()} • {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="logs" className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg font-mono text-sm">
                  <div className="space-y-1">
                    <p>[2024-01-28 10:00:00] Job started: {selectedJob.filename}</p>
                    <p>[2024-01-28 10:00:05] Video analysis completed</p>
                    <p>[2024-01-28 10:00:10] Starting transcoding to 1080p</p>
                    <p>[2024-01-28 10:15:30] Transcoding 1080p: 65% complete</p>
                    {selectedJob.status === "completed" && (
                      <>
                        <p>[2024-01-28 10:30:00] Transcoding completed</p>
                        <p>[2024-01-28 10:30:05] Generating thumbnails</p>
                        <p>[2024-01-28 10:30:15] Creating preview clip</p>
                        <p>[2024-01-28 10:30:25] Job completed successfully</p>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Processing Settings</DialogTitle>
            <DialogDescription>Configure video processing pipeline settings</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label>Video Quality Outputs</Label>
              <div className="mt-2 space-y-2">
                {["1080p", "720p", "480p", "360p"].map((quality) => (
                  <div key={quality} className="flex items-center space-x-2">
                    <Checkbox
                      id={quality}
                      checked={settings.videoQualities.includes(quality)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSettings((prev) => ({
                            ...prev,
                            videoQualities: [...prev.videoQualities, quality],
                          }))
                        } else {
                          setSettings((prev) => ({
                            ...prev,
                            videoQualities: prev.videoQualities.filter((q) => q !== quality),
                          }))
                        }
                      }}
                    />
                    <Label htmlFor={quality}>{quality}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Thumbnail Count</Label>
              <Input
                type="number"
                value={settings.thumbnailCount}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    thumbnailCount: Number.parseInt(e.target.value) || 5,
                  }))
                }
                className="mt-2"
              />
            </div>

            <div>
              <Label>Preview Duration (seconds)</Label>
              <Input
                type="number"
                value={settings.previewDuration}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    previewDuration: Number.parseInt(e.target.value) || 30,
                  }))
                }
                className="mt-2"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Subtitle Generation</Label>
                <Switch
                  checked={settings.enableSubtitles}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      enableSubtitles: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Enable Metadata Extraction</Label>
                <Switch
                  checked={settings.enableMetadataExtraction}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      enableMetadataExtraction: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Enable Content Analysis</Label>
                <Switch
                  checked={settings.enableContentAnalysis}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      enableContentAnalysis: checked,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setSettingsDialogOpen(false)}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
