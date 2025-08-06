import type { Metadata } from "next"
import PublicProfileClientPage from "./PublicProfileClientPage"

interface PublicProfilePageProps {
  params: {
    userId: string
  }
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  // In a real app, fetch user data for metadata
  return {
    title: "Public Profile - Watch Party",
    description: "View public profile on Watch Party",
  }
}

const PublicProfilePage = ({ params }: PublicProfilePageProps) => {
  return <PublicProfileClientPage params={params} />
}

export default PublicProfilePage
