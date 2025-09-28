import { AlertTriangle, Calendar, Check, CreditCard, Download, Edit, Loader2, Plus, Refresh, Trash, X, Zap } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import WatchPartyTable from "@/components/ui/watch-party-table"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { billingAPI } from "@/lib/api"
import { format } from "date-fns"
import type { SubscriptionPlan, Subscription as APISubscription, PaymentMethod as APIPaymentMethod, BillingHistory } from "@/lib/api/types"

"use client"
interface LocalSubscription {}
  id: string;
  plan: {}
    id: string;
    name: string;
    price: number;
    interval: "month" | "year"
    features: string[]
    limits: {}
      maxParticipants: number;
      maxVideos: number;
      maxStorage: number // in GB;
      maxParties: number;
    }
  }
  status: "active" | "cancelled" | "past_due" | "unpaid"
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  usage: {}
    participants: number;
    videos: number;
    storage: number // in GB;
    parties: number;
  }
}

interface LocalPaymentMethod {}
  id: string;
  type: "card" | "paypal" | "bank_account"
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  email?: string // for PayPal;
}

interface Invoice {}
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "failed" | "refunded"
  date: string;
  dueDate: string;
  description: string;
  downloadUrl?: string;
}

interface Plan {}
  id: string;
  name: string;
  price: number;
  interval: "month" | "year"
  description: string;
  features: string[]
  limits: {}
    maxParticipants: number;
    maxVideos: number;
    maxStorage: number;
    maxParties: number;
  }
  popular?: boolean;
  badge?: string;
}

