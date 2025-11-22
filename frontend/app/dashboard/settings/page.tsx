'use client'

import { useEffect, useState } from "react"
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

      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-purple/20 via-brand-magenta/20 to-brand-orange/20 rounded-3xl blur-3xl opacity-60"></div>
        <div className="glass-panel relative rounded-3xl p-8 sm:p-10 border-brand-purple/20">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-brand-navy/60 font-bold">Settings</p>
            <h1 className="text-3xl font-bold text-brand-navy sm:text-4xl">
              <span className="gradient-text">Fine-tune your host preferences</span>
            </h1>
            <p className="text-lg text-brand-navy/70 max-w-2xl">
              Customize ambience defaults, crew permissions, and communication so every watch night stays on brand.
            </p>
            {profile && (
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <div className="rounded-full border border-brand-navy/10 bg-white/50 px-4 py-2 text-sm font-bold text-brand-navy shadow-sm">
                  {userName}
                </div>
                <div className="text-sm text-brand-navy/60 font-medium">{userEmail}</div>
                {isPremium && (
                  <div className="rounded-full border border-brand-orange/30 bg-brand-orange/10 px-3 py-1 text-xs font-bold text-brand-orange-dark shadow-sm">
                    ⭐ Premium
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {placeholderPreferences.map((preference) => (
          <div key={preference.title} className="glass-card rounded-3xl p-6 relative hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-navy/5">
            {preference.comingSoon && (
              <div className="absolute top-4 right-4 bg-brand-blue/10 text-brand-blue-dark px-2 py-1 rounded-lg text-xs font-bold border border-brand-blue/20">
                Coming Soon
              </div>
            )}
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-brand-navy">{preference.title}</h3>
              <p className="text-sm text-brand-navy/60 font-medium leading-relaxed">{preference.description}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="glass-card rounded-3xl p-8 sm:p-10">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-brand-navy mb-2">Integrations</h2>
            <p className="text-brand-navy/60 font-medium">
              Connect automation tools and streaming sources.
            </p>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-brand-navy/10 bg-white/50 p-5 hover:bg-white hover:shadow-md transition-all duration-300">
              <p className="text-xs uppercase tracking-[0.35em] text-brand-navy/40 font-bold mb-3">Lighting</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💡</span>
                <p className="text-brand-navy font-bold">Philips Hue · LIFX</p>
              </div>
            </div>
            <div className="rounded-2xl border border-brand-navy/10 bg-white/50 p-5 hover:bg-white hover:shadow-md transition-all duration-300">
              <p className="text-xs uppercase tracking-[0.35em] text-brand-navy/40 font-bold mb-3">Streaming</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📹</span>
                <p className="text-brand-navy font-bold">YouTube · Vimeo</p>
              </div>
            </div>
            <div className="rounded-2xl border border-brand-navy/10 bg-white/50 p-5 hover:bg-white hover:shadow-md transition-all duration-300">
              <p className="text-xs uppercase tracking-[0.35em] text-brand-navy/40 font-bold mb-3">Community</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">💬</span>
                <p className="text-brand-navy font-bold">Discord · Slack</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
