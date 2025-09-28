'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Share2, Users, Clock, Link } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface InviteLinksGeneratorProps {
  partyId: string
  partyName: string
  hostName: string
  isPublic: boolean
  onTogglePublic: () => void
}

export function InviteLinksGenerator({ 
  partyId, 
  partyName, 
  hostName, 
  isPublic, 
  onTogglePublic 
}: InviteLinksGeneratorProps) {
  const [inviteCode, setInviteCode] = useState(generateInviteCode())
  const [expiryHours, setExpiryHours] = useState(24)
  const [maxUses, setMaxUses] = useState(0) // 0 = unlimited
  const { toast } = useToast()

  function generateInviteCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${inviteCode}`

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteUrl)
    toast({
      title: 'Link copied!',
      description: 'Invite link has been copied to clipboard.',
    })
  }

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(inviteCode)
    toast({
      title: 'Code copied!',
      description: 'Invite code has been copied to clipboard.',
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${partyName}`,
          text: `${hostName} invited you to watch ${partyName} together!`,
          url: inviteUrl
        })
      } catch {
        // User cancelled sharing
      }
    } else {
      await handleCopyLink()
    }
  }

  const handleRegenerateCode = () => {
    setInviteCode(generateInviteCode())
    toast({
      title: 'New code generated',
      description: 'A new invite code has been created.',
    })
  }

  return (
    <div className="space-y-6">
      {/* Quick Share Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Quick Share
          </CardTitle>
          <CardDescription>
            Share your watch party with friends
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleShare} className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share Link
            </Button>
            <Button variant="outline" onClick={handleCopyLink}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium mb-1">Invite Link</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
              {inviteUrl}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Invite Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Invite Code
          </CardTitle>
          <CardDescription>
            Share this code for easy joining
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold tracking-wider text-purple-600 dark:text-purple-400 mb-2">
                {inviteCode}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter this code at watchparty.app/join
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopyCode} className="flex-1">
              <Copy className="w-4 h-4 mr-2" />
              Copy Code
            </Button>
            <Button variant="outline" onClick={handleRegenerateCode}>
              Regenerate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code */}
      <Card>
        <CardHeader>
          <CardTitle>QR Code</CardTitle>
          <CardDescription>
            Scan to join instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center p-6 bg-white rounded-lg">
            <QRCodeSVG 
              value={inviteUrl}
              size={200}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
              includeMargin={true}
            />
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            Scan with any QR code reader
          </p>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Invite Settings</CardTitle>
          <CardDescription>
            Configure invite link options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Public Party</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Allow anyone to discover and join
              </p>
            </div>
            <Button
              variant={isPublic ? "default" : "outline"}
              size="sm"
              onClick={onTogglePublic}
            >
              {isPublic ? 'Public' : 'Private'}
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Link expires in (hours)
            </label>
            <Input
              type="number"
              value={expiryHours}
              onChange={(e) => setExpiryHours(parseInt(e.target.value) || 24)}
              min="1"
              max="168"
              className="w-full"
            />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Link will expire in {expiryHours} hours
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Maximum uses (0 = unlimited)
            </label>
            <Input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(parseInt(e.target.value) || 0)}
              min="0"
              max="100"
              className="w-full"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Expires: {new Date(Date.now() + expiryHours * 60 * 60 * 1000).toLocaleDateString()}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              Max uses: {maxUses || 'Unlimited'}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Link className="w-3 h-3" />
              {isPublic ? 'Public' : 'Private'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
