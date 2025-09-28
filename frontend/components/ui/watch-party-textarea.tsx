"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"


const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
  {}
    variants: {}
      variant: {}
        default: "border-input focus-visible:ring-ring",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-green-500 focus-visible:ring-green-500",
      },
      resize: {}
        none: "resize-none",
        vertical: "resize-y",
        horizontal: "resize-x",
        both: "resize",
      },
    },
    defaultVariants: {}
      variant: "default",
      resize: "vertical",
    },
  },
)

export interface WatchPartyTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange">,
    VariantProps<typeof textareaVariants> {}
  autoResize?: boolean
  maxLength?: number
  showCharCount?: boolean
  minRows?: number
  maxRows?: number
  error?: string
  success?: string
  onChange?: (value: string, event: React.ChangeEvent<HTMLTextAreaElement>) => void
}

const WatchPartyTextarea = React.forwardRef<HTMLTextAreaElement, WatchPartyTextareaProps>(
  (
    {}
      className,
      variant,
      resize,
      autoResize = false,
      maxLength,
      showCharCount = false,
      minRows = 3,
      maxRows = 10,
      error,
      success,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {}
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const [charCount, setCharCount] = React.useState(0)

    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current!)

    const adjustHeight = React.useCallback(() => {}
      const textarea = textareaRef.current
      if (!textarea || !autoResize) return
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto"

      // Calculate the number of rows
      const lineHeight = Number.parseInt(getComputedStyle(textarea).lineHeight)
      const padding =
        Number.parseInt(getComputedStyle(textarea).paddingTop) +
        Number.parseInt(getComputedStyle(textarea).paddingBottom)

      const minHeight = minRows * lineHeight + padding
      const maxHeight = maxRows * lineHeight + padding
      const scrollHeight = textarea.scrollHeight
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight)

      textarea.style.height = `${newHeight}px`
    }, [autoResize, minRows, maxRows])

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {}
      const newValue = event.target.value
      // Enforce maxLength if specified
      if (maxLength && newValue.length > maxLength) {
        return
      }

      setCharCount(newValue.length)
      onChange?.(newValue, event)

      // Adjust height after state update
      if (autoResize) {
        setTimeout(adjustHeight, 0)
      }
    }

    // Initialize character count
    React.useEffect(() => {
      const initialValue = value?.toString() || ""
      setCharCount(initialValue.length)
    }, [value])

    // Adjust height on mount and when content changes
    React.useEffect(() => {
      if (autoResize) {
        adjustHeight()
      }
    }, [adjustHeight, value])

    // Determine variant based on error/success states
    const effectiveVariant = error ? "error" : success ? "success" : variant
    return (
      <div className="relative">
        <textarea
          ref={textareaRef}
          className={cn(
            textareaVariants({ variant: effectiveVariant, resize: autoResize ? "none" : resize }),
            showCharCount && "pb-6",
            className,
          )}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          style={autoResize ? { overflow: "hidden" } : undefined}
          {...props}
        />

        {(showCharCount || maxLength) && (
          <div className="absolute bottom-2 right-3 text-xs text-muted-foreground">
            {showCharCount && (
              <span
                className={cn(
                  maxLength && charCount > maxLength * 0.9 && "text-warning",
                  maxLength && charCount === maxLength && "text-destructive",
                )}
              >
                {charCount}
                {maxLength && `/${maxLength}`}
              </span>
            )}
          </div>
        )}

        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

        {success && !error && <p className="mt-1 text-xs text-green-600">{success}</p>}
      </div>
    )
  },
)
WatchPartyTextarea.displayName = "WatchPartyTextarea"

export { WatchPartyTextarea }
