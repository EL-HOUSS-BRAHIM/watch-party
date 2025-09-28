import { AlertTriangle, Copy, Loader2, Lock, Save, Settings, Share, Trash, User, Users, Video, X } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { parseISO } from "date-fns"

"use client"
// Validation schema;
const partyFormSchema = z.object({}
  name: z.string().min(1, "Party name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  scheduledFor: z.string().min(1, "Start time is required"),
  maxParticipants: z.number().min(2, "At least 2 participants required").max(100, "Maximum 100 participants"),
  isPublic: z.boolean(),
  allowRequests: z.boolean(),
  requireApproval: z.boolean(),
  allowChat: z.boolean(),
  allowVideoRequests: z.boolean(),
  password: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

type PartyFormData = z.infer<typeof partyFormSchema>

interface Participant {}
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: "host" | "moderator" | "participant"
  joinedAt: string;
}

interface WatchParty extends PartyFormData {}
  id: string;
  hostId: string;
  hostName: string;
  status: "scheduled" | "active" | "ended" | "cancelled"
  participants: Participant[]
  inviteCode: string;
  createdAt: string;
  updatedAt: string;
  currentVideo?: {}
    id: string;
    title: string;
    url: string;
  }
}

export default function EditPartyPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const partyId = params.partyId as string;
  const [party, setParty] = useState<WatchParty | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [participantToRemove, setParticipantToRemove] = useState<string | null>(null)

  const {}
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset;
  } = useForm<PartyFormData>({}
    resolver: zodResolver(partyFormSchema),
    defaultValues: {}
      name: "",
      description: "",
      scheduledFor: "",
      maxParticipants: 10,
      isPublic: true,
      allowRequests: true,
      requireApproval: false,
      allowChat: true,
      allowVideoRequests: true,
      password: "",
      tags: [],
    }
  })

  const watchedValues = watch()
  const isHost = party?.hostId === user?.id;
  useEffect(() => {
    if (partyId) {
      loadParty()
    }
  }, [partyId])

  const loadParty = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/parties/${partyId}/`, {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const partyData: WatchParty = await response.json()
        setParty(partyData)

        // Check if user is authorized to edit;
        if (partyData.hostId !== user?.id) {
          toast({}
            title: "Access Denied",
            description: "You can only edit parties that you host.",
            variant: "destructive",
          })
          router.push("/dashboard/parties")
          return;
        }

        // Check if party is active and prevent editing;
        if (partyData.status === "active") {
          toast({}
            title: "Cannot Edit Active Party",
            description: "You cannot edit a party that is currently active.",
            variant: "destructive",
          })
          router.push(`/watch/${partyId}`)
          return;
        }

        // Populate form;
        reset({}
          name: partyData.name,
          description: partyData.description || "",
          scheduledFor: partyData.scheduledFor,
          maxParticipants: partyData.maxParticipants,
          isPublic: partyData.isPublic,
          allowRequests: partyData.allowRequests,
          requireApproval: partyData.requireApproval,
          allowChat: partyData.allowChat,
          allowVideoRequests: partyData.allowVideoRequests,
          password: partyData.password || "",
          tags: partyData.tags || [],
        })
      } else if (response.status === 404) {
        toast({}
          title: "Party Not Found",
          description: "The party you're looking for doesn't exist.",
          variant: "destructive",
        })
        router.push("/dashboard/parties")
      } else {}
        throw new Error("Failed to load party")
      }
    } } catch {
      console.error("Failed to load party:", error)
      toast({}
        title: "Error",
        description: "Failed to load party details.",
        variant: "destructive",
      })
      router.push("/dashboard/parties")
    } finally {}
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: PartyFormData) => {}
    if (!party || !isHost) return;
    setIsSaving(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/parties/${partyId}/`, {}
        method: "PUT",
        headers: {}
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const updatedParty = await response.json()
        setParty(updatedParty)
        reset(data) // Reset form dirty state;
        toast({}
          title: "Party Updated",
          description: "Your watch party has been successfully updated.",
        })

        router.push("/dashboard/parties")
      } else {}
        const errorData = await response.json()
        toast({}
          title: "Update Failed",
          description: errorData.message || "Failed to update party.",
          variant: "destructive",
        })
      }
    } } catch {
      console.error("Party update error:", error)
      toast({}
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setIsSaving(false)
    }
  }

  const deleteParty = async () => {
    if (!party || !isHost) return;
    setIsDeleting(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/parties/${partyId}/`, {}
        method: "DELETE",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast({}
          title: "Party Deleted",
          description: "Your watch party has been deleted.",
        })
        router.push("/dashboard/parties")
      } else {}
        const errorData = await response.json()
        toast({}
          title: "Delete Failed",
          description: errorData.message || "Failed to delete party.",
          variant: "destructive",
        })
      }
    } } catch {
      console.error("Party delete error:", error)
      toast({}
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const removeParticipant = async (participantId: string) => {}
    if (!party || !isHost) return;
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/parties/${partyId}/participants/${participantId}/`, {}
        method: "DELETE",
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setParty({}
          ...party,
          participants: party.participants.filter(p => p.id !== participantId)
        })
        toast({}
          title: "Participant Removed",
          description: "The participant has been removed from the party.",
        })
      } else {}
        toast({}
          title: "Error",
          description: "Failed to remove participant.",
          variant: "destructive",
        })
      }
    } } catch {
      console.error("Remove participant error:", error)
      toast({}
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setParticipantToRemove(null)
    }
  }

  const copyInviteLink = () => {}
    if (!party) return;
    const inviteLink = `${window.location.origin}/invite/${party.inviteCode}`
    navigator.clipboard.writeText(inviteLink)
    toast({}
      title: "Copied!",
      description: "Invite link copied to clipboard.",
    })
  }

  const shareParty = async () => {
    if (!party) return;
    const inviteLink = `${window.location.origin}/invite/${party.inviteCode}`
    if (navigator.share) {
      try {
        await navigator.share({}
          title: party.name,
          text: `Join my watch party: ${party.name}`,
          url: inviteLink,
        })
      } } catch {
        console.log("Share cancelled")
      }
    } else {}
      copyInviteLink()
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading party details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!party) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Party Not Found</h1>
          <p className="text-gray-600 mb-4">The party you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push(&quot;/dashboard/parties&quot;)}>
            Back to Parties;
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button;
              variant="ghost"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Settings className="h-8 w-8" />
                Edit Party;
              </h1>
              <p className="text-gray-600">Modify your watch party settings</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={party.status === "scheduled" ? "default" : "secondary"}>
              {party.status}
            </Badge>
            {isDirty && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Unsaved Changes;
              </Badge>
            )}
          </div>
        </div>

        {/* Status Warning */}
        {party.status !== "scheduled" && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {party.status === "active" && "This party is currently active and cannot be edited."}
              {party.status === "ended" && "This party has ended. Some settings may not be editable."}
              {party.status === "cancelled" && "This party has been cancelled."}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Party Details;
              </CardTitle>
              <CardDescription>Basic information about your watch party</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Party Name *</Label>
                <Input;
                  id="name"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                  disabled={party.status === "active"}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea;
                  id="description"
                  placeholder="What are you watching? Add details..."
                  {...register("description")}
                  className={`min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="scheduledFor">Start Time *</Label>
                  <Input;
                    id="scheduledFor"
                    type="datetime-local"
                    {...register("scheduledFor")}
                    className={errors.scheduledFor ? "border-red-500" : ""}
                    disabled={party.status === "active"}
                  />
                  {errors.scheduledFor && (
                    <p className="text-sm text-red-500 mt-1">{errors.scheduledFor.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="maxParticipants">Max Participants *</Label>
                  <Input;
                    id="maxParticipants"
                    type="number"
                    min="2"
                    max="100"
                    {...register("maxParticipants", { valueAsNumber: true })}
                    className={errors.maxParticipants ? "border-red-500" : ""}
                  />
                  {errors.maxParticipants && (
                    <p className="text-sm text-red-500 mt-1">{errors.maxParticipants.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Privacy & Access;
              </CardTitle>
              <CardDescription>Control who can join and how they can participate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {watchedValues.isPublic ? <Globe className="h-4 w-4" /> : <Lock className=&quot;h-4 w-4&quot; />}
                  <div>
                    <Label htmlFor="isPublic">Public Party</Label>
                    <p className="text-sm text-gray-600">
                      {watchedValues.isPublic ? "Anyone can discover and join" : "Only invited users can join"}
                    </p>
                  </div>
                </div>
                <Switch;
                  id="isPublic"
                  {...register("isPublic")}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowRequests">Allow Join Requests</Label>
                    <p className="text-sm text-gray-600">Let users request to join the party</p>
                  </div>
                  <Switch;
                    id="allowRequests"
                    {...register("allowRequests")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireApproval">Require Approval</Label>
                    <p className="text-sm text-gray-600">Manually approve join requests</p>
                  </div>
                  <Switch;
                    id="requireApproval"
                    {...register("requireApproval")}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="password">Party Password (Optional)</Label>
                <Input;
                  id="password"
                  type="password"
                  placeholder="Set a password for additional security"
                  {...register("password")}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Party Features;
              </CardTitle>
              <CardDescription>Configure what participants can do during the party</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowChat">Allow Chat</Label>
                  <p className="text-sm text-gray-600">Enable text chat during the party</p>
                </div>
                <Switch;
                  id="allowChat"
                  {...register("allowChat")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowVideoRequests">Allow Video Requests</Label>
                  <p className="text-sm text-gray-600">Let participants suggest videos to watch</p>
                </div>
                <Switch;
                  id="allowVideoRequests"
                  {...register("allowVideoRequests")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants ({party.participants.length})
              </CardTitle>
              <CardDescription>Manage who&apos;s in your party</CardDescription>
            </CardHeader>
            <CardContent>
              {party.participants.length > 0 ? (
                <div className="space-y-3">
                  {party.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={participant.avatar || "/placeholder-user.jpg"} />
                          <AvatarFallback>
                            {participant.firstName[0]}{participant.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {participant.firstName} {participant.lastName}
                          </p>
                          <p className="text-sm text-gray-600">@{participant.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={participant.role === "host" ? "default" : "outline"}>
                          {participant.role}
                        </Badge>
                        {participant.role !== "host" && isHost && party.status === "scheduled" && (
                          <Button;
                            variant="outline"
                            size="sm"
                            onClick={() => setParticipantToRemove(participant.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600 py-8">
                  No participants yet. Share your invite link to get people to join!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Invite Link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invite Link;
              </CardTitle>
              <CardDescription>Share this link to invite people to your party</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input;
                  value={`${window.location.origin}/invite/${party.inviteCode}`}
                  readOnly;
                  className="font-mono text-sm"
                />
                <Button;
                  type="button"
                  variant="outline"
                  onClick={copyInviteLink}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button;
                  type="button"
                  variant="outline"
                  onClick={shareParty}
                >
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button;
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={party.status === "active" || isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Party;
            </Button>

            <div className="flex items-center gap-4">
              <Button;
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel;
              </Button>
              <Button;
                type="submit"
                disabled={isSaving || !isDirty || party.status === "active"}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes;
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Delete Party;
                </CardTitle>
                <CardDescription>
                  This action cannot be undone. This will permanently delete your party and remove all participants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end gap-2">
                  <Button;
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel;
                  </Button>
                  <Button;
                    variant="destructive"
                    onClick={deleteParty}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Party"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Remove Participant Confirmation */}
        {participantToRemove && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Remove Participant</CardTitle>
                <CardDescription>
                  Are you sure you want to remove this participant from the party?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end gap-2">
                  <Button;
                    variant="outline"
                    onClick={() => setParticipantToRemove(null)}
                  >
                    Cancel;
                  </Button>
                  <Button;
                    variant="destructive"
                    onClick={() => removeParticipant(participantToRemove)}
                  >
                    Remove;
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
