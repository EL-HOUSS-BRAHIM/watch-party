"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  SettingsIcon,
  Bell,
  Shield,
  Palette,
  Globe,
  Volume2,
  Eye,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Mail,
  Users,
  Video,
  Download,
  Trash2,
  AlertTriangle,
  Save,
  Loader2,
  ArrowLeft,
  ExternalLink,
} from "lucide-react"

interface NotificationSettings {
  email: {
    friendRequests: boolean
    partyInvites: boolean
    newMessages: boolean
    partyUpdates: boolean
    systemUpdates: boolean
    newsletter: boolean
  }
  push: {
    friendRequests: boolean
    partyInvites: boolean
    newMessages: boolean
    partyUpdates: boolean
    liveNotifications: boolean
  }
  inApp: {
    friendRequests: boolean
    partyInvites: boolean
    newMessages: boolean
    partyUpdates: boolean
    reactions: boolean
    mentions: boolean
  }
}

interface AppearanceSettings {
  theme: "light" | "dark" | "system"
  accentColor: string
  fontSize: "small" | "medium" | "large"
  compactMode: boolean
  animations: boolean
  autoPlayVideos: boolean
}

interface PrivacySettings {
  profileVisibility: "public" | "friends" | "private"
  showOnlineStatus: boolean
  showLastSeen: boolean
  allowFriendRequests: boolean
  allowMessages: boolean
  showActivity: boolean
  dataCollection: boolean
  analytics: boolean
}

