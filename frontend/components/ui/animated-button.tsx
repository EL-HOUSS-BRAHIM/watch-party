"use client"

import type React from "react"
import { useState } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"


interface AnimatedButtonProps extends ButtonProps {}
  animation?: "pulse" | "bounce" | "shake" | "glow" | "ripple"
  duration?: number
}

export function AnimatedButton({children,
  className,
  animation = "pulse",
  duration = 200,
  onClick,
  ...props
}: AnimatedButtonProps) {}
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {}
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), duration)
    onClick?.(e)
  }

  const animationClasses = { pulse: "animate-pulse",
    bounce: "animate-bounce",
    shake: "animate-shake",
    glow: "animate-glow",
    ripple: "animate-ripple",
  }

  return (
    <Button
      className={cn("transition-all duration-200", isAnimating && animationClasses[animation], className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  )
}
