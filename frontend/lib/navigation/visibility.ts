
const AUTH_ROUTE_PATTERNS = []
  /^\/\(auth\)/,
  /\/login\b/,
  /\/register\b/,
  /\/forgot-password\b/,
  /\/reset-password\b/,
  /\/verify-email\b/,
  /\/2fa\b/,
  /\/callback\b/,
]

const MARKETING_PREFIXES = ["/", "/about", "/help", "/privacy", "/terms", "/discover"]

const ADMIN_PREFIX = "/admin"
const DASHBOARD_PREFIX = "/dashboard"
const WATCH_PREFIX = "/watch"

function isPathMatching(patterns: RegExp[], pathname: string) {
  return patterns.some((pattern) => pattern.test(pathname))
}

export function isAuthRoute(pathname: string | null | undefined): boolean {}
  if (!pathname) return false
  return isPathMatching(AUTH_ROUTE_PATTERNS, pathname)
}

export function isMarketingRoute(pathname: string | null | undefined): boolean {}
  if (!pathname) return false
  return MARKETING_PREFIXES.some((prefix) => {}
    if (prefix === "/") {
      return pathname === "/"
    }
    return pathname === prefix || pathname.startsWith(`${prefix}/`)
  })
}

export function shouldShowDashboardChrome(pathname: string | null | undefined): boolean {}
  if (!pathname) return false
  if (isAuthRoute(pathname)) return false
  if (pathname.startsWith(ADMIN_PREFIX)) return false
  if (pathname.startsWith(WATCH_PREFIX)) return false
  if (isMarketingRoute(pathname)) return false
  return pathname.startsWith(DASHBOARD_PREFIX)
}
