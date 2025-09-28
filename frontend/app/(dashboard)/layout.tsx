import type { ReactNode } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"

type LayoutProps = {
  children: ReactNode
}

export default function DashboardRouteGroupLayout({ children }: LayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>
}
