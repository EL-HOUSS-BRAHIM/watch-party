import * as React from 'react'
import {}

'use client'

  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

interface CinemaThemeProviderProps extends Omit<ThemeProviderProps, 'attribute' | 'defaultTheme'> {}
  children: React.ReactNode;
}

export function ThemeProvider({ children, ...props }: CinemaThemeProviderProps) {}
  return (
    <NextThemesProvider;
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
