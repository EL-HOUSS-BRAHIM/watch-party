import { UserInventory } from "@/components/profile/user-inventory"

interface PageProps {
  params: {
    userId: string
  }
}

export default function UserInventoryPage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-8">
      <UserInventory userId={params.userId} />
    </div>
  )
}
