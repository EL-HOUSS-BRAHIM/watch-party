import Link from "next/link"

const footerLinks = [
  {
    title: "Product",
    items: [
      { label: "Features", href: "/#features" },
      { label: "Dashboard", href: "/auth/login" },
      { label: "Mobile", href: "/#experience" }
    ]
  },
  {
    title: "Company",
    items: [
      { label: "About", href: "/#testimonials" },
      { label: "Community", href: "/join" },
      { label: "Support", href: "/support" }
    ]
  },
  {
    title: "Resources",
    items: [
      { label: "Pricing", href: "/pricing" },
      { label: "Status", href: "https://status.watchparty.tv" },
      { label: "Press kit", href: "https://watchparty.tv/press" }
    ]
  }
]

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-brand-navy/10 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-brand-navy/80 sm:px-8 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-brand-navy">WatchParty</p>
            <p className="mt-1 max-w-md text-sm text-brand-navy/70">
              A lightweight watch room for friends to stream movies, episodes, and live matches together.
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-brand-navy/50">
              <Link href="/auth/register" className="rounded-full border border-brand-magenta/30 px-4 py-2 text-brand-magenta-dark transition-all hover:border-brand-magenta/60 hover:text-brand-magenta">
                Start hosting
              </Link>
              <Link href="/join" className="rounded-full border border-brand-blue/30 px-4 py-2 text-brand-blue-dark transition-all hover:border-brand-blue/60 hover:text-brand-blue">
                Enter a party
              </Link>
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {footerLinks.map((section) => (
              <div key={section.title} className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-navy/60">{section.title}</p>
                <ul className="space-y-3 text-sm text-brand-navy/70">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <Link href={item.href} className="transition-colors hover:text-brand-navy">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.35em] text-brand-navy/60">
            <Link href="/dashboard/rooms" className="rounded-full border border-brand-navy/20 px-3 py-1 transition-colors duration-200 hover:border-brand-purple/40 hover:text-brand-purple">
              Join
            </Link>
            <Link href="/dashboard" className="rounded-full border border-brand-navy/20 px-3 py-1 transition-colors duration-200 hover:border-brand-purple/40 hover:text-brand-purple">
              Log in
            </Link>
          </div>
        </div>
        <div className="text-xs text-brand-navy/50">© {year} WatchParty. Built for crews that never miss a scene.</div>
      </div>
    </footer>
  )
}
