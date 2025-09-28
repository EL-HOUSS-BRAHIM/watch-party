"use client"

import { Calendar, Check, CheckCircle, Clock, Edit, Eye, Loader2, Lock, MessageCircle, Play, Plus, Share, User, Users, X, XCircle } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { format, isSameDay, parseISO } from "date-fns"
import { eventsAPI } from "@/lib/api"
import type { WatchEvent, EventAttendee, CreateEventRequest } from "@/lib/api/types"

  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
export default function EventSchedulingSystem() {
  const { toast } = useToast()
  const [events, setEvents] = useState<WatchEvent[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedEvent, setSelectedEvent] = useState<WatchEvent | null>(null)
  const [eventAttendees, setEventAttendees] = useState<EventAttendee[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)

  // Load events from API
  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setIsLoadingEvents(true)
      const response = await eventsAPI.getEvents({page: 1,
        limit: 100,
        status: filterStatus === "all" ? undefined : filterStatus as Record<string, unknown>,
      })
      setEvents(response.results)
    } catch (err) {
      console.error("Failed to load events:", error)
      toast({title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingEvents(false)
    }
  }

  // Reload events when filter changes
  useEffect(() => {
    loadEvents()
  }, [filterStatus])

  const loadEventAttendees = async (eventId: string) => {}
    try {
      const attendees = await eventsAPI.getEventAttendees(eventId)
      setEventAttendees(attendees.results)
    } catch (err) {
      console.error("Failed to load attendees:", error)
      toast({title: "Error",
        description: "Failed to load event attendees.",
        variant: "destructive",
      })
    }
  }

  // Load attendees when event is selected
  useEffect(() => {
    if (selectedEvent) {
      loadEventAttendees(selectedEvent.id)
    }
  }, [selectedEvent])

  const handleCreateEvent = async (formData: FormData) => {}
    setIsLoading(true)
    try {
      const eventData: CreateEventRequest = { title: formData.get("title") as string,
        description: formData.get("description") as string,
        start_time: new Date(formData.get("startTime") as string).toISOString(),
        end_time: new Date(formData.get("endTime") as string).toISOString(),
        timezone: "UTC",
        privacy: formData.get("privacy") as "public" | "private" | "invite-only",
        max_attendees: Number.parseInt(formData.get("maxAttendees") as string) || 50,
        video_id: "temp-video", // This should be selected from a video picker
        is_virtual: formData.get("isVirtual") === "on",
        meeting_link: formData.get("meetingLink") as string,
        tags: (formData.get("tags") as string).split(",").map((tag) => tag.trim()),
        reminders: ["1 hour", "15 minutes"],
        allow_guest_invites: formData.get("allowGuestInvites") === "on",
        require_approval: formData.get("requireApproval") === "on",
      }

      const newEvent = await eventsAPI.createEvent(eventData)
      // Add to local state
      setEvents((prev) => [newEvent, ...prev])
      setShowCreateDialog(false)

      toast({title: "Event Created",
        description: "Your watch party event has been scheduled!",
      })
    } catch (err) {
      console.error("Failed to create event:", error)
      toast({title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRSVP = async (eventId: string, status: "going" | "maybe" | "not-going") => {}
    try {
      await eventsAPI.rsvpToEvent(eventId, { status })
      // Update local state
      setEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, rsvp_status: status } : event)))

      toast({title: "RSVP Updated",
        description: `You have marked yourself as ${status} for this event.`,
      })
    } catch (err) {
      console.error("Failed to update RSVP:", error)
      toast({title: "Error",
        description: "Failed to update RSVP. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleJoinEvent = async (eventId: string) => {}
    try {
      const event = events.find((e) => e.id === eventId)
      if (!event) return
      // Join the live event via API
      await eventsAPI.joinEvent(eventId)

      // Open the meeting link
      if (event.meeting_link) {
        window.open(event.meeting_link, "_blank")
      }

      toast({title: "Joining Event",
        description: "Opening watch party room...",
      })
    } catch (err) {
      console.error("Failed to join event:", error)
      toast({title: "Error",
        description: "Failed to join event. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCancelEvent = async (eventId: string) => {}
    try {
      await eventsAPI.cancelEvent(eventId)
      // Update local state
      setEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, status: "cancelled" } : event)))

      toast({title: "Event Cancelled",
        description: "The event has been cancelled and attendees will be notified.",
      })
    } catch (err) {
      console.error("Failed to cancel event:", error)
      toast({title: "Error",
        description: "Failed to cancel event. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusIcon = (status: string) => {}
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "live":
        return <Play className="h-4 w-4 text-green-500" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-gray-500" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getPrivacyIcon = (privacy: string) => {}
    switch (privacy) {
      case "public":
        return <Globe className="h-4 w-4 text-green-500" />
      case "private":
        return <Lock className="h-4 w-4 text-red-500" />
      case "invite-only":
        return <Eye className="h-4 w-4 text-blue-500" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const getRSVPStatusColor = (status: string) => {}
    switch (status) {
      case "going":
        return "bg-green-100 text-green-800"
      case "maybe":
        return "bg-yellow-100 text-yellow-800"
      case "not-going":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredEvents = events.filter((event) => {}
    if (filterStatus === "all") return true
    return event.status === filterStatus
  })

  const eventsForSelectedDate = events.filter((event) => isSameDay(parseISO(event.start_time), selectedDate))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Scheduling</h1>
          <p className="text-muted-foreground">Create and manage watch party events</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={(value: "calendar" | "list") => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">Calendar</SelectItem>
              <SelectItem value="list">List</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Watch Party Event</DialogTitle>
                <DialogDescription>Schedule a new watch party event for your community</DialogDescription>
              </DialogHeader>

              <form
                onSubmit={(e) => {}
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  handleCreateEvent(formData)
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Event Title</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div>
                    <Label htmlFor="videoTitle">Video/Content</Label>
                    <Input id="videoTitle" name="videoTitle" placeholder="Select or enter video title" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input id="startTime" name="startTime" type="datetime-local" required />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input id="endTime" name="endTime" type="datetime-local" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="privacy">Privacy</Label>
                    <Select name="privacy" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select privacy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="invite-only">Invite Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="maxAttendees">Max Attendees</Label>
                    <Input id="maxAttendees" name="maxAttendees" type="number" defaultValue="50" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="isVirtual" name="isVirtual" defaultChecked />
                    <Label htmlFor="isVirtual">Virtual Event</Label>
                  </div>

                  <div>
                    <Label htmlFor="meetingLink">Meeting Link (for virtual events)</Label>
                    <Input id="meetingLink" name="meetingLink" type="url" />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="allowGuestInvites" name="allowGuestInvites" />
                    <Label htmlFor="allowGuestInvites">Allow guest invites</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="requireApproval" name="requireApproval" />
                    <Label htmlFor="requireApproval">Require approval to join</Label>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input id="tags" name="tags" placeholder="movie, sci-fi, discussion" />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Event"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoadingEvents ? (
        <Card>
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
            <h3 className="text-lg font-semibold mb-2">Loading Events</h3>
            <p className="text-muted-foreground">Please wait while we fetch your events...</p>
          </CardContent>
        </Card>
      ) : viewMode === "calendar" ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Events for Selected Date */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Events for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
              <CardDescription>
                {eventsForSelectedDate.length} event{eventsForSelectedDate.length !== 1 ? "s" : ""} scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              {eventsForSelectedDate.length > 0 ? (
                <div className="space-y-4">
                  {eventsForSelectedDate.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{event.title}</h3>
                            {getStatusIcon(event.status)}
                            <Badge variant="outline" className="text-xs capitalize">
                              {event.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {format(parseISO(event.start_time), "h:mm a")} - {format(parseISO(event.end_time), "h:mm a")}
                          </p>
                          <p className="text-sm">{event.description}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {getPrivacyIcon(event.privacy)}
                          {event.rsvp_status && (
                            <Badge className={getRSVPStatusColor(event.rsvp_status)}>{event.rsvp_status}</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.current_attendees}/{event.max_attendees}
                          </div>
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={event.host.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{event.host.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {event.host.name}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {event.status === "live" && (
                            <Button size="sm" onClick={() => handleJoinEvent(event.id)}>
                              <Play className="h-4 w-4 mr-2" />
                              Join
                            </Button>
                          )}

                          {event.status === "scheduled" && !event.rsvp_status && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => handleRSVP(event.id, "going")}>
                                Going
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleRSVP(event.id, "maybe")}>
                                Maybe
                              </Button>
                            </div>
                          )}

                          {event.is_host && event.status === "scheduled" && (
                            <Button size="sm" variant="outline" onClick={() => handleCancelEvent(event.id)}>
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No events scheduled for this date</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* List View */
        <div className="grid gap-6">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle>{event.title}</CardTitle>
                        {getStatusIcon(event.status)}
                        <Badge variant="outline" className="text-xs capitalize">
                          {event.status}
                        </Badge>
                        {getPrivacyIcon(event.privacy)}
                      </div>
                      <CardDescription>{event.description}</CardDescription>
                    </div>

                    {event.rsvp_status && (
                      <Badge className={getRSVPStatusColor(event.rsvp_status)}>{event.rsvp_status}</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarIcon className="h-4 w-4" />
                        {format(parseISO(event.start_time), "MMM d, yyyy")}
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        {format(parseISO(event.start_time), "h:mm a")} - {format(parseISO(event.end_time), "h:mm a")}
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4" />
                        {event.current_attendees}/{event.max_attendees} attendees
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={event.host.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{event.host.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        Hosted by {event.host.name}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-1">
                        {event.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {event.status === "live" && (
                          <Button onClick={() => handleJoinEvent(event.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Join Event
                          </Button>
                        )}

                        {event.status === "scheduled" && !event.rsvp_status && (
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => handleRSVP(event.id, "going")}>
                              Going
                            </Button>
                            <Button variant="outline" onClick={() => handleRSVP(event.id, "maybe")}>
                              Maybe
                            </Button>
                            <Button variant="outline" onClick={() => handleRSVP(event.id, "not-going")}>
                              Can't Go
                            </Button>
                          </div>
                        )}

                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>

                        {event.is_host && (
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                <p className="text-muted-foreground mb-4">
                  {filterStatus === "all"
                    ? "You haven't created or joined any events yet."
                    : `No ${filterStatus} events found.`}
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Event
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedEvent.title}</DialogTitle>
              <DialogDescription>{selectedEvent.description}</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="details" className="w-full">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="attendees">Attendees</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Event Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          {format(parseISO(selectedEvent.start_time), "MMMM d, yyyy")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {format(parseISO(selectedEvent.start_time), "h:mm a")} -{" "}
                          {format(parseISO(selectedEvent.end_time), "h:mm a")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {selectedEvent.current_attendees}/{selectedEvent.max_attendees} attendees
                        </div>
                        <div className="flex items-center gap-2">
                          {getPrivacyIcon(selectedEvent.privacy)}
                          <span className="capitalize">{selectedEvent.privacy}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Host</h4>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={selectedEvent.host.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{selectedEvent.host.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{selectedEvent.host.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Video</h4>
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <img
                          src={selectedEvent.video?.thumbnail || "/placeholder.svg"}
                          alt={selectedEvent.video?.title || "Video"}
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium">{selectedEvent.video?.title || "No video"}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedEvent.video?.duration ? Math.floor(selectedEvent.video.duration / 60) : 0} minutes
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedEvent.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attendees" className="space-y-4">
                <div className="space-y-4">
                  {eventAttendees.map((attendee) => (
                    <div key={attendee.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={attendee.user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{attendee.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{attendee.user.name}</span>
                            {attendee.role === "host" && <Crown className="h-4 w-4 text-yellow-500" />}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            RSVP'd {format(parseISO(attendee.rsvp_date), "MMM d")}
                          </p>
                        </div>
                      </div>

                      <Badge className={getRSVPStatusColor(attendee.status)}>{attendee.status}</Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="discussion">
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Event discussion will be available closer to the event date</p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
