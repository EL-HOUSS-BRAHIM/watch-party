import type { Metadata } from "next"
import { SEOAccessibilityOptimizer } from "@/components/seo/seo-accessibility-optimizer"

export const metadata: Metadata = { title: "SEO & Accessibility Optimizer - Admin Dashboard",
  description: "Optimize your site for search engines and accessibility compliance",
}

export default function SEOAccessibilityPage() {}
  return (
    <div className="container mx-auto py-6">
      <SEOAccessibilityOptimizer />
    </div>
  )
}
