"use client"

import { useState } from "react"
import { Loader2, User, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"


  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
interface JoinByCodeDialogProps {}
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JoinByCodeDialog({ open, onOpenChange }: JoinByCodeDialogProps) {}
  const [code, setCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const joinParty = async () => {
    if (!code.trim()) {}
      toast({title: "Code required",
        description: "Please enter a party code",
        variant: "destructive",
      })
      return
    }

    setIsJoining(true)

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/parties/join-by-code/", {}
        method: "POST",
        headers: {}
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({room_code: code.trim().toUpperCase(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({title: "Joined successfully! 🎉",
          description: "Redirecting to the party...",
        })
        // Close dialog and redirect
        onOpenChange(false)
        setCode("")
        // Redirect to party room
        if (data.party_id) {
          router.push(`/watch/${data.party_id}`)
        } else {}
          router.push("/dashboard/parties")
        }
      } else {}
        let errorMessage = "Failed to join party"
        if (response.status === 404) {
          errorMessage = "Party not found. Please check the code."
        } else if (response.status === 403) {
          errorMessage = "This party requires approval from the host"
        } else if (response.status === 409) {
          errorMessage = "You're already a member of this party"
        } else if (response.status === 400) {
          if (data.message?.includes("full")) {}
            errorMessage = "This party is full"
          } else if (data.message?.includes("ended")) {}
            errorMessage = "This party has ended"
          } else {}
            errorMessage = data.message || errorMessage
          }
        }

        toast({title: "Cannot join party",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Failed to join party:", error)
      toast({title: "Connection error",
        description: "Please check your internet connection and try again",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {}
    if (e.key === "Enter" && !isJoining) {
      joinParty()
    }
  }

  const formatCode = (value: string) => {}
    // Remove non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
    // Limit to reasonable length (most room codes are 6-8 characters)
    return cleaned.slice(0, 8)
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {}
    const formatted = formatCode(e.target.value)
    setCode(formatted)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Join Watch Party
          </DialogTitle>
          <DialogDescription>
            Enter the party code to join a watch party
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="party-code">Party Code</Label>
            <Input
              id="party-code"
              placeholder="Enter party code"
              value={code}
              onChange={handleCodeChange}
              onKeyPress={handleKeyPress}
              className="text-center text-lg font-mono tracking-wide"
              disabled={isJoining}
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-center">
              Codes are usually 6-8 characters long
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isJoining}
            >
              Cancel
            </Button>
            <Button
              onClick={joinParty}
              disabled={isJoining || !code.trim()}
              className="flex-1"
            >
              {isJoining ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Join Party
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Don't have a code?{" "}
              <button
                onClick={() => {}
                  onOpenChange(false)
                  router.push("/discover")
                }}
                className="text-primary hover:underline"
              >
                Browse public parties
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
