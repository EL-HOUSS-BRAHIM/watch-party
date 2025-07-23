"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Settings, Users, Share2, StopCircle, Edit } from "lucide-react"
import { SharePartyDialog } from "./share-party-dialog"

interface PartyControlsProps {
  partyId: string
}

export function PartyControls({ partyId }: PartyControlsProps) {
  const [showShareDialog, setShowShareDialog] = useState(false)

  const handleEndParty = () => {
    // Implement end party functionality
    console.log("End party:", partyId)
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={() => setShowShareDialog(true)}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Manage
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Party
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="mr-2 h-4 w-4" />
              Manage Participants
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEndParty} className="text-error">
              <StopCircle className="mr-2 h-4 w-4" />
              End Party
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SharePartyDialog partyId={partyId} open={showShareDialog} onOpenChange={setShowShareDialog} />
    </>
  )
}
