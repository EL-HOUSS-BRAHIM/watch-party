import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const rooms = [
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
  return (
    <div className="space-y-10">
      <section className="rounded-[36px] border border-white/12 bg-[rgba(16,9,46,0.75)] p-6 sm:p-10">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Rooms</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Manage your watch lounges</h1>
          <p className="text-sm text-white/70">
            Preview ambience, adjust automation cues, and confirm who&apos;s on the co-host roster before doors open.
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
