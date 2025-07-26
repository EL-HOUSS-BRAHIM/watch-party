"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SubscriptionPlans } from "@/components/billing/subscription-plans"
import { BillingHistory } from "@/components/billing/billing-history"
import { PaymentMethods } from "@/components/billing/payment-methods"
import { UsageStats } from "@/components/billing/usage-stats"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Crown, TrendingUp, Calendar, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"

interface Subscription {
  id: string
  plan: {
    id: string
    name: string
    price: number
    features: string[]
  }
  status: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
}

interface UsageData {
  storage_used: string
  storage_limit: string
  parties_hosted_this_month: number
  videos_uploaded_this_month: number
}

interface NextPayment {
  amount: number
  date: string
  payment_method: string
}

export default function BillingPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [nextPayment, setNextPayment] = useState<NextPayment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("accessToken")
        
        const response = await fetch("/api/billing/subscription/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setSubscription(data.subscription)
          setUsage(data.usage)
          setNextPayment(data.next_payment)
        } else if (response.status === 404) {
          // User doesn't have a subscription
          setSubscription(null)
        }
      } catch (error) {
        console.error("Failed to fetch billing data:", error)
        toast({
          title: "Error",
          description: "Failed to load billing information.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchBillingData()
  }, [toast])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case "past_due":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Past Due
          </Badge>
        )
      case "canceled":
        return <Badge variant="secondary">Canceled</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your subscription, payment methods, and billing history</p>
        </div>
        <div className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-accent-premium" />
          <span className="font-medium">{subscription?.plan.name || "Free"} Plan</span>
          {subscription && getStatusBadge(subscription.status)}
        </div>
      </div>

      {/* Current Subscription Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <Crown className="w-4 h-4 text-accent-premium" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscription?.plan.name || "Free"}</div>
            <p className="text-xs text-muted-foreground">
              {subscription ? `$${subscription.plan.price}/month` : "No subscription"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nextPayment ? formatDate(nextPayment.date) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {nextPayment ? `$${nextPayment.amount} will be charged` : "No upcoming charges"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage This Month</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usage ? `${usage.parties_hosted_this_month + usage.videos_uploaded_this_month}` : "0"}
            </div>
            <p className="text-xs text-muted-foreground">Activities this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Method</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nextPayment?.payment_method || "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              {nextPayment?.payment_method ? "Active payment method" : "No payment method"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="history">Billing History</TabsTrigger>
          <TabsTrigger value="usage">Usage & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>Your current subscription information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="font-medium">{subscription?.plan.name || "Free"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {subscription ? getStatusBadge(subscription.status) : <Badge variant="outline">No Subscription</Badge>}
                </div>
                {subscription && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Billing Cycle</span>
                      <span className="font-medium">Monthly</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Next Billing</span>
                      <span className="font-medium">{formatDate(subscription.current_period_end)}</span>
                    </div>
                  </>
                )}
                <div className="pt-4 space-y-2">
                  <Button variant="outline" className="w-full bg-transparent">
                    Change Plan
                  </Button>
                  <Button variant="ghost" className="w-full text-destructive">
                    Cancel Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common billing and account actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Update Payment Method
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Usage Analytics
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Download Invoices
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="plans">
          <SubscriptionPlans currentPlan={subscription?.plan.name || "free"} />
        </TabsContent>

        <TabsContent value="payment-methods">
          <PaymentMethods />
        </TabsContent>

        <TabsContent value="history">
          <BillingHistory />
        </TabsContent>

        <TabsContent value="usage">
          <UsageStats />
        </TabsContent>
      </Tabs>
    </div>
  )
}
