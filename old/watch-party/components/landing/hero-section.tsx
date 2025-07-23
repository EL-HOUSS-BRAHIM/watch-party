"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Play, Users, Video } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="container relative z-10 px-4 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-border hover:ring-primary transition-all">
              🎉 Now in Beta - Join the party!{" "}
              <Link href="/join" className="font-semibold text-primary">
                <span className="absolute inset-0" aria-hidden="true" />
                Get early access <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Watch Football <span className="text-gradient-primary">Together</span>
            <br />
            From Anywhere
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Stream games from Google Drive or S3, chat live with friends, and never miss a moment. The ultimate watch
            party platform for football fans.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" className="btn-primary glow-primary" asChild>
              <Link href="/join">
                <Play className="mr-2 h-5 w-5" />
                Start Watching
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/features">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-primary/10 p-3 ring-1 ring-primary/20">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">HD Streaming</h3>
              <p className="mt-2 text-sm text-muted-foreground text-center">Crystal clear video from any source</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-success/10 p-3 ring-1 ring-success/20">
                <Users className="h-6 w-6 text-success" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">Live Chat</h3>
              <p className="mt-2 text-sm text-muted-foreground text-center">Real-time reactions and discussions</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-premium/10 p-3 ring-1 ring-premium/20">
                <Play className="h-6 w-6 text-premium" />
              </div>
              <h3 className="mt-4 font-semibold text-foreground">Sync Playback</h3>
              <p className="mt-2 text-sm text-muted-foreground text-center">
                Everyone watches together, perfectly synced
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
