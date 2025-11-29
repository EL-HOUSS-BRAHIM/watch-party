import Link from "next/link"
import { Button } from "@/components/ui/button"

const timeline = [
  {
    year: "2020",
    title: "Weekend experiments",
    description: "WatchParty started as a living room hack to sync film club meetups across four apartments."
  },
  {
    year: "2021",
    title: "Festival debut",
    description: "Independent directors streamed premieres across time zones. The dual ambience engine was born."
  },
  {
    year: "2023",
    title: "Creator collectives",
    description: "Esports crews and fandom communities replaced screen shares with cinematic lobbies."
  }
]

const stats = [
  { label: "Watch nights hosted", value: "18,400+", color: "orange" },
  { label: "Average guest rating", value: "4.9 / 5", color: "cyan" },
  { label: "Countries represented", value: "62", color: "purple" }
]

export default function AboutPage() {
  return (
    <div className="section-padding">
      <div className="container-width px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <span className="inline-flex items-center rounded-full border border-brand-purple/20 bg-brand-purple/5 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-brand-purple mb-3 sm:mb-4">
            About WatchParty
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl md:text-4xl lg:text-5xl">
            A{" "}
            <span className="bg-gradient-to-r from-brand-magenta to-brand-cyan bg-clip-text text-transparent">
              cinematic operating system
            </span>{" "}
            for hosts
          </h1>
          <p className="mt-3 sm:mt-4 text-sm text-brand-navy/60 max-w-2xl mx-auto sm:text-base">
            WatchParty combines precision sync with beautiful ambience presets, so hosts can focus on creating shared experiences.
          </p>
          <div className="flex flex-col items-center gap-3 mt-5 sm:mt-6 sm:flex-row sm:justify-center">
            <Button size="lg" asChild className="w-full sm:w-auto min-h-[48px]">
              <Link href="/pricing">Explore plans</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild className="w-full sm:w-auto min-h-[48px]">
              <Link href="/guides/watch-night">Watch night guide</Link>
            </Button>
          </div>
        </div>

        {/* Principles & Stats Grid */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 mb-8 sm:mb-12">
          {/* Design Principles */}
          <div className="rounded-xl sm:rounded-2xl border border-brand-purple/10 bg-white/70 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-brand-navy mb-3 sm:mb-4 sm:text-xl">Design principles</h2>
            <p className="text-[13px] sm:text-sm text-brand-navy/60 mb-4 sm:mb-6">
              Our philosophy blends physical theatre cues with collaborative tooling.
            </p>
            <div className="space-y-3 sm:space-y-4">
              <div className="rounded-lg sm:rounded-xl border border-brand-cyan/15 bg-brand-cyan/3 p-3 sm:p-4">
                <p className="text-[13px] sm:text-sm font-semibold text-brand-navy mb-0.5 sm:mb-1">Ambience without distraction</p>
                <p className="text-[13px] sm:text-sm text-brand-navy/60">Cues complement the narrative—they never cover subtitles.</p>
              </div>
              <div className="rounded-lg sm:rounded-xl border border-brand-purple/15 bg-brand-purple/3 p-3 sm:p-4">
                <p className="text-[13px] sm:text-sm font-semibold text-brand-navy mb-0.5 sm:mb-1">Hosts stay in flow</p>
                <p className="text-[13px] sm:text-sm text-brand-navy/60">Automation keeps teams confident as audiences scale.</p>
              </div>
              <div className="rounded-lg sm:rounded-xl border border-brand-magenta/15 bg-brand-magenta/3 p-3 sm:p-4">
                <p className="text-[13px] sm:text-sm font-semibold text-brand-navy mb-0.5 sm:mb-1">Community-first rituals</p>
                <p className="text-[13px] sm:text-sm text-brand-navy/60">Lobbies and reactions transform screens into memories.</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-xl sm:rounded-2xl border border-brand-purple/10 bg-white/70 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-brand-navy mb-3 sm:mb-4 sm:text-xl">Core stats</h2>
            <p className="text-[13px] sm:text-sm text-brand-navy/60 mb-4 sm:mb-6">
              A snapshot of rooms, events, and guests who rely on WatchParty each month.
            </p>
            <div className="space-y-3 sm:space-y-4">
              {stats.map((stat) => (
                <div key={stat.label} className={`rounded-lg sm:rounded-xl border border-brand-${stat.color}/15 bg-brand-${stat.color}/5 p-3 sm:p-4`}>
                  <p className={`text-[10px] sm:text-xs font-medium uppercase tracking-wider text-brand-${stat.color === 'cyan' ? 'cyan-dark' : stat.color === 'orange' ? 'orange-dark' : stat.color}`}>{stat.label}</p>
                  <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-brand-navy">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-xl sm:rounded-2xl border border-brand-purple/10 bg-white/70 p-4 sm:p-6 md:p-10 backdrop-blur-sm">
          <div className="text-center mb-6 sm:mb-8">
            <span className="inline-flex items-center rounded-full border border-brand-blue/20 bg-brand-blue/5 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-brand-blue-dark mb-2 sm:mb-3">
              Our Journey
            </span>
            <h2 className="text-xl font-bold text-brand-navy sm:text-2xl">Timeline</h2>
          </div>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
            {timeline.map((item, index) => (
              <div
                key={item.year}
                className={`rounded-lg sm:rounded-xl p-4 sm:p-5 transition-all hover:-translate-y-0.5 ${
                  index === 0
                    ? "border border-brand-magenta/15 bg-brand-magenta/3"
                    : index === 1
                    ? "border border-brand-blue/15 bg-brand-blue/3"
                    : "border border-brand-cyan/15 bg-brand-cyan/3"
                }`}
              >
                <p className="text-[10px] sm:text-xs font-medium text-brand-navy/50 uppercase tracking-wider mb-1.5 sm:mb-2">{item.year}</p>
                <p className="text-sm font-bold text-brand-navy mb-0.5 sm:mb-1 sm:text-base">{item.title}</p>
                <p className="text-[13px] sm:text-sm text-brand-navy/60">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
