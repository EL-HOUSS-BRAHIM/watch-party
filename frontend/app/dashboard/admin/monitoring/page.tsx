import  from "lucide-react"
import type { Metadata } from "next"
import { MonitoringDashboard } from "@/components/monitoring/monitoring-dashboard"

export const metadata: Metadata = { title: "System Monitoring - Admin Dashboard",
  description: "Real-time system monitoring, logging, and alerting dashboard",
}

export default function MonitoringDashboardPage() {}
  return (
    <div className="container mx-auto py-6">
      <MonitoringDashboard />
    </div>
  )
}
