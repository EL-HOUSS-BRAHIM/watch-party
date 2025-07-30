import { BillingPlans } from "@/components/billing/billing-plans"

export default function BillingPlansPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Choose Your Plan</h1>
          <p className="text-muted-foreground mt-2">
            Unlock premium features and enhance your watch party experience
          </p>
        </div>
        <BillingPlans />
      </div>
    </div>
  )
}
