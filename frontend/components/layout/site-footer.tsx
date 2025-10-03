import Image from "next/image"
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
    <footer className="mt-auto border-t border-brand-navy/10 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[min(100%,1440px)] px-6 py-12 text-sm text-brand-navy/80 sm:px-8 xl:px-12">
        <div className="grid gap-12 lg:grid-cols-[1.2fr,1fr]">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_12px_32px_rgba(28,28,46,0.12)]">
                <Image
                  src="/watchparty-logo.svg"
                  alt="WatchParty"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain"
                />
              </span>
              <div>
                <p className="text-base font-semibold text-brand-navy">WatchParty</p>
                <p className="text-xs uppercase tracking-[0.35em] text-brand-navy/50">Cinematic connection platform</p>
              </div>
            </div>
            <p className="max-w-xl text-base text-brand-navy/70">
              Build rituals before, during, and after the feature. WatchParty blends sync, ambience, and conversation so your crew feels together—no matter the distance.
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
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-brand-navy/10 pt-8 text-xs text-brand-navy/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} WatchParty. Crafted for crews that live for shared stories.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/terms" className="transition-colors hover:text-brand-navy">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-brand-navy">
              Privacy
            </Link>
            <Link href="mailto:hello@watchparty.tv" className="transition-colors hover:text-brand-navy">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
