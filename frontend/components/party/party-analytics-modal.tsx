'use client'

import { useState, useEffect } from 'react'
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface PartyAnalyticsModalProps {
  isOpen: boolean
  onClose: () => void
  partyId: string
  partyTitle: string
}

interface ParticipantData {
  id: string
  username: string
  avatar: string
  joinTime: string
  watchTime: number
  reactions: number
  messages: number
  isActive: boolean
}

interface AnalyticsData {
  totalParticipants: number
  currentViewers: number
  averageWatchTime: number
  totalReactions: number
  totalMessages: number
  peakViewers: number
  retentionRate: number
  engagementScore: number
  viewershipData: Array<{ time: string; viewers: number }>
  reactionData: Array<{ type: string; count: number; color: string }>
  participantActivity: ParticipantData[]
}

export function PartyAnalyticsModal({ isOpen, onClose, partyId, partyTitle }: PartyAnalyticsModalProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && partyId) {
      fetchAnalytics()
    }
  }, [isOpen, partyId])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/parties/${partyId}/analytics`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch {
      console.error('Failed to fetch party analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = () => {
    if (!analytics) return
    
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Metric,Value\n" +
      `Total Participants,${analytics.totalParticipants}\n` +
      `Current Viewers,${analytics.currentViewers}\n` +
      `Average Watch Time,${analytics.averageWatchTime}\n` +
      `Total Reactions,${analytics.totalReactions}\n` +
      `Total Messages,${analytics.totalMessages}\n` +
      `Peak Viewers,${analytics.peakViewers}\n` +
      `Retention Rate,${analytics.retentionRate}%\n` +
      `Engagement Score,${analytics.engagementScore}/100`

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `party-${partyId}-analytics.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading Analytics...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!analytics) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Analytics Unavailable</DialogTitle>
          </DialogHeader>
          <p>Unable to load analytics for this party.</p>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Party Analytics: {partyTitle}</DialogTitle>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.totalParticipants}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.currentViewers} currently watching
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Watch Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatDuration(analytics.averageWatchTime)}</div>
                  <p className="text-xs text-muted-foreground">
                    {analytics.retentionRate}% retention rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Peak Viewers</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.peakViewers}</div>
                  <p className="text-xs text-muted-foreground">
                    Maximum concurrent viewers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
                  <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.engagementScore}/100</div>
                  <Progress value={analytics.engagementScore} className="mt-2" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Viewership Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.viewershipData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="viewers" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reactions Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.reactionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics.reactionData.map((entry, index) => (
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
                  <CardTitle>Interaction Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ThumbsUp className="h-4 w-4" />
                      <span>Total Reactions</span>
                    </div>
                    <Badge variant="secondary">{analytics.totalReactions}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>Total Messages</span>
                    </div>
                    <Badge variant="secondary">{analytics.totalMessages}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="h-4 w-4" />
                      <span>Active Participants</span>
                    </div>
                    <Badge variant="secondary">
                      {analytics.participantActivity.filter(p => p.isActive).length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="participants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Participant Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {analytics.participantActivity.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <img
                          src={participant.avatar || '/placeholder-user.jpg'}
                          alt={participant.username}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{participant.username}</p>
                          <p className="text-sm text-muted-foreground">
                            Joined: {new Date(participant.joinTime).toLocaleTimeString()}
                          </p>
                        </div>
                        {participant.isActive && (
                          <Badge variant="default" className="bg-green-500">
                            Online
                          </Badge>
                        )}
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm">
                          Watch time: {formatDuration(participant.watchTime)}
                        </p>
                        <div className="flex space-x-4 text-xs text-muted-foreground">
                          <span>{participant.reactions} reactions</span>
                          <span>{participant.messages} messages</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.viewershipData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="viewers" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
