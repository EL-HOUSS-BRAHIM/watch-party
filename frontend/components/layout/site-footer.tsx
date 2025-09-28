import Link from "next/link"

const footerLinks = [
  {
    heading: "Platform",
    links: [
      { href: "/about", label: "Story" },
      { href: "/pricing", label: "Plans" },
      { href: "#features", label: "Toolkit" },
    ],
  },
  {
    heading: "Guides",
    links: [
      { href: "/guides/watch-night", label: "Watch night" },
      { href: "#metrics", label: "Impact" },
      { href: "#testimonials", label: "Community" },
    ],
  },
  {
    heading: "Product",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/rooms", label: "Rooms" },
      { href: "/library", label: "Library" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[rgba(5,3,20,0.92)]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,var(--color-sunrise-amber),transparent_65%)] opacity-40 blur-[110px]" />
        <div className="pointer-events-none absolute -right-16 bottom-[-20%] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(96,70,210,0.65),transparent_65%)] opacity-60 blur-[130px]" />
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 py-16 text-sm text-white/70 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:px-12">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1 text-[11px] uppercase tracking-[0.45em] text-white/65">
              Watch nights
            </div>
            <div className="space-y-4">
              <p className="text-3xl font-semibold text-white">WatchParty</p>
              <p className="max-w-xl leading-relaxed text-white/75">
                Calibrate daybreak warmth and midnight glow in seconds. WatchParty is the cinematic operating system for hosts who orchestrate rituals, sync playback, and keep every guest in the same moment.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.4em] text-white/55">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Sunrise cues</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Dusk ambience</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">Midnight sync</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-xs uppercase tracking-[0.4em] text-white/65 sm:flex-nowrap">
              <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/70">
                <span className="h-2 w-2 rounded-full bg-[var(--color-accent-500)] shadow-[0_0_12px_rgba(255,196,150,0.6)]" aria-hidden />
                Status
              </span>
              <span className="flex-1 text-white/70">Scenes ready for tomorrow&apos;s premiere.</span>
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {footerLinks.map((section) => (
              <div key={section.heading} className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.42em] text-white/60">
                  {section.heading}
                </p>
                <ul className="space-y-3 text-sm text-white/70">
                  {section.links.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="transition-colors duration-200 hover:text-white">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-6 text-center text-xs text-white/50 sm:px-8 lg:px-12">
        © {new Date().getFullYear()} WatchParty Labs. Built for crews that never miss a scene.
      </div>
    </footer>
  )
}
