"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, Users, Lock, Video, Settings, Plus, X, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface PartySettings {
  name: string
  description: string
  videoUrl: string
  maxParticipants: number
  isPrivate: boolean
  requireApproval: boolean
  allowChat: boolean
  allowReactions: boolean
  allowVideoControl: "host" | "all" | "moderators"
  scheduledFor?: Date
  tags: string[]
  inviteEmails: string[]
}

export default function CreatePartyPage() {
  const [settings, setSettings] = useState<PartySettings>({
    name: "",
    description: "",
    videoUrl: "",
    maxParticipants: 10,
    isPrivate: false,
    requireApproval: false,
    allowChat: true,
    allowReactions: true,
    allowVideoControl: "host",
    tags: [],
    inviteEmails: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [newTag, setNewTag] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [showSchedule, setShowSchedule] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/parties/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create party")
      }

      router.push(`/watch/${data.room_code}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !settings.tags.includes(newTag.trim())) {
      setSettings((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setSettings((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const addEmail = () => {
    if (newEmail.trim() && !settings.inviteEmails.includes(newEmail.trim())) {
      setSettings((prev) => ({
        ...prev,
        inviteEmails: [...prev.inviteEmails, newEmail.trim()],
      }))
      setNewEmail("")
    }
  }

  const removeEmail = (email: string) => {
    setSettings((prev) => ({
      ...prev,
      inviteEmails: prev.inviteEmails.filter((e) => e !== email),
    }))
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Watch Party</h1>
        <p className="text-gray-600 mt-2">Set up your watch party and invite friends to join</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Set up the basic details for your watch party</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Party Name *</Label>
              <Input
                id="name"
                placeholder="Enter party name"
                value={settings.name}
                onChange={(e) => setSettings((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your watch party"
                value={settings.description}
                onChange={(e) => setSettings((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl">Video URL *</Label>
              <Input
                id="videoUrl"
                type="url"
                placeholder="https://example.com/video.mp4"
                value={settings.videoUrl}
                onChange={(e) => setSettings((prev) => ({ ...prev, videoUrl: e.target.value }))}
                required
              />
              <p className="text-sm text-gray-500">Supported formats: MP4, WebM, YouTube, Vimeo</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {settings.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {settings.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Privacy & Access
            </CardTitle>
            <CardDescription>Control who can join your party and how</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Private Party</Label>
                <p className="text-sm text-gray-500">Only invited users can join</p>
              </div>
              <Switch
                checked={settings.isPrivate}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, isPrivate: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Approval</Label>
                <p className="text-sm text-gray-500">Host must approve join requests</p>
              </div>
              <Switch
                checked={settings.requireApproval}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, requireApproval: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Maximum Participants</Label>
              <Select
                value={settings.maxParticipants.toString()}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, maxParticipants: Number.parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 participants</SelectItem>
                  <SelectItem value="10">10 participants</SelectItem>
                  <SelectItem value="25">25 participants</SelectItem>
                  <SelectItem value="50">50 participants</SelectItem>
                  <SelectItem value="100">100 participants</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Features
            </CardTitle>
            <CardDescription>Configure what participants can do during the party</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Chat</Label>
                <p className="text-sm text-gray-500">Allow participants to chat during the party</p>
              </div>
              <Switch
                checked={settings.allowChat}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, allowChat: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Reactions</Label>
                <p className="text-sm text-gray-500">Allow emoji reactions during playback</p>
              </div>
              <Switch
                checked={settings.allowReactions}
                onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, allowReactions: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Video Control Permissions</Label>
              <Select
                value={settings.allowVideoControl}
                onValueChange={(value: "host" | "all" | "moderators") =>
                  setSettings((prev) => ({ ...prev, allowVideoControl: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="host">Host only</SelectItem>
                  <SelectItem value="moderators">Host and moderators</SelectItem>
                  <SelectItem value="all">All participants</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Scheduling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Scheduling
            </CardTitle>
            <CardDescription>Schedule your party for later or start immediately</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Schedule for Later</Label>
                <p className="text-sm text-gray-500">Set a specific date and time for the party</p>
              </div>
              <Switch checked={showSchedule} onCheckedChange={setShowSchedule} />
            </div>

            {showSchedule && (
              <div className="space-y-2">
                <Label>Scheduled Date & Time</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !settings.scheduledFor && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {settings.scheduledFor ? (
                        format(settings.scheduledFor, "PPP 'at' p")
                      ) : (
                        <span>Pick a date and time</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={settings.scheduledFor}
                      onSelect={(date) => setSettings((prev) => ({ ...prev, scheduledFor: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invitations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Invitations
            </CardTitle>
            <CardDescription>Invite friends to join your watch party</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmails">Invite by Email</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="friend@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addEmail())}
                />
                <Button type="button" onClick={addEmail} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {settings.inviteEmails.length > 0 && (
                <div className="space-y-2 mt-2">
                  {settings.inviteEmails.map((email) => (
                    <div key={email} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm">{email}</span>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeEmail(email)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !settings.name || !settings.videoUrl} className="flex-1">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {showSchedule && settings.scheduledFor ? "Schedule Party" : "Create Party"}
          </Button>
        </div>
      </form>
    </div>
  )
}
