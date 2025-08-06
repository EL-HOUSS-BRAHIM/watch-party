"use client"

import type React from "react"

import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface EnhancedTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  delay?: number
  className?: string
  showArrow?: boolean
  interactive?: boolean
}

export function EnhancedTooltip({
  children,
  content,
  side = "top",
  align = "center",
  delay = 200,
  className,
  showArrow = true,
  interactive = false,
}: EnhancedTooltipProps) {
  const [open, setOpen] = useState(false)

  return (
    <TooltipProvider delayDuration={delay}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            "max-w-xs p-3 text-sm",
            !showArrow && "border-0 shadow-lg",
            interactive && "cursor-pointer",
            className,
          )}
          onPointerEnter={() => interactive && setOpen(true)}
          onPointerLeave={() => interactive && setOpen(false)}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
