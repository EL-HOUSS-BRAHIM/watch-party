import Link from "next/link"

const footerLinks = [
  { href: "#features", label: "Platform" },
  { href: "#metrics", label: "Reliability" },
  { href: "#testimonials", label: "Customers" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-zinc-500 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-semibold text-zinc-200">WatchParty</p>
          <p className="mt-2 max-w-md leading-relaxed">
            Crafted for teams that want a premium shared viewing experience without the noise. Built with a monochrome palette
            that lets your stories shine.
          </p>
        </div>
        <nav className="flex gap-6">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-zinc-200">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-zinc-900/80 py-4 text-center text-xs text-zinc-600">
        © {new Date().getFullYear()} WatchParty Labs. All rights reserved.
      </div>
    </footer>
  )
}
