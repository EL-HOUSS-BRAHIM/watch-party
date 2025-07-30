import { UserFavorites } from "@/components/profile/user-favorites"

interface PageProps {
  params: {
    userId: string
  }
}

export default function UserFavoritesPage({ params }: PageProps) {
  return (
    <div className="container mx-auto py-8">
      <UserFavorites userId={params.userId} />
    </div>
  )
}
