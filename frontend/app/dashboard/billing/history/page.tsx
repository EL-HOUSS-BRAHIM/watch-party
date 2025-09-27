import { BillingHistory } from "@/components/billing/billing-history"

export default function BillingHistoryPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Billing History</h1>
          <p className="text-muted-foreground mt-2">
            View and download your past invoices and payments
          </p>
        </div>
        <BillingHistory />
      </div>
    </div>
  )
}
