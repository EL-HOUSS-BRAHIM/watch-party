"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Download, Star } from "lucide-react"

export default function BillingPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const currentPlan = user?.subscription?.plan || "free"
  const subscriptionStatus = user?.subscription?.status || "active"

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "Up to 5 participants per party",
        "720p video quality",
        "Basic chat features",
        "2 hour watch sessions",
        "Community support",
      ],
      current: currentPlan === "free",
    },
    {
      name: "Premium",
      price: "$9.99",
      period: "month",
      features: [
        "Unlimited participants",
        "4K video quality",
        "Advanced chat with reactions",
        "Unlimited watch time",
        "Priority support",
        "Custom room themes",
        "Video upload storage",
        "Advanced moderation tools",
      ],
      current: currentPlan === "premium",
      popular: true,
    },
  ]

  const billingHistory = [
    {
      id: 1,
      date: "2024-01-15",
      description: "Premium Plan - Monthly",
      amount: "$9.99",
      status: "paid",
    },
    {
      id: 2,
      date: "2023-12-15",
      description: "Premium Plan - Monthly",
      amount: "$9.99",
      status: "paid",
    },
    {
      id: 3,
      date: "2023-11-15",
      description: "Premium Plan - Monthly",
      amount: "$9.99",
      status: "paid",
    },
  ]

  const handleUpgrade = async (planName: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Plan updated!",
        description: `Successfully upgraded to ${planName} plan.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Subscription cancelled",
        description:
          "Your subscription has been cancelled. You can continue using Premium features until the end of your billing period.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing information.</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-bold text-foreground capitalize">{currentPlan}</h3>
                <Badge variant={subscriptionStatus === "active" ? "default" : "secondary"}>{subscriptionStatus}</Badge>
              </div>
              <p className="text-muted-foreground">
                {currentPlan === "free" ? "You're currently on the free plan" : "Next billing date: February 15, 2024"}
              </p>
            </div>
            {currentPlan === "premium" && (
              <Button variant="outline" onClick={handleCancelSubscription} disabled={isLoading}>
                {isLoading ? "Processing..." : "Cancel Subscription"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? "ring-2 ring-primary" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  {plan.current && <Badge variant="secondary">Current</Badge>}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {!plan.current && (
                  <Button
                    className={`w-full ${plan.popular ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => handleUpgrade(plan.name)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : `Upgrade to ${plan.name}`}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {billingHistory.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No billing history</h3>
              <p className="text-muted-foreground">Your billing history will appear here once you make a purchase.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {billingHistory.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <div className="font-medium text-foreground">{invoice.description}</div>
                    <div className="text-sm text-muted-foreground">{invoice.date}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium text-foreground">{invoice.amount}</div>
                      <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>{invoice.status}</Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-foreground">•••• •••• •••• 4242</div>
                <div className="text-sm text-muted-foreground">Expires 12/25</div>
              </div>
            </div>
            <Button variant="outline">Update</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
