import Link from "next/link"
import { Film, HardDrive, PlayCircle, ShieldCheck, Sparkles, Users } from "lucide-react"

import { Button } from "@/components/ui/button"

const highlights = [
  {
    icon: Users,
    title: "Bring everyone together",
    description:
      "Send a room link or invite code so friends can drop in from anywhere, no extra extensions required.",
  },
  {
    icon: HardDrive,
    title: "Use the library you already love",
    description:
      "Paste a movie link or connect a third-party drive to stream your own collection inside the party.",
  },
  {
    icon: ShieldCheck,
    title: "Smooth on every device",
    description:
      "A lightweight interface optimized for low-powered laptops keeps the watch party running without lag.",
  },
]

const steps = [
  {
    title: "Create or join",
    description:
      "Log in to your dashboard to open a new party room or enter an invite code to hop straight into the action.",
    icon: Sparkles,
  },
  {
    title: "Add what to watch",
    description:
      "Drop in a direct link from the web or browse your connected drives and pick the movie or episode you want.",
    icon: Film,
  },
  {
    title: "Go live together",
    description:
      "Sync playback, share reactions, and keep the chat flowing—WatchParty handles the rest in real time.",
    icon: PlayCircle,
  },
]

export default function HomePage() {
  return (
    <div className="space-y-20 lg:space-y-24">
      <section className="rounded-[36px] border border-white/12 bg-[rgba(14,8,42,0.72)] px-6 py-12 shadow-[0_30px_120px_rgba(6,3,24,0.45)] backdrop-blur-2xl sm:px-10 md:flex md:items-center md:justify-between">
        <div className="max-w-2xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.45em] text-white/60">
            Watch together in seconds
          </p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
            The fastest way to host movies, episodes, and live games with friends
          </h1>
          <p className="text-sm text-white/70 sm:text-base">
            WatchParty keeps things lightweight so everyone can tune in—whether they are on a gaming rig or a travel laptop without a dedicated GPU.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard/rooms">Join a party</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/dashboard">Log in</Link>
            </Button>
          </div>
        </div>
        <div className="mt-10 w-full max-w-sm space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/75 shadow-[0_20px_80px_rgba(6,3,24,0.35)] md:mt-0 md:ml-10">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">Live snapshot</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Active parties</span>
              <span className="font-semibold text-white">312</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Friends invited today</span>
              <span className="font-semibold text-white">1,240</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shared libraries connected</span>
              <span className="font-semibold text-white">486</span>
            </div>
          </div>
          <p className="text-xs text-white/60">
            Stats update in real time once you sign in, giving hosts a quick overview of who&apos;s live and what&apos;s queued.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3" aria-label="WatchParty highlights">
        {highlights.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="space-y-3 rounded-[28px] border border-white/12 bg-[rgba(13,7,38,0.65)] p-6 text-white/75 shadow-[0_18px_60px_rgba(8,4,28,0.45)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
              <Icon className="h-6 w-6" aria-hidden />
            </div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="text-sm text-white/70">{description}</p>
          </div>
        ))}
      </section>

      <section
        id="how-it-works"
        className="rounded-[36px] border border-white/12 bg-[rgba(15,8,40,0.7)] p-8 text-white shadow-[0_26px_90px_rgba(6,3,24,0.45)]"
      >
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.45em] text-white/60">How it works</p>
          <h2 className="text-2xl font-semibold sm:text-3xl">Launch a party in three quick steps</h2>
          <p className="text-sm text-white/70">
            Everything you need is bundled inside the dashboard. Hosts can manage rooms, sync playback, and keep friends in the loop from one place.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map(({ title, description, icon: Icon }, index) => (
            <div key={title} className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between text-white/60">
                <span className="text-xs uppercase tracking-[0.35em]">Step {index + 1}</span>
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-sm text-white/70">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
