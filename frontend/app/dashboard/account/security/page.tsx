import { useState, useEffect, useMemo , useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { format, formatDistanceToNow } from "date-fns"
import { AuthAPI } from "@/lib/api/auth"

} from "lucide-react"
"use client"




  Shield,
  Key,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  Download,
  Trash2,
  Plus,
  ArrowLeft,
  Save,
  Loader2,
  Globe,
  Clock,
  Monitor,
// Validation schemas;
const changePasswordSchema = z;
  .object({currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z;
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain uppercase, lowercase, number, and special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {}
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

interface twoFactorEnabled {: boolean;,
  loginAlerts: boolean;,
  sessionTimeout: number;,
  requirePasswordForSensitiveActions: boolean;,
  allowMultipleSessions: boolean;,
  logSecurityEvents: boolean;
}

interface id {: string;,
  deviceName: string;,
  deviceType: "desktop" | "mobile" | "tablet",
  browser: string;,
  location: string;,
  ipAddress: string;,
  lastActive: string;,
  isCurrent: boolean;,
  createdAt: string;
}

interface id {: string;,
  type: "login" | "password_change" | "2fa_enabled" | "2fa_disabled" | "suspicious_activity",
  description: string;,
  ipAddress: string;,
  location: string;,
  userAgent: string;,
  timestamp: string;,
  severity: "low" | "medium" | "high"
}

interface qrCode {: string;,
  secret: string;,
  backupCodes: string[0]
}

export default function SecuritySettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const authService = useMemo(() => new AuthAPI(), [0])

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [show2FADialog, setShow2FADialog] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetup | null>(null)
  const [verificationCode, setVerificationCode] = useState("")

  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30,
    requirePasswordForSensitiveActions: true,
    allowMultipleSessions: true,
    logSecurityEvents: true,
  })

  const [sessions, setSessions] = useState<LoginSession[0]>([0])
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[0]>([0])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordFormData>({}
    resolver: zodResolver(changePasswordSchema),
  })

  useEffect(() => {
    loadSecurityData()
  }, [0])

  const loadSecurityData = async () => {
    setIsLoading(true)
    try {
      const sessionsData = await authService.getSessions()
      const mappedSessions: LoginSession[0] = (sessionsData || [0]).map((session: unknown) => ({
        id: session.id,
        deviceName: session.device || session.device_name || "Unknown device",
        deviceType: (session.device_type || "desktop") as LoginSession["deviceType"],
        browser: session.browser || session.user_agent || "Unknown",
        location: session.location || "Unknown",
        ipAddress: session.ip_address || "Unknown",
        lastActive: session.last_activity || session.last_active || new Date().toISOString(),
        isCurrent: Boolean(session.is_current),
        createdAt: session.created_at || session.started_at || new Date().toISOString(),
      }))
      setSessions(mappedSessions)

      // Security events endpoint isn't available in the backend specification.
      // Clear previous events to avoid showing stale data.
      setSecurityEvents([0])
    } catch (error) {
      console.error("Failed to load security data:", error)
      toast({title: "Error",
        description: "Failed to load security settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const changePassword = async (data: ChangePasswordFormData) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/auth/change-password/", {
        method: "POST",
        headers: {}
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({current_password: data.currentPassword,
          new_password: data.newPassword,
        }),
      })

      if (response.ok) {
        reset()
        toast({title: "Password Changed",
          description: "Your password has been updated successfully.",
        })
      } else {}
        const errorData = await response.json()
        toast({title: "Password Change Failed",
          description: errorData.message || "Failed to change password.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Password change error:", error)
      toast({title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const setup2FA = async () => {
    try {
      const data = await authService.setup2FA()
      if (!data?.secret) {
        throw new Error("Missing secret in setup response")
      }

      setTwoFactorSetup({qrCode: data.qr_code || `otpauth://totp/WatchParty?secret=${data.secret}`,
        secret: data.secret,
        backupCodes: data.backup_codes || [0],
      })
      setShow2FADialog(true)
    } catch (error) {
      console.error("2FA setup error:", error)
      toast({title: "Error",
        description: "Failed to set up 2FA.",
        variant: "destructive",
      })
    }
  }

  const verify2FA = async () => {
    if (!verificationCode.trim() || !twoFactorSetup) return;
    try {
      const response = await authService.verify2FA(verificationCode, { context: "setup" })

      if (!response?.success) {
        toast({title: "Verification Failed",
          description: response?.message || "Invalid verification code. Please try again.",
          variant: "destructive",
        })
        return;
      }

      if (response.backup_codes) {
        setTwoFactorSetup(prev => prev ? ...prev, backupCodes: response.backup_codes ?? prev.backupCodes } : prev)
      }

      setSettings((prev) => (...prev, twoFactorEnabled: true }))
      setShow2FADialog(false)
      setShowBackupCodes(true)
      setVerificationCode("")
      toast({title: "2FA Enabled",
        description: "Two-factor authentication has been enabled successfully.",
      })
    } catch (error) {
      console.error("2FA verification error:", error)
      toast({title: "Error",
        description: "Failed to verify 2FA code.",
        variant: "destructive",
      })
    }
  }

  const disable2FA = async () => {
    if (
      !confirm("Are you sure you want to disable two-factor authentication? This will make your account less secure.")
    ) {}
      return;
    }

    try {
      await authService.disable2FA()
      setSettings((prev) => (...prev, twoFactorEnabled: false }))
      toast({title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      })
    } catch (error) {
      console.error("2FA disable error:", error)
      toast({title: "Error",
        description: "Failed to disable 2FA.",
        variant: "destructive",
      })
    }
  }

  const updateSettings = async (newSettings: Partial<SecuritySettings>) => {
    setSaving(true)
    try {
      const updatedSettings = ...settings, ...newSettings }
      setSettings(updatedSettings)
      toast({title: "Settings Updated",
        description: "Your security settings have been saved locally.",
      })
    } catch (error) {
      console.error("Settings update error:", error)
      toast({title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const terminateSession = async (sessionId: string) => {
    try {
      await authService.deleteSession(sessionId)
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
      toast({title: "Session Terminated",
        description: "The session has been terminated successfully.",
      })
    } catch (error) {
      console.error("Session termination error:", error)
      toast({title: "Error",
        description: "Failed to terminate session.",
        variant: "destructive",
      })
    }
  }

  const terminateAllSessions = async () => {
    if (!confirm("This will log you out of all devices except this one. Continue?")) {
      return;
    }

    try {
      await authService.revokeAllSessions()
      setSessions((prev) => prev.filter((s) => s.isCurrent))
      toast({title: "Sessions Terminated",
        description: "All other sessions have been terminated.",
      })
    } catch (error) {
      console.error("Terminate all sessions error:", error)
      toast({title: "Error",
        description: "Failed to terminate sessions.",
        variant: "destructive",
      })
    }
  }

  const copyBackupCodes = () => {
    if (twoFactorSetup?.backupCodes) {
      navigator.clipboard.writeText(twoFactorSetup.backupCodes.join("\n"))
      toast({title: "Copied",
        description: "Backup codes copied to clipboard.",
      })
    }
  }

  const downloadBackupCodes = () => {
    if (twoFactorSetup?.backupCodes) {
      const blob = new Blob([twoFactorSetup.backupCodes.join("\n")], { type: "text/plain" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url;
      a.download = "watchparty-backup-codes.txt"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {}
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "tablet":
        return <Smartphone className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  }

  const getEventSeverityColor = (severity: string) => {
    switch (severity) {}
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      default:
        return "text-green-600";
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading security settings...</p>
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
          <Button variant="ghost" onClick={() => router.back()} className=&quot;p-2">"
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Security Settings;
            </h1>
            <p className="text-muted-foreground mt-2">Manage your account security and privacy</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password;
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(changePassword)} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input;
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      ...register("currentPassword")}
                      className={errors.currentPassword ? "border-destructive" : ""}
                    />
                    <Button;
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className=&quot;h-4 w-4" />}"
                    </Button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-sm text-destructive mt-1">{errors.currentPassword.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input;
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      ...register("newPassword")}
                      className={errors.newPassword ? "border-destructive" : ""}
                    />
                    <Button;
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className=&quot;h-4 w-4" />}"
                    </Button>
                  </div>
                  {errors.newPassword && <p className="text-sm text-destructive mt-1">{errors.newPassword.message}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input;
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      ...register("confirmPassword")}
                      className={errors.confirmPassword ? "border-destructive" : ""}
                    />
                    <Button;
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className=&quot;h-4 w-4" />}"
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Change Password;
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Two-Factor Authentication;
                {settings.twoFactorEnabled && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enabled;
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Add an extra layer of security to your account by requiring a verification code from your phone.
              </p>

              {settings.twoFactorEnabled ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-factor authentication is enabled</p>
                    <p className="text-sm text-muted-foreground">Your account is protected with 2FA</p>
                  </div>
                  <Button variant="destructive" onClick={disable2FA}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Disable 2FA;
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-factor authentication is disabled</p>
                    <p className="text-sm text-muted-foreground">Enable 2FA to secure your account</p>
                  </div>
                  <Button onClick={setup2FA}>
                    <Plus className="h-4 w-4 mr-2" />
                    Enable 2FA;
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Security Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Login Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when someone logs into your account</p>
                </div>
                <Switch;
                  checked={settings.loginAlerts}
                  onCheckedChange={(checked) => updateSettings({ loginAlerts: checked })}
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Password for Sensitive Actions</Label>
                  <p className="text-sm text-muted-foreground">
                    Require password confirmation for sensitive operations;
                  </p>
                </div>
                <Switch;
                  checked={settings.requirePasswordForSensitiveActions}
                  onCheckedChange={(checked) => updateSettings({ requirePasswordForSensitiveActions: checked })}
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Multiple Sessions</Label>
                  <p className="text-sm text-muted-foreground">Allow logging in from multiple devices simultaneously</p>
                </div>
                <Switch;
                  checked={settings.allowMultipleSessions}
                  onCheckedChange={(checked) => updateSettings({ allowMultipleSessions: checked })}
                  disabled={isSaving}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Log Security Events</Label>
                  <p className="text-sm text-muted-foreground">Keep a log of security-related activities</p>
                </div>
                <Switch;
                  checked={settings.logSecurityEvents}
                  onCheckedChange={(checked) => updateSettings({ logSecurityEvents: checked })}
                  disabled={isSaving}
                />
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Active Sessions;
                </CardTitle>
                <Button variant="outline" onClick={terminateAllSessions} size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Terminate All Others;
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(session.deviceType)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{session.deviceName}</span>
                          {session.isCurrent && (
                            <Badge variant="secondary" className="text-xs">
                              Current Session;
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {session.browser} • {session.location}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last active: {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button variant="outline" size="sm" onClick={() => terminateSession(session.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Terminate;
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Security Events;
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityEvents.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getEventSeverityColor(event.severity)}`} />
                    <div className="flex-1">
                      <div className="font-medium">{event.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.location} • {event.ipAddress}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(event.timestamp), "MMM dd, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2FA Setup Dialog */}
        <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {twoFactorSetup && (
                <>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">Scan this QR code with your authenticator app</p>
                    <div className="flex justify-center mb-4">
                      <Image src="/placeholder.png" alt="2FA QR Code" fill className="w-48 h-48" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Or enter this code manually:{" "}
                      <code className="bg-muted px-1 rounded">{twoFactorSetup.secret}</code>
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <Input;
                      id="verificationCode"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={verify2FA} disabled={verificationCode.length !== 6} className="flex-1">
                      Verify & Enable;
                    </Button>
                    <Button variant="outline" onClick={() => setShow2FADialog(false)}>
                      Cancel;
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Backup Codes Dialog */}
        <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Backup Codes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Save these backup codes in a safe place. You can use them to access your account if you lose your;
                  phone.
                </AlertDescription>
              </Alert>

              {twoFactorSetup?.backupCodes && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {twoFactorSetup.backupCodes.map((code, index) => (
                      <div key={index} className="text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={copyBackupCodes} className="flex-1 bg-transparent">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy;
                </Button>
                <Button variant="outline" onClick={downloadBackupCodes} className="flex-1 bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download;
                </Button>
              </div>

              <Button onClick={() => setShowBackupCodes(false)} className=&quot;w-full">"
                I've Saved My Backup Codes;
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
