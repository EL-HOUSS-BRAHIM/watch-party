"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Zap, Crown, Star } from "lucide-react"

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    billing: "month",
    description: "Perfect for casual watch parties with friends",
    features: [
      "Up to 5 participants per party",
      "HD video quality",
      "Basic chat features",
      "Google Drive integration",
      "Community support"
    ],
    limitations: [
      "No 4K quality",
      "Limited party history",
      "Basic analytics"
    ],
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    popular: false
  },
  {
    id: "premium",
    name: "Premium",
    price: 9.99,
    billing: "month",
    description: "Everything you need for the ultimate watch party experience",
    features: [
      "Unlimited participants",
      "4K Ultra HD quality",
      "Advanced chat with reactions",
      "All video sources (S3, Drive, Direct URLs)",
      "Party recording & highlights",
      "Advanced analytics",
      "Priority support",
      "Custom party themes",
      "Private rooms with passwords",
      "Screen sharing capabilities"
    ],
    limitations: [],
    buttonText: "Upgrade to Premium",
    buttonVariant: "default" as const,
    popular: true
  }
]

interface PlanCardProps {
  currentPlan?: string
  onUpgrade?: (planId: string) => void
  onDowngrade?: () => void
  showComparison?: boolean
}

export function PlanCard({ currentPlan = "free", onUpgrade, onDowngrade, showComparison = true }: PlanCardProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")

  const getDiscountedPrice = (price: number) => {
    return billingCycle === "yearly" ? price * 10 : price // 2 months free
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {showComparison && (
        <div className="md:col-span-2 flex justify-center mb-4">
          <div className="bg-neo-surface p-1 rounded-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                billingCycle === "monthly"
                  ? "bg-primary text-white"
                  : "text-neo-text-secondary hover:text-neo-text-primary"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-md text-sm transition-colors relative ${
                billingCycle === "yearly"
                  ? "bg-primary text-white"
                  : "text-neo-text-secondary hover:text-neo-text-primary"
              }`}
            >
              Yearly
              <Badge className="absolute -top-2 -right-2 bg-premium text-neo-background text-xs">
                Save 17%
              </Badge>
            </button>
          </div>
        </div>
      )}

      {plans.map((plan) => (
        <Card 
          key={plan.id} 
          className={`relative overflow-hidden ${
            plan.popular 
              ? "border-primary shadow-glow" 
              : "border-neo-border"
          } ${
            currentPlan === plan.id 
              ? "ring-2 ring-success ring-opacity-50" 
              : ""
          }`}
        >
          {plan.popular && (
            <div className="absolute top-0 left-0 right-0 bg-gradient-primary text-white text-center py-1 text-xs font-medium">
              <Star className="inline w-3 h-3 mr-1" />
              Most Popular
            </div>
          )}

          <CardHeader className={`text-center ${plan.popular ? "pt-8" : "pt-6"}`}>
            <div className="flex items-center justify-center space-x-2">
              <CardTitle className="text-2xl text-neo-text-primary">{plan.name}</CardTitle>
              {plan.id === "premium" && <Crown className="w-5 h-5 text-premium" />}
              {currentPlan === plan.id && <CheckCircle className="w-5 h-5 text-success" />}
            </div>
            
            <div className="flex items-baseline justify-center space-x-1">
              <span className="text-4xl font-bold text-gradient-primary">
                ${billingCycle === "yearly" ? getDiscountedPrice(plan.price).toFixed(2) : plan.price}
              </span>
              {plan.price > 0 && (
                <span className="text-neo-text-secondary">
                  /{billingCycle === "yearly" ? "year" : "month"}
                </span>
              )}
            </div>

            {billingCycle === "yearly" && plan.price > 0 && (
              <p className="text-sm text-neo-text-secondary">
                ${(plan.price * 12).toFixed(2)} billed annually
              </p>
            )}

            <p className="text-neo-text-secondary mt-2">{plan.description}</p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-sm text-neo-text-primary">{feature}</span>
                </div>
              ))}

              {plan.limitations.length > 0 && (
                <div className="pt-2 border-t border-neo-border">
                  <p className="text-xs text-neo-text-tertiary mb-2">Limitations:</p>
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center space-x-3 opacity-60">
                      <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                        <div className="w-1 h-1 bg-neo-text-tertiary rounded-full"></div>
                      </div>
                      <span className="text-xs text-neo-text-tertiary">{limitation}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4">
              {currentPlan === plan.id ? (
                <div className="space-y-2">
                  <Button disabled className="w-full bg-success text-success-foreground">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Current Plan
                  </Button>
                  {plan.id === "premium" && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-neo-text-secondary"
                      onClick={onDowngrade}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  className={`w-full ${
                    plan.id === "premium" 
                      ? "btn-primary" 
                      : "btn-outline"
                  }`}
                  onClick={() => onUpgrade?.(plan.id)}
                >
                  {plan.id === "premium" && <Zap className="w-4 h-4 mr-2" />}
                  {plan.buttonText}
                </Button>
              )}
            </div>

            {plan.id === "premium" && (
              <div className="text-center">
                <p className="text-xs text-neo-text-tertiary">
                  30-day money-back guarantee
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
