import { useState, useEffect , useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { billingAPI } from "@/lib/api"
import type { BillingHistory } from "@/lib/api/types"
import { AlertTriangle, Check, CheckCircle, Clock, Download, Filter, Loader2, Refresh, RefreshCw, Search, X, XCircle } from "lucide-react"

"use client"




interface Invoice {}
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  invoice_date: string;
  due_date: string;
  paid_date?: string;
  download_url: string;
}

export function BillingHistory() {}
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [billingHistory, setBillingHistory] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {}
    fetchBillingHistory()
  }, [])

  // Helper function to map API billing history to local invoice type;
  const mapBillingHistoryToInvoice = (history: BillingHistory): Invoice => ({}
    id: history.id,
    amount: history.amount,
    currency: history.currency,
    status: history.status,
    description: history.description,
    invoice_date: history.created_at,
    due_date: history.created_at,
    download_url: history.download_url || "",
  })

  const fetchBillingHistory = async () => {}
    try {}
      setIsLoading(true)
      const data = await billingAPI.getBillingHistory()
      const mappedHistory = (data.results || []).map(mapBillingHistoryToInvoice)
      setBillingHistory(mappedHistory)
    } catch {}
      console.error("Failed to fetch billing history:", error)
      toast({title: "Error",
        description: "Failed to load billing history.",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {}
    switch (status) {}
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid;
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed;
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending;
          </Badge>
        )
      case "refunded":
        return (
          <Badge variant="outline">
            <RefreshCw className="w-3 h-3 mr-1" />
            Refunded;
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const filteredHistory = billingHistory.filter((item) => {}
    const matchesSearch =
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  })

  const totalAmount = filteredHistory.reduce((sum, item) => {}
    return item.status === "paid" ? sum + item.amount : sum;
  }, 0)

  const downloadInvoice = async (invoiceId: string, downloadUrl: string) => {}
    try {}
      const blob = await billingAPI.downloadInvoice(invoiceId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url;
      a.download = `invoice_${invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {}
      console.error("Failed to download invoice:", error)
      toast({title: "Error",
        description: "Failed to download invoice.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {}
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
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across {filteredHistory.filter((i) => i.status === &quot;paid").length} payments;
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Payments</CardTitle>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredHistory.filter((i) => i.status === &quot;failed").length}</div>"
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Payment</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Jan 15</div>
            <p className="text-xs text-muted-foreground">$19.99 - Premium Plan</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and manage your payment history and invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input;
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Billing Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{new Date(item.invoice_date).toLocaleDateString()}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.currency.toUpperCase()}</TableCell>
                    <TableCell>${item.amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button;
                          size="sm" 
                          variant="outline"
                          onClick={() => downloadInvoice(item.id, item.download_url)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download;
                        </Button>
                        {item.status === "failed" && (
                          <Button size="sm" variant="default">
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Retry;
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No billing history found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
