import Link from "next/link"
import Image from "next/image"

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
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden">
                <Image 
                  src="/watchparty-logo.png" 
                  alt="WatchParty logo" 
                  width={48} 
                  height={48} 
                  className="h-full w-full object-contain" 
                />
              </span>
              <p className="text-base font-semibold text-brand-navy">WatchParty</p>
            </div>
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
        <div className="flex items-center justify-between gap-4 text-xs text-brand-navy/50">
          <span>© {year} WatchParty. Built for crews that never miss a scene.</span>
          <a 
            href="https://github.com/EL-HOUSS-BRAHIM" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-brand-navy/20 px-3 py-2 transition-all hover:border-brand-purple/40 hover:text-brand-purple hover:shadow-sm"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">BRAHIM EL HOUSS</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
