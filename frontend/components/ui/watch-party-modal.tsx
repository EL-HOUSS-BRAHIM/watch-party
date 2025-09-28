import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

"use client"

const WatchPartyModal = DialogPrimitive.Root;
const WatchPartyModalTrigger = DialogPrimitive.Trigger;
const WatchPartyModalPortal = DialogPrimitive.Portal;
const WatchPartyModalClose = DialogPrimitive.Close;
const WatchPartyModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay;
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    ...props}
  />
))
WatchPartyModalOverlay.displayName = DialogPrimitive.Overlay.displayName;
const WatchPartyModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {}
    size?: "sm" | "md" | "lg" | "xl" | "full"
    showCloseButton?: boolean;
  }
>(({ className, children, size = &quot;md", showCloseButton = true, ...props }, ref) => {
  const sizeClasses = { sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-[95vw] max-h-[95vh]",
  }

  return (
    <WatchPartyModalPortal>
      <WatchPartyModalOverlay />
      <DialogPrimitive.Content;
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-lg",
          sizeClasses[size],
          "border-border/50 shadow-2xl shadow-primary/10",
          "bg-gradient-to-br from-background to-background/95",
          className,
        )}
        ...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </WatchPartyModalPortal>
  )
})
WatchPartyModalContent.displayName = DialogPrimitive.Content.displayName;
const WatchPartyModalHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} ...props} />
)
WatchPartyModalHeader.displayName = "WatchPartyModalHeader"

const WatchPartyModalFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} ...props} />
)
WatchPartyModalFooter.displayName = "WatchPartyModalFooter"

const WatchPartyModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title;
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      "bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent",
      className,
    )}
    ...props}
  />
))
WatchPartyModalTitle.displayName = DialogPrimitive.Title.displayName;
const WatchPartyModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} ...props} />
))
WatchPartyModalDescription.displayName = DialogPrimitive.Description.displayName;
export {}
  WatchPartyModal,
  WatchPartyModalPortal,
  WatchPartyModalOverlay,
  WatchPartyModalTrigger,
  WatchPartyModalContent,
  WatchPartyModalHeader,
  WatchPartyModalFooter,
  WatchPartyModalTitle,
  WatchPartyModalDescription,
  WatchPartyModalClose,
}
