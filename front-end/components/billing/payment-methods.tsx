"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreditCard, Plus, Trash2, Star, Shield, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { billingAPI } from "@/lib/api"
import type { PaymentMethod as APIPaymentMethod } from "@/lib/api/types"
import { cn } from "@/lib/utils"

interface PaymentMethod {
  id: string
  type: "card" | "paypal" | "bank"
  brand?: string
  last4?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  email?: string // for PayPal
  bankName?: string // for bank transfers
}

interface PaymentMethodsProps {
  className?: string
}

export default function PaymentMethods({ className }: PaymentMethodsProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  // Helper function to map API payment method to local type
  const mapAPIPaymentMethodToLocal = (apiPM: APIPaymentMethod): PaymentMethod => ({
    id: apiPM.id,
    type: apiPM.type,
    brand: apiPM.brand,
    last4: apiPM.last_four,
    expiryMonth: apiPM.expires_month,
    expiryYear: apiPM.expires_year,
    isDefault: apiPM.is_default,
  })

  const loadPaymentMethods = async () => {
    try {
      const data = await billingAPI.getPaymentMethods()
      const mappedMethods = (data.payment_methods || []).map(mapAPIPaymentMethodToLocal)
      setPaymentMethods(mappedMethods)
    } catch (error) {
      console.error("Failed to load payment methods:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addPaymentMethod = async (formData: FormData) => {
    setIsAdding(true)

    try {
      // In a real implementation, you would use Stripe Elements or similar
      // to securely collect payment information
      const newPaymentMethod = await billingAPI.addPaymentMethod("stripe_payment_method_id")
      const mappedMethod = mapAPIPaymentMethodToLocal(newPaymentMethod)
      setPaymentMethods((prev) => [...prev, mappedMethod])
      setShowAddDialog(false)
      toast({
        title: "Payment method added",
        description: "Your payment method has been successfully added.",
      })
    } catch (error) {
      console.error("Failed to add payment method:", error)
      toast({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const removePaymentMethod = async (methodId: string) => {
    if (!confirm("Are you sure you want to remove this payment method?")) return

    try {
      await billingAPI.deletePaymentMethod(methodId)
      setPaymentMethods((prev) => prev.filter((method) => method.id !== methodId))
      toast({
        title: "Payment method removed",
        description: "The payment method has been successfully removed.",
      })
    } catch (error) {
      console.error("Failed to remove payment method:", error)
      toast({
        title: "Error",
        description: "Failed to remove payment method. Please try again.",
        variant: "destructive",
      })
    }
  }

  const setDefaultPaymentMethod = async (methodId: string) => {
    try {
      await billingAPI.setDefaultPaymentMethod(methodId)
      setPaymentMethods((prev) =>
        prev.map((method) => ({
          ...method,
          isDefault: method.id === methodId,
        })),
      )
      toast({
        title: "Default payment method updated",
        description: "Your default payment method has been updated.",
      })
    } catch (error) {
      console.error("Failed to set default payment method:", error)
      toast({
        title: "Error",
        description: "Failed to update default payment method. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getCardIcon = (brand: string) => {
    // In a real implementation, you would have actual card brand icons
    return <CreditCard className="h-6 w-6" />
  }

  const PaymentMethodCard = ({ method }: { method: PaymentMethod }) => (
    <Card className={cn("transition-all hover:shadow-md", method.isDefault && "border-blue-500")}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {method.type === "card" && getCardIcon(method.brand || "")}
            {method.type === "paypal" && (
              <div className="w-6 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center">PP</div>
            )}
            {method.type === "bank" && (
              <div className="w-6 h-6 bg-green-600 rounded text-white text-xs flex items-center justify-center">B</div>
            )}

            <div>
              <div className="flex items-center gap-2">
                {method.type === "card" && (
                  <span className="font-medium">
                    {method.brand?.toUpperCase()} •••• {method.last4}
                  </span>
                )}
                {method.type === "paypal" && <span className="font-medium">PayPal ({method.email})</span>}
                {method.type === "bank" && <span className="font-medium">{method.bankName}</span>}

                {method.isDefault && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Default
                  </Badge>
                )}
              </div>

              {method.type === "card" && method.expiryMonth && method.expiryYear && (
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Expires {method.expiryMonth.toString().padStart(2, "0")}/{method.expiryYear}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!method.isDefault && (
              <Button variant="outline" size="sm" onClick={() => setDefaultPaymentMethod(method.id)}>
                Set Default
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removePaymentMethod(method.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const AddPaymentMethodForm = () => {
    const [paymentType, setPaymentType] = useState("card")

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      formData.append("type", paymentType)
      addPaymentMethod(formData)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Payment Method Type</Label>
          <Select value={paymentType} onValueChange={setPaymentType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="card">Credit/Debit Card</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="bank">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {paymentType === "card" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input id="cardNumber" name="cardNumber" placeholder="1234 5678 9012 3456" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input id="expiryDate" name="expiryDate" placeholder="MM/YY" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" name="cvv" placeholder="123" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name</Label>
              <Input id="cardholderName" name="cardholderName" placeholder="John Doe" required />
            </div>
          </>
        )}

        {paymentType === "paypal" && (
          <div className="space-y-2">
            <Label htmlFor="paypalEmail">PayPal Email</Label>
            <Input id="paypalEmail" name="paypalEmail" type="email" placeholder="your@email.com" required />
          </div>
        )}

        {paymentType === "bank" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input id="bankName" name="bankName" placeholder="Your Bank Name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input id="accountNumber" name="accountNumber" placeholder="Account Number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="routingNumber">Routing Number</Label>
              <Input id="routingNumber" name="routingNumber" placeholder="Routing Number" required />
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isAdding}>
            {isAdding ? "Adding..." : "Add Payment Method"}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Methods</h2>
          <p className="text-gray-600">Manage your payment methods and billing information</p>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>Add a new payment method to your account</DialogDescription>
            </DialogHeader>
            <AddPaymentMethodForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">Secure Payment Processing</h3>
              <p className="text-sm text-blue-700">
                All payment information is encrypted and processed securely through Stripe. We never store your full
                payment details.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading payment methods...</p>
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No payment methods</h3>
            <p className="text-gray-600 mb-4">Add a payment method to start using premium features</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Payment Method
            </Button>
          </div>
        ) : (
          paymentMethods.map((method) => <PaymentMethodCard key={method.id} method={method} />)
        )}
      </div>
    </div>
  )
}

export { PaymentMethods }
