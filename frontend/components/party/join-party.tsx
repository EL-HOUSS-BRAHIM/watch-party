"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { partiesAPI } from "@/lib/api"

export function JoinParty() {
  const [partyCode, setPartyCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  // Check if there's a code in the URL
  const urlCode = searchParams.get("code")
  
  useState(() => {
    if (urlCode) {
      setPartyCode(urlCode)
    }
  })

  const joinParty = async () => {
    if (!partyCode.trim()) {
      setError("Please enter a party code")
      return
    }

    setIsJoining(true)
    setError("")

    try {
      const response = await partiesAPI.joinByCode(partyCode.trim().toUpperCase())
      const partyId = response.party?.id

      if (!partyId) {
        throw new Error("The server response did not include a party identifier")
      }
      toast({
        title: "Joined party!",
        description: "Welcome to the watch party",
      })

      if (response.redirect_url) {
        window.location.href = response.redirect_url
      } else {
        router.push(`/watch/${partyId}`)
      }
    } catch {
      const errorData = err?.response?.data
      const message = errorData?.message || err?.message
      setError(message || "Failed to join party. Please check the code and try again.")
    } finally {
      setIsJoining(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      joinParty()
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <CardTitle>Join Watch Party</CardTitle>
        <CardDescription>
          Enter the party code to join your friends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="party-code">Party Code</Label>
          <Input
            id="party-code"
            value={partyCode}
            onChange={(e) => setPartyCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="text-center text-lg tracking-widest font-mono"
            autoFocus
          />
          <p className="text-xs text-muted-foreground mt-1">
            The party code is usually 6 characters long
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={joinParty}
          disabled={isJoining || !partyCode.trim()}
          className="w-full"
        >
          {isJoining ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Joining...
            </>
          ) : (
            "Join Party"
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          <p>Don&apos;t have a party code?</p>
          <Button variant="link" className="text-sm p-0 h-auto">
            Create your own party
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
