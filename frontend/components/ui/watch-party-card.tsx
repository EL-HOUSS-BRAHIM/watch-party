"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const WatchPartyCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-watch-party-border bg-watch-party-surface text-watch-party-text-primary shadow-watch-party-elevation backdrop-blur-sm transition-all duration-200 hover:shadow-watch-party-deep",
        className,
      )}
      {...props}
    />
  ),
)
WatchPartyCard.displayName = "WatchPartyCard"

const WatchPartyCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
)
WatchPartyCardHeader.displayName = "WatchPartyCardHeader"

const WatchPartyCardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight text-watch-party-text-primary", className)}
      {...props}
    />
  ),
)
WatchPartyCardTitle.displayName = "WatchPartyCardTitle"

const WatchPartyCardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm text-watch-party-text-secondary", className)} {...props} />
  ),
)
WatchPartyCardDescription.displayName = "WatchPartyCardDescription"

const WatchPartyCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn(&quot;p-6 pt-0&quot;, className)} {...props} />,
)
WatchPartyCardContent.displayName = "WatchPartyCardContent"

const WatchPartyCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
)
WatchPartyCardFooter.displayName = "WatchPartyCardFooter"

export {
  WatchPartyCard,
  WatchPartyCardHeader,
  WatchPartyCardFooter,
  WatchPartyCardTitle,
  WatchPartyCardDescription,
  WatchPartyCardContent,
}
