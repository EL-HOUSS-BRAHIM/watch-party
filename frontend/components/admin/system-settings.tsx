"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  Save,
  RotateCcw,
  Shield,
  Mail,
  Database,
  Server,
  Globe,
  Bell,
  CreditCard,
  Users,
  Video,
  MessageSquare,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { adminAPI } from "@/lib/api"

interface SystemSettings {
  general: {
    siteName: string
    siteDescription: string
    supportEmail: string
    maintenanceMode: boolean
    registrationEnabled: boolean
    inviteOnlyMode: boolean
    maxUsersPerParty: number
    maxPartyDuration: number
    defaultVideoQuality: string
  }
  security: {
    passwordMinLength: number
    requireEmailVerification: boolean
    enableTwoFactor: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    rateLimitEnabled: boolean
    corsOrigins: string[]
  }
  email: {
    provider: string
    smtpHost: string
    smtpPort: number
    smtpUsername: string
    smtpPassword: string
    fromEmail: string
    fromName: string
    enableEmailNotifications: boolean
  }
  storage: {
    provider: string
    maxFileSize: number
    allowedVideoFormats: string[]
    videoRetentionDays: number
    enableCdn: boolean
    cdnUrl: string
  }
  payment: {
    stripePublishableKey: string
    stripeSecretKey: string
    enableBilling: boolean
    currency: string
    taxRate: number
  }
  features: {
    enableChat: boolean
    enableVideoUpload: boolean
    enableSocialFeatures: boolean
    enableNotifications: boolean
    enableAnalytics: boolean
    enableModeration: boolean
  }
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await adminAPI.getSettings()
      setSettings(data as SystemSettings)
    } catch (error) {
      console.error("Failed to load settings:", error)
      toast({
        title: "Error",
        description: "Failed to load system settings. Please try again.",
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
      await adminAPI.updateSettings(settings)
      
      setHasChanges(false)
      toast({
        title: "Settings Saved",
        description: "System settings have been updated successfully.",
      })
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

  const resetSettings = async () => {
    if (!confirm("Are you sure you want to reset all settings to defaults?")) return

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/admin/settings/reset/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await loadSettings()
        setHasChanges(false)
        toast({
          title: "Settings Reset",
          description: "All settings have been reset to defaults.",
        })
      }
    } catch (error) {
      console.error("Failed to reset settings:", error)
      toast({
        title: "Error",
        description: "Failed to reset settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateSetting = (category: keyof SystemSettings, key: string, value: any) => {
    if (!settings) return

    setSettings((prev) => {
      if (!prev) return null
      return {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      }
    })
    setHasChanges(true)
  }

  const testEmailSettings = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/admin/settings/test-email/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: user?.email,
          subject: "Test Email",
          message: "This is a test email from your watch party platform.",
        }),
      })

      if (response.ok) {
        toast({
          title: "Test Email Sent",
          description: "Check your inbox for the test email.",
        })
      }
    } catch (error) {
      console.error("Failed to send test email:", error)
      toast({
        title: "Error",
        description: "Failed to send test email. Please check your settings.",
        variant: "destructive",
      })
    }
  }

  if (isLoading || !settings) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading system settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            System Settings
          </h2>
          <p className="text-gray-600">Configure your watch party platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={resetSettings}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} disabled={!hasChanges || isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-yellow-800">You have unsaved changes. Don't forget to save your settings.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic configuration for your platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting("general", "siteName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) => updateSetting("general", "supportEmail", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSetting("general", "siteDescription", e.target.value)}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">Temporarily disable access to the platform</p>
                  </div>
                  <Switch
                    checked={settings.general.maintenanceMode}
                    onCheckedChange={(checked) => updateSetting("general", "maintenanceMode", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Registration Enabled</Label>
                    <p className="text-sm text-gray-500">Allow new users to register</p>
                  </div>
                  <Switch
                    checked={settings.general.registrationEnabled}
                    onCheckedChange={(checked) => updateSetting("general", "registrationEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Invite Only Mode</Label>
                    <p className="text-sm text-gray-500">Require invitations for new registrations</p>
                  </div>
                  <Switch
                    checked={settings.general.inviteOnlyMode}
                    onCheckedChange={(checked) => updateSetting("general", "inviteOnlyMode", checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUsersPerParty">Max Users Per Party</Label>
                  <Input
                    id="maxUsersPerParty"
                    type="number"
                    value={settings.general.maxUsersPerParty}
                    onChange={(e) => updateSetting("general", "maxUsersPerParty", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxPartyDuration">Max Party Duration (hours)</Label>
                  <Input
                    id="maxPartyDuration"
                    type="number"
                    value={settings.general.maxPartyDuration}
                    onChange={(e) => updateSetting("general", "maxPartyDuration", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultVideoQuality">Default Video Quality</Label>
                  <Select
                    value={settings.general.defaultVideoQuality}
                    onValueChange={(value) => updateSetting("general", "defaultVideoQuality", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="480p">480p</SelectItem>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => updateSetting("security", "passwordMinLength", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting("security", "sessionTimeout", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSetting("security", "maxLoginAttempts", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-gray-500">Users must verify their email before accessing the platform</p>
                  </div>
                  <Switch
                    checked={settings.security.requireEmailVerification}
                    onCheckedChange={(checked) => updateSetting("security", "requireEmailVerification", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Allow users to enable 2FA for their accounts</p>
                  </div>
                  <Switch
                    checked={settings.security.enableTwoFactor}
                    onCheckedChange={(checked) => updateSetting("security", "enableTwoFactor", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rate Limiting</Label>
                    <p className="text-sm text-gray-500">Enable API rate limiting to prevent abuse</p>
                  </div>
                  <Switch
                    checked={settings.security.rateLimitEnabled}
                    onCheckedChange={(checked) => updateSetting("security", "rateLimitEnabled", checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="corsOrigins">CORS Origins (one per line)</Label>
                <Textarea
                  id="corsOrigins"
                  value={settings.security.corsOrigins.join("\n")}
                  onChange={(e) => updateSetting("security", "corsOrigins", e.target.value.split("\n").filter(Boolean))}
                  rows={4}
                  placeholder="https://yourdomain.com&#10;https://app.yourdomain.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Settings
              </CardTitle>
              <CardDescription>Configure email delivery and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailProvider">Email Provider</Label>
                <Select
                  value={settings.email.provider}
                  onValueChange={(value) => updateSetting("email", "provider", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="smtp">SMTP</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="mailgun">Mailgun</SelectItem>
                    <SelectItem value="ses">Amazon SES</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {settings.email.provider === "smtp" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={settings.email.smtpHost}
                        onChange={(e) => updateSetting("email", "smtpHost", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={settings.email.smtpPort}
                        onChange={(e) => updateSetting("email", "smtpPort", Number.parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtpUsername">SMTP Username</Label>
                      <Input
                        id="smtpUsername"
                        value={settings.email.smtpUsername}
                        onChange={(e) => updateSetting("email", "smtpUsername", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={settings.email.smtpPassword}
                        onChange={(e) => updateSetting("email", "smtpPassword", e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => updateSetting("email", "fromEmail", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={settings.email.fromName}
                    onChange={(e) => updateSetting("email", "fromName", e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Email Notifications</Label>
                  <p className="text-sm text-gray-500">Send email notifications to users</p>
                </div>
                <Switch
                  checked={settings.email.enableEmailNotifications}
                  onCheckedChange={(checked) => updateSetting("email", "enableEmailNotifications", checked)}
                />
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={testEmailSettings}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Test Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Storage Settings
              </CardTitle>
              <CardDescription>Configure file storage and video settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storageProvider">Storage Provider</Label>
                <Select
                  value={settings.storage.provider}
                  onValueChange={(value) => updateSetting("storage", "provider", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local Storage</SelectItem>
                    <SelectItem value="s3">Amazon S3</SelectItem>
                    <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                    <SelectItem value="azure">Azure Blob Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings.storage.maxFileSize}
                    onChange={(e) => updateSetting("storage", "maxFileSize", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoRetentionDays">Video Retention (days)</Label>
                  <Input
                    id="videoRetentionDays"
                    type="number"
                    value={settings.storage.videoRetentionDays}
                    onChange={(e) => updateSetting("storage", "videoRetentionDays", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowedVideoFormats">Allowed Video Formats (comma-separated)</Label>
                <Input
                  id="allowedVideoFormats"
                  value={settings.storage.allowedVideoFormats.join(", ")}
                  onChange={(e) =>
                    updateSetting(
                      "storage",
                      "allowedVideoFormats",
                      e.target.value.split(",").map((f) => f.trim()),
                    )
                  }
                  placeholder="mp4, webm, avi, mov"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable CDN</Label>
                  <p className="text-sm text-gray-500">Use CDN for faster video delivery</p>
                </div>
                <Switch
                  checked={settings.storage.enableCdn}
                  onCheckedChange={(checked) => updateSetting("storage", "enableCdn", checked)}
                />
              </div>

              {settings.storage.enableCdn && (
                <div className="space-y-2">
                  <Label htmlFor="cdnUrl">CDN URL</Label>
                  <Input
                    id="cdnUrl"
                    value={settings.storage.cdnUrl}
                    onChange={(e) => updateSetting("storage", "cdnUrl", e.target.value)}
                    placeholder="https://cdn.yourdomain.com"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Settings
              </CardTitle>
              <CardDescription>Configure payment processing and billing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Billing</Label>
                  <p className="text-sm text-gray-500">Enable subscription billing and payments</p>
                </div>
                <Switch
                  checked={settings.payment.enableBilling}
                  onCheckedChange={(checked) => updateSetting("payment", "enableBilling", checked)}
                />
              </div>

              {settings.payment.enableBilling && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stripePublishableKey">Stripe Publishable Key</Label>
                      <Input
                        id="stripePublishableKey"
                        value={settings.payment.stripePublishableKey}
                        onChange={(e) => updateSetting("payment", "stripePublishableKey", e.target.value)}
                        placeholder="pk_..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                      <Input
                        id="stripeSecretKey"
                        type="password"
                        value={settings.payment.stripeSecretKey}
                        onChange={(e) => updateSetting("payment", "stripeSecretKey", e.target.value)}
                        placeholder="sk_..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={settings.payment.currency}
                        onValueChange={(value) => updateSetting("payment", "currency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usd">USD</SelectItem>
                          <SelectItem value="eur">EUR</SelectItem>
                          <SelectItem value="gbp">GBP</SelectItem>
                          <SelectItem value="cad">CAD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        step="0.01"
                        value={settings.payment.taxRate}
                        onChange={(e) => updateSetting("payment", "taxRate", Number.parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Feature Settings
              </CardTitle>
              <CardDescription>Enable or disable platform features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Chat System
                      </Label>
                      <p className="text-sm text-gray-500">Enable real-time chat in parties</p>
                    </div>
                    <Switch
                      checked={settings.features.enableChat}
                      onCheckedChange={(checked) => updateSetting("features", "enableChat", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Video Upload
                      </Label>
                      <p className="text-sm text-gray-500">Allow users to upload videos</p>
                    </div>
                    <Switch
                      checked={settings.features.enableVideoUpload}
                      onCheckedChange={(checked) => updateSetting("features", "enableVideoUpload", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Social Features
                      </Label>
                      <p className="text-sm text-gray-500">Enable friends, following, and social interactions</p>
                    </div>
                    <Switch
                      checked={settings.features.enableSocialFeatures}
                      onCheckedChange={(checked) => updateSetting("features", "enableSocialFeatures", checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                      </Label>
                      <p className="text-sm text-gray-500">Enable push and email notifications</p>
                    </div>
                    <Switch
                      checked={settings.features.enableNotifications}
                      onCheckedChange={(checked) => updateSetting("features", "enableNotifications", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Analytics</Label>
                      <p className="text-sm text-gray-500">Enable usage analytics and tracking</p>
                    </div>
                    <Switch
                      checked={settings.features.enableAnalytics}
                      onCheckedChange={(checked) => updateSetting("features", "enableAnalytics", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Content Moderation
                      </Label>
                      <p className="text-sm text-gray-500">Enable automated content moderation</p>
                    </div>
                    <Switch
                      checked={settings.features.enableModeration}
                      onCheckedChange={(checked) => updateSetting("features", "enableModeration", checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
