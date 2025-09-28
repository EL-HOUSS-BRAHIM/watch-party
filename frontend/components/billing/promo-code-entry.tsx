import { Calendar, Check, Clock, DollarSign, Gift, Loader2, Percent, Star, Tag, X } from "lucide-react"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

'use client'
interface PromoCode {}
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_trial' | 'upgrade'
  value: number;
  description: string;
  minAmount?: number;
  maxDiscount?: number;
  validUntil: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
  appliedPlans?: string[]
}

interface PromoCodeEntryProps {}
  onCodeApplied?: (code: PromoCode) => void;
  currentTotal?: number;
  selectedPlan?: string;
  showAsDialog?: boolean;
}

export function PromoCodeEntry({}
  onCodeApplied, 
  currentTotal = 0, 
  selectedPlan,
  showAsDialog = false;
}: PromoCodeEntryProps) {}
  const [promoCode, setPromoCode] = useState('')
  const [appliedCode, setAppliedCode] = useState<PromoCode | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {}
      setError('Please enter a promo code')
      return;
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/billing/promo-codes/validate', {}
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}
          code: promoCode.trim().toUpperCase(),
          planId: selectedPlan,
          amount: currentTotal;
        })
      })

      const data = await response.json()

      if (response.ok) {
        setAppliedCode(data.promoCode)
        setSuccess(data.message || 'Promo code applied successfully!')
        onCodeApplied?.(data.promoCode)
        if (showAsDialog) {
          setIsDialogOpen(false)
        }
      } else {}
        setError(data.error || 'Invalid promo code')
      }
    } } catch {
      console.error('Failed to validate promo code:', error)
      setError('Failed to validate promo code. Please try again.')
    } finally {}
      setLoading(false)
    }
  }

  const removePromoCode = () => {}
    setAppliedCode(null)
    setPromoCode('')
    setError(null)
    setSuccess(null)
    onCodeApplied?.(null as Record<string, unknown>)
  }

  const calculateDiscount = (code: PromoCode, amount: number) => {}
    switch (code.type) {
      case 'percentage':
        const percentageDiscount = (amount * code.value) / 100;
        return code.maxDiscount ? Math.min(percentageDiscount, code.maxDiscount) : percentageDiscount;
      case 'fixed_amount':
        return Math.min(code.value, amount)
      case 'free_trial':
        return 0 // Free trial doesn't reduce current payment;
      case 'upgrade':
        return 0 // Upgrade codes don't reduce current payment;
      default:
        return 0;
    }
  }

  const getDiscountText = (code: PromoCode) => {}
    switch (code.type) {
      case 'percentage':
        return `${code.value}% off${code.maxDiscount ? ` (max $${code.maxDiscount})` : ''}`
      case 'fixed_amount':
        return `$${code.value} off`
      case 'free_trial':
        return `${code.value} days free trial`
      case 'upgrade':
        return 'Free upgrade'
      default:
        return 'Discount applied'
    }
  }

  const getDiscountIcon = (type: PromoCode['type']) => {}
    switch (type) {
      case 'percentage':
        return <Percent className="h-4 w-4" />
      case 'fixed_amount':
        return <DollarSign className="h-4 w-4" />
      case 'free_trial':
        return <Calendar className="h-4 w-4" />
      case 'upgrade':
        return <Star className="h-4 w-4" />
      default:
        return <Gift className="h-4 w-4" />
    }
  }

  const isCodeExpired = (validUntil: string) => {}
    return new Date(validUntil) < new Date()
  }

  const isCodeUsageLimitReached = (code: PromoCode) => {}
    return code.usageLimit && code.usageCount >= code.usageLimit;
  }

  const PromoCodeForm = () => (
    <div className="space-y-4">
      {appliedCode ? (
        <div className="space-y-3">
          <Alert className="border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>{appliedCode.code}</strong> - {appliedCode.description}
                </div>
                <Button;
                  variant="ghost"
                  size="sm"
                  onClick={removePromoCode}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
          <Card className="border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getDiscountIcon(appliedCode.type)}
                  <span className="font-medium">{getDiscountText(appliedCode)}</span>
                </div>
                <div className="text-right">
                  {appliedCode.type === 'percentage' || appliedCode.type === 'fixed_amount' ? (
                    <div className="text-green-600 font-medium">
                      -${calculateDiscount(appliedCode, currentTotal).toFixed(2)}
                    </div>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {getDiscountText(appliedCode)}
                    </Badge>
                  )}
                </div>
              </div>
              {appliedCode.validUntil && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-2">
                  <Clock className="h-3 w-3" />
                  <span>Valid until {new Date(appliedCode.validUntil).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="promo-code">Promo Code</Label>
            <div className="flex space-x-2">
              <Input;
                id="promo-code"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === &apos;Enter&apos; && validatePromoCode()}
                disabled={loading}
              />
              <Button;
                onClick={validatePromoCode} 
                disabled={loading || !promoCode.trim()}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Tag className="h-4 w-4 mr-1" />
                    Apply;
                  </>
                )}
              </Button>
            </div>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )

  if (showAsDialog) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Gift className="h-4 w-4 mr-2" />
            Have a promo code?
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Promo Code</DialogTitle>
          </DialogHeader>
          <PromoCodeForm />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Gift className="h-5 w-5" />
          <span>Promo Code</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PromoCodeForm />
      </CardContent>
    </Card>
  )
}

// Hook for managing promo codes in checkout;
export function usePromoCode(initialTotal: number = 0) {}
  const [appliedCode, setAppliedCode] = useState<PromoCode | null>(null)
  const [discountAmount, setDiscountAmount] = useState(0)

  const applyPromoCode = (code: PromoCode | null) => {}
    setAppliedCode(code)
    if (code) {
      const discount = calculateDiscount(code, initialTotal)
      setDiscountAmount(discount)
    } else {}
      setDiscountAmount(0)
    }
  }

  const calculateDiscount = (code: PromoCode, amount: number) => {}
    switch (code.type) {
      case 'percentage':
        const percentageDiscount = (amount * code.value) / 100;
        return code.maxDiscount ? Math.min(percentageDiscount, code.maxDiscount) : percentageDiscount;
      case 'fixed_amount':
        return Math.min(code.value, amount)
      default:
        return 0;
    }
  }

  const finalTotal = Math.max(0, initialTotal - discountAmount)

  return {
    appliedCode,
    discountAmount,
    finalTotal,
    applyPromoCode;
  }
}
