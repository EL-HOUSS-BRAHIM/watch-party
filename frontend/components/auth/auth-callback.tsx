"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { useToast } from "@/hooks/use-toast"
import { tokenStorage } from "@/lib/auth/token-storage"
import { Loader2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code")
        const state = searchParams.get("state")
        const error = searchParams.get("error")
        const provider = searchParams.get("provider")

        if (error) {
          throw new Error(`OAuth error: ${error}`)
        }

        if (!code) {
          throw new Error("No authorization code received")
        }

        if (!provider) {
          throw new Error("No provider specified")
        }

        // Send the code to our backend to complete OAuth flow
        const response = await fetch(`/api/auth/social/${provider}/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            state,
            redirect_uri: `${window.location.origin}/callback?provider=${provider}`,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || "Social authentication failed")
        }

        // Store tokens
        if (data.access_token || data.refresh_token) {
          tokenStorage.setTokens({
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
          })
        }

        toast({
          title: "Welcome!",
          description: `Successfully signed in with ${provider}`,
        })

        // Redirect to dashboard
        router.push("/dashboard")
      } catch (error) {
        console.error("Social auth callback error:", error)
        setError(error instanceof Error ? error.message : "Authentication failed")
        
        toast({
          title: "Authentication Failed",
          description: error instanceof Error ? error.message : "Something went wrong",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, router, toast])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <h3 className="font-semibold">Completing sign in...</h3>
                <p className="text-sm text-muted-foreground">
                  Please wait while we finish setting up your account
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Authentication Failed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <div className="flex space-x-2">
              <Button 
                onClick={() => router.push(&quot;/login")}
                className="flex-1"
              >
                Back to Login
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
