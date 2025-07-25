"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FriendsList } from "@/components/social/friends-list"
import { FriendRequests } from "@/components/social/friend-requests"
import { UserSearch } from "@/components/social/user-search"
import { ActivityFeed } from "@/components/social/activity-feed"
import { Search, UserPlus, Users, Clock, Activity, Video, UserCheck } from "lucide-react"

// Mock data
const friendsStats = {
  total: 24,
  online: 8,
  pendingRequests: 3,
  sentRequests: 2,
}

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("friends")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display">Friends</h1>
          <p className="text-muted-foreground mt-2">Connect with friends and discover new people to watch with</p>
        </div>
        <Button className="shadow-glow">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Friends
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Friends</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{friendsStats.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-accent-success">{friendsStats.online}</span> online now
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Friend Requests</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{friendsStats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Pending your response</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{friendsStats.sentRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Parties</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Friends watching now</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search friends or find new people..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="friends" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Friends</span>
            {friendsStats.online > 0 && (
              <Badge variant="secondary" className="ml-1">
                {friendsStats.online}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center space-x-2">
            <UserCheck className="w-4 h-4" />
            <span>Requests</span>
            {friendsStats.pendingRequests > 0 && (
              <Badge variant="destructive" className="ml-1">
                {friendsStats.pendingRequests}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="discover" className="flex items-center space-x-2">
            <UserPlus className="w-4 h-4" />
            <span>Discover</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Activity</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-6">
          <FriendsList searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          <FriendRequests />
        </TabsContent>

        <TabsContent value="discover" className="space-y-6">
          <UserSearch searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <ActivityFeed />
        </TabsContent>
      </Tabs>
    </div>
  )
}
