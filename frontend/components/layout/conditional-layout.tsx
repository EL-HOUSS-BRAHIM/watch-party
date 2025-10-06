'use client'

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { MarketingHeader } from "./marketing-header"
import { SiteFooter } from "./site-footer"

type ConditionalLayoutProps = {
  children: ReactNode
}

/**
 * ConditionalLayout - Renders different layouts based on the current route
 * - Marketing layout (with MarketingHeader + footer) for landing and public pages
 * - Dashboard layout handles its own header/footer
 * - Auth pages get minimal layout (no header/footer)
 * - Public party pages handle their own complete layout
 */
export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Dashboard pages handle their own layout completely
  const isDashboard = pathname?.startsWith('/dashboard')
  
  // Auth pages get minimal layout
  const isAuth = pathname?.startsWith('/auth')
  
  // Public party pages handle their own complete layout (no header/footer wrapper)
  const isPublicParty = pathname?.startsWith('/party/')
  
  const isLanding = pathname === "/"

  if (isDashboard) {
    // Dashboard handles its own complete layout
    return <>{children}</>
  }

  if (isPublicParty) {
    // Public party handles its own complete layout (full screen)
    return <>{children}</>
  }

  if (isAuth) {
    // Auth pages get minimal layout (no header/footer)
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          {children}
        </main>
      </div>
    )
  }

  // Marketing layout (landing page, public pages)
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">
        {isLanding ? (
          <div className="mobile-content">{children}</div>
        ) : (
          <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-16 sm:px-8 mobile-content">
            {children}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
