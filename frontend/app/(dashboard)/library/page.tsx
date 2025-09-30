'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { videosApi } from "@/lib/api-client"

// Fallback mock data for when API is unavailable
const mockMedia = [
  {
    title: "Festival premiere: Aurora Skies",
    type: "Feature film",
    duration: "122 min",
    ambience: "Sunset gold",
  },
  {
    title: "Esports finals: Rift Legends",
    type: "Live event",
    duration: "2h 30m",
    ambience: "Neon pulse",
  },
  {
    title: "Indie shorts: Midnight Stories",
    type: "Anthology",
    duration: "68 min",
    ambience: "Indigo hush",
  },
]

export default function LibraryPage() {
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadVideos() {
      try {
        setLoading(true)
        const data = await videosApi.list()
        setVideos(data?.results || data || [])
        setError(null)
      } catch (err) {
        console.error('Failed to load videos:', err)
        setError('Using demo data - API connection unavailable')
      } finally {
        setLoading(false)
      }
    }

    loadVideos()
  }, [])

  // Map API data to media format, fallback to mock data
  const media = videos.length > 0
    ? videos.map(video => ({
        title: video.title || 'Untitled Video',
        type: video.source_type || 'Video',
        duration: video.duration_formatted || 'Unknown',
        ambience: video.visibility || 'private',
      }))
    : mockMedia

  return (
    <div className="space-y-10">
      {error && (
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          ⚠️ {error}
        </div>
      )}

      <section className="rounded-[36px] border border-white/12 bg-[rgba(16,9,46,0.75)] p-6 sm:p-10">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Library</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Curate your watch night catalogue</h1>
          <p className="text-sm text-white/70">
            Upload media, assign ambience presets, and save timelines so every repeat screening launches instantly.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {media.map((item) => (
          <Card key={item.title} className="border-white/12 bg-[rgba(15,9,44,0.75)]">
            <CardHeader>
              <CardTitle className="text-lg text-white">{item.title}</CardTitle>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">{item.type}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-white/80">
              <CardDescription className="text-sm text-white/70">Duration: {item.duration}</CardDescription>
              <div className="rounded-3xl border border-white/12 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
                Ambience: {item.ambience}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
