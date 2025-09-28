"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"



interface MobileDrawerProps {}
  children: React.ReactNode
  trigger?: React.ReactNode
  side?: "left" | "right" | "top" | "bottom"
  className?: string
}

export function MobileDrawer({ children, trigger, side = "left", className }: MobileDrawerProps) {}
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side={side} className={cn("w-80", className)}>
        {children}
      </SheetContent>
    </Sheet>
  )
}
