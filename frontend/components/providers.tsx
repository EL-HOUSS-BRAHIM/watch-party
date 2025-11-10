'use client';

import type { ReactNode } from "react"
import { QueryProvider } from "@/components/providers/QueryProvider"

type ProvidersProps = {
  children: ReactNode
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  )
}
