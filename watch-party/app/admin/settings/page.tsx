"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Settings, 
  Globe, 
  Shield, 
  Mail, 
  Bell, 
  Database,
  Lock,
  Users,
  FileText,
  AlertTriangle,
  Save
} from "lucide-react"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Site Settings
  const [siteSettings, setSiteSettings] = useState({
    siteName: "Watch Party",
    siteDescription: "The ultimate platform for synchronized streaming experiences",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    defaultUserRole: "user",
    maxParticipantsPerParty: 50,
    maxVideoUploadSize: 100, // MB
    sessionTimeout: 24 // hours
  })

  // Email Settings  
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "noreply@watchparty.app",
    smtpPassword: "",
    fromName: "Watch Party",
    fromEmail: "noreply@watchparty.app"
  })

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    enforceHttps: true,
    sessionSecurity: "strict",
    passwordMinLength: 8,
    requireStrongPasswords: true,
    enableTwoFactor: true,
    loginAttemptLimit: 5,
    lockoutDuration: 30 // minutes
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    enableEmailNotifications: true,
    enablePushNotifications: true,
    enableSmsNotifications: false,
    newUserNotifications: true,
    partyReportNotifications: true,
    systemAlerts: true,
    weeklyReports: true
  })

  const handleSaveSettings = async (section: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast({
        title: "Settings updated",
        description: `${section} settings have been saved successfully.`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
        <p className="text-muted-foreground">Configure system settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Site Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Site Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input
                value={siteSettings.siteName}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, siteName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Site Description</Label>
              <Textarea
                value={siteSettings.siteDescription}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-xs text-muted-foreground">Temporarily disable site access</p>
                </div>
                <Switch
                  checked={siteSettings.maintenanceMode}
                  onCheckedChange={(checked) => setSiteSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Registration</Label>
                  <p className="text-xs text-muted-foreground">Allow new users to sign up</p>
                </div>
                <Switch
                  checked={siteSettings.allowRegistration}
                  onCheckedChange={(checked) => setSiteSettings(prev => ({ ...prev, allowRegistration: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Email Verification</Label>
                  <p className="text-xs text-muted-foreground">Users must verify email</p>
                </div>
                <Switch
                  checked={siteSettings.requireEmailVerification}
                  onCheckedChange={(checked) => setSiteSettings(prev => ({ ...prev, requireEmailVerification: checked }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Participants per Party</Label>
                <Input
                  type="number"
                  value={siteSettings.maxParticipantsPerParty}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, maxParticipantsPerParty: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Upload Size (MB)</Label>
                <Input
                  type="number"
                  value={siteSettings.maxVideoUploadSize}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, maxVideoUploadSize: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <Button onClick={() => handleSaveSettings("Site")} disabled={isLoading} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Site Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enforce HTTPS</Label>
                <p className="text-xs text-muted-foreground">Redirect all HTTP to HTTPS</p>
              </div>
              <Switch
                checked={securitySettings.enforceHttps}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, enforceHttps: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Session Security</Label>
              <Select
                value={securitySettings.sessionSecurity}
                onValueChange={(value) => setSecuritySettings(prev => ({ ...prev, sessionSecurity: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="strict">Strict</SelectItem>
                  <SelectItem value="very-strict">Very Strict</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Password Length</Label>
                <Input
                  type="number"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Login Attempt Limit</Label>
                <Input
                  type="number"
                  value={securitySettings.loginAttemptLimit}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginAttemptLimit: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Require Strong Passwords</Label>
                <p className="text-xs text-muted-foreground">Enforce complex passwords</p>
              </div>
              <Switch
                checked={securitySettings.requireStrongPasswords}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireStrongPasswords: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Two-Factor Authentication</Label>
                <p className="text-xs text-muted-foreground">Allow 2FA for users</p>
              </div>
              <Switch
                checked={securitySettings.enableTwoFactor}
                onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, enableTwoFactor: checked }))}
              />
            </div>

            <Button onClick={() => handleSaveSettings("Security")} disabled={isLoading} className="w-full">
              <Lock className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Security Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SMTP Host</Label>
                <Input
                  value={emailSettings.smtpHost}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>SMTP Port</Label>
                <Input
                  type="number"
                  value={emailSettings.smtpPort}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>SMTP Username</Label>
              <Input
                value={emailSettings.smtpUser}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>SMTP Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={emailSettings.smtpPassword}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>From Name</Label>
                <Input
                  value={emailSettings.fromName}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>From Email</Label>
                <Input
                  type="email"
                  value={emailSettings.fromEmail}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                />
              </div>
            </div>

            <Button onClick={() => handleSaveSettings("Email")} disabled={isLoading} className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Email Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Send notifications via email</p>
                </div>
                <Switch
                  checked={notificationSettings.enableEmailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, enableEmailNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Browser push notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.enablePushNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, enablePushNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>New User Notifications</Label>
                  <p className="text-xs text-muted-foreground">Notify when users register</p>
                </div>
                <Switch
                  checked={notificationSettings.newUserNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, newUserNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Party Report Notifications</Label>
                  <p className="text-xs text-muted-foreground">Notify of reported content</p>
                </div>
                <Switch
                  checked={notificationSettings.partyReportNotifications}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, partyReportNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>System Alerts</Label>
                  <p className="text-xs text-muted-foreground">Critical system notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.systemAlerts}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))}
                />
              </div>
            </div>

            <Button onClick={() => handleSaveSettings("Notifications")} disabled={isLoading} className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save Notification Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Button variant="destructive" className="w-full">
                <Database className="h-4 w-4 mr-2" />
                Reset Database
              </Button>
              <p className="text-xs text-muted-foreground">
                This will delete all user data and cannot be undone.
              </p>
            </div>

            <div className="space-y-2">
              <Button variant="destructive" className="w-full">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Factory Reset
              </Button>
              <p className="text-xs text-muted-foreground">
                Reset all settings to default values.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
