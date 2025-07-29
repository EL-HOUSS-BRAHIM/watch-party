"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const formVariants = cva("space-y-6", {
  variants: {
    variant: {
      default: "bg-card border border-border rounded-lg p-6",
      ghost: "bg-transparent border-0 p-0",
      elevated: "bg-card border border-border rounded-lg p-6 shadow-lg shadow-primary/10",
    },
    size: {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      full: "w-full",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

interface WatchPartyFormProps extends React.FormHTMLAttributes<HTMLFormElement>, VariantProps<typeof formVariants> {
  title?: string
  description?: string
  footer?: React.ReactNode
  isLoading?: boolean
  errors?: Record<string, string[]>
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void
}

const WatchPartyForm = React.forwardRef<HTMLFormElement, WatchPartyFormProps>(
  (
    {
      className,
      variant,
      size,
      title,
      description,
      footer,
      isLoading = false,
      errors = {},
      children,
      onSubmit,
      ...props
    },
    ref,
  ) => {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!isLoading && onSubmit) {
        onSubmit(event)
      }
    }

    return (
      <form ref={ref} className={cn(formVariants({ variant, size }), className)} onSubmit={handleSubmit} {...props}>
        {(title || description) && (
          <div className="space-y-2">
            {title && <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}

        {Object.keys(errors).length > 0 && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-destructive">Please fix the following errors:</h3>
                <div className="mt-2 text-sm text-destructive">
                  <ul className="list-disc space-y-1 pl-5">
                    {Object.entries(errors).map(([field, fieldErrors]) =>
                      fieldErrors.map((error, index) => <li key={`${field}-${index}`}>{error}</li>),
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={cn("space-y-4", isLoading && "opacity-50 pointer-events-none")}>{children}</div>

        {footer && <div className="pt-4 border-t border-border">{footer}</div>}
      </form>
    )
  },
)
WatchPartyForm.displayName = "WatchPartyForm"

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  description?: string
  error?: string
  required?: boolean
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, description, error, required, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {children}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  },
)
FormField.displayName = "FormField"

interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "left" | "center" | "right"
}

const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(
  ({ className, align = "right", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex gap-3",
          {
            "justify-start": align === "left",
            "justify-center": align === "center",
            "justify-end": align === "right",
          },
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  },
)
FormActions.displayName = "FormActions"

export { WatchPartyForm, FormField, FormActions }
