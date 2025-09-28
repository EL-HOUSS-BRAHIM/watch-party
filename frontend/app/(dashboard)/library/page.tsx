import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const media = [
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
  return (
    <div className="space-y-10">
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
