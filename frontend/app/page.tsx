import Link from "next/link"

import { Button } from "@/components/ui/button"

const featureCards = [
  {
    title: "Host a private room",
    description: "Spin up a watch party from your dashboard and share one link with the crew.",
  },
  {
    title: "Add a movie link",
    description: "Drop in a URL from any streaming site and let WatchParty keep everyone in sync.",
  },
  {
    title: "Connect your drive",
    description: "Hook up your third-party drive once and browse your library without leaving the room.",
  },
]

const quickSteps = [
  {
    label: "Step 1",
    title: "Log in to your dashboard",
    body: "Create a new party or re-open an existing room in a couple of clicks.",
  },
  {
    label: "Step 2",
    title: "Choose what to watch",
    body: "Paste a direct link or pick a file from your connected drives—no uploads required.",
  },
  {
    label: "Step 3",
    title: "Share and enjoy",
    body: "Send the join link or invite code so everyone can stream, chat, and react together.",
  },
]

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-20">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-white shadow-sm sm:p-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/60">
            Watch together without setup
          </div>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Watch nights that work on every laptop, even without a graphics card
          </h1>
          <p className="max-w-2xl text-base text-white/70 sm:text-lg">
            WatchParty keeps the interface light so the video stream stays smooth. Join an existing room or log in to host your own party in seconds.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="sm:w-auto">
              <Link href="/dashboard/rooms">Join a party</Link>
            </Button>
            <Button asChild size="lg" variant="secondary" className="sm:w-auto">
              <Link href="/dashboard">Log in to host</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="What you can do">
        {featureCards.map(({ title, description }) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-white/75">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm text-white/70">{description}</p>
          </div>
        ))}
      </section>

      <section id="how-it-works" className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-white sm:p-10">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">How it works</p>
          <h2 className="text-2xl font-semibold sm:text-3xl">Three quick steps to go live</h2>
          <p className="max-w-2xl text-sm text-white/70">
            Everything happens from the dashboard: create rooms, invite friends, sync playback, and manage your connected drives.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {quickSteps.map(({ label, title, body }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/75">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">{label}</p>
              <h3 className="mt-2 text-base font-semibold text-white">{title}</h3>
              <p className="mt-2 text-white/70">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
