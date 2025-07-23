"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, MessageSquare, Phone, MapPin, Send, CheckCircle } from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await api.post("/support/contact", formData)
      setSuccess(true)
      setFormData({ name: "", email: "", subject: "", category: "", message: "" })
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-neo-background">
      {/* Header */}
      <div className="border-b border-neo-border bg-neo-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="text-neo-text-secondary hover:text-neo-text-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold text-neo-text-primary">Contact Support</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="card">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-neo-text-primary flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-primary" />
                  Get in Touch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-neo-text-secondary">
                  Have questions or need help? We're here to assist you with any issues or feedback.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-neo-surface rounded-lg">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-neo-text-primary">Email</p>
                      <p className="text-sm text-neo-text-secondary">support@watchparty.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-neo-surface rounded-lg">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-neo-text-primary">Phone</p>
                      <p className="text-sm text-neo-text-secondary">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-neo-surface rounded-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-neo-text-primary">Address</p>
                      <p className="text-sm text-neo-text-secondary">
                        123 Stream Street
                        <br />
                        Video City, VC 12345
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Quick Links */}
            <Card className="card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-neo-text-primary">Quick Help</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/help">View FAQ</Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/dashboard/billing">Billing Issues</Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/help#technical">Technical Support</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="card">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-neo-text-primary">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                {success ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-neo-text-primary mb-2">Message Sent!</h3>
                    <p className="text-neo-text-secondary mb-4">
                      Thank you for contacting us. We'll get back to you within 24 hours.
                    </p>
                    <Button onClick={() => setSuccess(false)} variant="outline">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <Alert className="border-error bg-error/10">
                        <AlertDescription className="text-error">{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-neo-text-primary">
                          Name *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="input-base"
                          placeholder="Your full name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-neo-text-primary">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="input-base"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-neo-text-primary">
                          Category *
                        </Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleInputChange("category", value)}
                        >
                          <SelectTrigger className="input-base">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical Support</SelectItem>
                            <SelectItem value="billing">Billing & Payments</SelectItem>
                            <SelectItem value="account">Account Issues</SelectItem>
                            <SelectItem value="feature">Feature Request</SelectItem>
                            <SelectItem value="bug">Bug Report</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-neo-text-primary">
                          Subject *
                        </Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => handleInputChange("subject", e.target.value)}
                          className="input-base"
                          placeholder="Brief description of your issue"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-neo-text-primary">
                        Message *
                      </Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        className="input-base min-h-[120px]"
                        placeholder="Please provide as much detail as possible..."
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
                      {isLoading ? (
                        "Sending..."
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
