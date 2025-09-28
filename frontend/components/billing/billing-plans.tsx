"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Check, Star, Zap } from "lucide-react"
import { useApi } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"

interface Plan {
  id: string
  name: string
  price: number
  interval: "month" | "year"
  features: string[]
  popular?: boolean
  current?: boolean
}

export function BillingPlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  
  const api = useApi()
  const { toast } = useToast()

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await api.get("/billing/plans/")
      setPlans((response.data as Record<string, unknown>).plans || [])
    } catch {
      console.error("Failed to load plans:", err)
    } finally {
      setIsLoading(false)
    }
  }, [api])

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  const subscribeToPlan = async (planId: string) => {
    setSubscribing(planId)
    try {
      const response = await api.post(`/billing/subscribe/${planId}/`)
      // Handle payment flow here
      toast({
        title: "Subscription initiated",
        description: "Redirecting to payment...",
      })
      // Redirect to payment processor
      window.location.href = (response.data as Record<string, unknown>).checkout_url
    } catch {
      toast({
        title: "Error",
        description: "Failed to start subscription",
        variant: "destructive"
      })
    } finally {
      setSubscribing(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading plans...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <Card 
          key={plan.id}
          className={`relative ${plan.popular ? "ring-2 ring-primary" : ""}`}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">
                <Star className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>
          )}
          
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Crown className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <CardDescription>
              <span className="text-3xl font-bold text-foreground">
                ${plan.price}
              </span>
              <span className="text-muted-foreground">
                /{plan.interval}
              </span>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button
              className="w-full"
              variant={plan.current ? "outline" : "default"}
              disabled={plan.current || subscribing === plan.id}
              onClick={() => subscribeToPlan(plan.id)}
            >
              {plan.current ? (
                "Current Plan"
              ) : subscribing === plan.id ? (
                "Processing..."
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Subscribe
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
