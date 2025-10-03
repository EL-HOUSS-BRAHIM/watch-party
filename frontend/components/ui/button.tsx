import { forwardRef } from "react"
import type { ButtonHTMLAttributes } from "react"
import { Slot } from "@radix-ui/react-slot"
import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

type ButtonElement = HTMLButtonElement

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
  {
    variants: {
      variant: {
        primary:
          "relative overflow-hidden bg-gradient-to-r from-brand-magenta to-brand-orange text-white shadow-[0_20px_60px_rgba(233,64,138,0.55)] transition-transform duration-300 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_60%)] before:opacity-0 before:transition-opacity before:duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_70px_rgba(233,64,138,0.65)] hover:before:opacity-100 focus-visible:ring-brand-magenta/70",
        secondary:
          "border border-brand-blue/25 bg-white text-brand-navy shadow-[0_14px_40px_rgba(45,156,219,0.15)] hover:border-brand-blue/40 hover:text-brand-blue-dark",
        ghost:
          "bg-transparent text-brand-navy/70 hover:bg-brand-blue/10 hover:text-brand-blue-dark",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-7 text-base",
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
