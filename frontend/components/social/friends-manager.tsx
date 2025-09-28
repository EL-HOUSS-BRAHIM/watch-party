import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfilePreview } from "@/components/ui/profile-preview"
import { useApiToast } from "@/hooks/use-toast"
import {}

} from 'lucide-react'
'use client'

  Search, 
  UserPlus, 
  MessageCircle, 
  Phone, 
  Video, 
  MoreHorizontal,
  Users,
  Clock,
  GamepadIcon,
  User;

interface Friend {}
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  status: 'online' | 'offline' | 'away' | 'busy'
  isInParty: boolean;
  currentParty?: {}
    id: string;
    title: string;
    participantCount: number;
  }
  lastSeen: string;
  mutualFriends: number;
  friendSince: string;
}

interface FriendRequest {}
  id: string;
  fromUser: {}
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
  }
  toUser: {}
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
  }
  createdAt: string;
  message?: string;
}

export function FriendsManager() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const { apiRequest, toastSuccess, toastError } = useApiToast()

  useEffect(() => {
    loadFriendsData()
  }, [])

  const loadFriendsData = async () => {
    try {
      const [friendsData, incomingData, outgoingData] = await Promise.all([]
        apiRequest(() => fetch(&apos;/api/social/friends&apos;)),
        apiRequest(() => fetch(&apos;/api/social/friend-requests/incoming')),
        apiRequest(() => fetch('/api/social/friend-requests/outgoing'))
      ])

      if (friendsData) setFriends(friendsData)
      if (incomingData) setIncomingRequests(incomingData)
      if (outgoingData) setOutgoingRequests(outgoingData)
    } } catch {
      toastError(error, 'Failed to load friends data')
    } finally {}
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId: string) => {}
    const success = await apiRequest(
      () => fetch(`/api/social/friend-requests/${requestId}/accept`, { method: 'POST' }),
      { successMessage: 'Friend request accepted!', showSuccess: true }
    )
    if (success) {
      setIncomingRequests(prev => prev.filter(req => req.id !== requestId))
      loadFriendsData()
    }
  }

  const handleDeclineRequest = async (requestId: string) => {}
    const success = await apiRequest(
      () => fetch(`/api/social/friend-requests/${requestId}/decline`, { method: 'POST' }),
      { successMessage: 'Friend request declined', showSuccess: true }
    )
    if (success) {
      setIncomingRequests(prev => prev.filter(req => req.id !== requestId))
    }
  }

  const handleCancelRequest = async (requestId: string) => {}
    const success = await apiRequest(
      () => fetch(`/api/social/friend-requests/${requestId}/cancel`, { method: 'DELETE' }),
      { successMessage: 'Friend request cancelled', showSuccess: true }
    )
    if (success) {
      setOutgoingRequests(prev => prev.filter(req => req.id !== requestId))
    }
  }

  const handleRemoveFriend = async (friendId: string) => {}
    const success = await apiRequest(
      () => fetch(`/api/social/friends/${friendId}`, { method: 'DELETE' }),
      { successMessage: 'Friend removed', showSuccess: true }
    )
    if (success) {
      setFriends(prev => prev.filter(friend => friend.id !== friendId))
    }
  }

  const filteredFriends = friends.filter(friend =>
    friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: Friend['status']) => {}
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = (status: Friend['status']) => {}
    switch (status) {
      case 'online': return 'Online'
      case 'away': return 'Away'
      case 'busy': return 'Busy'
      default: return 'Offline'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input;
          placeholder="Search friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All Friends ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="online">
            Online ({friends.filter(f => f.status === &apos;online&apos;).length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({incomingRequests.length + outgoingRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredFriends.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
                <p className="text-muted-foreground text-center">
                  Start building your network by sending friend requests!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredFriends.map((friend) => (
                <Card key={friend.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <ProfilePreview userId={friend.id}>
                            <Avatar className="h-12 w-12 cursor-pointer">
                              <AvatarImage src={friend.avatar || ''} />
                              <AvatarFallback>
                                {friend.displayName?.charAt(0)?.toUpperCase() || <User className="h-6 w-6" />}
                              </AvatarFallback>
                            </Avatar>
                          </ProfilePreview>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(friend.status)}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <ProfilePreview userId={friend.id}>
                              <h3 className="font-semibold cursor-pointer hover:underline">
                                {friend.displayName}
                              </h3>
                            </ProfilePreview>
                            <Badge variant="outline" className="text-xs">
                              {getStatusText(friend.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">@{friend.username}</p>
                          {friend.isInParty && friend.currentParty && (
                            <div className="flex items-center space-x-1 mt-1">
                              <GamepadIcon className="h-3 w-3 text-primary" />
                              <span className="text-xs text-primary">
                                In "{friend.currentParty.title}" ({friend.currentParty.participantCount} watching)
                              </span>
                            </div>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            <span>Friends since {new Date(friend.friendSince).toLocaleDateString()}</span>
                            <span>{friend.mutualFriends} mutual friends</span>
                            {friend.status === 'offline' && (
                              <span>Last seen {new Date(friend.lastSeen).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        {friend.status === 'online' && (
                          <>
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Video className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button;
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveFriend(friend.id)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="online" className="space-y-4">
          {filteredFriends.filter(f => f.status === &apos;online&apos;).map((friend) => (
            <Card key={friend.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <ProfilePreview userId={friend.id}>
                        <Avatar className="h-12 w-12 cursor-pointer">
                          <AvatarImage src={friend.avatar || ''} />
                          <AvatarFallback>
                            {friend.displayName?.charAt(0)?.toUpperCase() || <User className="h-6 w-6" />}
                          </AvatarFallback>
                        </Avatar>
                      </ProfilePreview>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                    <div className="flex-1">
                      <ProfilePreview userId={friend.id}>
                        <h3 className="font-semibold cursor-pointer hover:underline">
                          {friend.displayName}
                        </h3>
                      </ProfilePreview>
                      <p className="text-sm text-muted-foreground">@{friend.username}</p>
                      {friend.isInParty && friend.currentParty && (
                        <div className="flex items-center space-x-1 mt-1">
                          <GamepadIcon className="h-3 w-3 text-primary" />
                          <span className="text-xs text-primary">
                            Watching "{friend.currentParty.title}"
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          {/* Incoming Requests */}
          {incomingRequests.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Incoming Requests</h3>
              <div className="space-y-4">
                {incomingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <ProfilePreview userId={request.fromUser.id}>
                            <Avatar className="h-12 w-12 cursor-pointer">
                              <AvatarImage src={request.fromUser.avatar || ''} />
                              <AvatarFallback>
                                {request.fromUser.displayName?.charAt(0)?.toUpperCase() || <User className="h-6 w-6" />}
                              </AvatarFallback>
                            </Avatar>
                          </ProfilePreview>
                          <div className="flex-1">
                            <ProfilePreview userId={request.fromUser.id}>
                              <h3 className="font-semibold cursor-pointer hover:underline">
                                {request.fromUser.displayName}
                              </h3>
                            </ProfilePreview>
                            <p className="text-sm text-muted-foreground">@{request.fromUser.username}</p>
                            {request.message && (
                              <p className="text-sm mt-1 italic">&quot;{request.message}&quot;</p>
                            )}
                            <div className="flex items-center space-x-1 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button;
                            variant="default"
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            Accept;
                          </Button>
                          <Button;
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeclineRequest(request.id)}
                          >
                            Decline;
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Outgoing Requests */}
          {outgoingRequests.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Pending Requests</h3>
              <div className="space-y-4">
                {outgoingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <ProfilePreview userId={request.toUser.id}>
                            <Avatar className="h-12 w-12 cursor-pointer">
                              <AvatarImage src={request.toUser.avatar || ''} />
                              <AvatarFallback>
                                {request.toUser.displayName?.charAt(0)?.toUpperCase() || <User className="h-6 w-6" />}
                              </AvatarFallback>
                            </Avatar>
                          </ProfilePreview>
                          <div className="flex-1">
                            <ProfilePreview userId={request.toUser.id}>
                              <h3 className="font-semibold cursor-pointer hover:underline">
                                {request.toUser.displayName}
                              </h3>
                            </ProfilePreview>
                            <p className="text-sm text-muted-foreground">@{request.toUser.username}</p>
                            <div className="flex items-center space-x-1 mt-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                Sent {new Date(request.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button;
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelRequest(request.id)}
                        >
                          Cancel;
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                <p className="text-muted-foreground text-center">
                  All caught up! No pending friend requests at the moment.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
