import type { Metadata } from "next"
import { PerformanceOptimizer } from "@/components/performance/performance-optimizer"

export const metadata: Metadata = { title: "Performance Optimizer - Admin Dashboard",
  description: "Monitor and optimize application performance with detailed metrics and suggestions",
}

export default function PerformanceOptimizerPage() {
  return (
    <div className="container mx-auto py-6">
      <PerformanceOptimizer />
    </div>
  )
}
