'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Copy, Share2, QrCode, Users, Gift } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function InviteFriends() {
  const [referralCode, setReferralCode] = useState('WATCH2024')
  const [invitesSent, setInvitesSent] = useState(12)
  const [friendsJoined, setFriendsJoined] = useState(5)
  const { toast } = useToast()

  const inviteLink = `https://watchparty.app/join?ref=${referralCode}`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Copied to clipboard!',
      description: 'Share this link with your friends',
    })
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neo-text-primary">{invitesSent}</p>
                <p className="text-sm text-neo-text-secondary">Invites Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Gift className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neo-text-primary">{friendsJoined}</p>
                <p className="text-sm text-neo-text-secondary">Friends Joined</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-premium/10">
                <Gift className="h-5 w-5 text-premium" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neo-text-primary">
                  ${friendsJoined * 5}
                </p>
                <p className="text-sm text-neo-text-secondary">Earned Credits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite Link */}
      <Card className="card">
        <CardHeader>
          <CardTitle className="text-neo-text-primary flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Invite Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={inviteLink}
              readOnly
              className="input-base flex-1"
            />
            <Button
              onClick={() => copyToClipboard(inviteLink)}
              className="btn-primary"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR Code
            </Button>
            <Button variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Social Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referral Code */}
      <Card className="card">
        <CardHeader>
          <CardTitle className="text-neo-text-primary">
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-lg px-4 py-2 font-mono">
              {referralCode}
            </Badge>
            <Button
              variant="ghost"
              onClick={() => copyToClipboard(referralCode)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rewards Info */}
      <Card className="card border-premium/20 bg-gradient-to-r from-premium/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="h-6 w-6 text-premium" />
            <h3 className="text-lg font-semibold text-neo-text-primary">
              Earn Rewards
            </h3>
          </div>
          <div className="space-y-2 text-neo-text-secondary">
            <p>• Get $5 credit for each friend who joins</p>
            <p>• Your friend gets 50% off their first month</p>
            <p>• Unlock premium features faster</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
