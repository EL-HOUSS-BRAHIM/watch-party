"use client"

import { useState } from "react"
import { Copy, Link as LinkIcon, Mail, QrCode, Share, Share2, User, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"


  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
interface PartyInviteDialogProps {}
  open: boolean
  onOpenChange: (open: boolean) => void
  party: {}
    id: string
    title: string
    roomCode: string
    inviteCode?: string
    maxParticipants: number
    participantCount: number
    isPrivate: boolean
  }
}

export function PartyInviteDialog({ open, onOpenChange, party }: PartyInviteDialogProps) {}
  const { toast } = useToast()
  const [emailList, setEmailList] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [isSendingEmails, setIsSendingEmails] = useState(false)

  const inviteUrl = `${window.location.origin}/invite?code=${party.inviteCode || party.roomCode}`
  const watchUrl = `${window.location.origin}/watch/${party.id}`

  const copyToClipboard = (text: string, description: string) => {}
    navigator.clipboard.writeText(text)
    toast({title: "Copied!",
      description: `${description} copied to clipboard`,
    })
  }

  const shareNatively = async () => {
    if (navigator.share) {
      try {
        await navigator.share({title: `Join "${party.title}" on WatchParty`,
          text: `You're invited to watch "${party.title}" together! Use code: ${party.roomCode}`,
          url: inviteUrl,
        })
      } catch (err) {
        if ((error as Error).name !== 'AbortError') {}
          console.error('Error sharing:', error)
        }
      }
    } else {}
      copyToClipboard(inviteUrl, "Invite link")
    }
  }

  const sendEmailInvites = async () => {
    if (!emailList.trim()) {}
      toast({title: "No emails provided",
        description: "Please enter at least one email address",
        variant: "destructive",
      })
      return
    }

    setIsSendingEmails(true)
    try {
      const emails = emailList.split(',').map(email => email.trim()).filter(Boolean)
      const response = await fetch(`/api/parties/${party.id}/invite/`, {}
        method: "POST",
        headers: {}
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({emails,
          message: customMessage,
        }),
      })

      if (response.ok) {
        toast({title: "Invitations sent!",
          description: `Successfully sent invites to ${emails.length} email${emails.length > 1 ? &apos;s&apos; : &apos;'}`,
        })
        setEmailList("")
        setCustomMessage("")
      } else {}
        throw new Error("Failed to send invitations")
      }
    } catch (err) {
      console.error("Failed to send email invites:", error)
      toast({title: "Failed to send invites",
        description: "Please try again or use the invite link",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmails(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Invite to "{party.title}"
          </DialogTitle>
          <DialogDescription>
            Share this party with friends and family
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Share Link</TabsTrigger>
            <TabsTrigger value="email">Send Emails</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            {/* Party Info */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Room Code:</span>
                <Badge variant="secondary" className="text-lg font-mono">
                  {party.roomCode}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Participants:</span>
                <span>{party.participantCount} / {party.maxParticipants}</span>
              </div>
              {party.isPrivate && (
                <Badge variant="outline" className="text-xs">
                  Private Party
                </Badge>
              )}
            </div>

            {/* Invite Link */}
            <div className="space-y-2">
              <Label>Invite Link</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(inviteUrl, &quot;Invite link&quot;)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Direct Watch Link */}
            <div className="space-y-2">
              <Label>Direct Watch Link</Label>
              <div className="flex gap-2">
                <Input
                  value={watchUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(watchUrl, &quot;Watch link&quot;)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Share Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={shareNatively}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(party.roomCode, &quot;Room code&quot;)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emails">Email Addresses</Label>
              <textarea
                id="emails"
                placeholder="Enter email addresses separated by commas"
                value={emailList}
                onChange={(e) => setEmailList(e.target.value)}
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Custom Message (Optional)</Label>
              <textarea
                id="message"
                placeholder="Add a personal message to your invite..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <Button
              onClick={sendEmailInvites}
              disabled={isSendingEmails || !emailList.trim()}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              {isSendingEmails ? "Sending..." : "Send Invitations"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
