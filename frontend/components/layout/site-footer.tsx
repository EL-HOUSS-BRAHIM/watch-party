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
      { label: "Support", href: "/support" },
      { label: "GitHub", href: "https://github.com/EL-HOUSS-BRAHIM/watch-party" }
    ]
  }
]

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-brand-navy/10 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 text-sm text-brand-navy/80 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Top Section */}
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
          {/* Brand Section */}
          <div className="max-w-md">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden sm:h-12 sm:w-12">
                <Image 
                  src="/watchparty-logo.webp" 
                  alt="WatchParty logo" 
                  width={48} 
                  height={48} 
                  className="h-full w-full object-contain" 
                />
              </span>
              <p className="text-base font-bold text-brand-navy sm:text-lg">WatchParty</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-brand-navy/70">
              A lightweight watch room for friends to stream movies, episodes, and live matches together.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
              <Link href="/auth/register" className="rounded-full border border-brand-magenta/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-magenta-dark transition-all hover:border-brand-magenta/60 hover:bg-brand-magenta/5 hover:text-brand-magenta sm:px-4 sm:py-2 sm:text-xs">
                Start hosting
              </Link>
              <Link href="/join" className="rounded-full border border-brand-blue/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-blue-dark transition-all hover:border-brand-blue/60 hover:bg-brand-blue/5 hover:text-brand-blue sm:px-4 sm:py-2 sm:text-xs">
                Enter a party
              </Link>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:gap-12">
            {footerLinks.map((section) => (
              <div key={section.title} className="space-y-3 sm:space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-navy/60 sm:text-xs">{section.title}</p>
                <ul className="space-y-2 text-sm text-brand-navy/70 sm:space-y-3">
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

        {/* Quick Actions - Mobile Only */}
        <div className="flex flex-wrap gap-2 border-t border-brand-navy/10 pt-6 lg:hidden">
          <Link href="/dashboard/rooms" className="rounded-full border border-brand-navy/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-navy/60 transition-colors duration-200 hover:border-brand-purple/40 hover:bg-brand-purple/5 hover:text-brand-purple">
            Join
          </Link>
          <Link href="/dashboard" className="rounded-full border border-brand-navy/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-navy/60 transition-colors duration-200 hover:border-brand-purple/40 hover:bg-brand-purple/5 hover:text-brand-purple">
            Log in
          </Link>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-4 border-t border-brand-navy/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-brand-navy/50 sm:text-sm">
            © {year} WatchParty. Built for crews that never miss a scene.
          </span>
          <a 
            href="https://github.com/EL-HOUSS-BRAHIM" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex w-fit items-center gap-2 rounded-lg border border-brand-navy/20 px-3 py-2 text-xs transition-all hover:border-brand-purple/40 hover:bg-brand-purple/5 hover:text-brand-purple hover:shadow-sm"
          >
            <svg className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">BRAHIM EL HOUSS</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
