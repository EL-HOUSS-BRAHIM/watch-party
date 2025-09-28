"use client"

import { AlertTriangle, Bell, Calendar, Filter, Mail, Monitor, Moon, Settings, Smartphone, Star, Sun, User, Users, Volume2, Zap } from "lucide-react"
import { useState, useEffect} from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
interface NotificationSettings {}
  // Global settings,
  pushEnabled: boolean,
  emailEnabled: boolean,
  inAppEnabled: boolean,
  desktopEnabled: boolean
  // Timing settings,
  quietHoursEnabled: boolean,
  quietHoursStart: string,
  quietHoursEnd: string
  // Category settings,
  categories: {}
    friends: {}
      enabled: boolean,
      pushEnabled: boolean,
      emailEnabled: boolean,
      priority: "low" | "normal" | "high"
    parties: {}
      enabled: boolean,
      pushEnabled: boolean,
      emailEnabled: boolean,
      priority: "low" | "normal" | "high"
    messages: {}
      enabled: boolean,
      pushEnabled: boolean,
      emailEnabled: boolean,
      priority: "low" | "normal" | "high"
    achievements: {}
      enabled: boolean,
      pushEnabled: boolean,
      emailEnabled: boolean,
      priority: "low" | "normal" | "high"
    store: {}
      enabled: boolean,
      pushEnabled: boolean,
      emailEnabled: boolean,
      priority: "low" | "normal" | "high"
    system: {}
      enabled: boolean,
      pushEnabled: boolean,
      emailEnabled: boolean,
      priority: "low" | "normal" | "high"
  // Advanced settings,
  groupSimilar: boolean,
  batchDelay: number // minutes,
  maxNotificationsPerHour: number,
  soundEnabled: boolean,
  vibrationEnabled: boolean,
  theme: "system" | "light" | "dark"

interface NotificationPreferencesProps {}
  className?: string,

