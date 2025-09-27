"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const watchPartyButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-watch-party-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-watch-party-primary text-white hover:bg-watch-party-primary/90 shadow-sm hover:shadow-md",
        destructive: "bg-watch-party-error text-white hover:bg-watch-party-error/90 shadow-sm hover:shadow-md",
        outline:
          "border border-watch-party-border bg-transparent hover:bg-watch-party-elevation-1 hover:text-watch-party-text-primary text-watch-party-text-secondary",
        secondary: "bg-watch-party-secondary text-white hover:bg-watch-party-secondary/90 shadow-sm hover:shadow-md",
        ghost: "hover:bg-watch-party-elevation-1 hover:text-watch-party-text-primary text-watch-party-text-secondary",
        link: "text-watch-party-primary underline-offset-4 hover:underline hover:text-watch-party-secondary",
        gradient:
          "bg-watch-party-gradient text-white hover:shadow-watch-party-glow shadow-sm hover:scale-105 transform transition-all duration-200",
        glow: "bg-watch-party-primary text-white hover:shadow-watch-party-glow shadow-sm animate-glow-pulse",
        success: "bg-watch-party-success text-white hover:bg-watch-party-success/90 shadow-sm hover:shadow-md",
        warning: "bg-watch-party-warning text-white hover:bg-watch-party-warning/90 shadow-sm hover:shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface WatchPartyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof watchPartyButtonVariants> {
  asChild?: boolean
}

const WatchPartyButton = React.forwardRef<HTMLButtonElement, WatchPartyButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(watchPartyButtonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
WatchPartyButton.displayName = "WatchPartyButton"

export { WatchPartyButton, watchPartyButtonVariants }
