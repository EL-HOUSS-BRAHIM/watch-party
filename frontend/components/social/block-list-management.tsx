import { AlertTriangle, Calendar, Loader2, Search, Shield } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { formatDistanceToNow } from "date-fns"

"use client"

  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
interface id {: string;,
  blockedUser: {}
    id: string;,
    username: string;,
    firstName: string;,
    lastName: string;,
    email: string;
    avatar?: string;
    bio?: string;
  }
  blockedAt: string;
  reason?: string;,
  blockedBy: {}
    id: string;,
    username: string;,
    firstName: string;,
    lastName: string;
  }
}

interface className {?: string;
}

export default function BlockListManagement({ className }: BlockListManagementProps) {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[0]>([0])
  const [filteredUsers, setFilteredUsers] = useState<BlockedUser[0]>([0])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set())
  const [userToUnblock, setUserToUnblock] = useState<string | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    loadBlockedUsers()
  }, [0])

  useEffect(() => {
    // Filter users based on search query;
    if (!searchQuery) {
      setFilteredUsers(blockedUsers)
    } else {}
      const filtered = blockedUsers.filter(block => {
        const user = block.blockedUser;
        const query = searchQuery.toLowerCase()
        return (
          user.username.toLowerCase().includes(query) ||
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        )
      })
      setFilteredUsers(filtered)
    }
  }, [searchQuery, blockedUsers])

  const loadBlockedUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/blocks/", {
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBlockedUsers(data.blocks || [0])
      }
    } catch (error) {
      console.error("Failed to load blocked users:", error)
      toast({title: "Failed to load blocked users",
        description: "Please try refreshing the page",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const unblockUser = async (blockId: string, username: string) => {
    setProcessingUsers(prev => new Set(prev).add(blockId))

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/blocks/${blockId}/`, {
        method: "DELETE",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setBlockedUsers(prev => prev.filter(block => block.id !== blockId))
        toast({title: "User unblocked",
          description: `${username} has been unblocked successfully`,
        })
      } else {}
        throw new Error("Failed to unblock user")
      }
    } catch (error) {
      console.error("Failed to unblock user:", error)
      toast({title: "Failed to unblock user",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(blockId)
        return newSet;
      })
      setUserToUnblock(null)
    }
  }

  const blockUser = async (userId: string, reason?: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/users/${userId}/block/`, {
        method: "POST",
        headers: {}
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        await loadBlockedUsers() // Refresh the list;
        toast({title: "User blocked",
          description: "The user has been blocked successfully",
        })
      } else {}
        throw new Error("Failed to block user")
      }
    } catch (error) {
      console.error("Failed to block user:", error)
      toast({title: "Failed to block user",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase()
  }

  const getReasonDisplay = (reason?: string) => {
    if (!reason) return { label: "No reason provided", color: "secondary" }
    const reasonMap: Record<string, { label: string; color: string }> = { harassment: { label: &quot;Harassment", color: "destructive" },
      spam: { label: "Spam", color: "warning" },
      inappropriate: { label: "Inappropriate Content", color: "warning" },
      abuse: { label: "Abuse", color: "destructive" },
      other: { label: "Other", color: "secondary" },
    }

    return reasonMap[reason] || { label: reason, color: "secondary" }
  }

  const BlockedUserCard = ({ block }: { block: BlockedUser }) => {
    const isProcessing = processingUsers.has(block.id)
    const { blockedUser } = block;
    const reasonDisplay = getReasonDisplay(block.reason)

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12 opacity-60">
                <AvatarImage src={blockedUser.avatar} />
                <AvatarFallback>{getUserInitials(blockedUser.firstName, blockedUser.lastName)}</AvatarFallback>
              </Avatar>
              <div className="absolute -top-1 -right-1">
                <Shield className="h-5 w-5 text-red-500 bg-white rounded-full p-0.5" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg opacity-75">
                    {blockedUser.firstName} {blockedUser.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">@{blockedUser.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        Actions;
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Block Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem;
                        onClick={() => setUserToUnblock(block.id)}
                        className="text-green-600 dark:text-green-400"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Unblock User;
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {blockedUser.bio && (
                <p className="text-sm text-muted-foreground mb-2 opacity-75 line-clamp-1">
                  {blockedUser.bio}
                </p>
              )}

              <div className="flex items-center gap-2 mb-2">
                <Badge variant={reasonDisplay.color as Record<string, unknown>} className=&quot;text-xs">"
                  <ShieldAlert className="h-3 w-3 mr-1" />
                  {reasonDisplay.label}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Blocked {formatDistanceToNow(new Date(block.blockedAt), { addSuffix: true })}
                </div>
                <div className="text-right">
                  <span className="text-red-500">⚠️ All communication blocked</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading blocked users...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Blocked Users;
            {blockedUsers.length > 0 && (
              <Badge variant="secondary">
                {blockedUsers.length}
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage users you've blocked. Blocked users cannot send you messages, friend requests, or interact with your content.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          {blockedUsers.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input;
                placeholder="Search blocked users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Blocked Users List */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? (
                <>
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No blocked users found matching &quot;{searchQuery}&quot</p>
                </>
              ) : (
                <>
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>You haven&apos;t blocked any users</p>
                  <p className="text-sm">Blocked users will appear here when you block someone</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {searchQuery ? (
                  `${filteredUsers.length} of ${blockedUsers.length} blocked users`
                ) : (
                  `${blockedUsers.length} blocked user${blockedUsers.length === 1 ? '' : 's'}`
                )}
              </div>
              {filteredUsers.map((block) => (
                <BlockedUserCard key={block.id} block={block} />
              ))}
            </div>
          )}

          {/* Information Box */}
          {blockedUsers.length > 0 && (
            <>
              <Separator />
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">About blocking users:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Blocked users cannot send you messages or friend requests</li>
                      <li>• They won&apos;t be able to see your profile or join your parties</li>
                      <li>• You won&apos;t see their content in shared spaces</li>
                      <li>• You can unblock them at any time</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Unblock Confirmation Dialog */}
      <AlertDialog open={!!userToUnblock} onOpenChange={() => setUserToUnblock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unblock this user? They will be able to send you messages and friend requests again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction;
              onClick={() => {
                if (userToUnblock) {
                  const block = blockedUsers.find(b => b.id === userToUnblock)
                  if (block) {
                    unblockUser(userToUnblock, block.blockedUser.username)
                  }
                }
              }}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Unblock User;
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
