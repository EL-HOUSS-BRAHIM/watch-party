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
      className={cn("rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-sm", className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return <div className={cn("mb-4 space-y-2", className)} {...props} />
}

export function CardTitle({ className, ...props }: CardTitleProps) {
  return <h3 className={cn("text-lg font-semibold", className)} {...props} />
}

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return <p className={cn("text-sm text-zinc-400", className)} {...props} />
}

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("space-y-4", className)} {...props} />
}

export function CardFooter({ className, ...props }: CardFooterProps) {
  return <div className={cn("mt-6", className)} {...props} />
}
