"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Check, Crown, Zap, Users, Video, HardDrive, Wifi, Shield } from "lucide-react"

interface SubscriptionPlansProps {
  currentPlan: string
}

export function SubscriptionPlans({ currentPlan }: SubscriptionPlansProps) {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: "Free",
      description: "Perfect for getting started",
      price: { monthly: 0, annual: 0 },
      icon: Video,
      features: [
        "Up to 3 watch parties per month",
        "Maximum 5 participants per party",
        "1GB video storage",
        "Basic video quality (720p)",
        "Standard chat features",
        "Community support",
      ],
      limits: {
        parties: "3/month",
        participants: "5 max",
        storage: "1GB",
        quality: "720p",
        bandwidth: "10GB/month",
      },
      popular: false,
      color: "border-border",
    },
    {
      name: "Premium",
      description: "Great for regular users",
      price: { monthly: 19.99, annual: 199.99 },
      icon: Crown,
      features: [
        "Unlimited watch parties",
        "Up to 25 participants per party",
        "50GB video storage",
        "HD video quality (1080p)",
        "Advanced chat with reactions",
        "Priority support",
        "Custom party themes",
        "Screen sharing",
      ],
      limits: {
        parties: "Unlimited",
        participants: "25 max",
        storage: "50GB",
        quality: "1080p",
        bandwidth: "500GB/month",
      },
      popular: true,
      color: "border-primary",
    },
    {
      name: "Pro",
      description: "For power users and creators",
      price: { monthly: 49.99, annual: 499.99 },
      icon: Zap,
      features: [
        "Everything in Premium",
        "Up to 100 participants per party",
        "500GB video storage",
        "4K video quality",
        "Advanced analytics",
        "API access",
        "White-label options",
        "Custom integrations",
        "Dedicated support",
      ],
      limits: {
        parties: "Unlimited",
        participants: "100 max",
        storage: "500GB",
        quality: "4K",
        bandwidth: "2TB/month",
      },
      popular: false,
      color: "border-accent-premium",
    },
    {
      name: "Enterprise",
      description: "For organizations and teams",
      price: { monthly: 199.99, annual: 1999.99 },
      icon: Shield,
      features: [
        "Everything in Pro",
        "Unlimited participants",
        "Unlimited storage",
        "Enterprise security",
        "SSO integration",
        "Advanced admin controls",
        "SLA guarantee",
        "24/7 phone support",
        "Custom deployment options",
      ],
      limits: {
        parties: "Unlimited",
        participants: "Unlimited",
        storage: "Unlimited",
        quality: "4K+",
        bandwidth: "Unlimited",
      },
      popular: false,
      color: "border-gradient-to-r from-purple-500 to-pink-500",
    },
  ]

  const getPrice = (plan: (typeof plans)[0]) => {
    if (plan.price.monthly === 0) return "Free"
    const price = isAnnual ? plan.price.annual : plan.price.monthly
    const period = isAnnual ? "year" : "month"
    return `$${price}/${period}`
  }

  const getSavings = (plan: (typeof plans)[0]) => {
    if (plan.price.monthly === 0) return null
    const monthlyCost = plan.price.monthly * 12
    const savings = monthlyCost - plan.price.annual
    const percentage = Math.round((savings / monthlyCost) * 100)
    return { amount: savings, percentage }
  }

  return (
    <div className="space-y-6">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center space-x-4">
        <Label htmlFor="billing-toggle" className={!isAnnual ? "font-medium" : ""}>
          Monthly
        </Label>
        <Switch id="billing-toggle" checked={isAnnual} onCheckedChange={setIsAnnual} />
        <Label htmlFor="billing-toggle" className={isAnnual ? "font-medium" : ""}>
          Annual
        </Label>
        {isAnnual && (
          <Badge variant="secondary" className="ml-2">
            Save up to 17%
          </Badge>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const isCurrentPlan = plan.name === currentPlan
          const savings = getSavings(plan)

          return (
            <Card key={plan.name} className={`relative ${plan.color} ${plan.popular ? "ring-2 ring-primary" : ""}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <plan.icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-4">
                  <div className="text-3xl font-bold">{getPrice(plan)}</div>
                  {savings && isAnnual && (
                    <div className="text-sm text-green-600 font-medium">
                      Save ${savings.amount} ({savings.percentage}%)
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Usage Limits */}
                <div className="pt-4 border-t space-y-2">
                  <h4 className="font-medium text-sm">Usage Limits</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{plan.limits.participants}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <HardDrive className="w-3 h-3" />
                      <span>{plan.limits.storage}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Video className="w-3 h-3" />
                      <span>{plan.limits.quality}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Wifi className="w-3 h-3" />
                      <span>{plan.limits.bandwidth}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {isCurrentPlan ? (
                    <Button variant="outline" className="w-full bg-transparent" disabled>
                      Current Plan
                    </Button>
                  ) : plan.name === "Free" ? (
                    <Button variant="outline" className="w-full bg-transparent">
                      Downgrade to Free
                    </Button>
                  ) : (
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      {plan.name === "Enterprise" ? "Contact Sales" : `Upgrade to ${plan.name}`}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>Compare all features across different plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.name} className="text-center py-2 min-w-[100px]">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b">
                  <td className="py-2 font-medium">Watch Parties</td>
                  <td className="text-center py-2">3/month</td>
                  <td className="text-center py-2">Unlimited</td>
                  <td className="text-center py-2">Unlimited</td>
                  <td className="text-center py-2">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Max Participants</td>
                  <td className="text-center py-2">5</td>
                  <td className="text-center py-2">25</td>
                  <td className="text-center py-2">100</td>
                  <td className="text-center py-2">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Video Storage</td>
                  <td className="text-center py-2">1GB</td>
                  <td className="text-center py-2">50GB</td>
                  <td className="text-center py-2">500GB</td>
                  <td className="text-center py-2">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Video Quality</td>
                  <td className="text-center py-2">720p</td>
                  <td className="text-center py-2">1080p</td>
                  <td className="text-center py-2">4K</td>
                  <td className="text-center py-2">4K+</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">API Access</td>
                  <td className="text-center py-2">❌</td>
                  <td className="text-center py-2">❌</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">Priority Support</td>
                  <td className="text-center py-2">❌</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">✅</td>
                  <td className="text-center py-2">24/7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