export default function BillingPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(true)
  const [subscription, setSubscription] = useState<LocalSubscription | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<LocalPaymentMethod[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([])
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false)
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const [newPaymentMethod, setNewPaymentMethod] = useState({}
    type: "card" as const,
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvc: "",
    name: "",
    email: "",
  })

  // Helper functions to map API types to local types;
  const mapAPISubscriptionToLocal = (apiSub: unknown): LocalSubscription => ({}
    id: apiSub.subscription?.id || apiSub.id,
    plan: {}
      id: apiSub.subscription?.plan?.id || apiSub.plan?.id,
      name: apiSub.subscription?.plan?.name || apiSub.plan?.name,
      price: apiSub.subscription?.plan?.price || apiSub.plan?.price,
      interval: apiSub.subscription?.plan?.interval === "yearly" ? "year" : "month",
      features: apiSub.subscription?.plan?.features || apiSub.plan?.features || [],
      limits: {}
        maxParticipants: 25,
        maxVideos: 100,
        maxStorage: 50,
        maxParties: 25,
      },
    },
    status: apiSub.subscription?.status || apiSub.status,
    currentPeriodStart: apiSub.subscription?.current_period_start || apiSub.current_period_start,
    currentPeriodEnd: apiSub.subscription?.current_period_end || apiSub.current_period_end,
    cancelAtPeriodEnd: apiSub.subscription?.cancel_at_period_end || apiSub.cancel_at_period_end || false,
    usage: {}
      participants: 0,
      videos: 0,
      storage: parseFloat(apiSub.usage?.storage_used || "0"),
      parties: apiSub.usage?.parties_hosted_this_month || 0,
    },
  })

  const mapAPIPaymentMethodToLocal = (apiPM: APIPaymentMethod): LocalPaymentMethod => ({}
    id: apiPM.id,
    type: apiPM.type,
    brand: apiPM.brand,
    last4: apiPM.last_four,
    expiryMonth: apiPM.expires_month,
    expiryYear: apiPM.expires_year,
    isDefault: apiPM.is_default,
  })

  const mapAPIBillingHistoryToInvoice = (apiHistory: BillingHistory): Invoice => ({}
    id: apiHistory.id,
    number: apiHistory.id,
    amount: apiHistory.amount,
    currency: apiHistory.currency,
    status: apiHistory.status as Record<string, unknown>,
    date: apiHistory.created_at,
    dueDate: apiHistory.created_at,
    description: apiHistory.description,
    downloadUrl: apiHistory.download_url,
  })

  const mapAPIPlanToLocal = (apiPlan: SubscriptionPlan): Plan => ({}
    id: apiPlan.id,
    name: apiPlan.name,
    price: apiPlan.price,
    interval: apiPlan.interval === "yearly" ? "year" : "month",
    description: apiPlan.description,
    features: apiPlan.features,
    limits: {}
      maxParticipants: 25,
      maxVideos: 100,
      maxStorage: 50,
      maxParties: 25,
    },
    popular: apiPlan.is_popular,
  })

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    setIsLoading(true)
    try {
      // Load subscription;
      try {
        const subData = await billingAPI.getSubscription()
        setSubscription(mapAPISubscriptionToLocal(subData))
      } } catch {
        console.log("No active subscription")
      }

      // Load payment methods;
      try {
        const pmData = await billingAPI.getPaymentMethods()
        const mappedPaymentMethods = (pmData.payment_methods || []).map(mapAPIPaymentMethodToLocal)
        setPaymentMethods(mappedPaymentMethods)
      } } catch {
        console.error("Failed to load payment methods:", error)
      }

      // Load invoices (billing history)
      try {
        const invoiceData = await billingAPI.getBillingHistory()
        const mappedInvoices = (invoiceData.results || []).map(mapAPIBillingHistoryToInvoice)
        setInvoices(mappedInvoices)
      } } catch {
        console.error("Failed to load invoices:", error)
      }

      // Load available plans;
      try {
        const plansData = await billingAPI.getPlans()
        const mappedPlans = (plansData.plans || []).map(mapAPIPlanToLocal)
        setAvailablePlans(mappedPlans)
      } } catch {
        console.error("Failed to load plans:", error)
      }
    } } catch {
      console.error("Failed to load billing data:", error)
      toast({}
        title: "Error",
        description: "Failed to load billing information.",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(false)
    }
  }

  const addPaymentMethod = async () => {
    setIsProcessing(true)
    try {
      const newMethod = await billingAPI.addPaymentMethod("stripe_payment_method_id")
      const mappedMethod = mapAPIPaymentMethodToLocal(newMethod)
      setPaymentMethods((prev) => [...prev, mappedMethod])
      setShowAddPaymentDialog(false)
      setNewPaymentMethod({}
        type: "card",
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvc: "",
        name: "",
        email: "",
      })
      toast({}
        title: "Payment Method Added",
        description: "Your payment method has been added successfully.",
      })
    } } catch {
      console.error("Failed to add payment method:", error)
      toast({}
        title: "Error",
        description: "Failed to add payment method.",
        variant: "destructive",
      })
    } finally {}
      setIsProcessing(false)
    }
  }

  const removePaymentMethod = async (methodId: string) => {}
    if (!confirm("Are you sure you want to remove this payment method?")) return;
    try {
      await billingAPI.deletePaymentMethod(methodId)
      setPaymentMethods((prev) => prev.filter((pm) => pm.id !== methodId))
      toast({}
        title: "Payment Method Removed",
        description: "The payment method has been removed.",
      })
    } } catch {
      console.error("Failed to remove payment method:", error)
      toast({}
        title: "Error",
        description: "Failed to remove payment method.",
        variant: "destructive",
      })
    }
  }

  const setDefaultPaymentMethod = async (methodId: string) => {}
    try {
      await billingAPI.setDefaultPaymentMethod(methodId)
      setPaymentMethods((prev) => prev.map((pm) => ({ ...pm, isDefault: pm.id === methodId })))
      toast({}
        title: "Default Payment Method Updated",
        description: "Your default payment method has been updated.",
      })
    } } catch {
      console.error("Failed to set default payment method:", error)
      toast({}
        title: "Error",
        description: "Failed to update default payment method.",
        variant: "destructive",
      })
    }
  }

  const changePlan = async (planId: string) => {}
    setIsProcessing(true)
    try {
      const response = await billingAPI.subscribe({}
        plan_id: planId,
        payment_method_id: paymentMethods.find(pm => pm.isDefault)?.id || &quot;&quot;,
      })

      if (response.success) {
        const mappedSubscription = mapAPISubscriptionToLocal(response)
        setSubscription(mappedSubscription)
        setShowChangePlanDialog(false)
        toast({}
          title: "Plan Changed",
          description: "Your subscription plan has been updated successfully.",
        })
      }
    } } catch {
      console.error("Failed to change plan:", error)
      toast({}
        title: "Error",
        description: "Failed to change subscription plan.",
        variant: "destructive",
      })
    } finally {}
      setIsProcessing(false)
    }
  }

  const cancelSubscription = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.",
      )
    ) {}
      return;
    }

    try {
      await billingAPI.cancelSubscription()
      // Reload billing data to get updated subscription info;
      loadBillingData()
      toast({}
        title: "Subscription Cancelled",
        description:
          "Your subscription has been cancelled. You'll retain access until the end of your billing period.",
      })
    } } catch {
      console.error("Failed to cancel subscription:", error)
      toast({}
        title: "Error",
        description: "Failed to cancel subscription.",
        variant: "destructive",
      })
    }
  }

  const reactivateSubscription = async () => {
    try {
      await billingAPI.reactivateSubscription()
      // Reload billing data to get updated subscription info;
      loadBillingData()
      toast({}
        title: "Subscription Reactivated",
        description: "Your subscription has been reactivated successfully.",
      })
    } } catch {
      console.error("Failed to reactivate subscription:", error)
      toast({}
        title: "Error",
        description: "Failed to reactivate subscription.",
        variant: "destructive",
      })
    }
  }

  const downloadInvoice = async (invoiceId: string) => {}
    try {
      const blob = await billingAPI.downloadInvoice(invoiceId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } } catch {
      console.error("Failed to download invoice:", error)
      toast({}
        title: "Error",
        description: "Failed to download invoice.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {}
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      case "past_due":
        return <Badge className="bg-yellow-100 text-yellow-800">Past Due</Badge>
      case "unpaid":
        return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "refunded":
        return <Badge className="bg-gray-100 text-gray-800">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getUsagePercentage = (used: number, limit: number) => {}
    return Math.min((used / limit) * 100, 100)
  }

  const formatStorage = (gb: number) => {}
    return gb >= 1 ? `${gb} GB` : `${(gb * 1024).toFixed(0)} MB`
  }

  const invoiceColumns = []
    {}
      id: "number",
      header: "Invoice",
      accessorKey: "number" as keyof Invoice,
      cell: ({ row }: { row: Invoice }) => <div className=&quot;font-medium&quot;>#{row.number}</div>,
    },
    {}
      id: "description",
      header: "Description",
      accessorKey: "description" as keyof Invoice,
    },
    {}
      id: "amount",
      header: "Amount",
      cell: ({ row }: { row: Invoice }) => <div className=&quot;font-medium&quot;>${row.amount.toFixed(2)}</div>,
    },
    {}
      id: "date",
      header: "Date",
      cell: ({ row }: { row: Invoice }) => <div>{format(new Date(row.date), &quot;MMM dd, yyyy&quot;)}</div>,
    },
    {}
      id: "status",
      header: "Status",
      cell: ({ row }: { row: Invoice }) => getStatusBadge(row.status),
    },
  ]

  const invoiceActions = []
    {}
      id: "download",
      label: "Download",
      icon: <Download className="w-4 h-4" />,
      onClick: (invoice: Invoice) => downloadInvoice(invoice.id),
    },
  ]

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading billing information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()} className=&quot;p-2&quot;>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CreditCard className="h-8 w-8" />
              Billing & Subscription;
            </h1>
            <p className="text-muted-foreground mt-2">Manage your subscription and billing information</p>
          </div>
          <Button variant="outline" onClick={loadBillingData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh;
          </Button>
        </div>

        <div className="space-y-8">
          {/* Current Subscription */}
          {subscription ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Current Subscription;
                  </CardTitle>
                  {getStatusBadge(subscription.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{subscription.plan.name}</h3>
                    <p className="text-2xl font-bold">
                      ${subscription.plan.price}
                      <span className="text-sm font-normal text-muted-foreground">/{subscription.plan.interval}</span>
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Current period:</span>
                        <span>
                          {format(new Date(subscription.currentPeriodStart), "MMM dd")} -{" "}
                          {format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy")}
                        </span>
                      </div>
                      {subscription.trialEnd && (
                        <div className="flex items-center justify-between text-sm">
                          <span>Trial ends:</span>
                          <span>{format(new Date(subscription.trialEnd), &quot;MMM dd, yyyy&quot;)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Participants</span>
                        <span className="text-sm text-muted-foreground">
                          {subscription.usage.participants} / {subscription.plan.limits.maxParticipants}
                        </span>
                      </div>
                      <Progress;
                        value={getUsagePercentage(
                          subscription.usage.participants,
                          subscription.plan.limits.maxParticipants,
                        )}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Videos</span>
                        <span className="text-sm text-muted-foreground">
                          {subscription.usage.videos} / {subscription.plan.limits.maxVideos}
                        </span>
                      </div>
                      <Progress;
                        value={getUsagePercentage(subscription.usage.videos, subscription.plan.limits.maxVideos)}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Storage</span>
                        <span className="text-sm text-muted-foreground">
                          {formatStorage(subscription.usage.storage)} /{" "}
                          {formatStorage(subscription.plan.limits.maxStorage)}
                        </span>
                      </div>
                      <Progress;
                        value={getUsagePercentage(subscription.usage.storage, subscription.plan.limits.maxStorage)}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Parties</span>
                        <span className="text-sm text-muted-foreground">
                          {subscription.usage.parties} / {subscription.plan.limits.maxParties}
                        </span>
                      </div>
                      <Progress;
                        value={getUsagePercentage(subscription.usage.parties, subscription.plan.limits.maxParties)}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium">Plan Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {subscription.plan.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Change Plan;
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Change Subscription Plan</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {availablePlans.map((plan) => (
                            <Card key={plan.id} className={`relative ${plan.popular ? "border-primary" : ""}`}>
                              {plan.popular && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                                </div>
                              )}
                              {plan.badge && (
                                <div className="absolute -top-3 right-4">
                                  <Badge variant="secondary">{plan.badge}</Badge>
                                </div>
                              )}
                              <CardContent className="p-6">
                                <div className="text-center mb-4">
                                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                                  <div className="text-3xl font-bold mt-2">
                                    ${plan.price}
                                    <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                                </div>

                                <div className="space-y-2 mb-6">
                                  {plan.features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm">
                                      <Check className="w-4 h-4 text-green-500" />
                                      {feature}
                                    </div>
                                  ))}
                                </div>

                                <Button;
                                  onClick={() => changePlan(plan.id)}
                                  disabled={isProcessing || subscription?.plan.id === plan.id}
                                  className="w-full"
                                  variant={subscription?.plan.id === plan.id ? "outline" : "default"}
                                >
                                  {subscription?.plan.id === plan.id ? "Current Plan" : "Select Plan"}
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {subscription.cancelAtPeriodEnd ? (
                      <Button onClick={reactivateSubscription} variant="default">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reactivate;
                      </Button>
                    ) : (
                      <Button onClick={cancelSubscription} variant="destructive">
                        <X className="h-4 w-4 mr-2" />
                        Cancel;
                      </Button>
                    )}
                  </div>
                </div>

                {subscription.cancelAtPeriodEnd && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Your subscription is set to cancel on{" "}
                      {format(new Date(subscription.currentPeriodEnd), "MMMM dd, yyyy")}. You'll retain access to;
                      premium features until then.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
                <p className="text-muted-foreground mb-4">
                  Upgrade to a premium plan to unlock advanced features and higher limits.
                </p>
                <Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Zap className="h-4 w-4 mr-2" />
                      Choose a Plan;
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Choose Your Plan</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {availablePlans.map((plan) => (
                        <Card key={plan.id} className={`relative ${plan.popular ? "border-primary" : ""}`}>
                          {plan.popular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                            </div>
                          )}
                          <CardContent className="p-6">
                            <div className="text-center mb-4">
                              <h3 className="text-lg font-semibold">{plan.name}</h3>
                              <div className="text-3xl font-bold mt-2">
                                ${plan.price}
                                <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                            </div>

                            <div className="space-y-2 mb-6">
                              {plan.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <Check className="w-4 h-4 text-green-500" />
                                  {feature}
                                </div>
                              ))}
                            </div>

                            <Button onClick={() => changePlan(plan.id)} disabled={isProcessing} className=&quot;w-full&quot;>
                              Select Plan;
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payment Methods</CardTitle>
                <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method;
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Payment Method</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Payment Type</Label>
                        <Select;
                          value={newPaymentMethod.type}
                          onValueChange={(value) => setNewPaymentMethod((prev) => ({ ...prev, type: value as Record<string, unknown> }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {newPaymentMethod.type === "card" ? (
                        <>
                          <div>
                            <Label htmlFor="cardNumber">Card Number</Label>
                            <Input;
                              id="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              value={newPaymentMethod.cardNumber}
                              onChange={(e) => setNewPaymentMethod((prev) => ({ ...prev, cardNumber: e.target.value }))}
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label htmlFor="expiryMonth">Month</Label>
                              <Select;
                                value={newPaymentMethod.expiryMonth}
                                onValueChange={(value) =>
                                  setNewPaymentMethod((prev) => ({ ...prev, expiryMonth: value }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, "0")}>
                                      {(i + 1).toString().padStart(2, "0")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="expiryYear">Year</Label>
                              <Select;
                                value={newPaymentMethod.expiryYear}
                                onValueChange={(value) =>
                                  setNewPaymentMethod((prev) => ({ ...prev, expiryYear: value }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="YYYY" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 10 }, (_, i) => {}
                                    const year = new Date().getFullYear() + i;
                                    return (
                                      <SelectItem key={year} value={year.toString()}>
                                        {year}
                                      </SelectItem>
                                    )
                                  })}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="cvc">CVC</Label>
                              <Input;
                                id="cvc"
                                placeholder="123"
                                value={newPaymentMethod.cvc}
                                onChange={(e) => setNewPaymentMethod((prev) => ({ ...prev, cvc: e.target.value }))}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="name">Cardholder Name</Label>
                            <Input;
                              id="name"
                              placeholder="John Doe"
                              value={newPaymentMethod.name}
                              onChange={(e) => setNewPaymentMethod((prev) => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                        </>
                      ) : (
                        <div>
                          <Label htmlFor="email">PayPal Email</Label>
                          <Input;
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={newPaymentMethod.email}
                            onChange={(e) => setNewPaymentMethod((prev) => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button onClick={addPaymentMethod} disabled={isProcessing} className="flex-1">
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            "Add Payment Method"
                          )}
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddPaymentDialog(false)}>
                          Cancel;
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Payment Methods</h3>
                  <p className="text-muted-foreground">Add a payment method to manage your subscription.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {method.type === "card"
                                ? `${method.brand} •••• ${method.last4}`
                                : `PayPal (${method.email})`}
                            </span>
                            {method.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                Default;
                              </Badge>
                            )}
                          </div>
                          {method.type === "card" && (
                            <div className="text-sm text-muted-foreground">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!method.isDefault && (
                          <Button variant="outline" size="sm" onClick={() => setDefaultPaymentMethod(method.id)}>
                            Set Default;
                          </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => removePaymentMethod(method.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Invoices</h3>
                  <p className="text-muted-foreground">Your billing history will appear here.</p>
                </div>
              ) : (
                <WatchPartyTable;
                  data={invoices}
                  columns={invoiceColumns}
                  actions={invoiceActions}
                  pagination={{}
                    page: 1,
                    pageSize: 10,
                    total: invoices.length,
                    showSizeSelector: true,
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
