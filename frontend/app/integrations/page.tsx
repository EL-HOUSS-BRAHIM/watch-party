import { IntegrationsManager } from "@/components/integrations/integrations-manager"

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-2">
            Connect your favorite services to enhance your watch party experience
          </p>
        </div>
        <IntegrationsManager />
      </div>
    </div>
  )
}
