import { StoreItems } from "@/components/store/store-items"

export default function StoreItemsPage() {}
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Store</h1>
          <p className="text-muted-foreground mt-2">
            Customize your profile with exclusive items and themes;
          </p>
        </div>
        <StoreItems />
      </div>
    </div>
  )
}
