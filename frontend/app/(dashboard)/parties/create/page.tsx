"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, LinkIcon, Users, Settings, Calendar, Lock, Globe, Video, Play } from "lucide-react"
import Link from "next/link"

const createPartySchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  video_source: z.enum(["upload", "url", "drive"]),
  video_url: z.string().url("Please enter a valid URL").optional(),
  max_participants: z.number().min(2, "Minimum 2 participants").max(50, "Maximum 50 participants"),
  is_public: z.boolean(),
  require_approval: z.boolean(),
  allow_chat: z.boolean(),
  allow_reactions: z.boolean(),
  scheduled_start: z.string().optional(),
})

type CreatePartyForm = z.infer<typeof createPartySchema>

const videoSources = [
  { value: "upload", label: "Upload File", icon: Upload, description: "Upload a video file from your device" },
  { value: "url", label: "Video URL", icon: LinkIcon, description: "Stream from YouTube, Vimeo, or direct URL" },
  {
    value: "drive",
    label: "Cloud Storage",
    icon: Video,
    description: "Select from Google Drive, OneDrive, or Dropbox",
  },
]

export default function CreatePartyPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreatePartyForm>({
    resolver: zodResolver(createPartySchema),
    defaultValues: {
      max_participants: 10,
      is_public: false,
      require_approval: false,
      allow_chat: true,
      allow_reactions: true,
    },
  })

  const videoSource = watch("video_source")
  const isPublic = watch("is_public")
  const allowChat = watch("allow_chat")
  const allowReactions = watch("allow_reactions")

  const onSubmit = async (data: CreatePartyForm) => {
    try {
      setIsLoading(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Party created!",
        description: "Your watch party has been created successfully.",
      })

      // Redirect to the new party
      router.push("/dashboard/parties")
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/parties">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold font-display">Create Watch Party</h1>
          <p className="text-muted-foreground mt-2">Set up a synchronized viewing session with your friends</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Basic Information</span>
            </CardTitle>
            <CardDescription>Set up the basic details for your watch party</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Party Title *</Label>
              <Input id="title" placeholder="e.g., Friday Movie Night" {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell your friends what you'll be watching..."
                rows={3}
                {...register("description")}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_participants">Maximum Participants</Label>
              <Select onValueChange={(value) => setValue("max_participants", Number.parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select maximum participants" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20, 25, 30, 40, 50].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} participants
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.max_participants && <p className="text-sm text-destructive">{errors.max_participants.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Video Source */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Video className="w-5 h-5" />
              <span>Video Source</span>
            </CardTitle>
            <CardDescription>Choose how you want to add your video content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {videoSources.map((source) => (
                <div
                  key={source.value}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    videoSource === source.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border/80"
                  }`}
                  onClick={() => setValue("video_source", source.value as any)}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <source.icon className="w-8 h-8 text-muted-foreground" />
                    <h3 className="font-medium">{source.label}</h3>
                    <p className="text-sm text-muted-foreground">{source.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Video Source Specific Fields */}
            {videoSource === "upload" && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Upload Video File</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Drag and drop your video file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="video-upload"
                  />
                  <Button type="button" variant="outline" asChild>
                    <label htmlFor="video-upload" className="cursor-pointer">
                      Choose File
                    </label>
                  </Button>
                  {selectedFile && (
                    <div className="mt-4 p-3 bg-background-secondary rounded-lg">
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {videoSource === "url" && (
              <div className="space-y-2">
                <Label htmlFor="video_url">Video URL</Label>
                <Input id="video_url" placeholder="https://youtube.com/watch?v=..." {...register("video_url")} />
                {errors.video_url && <p className="text-sm text-destructive">{errors.video_url.message}</p>}
                <p className="text-sm text-muted-foreground">Supported: YouTube, Vimeo, direct video URLs</p>
              </div>
            )}

            {videoSource === "drive" && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Connect your cloud storage to select videos</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <div className="w-8 h-8 bg-blue-500 rounded mb-2"></div>
                    Google Drive
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <div className="w-8 h-8 bg-blue-600 rounded mb-2"></div>
                    OneDrive
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-transparent">
                    <div className="w-8 h-8 bg-blue-400 rounded mb-2"></div>
                    Dropbox
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Party Settings */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Party Settings</span>
            </CardTitle>
            <CardDescription>Configure privacy and interaction settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Privacy Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {isPublic ? (
                      <Globe className="w-4 h-4 text-accent-success" />
                    ) : (
                      <Lock className="w-4 h-4 text-accent-warning" />
                    )}
                    <Label htmlFor="is_public">Public Party</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isPublic ? "Anyone can discover and join your party" : "Only people with the room code can join"}
                  </p>
                </div>
                <Switch
                  id="is_public"
                  checked={isPublic}
                  onCheckedChange={(checked) => setValue("is_public", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="require_approval">Require Approval</Label>
                  <p className="text-sm text-muted-foreground">
                    Host must approve new participants before they can join
                  </p>
                </div>
                <Switch id="require_approval" onCheckedChange={(checked) => setValue("require_approval", checked)} />
              </div>
            </div>

            <Separator />

            {/* Interaction Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">Interaction Features</h4>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allow_chat">Enable Chat</Label>
                  <p className="text-sm text-muted-foreground">Allow participants to chat during the party</p>
                </div>
                <Switch
                  id="allow_chat"
                  checked={allowChat}
                  onCheckedChange={(checked) => setValue("allow_chat", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="allow_reactions">Enable Reactions</Label>
                  <p className="text-sm text-muted-foreground">Allow emoji reactions and live responses</p>
                </div>
                <Switch
                  id="allow_reactions"
                  checked={allowReactions}
                  onCheckedChange={(checked) => setValue("allow_reactions", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule (Optional) */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Schedule (Optional)</span>
            </CardTitle>
            <CardDescription>Schedule your party for a specific time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_start">Start Time</Label>
              <Input id="scheduled_start" type="datetime-local" {...register("scheduled_start")} />
              <p className="text-sm text-muted-foreground">Leave empty to start the party immediately</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard/parties">Cancel</Link>
          </Button>
          <div className="flex items-center space-x-3">
            <Button type="submit" variant="secondary" disabled={isLoading}>
              Save as Draft
            </Button>
            <Button type="submit" disabled={isLoading} className="shadow-glow">
              {isLoading ? (
                "Creating..."
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Create Party
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