interface PlaybackSettings {
  autoPlay: boolean
  defaultQuality: "auto" | "1080p" | "720p" | "480p" | "360p"
  volume: number
  muted: boolean
  subtitles: boolean
  subtitleLanguage: string
  playbackSpeed: number
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("notifications")
  const [isSaving, setSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: {
      friendRequests: true,
      partyInvites: true,
      newMessages: true,
      partyUpdates: false,
      systemUpdates: true,
      newsletter: false,
    },
    push: {
      friendRequests: true,
      partyInvites: true,
      newMessages: true,
      partyUpdates: false,
      liveNotifications: true,
    },
    inApp: {
      friendRequests: true,
      partyInvites: true,
      newMessages: true,
      partyUpdates: true,
      reactions: true,
      mentions: true,
    },
  })

  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: "system",
    accentColor: "#3b82f6",
    fontSize: "medium",
    compactMode: false,
    animations: true,
    autoPlayVideos: true,
  })

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: "public",
    showOnlineStatus: true,
    showLastSeen: true,
    allowFriendRequests: true,
    allowMessages: true,
    showActivity: true,
    dataCollection: true,
    analytics: true,
  })

  const [playback, setPlayback] = useState<PlaybackSettings>({
    autoPlay: true,
    defaultQuality: "auto",
    volume: 80,
    muted: false,
    subtitles: false,
    subtitleLanguage: "en",
    playbackSpeed: 1.0,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/settings/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const settings = await response.json()
        setNotifications(settings.notifications || notifications)
        setAppearance(settings.appearance || appearance)
        setPrivacy(settings.privacy || privacy)
        setPlayback(settings.playback || playback)
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/settings/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notifications,
          appearance,
          privacy,
          playback,
        }),
      })

      if (response.ok) {
        toast({
          title: "Settings Saved",
          description: "Your settings have been updated successfully.",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const exportData = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/export-data/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `watchparty-data-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        toast({
          title: "Data Exported",
          description: "Your data has been exported successfully.",
        })
      }
    } catch (error) {
      console.error("Failed to export data:", error)
      toast({
        title: "Error",
        description: "Failed to export data.",
        variant: "destructive",
      })
    }
  }

  const deleteAccount = async () => {
    const confirmation = prompt('To delete your account, type "DELETE" in the box below. This action cannot be undone.')

    if (confirmation !== "DELETE") {
      return
    }

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/delete-account/", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({
          title: "Account Deleted",
          description: "Your account has been permanently deleted.",
        })
        // Redirect to home page after a delay
        setTimeout(() => {
          window.location.href = "/"
        }, 2000)
      }
    } catch (error) {
      console.error("Failed to delete account:", error)
      toast({
        title: "Error",
        description: "Failed to delete account.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()} className=&quot;p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <SettingsIcon className="h-8 w-8" />
              Settings
            </h1>
            <p className="text-muted-foreground mt-2">Manage your account preferences and privacy settings</p>
          </div>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="playback" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Playback
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications.email).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="capitalize">{key.replace(/([A-Z])/g, &quot; $1").trim()}</Label>
                      <p className="text-sm text-muted-foreground">
                        {key === "friendRequests" && "Get notified when someone sends you a friend request"}
                        {key === "partyInvites" && "Receive invitations to watch parties"}
                        {key === "newMessages" && "Get notified about new direct messages"}
                        {key === "partyUpdates" && "Updates about parties you're participating in"}
                        {key === "systemUpdates" && "Important system and security updates"}
                        {key === "newsletter" && "Weekly newsletter with platform updates"}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          email: { ...prev.email, [key]: checked },
                        }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Push Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications.push).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="capitalize">{key.replace(/([A-Z])/g, &quot; $1").trim()}</Label>
                      <p className="text-sm text-muted-foreground">
                        {key === "friendRequests" && "Push notifications for friend requests"}
                        {key === "partyInvites" && "Push notifications for party invitations"}
                        {key === "newMessages" && "Push notifications for new messages"}
                        {key === "partyUpdates" && "Push notifications for party updates"}
                        {key === "liveNotifications" && "Real-time notifications during live parties"}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          push: { ...prev.push, [key]: checked },
                        }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  In-App Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(notifications.inApp).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="capitalize">{key.replace(/([A-Z])/g, &quot; $1").trim()}</Label>
                      <p className="text-sm text-muted-foreground">
                        {key === "friendRequests" && "Show friend request notifications in the app"}
                        {key === "partyInvites" && "Show party invitation notifications"}
                        {key === "newMessages" && "Show new message notifications"}
                        {key === "partyUpdates" && "Show party update notifications"}
                        {key === "reactions" && "Show reaction notifications"}
                        {key === "mentions" && "Show mention notifications"}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          inApp: { ...prev.inApp, [key]: checked },
                        }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Color Theme</Label>
                  <Select
                    value={appearance.theme}
                    onValueChange={(value) => setAppearance((prev) => ({ ...prev, theme: value as Record<string, unknown> }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Font Size</Label>
                  <Select
                    value={appearance.fontSize}
                    onValueChange={(value) => setAppearance((prev) => ({ ...prev, fontSize: value as Record<string, unknown> }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">Use a more compact layout</p>
                  </div>
                  <Switch
                    checked={appearance.compactMode}
                    onCheckedChange={(checked) => setAppearance((prev) => ({ ...prev, compactMode: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Animations</Label>
                    <p className="text-sm text-muted-foreground">Enable smooth animations and transitions</p>
                  </div>
                  <Switch
                    checked={appearance.animations}
                    onCheckedChange={(checked) => setAppearance((prev) => ({ ...prev, animations: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-play Videos</Label>
                    <p className="text-sm text-muted-foreground">Automatically play video previews</p>
                  </div>
                  <Switch
                    checked={appearance.autoPlayVideos}
                    onCheckedChange={(checked) => setAppearance((prev) => ({ ...prev, autoPlayVideos: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Profile Visibility</Label>
                  <Select
                    value={privacy.profileVisibility}
                    onValueChange={(value) => setPrivacy((prev) => ({ ...prev, profileVisibility: value as Record<string, unknown> }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Public - Anyone can see your profile
                        </div>
                      </SelectItem>
                      <SelectItem value="friends">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Friends Only - Only friends can see your profile
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Private - Only you can see your profile
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Online Status</Label>
                    <p className="text-sm text-muted-foreground">Let others see when you&apos;re online</p>
                  </div>
                  <Switch
                    checked={privacy.showOnlineStatus}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, showOnlineStatus: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Last Seen</Label>
                    <p className="text-sm text-muted-foreground">Display when you were last active</p>
                  </div>
                  <Switch
                    checked={privacy.showLastSeen}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, showLastSeen: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Friend Requests</Label>
                    <p className="text-sm text-muted-foreground">Let others send you friend requests</p>
                  </div>
                  <Switch
                    checked={privacy.allowFriendRequests}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, allowFriendRequests: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Messages</Label>
                    <p className="text-sm text-muted-foreground">Let others send you direct messages</p>
                  </div>
                  <Switch
                    checked={privacy.allowMessages}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, allowMessages: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Activity</Label>
                    <p className="text-sm text-muted-foreground">Display your recent activity to friends</p>
                  </div>
                  <Switch
                    checked={privacy.showActivity}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, showActivity: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data & Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Data Collection</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow us to collect usage data to improve the service
                    </p>
                  </div>
                  <Switch
                    checked={privacy.dataCollection}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, dataCollection: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics</Label>
                    <p className="text-sm text-muted-foreground">Help us understand how you use the platform</p>
                  </div>
                  <Switch
                    checked={privacy.analytics}
                    onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, analytics: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Playback Tab */}
          <TabsContent value="playback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Playback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-play Videos</Label>
                    <p className="text-sm text-muted-foreground">Automatically start playing videos when opened</p>
                  </div>
                  <Switch
                    checked={playback.autoPlay}
                    onCheckedChange={(checked) => setPlayback((prev) => ({ ...prev, autoPlay: checked }))}
                  />
                </div>

                <div>
                  <Label>Default Quality</Label>
                  <Select
                    value={playback.defaultQuality}
                    onValueChange={(value) => setPlayback((prev) => ({ ...prev, defaultQuality: value as Record<string, unknown> }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (Recommended)</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="480p">480p</SelectItem>
                      <SelectItem value="360p">360p</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Volume</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Volume2 className="h-4 w-4" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={playback.volume}
                      onChange={(e) => setPlayback((prev) => ({ ...prev, volume: Number(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium w-12">{playback.volume}%</span>
                  </div>
                </div>

                <div>
                  <Label>Playback Speed</Label>
                  <Select
                    value={playback.playbackSpeed.toString()}
                    onValueChange={(value) => setPlayback((prev) => ({ ...prev, playbackSpeed: Number(value) }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1">1x (Normal)</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subtitles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Subtitles</Label>
                    <p className="text-sm text-muted-foreground">Show subtitles when available</p>
                  </div>
                  <Switch
                    checked={playback.subtitles}
                    onCheckedChange={(checked) => setPlayback((prev) => ({ ...prev, subtitles: checked }))}
                  />
                </div>

                {playback.subtitles && (
                  <div>
                    <Label>Subtitle Language</Label>
                    <Select
                      value={playback.subtitleLanguage}
                      onValueChange={(value) => setPlayback((prev) => ({ ...prev, subtitleLanguage: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ko">Korean</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Export Your Data</Label>
                    <p className="text-sm text-muted-foreground">Download a copy of all your data</p>
                  </div>
                  <Button variant="outline" onClick={exportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <Separator />

                <div>
                  <Label className="text-base font-medium">Account Deletion</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" onClick={deleteAccount}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Legal & Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Terms of Service</Label>
                    <p className="text-sm text-muted-foreground">Read our terms and conditions</p>
                  </div>
                  <Button variant="outline" onClick={() => window.open(&quot;/terms", "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Privacy Policy</Label>
                    <p className="text-sm text-muted-foreground">Learn how we protect your privacy</p>
                  </div>
                  <Button variant="outline" onClick={() => window.open(&quot;/privacy", "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Contact Support</Label>
                    <p className="text-sm text-muted-foreground">Get help with your account</p>
                  </div>
                  <Button variant="outline" onClick={() => router.push(&quot;/help")}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
