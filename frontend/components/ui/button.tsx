import { forwardRef } from "react"
import type { ButtonHTMLAttributes } from "react"
import { Slot } from "@radix-ui/react-slot"
import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

type ButtonElement = HTMLButtonElement

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-zinc-50 text-zinc-900 hover:bg-zinc-200",
        secondary: "bg-zinc-900 text-zinc-50 ring-1 ring-inset ring-zinc-700 hover:bg-zinc-800",
        ghost: "bg-transparent text-zinc-50 hover:bg-zinc-900/60",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
)

export type ButtonProps = ButtonHTMLAttributes<ButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export const Button = forwardRef<ButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Component = asChild ? Slot : "button"
    return (
      <Component
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)

Button.displayName = "Button"
