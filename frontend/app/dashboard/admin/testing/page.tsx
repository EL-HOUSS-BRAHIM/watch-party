import type { Metadata } from "next"
import { TestingSuiteDashboard } from "@/components/testing/testing-suite-dashboard"

export const metadata: Metadata = { title: "Testing Suite - Admin Dashboard",
  description: "Comprehensive testing dashboard with coverage metrics and test management",
}

export default function TestingSuitePage() {}
  return (
    <div className="container mx-auto py-6">
      <TestingSuiteDashboard />
    </div>
  )
}
