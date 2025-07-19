"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { User, Bell, Shield, Palette } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
  })

  const [notifications, setNotifications] = useState({
    partyInvites: true,
    friendRequests: true,
    partyStarting: true,
    newMessages: false,
    emailNotifications: true,
  })

  const [privacy, setPrivacy] = useState({
    profileVisibility: "friends",
    allowFriendRequests: true,
    showOnlineStatus: true,
  })

  const [preferences, setPreferences] = useState({
    theme: "dark",
    language: "en",
    timezone: "UTC",
    autoJoinParties: false,
  })

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // API call to update profile
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setIsLoading(true)
    try {
      // API call to update notifications
      toast({
        title: "Notifications updated",
        description: "Your notification preferences have been saved.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notifications. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                className="input-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                className="input-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                value={profile.avatar}
                onChange={(e) => setProfile((prev) => ({ ...prev, avatar: e.target.value }))}
                placeholder="https://example.com/avatar.jpg"
                className="input-base"
              />
            </div>

            <Button onClick={handleSaveProfile} disabled={isLoading} className="w-full btn-primary">
              {isLoading ? "Saving..." : "Save Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Party Invites</Label>
                <p className="text-xs text-muted-foreground">Get notified when invited to parties</p>
              </div>
              <Switch
                checked={notifications.partyInvites}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, partyInvites: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Friend Requests</Label>
                <p className="text-xs text-muted-foreground">Get notified of new friend requests</p>
              </div>
              <Switch
                checked={notifications.friendRequests}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, friendRequests: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Party Starting</Label>
                <p className="text-xs text-muted-foreground">Remind me when parties are starting</p>
              </div>
              <Switch
                checked={notifications.partyStarting}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, partyStarting: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>New Messages</Label>
                <p className="text-xs text-muted-foreground">Get notified of new chat messages</p>
              </div>
              <Switch
                checked={notifications.newMessages}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, newMessages: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                checked={notifications.emailNotifications}
                onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, emailNotifications: checked }))}
              />
            </div>

            <Button onClick={handleSaveNotifications} disabled={isLoading} className="w-full btn-secondary">
              {isLoading ? "Saving..." : "Save Notifications"}
            </Button>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Visibility</Label>
              <Select
                value={privacy.profileVisibility}
                onValueChange={(value) => setPrivacy((prev) => ({ ...prev, profileVisibility: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Friend Requests</Label>
                <p className="text-xs text-muted-foreground">Let others send you friend requests</p>
              </div>
              <Switch
                checked={privacy.allowFriendRequests}
                onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, allowFriendRequests: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Show Online Status</Label>
                <p className="text-xs text-muted-foreground">Let friends see when you're online</p>
              </div>
              <Switch
                checked={privacy.showOnlineStatus}
                onCheckedChange={(checked) => setPrivacy((prev) => ({ ...prev, showOnlineStatus: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={preferences.theme}
                onValueChange={(value) => setPreferences((prev) => ({ ...prev, theme: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => setPreferences((prev) => ({ ...prev, language: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => setPreferences((prev) => ({ ...prev, timezone: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="EST">Eastern Time</SelectItem>
                  <SelectItem value="PST">Pacific Time</SelectItem>
                  <SelectItem value="GMT">GMT</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-join Parties</Label>
                <p className="text-xs text-muted-foreground">Automatically join parties you're invited to</p>
              </div>
              <Switch
                checked={preferences.autoJoinParties}
                onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, autoJoinParties: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-destructive">Delete Account</Label>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data</p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
