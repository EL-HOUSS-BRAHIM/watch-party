import type { ReactNode } from "react"

type ProvidersProps = {
  children: ReactNode
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return <>{children}</>
}
