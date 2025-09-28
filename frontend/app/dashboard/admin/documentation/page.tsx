import type { Metadata } from "next"
import { DocumentationManager } from "@/components/documentation/documentation-manager"

export const metadata: Metadata = { title: "Documentation Manager - Admin Dashboard",
  description: "Create, manage, and organize your documentation with version control",
}

export default function DocumentationManagerPage() {
  return (
    <div className="container mx-auto py-6">
      <DocumentationManager />
    </div>
  )
}
