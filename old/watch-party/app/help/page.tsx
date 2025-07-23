"use client"

import { useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Search, ChevronDown, MessageCircle, Book, Video, Users } from "lucide-react"

const faqCategories = [
  {
    name: "Getting Started",
    icon: Book,
    questions: [
      {
        question: "How do I create my first watch party?",
        answer:
          "To create a watch party, sign up for an account, go to your dashboard, and click 'Create Party'. Add your video source (Google Drive, S3, or direct URL), set the start time, and invite your friends!",
      },
      {
        question: "What video formats are supported?",
        answer:
          "We support MP4, WebM, MOV, and streaming formats like HLS and DASH. You can upload directly or stream from Google Drive, Amazon S3, or any direct video URL.",
      },
      {
        question: "How many people can join a watch party?",
        answer:
          "Free accounts support up to 5 participants per party. Premium accounts have unlimited participants. All parties include real-time chat and synchronized playback.",
      },
    ],
  },
  {
    name: "Video & Streaming",
    icon: Video,
    questions: [
      {
        question: "Why is my video not syncing properly?",
        answer:
          "Video sync issues can occur due to network latency. Try refreshing the page, checking your internet connection, or asking the host to restart the video. Our system automatically corrects minor sync drift.",
      },
      {
        question: "Can I stream from Netflix or other platforms?",
        answer:
          "Due to copyright restrictions, we don't support streaming from Netflix, Hulu, or other subscription services. You can use your own video files or public streaming sources.",
      },
      {
        question: "What's the maximum video file size?",
        answer:
          "Free accounts can upload videos up to 500MB. Premium accounts support files up to 5GB. For larger files, we recommend using cloud storage links.",
      },
    ],
  },
  {
    name: "Account & Billing",
    icon: Users,
    questions: [
      {
        question: "How do I upgrade to Premium?",
        answer:
          "Go to your dashboard, click on 'Billing', and select the Premium plan. You'll get unlimited participants, 4K quality, advanced features, and priority support.",
      },
      {
        question: "Can I cancel my subscription anytime?",
        answer:
          "Yes! You can cancel your Premium subscription at any time from your billing settings. You'll continue to have Premium features until the end of your billing period.",
      },
      {
        question: "Do you offer refunds?",
        answer:
          "We offer a 30-day money-back guarantee for Premium subscriptions. Contact our support team if you're not satisfied with your experience.",
      },
    ],
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Section */}
        <div className="py-24 sm:py-32">
          <div className="container px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">How can we help you?</h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Find answers to common questions or get in touch with our support team.
              </p>

              <div className="mt-10 relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-base pl-12 h-14 text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-24 sm:py-32 bg-secondary">
          <div className="container px-4">
            <div className="mx-auto max-w-4xl">
              <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Frequently Asked Questions</h2>

              <div className="space-y-8">
                {filteredCategories.map((category) => (
                  <Card key={category.name}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <category.icon className="h-6 w-6 text-primary" />
                        {category.name}
                        <Badge variant="secondary">{category.questions.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {category.questions.map((faq, index) => {
                        const itemId = `${category.name}-${index}`
                        return (
                          <Collapsible
                            key={itemId}
                            open={openItems.includes(itemId)}
                            onOpenChange={() => toggleItem(itemId)}
                          >
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                className="w-full justify-between p-4 h-auto text-left hover:bg-secondary"
                              >
                                <span className="font-medium text-foreground">{faq.question}</span>
                                <ChevronDown
                                  className={`h-4 w-4 transition-transform ${
                                    openItems.includes(itemId) ? "rotate-180" : ""
                                  }`}
                                />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="px-4 pb-4">
                              <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                            </CollapsibleContent>
                          </Collapsible>
                        )
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredCategories.length === 0 && searchQuery && (
                <div className="text-center py-12">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try different keywords or{" "}
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      browse all questions
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="py-24 sm:py-32">
          <div className="container px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground mb-6">Still need help?</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our support team is here to help you get the most out of Watch Party.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Live Chat</h3>
                    <p className="text-muted-foreground mb-4">Get instant help from our support team</p>
                    <Button className="btn-primary">Start Chat</Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Email Support</h3>
                    <p className="text-muted-foreground mb-4">Send us a detailed message about your issue</p>
                    <Button variant="outline">Send Email</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
