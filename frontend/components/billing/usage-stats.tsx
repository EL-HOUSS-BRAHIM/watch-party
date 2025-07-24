"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { HardDrive, Wifi, Users, Video, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react"

export function UsageStats() {
  // Mock usage data
  const currentUsage = {
    storage: { used: 38.5, limit: 50, unit: "GB" },
    bandwidth: { used: 245, limit: 500, unit: "GB" },
    parties: { used: 12, limit: 25, unit: "parties" },
    participants: { used: 156, limit: 500, unit: "total participants" },
  }

  const monthlyUsage = [
    { month: "Jul", storage: 25, bandwidth: 180, parties: 8 },
    { month: "Aug", storage: 32, bandwidth: 220, parties: 10 },
    { month: "Sep", storage: 35, bandwidth: 195, parties: 9 },
    { month: "Oct", storage: 38, bandwidth: 245, parties: 12 },
    { month: "Nov", storage: 38.5, bandwidth: 245, parties: 12 },
  ]

  const dailyParticipants = [
    { day: "Mon", participants: 15 },
    { day: "Tue", participants: 22 },
    { day: "Wed", participants: 18 },
    { day: "Thu", participants: 28 },
    { day: "Fri", participants: 35 },
    { day: "Sat", participants: 42 },
    { day: "Sun", participants: 38 },
  ]

  const videoQualityDistribution = [
    { name: "720p", value: 35, color: "#8884d8" },
    { name: "1080p", value: 45, color: "#82ca9d" },
    { name: "4K", value: 20, color: "#ffc658" },
  ]

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "text-destructive"
    if (percentage >= 75) return "text-yellow-600"
    return "text-green-600"
  }

  const getUsageIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="w-4 h-4 text-destructive" />
    return <CheckCircle className="w-4 h-4 text-green-600" />
  }

  return (
    <div className="space-y-6">
      {/* Current Usage Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <HardDrive className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">
                {currentUsage.storage.used}
                {currentUsage.storage.unit}
              </div>
              {getUsageIcon((currentUsage.storage.used / currentUsage.storage.limit) * 100)}
            </div>
            <Progress value={(currentUsage.storage.used / currentUsage.storage.limit) * 100} className="mb-2" />
            <p className="text-xs text-muted-foreground">
              {currentUsage.storage.used} of {currentUsage.storage.limit} {currentUsage.storage.unit} used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bandwidth</CardTitle>
            <Wifi className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">
                {currentUsage.bandwidth.used}
                {currentUsage.bandwidth.unit}
              </div>
              {getUsageIcon((currentUsage.bandwidth.used / currentUsage.bandwidth.limit) * 100)}
            </div>
            <Progress value={(currentUsage.bandwidth.used / currentUsage.bandwidth.limit) * 100} className="mb-2" />
            <p className="text-xs text-muted-foreground">
              {currentUsage.bandwidth.used} of {currentUsage.bandwidth.limit} {currentUsage.bandwidth.unit} used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watch Parties</CardTitle>
            <Video className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{currentUsage.parties.used}</div>
              {getUsageIcon((currentUsage.parties.used / currentUsage.parties.limit) * 100)}
            </div>
            <Progress value={(currentUsage.parties.used / currentUsage.parties.limit) * 100} className="mb-2" />
            <p className="text-xs text-muted-foreground">
              {currentUsage.parties.used} of {currentUsage.parties.limit} {currentUsage.parties.unit}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{currentUsage.participants.used}</div>
              {getUsageIcon((currentUsage.participants.used / currentUsage.participants.limit) * 100)}
            </div>
            <Progress
              value={(currentUsage.participants.used / currentUsage.participants.limit) * 100}
              className="mb-2"
            />
            <p className="text-xs text-muted-foreground">
              {currentUsage.participants.used} of {currentUsage.participants.limit} {currentUsage.participants.unit}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trends */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Usage Trends</CardTitle>
            <CardDescription>Track your usage patterns over the last 5 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="storage" fill="#8884d8" name="Storage (GB)" />
                <Bar dataKey="bandwidth" fill="#82ca9d" name="Bandwidth (GB)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Participants</CardTitle>
            <CardDescription>Participant activity over the last week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyParticipants}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="participants" stroke="#8884d8" strokeWidth={2} name="Participants" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Video Quality Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Video Quality Distribution</CardTitle>
            <CardDescription>Breakdown of video quality usage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={videoQualityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {videoQualityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Recommendations</CardTitle>
            <CardDescription>AI-powered suggestions to optimize your usage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Storage Optimization</h4>
                <p className="text-sm text-muted-foreground">
                  You're using 77% of your storage. Consider upgrading to Pro plan for 500GB.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Bandwidth Efficiency</h4>
                <p className="text-sm text-muted-foreground">
                  Your bandwidth usage is optimal. 4K streaming is well within limits.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Peak Usage Alert</h4>
                <p className="text-sm text-muted-foreground">
                  Weekend parties have 40% more participants. Plan accordingly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Usage Breakdown</CardTitle>
          <CardDescription>Comprehensive view of your resource consumption</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(currentUsage).map(([key, usage]) => {
              const percentage = (usage.used / usage.limit) * 100
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium capitalize">{key.replace("_", " ")}</span>
                      <Badge variant={percentage >= 90 ? "destructive" : percentage >= 75 ? "secondary" : "outline"}>
                        {percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {usage.used} / {usage.limit} {usage.unit}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
