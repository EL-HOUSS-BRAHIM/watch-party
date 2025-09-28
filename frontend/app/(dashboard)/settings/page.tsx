import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const preferences = [
  {
    title: "Ambience defaults",
    description: "Start new rooms with daybreak ambience and auto-cycle to midnight during finale.",
  },
  {
    title: "Crew permissions",
    description: "Allow co-hosts to trigger reaction bursts and polls while keeping playback controls locked to hosts.",
  },
  {
    title: "Notifications",
    description: "Send guests SMS reminders 15 minutes before the room opens and highlight ambience theme in the message.",
  },
]

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-[36px] border border-white/12 bg-[rgba(16,9,46,0.75)] p-6 sm:p-10">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Settings</p>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">Fine-tune your host preferences</h1>
          <p className="text-sm text-white/70">
            Customize ambience defaults, crew permissions, and communication so every watch night stays on brand.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {preferences.map((preference) => (
          <Card key={preference.title} className="border-white/12 bg-[rgba(15,9,44,0.75)]">
            <CardHeader>
              <CardTitle className="text-lg text-white">{preference.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-white/70">{preference.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-[36px] border border-white/12 bg-[rgba(15,9,44,0.75)] p-6 sm:p-10">
        <Card className="border-white/12 bg-[rgba(18,10,52,0.8)]">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Integrations</CardTitle>
            <CardDescription className="text-sm text-white/70">
              Connect automation tools and streaming sources.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/75">
            <div className="rounded-3xl border border-white/12 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Lighting</p>
              <p className="mt-2 text-white/80">Philips Hue · LIFX</p>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Streaming</p>
              <p className="mt-2 text-white/80">YouTube Live · Vimeo · RTMP</p>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Community</p>
              <p className="mt-2 text-white/80">Discord · Slack · Custom webhooks</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
