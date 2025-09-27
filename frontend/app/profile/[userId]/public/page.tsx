import type { Metadata } from "next"
import PublicProfileClientPage from "./PublicProfileClientPage"

interface PublicProfilePageProps {
  params: Promise<{
    userId: string
  }>
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  // In a real app, fetch user data for metadata
  return {
    title: "Public Profile - Watch Party",
    description: "View public profile on Watch Party",
  }
}

const PublicProfilePage = async ({ params }: PublicProfilePageProps) => {
  const { userId } = await params
  return <PublicProfileClientPage params={{ userId }} />
}

export default PublicProfilePage
