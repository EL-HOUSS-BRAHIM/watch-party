import { Check, Clock, Play, Refresh, Star, TrendingDown, TrendingUp, X, Zap } from "lucide-react"
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

'use client'
interface BillingPlan {}
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly'
  features: string[]
  popular?: boolean;
  description: string;
}

interface Subscription {}
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'paused' | 'trial'
  currentPlan: BillingPlan;
  nextBillingDate: string;
  cancelAtPeriodEnd: boolean;
  pausedUntil?: string;
  trialEndsAt?: string;
  usage: {}
    partiesHosted: number;
    storageUsed: number;
    bandwidthUsed: number;
    maxParties: number;
    maxStorage: number;
    maxBandwidth: number;
  }
}

interface SubscriptionManagerProps {}
  subscription: Subscription;
  availablePlans: BillingPlan[]
  onSubscriptionChange?: () => void;
}

export function SubscriptionManager({}
  subscription, 
  availablePlans, 
  onSubscriptionChange;
}: SubscriptionManagerProps) {}
  const [loading, setLoading] = useState(false)
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [showDowngradeDialog, setShowDowngradeDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null)
  const [confirmationStep, setConfirmationStep] = useState(false)

  const currentPlan = subscription.currentPlan;
  const isTrialing = subscription.status === 'trial'
  const isCanceled = subscription.status === 'canceled' || subscription.cancelAtPeriodEnd;
  const isPaused = subscription.status === 'paused'
  const isPastDue = subscription.status === 'past_due'

  const getUpgradePlans = () => {}
    return availablePlans.filter(plan => 
      plan.price > currentPlan.price && plan.interval === currentPlan.interval;
    )
  }

  const getDowngradePlans = () => {}
    return availablePlans.filter(plan => 
      plan.price < currentPlan.price && plan.interval === currentPlan.interval;
    )
  }

  const handleUpgrade = async (newPlan: BillingPlan) => {}
    try {
      setLoading(true)
      const response = await fetch('/api/billing/subscription/upgrade', {}
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}
          subscriptionId: subscription.id,
          newPlanId: newPlan.id;
        })
      })

      if (response.ok) {
        onSubscriptionChange?.()
        setShowUpgradeDialog(false)
        setConfirmationStep(false)
      }
    } } catch {
      console.error('Failed to upgrade subscription:', error)
    } finally {}
      setLoading(false)
    }
  }

  const handleDowngrade = async (newPlan: BillingPlan) => {}
    try {
      setLoading(true)
      const response = await fetch('/api/billing/subscription/downgrade', {}
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}
          subscriptionId: subscription.id,
          newPlanId: newPlan.id;
        })
      })

      if (response.ok) {
        onSubscriptionChange?.()
        setShowDowngradeDialog(false)
        setConfirmationStep(false)
      }
    } } catch {
      console.error('Failed to downgrade subscription:', error)
    } finally {}
      setLoading(false)
    }
  }

  const handleResume = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/billing/subscription/resume', {}
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id })
      })

      if (response.ok) {
        onSubscriptionChange?.()
      }
    } } catch {
      console.error('Failed to resume subscription:', error)
    } finally {}
      setLoading(false)
    }
  }

  const handlePause = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/billing/subscription/pause', {}
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id })
      })

      if (response.ok) {
        onSubscriptionChange?.()
      }
    } } catch {
      console.error('Failed to pause subscription:', error)
    } finally {}
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/billing/subscription/cancel', {}
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id })
      })

      if (response.ok) {
        onSubscriptionChange?.()
      }
    } } catch {
      console.error('Failed to cancel subscription:', error)
    } finally {}
      setLoading(false)
    }
  }

  const getStatusBadge = () => {}
    switch (subscription.status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>
      case 'trial':
        return <Badge className="bg-blue-500">Trial</Badge>
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>
      default:
        return <Badge variant="outline">{subscription.status}</Badge>
    }
  }

  const getUsagePercentage = (used: number, max: number) => {}
    return Math.min((used / max) * 100, 100)
  }

  const PlanCard = ({ plan, isUpgrade = false }: { plan: BillingPlan; isUpgrade?: boolean }) => (
    <Card className={`cursor-pointer transition-all ${selectedPlan?.id === plan.id ? 'ring-2 ring-primary' : ''}`} />
          onClick={() => setSelectedPlan(plan)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span>{plan.name}</span>
            {plan.popular && <Star className="h-4 w-4 text-yellow-500" />}
          </CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold">${plan.price}</div>
            <div className="text-sm text-muted-foreground">/{plan.interval}</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <Check className="h-3 w-3 text-green-500" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
        {isUpgrade && (
          <div className="mt-4 p-3 bg-green-50 rounded-md">
            <div className="flex items-center space-x-2 text-sm text-green-800">
              <TrendingUp className="h-4 w-4" />
              <span>Immediate upgrade - prorated billing</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5" />
              <span>Current Subscription</span>
            </CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">{currentPlan.name}</h3>
              <p className="text-sm text-muted-foreground">{currentPlan.description}</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold">${currentPlan.price}</div>
              <div className="text-sm text-muted-foreground">/{currentPlan.interval}</div>
            </div>
          </div>

          {/* Status-specific alerts */}
          {isTrialing && subscription.trialEndsAt && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your trial ends on {new Date(subscription.trialEndsAt).toLocaleDateString()}. 
                Choose a plan to continue enjoying all features.
              </AlertDescription>
            </Alert>
          )}

          {isCanceled && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your subscription will end on {new Date(subscription.nextBillingDate).toLocaleDateString()}.
                You can resume your subscription anytime before then.
              </AlertDescription>
            </Alert>
          )}

          {isPastDue && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your payment is past due. Please update your payment method to avoid service interruption.
              </AlertDescription>
            </Alert>
          )}

          {isPaused && subscription.pausedUntil && (
            <Alert>
              <Pause className="h-4 w-4" />
              <AlertDescription>
                Your subscription is paused until {new Date(subscription.pausedUntil).toLocaleDateString()}.
              </AlertDescription>
            </Alert>
          )}

          {/* Usage metrics */}
          <div className="space-y-3">
            <h4 className="font-medium">Usage This Period</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Parties Hosted</span>
                <span>{subscription.usage.partiesHosted} / {subscription.usage.maxParties}</span>
              </div>
              <Progress value={getUsagePercentage(subscription.usage.partiesHosted, subscription.usage.maxParties)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Storage Used</span>
                <span>{subscription.usage.storageUsed}GB / {subscription.usage.maxStorage}GB</span>
              </div>
              <Progress value={getUsagePercentage(subscription.usage.storageUsed, subscription.usage.maxStorage)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Bandwidth Used</span>
                <span>{subscription.usage.bandwidthUsed}GB / {subscription.usage.maxBandwidth}GB</span>
              </div>
              <Progress value={getUsagePercentage(subscription.usage.bandwidthUsed, subscription.usage.maxBandwidth)} />
            </div>
          </div>

          <Separator />

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {!isCanceled && !isPaused && getUpgradePlans().length > 0 && (
              <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Upgrade;
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Upgrade Your Plan</DialogTitle>
                  </DialogHeader>
                  {!confirmationStep ? (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Choose a higher plan to unlock more features and increase your limits.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getUpgradePlans().map((plan) => (
                          <PlanCard key={plan.id} plan={plan} isUpgrade />
                        ))}
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
                          Cancel;
                        </Button>
                        <Button;
                          onClick={() => setConfirmationStep(true)}
                          disabled={!selectedPlan}
                        >
                          Continue;
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Alert>
                        <Zap className="h-4 w-4" />
                        <AlertDescription>
                          You'll be upgraded to <strong>{selectedPlan?.name}</strong> immediately.
                          Your next billing will be prorated for the remaining period.
                        </AlertDescription>
                      </Alert>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setConfirmationStep(false)}>
                          Back;
                        </Button>
                        <Button;
                          onClick={() => selectedPlan && handleUpgrade(selectedPlan)}
                          disabled={loading}
                        >
                          {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                          Confirm Upgrade;
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            )}

            {!isCanceled && !isPaused && getDowngradePlans().length > 0 && (
              <Dialog open={showDowngradeDialog} onOpenChange={setShowDowngradeDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <TrendingDown className="h-4 w-4 mr-2" />
                    Downgrade;
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Downgrade Your Plan</DialogTitle>
                  </DialogHeader>
                  {!confirmationStep ? (
                    <div className="space-y-4">
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Downgrading will reduce your limits. Make sure your current usage fits within the new plan limits.
                        </AlertDescription>
                      </Alert>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getDowngradePlans().map((plan) => (
                          <PlanCard key={plan.id} plan={plan} />
                        ))}
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setShowDowngradeDialog(false)}>
                          Cancel;
                        </Button>
                        <Button;
                          onClick={() => setConfirmationStep(true)}
                          disabled={!selectedPlan}
                          variant="outline"
                        >
                          Continue;
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          You'll be downgraded to <strong>{selectedPlan?.name}</strong> at the end of your current billing period.
                          Your features will be limited starting then.
                        </AlertDescription>
                      </Alert>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setConfirmationStep(false)}>
                          Back;
                        </Button>
                        <Button;
                          onClick={() => selectedPlan && handleDowngrade(selectedPlan)}
                          disabled={loading}
                          variant="destructive"
                        >
                          {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                          Confirm Downgrade;
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            )}

            {isCanceled && (
              <Button onClick={handleResume} disabled={loading}>
                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Play className=&quot;h-4 w-4 mr-2&quot; />}
                Resume Subscription;
              </Button>
            )}

            {!isCanceled && !isPaused && (
              <Button variant="outline" onClick={handlePause} disabled={loading}>
                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Pause className=&quot;h-4 w-4 mr-2&quot; />}
                Pause Subscription;
              </Button>
            )}

            {isPaused && (
              <Button onClick={handleResume} disabled={loading}>
                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Play className=&quot;h-4 w-4 mr-2&quot; />}
                Resume Subscription;
              </Button>
            )}

            {!isCanceled && !isPaused && (
              <Button variant="destructive" onClick={handleCancel} disabled={loading}>
                {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <X className=&quot;h-4 w-4 mr-2&quot; />}
                Cancel Subscription;
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
