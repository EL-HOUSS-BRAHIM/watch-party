'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  dashboardApi,
  partiesApi,
  type DashboardStatsResponse,
  type PartySummary,
} from "@/lib/api-client"

// Fallback mock data for when API is unavailable
const mockHighlights = [
  { label: "Upcoming watch nights", value: "3", description: "Brunch classics, esports finals, and midnight premiere" },
  { label: "Guests RSVP'd", value: "482", description: "Across six time zones" },
  { label: "Automation cues", value: "28", description: "Ready to trigger this week" },
]

const mockTimeline = [
  {
    time: "08:30",
    title: "Brunch classics",
    description: "Daybreak ambience, latte chat, co-host Amy",
  },
  {
    time: "19:00",
    title: "Esports finals",
    description: "Neon pulse, hype panel, reaction burst at finale",
  },
  {
    time: "23:45",
    title: "Midnight premiere",
    description: "Indigo glow, director Q&A, encore lounge",
  },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null)
  const [recentParties, setRecentParties] = useState<PartySummary[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Fetch dashboard stats and recent parties in parallel
        const [dashboardData, partiesData] = await Promise.allSettled([
          dashboardApi.getStats(),
          partiesApi.getRecent(),
        ])

        if (dashboardData.status === 'fulfilled') {
          setStats(dashboardData.value)
        }

        if (partiesData.status === 'fulfilled') {
          const value = partiesData.value
          const list = Array.isArray(value) ? value : value?.results ?? []
          setRecentParties(list)
        }

        setError(null)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        setError('Using demo data - API connection unavailable')
      }
    }

    loadDashboardData()
  }, [])

  // Map API data to highlights, fallback to mock data
  const highlights = stats ? [
    { 
      label: "Total parties", 
      value: String(stats.stats?.total_parties || 0), 
      description: `${stats.stats?.recent_parties || 0} in the last 30 days` 
    },
    { 
      label: "Total videos", 
      value: String(stats.stats?.total_videos || 0), 
      description: `${stats.stats?.recent_videos || 0} uploaded recently` 
    },
    { 
      label: "Watch time", 
      value: `${stats.stats?.watch_time_minutes || 0}m`, 
      description: "Total viewing time" 
    },
  ] : mockHighlights

  // Map API parties to timeline format, fallback to mock data
  const timeline = recentParties.length > 0
    ? recentParties.slice(0, 3).map((party) => ({
        time: party.scheduled_start
          ? new Date(party.scheduled_start).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })
          : "TBD",
        title: party.title || "Untitled Party",
        description: party.description || `${party.participant_count || 0} participants • ${party.status ?? "scheduled"}`,
      }))
    : mockTimeline

  return (
    <div className="space-y-10">
      {error && (
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          ⚠️ {error}
        </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Today&rsquo;s focus</p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">Welcome back, host</h1>
            <p className="text-sm text-white/70">
              Dual ambience automation is standing by. Review your scheduled watch nights and confirm the cues you want to spotlight.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            <div className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Ambience</p>
              <p className="mt-2 text-base font-semibold text-white">Auto cycle</p>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Sync drift</p>
              <p className="mt-2 text-base font-semibold text-white">±18 ms</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.label} className="border-white/10 bg-white/[0.02]">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">{item.label}</p>
              <CardTitle className="text-3xl text-white">{item.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-white/70">{item.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.4fr,1fr]">
        <Card className="border-white/10 bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Today&rsquo;s timeline</CardTitle>
            <CardDescription className="text-sm text-white/70">
              All scheduled watch nights with ambience presets and spotlight notes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline.map((event) => (
              <div key={event.time} className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                  {event.time}
                </div>
                <div className="space-y-1 text-sm text-white/80">
                  <p className="text-base font-semibold text-white">{event.title}</p>
                  <p>{event.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
    <Card className="border-white/10 bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Crew notes</CardTitle>
            <CardDescription className="text-sm text-white/70">
              Shared reminders before you go live.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/75">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Lighting</p>
              <p className="mt-2 text-white/80">Check bedroom lamp automation for sunrise screening.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Co-hosts</p>
              <p className="mt-2 text-white/80">Amy leads Q&A; Ravi handles spoiler-safe chat moderation.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Sponsors</p>
              <p className="mt-2 text-white/80">Upload new bumper loop before midnight premiere.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
