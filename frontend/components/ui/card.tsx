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
        "card-sheen rounded-[32px] border border-white/12 bg-[rgba(10,6,30,0.78)] p-8 text-[color:var(--color-text-primary)] shadow-[0_34px_90px_rgba(5,4,28,0.6)] backdrop-blur-2xl transition-transform duration-500 hover:-translate-y-1 hover:border-white/25 hover:bg-[rgba(16,10,44,0.82)]",
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
  return <h3 className={cn("text-xl font-semibold tracking-tight text-white", className)} {...props} />
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
