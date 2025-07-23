"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Lock, CheckCircle, AlertTriangle } from "lucide-react"

interface PaymentMethod {
  type: "card" | "paypal" | "apple_pay"
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

interface PaymentFormProps {
  onSubmit?: (paymentData: any) => void
  isLoading?: boolean
  selectedPlan?: {
    id: string
    name: string
    price: number
    billing: "monthly" | "yearly"
  }
  existingMethods?: PaymentMethod[]
}

export function PaymentForm({ 
  onSubmit, 
  isLoading = false, 
  selectedPlan,
  existingMethods = []
}: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<"new" | "existing">("new")
  const [selectedExisting, setSelectedExisting] = useState<number>(0)
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
    country: "",
    postalCode: ""
  })
  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)
  const [discount, setDiscount] = useState(0)

  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (paymentMethod === "new") {
      // Validate card data
      if (!cardData.number || !cardData.expiry || !cardData.cvc || !cardData.name) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required payment details.",
          variant: "destructive"
        })
        return
      }
    }

    onSubmit?.({
      paymentMethod: paymentMethod === "new" ? "card" : "existing",
      selectedMethod: paymentMethod === "existing" ? selectedExisting : undefined,
      cardData: paymentMethod === "new" ? cardData : undefined,
      promoCode: promoApplied ? promoCode : undefined
    })
  }

  const applyPromoCode = () => {
    // Mock promo code logic
    if (promoCode.toLowerCase() === "save20") {
      setDiscount(20)
      setPromoApplied(true)
      toast({
        title: "Promo Applied!",
        description: "You saved 20% on your subscription.",
      })
    } else {
      toast({
        title: "Invalid Code",
        description: "The promo code you entered is not valid.",
        variant: "destructive"
      })
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    return v
  }

  const subtotal = selectedPlan?.price || 0
  const discountAmount = (subtotal * discount) / 100
  const total = subtotal - discountAmount

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Plan Summary */}
      {selectedPlan && (
        <Card className="border-primary/20 bg-gradient-to-br from-neo-surface to-neo-surface-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-neo-text-secondary">{selectedPlan.name} Plan</span>
                <span className="font-medium">${selectedPlan.price.toFixed(2)}</span>
              </div>
              
              {promoApplied && (
                <div className="flex justify-between text-success">
                  <span>Discount ({discount}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t border-neo-border pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-gradient-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Method Selection */}
      {existingMethods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="existing"
                  name="payment-method"
                  checked={paymentMethod === "existing"}
                  onChange={() => setPaymentMethod("existing")}
                  className="text-primary"
                />
                <label htmlFor="existing" className="text-sm font-medium">
                  Use existing payment method
                </label>
              </div>

              {paymentMethod === "existing" && (
                <div className="ml-6 space-y-2">
                  {existingMethods.map((method, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedExisting === index
                          ? "border-primary bg-primary/5"
                          : "border-neo-border hover:bg-neo-surface-elevated"
                      }`}
                      onClick={() => setSelectedExisting(index)}
                    >
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-4 h-4" />
                        <div>
                          <p className="font-medium">**** **** **** {method.last4}</p>
                          <p className="text-xs text-neo-text-secondary">
                            {method.brand?.toUpperCase()} expires {method.expiryMonth}/{method.expiryYear}
                          </p>
                        </div>
                      </div>
                      {method.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="new"
                  name="payment-method"
                  checked={paymentMethod === "new"}
                  onChange={() => setPaymentMethod("new")}
                  className="text-primary"
                />
                <label htmlFor="new" className="text-sm font-medium">
                  Add new payment method
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Card Form */}
      {paymentMethod === "new" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  value={cardData.number}
                  onChange={(e) => setCardData({...cardData, number: formatCardNumber(e.target.value)})}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="input-base"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input
                    id="expiry"
                    value={cardData.expiry}
                    onChange={(e) => setCardData({...cardData, expiry: formatExpiry(e.target.value)})}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="input-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    value={cardData.cvc}
                    onChange={(e) => setCardData({...cardData, cvc: e.target.value.replace(/\D/g, "")})}
                    placeholder="123"
                    maxLength={4}
                    className="input-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholder-name">Cardholder Name</Label>
                <Input
                  id="cardholder-name"
                  value={cardData.name}
                  onChange={(e) => setCardData({...cardData, name: e.target.value})}
                  placeholder="John Doe"
                  className="input-base"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <select
                    id="country"
                    value={cardData.country}
                    onChange={(e) => setCardData({...cardData, country: e.target.value})}
                    className="input-base h-10"
                    required
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal-code">Postal Code</Label>
                  <Input
                    id="postal-code"
                    value={cardData.postalCode}
                    onChange={(e) => setCardData({...cardData, postalCode: e.target.value})}
                    placeholder="12345"
                    className="input-base"
                    required
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Promo Code */}
      <Card>
        <CardHeader>
          <CardTitle>Promo Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter promo code"
              className="input-base"
              disabled={promoApplied}
            />
            <Button
              type="button"
              variant="outline"
              onClick={applyPromoCode}
              disabled={!promoCode || promoApplied}
            >
              {promoApplied ? "Applied" : "Apply"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-sm text-neo-text-secondary bg-neo-surface p-3 rounded-lg">
        <Lock className="w-4 h-4" />
        <span>Your payment information is encrypted and secure</span>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full btn-primary h-12"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing...
          </div>
        ) : (
          `Complete Payment - $${total.toFixed(2)}`
        )}
      </Button>

      <p className="text-xs text-neo-text-tertiary text-center">
        By completing your purchase you agree to our Terms of Service and Privacy Policy.
        You can cancel anytime from your billing settings.
      </p>
    </div>
  )
}
