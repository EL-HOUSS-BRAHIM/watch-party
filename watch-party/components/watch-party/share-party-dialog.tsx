"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Copy, Mail, MessageSquare } from "lucide-react"

interface SharePartyDialogProps {
  partyId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SharePartyDialog({ partyId, open, onOpenChange }: SharePartyDialogProps) {
  const [inviteEmail, setInviteEmail] = useState("")
  const { toast } = useToast()

  const partyUrl = `${window.location.origin}/watch/${partyId}`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Link copied to clipboard",
    })
  }

  const sendEmailInvite = () => {
    // Implement email invite functionality
    console.log("Send email invite to:", inviteEmail)
    toast({
      title: "Invite sent!",
      description: `Invitation sent to ${inviteEmail}`,
    })
    setInviteEmail("")
  }

  const shareToSocial = (platform: string) => {
    const text = "Join me for a watch party!"
    const url = partyUrl

    switch (platform) {
      case "twitter":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`)
        break
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`)
        break
      case "discord":
        copyToClipboard(`${text} ${url}`)
        toast({
          title: "Ready for Discord!",
          description: "Message copied to clipboard - paste it in Discord",
        })
        break
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Watch Party</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Share Link</TabsTrigger>
            <TabsTrigger value="invite">Send Invite</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <Label>Party Link</Label>
              <div className="flex space-x-2">
                <Input value={partyUrl} readOnly className="input-base" />
                <Button size="sm" onClick={() => copyToClipboard(partyUrl)} className="btn-secondary">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Share on Social Media</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => shareToSocial("twitter")} className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button variant="outline" size="sm" onClick={() => shareToSocial("whatsapp")} className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm" onClick={() => shareToSocial("discord")} className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Discord
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="invite" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex space-x-2">
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="input-base"
                />
                <Button onClick={sendEmailInvite} disabled={!inviteEmail} className="btn-primary">
                  <Mail className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
