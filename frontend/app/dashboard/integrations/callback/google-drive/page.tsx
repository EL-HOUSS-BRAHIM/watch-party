"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import api from "@/lib/api-client"
import { LoadingState, ErrorMessage } from "@/components/ui/feedback"

export default function GoogleDriveCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Connecting to Google Drive...")

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")
      const state = searchParams.get("state")
      const errorParam = searchParams.get("error")

      // Handle OAuth errors from Google
      if (errorParam) {
        const errorDescription = searchParams.get("error_description") || "Authorization was denied"
        setError(`Google authorization failed: ${errorDescription}`)
        setStatus("error")
        return
      }

      if (!code) {
        setError("No authorization code received from Google")
        setStatus("error")
        return
      }

      try {
        setMessage("Completing Google Drive connection...")
        
        // Send the authorization code to the backend to complete the OAuth flow
        // The backend will exchange the code for tokens and store them
        const response = await api.get<{
          success?: boolean
          data?: {
            connected?: boolean
            folder_id?: string
            token_expires_at?: string
          }
          message?: string
        }>(`/api/integrations/google-drive/oauth-callback/?code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ""}`)

        if (response.success || response.data?.connected) {
          setStatus("success")
          setMessage("Google Drive connected successfully!")
          
          // Redirect to videos page after a short delay to show success message
          setTimeout(() => {
            router.push("/dashboard/videos?gdrive_connected=true")
          }, 1500)
        } else {
          throw new Error(response.message || "Failed to complete Google Drive connection")
        }
      } catch (err) {
        console.error("Google Drive callback error:", err)
        setError(
          err instanceof Error 
            ? err.message 
            : "Failed to connect Google Drive. Please try again."
        )
        setStatus("error")
      }
    }

    handleCallback()
  }, [searchParams, router])

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-brand-navy mb-4">Connection Failed</h1>
          <ErrorMessage 
            message={error || "An unknown error occurred"} 
            type="error"
          />
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard/integrations")}
              className="px-6 py-2.5 bg-white border border-brand-navy/10 hover:bg-brand-navy/5 text-brand-navy rounded-xl font-bold transition-colors"
            >
              Back to Integrations
            </button>
            <button
              onClick={() => router.push("/dashboard/videos")}
              className="px-6 py-2.5 btn-gradient text-white rounded-xl font-bold transition-all shadow-md hover:shadow-brand-purple/20"
            >
              Go to Videos
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4 animate-bounce">✅</div>
          <h1 className="text-2xl font-bold text-brand-navy mb-2">Success!</h1>
          <p className="text-brand-navy/70 mb-4">{message}</p>
          <p className="text-sm text-brand-navy/50">Redirecting to your videos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">
          <span className="inline-block animate-spin">⚙️</span>
        </div>
        <h1 className="text-2xl font-bold text-brand-navy mb-2">Connecting Google Drive</h1>
        <p className="text-brand-navy/70 mb-4">{message}</p>
        <LoadingState message="" />
      </div>
    </div>
  )
}
