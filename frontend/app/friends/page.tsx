import { FriendsManager } from "@/components/social/friends-manager"
import { MutualFriendsSuggestions } from "@/components/social/mutual-friends-suggestions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FriendsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Friends</h1>
          <p className="text-muted-foreground mt-2">
            Connect with friends and build your watch party network
          </p>
        </div>
        
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="friends">My Friends</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="friends">
            <FriendsManager />
          </TabsContent>
          
          <TabsContent value="suggestions">
            <MutualFriendsSuggestions />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
