"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const _navigation = [
  { href: "/#features", label: "Features" },
  { href: "/#experience", label: "Experience" },
  { href: "/#testimonials", label: "Stories" },
  { href: "/join", label: "Join" }
]

export function MarketingHeader() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-brand-navy/10 bg-brand-neutral/80 backdrop-blur-xl supports-[backdrop-filter]:bg-brand-neutral/70">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 text-brand-navy sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group sm:gap-3" aria-label="WatchParty home">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden transition-all group-hover:-translate-y-0.5 sm:h-12 sm:w-12">
              <Image 
                src="/watchparty-logo.webp" 
                alt="WatchParty logo" 
                width={48} 
                height={48} 
                className="h-full w-full object-contain" 
                priority 
              />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-purple sm:text-xs">WatchParty</span>
              <span className="text-sm font-bold bg-gradient-to-r from-brand-navy to-brand-purple bg-clip-text text-transparent sm:text-base lg:text-lg">Watch Together</span>
            </span>
          </Link>
          
          {/* Desktop navigation (hidden on small screens) */}
          <nav className="hidden md:flex items-center gap-6">
            {_navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-brand-navy/75 hover:text-brand-navy transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile: hamburger only */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(true)} 
                aria-label="Open menu" 
                className="p-2.5 rounded-lg bg-brand-navy/5 hover:bg-brand-navy/10 border border-brand-navy/10 shadow-sm transition-all active:scale-95"
              >
                <svg 
                  className="h-6 w-6 text-brand-navy" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={2.5} 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  aria-hidden
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </div>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/login" aria-label="Sign in to WatchParty" className="px-3 py-2">
                  Sign in
                </Link>
              </Button>

              <Button asChild size="default" className="shadow-lg">
                <Link href="/auth/register" aria-label="Start hosting on WatchParty">
                  Start hosting
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile menu overlay - Outside header for proper positioning */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <aside className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-brand-navy/10 bg-brand-neutral/30 p-4">
              <Link href="/" className="flex items-center gap-2" aria-label="WatchParty home" onClick={() => setIsOpen(false)}>
                <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden">
                  <Image src="/watchparty-logo.webp" alt="WatchParty logo" width={32} height={32} className="object-contain" />
                </span>
                <span className="font-bold text-brand-navy">WatchParty</span>
              </Link>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)} 
                aria-label="Close menu" 
                className="p-2 rounded-lg bg-brand-navy/5 hover:bg-brand-navy/10 border border-brand-navy/10 transition-all active:scale-95"
              >
                <svg className="h-5 w-5 text-brand-navy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M6 6l12 12M6 18L18 6" />
                </svg>
              </Button>
            </div>

            <nav className="flex flex-col gap-2 p-4">
              {_navigation.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-4 py-3 text-base font-medium text-brand-navy/80 hover:bg-brand-neutral/30 hover:text-brand-navy transition-all active:scale-98"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-3 border-t border-brand-navy/10 p-4 mt-auto">
              <Link 
                href="/auth/login" 
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-4 py-3 text-center text-base font-medium text-brand-navy/80 hover:bg-brand-neutral/30 border border-brand-navy/20 transition-all active:scale-98"
              >
                Sign in
              </Link>
              <Link 
                href="/auth/register" 
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-gradient-to-r from-brand-magenta to-brand-orange px-4 py-3 text-center text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all active:scale-98"
              >
                Start hosting
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
