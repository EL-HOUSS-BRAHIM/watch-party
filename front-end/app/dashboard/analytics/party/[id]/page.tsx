import { PartyAnalytics } from "@/components/analytics/party-analytics"

interface PageProps {
  params: {
    id: string
  }
}

export default function PartyAnalyticsPage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Party Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Detailed insights about your watch party performance
          </p>
        </div>
        <PartyAnalytics partyId={params.id} />
      </div>
    </div>
  )
}
