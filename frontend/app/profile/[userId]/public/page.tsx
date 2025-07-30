import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicProfileView } from '@/components/profile/public-profile-view'

interface PublicProfilePageProps {
  params: {
    userId: string
  }
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
  // In a real app, fetch user data for metadata
  return {
    title: 'Public Profile - Watch Party',
    description: 'View public profile on Watch Party'
  }
}

export default function PublicProfilePage({ params }: PublicProfilePageProps) {
  return <PublicProfileView userId={params.userId} />
}
