"use client"

import { Check, Eye, EyeOff } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"

export interface WatchPartyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
  label?: string
  error?: string
  success?: string
  hint?: string
  icon?: React.ReactNode
  showPasswordToggle?: boolean
  variant?: "default" | "search" | "ghost"
}

const WatchPartyInput = React.forwardRef<HTMLInputElement, WatchPartyInputProps>(
  (
    { className, type, label, error, success, hint, icon, showPasswordToggle = false, variant = "default", ...props },
    ref,
  ) => {}
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)

    const inputType = showPasswordToggle ? (showPassword ? "text" : "password") : type
    const baseStyles =
      "flex h-12 w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"

    const variantStyles = { default: cn(
        "border-border bg-background",
        "focus:border-primary focus:ring-2 focus:ring-primary/20",
        "hover:border-primary/60",
        error && "border-destructive focus:border-destructive focus:ring-destructive/20",
        success && "border-success focus:border-success focus:ring-success/20",
      ),
      search: cn(
        "border-border/50 bg-muted/50",
        "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background",
        "hover:border-primary/60 hover:bg-background/80",
      ),
      ghost: cn(
        "border-transparent bg-transparent",
        "focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-background/50",
        "hover:bg-background/30",
      ),
    }

    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}

        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}

          <input
            type={inputType}
            className={cn(
              baseStyles,
              variantStyles[variant],
              icon && "pl-10",
              (showPasswordToggle || error || success) && "pr-10",
              isFocused && "ring-2 ring-primary/20",
              className,
            )}
            ref={ref}
            onFocus={(e) => {}
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {}
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />

          {/* Password toggle button */}
          {showPasswordToggle && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className=&quot;h-4 w-4&quot; />}
            </button>
          )}

          {/* Error icon */}
          {error && !showPasswordToggle && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}

          {/* Success icon */}
          {success && !showPasswordToggle && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-success">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Helper text */}
        {(error || success || hint) && (
          <div className="text-xs">
            {error && (
              <p className="text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {error}
              </p>
            )}
            {success && !error && (
              <p className="text-success flex items-center gap-1">
                <Check className="h-3 w-3" />
                {success}
              </p>
            )}
            {hint && !error && !success && <p className="text-muted-foreground">{hint}</p>}
          </div>
        )}
      </div>
    )
  },
)

WatchPartyInput.displayName = "WatchPartyInput"

export { WatchPartyInput }
