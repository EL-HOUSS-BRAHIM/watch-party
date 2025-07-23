"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Trash2, Users, Globe, Lock } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

interface EditPartyPageProps {
  params: {
    id: string
  }
}

interface Party {
  id: string
  title: string
  description: string
  scheduledFor: string
  isPublic: boolean
  maxParticipants: number
  requiresApproval: boolean
  allowChat: boolean
  allowReactions: boolean
  videoUrl: string
  thumbnailUrl?: string
  status: "scheduled" | "live" | "ended"
  participantCount: number
}

export default function EditPartyPage({ params }: EditPartyPageProps) {
  const [party, setParty] = useState<Party | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchParty()
  }, [params.id])

  const fetchParty = async () => {
    try {
      const data = await api.get(`/parties/${params.id}`)
      setParty(data)
    } catch (err: any) {
      setError("Failed to load party details")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!party) return

    setIsSaving(true)
    setError("")

    try {
      await api.put(`/parties/${params.id}`, party)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update party")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this party? This action cannot be undone.")) {
      return
    }

    try {
      await api.delete(`/parties/${params.id}`)
      router.push("/dashboard/parties")
    } catch (err: any) {
      setError(err.message || "Failed to delete party")
    }
  }

  const updateParty = (field: keyof Party, value: any) => {
    if (!party) return
    setParty({ ...party, [field]: value })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neo-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neo-text-secondary">Loading party details...</p>
        </div>
      </div>
    )
  }

  if (!party) {
    return (
      <div className="min-h-screen bg-neo-background flex items-center justify-center">
        <Card className="card max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-neo-text-primary mb-2">Party Not Found</h2>
            <p className="text-neo-text-secondary mb-4">
              The party you're looking for doesn't exist or you don't have permission to edit it.
            </p>
            <Button asChild>
              <Link href="/dashboard/parties">Back to Parties</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neo-background">
      {/* Header */}
      <div className="border-b border-neo-border bg-neo-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/parties" className="text-neo-text-secondary hover:text-neo-text-primary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Parties
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-neo-text-primary">Edit Party</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={party.status === "live" ? "default" : "secondary"}>{party.status}</Badge>
                  <span className="text-sm text-neo-text-secondary">{party.participantCount} participants</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSave} className="space-y-6">
          {error && (
            <Alert className="border-error bg-error/10">
              <AlertDescription className="text-error">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-success bg-success/10">
              <AlertDescription className="text-success">Party updated successfully!</AlertDescription>
            </Alert>
          )}

          {/* Basic Information */}
          <Card className="card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-neo-text-primary">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-neo-text-primary">
                  Party Title *
                </Label>
                <Input
                  id="title"
                  value={party.title}
                  onChange={(e) => updateParty("title", e.target.value)}
                  className="input-base"
                  placeholder="Enter party title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-neo-text-primary">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={party.description}
                  onChange={(e) => updateParty("description", e.target.value)}
                  className="input-base"
                  placeholder="Describe your watch party..."
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledFor" className="text-neo-text-primary">
                    Scheduled Time
                  </Label>
                  <Input
                    id="scheduledFor"
                    type="datetime-local"
                    value={party.scheduledFor}
                    onChange={(e) => updateParty("scheduledFor", e.target.value)}
                    className="input-base"
                    disabled={party.status === "live"}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxParticipants" className="text-neo-text-primary">
                    Max Participants
                  </Label>
                  <Select
                    value={party.maxParticipants.toString()}
                    onValueChange={(value) => updateParty("maxParticipants", Number.parseInt(value))}
                  >
                    <SelectTrigger className="input-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 participants</SelectItem>
                      <SelectItem value="25">25 participants</SelectItem>
                      <SelectItem value="50">50 participants</SelectItem>
                      <SelectItem value="100">100 participants</SelectItem>
                      <SelectItem value="999">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Settings */}
          <Card className="card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-neo-text-primary">Video Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="videoUrl" className="text-neo-text-primary">
                  Video URL *
                </Label>
                <Input
                  id="videoUrl"
                  value={party.videoUrl}
                  onChange={(e) => updateParty("videoUrl", e.target.value)}
                  className="input-base"
                  placeholder="https://drive.google.com/... or S3 URL"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnailUrl" className="text-neo-text-primary">
                  Thumbnail URL (Optional)
                </Label>
                <Input
                  id="thumbnailUrl"
                  value={party.thumbnailUrl || ""}
                  onChange={(e) => updateParty("thumbnailUrl", e.target.value)}
                  className="input-base"
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Permissions */}
          <Card className="card">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-neo-text-primary">Privacy & Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {party.isPublic ? (
                    <Globe className="w-5 h-5 text-success" />
                  ) : (
                    <Lock className="w-5 h-5 text-warning" />
                  )}
                  <div>
                    <Label className="text-neo-text-primary">Public Party</Label>
                    <p className="text-sm text-neo-text-secondary">
                      {party.isPublic ? "Anyone can discover and join" : "Only people with the link can join"}
                    </p>
                  </div>
                </div>
                <Switch checked={party.isPublic} onCheckedChange={(checked) => updateParty("isPublic", checked)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <Label className="text-neo-text-primary">Require Approval</Label>
                    <p className="text-sm text-neo-text-secondary">Host must approve join requests</p>
                  </div>
                </div>
                <Switch
                  checked={party.requiresApproval}
                  onCheckedChange={(checked) => updateParty("requiresApproval", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <Label className="text-neo-text-primary">Allow Chat</Label>
                    <p className="text-sm text-neo-text-secondary">Participants can send messages</p>
                  </div>
                </div>
                <Switch checked={party.allowChat} onCheckedChange={(checked) => updateParty("allowChat", checked)} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <Label className="text-neo-text-primary">Allow Reactions</Label>
                    <p className="text-sm text-neo-text-secondary">Participants can send emoji reactions</p>
                  </div>
                </div>
                <Switch
                  checked={party.allowReactions}
                  onCheckedChange={(checked) => updateParty("allowReactions", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
