import type React from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminGuard } from "@/components/auth/admin-guard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <div className="lg:pl-72">
          <AdminHeader />
          <main className="py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}
