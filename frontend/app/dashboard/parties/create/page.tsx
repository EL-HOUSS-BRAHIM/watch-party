import { Calendar, Check, Loader2, Lock, Plus, Search, Settings, Upload, User, Users, Video, X } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { format, addHours } from "date-fns"

"use client"

// Validation schema;
const partyFormSchema = z.object({name: z.string().min(1, "Party name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  videoId: z.string().min(1, "Please select a video"),
  scheduledFor: z.date().min(new Date(), "Schedule time must be in the future"),
  maxParticipants: z.number().min(2, "At least 2 participants required").max(100, "Maximum 100 participants"),
  isPrivate: z.boolean(),
  requiresApproval: z.boolean(),
  allowChat: z.boolean(),
  allowReactions: z.boolean(),
  allowVideoControl: z.enum(["host", "all", "moderators"]),
  password: z.string().optional(),
  tags: z.array(z.string()).max(10, "Maximum 10 tags allowed"),
  inviteEmails: z.array(z.string().email()).max(50, "Maximum 50 invites allowed"),
})

type PartyFormData = z.infer<typeof partyFormSchema>

interface InviteUser {}
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  email: string;
}

export default function CreatePartyPage() {}
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [videos, setVideos] = useState<unknown[]>([])
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null)
  const [newTag, setNewTag] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [suggestedUsers, setSuggestedUsers] = useState<unknown[]>([])
  const [activeStep, setActiveStep] = useState(1)

  const {}
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset,
  } = useForm<PartyFormData>({}
    resolver: zodResolver(partyFormSchema),
    defaultValues: {}
      name: "",
      description: "",
      videoId: "",
      scheduledFor: addHours(new Date(), 1),
      maxParticipants: 10,
      isPrivate: false,
      requiresApproval: false,
      allowChat: true,
      allowReactions: true,
      allowVideoControl: "host",
      password: "",
      tags: [],
      inviteEmails: [],
    },
    mode: "onChange",
  })

  const watchedValues = watch()

  useEffect(() => {}
    loadVideos()
    loadSuggestedUsers()
  }, [])

  useEffect(() => {}
    if (watchedValues.videoId) {}
      const video = videos.find((v) => v.id === watchedValues.videoId)
      setSelectedVideo(video || null)
    }
  }, [watchedValues.videoId, videos])

  const loadVideos = async () => {}
    try {}
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/videos/?status=ready", {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {}
        const data = await response.json()
        setVideos(data.results || [])
      }
    } catch {}
      console.error("Failed to load videos:", error)
      toast({title: "Error",
        description: "Failed to load your videos.",
        variant: "destructive",
      })
    } finally {}
      setLoadingVideos(false)
    }
  }

  const loadSuggestedUsers = async () => {}
    try {}
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/friends/?limit=10", {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {}
        const data = await response.json()
        setSuggestedUsers(data.results || [])
      }
    } catch {}
      console.error("Failed to load suggested users:", error)
    }
  }

  const onSubmit = async (data: PartyFormData) => {}
    setIsLoading(true)
    try {}
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/parties/", {}
        method: "POST",
        headers: {}
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({...data,
          scheduled_for: data.scheduledFor.toISOString(),
          video_id: data.videoId,
          max_participants: data.maxParticipants,
          is_private: data.isPrivate,
          requires_approval: data.requiresApproval,
          allow_chat: data.allowChat,
          allow_reactions: data.allowReactions,
          allow_video_control: data.allowVideoControl,
          invite_emails: data.inviteEmails,
        }),
      })

      if (response.ok) {}
        const party = await response.json()
        toast({title: "Party Created!",
          description: "Your watch party has been created successfully.",
        })
        router.push(`/dashboard/parties/${party.id}`)
      } else {}
        const errorData = await response.json()
        toast({title: "Creation Failed",
          description: errorData.message || "Failed to create party.",
          variant: "destructive",
        })
      }
    } catch {}
      console.error("Party creation error:", error)
      toast({title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(false)
    }
  }

  const addTag = () => {}
    if (newTag.trim() && !watchedValues.tags.includes(newTag.trim()) && watchedValues.tags.length < 10) {}
      setValue("tags", [...watchedValues.tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {}
    setValue(
      "tags",
      watchedValues.tags.filter((t) => t !== tag),
    )
  }

  const addEmail = () => {}
    if (
      newEmail.trim() &&
      !watchedValues.inviteEmails.includes(newEmail.trim()) &&
      watchedValues.inviteEmails.length < 50;
    ) {}
      setValue("inviteEmails", [...watchedValues.inviteEmails, newEmail.trim()])
      setNewEmail("")
    }
  }

  const removeEmail = (email: string) => {}
    setValue(
      "inviteEmails",
      watchedValues.inviteEmails.filter((e) => e !== email),
    )
  }

  const addUserEmail = (user: unknown) => {}
    if (!watchedValues.inviteEmails.includes(user.email) && watchedValues.inviteEmails.length < 50) {}
      setValue("inviteEmails", [...watchedValues.inviteEmails, user.email])
    }
  }

  const filteredVideos = videos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatDuration = (seconds: number) => {}
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60;
    if (hours > 0) {}
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const steps = []
    { id: 1, title: "Basic Info", description: "Party details and video selection" },
    { id: 2, title: "Settings", description: "Privacy and participation settings" },
    { id: 3, title: "Invites", description: "Invite friends to your party" },
    { id: 4, title: "Review", description: "Review and create your party" },
  ]

  const canProceedToStep = (step: number) => {}
    switch (step) {}
      case 2:
        return watchedValues.name && watchedValues.videoId;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => router.back()} className=&quot;p-2">"
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Create Watch Party;
          </h1>
          <p className="text-muted-foreground mt-2">Set up your watch party and invite friends to join</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div;
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    activeStep === step.id;
                      ? "bg-primary text-primary-foreground"
                      : activeStep > step.id;
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {activeStep > step.id ? <Check className=&quot;h-4 w-4" /> : step.id}"
                </div>
                <div className="mt-2 text-center">
                  <div className="text-sm font-medium">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
              </div>
              {index < steps.length - 1 && (}
                <div;
                  className={cn(
                    "flex-1 h-0.5 mx-4 transition-colors",
                    activeStep > step.id ? &quot;bg-green-500" : "bg-muted",
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Step 1: Basic Information */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Basic Information;
                </CardTitle>
                <CardDescription>Set up the basic details for your watch party</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Party Name *</Label>
                  <Input;
                    id="name"
                    placeholder="Enter a catchy name for your party"
                    {...register("name")}
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea;
                    id="description"
                    placeholder="What are you watching? Add some context..."
                    {...register("description")}
                    className={`min-h-[100px] ${errors.description ? "border-destructive" : ""}`}
                  />
                  {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
                  <p className="text-xs text-muted-foreground mt-1">
                    {watchedValues.description?.length || 0}/500 characters;
                  </p>
                </div>

                <div>
                  <Label htmlFor="scheduledFor">Start Time *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button;
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !watchedValues.scheduledFor && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {watchedValues.scheduledFor ? (
                          format(watchedValues.scheduledFor, "PPP 'at' p")
                        ) : (
                          <span>Pick a date and time</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar;
                        mode="single"
                        selected={watchedValues.scheduledFor}
                        onSelect={(date) => {}
                          if (date) {}
                            // Preserve the time when selecting a new date;
                            const currentTime = watchedValues.scheduledFor;
                            const newDateTime = new Date(date)
                            newDateTime.setHours(currentTime.getHours())
                            newDateTime.setMinutes(currentTime.getMinutes())
                            setValue("scheduledFor", newDateTime)
                          }
                        }}
                        disabled={(date) => date < new Date()}
                        initialFocus;
                      />
                      <div className="p-3 border-t">
                        <Label htmlFor="time">Time</Label>
                        <Input;
                          id="time"
                          type="time"
                          value={format(watchedValues.scheduledFor, "HH:mm")}
                          onChange={(e) => {}
                            const [hours, minutes] = e.target.value.split(":")
                            const newDateTime = new Date(watchedValues.scheduledFor)
                            newDateTime.setHours(Number.parseInt(hours), Number.parseInt(minutes))
                            setValue("scheduledFor", newDateTime)
                          }}
                          className="mt-1"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                  {errors.scheduledFor && (
                    <p className="text-sm text-destructive mt-1">{errors.scheduledFor.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="maxParticipants">Maximum Participants *</Label>
                  <Select;
                    value={watchedValues.maxParticipants.toString()}
                    onValueChange={(value) => setValue(&quot;maxParticipants", Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 participants</SelectItem>
                      <SelectItem value="5">5 participants</SelectItem>
                      <SelectItem value="10">10 participants</SelectItem>
                      <SelectItem value="25">25 participants</SelectItem>
                      <SelectItem value="50">50 participants</SelectItem>
                      <SelectItem value="100">100 participants</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.maxParticipants && (
                    <p className="text-sm text-destructive mt-1">{errors.maxParticipants.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Video Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Select Video;
                </CardTitle>
                <CardDescription>Choose a video from your library to watch together</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingVideos ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Loading your videos...</p>
                  </div>
                ) : videos.length === 0 ? (
                  <div className="text-center py-8">
                    <Film className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No videos available</h3>
                    <p className="text-muted-foreground mb-4">You need to upload videos before creating a party.</p>
                    <Button onClick={() => router.push(&quot;/dashboard/videos/upload")}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Video;
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input;
                          placeholder="Search your videos..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {filteredVideos.map((video) => (
                        <div;
                          key={video.id}
                          className={cn(
                            "border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md",
                            watchedValues.videoId === video.id;
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50",
                          )}
                          onClick={() => setValue(&quot;videoId", video.id)}
                        >
                          <div className="flex gap-3">
                            <div className="relative w-20 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                              <img;
                                src={video.thumbnail || "/placeholder.svg"}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 rounded">
                                {formatDuration(video.duration)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm line-clamp-1">{video.title}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{video.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  {video.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(video.uploadedAt), "MMM d, yyyy")}
                                </span>
                              </div>
                            </div>
                            {watchedValues.videoId === video.id && (
                              <div className="flex-shrink-0">
                                <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {errors.videoId && <p className="text-sm text-destructive mt-2">{errors.videoId.message}</p>}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Settings */}
        {activeStep === 2 && (
          <div className="space-y-6">
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
                    {watchedValues.isPrivate ? <Lock className="h-4 w-4" /> : <Globe className=&quot;h-4 w-4" />}"
                    <div>
                      <Label htmlFor="isPrivate">Private Party</Label>
                      <p className="text-sm text-muted-foreground">
                        {watchedValues.isPrivate ? "Only invited users can join" : "Anyone can discover and join"}
                      </p>
                    </div>
                  </div>
                  <Switch;
                    id="isPrivate"
                    checked={watchedValues.isPrivate}
                    onCheckedChange={(checked) => setValue(&quot;isPrivate", checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requiresApproval">Require Approval</Label>
                    <p className="text-sm text-muted-foreground">Manually approve join requests</p>
                  </div>
                  <Switch;
                    id="requiresApproval"
                    checked={watchedValues.requiresApproval}
                    onCheckedChange={(checked) => setValue(&quot;requiresApproval", checked)}
                  />
                </div>

                {watchedValues.isPrivate && (
                  <>
                    <Separator />
                    <div>
                      <Label htmlFor="password">Party Password (Optional)</Label>
                      <Input;
                        id="password"
                        type="password"
                        placeholder="Set a password for additional security"
                        {...register("password")}
                        className={errors.password ? "border-destructive" : ""}
                      />
                      {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

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
                    <Label htmlFor="allowChat">Enable Chat</Label>
                    <p className="text-sm text-muted-foreground">Allow participants to chat during the party</p>
                  </div>
                  <Switch;
                    id="allowChat"
                    checked={watchedValues.allowChat}
                    onCheckedChange={(checked) => setValue(&quot;allowChat", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allowReactions">Enable Reactions</Label>
                    <p className="text-sm text-muted-foreground">Allow emoji reactions during playback</p>
                  </div>
                  <Switch;
                    id="allowReactions"
                    checked={watchedValues.allowReactions}
                    onCheckedChange={(checked) => setValue(&quot;allowReactions", checked)}
                  />
                </div>

                <div>
                  <Label>Video Control Permissions</Label>
                  <Select;
                    value={watchedValues.allowVideoControl}
                    onValueChange={(value: "host" | "all" | "moderators") => setValue(&quot;allowVideoControl", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="host">Host only</SelectItem>
                      <SelectItem value="moderators">Host and moderators</SelectItem>
                      <SelectItem value="all">All participants</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>Add tags to help others discover your party</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Input;
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === &quot;Enter" && (e.preventDefault(), addTag())}
                    disabled={watchedValues.tags.length >= 10}
                  />
                  <Button type="button" onClick={addTag} variant="outline" disabled={watchedValues.tags.length >= 10}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {watchedValues.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {watchedValues.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        #{tag}
                        <button type="button" onClick={() => removeTag(tag)} className=&quot;ml-1 hover:text-destructive">"
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">{watchedValues.tags.length}/10 tags</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Invitations */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Invite Friends;
                </CardTitle>
                <CardDescription>Invite people to join your watch party</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Suggested Friends */}
                {suggestedUsers.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Suggested Friends</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {suggestedUsers.map((user) => (
                        <div;
                          key={user.id}
                          className="flex items-center gap-3 p-2 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {user.firstName[0]}
                              {user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                          </div>
                          <Button;
                            type="button"
                            size="sm"
                            variant={watchedValues.inviteEmails.includes(user.email) ? "default" : "outline"}
                            onClick={() => addUserEmail(user)}
                            disabled={}
                              watchedValues.inviteEmails.includes(user.email) || watchedValues.inviteEmails.length >= 50;
                            }
                          >
                            {watchedValues.inviteEmails.includes(user.email) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Manual Email Invites */}
                <div>
                  <Label htmlFor="inviteEmails">Invite by Email</Label>
                  <div className="flex gap-2 mt-1">
                    <Input;
                      type="email"
                      placeholder="friend@example.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      onKeyPress={(e) => e.key === &quot;Enter" && (e.preventDefault(), addEmail())}
                      disabled={watchedValues.inviteEmails.length >= 50}
                    />
                    <Button;
                      type="button"
                      onClick={addEmail}
                      variant="outline"
                      disabled={watchedValues.inviteEmails.length >= 50}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {watchedValues.inviteEmails.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {watchedValues.inviteEmails.map((email) => (
                        <div key={email} className="flex items-center justify-between bg-muted p-2 rounded">
                          <span className="text-sm">{email}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeEmail(email)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">{watchedValues.inviteEmails.length}/50 invites</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 4: Review */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Party</CardTitle>
                <CardDescription>Double-check everything before creating your party</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Party Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Party Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">{watchedValues.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Start Time:</span>
                        <span className="font-medium">{format(watchedValues.scheduledFor, &quot;PPP &apos;at' p")}</span>"
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Participants:</span>
                        <span className="font-medium">{watchedValues.maxParticipants}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Privacy:</span>
                        <span className="font-medium">{watchedValues.isPrivate ? &quot;Private" : "Public"}</span>&quot;"
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Features</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Chat:</span>
                        <span className="font-medium">{watchedValues.allowChat ? &quot;Enabled" : "Disabled"}</span>&quot;"
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reactions:</span>
                        <span className="font-medium">{watchedValues.allowReactions ? &quot;Enabled" : "Disabled"}</span>&quot;"
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Video Control:</span>
                        <span className="font-medium capitalize">{watchedValues.allowVideoControl}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Approval Required:</span>
                        <span className="font-medium">{watchedValues.requiresApproval ? &quot;Yes" : "No"}</span>&quot;"
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Video */}
                {selectedVideo && (
                  <div>
                    <h3 className="font-medium mb-3">Selected Video</h3>
                    <div className="flex gap-3 p-3 border rounded-lg">
                      <div className="relative w-20 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                        <img;
                          src={selectedVideo.thumbnail || "/placeholder.svg"}
                          alt={selectedVideo.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 rounded">
                          {formatDuration(selectedVideo.duration)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{selectedVideo.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{selectedVideo.description}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {watchedValues.tags.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {watchedValues.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invites */}
                {watchedValues.inviteEmails.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Invites ({watchedValues.inviteEmails.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {watchedValues.inviteEmails.slice(0, 5).map((email) => (
                        <Badge key={email} variant="outline">
                          {email}
                        </Badge>
                      ))}
                      {watchedValues.inviteEmails.length > 5 && (
                        <Badge variant="outline">+{watchedValues.inviteEmails.length - 5} more</Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button;
            type="button"
            variant="outline"
            onClick={() => {}
              if (activeStep > 1) {}
                setActiveStep(activeStep - 1)
              } else {}
                router.back()
              }
            }}
          >
            {activeStep === 1 ? "Cancel" : "Previous"}
          </Button>

          <div className="flex gap-2">
            {activeStep < 4 ? (}
              <Button;
                type="button"
                onClick={() => setActiveStep(activeStep + 1)}
                disabled={!canProceedToStep(activeStep + 1)}
              >
                Next;
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading || !isValid} className="min-w-32">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Create Party;
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
