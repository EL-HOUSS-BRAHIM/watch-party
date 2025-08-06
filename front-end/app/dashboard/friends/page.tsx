"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import FriendsList from "@/components/social/friends-list"
import FriendRequests from "@/components/social/friend-requests"
import UserSearch from "@/components/social/user-search"
import ActivityFeed from "@/components/social/activity-feed"
import { Users, UserPlus, Search, Activity } from "lucide-react"
import { usersAPI } from "@/lib/api"
import { useEffect } from "react"

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState("friends")
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)

  useEffect(() => {
    loadPendingRequestsCount()
  }, [])

  const loadPendingRequestsCount = async () => {
    try {
      const requests = await usersAPI.getFriendRequests()
      const pendingCount = requests.filter((req: any) => req.status === 'pending').length
      setPendingRequestsCount(pendingCount)
    } catch (error) {
      console.error("Failed to load pending requests count:", error)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Social Hub
        </h1>
        <p className="text-gray-600 mt-2">Connect with friends and discover new people</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Friends
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Requests
            {pendingRequestsCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {pendingRequestsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Find Friends
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <FriendsList />
        </TabsContent>

        <TabsContent value="requests">
          <FriendRequests />
        </TabsContent>

        <TabsContent value="search">
          <UserSearch />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityFeed />
        </TabsContent>
      </Tabs>
    </div>
  )
}
