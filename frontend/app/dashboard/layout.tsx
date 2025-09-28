import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect , useCallback } from "react"
import { Loader2 } from "lucide-react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"

"use client"

export default function DashboardLayout({children,
}: {}
  children: React.ReactNode;
}) {}
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-white/20" />
          </div>
          <div className="text-center">
            <div className="text-white font-medium">Loading Dashboard...</div>
            <div className="text-white/60 text-sm">Preparing your cinema experience</div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-black flex">
        <DashboardSidebar />
        {/* Main Content Area */}
        <div className="flex-1">
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
