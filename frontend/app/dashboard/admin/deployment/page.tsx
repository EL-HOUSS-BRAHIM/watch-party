import type { Metadata } from "next"
import { DeploymentPipeline } from "@/components/deployment/deployment-pipeline"

export const metadata: Metadata = { title: "Deployment Pipeline - Admin Dashboard",
  description: "Manage deployments and monitor environments with automated CI/CD pipeline",
}

export default function DeploymentPipelinePage() {}
  return (
    <div className="container mx-auto py-6">
      <DeploymentPipeline />
    </div>
  )
}
