'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { userApi, type UserProfile } from "@/lib/api-client"
import { LoadingState, ErrorMessage } from "@/components/ui/feedback"

// Placeholder preferences for UI (not from API - coming soon feature)
const placeholderPreferences = [
  {
    title: "Ambience defaults",
    description: "Start new rooms with daybreak ambience and auto-cycle to midnight during finale.",
    comingSoon: true
  },
  {
    title: "Crew permissions",
    description: "Allow co-hosts to trigger reaction bursts and polls while keeping playback controls locked to hosts.",
    comingSoon: true
  },
  {
    title: "Notifications",
    description: "Send guests SMS reminders 15 minutes before the room opens and highlight ambience theme in the message.",
    comingSoon: true
  },
]

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        setError(null)
        const data = await userApi.getProfile()
        setProfile(data)
      } catch (err) {
        console.error('Failed to load profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile from API')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  if (loading) {
    return <LoadingState message="Loading your settings..." />
  }

  // Use profile data if available
  const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'Guest'
  const userEmail = profile?.email || 'guest@example.com'
  const isPremium = profile?.is_premium || false

  return (
    <div className="space-y-10">
      {error && (
        <ErrorMessage 
          message={error} 
          type="error"
          onDismiss={() => setError(null)}
        />
      )}

  <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-10">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Settings</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Fine-tune your host preferences</h1>
          <p className="text-sm text-white/70">
            Customize ambience defaults, crew permissions, and communication so every watch night stays on brand.
          </p>
          {profile && (
            <div className="mt-4 flex items-center gap-4">
              <div className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm text-white">
                {userName}
              </div>
              <div className="text-sm text-white/60">{userEmail}</div>
              {isPremium && (
                <div className="rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-xs font-semibold text-brand-orange-light">
                  ⭐ Premium
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {placeholderPreferences.map((preference) => (
          <Card key={preference.title} className="border-white/10 bg-white/[0.02] relative">
            {preference.comingSoon && (
              <div className="absolute top-4 right-4 bg-brand-blue/20 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                Coming Soon
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-lg text-white">{preference.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-white/70">{preference.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-10">
        <Card className="border-white/10 bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Integrations</CardTitle>
            <CardDescription className="text-sm text-white/70">
              Connect automation tools and streaming sources.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/75">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Lighting</p>
              <p className="mt-2 text-white/80">Philips Hue · LIFX</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Streaming</p>
              <p className="mt-2 text-white/80">YouTube Live · Vimeo · RTMP</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Community</p>
              <p className="mt-2 text-white/80">Discord · Slack · Custom webhooks</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
