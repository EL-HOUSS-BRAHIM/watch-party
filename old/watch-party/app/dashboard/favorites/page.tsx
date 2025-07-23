import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Bookmark, PlayCircle } from 'lucide-react'

export default function FavoritesPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neo-background">
        <DashboardHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neo-text-primary mb-2">
              Favorites & Saved
            </h1>
            <p className="text-neo-text-secondary">
              Your saved videos, parties, and bookmarked content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Saved Videos */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neo-text-primary">
                  <PlayCircle className="h-5 w-5 text-primary" />
                  Saved Videos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neo-text-secondary mb-4">
                  Videos you've bookmarked for later
                </p>
                <Button variant="outline" className="w-full">
                  View All Videos
                </Button>
              </CardContent>
            </Card>

            {/* Favorite Parties */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neo-text-primary">
                  <Heart className="h-5 w-5 text-error" />
                  Favorite Parties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neo-text-secondary mb-4">
                  Watch parties you've liked
                </p>
                <Button variant="outline" className="w-full">
                  View All Parties
                </Button>
              </CardContent>
            </Card>

            {/* Bookmarks */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neo-text-primary">
                  <Bookmark className="h-5 w-5 text-warning" />
                  Bookmarks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neo-text-secondary mb-4">
                  Quick access to your saved content
                </p>
                <Button variant="outline" className="w-full">
                  View All Bookmarks
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
