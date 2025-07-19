"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Calendar,
  Percent,
  DollarSign,
  Users,
  Eye,
  EyeOff
} from "lucide-react"

interface Coupon {
  id: string
  code: string
  type: "percentage" | "fixed"
  value: number
  description: string
  usageLimit: number | null
  usedCount: number
  isActive: boolean
  expiresAt: string | null
  createdAt: string
}

const mockCoupons: Coupon[] = [
  {
    id: "1",
    code: "WELCOME50",
    type: "percentage",
    value: 50,
    description: "50% off first month for new users",
    usageLimit: 100,
    usedCount: 23,
    isActive: true,
    expiresAt: "2024-02-29T23:59:59Z",
    createdAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2", 
    code: "STUDENT20",
    type: "percentage",
    value: 20,
    description: "Student discount - 20% off monthly",
    usageLimit: null,
    usedCount: 156,
    isActive: true,
    expiresAt: null,
    createdAt: "2024-01-15T00:00:00Z"
  },
  {
    id: "3",
    code: "SAVE5NOW",
    type: "fixed",
    value: 5,
    description: "$5 off any plan",
    usageLimit: 50,
    usedCount: 50,
    isActive: false,
    expiresAt: "2024-01-31T23:59:59Z",
    createdAt: "2024-01-10T00:00:00Z"
  }
]

export default function AdminCouponsPage() {
  const { toast } = useToast()
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: 0,
    description: "",
    usageLimit: null as number | null,
    expiresAt: ""
  })

  const generateCouponCode = () => {
    const codes = [
      "SAVE", "DEAL", "OFFER", "PROMO", "DISC", "SPECIAL"
    ]
    const numbers = Math.floor(Math.random() * 100)
    const randomCode = codes[Math.floor(Math.random() * codes.length)]
    return `${randomCode}${numbers}`
  }

  const handleCreateCoupon = async () => {
    if (!newCoupon.code || !newCoupon.description || newCoupon.value <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const coupon: Coupon = {
        id: Date.now().toString(),
        ...newCoupon,
        usedCount: 0,
        isActive: true,
        expiresAt: newCoupon.expiresAt || null,
        createdAt: new Date().toISOString()
      }

      setCoupons(prev => [coupon, ...prev])
      setNewCoupon({
        code: "",
        type: "percentage",
        value: 0,
        description: "",
        usageLimit: null,
        expiresAt: ""
      })
      setIsCreateOpen(false)
      
      toast({
        title: "Coupon created",
        description: `Coupon "${coupon.code}" has been created successfully.`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create coupon",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = (couponId: string) => {
    setCoupons(prev => prev.map(coupon => 
      coupon.id === couponId 
        ? { ...coupon, isActive: !coupon.isActive }
        : coupon
    ))
    
    toast({
      title: "Coupon updated",
      description: "Coupon status has been updated."
    })
  }

  const handleDeleteCoupon = (couponId: string) => {
    setCoupons(prev => prev.filter(coupon => coupon.id !== couponId))
    toast({
      title: "Coupon deleted",
      description: "The coupon has been removed."
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Coupon code copied to clipboard"
    })
  }

  const getStatusColor = (coupon: Coupon) => {
    if (!coupon.isActive) return "bg-gray-100 text-gray-800"
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return "bg-red-100 text-red-800"
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return "bg-orange-100 text-orange-800"
    return "bg-green-100 text-green-800"
  }

  const getStatusText = (coupon: Coupon) => {
    if (!coupon.isActive) return "Inactive"
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return "Used Up"
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return "Expired"
    return "Active"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Promo Codes & Coupons</h1>
          <p className="text-muted-foreground">Create and manage promotional codes for discounts.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Coupon Code</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setNewCoupon(prev => ({ ...prev, code: generateCouponCode() }))}
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select
                    value={newCoupon.type}
                    onValueChange={(value: "percentage" | "fixed") => setNewCoupon(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{newCoupon.type === "percentage" ? "Percentage %" : "Amount $"}</Label>
                  <Input
                    type="number"
                    placeholder={newCoupon.type === "percentage" ? "10" : "5.00"}
                    value={newCoupon.value || ""}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Brief description of the coupon"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Usage Limit</Label>
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    value={newCoupon.usageLimit || ""}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, usageLimit: e.target.value ? parseInt(e.target.value) : null }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expires At</Label>
                  <Input
                    type="datetime-local"
                    value={newCoupon.expiresAt}
                    onChange={(e) => setNewCoupon(prev => ({ ...prev, expiresAt: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCoupon} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Coupon"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Percent className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Coupons</p>
                <p className="text-2xl font-bold text-foreground">{coupons.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Eye className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-foreground">
                  {coupons.filter(c => c.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Users className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Uses</p>
                <p className="text-2xl font-bold text-foreground">
                  {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-error/10 rounded-lg">
                <EyeOff className="h-5 w-5 text-error" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-foreground">
                  {coupons.filter(c => !c.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <code className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-sm font-mono">
                      {coupon.code}
                    </code>
                    <Badge className={getStatusColor(coupon)}>
                      {getStatusText(coupon)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(coupon.code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{coupon.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {coupon.type === "percentage" ? <Percent className="h-3 w-3" /> : <DollarSign className="h-3 w-3" />}
                      {coupon.type === "percentage" ? `${coupon.value}%` : `$${coupon.value}`} off
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {coupon.usedCount} / {coupon.usageLimit || "∞"} uses
                    </div>
                    
                    {coupon.expiresAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Expires {new Date(coupon.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(coupon.id)}
                  >
                    {coupon.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCoupon(coupon)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {coupons.length === 0 && (
              <div className="text-center py-12">
                <Percent className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No coupons yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first promotional code to offer discounts to users.
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Coupon
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
