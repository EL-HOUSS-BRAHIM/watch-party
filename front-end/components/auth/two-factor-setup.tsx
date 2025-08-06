"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { QRCodeSVG } from "qrcode.react"
import { Copy, CheckCircle, AlertCircle, Shield } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/hooks/use-api"

interface TwoFactorSetupData {
  qr_code: string
  secret_key: string
  backup_codes: string[]
}

export function TwoFactorSetup() {
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSetupComplete, setIsSetupComplete] = useState(false)
  const [error, setError] = useState("")
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false)
  
  const { toast } = useToast()
  const api = useApi()

  useEffect(() => {
    generateSetupData()
  }, [])

  const generateSetupData = async () => {
    try {
      const response = await api.post("/auth/2fa/setup/")
      setSetupData(response.data)
    } catch (err) {
      setError("Failed to generate 2FA setup data")
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    })
  }

  const copyBackupCodes = () => {
    if (setupData) {
      const codes = setupData.backup_codes.join("\n")
      navigator.clipboard.writeText(codes)
      setCopiedBackupCodes(true)
      toast({
        title: "Backup codes copied!",
        description: "Store these codes in a safe place",
      })
    }
  }

  const verifyAndEnable = async () => {
    if (!verificationCode) {
      setError("Please enter the verification code")
      return
    }

    setIsVerifying(true)
    setError("")

    try {
      await api.post("/auth/2fa/verify/", {
        code: verificationCode
      })
      setIsSetupComplete(true)
      toast({
        title: "2FA Enabled!",
        description: "Two-factor authentication has been successfully enabled",
      })
    } catch (err) {
      setError("Invalid verification code. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  if (isSetupComplete) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-green-600 dark:text-green-400">2FA Enabled Successfully!</CardTitle>
          <CardDescription>
            Your account is now protected with two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => window.location.href = "/dashboard"}
            className="w-full"
          >
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!setupData) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Generating 2FA setup...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle>Enable Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Scan QR Code */}
          <div>
            <h3 className="font-semibold mb-3">Step 1: Scan QR Code</h3>
            <div className="text-center space-y-4">
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCodeSVG value={setupData.qr_code} size={200} />
              </div>
              <p className="text-sm text-muted-foreground">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
            </div>
          </div>

          <Separator />

          {/* Step 2: Manual Setup */}
          <div>
            <h3 className="font-semibold mb-3">Step 2: Manual Setup (Alternative)</h3>
            <div className="space-y-2">
              <Label htmlFor="secret-key">Secret Key</Label>
              <div className="flex gap-2">
                <Input
                  id="secret-key"
                  value={setupData.secret_key}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(setupData.secret_key, "Secret key")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                If you can't scan the QR code, manually enter this secret key in your authenticator app
              </p>
            </div>
          </div>

          <Separator />

          {/* Step 3: Verify */}
          <div>
            <h3 className="font-semibold mb-3">Step 3: Verify Setup</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="verification-code">Enter 6-digit code from your app</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={verifyAndEnable}
                disabled={isVerifying || verificationCode.length !== 6}
                className="w-full"
              >
                {isVerifying ? "Verifying..." : "Enable 2FA"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backup Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-orange-600 dark:text-orange-400">
            Important: Save Your Backup Codes
          </CardTitle>
          <CardDescription>
            These codes can be used to access your account if you lose your authenticator device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {setupData.backup_codes.map((code, index) => (
                  <div key={index} className="text-center p-2 bg-background rounded">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={copyBackupCodes}
              variant="outline"
              className="w-full"
              disabled={copiedBackupCodes}
            >
              {copiedBackupCodes ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Backup Codes Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Backup Codes
                </>
              )}
            </Button>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Store these codes in a secure location. Each code can only be used once.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
