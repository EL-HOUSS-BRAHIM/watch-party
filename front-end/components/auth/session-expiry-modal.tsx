'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/auth-context'

interface SessionExpiryModalProps {
  isOpen: boolean
  onClose: () => void
  expiresAt: Date
}

export function SessionExpiryModal({ isOpen, onClose, expiresAt }: SessionExpiryModalProps) {
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isExtending, setIsExtending] = useState(false)
  const router = useRouter()
  const { logout, refreshToken } = useAuth()

  useEffect(() => {
    if (!isOpen) return

    const updateTimer = () => {
      const now = new Date().getTime()
      const expires = expiresAt.getTime()
      const remaining = Math.max(0, expires - now)
      setTimeRemaining(remaining)

      if (remaining === 0) {
        handleExpiry()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [isOpen, expiresAt])

  const handleExpiry = async () => {
    await logout()
    router.push('/login?reason=session_expired')
    onClose()
  }

  const handleExtendSession = async () => {
    setIsExtending(true)
    try {
      await refreshToken()
      onClose()
    } catch (error) {
      await handleExpiry()
    } finally {
      setIsExtending(false)
    }
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressValue = Math.max(0, (timeRemaining / (5 * 60 * 1000)) * 100) // 5 minutes warning

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ⚠️ Session Expiring Soon
          </DialogTitle>
          <DialogDescription>
            Your session will expire in {formatTime(timeRemaining)}. 
            Would you like to extend your session?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Time remaining</span>
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExpiry}
            disabled={isExtending}
          >
            Logout Now
          </Button>
          <Button
            onClick={handleExtendSession}
            disabled={isExtending}
          >
            {isExtending ? 'Extending...' : 'Extend Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
