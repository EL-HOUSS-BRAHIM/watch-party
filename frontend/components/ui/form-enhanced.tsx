import { Check, Eye, EyeOff, X } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

"use client"
interface ValidationRule {}
  test: (value: string) => boolean;
  message: string;
}

interface EnhancedInputProps {}
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  validationRules?: ValidationRule[]
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showValidation?: boolean;
  realTimeValidation?: boolean;
}

export function EnhancedInput({}
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  validationRules = [],
  required = false,
  disabled = false,
  className,
  showValidation = true,
  realTimeValidation = true,
}: EnhancedInputProps) {}
  const [touched, setTouched] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [validationResults, setValidationResults] = useState<{}
    isValid: boolean;
    errors: string[]
  }>({ isValid: true, errors: [] })

  const validateInput = (inputValue: string) => {}
    const errors: string[] = []

    if (required && !inputValue.trim()) {}
      errors.push(`${label} is required`)
    }

    validationRules.forEach((rule) => {}
      if (inputValue && !rule.test(inputValue)) {}
        errors.push(rule.message)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  useEffect(() => {
    if (realTimeValidation && touched) {
      setValidationResults(validateInput(value))
    }
  }, [value, touched, realTimeValidation])

  const handleBlur = () => {}
    setTouched(true)
    if (!realTimeValidation) {
      setValidationResults(validateInput(value))
    }
  }

  const inputType = type === "password" && showPassword ? "text" : type;
  const hasErrors = touched && showValidation && validationResults.errors.length > 0;
  const isValid = touched && showValidation && validationResults.isValid && value.trim()

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={label} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="relative">
        <Input;
          id={label}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          disabled={disabled}
          className={cn(
            "pr-10",
            hasErrors && "border-red-500 focus:border-red-500",
            isValid && "border-green-500 focus:border-green-500",
          )}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {type === "password" && (
            <Button;
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className=&quot;h-4 w-4 text-gray-500&quot; />}
            </Button>
          )}

          {showValidation && touched && (
            <>
              {isValid && <Check className="h-4 w-4 text-green-500" />}
              {hasErrors && <X className="h-4 w-4 text-red-500" />}
            </>
          )}
        </div>
      </div>

      {showValidation && touched && validationResults.errors.length > 0 && (
        <div className="space-y-1">
          {validationResults.errors.map((error, index) => (
            <Alert key={index} variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  )
}

// Password strength indicator;
export function PasswordStrengthIndicator({ password }: { password: string }) {}
  const getStrength = (pwd: string) => {}
    let score = 0;
    if (pwd.length >= 8) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++

    return score;
  }

  const strength = getStrength(password)
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"]

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div;
            key={index}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              index < strength ? strengthColors[strength - 1] : "bg-gray-200",
            )}
          />
        ))}
      </div>
      <p className="text-sm text-gray-600">Password strength: {strengthLabels[strength - 1] || &quot;Very Weak&quot;}</p>
    </div>
  )
}
