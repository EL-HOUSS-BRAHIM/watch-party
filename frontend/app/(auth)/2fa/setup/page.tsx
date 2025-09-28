import { ArrowRight, Check, CheckCircle, Copy, Download, Image, Key, Link, Refresh, Shield, Smartphone } from "lucide-react"
import { useState, useEffect, useMemo, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import QRCode from "qrcode"
import { AuthAPI } from "@/lib/api/auth"

"use client"
export default function TwoFactorSetupPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const authService = useMemo(() => new AuthAPI(), [])

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [secretKey, setSecretKey] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [verificationCode, setVerificationCode] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isGeneratingQR, setIsGeneratingQR] = useState(false)

  const generateQRCode = useCallback(async () => {
    setIsGeneratingQR(true)
    try {
      const data = await authService.setup2FA()

      if (!data?.secret) {
        throw new Error("Missing secret in setup response")
      }

      setSecretKey(data.secret)
      if (Array.isArray(data.backup_codes)) {
        setBackupCodes(data.backup_codes)
      }

      if (data.qr_code) {
        setQrCodeUrl(data.qr_code)
        return;
      }

      // Generate QR code locally when backend doesn't supply a ready image;
      const qrData = `otpauth://totp/WatchParty:${user?.email ?? ""}?secret=${data.secret}&issuer=WatchParty`
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {}
        width: 256,
        margin: 2,
        color: {}
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
      setQrCodeUrl(qrCodeDataUrl)
    } } catch {
      console.error("2FA setup error:", error)
      toast({}
        title: "Setup Error",
        description: "Failed to generate 2FA setup. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setIsGeneratingQR(false)
    }
  }, [authService, user, toast])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return;
    }

    // Check if 2FA is already enabled;
    if (user.twoFactorEnabled) {
      router.push("/dashboard/settings")
      return;
    }

    generateQRCode()
  }, [user, router, generateQRCode])

  const copySecretKey = async () => {
    try {
      await navigator.clipboard.writeText(secretKey)
      toast({}
        title: "Copied!",
        description: "Secret key copied to clipboard.",
      })
    } } catch {
      console.error("Copy failed:", error)
      toast({}
        title: "Copy Failed",
        description: "Please manually copy the secret key.",
        variant: "destructive",
      })
    }
  }

  const verifyAndEnable2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setErrors({ code: "Please enter a valid 6-digit code" })
      return;
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await authService.verify2FA(verificationCode, {}
        context: "setup",
      })

      if (!response?.success) {
        setErrors({ code: response?.message || "Invalid verification code" })
        return;
      }

      if (Array.isArray(response.backup_codes) && response.backup_codes.length > 0) {
        setBackupCodes(response.backup_codes)
      }

      setStep(3)
      toast({}
        title: "2FA Enabled!",
        description: "Two-factor authentication has been successfully enabled.",
      })
    } } catch {
      console.error("2FA verification error:", error)
      const message = error instanceof Error;
        ? error.message;
        : (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message;
          || (error as { message?: string })?.message;
          || "Verification failed. Please try again."
      setErrors({ code: message })
    } finally {}
      setIsLoading(false)
    }
  }

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join("\n")
    const blob = new Blob([`WatchParty 2FA Backup Codes\n\n${codesText}\n\nKeep these codes safe and secure!`], {}
      type: "text/plain",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url;
    a.download = "watchparty-2fa-backup-codes.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({}
      title: "Downloaded!",
      description: "Backup codes have been downloaded.",
    })
  }

  const copyBackupCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"))
      toast({}
        title: "Copied!",
        description: "Backup codes copied to clipboard.",
      })
    } } catch {
      console.error("Copy failed:", error)
      toast({}
        title: "Copy Failed",
        description: "Please manually copy the backup codes.",
        variant: "destructive",
      })
    }
  }

  const finishSetup = () => {
    router.push("/dashboard/settings?tab=security&success=2fa-enabled")
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">Enable Two-Factor Authentication</h1>
            <p className="text-gray-400">Add an extra layer of security to your account</p>

            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-2 mt-6">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div;
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${}
                      step >= stepNumber;
                        ? "bg-gradient-to-r from-green-500 to-blue-500 text-white"
                        : "bg-white/10 text-gray-400"
                    }`}
                  >
                    {step > stepNumber ? <CheckCircle className=&quot;w-4 h-4&quot; /> : stepNumber}
                  </div>
                  {stepNumber < 3 && (}
                    <div;
                      className={`w-8 h-0.5 mx-2 transition-all duration-300 ${}
                        step > stepNumber ? &quot;bg-gradient-to-r from-green-500 to-blue-500&quot; : &quot;bg-white/20"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Scan QR Code */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-4">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Step 1: Install Authenticator App;
                </Badge>
                <p className="text-gray-400 mb-6">
                  Install an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator on your;
                  phone.
                </p>
              </div>

              {isGeneratingQR ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                  <p className="text-gray-400">Generating QR code...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* QR Code */}
                  <div className="bg-white p-4 rounded-xl mx-auto w-fit">
                    {qrCodeUrl ? (
                      <Image src={qrCodeUrl || "/placeholder.svg"} alt="2FA QR Code" className="w-48 h-48" width={192} height={192} />
                    ) : (
                      <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Manual Entry */}
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-white text-sm">Manual Entry Key</Label>
                      <Button;
                        size="sm"
                        variant="ghost"
                        onClick={copySecretKey}
                        className="text-blue-400 hover:text-blue-300 p-1"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <code className="text-xs text-gray-300 break-all bg-black/20 p-2 rounded block">{secretKey}</code>
                    <p className="text-xs text-gray-500 mt-2">Use this key if you can&apos;t scan the QR code</p>
                  </div>

                  <div className="flex space-x-3">
                    <Button;
                      variant="outline"
                      onClick={generateQRCode}
                      className="flex-1 border-white/30 text-white hover:bg-white/10 bg-transparent"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate;
                    </Button>
                    <Button;
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                    >
                      Next Step;
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Verify Code */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 mb-4">
                  <Key className="w-4 h-4 mr-2" />
                  Step 2: Verify Setup;
                </Badge>
                <p className="text-gray-400 mb-6">
                  Enter the 6-digit code from your authenticator app to verify the setup.
                </p>
              </div>

              {errors.code && (
                <Alert className="bg-red-500/10 border-red-500/20 text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.code}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="verificationCode" className="text-white">
                    Verification Code;
                  </Label>
                  <Input;
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => {
  const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                      setVerificationCode(value)
                      if (errors.code) setErrors({})
                    }}
                    className="text-center text-2xl tracking-widest bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-purple-500/50"
                    placeholder="000000"
                    maxLength={6}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Enter the 6-digit code from your authenticator app;
                  </p>
                </div>

                <div className="flex space-x-3">
                  <Button;
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 border-white/30 text-white hover:bg-white/10 bg-transparent"
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back;
                  </Button>
                  <Button;
                    onClick={verifyAndEnable2FA}
                    disabled={isLoading || verificationCode.length !== 6}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verifying...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify & Enable;
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Backup Codes */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30 mb-4">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Step 3: Save Backup Codes;
                </Badge>
                <p className="text-gray-400 mb-6">
                  Save these backup codes in a secure location. You can use them to access your account if you lose your;
                  phone.
                </p>
              </div>

              <Alert className="bg-yellow-500/10 border-yellow-500/20 text-yellow-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> These codes will only be shown once. Make sure to save them securely.
                </AlertDescription>
              </Alert>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-white font-medium">Backup Codes</Label>
                  <div className="flex space-x-2">
                    <Button;
                      size="sm"
                      variant="ghost"
                      onClick={copyBackupCodes}
                      className="text-blue-400 hover:text-blue-300 p-1"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button;
                      size="sm"
                      variant="ghost"
                      onClick={downloadBackupCodes}
                      className="text-green-400 hover:text-green-300 p-1"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="text-sm text-gray-300 bg-black/20 p-2 rounded text-center font-mono">
                      {code}
                    </code>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="text-white font-medium mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Tips;
                </h4>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>• Store backup codes in a secure password manager</li>
                  <li>• Don&apos;t share these codes with anyone</li>
                  <li>• Each code can only be used once</li>
                  <li>• Generate new codes if these are compromised</li>
                </ul>
              </div>

              <Button;
                onClick={finishSetup}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete Setup;
              </Button>
            </div>
          )}

          {/* Cancel Link */}
          <div className="text-center mt-6">
            <Link;
              href="/dashboard/settings"
              className="text-gray-400 hover:text-gray-300 text-sm transition-colors inline-flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Cancel Setup;
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
