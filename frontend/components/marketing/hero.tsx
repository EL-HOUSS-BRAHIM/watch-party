import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="space-y-10">
      <div className="space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 px-4 py-1 text-xs uppercase tracking-[0.3em] text-zinc-400">
          Premium black & white interface
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          Host unforgettable watch parties without leaving your sofa
        </h1>
        <p className="max-w-2xl text-lg text-zinc-400">
          WatchParty pairs studio-grade synchronisation with a deliberately minimal colour palette so your stories take centre
          stage. Plan events, guide the conversation, and celebrate together in perfect harmony.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button size="lg">Create a party</Button>
        <Button variant="ghost" size="lg">
          Explore the interface
        </Button>
      </div>
      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6">
          <dt className="text-sm text-zinc-400">Stream in sync</dt>
          <dd className="mt-2 text-3xl font-semibold">±50ms drift</dd>
        </div>
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6">
          <dt className="text-sm text-zinc-400">Curated playlists</dt>
          <dd className="mt-2 text-3xl font-semibold">+1k templates</dd>
        </div>
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6">
          <dt className="text-sm text-zinc-400">Collaborative chat</dt>
          <dd className="mt-2 text-3xl font-semibold">Realtime emoji & polls</dd>
        </div>
      </dl>
    </section>
  )
}
