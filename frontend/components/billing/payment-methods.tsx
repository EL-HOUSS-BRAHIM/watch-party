"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreditCard, Plus, Trash2, Star, Shield, Calendar, User } from "lucide-react"

export function PaymentMethods() {
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCard, setNewCard] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  })

  // Mock payment methods data
  const paymentMethods = [
    {
      id: "pm_001",
      type: "card",
      brand: "visa",
      last4: "4242",
      exp_month: 12,
      exp_year: 2025,
      name: "John Doe",
      is_default: true,
    },
    {
      id: "pm_002",
      type: "card",
      brand: "mastercard",
      last4: "5555",
      exp_month: 8,
      exp_year: 2026,
      name: "John Doe",
      is_default: false,
    },
  ]

  const getBrandIcon = (brand: string) => {
    // In a real app, you'd use actual brand icons
    return <CreditCard className="w-6 h-6" />
  }

  const getBrandName = (brand: string) => {
    switch (brand) {
      case "visa":
        return "Visa"
      case "mastercard":
        return "Mastercard"
      case "amex":
        return "American Express"
      default:
        return "Card"
    }
  }

  const handleAddCard = () => {
    // In a real app, this would integrate with Stripe
    console.log("Adding card:", newCard)
    setIsAddingCard(false)
    setNewCard({ number: "", expiry: "", cvc: "", name: "" })
  }

  const handleSetDefault = (id: string) => {
    console.log("Setting default payment method:", id)
  }

  const handleDeleteCard = (id: string) => {
    console.log("Deleting payment method:", id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Payment Methods</h3>
          <p className="text-sm text-muted-foreground">Manage your saved payment methods</p>
        </div>
        <Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>Add a new credit or debit card to your account</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <div className="relative">
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={newCard.number}
                    onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                  />
                  <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={newCard.expiry}
                    onChange={(e) => setNewCard({ ...newCard, expiry: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={newCard.cvc}
                    onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardholder-name">Cardholder Name</Label>
                <Input
                  id="cardholder-name"
                  placeholder="John Doe"
                  value={newCard.name}
                  onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddingCard(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCard}>Add Card</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Secure Payment Processing</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your payment information is encrypted and processed securely by Stripe. We never store your full card
                details on our servers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods List */}
      <div className="grid gap-4">
        {paymentMethods.map((method) => (
          <Card key={method.id} className="relative">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-muted rounded-lg">{getBrandIcon(method.brand)}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {getBrandName(method.brand)} •••• {method.last4}
                      </span>
                      {method.is_default && (
                        <Badge variant="secondary">
                          <Star className="w-3 h-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Expires {method.exp_month}/{method.exp_year}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{method.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!method.is_default && (
                    <Button variant="outline" size="sm" onClick={() => handleSetDefault(method.id)}>
                      Set as Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCard(method.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {paymentMethods.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No payment methods</h3>
              <p className="text-sm text-muted-foreground mb-4">Add a payment method to manage your subscription</p>
              <Button onClick={() => setIsAddingCard(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>Update your billing address and tax information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billing-name">Full Name</Label>
              <Input id="billing-name" defaultValue="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-email">Email</Label>
              <Input id="billing-email" type="email" defaultValue="john@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing-address">Address</Label>
            <Input id="billing-address" defaultValue="123 Main St" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billing-city">City</Label>
              <Input id="billing-city" defaultValue="San Francisco" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-state">State</Label>
              <Input id="billing-state" defaultValue="CA" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-zip">ZIP Code</Label>
              <Input id="billing-zip" defaultValue="94105" />
            </div>
          </div>
          <div className="pt-4">
            <Button>Update Billing Information</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
