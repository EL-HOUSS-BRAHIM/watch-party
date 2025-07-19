"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { Calendar, Video, Lock } from "lucide-react"

export function CreatePartyForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
    start_time: "",
    is_private: false,
    max_participants: 50,
    allow_chat: true,
    allow_reactions: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.post("/parties", formData)
      toast({
        title: "Party created!",
        description: "Your watch party has been created successfully.",
      })
      router.push(`/dashboard/parties/${response.id}`)
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
              placeholder="Liverpool vs Arsenal - Champions League"
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
              placeholder="Join us for an epic Champions League match!"
              className="input-base min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">Video Source *</Label>
            <Input
              id="video_url"
              value={formData.video_url}
              onChange={(e) => handleInputChange("video_url", e.target.value)}
              placeholder="https://drive.google.com/file/d/... or S3 URL"
              className="input-base"
              required
            />
            <p className="text-xs text-muted-foreground">Supports Google Drive, S3, and direct video URLs</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule & Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => handleInputChange("start_time", e.target.value)}
                className="input-base"
                required
              />
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
                  <SelectItem value="10">10 participants</SelectItem>
                  <SelectItem value="25">25 participants</SelectItem>
                  <SelectItem value="50">50 participants</SelectItem>
                  <SelectItem value="100">100 participants</SelectItem>
                  <SelectItem value="0">Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Private Party
                </Label>
                <p className="text-xs text-muted-foreground">Only invited users can join</p>
              </div>
              <Switch
                checked={formData.is_private}
                onCheckedChange={(checked) => handleInputChange("is_private", checked)}
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
        <Button type="submit" disabled={isLoading} className="flex-1 btn-primary">
          {isLoading ? "Creating..." : "Create Party"}
        </Button>
      </div>
    </form>
  )
}
