import { StoreRewards } from "@/components/store/store-rewards"

export default function StoreRewardsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Rewards</h1>
          <p className="text-muted-foreground mt-2">
            Claim exclusive rewards based on your achievements;
          </p>
        </div>
        <StoreRewards />
      </div>
    </div>
  )
}
