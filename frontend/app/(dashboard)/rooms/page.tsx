'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { partiesApi } from "@/lib/api-client"

// Fallback mock data for when API is unavailable
const mockRooms = [
  {
    name: "Sunrise salon",
    theme: "Daybreak",
    status: "Live in 2h",
    details: "Playlist: brunch classics · 46 RSVPs",
  },
  {
    name: "Esports arena",
    theme: "Neon pulse",
    status: "Live now",
    details: "Playlist: championship finals · 220 live viewers",
  },
  {
    name: "Midnight cinema",
    theme: "Indigo hush",
    status: "Live in 6h",
    details: "Playlist: director premiere · 216 RSVPs",
  },
]

export default function RoomsPage() {
  const [parties, setParties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadParties() {
      try {
        setLoading(true)
        const data = await partiesApi.list()
        setParties(data?.results || data || [])
        setError(null)
      } catch (err) {
        console.error('Failed to load parties:', err)
        setError('Using demo data - API connection unavailable')
      } finally {
        setLoading(false)
      }
    }

    loadParties()
  }, [])

  // Map API data to rooms format, fallback to mock data
  const rooms = parties.length > 0
    ? parties.map(party => ({
        name: party.title || 'Untitled Party',
        theme: party.visibility || 'Private',
        status: party.status || 'scheduled',
        details: `${party.participant_count || 0} participants · ${party.video?.title || 'No video'}`,
      }))
    : mockRooms

  return (
    <div className="space-y-10">
      {error && (
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          ⚠️ {error}
        </div>
      )}

      <section className="rounded-[36px] border border-white/12 bg-[rgba(16,9,46,0.75)] p-6 sm:p-10">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Rooms</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Manage your watch lounges</h1>
          <p className="text-sm text-white/70">
            Preview ambience, adjust automation cues, and confirm who's on the co-host roster before doors open.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {rooms.map((room) => (
          <Card key={room.name} className="border-white/12 bg-[rgba(15,9,44,0.75)]">
            <CardHeader>
              <CardTitle className="text-xl text-white">{room.name}</CardTitle>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">{room.theme}</p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/75">
              <CardDescription className="text-sm text-white/70">{room.details}</CardDescription>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
                {room.status}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
