import type { ReactNode } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"

type LayoutProps = {
  children: ReactNode
}

/**
 * Dashboard Layout - Protected routes that require authentication
 * Automatically redirects to /auth/login if user is not logged in
 */
export default function DashboardRouteGroupLayout({ children }: LayoutProps) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedRoute>
  )
}
