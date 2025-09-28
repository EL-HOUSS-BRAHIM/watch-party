import type * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

"use client"

interface WatchPartyThemeProviderProps extends ThemeProviderProps {}
  children: React.ReactNode;
}

export function WatchPartyThemeProvider({ children, ...props }: WatchPartyThemeProviderProps) {}
  return (
    <NextThemesProvider;
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={["light", "dark"]}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