export function NotificationPreferences({ className }: NotificationPreferencesProps) {}
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [0])

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/notifications/settings/", {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      } else {}
        // Set default settings if none exist,
        setSettings({pushEnabled: true,
          emailEnabled: true,
          inAppEnabled: true,
          desktopEnabled: true,
          quietHoursEnabled: false,
          quietHoursStart: "22:00",
          quietHoursEnd: "08:00",
          categories: {}
            friends: { enabled: true, pushEnabled: true, emailEnabled: true, priority: "normal" },
            parties: { enabled: true, pushEnabled: true, emailEnabled: true, priority: "high" },
            messages: { enabled: true, pushEnabled: true, emailEnabled: false, priority: "high" },
            achievements: { enabled: true, pushEnabled: true, emailEnabled: false, priority: "low" },
            store: { enabled: true, pushEnabled: false, emailEnabled: true, priority: "low" },
            system: { enabled: true, pushEnabled: true, emailEnabled: true, priority: "normal" },
          },
          groupSimilar: true,
          batchDelay: 5,
          maxNotificationsPerHour: 10,
          soundEnabled: true,
          vibrationEnabled: true,
          theme: "system",
        })
    } catch (err) {
      console.error("Failed to load notification settings:", error)
      toast({title: "Failed to load settings",
        description: "Please try refreshing the page",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)

  const saveSettings = async () => {
    if (!settings) return,
    setIsSaving(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/notifications/settings/", {}
        method: "PUT",
        headers: {}
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ settings }),
      })

      if (response.ok) {
        setHasChanges(false)
        toast({title: "Settings saved",
          description: "Your notification preferences have been updated",
        })
      } else {}
        throw new Error("Failed to save settings")
    } catch (err) {
      console.error("Failed to save settings:", error)
      toast({title: "Failed to save settings",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)

  const updateSettings = (updates: Partial<NotificationSettings>) => {}
    if (!settings) return,
    setSettings({ ...settings, ...updates })
    setHasChanges(true)

  const updateCategorySettings = (category: keyof NotificationSettings["categories"], updates: Partial<NotificationSettings["categories"][keyof NotificationSettings["categories"]]>) => {}
    if (!settings) return,
    setSettings({...settings,
      categories: {}
        ...settings.categories,
        [category]: {}
          ...settings.categories[category],
          ...updates,
        },
      },
    })
    setHasChanges(true)

  const getCategoryIcon = (category: string) => {}
    switch (category) {
      case "friends": return <Users className="h-4 w-4" />
      case "parties": return <Calendar className="h-4 w-4" />
      case "messages": return <MessageSquare className="h-4 w-4" />
      case "achievements": return <Star className="h-4 w-4" />
      case "store": return <Zap className="h-4 w-4" />
      case "system": return <Settings className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />

  const getCategoryTitle = (category: string) => {}
    switch (category) {
      case "friends": return "Friend Requests & Activity";
      case "parties": return "Party Invitations & Updates";
      case "messages": return "Direct Messages & Chat";
      case "achievements": return "Achievements & Rewards";
      case "store": return "Store & Purchases";
      case "system": return "System & Security";
      default: return category,

  const getPriorityColor = (priority: string) => {}
    switch (priority) {
      case "high": return "text-red-500";
      case "normal": return "text-blue-500";
      case "low": return "text-gray-500";
      default: return "text-gray-500";

  if (isLoading) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Loading notification settings...</span>
            </div>
          </CardContent>
        </Card>
      </div>

  if (!settings) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-muted-foreground">
              Failed to load notification settings
            </div>
          </CardContent>
        </Card>
      </div>

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            {hasChanges && (
              <Button onClick={saveSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Customize how and when you receive notifications
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="timing">Timing</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              {/* Global Notification Methods */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notification Methods</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                      </div>
                    </div>
                    <Switch,
                      checked={settings.pushEnabled}
                      onCheckedChange={(checked) => updateSettings({ pushEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                    </div>
                    <Switch,
                      checked={settings.emailEnabled}
                      onCheckedChange={(checked) => updateSettings({ emailEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base">Desktop Notifications</Label>
                        <p className="text-sm text-muted-foreground">Show notifications in your browser</p>
                      </div>
                    </div>
                    <Switch,
                      checked={settings.desktopEnabled}
                      onCheckedChange={(checked) => updateSettings({ desktopEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base">In-App Notifications</Label>
                        <p className="text-sm text-muted-foreground">Show notifications within the app</p>
                      </div>
                    </div>
                    <Switch,
                      checked={settings.inAppEnabled}
                      onCheckedChange={(checked) => updateSettings({ inAppEnabled: checked })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Sound & Vibration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sound & Vibration</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {settings.soundEnabled ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
                      <div>
                        <Label className="text-base">Sound</Label>
                        <p className="text-sm text-muted-foreground">Play sounds for notifications</p>
                      </div>
                    </div>
                    <Switch,
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base">Vibration</Label>
                        <p className="text-sm text-muted-foreground">Vibrate device for notifications</p>
                      </div>
                    </div>
                    <Switch,
                      checked={settings.vibrationEnabled}
                      onCheckedChange={(checked) => updateSettings({ vibrationEnabled: checked })}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notification Categories</h3>
                <p className="text-sm text-muted-foreground">
                  Configure notifications for different types of activities
                </p>

                <div className="space-y-4">
                  {Object.entries(settings.categories).map(([category, categorySettings]) => (
                    <Card key={category}>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getCategoryIcon(category)}
                              <div>
                                <h4 className="font-medium">{getCategoryTitle(category)}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className={getPriorityColor(categorySettings.priority)}>
                                    {categorySettings.priority} priority
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Switch,
                              checked={categorySettings.enabled}
                              onCheckedChange={(checked) => updateCategorySettings(category as Record<string, unknown>, { enabled: checked })}
                            />
                          </div>

                          {categorySettings.enabled && (
                            <div className="pl-8 space-y-3">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm">Push</Label>
                                  <Switch,
                                    checked={categorySettings.pushEnabled && settings.pushEnabled}
                                    disabled={!settings.pushEnabled}
                                    onCheckedChange={(checked) => updateCategorySettings(category as Record<string, unknown>, { pushEnabled: checked })}
                                  />
                                </div>
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm">Email</Label>
                                  <Switch,
                                    checked={categorySettings.emailEnabled && settings.emailEnabled}
                                    disabled={!settings.emailEnabled}
                                    onCheckedChange={(checked) => updateCategorySettings(category as Record<string, unknown>, { emailEnabled: checked })}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm">Priority Level</Label>
                                <Select,
                                  value={categorySettings.priority}
                                  onValueChange={(value: unknown) => updateCategorySettings(category as Record<string, unknown>, { priority: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="low">
                                      <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                        Low Priority
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="normal">
                                      <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                        Normal Priority
                                      </span>
                                    </SelectItem>
                                    <SelectItem value="high">
                                      <span className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                        High Priority
                                      </span>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timing" className="space-y-6">
              {/* Quiet Hours */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Quiet Hours</h3>
                <p className="text-sm text-muted-foreground">
                  Disable notifications during specific hours
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Moon className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base">Enable Quiet Hours</Label>
                        <p className="text-sm text-muted-foreground">Pause notifications during sleep hours</p>
                      </div>
                    </div>
                    <Switch,
                      checked={settings.quietHoursEnabled}
                      onCheckedChange={(checked) => updateSettings({ quietHoursEnabled: checked })}
                    />
                  </div>

                  {settings.quietHoursEnabled && (
                    <div className="pl-8 grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Select,
                          value={settings.quietHoursStart}
                          onValueChange={(value) => updateSettings({ quietHoursStart: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => {}
                              const hour = i.toString().padStart(2, '0')
                              return (
                                <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                                  {hour}:00
                                </SelectItem>
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <Select,
                          value={settings.quietHoursEnd}
                          onValueChange={(value) => updateSettings({ quietHoursEnd: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => {}
                              const hour = i.toString().padStart(2, '0')
                              return (
                                <SelectItem key={`${hour}:00`} value={`${hour}:00`}>
                                  {hour}:00
                                </SelectItem>
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Rate Limiting */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Rate Limiting</h3>
                <p className="text-sm text-muted-foreground">
                  Control how many notifications you receive
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Maximum notifications per hour: {settings.maxNotificationsPerHour}</Label>
                    <Slider,
                      value={[settings.maxNotificationsPerHour]}
                      onValueChange={([value]) => updateSettings({ maxNotificationsPerHour: value })}
                      max={50}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1</span>
                      <span>25</span>
                      <span>50</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              {/* Grouping & Batching */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Smart Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Filter className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="text-base">Group Similar Notifications</Label>
                        <p className="text-sm text-muted-foreground">Combine multiple similar notifications into one</p>
                      </div>
                    </div>
                    <Switch,
                      checked={settings.groupSimilar}
                      onCheckedChange={(checked) => updateSettings({ groupSimilar: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Batch delay (minutes): {settings.batchDelay}</Label>
                    <Slider,
                      value={[settings.batchDelay]}
                      onValueChange={([value]) => updateSettings({ batchDelay: value })}
                      max={60}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Instant</span>
                      <span>30 min</span>
                      <span>1 hour</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Theme Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Appearance</h3>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label>Notification Theme</Label>
                    <RadioGroup,
                      value={settings.theme}
                      onValueChange={(value: unknown) => updateSettings({ theme: value })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="system" id="system" />
                        <Label htmlFor="system" className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          Follow system theme
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="light" />
                        <Label htmlFor="light" className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light theme
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="dark" />
                        <Label htmlFor="dark" className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark theme
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Warning */}
              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium text-amber-800 dark:text-amber-200">Browser Permissions</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Some notification features require browser permissions. Make sure to allow notifications when prompted.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>

// Default export,
export default NotificationPreferences