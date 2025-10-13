import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

type CardProps = HTMLAttributes<HTMLDivElement>

type CardHeaderProps = HTMLAttributes<HTMLDivElement>

type CardTitleProps = HTMLAttributes<HTMLHeadingElement>

type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>

type CardContentProps = HTMLAttributes<HTMLDivElement>

type CardFooterProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-[color:var(--color-text-primary)] shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:border-white/20",
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn("mb-5 space-y-3", className)} {...props} />
}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return <h3 className={cn("text-xl font-semibold tracking-tight", className)} {...props} />
}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      className={cn(
        "text-sm leading-relaxed text-[color:var(--color-text-muted)]",
        className,
      )}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("space-y-5", className)} {...props} />
}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return <div className={cn("mt-6", className)} {...props} />
}
