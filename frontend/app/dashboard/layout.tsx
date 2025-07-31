"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cinema-deep flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="w-8 h-8 animate-spin text-neon-red" />
            <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-neon-red/20" />
          </div>
          <div className="text-center">
            <div className="text-white font-medium">Loading Dashboard...</div>
            <div className="text-gray-400 text-sm">Preparing your cinema experience</div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-cinema-deep">
      {/* Main Content Area - Adjusted for Navigation */}
      <div className="lg:ml-64 pt-16">
        <main className="container-cinema page-padding">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
