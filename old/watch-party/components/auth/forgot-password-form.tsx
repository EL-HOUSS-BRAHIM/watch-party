'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // TODO: Implement password reset API call
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate API call
      
      setIsSubmitted(true)
      toast({
        title: 'Reset link sent!',
        description: 'Check your email for password reset instructions.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reset link. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="card max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-success" />
          </div>
          <CardTitle className="text-neo-text-primary">
            Check your email
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-neo-text-secondary">
            We've sent a password reset link to
          </p>
          <p className="text-neo-text-primary font-medium">
            {email}
          </p>
          <p className="text-sm text-neo-text-secondary">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <Button
            variant="ghost"
            onClick={() => setIsSubmitted(false)}
            className="mt-4"
          >
            Try different email
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-neo-text-primary">
          Forgot your password?
        </CardTitle>
        <p className="text-neo-text-secondary">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-neo-text-primary">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base"
              required
            />
          </div>

          <Button
            type="submit"
            className="btn-primary w-full"
            disabled={isLoading || !email}
          >
            {isLoading ? 'Sending...' : 'Send reset link'}
          </Button>

          <div className="text-center">
            <Button variant="ghost" type="button">
              Back to login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
