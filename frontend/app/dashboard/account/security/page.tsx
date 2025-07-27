"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  Shield,
  Key,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
  LogOut,
  Monitor,
  Clock,
  MapPin,
  RefreshCw,
  Download,
  QrCode
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// Password strength validation
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Password must contain uppercase, lowercase, number, and special character"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PasswordFormData = z.infer<typeof passwordSchema>

interface Session {
  id: string
  deviceName: string
  browser: string
  os: string
  location: string
  ipAddress: string
  lastActive: string
  isCurrent: boolean
  createdAt: string
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  loginAlerts: boolean
  sessionTimeout: number
  trustedDevices: number
  lastPasswordChange: string
  accountCreated: string
}

interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export default function AccountSecurityPage() {
  const { user, logout } = useAuth()
  const { toast } = useToast()

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isTogglingTwoFA, setIsTogglingTwoFA] = useState(false)
  const [showTwoFASetup, setShowTwoFASetup] = useState(false)
  const [twoFASetup, setTwoFASetup] = useState<TwoFactorSetup | null>(null)
  const [twoFACode, setTwoFACode] = useState("")
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    watch: watchPassword,
    reset: resetPasswordForm
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  })

  const newPassword = watchPassword("newPassword")

  useEffect(() => {
    loadSecurityData()
  }, [])

  const loadSecurityData = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      
      // Load security settings
      const settingsResponse = await fetch("/api/users/security/settings/", {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Load active sessions
      const sessionsResponse = await fetch("/api/users/sessions/", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (settingsResponse.ok && sessionsResponse.ok) {
        const settings = await settingsResponse.json()
        const sessionData = await sessionsResponse.json()
        
        setSecuritySettings(settings)
        setSessions(sessionData.results || sessionData.sessions || [])
      }
    } catch (error) {
      console.error("Failed to load security data:", error)
      toast({
        title: "Error",
        description: "Failed to load security settings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength += 20
    if (password.length >= 12) strength += 10
    if (/[a-z]/.test(password)) strength += 20
    if (/[A-Z]/.test(password)) strength += 20
    if (/\d/.test(password)) strength += 15
    if (/[@$!%*?&]/.test(password)) strength += 15
    return Math.min(strength, 100)
  }

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 40) return "bg-red-500"
    if (strength < 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = (strength: number): string => {
    if (strength < 40) return "Weak"
    if (strength < 70) return "Medium" 
    return "Strong"
  }

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setIsChangingPassword(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/password/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: data.currentPassword,
          new_password: data.newPassword,
        }),
      })

      if (response.ok) {
        resetPasswordForm()
        toast({
          title: "Password Changed",
          description: "Your password has been successfully updated.",
        })
        loadSecurityData() // Refresh to update last password change date
      } else {
        const errorData = await response.json()
        toast({
          title: "Password Change Failed",
          description: errorData.message || "Failed to change password.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Password change error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const setupTwoFA = async () => {
    setIsTogglingTwoFA(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/2fa/setup/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const setup = await response.json()
        setTwoFASetup(setup)
        setShowTwoFASetup(true)
      } else {
        toast({
          title: "Setup Failed",
          description: "Failed to set up two-factor authentication.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("2FA setup error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTogglingTwoFA(false)
    }
  }

  const enableTwoFA = async () => {
    if (!twoFACode.trim()) {
      toast({
        title: "Verification Required",
        description: "Please enter the verification code.",
        variant: "destructive",
      })
      return
    }

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/2fa/enable/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: twoFACode,
          secret: twoFASetup?.secret
        }),
      })

      if (response.ok) {
        setShowTwoFASetup(false)
        setTwoFACode("")
        setTwoFASetup(null)
        loadSecurityData()
        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication has been enabled successfully.",
        })
      } else {
        toast({
          title: "Invalid Code",
          description: "The verification code is incorrect. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("2FA enable error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const disableTwoFA = async () => {
    setIsTogglingTwoFA(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/2fa/disable/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        loadSecurityData()
        toast({
          title: "2FA Disabled",
          description: "Two-factor authentication has been disabled.",
        })
      } else {
        toast({
          title: "Failed to Disable",
          description: "Failed to disable two-factor authentication.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("2FA disable error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsTogglingTwoFA(false)
    }
  }

  const updateSecuritySetting = async (setting: string, value: boolean | number) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/security/settings/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [setting]: value }),
      })

      if (response.ok) {
        setSecuritySettings(prev => prev ? { ...prev, [setting]: value } : null)
        toast({
          title: "Settings Updated",
          description: "Your security settings have been updated.",
        })
      }
    } catch (error) {
      console.error("Security setting update error:", error)
      toast({
        title: "Error",
        description: "Failed to update security settings.",
        variant: "destructive",
      })
    }
  }

  const revokeSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/sessions/${sessionId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId))
        toast({
          title: "Session Revoked",
          description: "The session has been revoked successfully.",
        })
      }
    } catch (error) {
      console.error("Session revoke error:", error)
      toast({
        title: "Error",
        description: "Failed to revoke session.",
        variant: "destructive",
      })
    }
  }

  const revokeAllSessions = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/sessions/revoke-all/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        toast({
          title: "All Sessions Revoked",
          description: "All other sessions have been revoked. You will need to log in again on other devices.",
        })
        loadSecurityData()
      }
    } catch (error) {
      console.error("Revoke all sessions error:", error)
      toast({
        title: "Error",
        description: "Failed to revoke sessions.",
        variant: "destructive",
      })
    }
  }

  const downloadBackupCodes = () => {
    if (!twoFASetup?.backupCodes) return

    const content = `Watch Party - Two-Factor Authentication Backup Codes\n\nGenerated: ${new Date().toISOString()}\nAccount: ${user?.email}\n\nBackup Codes (use each code only once):\n\n${twoFASetup.backupCodes.map((code, i) => `${i + 1}. ${code}`).join('\n')}\n\nKeep these codes safe and secure. You can use them to access your account if you lose your authenticator device.`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `watch-party-backup-codes-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const passwordStrength = newPassword ? calculatePasswordStrength(newPassword) : 0

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Account Security
          </h1>
          <p className="text-gray-600 mt-2">Manage your account security and privacy settings</p>
        </div>

        <div className="space-y-8">
          {/* Password Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Password
              </CardTitle>
              <CardDescription>
                Last changed: {securitySettings?.lastPasswordChange 
                  ? formatDistanceToNow(new Date(securitySettings.lastPasswordChange), { addSuffix: true })
                  : "Never"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? "text" : "password"}
                      {...registerPassword("currentPassword")}
                      className={passwordErrors.currentPassword ? "border-red-500" : ""}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-red-500 mt-1">{passwordErrors.currentPassword.message}</p>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      {...registerPassword("newPassword")}
                      className={passwordErrors.newPassword ? "border-red-500" : ""}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-red-500 mt-1">{passwordErrors.newPassword.message}</p>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {newPassword && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Password strength:</span>
                        <span className={`font-medium ${
                          passwordStrength < 40 ? 'text-red-500' :
                          passwordStrength < 70 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {getPasswordStrengthText(passwordStrength)}
                        </span>
                      </div>
                      <Progress 
                        value={passwordStrength} 
                        className={`h-2 ${getPasswordStrengthColor(passwordStrength)}`}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      {...registerPassword("confirmPassword")}
                      className={passwordErrors.confirmPassword ? "border-red-500" : ""}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">{passwordErrors.confirmPassword.message}</p>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    "Change Password"
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
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    securitySettings?.twoFactorEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <div>
                    <p className="font-medium">
                      Two-Factor Authentication {securitySettings?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {securitySettings?.twoFactorEnabled 
                        ? "Your account is protected with 2FA"
                        : "Secure your account with an authenticator app"
                      }
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={securitySettings?.twoFactorEnabled ? disableTwoFA : setupTwoFA}
                  disabled={isTogglingTwoFA}
                  variant={securitySettings?.twoFactorEnabled ? "destructive" : "default"}
                >
                  {isTogglingTwoFA ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : securitySettings?.twoFactorEnabled ? (
                    "Disable 2FA"
                  ) : (
                    "Enable 2FA"
                  )}
                </Button>
              </div>

              {securitySettings?.twoFactorEnabled && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Two-factor authentication is active. You'll need to enter a code from your authenticator app when signing in.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Security Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Security Preferences</CardTitle>
              <CardDescription>Configure additional security options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="loginAlerts">Login Alerts</Label>
                  <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
                </div>
                <Switch
                  id="loginAlerts"
                  checked={securitySettings?.loginAlerts}
                  onCheckedChange={(checked) => updateSecuritySetting("loginAlerts", checked)}
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="sessionTimeout">Session Timeout</Label>
                <p className="text-sm text-gray-600 mb-2">Automatically log out after period of inactivity</p>
                <select
                  id="sessionTimeout"
                  value={securitySettings?.sessionTimeout || 1440}
                  onChange={(e) => updateSecuritySetting("sessionTimeout", parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={240}>4 hours</option>
                  <option value={480}>8 hours</option>
                  <option value={1440}>24 hours</option>
                  <option value={10080}>7 days</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Active Sessions ({sessions.length})
                </span>
                <Button variant="outline" onClick={revokeAllSessions} size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Revoke All Others
                </Button>
              </CardTitle>
              <CardDescription>
                Manage where you're logged in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{session.deviceName}</p>
                          {session.isCurrent && (
                            <Badge variant="default" className="text-xs">Current</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {session.browser} on {session.os}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last active {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {!session.isCurrent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revokeSession(session.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Basic security information about your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Account Created</p>
                  <p className="text-gray-600">
                    {securitySettings?.accountCreated 
                      ? formatDistanceToNow(new Date(securitySettings.accountCreated), { addSuffix: true })
                      : "Unknown"
                    }
                  </p>
                </div>
                <div>
                  <p className="font-medium">Trusted Devices</p>
                  <p className="text-gray-600">{securitySettings?.trustedDevices || 0} devices</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two-Factor Setup Modal */}
        {showTwoFASetup && twoFASetup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Set Up Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Scan the QR code with your authenticator app and enter the verification code
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-48 h-48 mx-auto bg-white p-4 rounded-lg border">
                    <img 
                      src={twoFASetup.qrCode} 
                      alt="Two-Factor Authentication QR Code"
                      className="w-full h-full"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Or enter this secret key manually: <code className="font-mono">{twoFASetup.secret}</code>
                  </p>
                </div>

                <div>
                  <Label htmlFor="twoFACode">Verification Code</Label>
                  <Input
                    id="twoFACode"
                    placeholder="Enter 6-digit code"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value)}
                    maxLength={6}
                  />
                </div>

                <Alert>
                  <Download className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span>Save your backup codes</span>
                      <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowTwoFASetup(false)}>
                    Cancel
                  </Button>
                  <Button onClick={enableTwoFA}>
                    Enable 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
