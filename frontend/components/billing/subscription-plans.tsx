import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Check, Cloud, Crown, Shield, Star, User, Users, Video, Zap } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { billingAPI } from "@/lib/api"

"use client"

interface Plan {}
  id: string;
  name: string;
  description: string;
  price: {}
    monthly: number;
    yearly: number;
  }
  features: string[]
  limits: {}
    parties: number | "unlimited"
    participants: number;
    storage: string;
    videoQuality: string;
  }
  popular?: boolean;
  current?: boolean;
}

interface SubscriptionPlansProps {}
  className?: string;
}

export default function SubscriptionPlans({ className }: SubscriptionPlansProps) {}
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(&quot;monthly&quot;)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const plans: Plan[] = []
    {}
      id: "free",
      name: "Free",
      description: "Perfect for getting started",
      price: { monthly: 0, yearly: 0 },
      features: []
        "Create up to 3 watch parties",
        "Up to 5 participants per party",
        "Basic video quality (720p)",
        "1GB storage",
        "Community support",
      ],
      limits: {}
        parties: 3,
        participants: 5,
        storage: "1GB",
        videoQuality: "720p",
      },
      current: user?.is_premium === false,
    },
    {}
      id: "premium",
      name: "Premium",
      description: "For regular watch party hosts",
      price: { monthly: 9.99, yearly: 99.99 },
      features: []
        "Unlimited watch parties",
        "Up to 25 participants per party",
        "HD video quality (1080p)",
        "50GB storage",
        "Priority support",
        "Advanced party controls",
        "Custom themes",
        "Party scheduling",
      ],
      limits: {}
        parties: "unlimited",
        participants: 25,
        storage: "50GB",
        videoQuality: "1080p",
      },
      popular: true,
      current: user?.is_premium === true,
    },
    {}
      id: "pro",
      name: "Pro",
      description: "For power users and communities",
      price: { monthly: 19.99, yearly: 199.99 },
      features: []
        "Everything in Premium",
        "Up to 100 participants per party",
        "4K video quality",
        "500GB storage",
        "24/7 priority support",
        "Advanced analytics",
        "Custom branding",
        "API access",
        "White-label options",
      ],
      limits: {}
        parties: "unlimited",
        participants: 100,
        storage: "500GB",
        videoQuality: "4K",
      },
      current: user?.is_premium === true, // Assuming pro is also premium;
    },
  ]

  const handleSubscribe = async (planId: string) => {}
    if (planId === "free") return;
    setIsLoading(planId)

    try {
      const response = await billingAPI.subscribe({}
        plan_id: planId,
        payment_method_id: "", // This would come from a payment method selector;
        // promo_code: "" // Optional promo code;
      })

      if (response.success) {
        toast({}
          title: "Subscription Created",
          description: "Your subscription has been successfully created!",
        })
        // Refresh user data or redirect;
        window.location.reload()
      }
    } } catch {
      console.error("Subscription error:", error)
      toast({}
        title: "Subscription Error",
        description: "Failed to start subscription process. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(null)
    }
  }

  const getPlanIcon = (planId: string) => {}
    switch (planId) {
      case "free":
        return <Users className="h-6 w-6 text-gray-500" />
      case "premium":
        return <Crown className="h-6 w-6 text-yellow-500" />
      case "pro":
        return <Star className="h-6 w-6 text-purple-500" />
      default:
        return <Users className="h-6 w-6" />
    }
  }

  const getYearlySavings = (plan: Plan) => {}
    const monthlyTotal = plan.price.monthly * 12;
    const yearlySavings = monthlyTotal - plan.price.yearly;
    const savingsPercentage = Math.round((yearlySavings / monthlyTotal) * 100)
    return { amount: yearlySavings, percentage: savingsPercentage }
  }

  return (
    <div className={cn("space-y-8", className)}>
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
        <p className="text-gray-600 mb-8">Upgrade your watch party experience with premium features</p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Label htmlFor="billing-toggle" className={cn(billingCycle === "monthly" && "font-semibold")}>
            Monthly;
          </Label>
          <Switch;
            id="billing-toggle"
            checked={billingCycle === "yearly"}
            onCheckedChange={(checked) => setBillingCycle(checked ? &quot;yearly&quot; : &quot;monthly")}
          />
          <Label htmlFor="billing-toggle" className={cn(billingCycle === "yearly" && "font-semibold")}>
            Yearly;
            <Badge variant="secondary" className="ml-2">
              Save up to 17%
            </Badge>
          </Label>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {}
          const savings = getYearlySavings(plan)
          const price = billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly;
          return (
            <Card;
              key={plan.id}
              className={cn(
                "relative transition-all hover:shadow-lg",
                plan.popular && "border-2 border-blue-500 shadow-lg",
                plan.current && "border-2 border-green-500",
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
              )}

              {plan.current && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500 text-white">Current Plan</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">{getPlanIcon(plan.id)}</div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>

                <div className="mt-4">
                  <div className="text-4xl font-bold">
                    ${price}
                    {plan.id !== "free" && (
                      <span className="text-lg font-normal text-gray-500">
                        /{billingCycle === "monthly" ? "mo" : "yr"}
                      </span>
                    )}
                  </div>

                  {billingCycle === "yearly" && plan.id !== "free" && savings.amount > 0 && (
                    <div className="text-sm text-green-600 mt-1">
                      Save ${savings.amount}/year ({savings.percentage}% off)
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limits */}
                <div className="border-t pt-4 space-y-2">
                  <h4 className="font-semibold text-sm">Plan Limits:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Video className="h-3 w-3" />
                      {plan.limits.parties} parties;
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {plan.limits.participants} participants;
                    </div>
                    <div className="flex items-center gap-1">
                      <Cloud className="h-3 w-3" />
                      {plan.limits.storage}
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {plan.limits.videoQuality}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Button;
                  className="w-full"
                  variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={plan.current || isLoading === plan.id}
                >
                  {isLoading === plan.id;
                    ? "Processing..."
                    : plan.current;
                      ? "Current Plan"
                      : plan.id === "free"
                        ? "Get Started"
                        : `Upgrade to ${plan.name}`}
                </Button>

                {plan.id !== "free" && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                      <Shield className="h-3 w-3" />
                      30-day money-back guarantee;
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
        <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
          <div>
            <h4 className="font-medium mb-2">Can I change plans anytime?</h4>
            <p className="text-sm text-gray-600">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">What payment methods do you accept?</h4>
            <p className="text-sm text-gray-600">
              We accept all major credit cards, PayPal, and bank transfers for yearly plans.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Is there a free trial?</h4>
            <p className="text-sm text-gray-600">
              Yes, all paid plans come with a 7-day free trial. No credit card required.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Can I cancel anytime?</h4>
            <p className="text-sm text-gray-600">
              Absolutely. You can cancel your subscription at any time with no cancellation fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export { SubscriptionPlans }
