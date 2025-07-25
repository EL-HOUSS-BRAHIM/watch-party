"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Download,
  Trash2,
  Upload,
  Key,
  Smartphone,
  Mail,
  Moon,
  Sun,
  Monitor,
  Save,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Camera,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface UserSettings {
  profile: {
    firstName: string
    lastName: string
    username: string
    email: string
    bio: string
    avatar: string
    location: string
    website: string
    isPublic: boolean
  }
  privacy: {
    showEmail: boolean
    showOnlineStatus: boolean
    allowFriendRequests: boolean
    allowPartyInvites: boolean
    showActivity: boolean
    searchable: boolean
  }
  notifications: {
    email: boolean
    push: boolean
    friendRequests: boolean
    partyInvites: boolean
    partyUpdates: boolean
    messages: boolean
    achievements: boolean
    marketing: boolean
  }
  appearance: {
    theme: "light" | "dark" | "system"
    language: string
    timezone: string
    dateFormat: string
    compactMode: boolean
  }
  security: {
    twoFactorEnabled: boolean
    loginAlerts: boolean
    sessionTimeout: number
    trustedDevices: Array<{
      id: string
      name: string
      lastUsed: string
      current: boolean
    }>
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const { user, updateProfile } = useAuth()
  const { toast } = useToast()

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
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) return

    setIsSaving(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/settings/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings(updatedSettings)
        setHasChanges(false)

        // Update auth context if profile changed
        if (settings.profile) {
          await updateProfile({
            firstName: settings.profile.firstName,
            lastName: settings.profile.lastName,
            username: settings.profile.username,
            avatar: settings.profile.avatar,
          })
        }

        toast({
          title: "Settings Saved",
          description: "Your settings have been updated successfully.",
        })
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const uploadAvatar = async () => {
    if (!avatarFile) return

    const formData = new FormData()
    formData.append("avatar", avatarFile)

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/avatar/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        updateSetting("profile", "avatar", data.avatar_url)
        setAvatarFile(null)
        setAvatarPreview(null)
        toast({
          title: "Avatar Updated",
          description: "Your profile picture has been updated.",
        })
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error)
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
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
        a.download = `user-data-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast({
          title: "Data Exported",
          description: "Your data has been exported successfully.",
        })
      }
    } catch (error) {
      console.error("Failed to export data:", error)
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteAccount = async () => {
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
          description: "Your account has been scheduled for deletion.",
        })
        // Redirect to login or home page
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Failed to delete account:", error)
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      })
    }
  }

  const enableTwoFactor = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/2fa/enable/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Show QR code and backup codes
        setShowTwoFactorDialog(true)
        updateSetting("security", "twoFactorEnabled", true)
      }
    } catch (error) {
      console.error("Failed to enable 2FA:", error)
      toast({
        title: "Error",
        description: "Failed to enable two-factor authentication.",
        variant: "destructive",
      })
    }
  }

  const updateSetting = (category: keyof UserSettings, key: string, value: any) => {
    if (!settings) return

    setSettings((prev) => ({
      ...prev!,
      [category]: {
        ...prev![category],
        [key]: value,
      },
    }))
    setHasChanges(true)
  }

  if (isLoading || !settings) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Unsaved Changes
            </Badge>
          )}
          <Button onClick={saveSettings} disabled={!hasChanges || isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || settings.profile.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {settings.profile.firstName.charAt(0)}
                      {settings.profile.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors">
                    <Camera className="h-4 w-4" />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Profile Picture</h3>
                  <p className="text-sm text-gray-500">Upload a new profile picture. Recommended size: 400x400px</p>
                  {avatarFile && (
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={uploadAvatar}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setAvatarFile(null)
                          setAvatarPreview(null)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={settings.profile.firstName}
                    onChange={(e) => updateSetting("profile", "firstName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={settings.profile.lastName}
                    onChange={(e) => updateSetting("profile", "lastName", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={settings.profile.username}
                    onChange={(e) => updateSetting("profile", "username", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => updateSetting("profile", "email", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={settings.profile.bio}
                  onChange={(e) => updateSetting("profile", "bio", e.target.value)}
                  rows={3}
                  placeholder="Tell others about yourself..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={settings.profile.location}
                    onChange={(e) => updateSetting("profile", "location", e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={settings.profile.website}
                    onChange={(e) => updateSetting("profile", "website", e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public Profile</Label>
                  <p className="text-sm text-gray-500">Make your profile visible to other users</p>
                </div>
                <Switch
                  checked={settings.profile.isPublic}
                  onCheckedChange={(checked) => updateSetting("profile", "isPublic", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>Control who can see your information and interact with you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Email Address</Label>
                    <p className="text-sm text-gray-500">Allow others to see your email address</p>
                  </div>
                  <Switch
                    checked={settings.privacy.showEmail}
                    onCheckedChange={(checked) => updateSetting("privacy", "showEmail", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Online Status</Label>
                    <p className="text-sm text-gray-500">Let friends see when you're online</p>
                  </div>
                  <Switch
                    checked={settings.privacy.showOnlineStatus}
                    onCheckedChange={(checked) => updateSetting("privacy", "showOnlineStatus", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Friend Requests</Label>
                    <p className="text-sm text-gray-500">Let other users send you friend requests</p>
                  </div>
                  <Switch
                    checked={settings.privacy.allowFriendRequests}
                    onCheckedChange={(checked) => updateSetting("privacy", "allowFriendRequests", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Party Invites</Label>
                    <p className="text-sm text-gray-500">Let others invite you to watch parties</p>
                  </div>
                  <Switch
                    checked={settings.privacy.allowPartyInvites}
                    onCheckedChange={(checked) => updateSetting("privacy", "allowPartyInvites", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Activity</Label>
                    <p className="text-sm text-gray-500">Display your activity in friends' feeds</p>
                  </div>
                  <Switch
                    checked={settings.privacy.showActivity}
                    onCheckedChange={(checked) => updateSetting("privacy", "showActivity", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Searchable Profile</Label>
                    <p className="text-sm text-gray-500">Allow your profile to appear in search results</p>
                  </div>
                  <Switch
                    checked={settings.privacy.searchable}
                    onCheckedChange={(checked) => updateSetting("privacy", "searchable", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>Manage your data and account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Export Your Data</h4>
                  <p className="text-sm text-gray-500">Download a copy of your account data</p>
                </div>
                <Button variant="outline" onClick={exportData}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-600">Delete Account</h4>
                  <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                </div>
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Account</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all your data
                        from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={deleteAccount}>
                        Delete Account
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Notifications
                    </Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => updateSetting("notifications", "email", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Push Notifications
                    </Label>
                    <p className="text-sm text-gray-500">Receive browser push notifications</p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => updateSetting("notifications", "push", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Friend Requests</Label>
                    <p className="text-sm text-gray-500">When someone sends you a friend request</p>
                  </div>
                  <Switch
                    checked={settings.notifications.friendRequests}
                    onCheckedChange={(checked) => updateSetting("notifications", "friendRequests", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Party Invites</Label>
                    <p className="text-sm text-gray-500">When you're invited to a watch party</p>
                  </div>
                  <Switch
                    checked={settings.notifications.partyInvites}
                    onCheckedChange={(checked) => updateSetting("notifications", "partyInvites", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Party Updates</Label>
                    <p className="text-sm text-gray-500">When parties you're in start or have updates</p>
                  </div>
                  <Switch
                    checked={settings.notifications.partyUpdates}
                    onCheckedChange={(checked) => updateSetting("notifications", "partyUpdates", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Messages</Label>
                    <p className="text-sm text-gray-500">When you receive direct messages</p>
                  </div>
                  <Switch
                    checked={settings.notifications.messages}
                    onCheckedChange={(checked) => updateSetting("notifications", "messages", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Achievements</Label>
                    <p className="text-sm text-gray-500">When you unlock achievements</p>
                  </div>
                  <Switch
                    checked={settings.notifications.achievements}
                    onCheckedChange={(checked) => updateSetting("notifications", "achievements", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing</Label>
                    <p className="text-sm text-gray-500">Promotional emails and updates</p>
                  </div>
                  <Switch
                    checked={settings.notifications.marketing}
                    onCheckedChange={(checked) => updateSetting("notifications", "marketing", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance Settings
              </CardTitle>
              <CardDescription>Customize how the platform looks and feels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => updateSetting("appearance", "theme", "light")}
                    className={cn(
                      "p-4 border rounded-lg flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors",
                      settings.appearance.theme === "light" && "border-blue-500 bg-blue-50",
                    )}
                  >
                    <Sun className="h-6 w-6" />
                    <span className="text-sm font-medium">Light</span>
                  </button>
                  <button
                    onClick={() => updateSetting("appearance", "theme", "dark")}
                    className={cn(
                      "p-4 border rounded-lg flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors",
                      settings.appearance.theme === "dark" && "border-blue-500 bg-blue-50",
                    )}
                  >
                    <Moon className="h-6 w-6" />
                    <span className="text-sm font-medium">Dark</span>
                  </button>
                  <button
                    onClick={() => updateSetting("appearance", "theme", "system")}
                    className={cn(
                      "p-4 border rounded-lg flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors",
                      settings.appearance.theme === "system" && "border-blue-500 bg-blue-50",
                    )}
                  >
                    <Monitor className="h-6 w-6" />
                    <span className="text-sm font-medium">System</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={settings.appearance.language}
                    onValueChange={(value) => updateSetting("appearance", "language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.appearance.timezone}
                    onValueChange={(value) => updateSetting("appearance", "timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select
                  value={settings.appearance.dateFormat}
                  onValueChange={(value) => updateSetting("appearance", "dateFormat", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-gray-500">Use a more compact layout to fit more content</p>
                </div>
                <Switch
                  checked={settings.appearance.compactMode}
                  onCheckedChange={(checked) => updateSetting("appearance", "compactMode", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Protect your account with additional security measures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Two-Factor Authentication
                  </Label>
                  <p className="text-sm text-gray-500">
                    {settings.security.twoFactorEnabled
                      ? "Your account is protected with 2FA"
                      : "Add an extra layer of security to your account"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {settings.security.twoFactorEnabled && (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Enabled
                    </Badge>
                  )}
                  <Button
                    variant={settings.security.twoFactorEnabled ? "outline" : "default"}
                    onClick={enableTwoFactor}
                  >
                    {settings.security.twoFactorEnabled ? "Manage" : "Enable"}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Login Alerts</Label>
                  <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
                </div>
                <Switch
                  checked={settings.security.loginAlerts}
                  onCheckedChange={(checked) => updateSetting("security", "loginAlerts", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Select
                  value={settings.security.sessionTimeout.toString()}
                  onValueChange={(value) => updateSetting("security", "sessionTimeout", Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                    <SelectItem value="480">8 hours</SelectItem>
                    <SelectItem value="1440">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Trusted Devices</h4>
                <div className="space-y-3">
                  {settings.security.trustedDevices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{device.name}</p>
                          <p className="text-sm text-gray-500">
                            Last used: {new Date(device.lastUsed).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {device.current && <Badge variant="secondary">Current Device</Badge>}
                        {!device.current && (
                          <Button variant="outline" size="sm">
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Two-Factor Authentication Dialog */}
      <Dialog open={showTwoFactorDialog} onOpenChange={setShowTwoFactorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app and enter the verification code
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-sm text-gray-500">QR Code Placeholder</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <Input placeholder="Enter 6-digit code" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTwoFactorDialog(false)}>
                Cancel
              </Button>
              <Button>Verify & Enable</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
