import { ChevronDown, ChevronRight, Clock, External, Headphones, HelpCircle, Mail, MessageCircle, Search, Settings, Smartphone, ThumbsDown, ThumbsUp, User, Users, Video } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

"use client"

interface FAQ {}
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  notHelpful: number;
}

interface SupportTicket {}
  id: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high"
  status: "open" | "in-progress" | "resolved" | "closed"
  createdAt: string;
  lastReply?: string;
}

export default function HelpPage() {}
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [contactForm, setContactForm] = useState({subject: "",
    category: "",
    priority: "medium" as const,
    message: "",
    email: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {}
    loadHelpData()
  }, [])

  const loadHelpData = async () => {}
    try {}
      setIsLoading(true)
      const token = localStorage.getItem("accessToken")

      // Load FAQs;
      const faqResponse = await fetch("/api/support/faqs/", {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (faqResponse.ok) {}
        const faqData = await faqResponse.json()
        setFaqs(faqData.results || [])
      }

      // Load support tickets;
      const ticketsResponse = await fetch("/api/support/tickets/", {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (ticketsResponse.ok) {}
        const ticketsData = await ticketsResponse.json()
        setSupportTickets(ticketsData.results || [])
      }

    } catch {}
      console.error("Failed to load help data:", error)
      toast({title: "Error",
        description: "Failed to load help content.",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(false)
    }
  }

  const categories = []
    { id: "all", name: "All Categories", icon: HelpCircle },
    { id: "Watch Parties", name: "Watch Parties", icon: VideoIcon },
    { id: "Technical", name: "Technical Issues", icon: Settings },
    { id: "Social", name: "Friends & Social", icon: Users },
    { id: "Mobile", name: "Mobile App", icon: Smartphone },
    { id: "Videos", name: "Videos & Upload", icon: VideoIcon },
    { id: "Settings", name: "Account Settings", icon: Settings },
    { id: "Privacy", name: "Privacy & Security", icon: Shield },
    { id: "Billing", name: "Billing & Plans", icon: CreditCard },
  ]

  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredFAQs = faqs.filter(faq => {}
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  })

  const submitContactForm = async () => {}
    if (!contactForm.subject || !contactForm.message || !contactForm.category) {}
      toast({title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return;
    }

    setIsSubmitting(true)
    try {}
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/support/tickets/", {}
        method: "POST",
        headers: {}
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(contactForm),
      })

      if (response.ok) {}
        toast({title: "Support Ticket Created",
          description: "We've received your message and will respond within 24 hours.",
        })
        setContactForm({subject: "",
          category: "",
          priority: "medium",
          message: "",
          email: "",
        })
      } else {}
        throw new Error("Failed to submit ticket")
      }
    } catch {}
      console.error("Failed to submit support ticket:", error)
      toast({title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setIsSubmitting(false)
    }
  }

  const markFAQHelpful = (faqId: string, helpful: boolean) => {}
    // In a real app, this would make an API call;
    toast({title: "Thank you!",
      description: "Your feedback helps us improve our help content.",
    })
  }

  const getStatusColor = (status: string) => {}
    switch (status) {}
      case "open": return "bg-blue-100 text-blue-800"
      case "in-progress": return "bg-yellow-100 text-yellow-800"
      case "resolved": return "bg-green-100 text-green-800"
      case "closed": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {}
    switch (priority) {}
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="h-10 w-10 text-blue-600" />
            Help & Support;
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions or get personalized support from our team;
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Book className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Browse FAQs</h3>
              <p className="text-gray-600">Find quick answers to common questions</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Contact Support</h3>
              <p className="text-gray-600">Get personalized help from our team</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Community</h3>
              <p className="text-gray-600">Connect with other users for tips</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <div className="space-y-6">
              {/* Search */}
              <Card>
                <CardContent className="p-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input;
                      placeholder="Search for help articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 text-lg py-6"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button;
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="flex items-center gap-2"
                  >
                    <category.icon className="h-4 w-4" />
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* FAQ List */}
              <div className="space-y-4">
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((faq) => (
                    <Card key={faq.id}>
                      <CardContent className="p-0">
                        <button;
                          className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                          onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-1">{faq.question}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <Badge variant="secondary">{faq.category}</Badge>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="h-3 w-3" />
                                  {faq.helpful}
                                </span>
                              </div>
                            </div>
                            {expandedFAQ === faq.id ? (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </button>

                        {expandedFAQ === faq.id && (
                          <div className="px-6 pb-6">
                            <Separator className="mb-4" />
                            <div className="prose max-w-none">
                              <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                            </div>
                            <div className="mt-6 pt-4 border-t">
                              <p className="text-sm text-gray-600 mb-3">Was this helpful?</p>
                              <div className="flex items-center gap-2">
                                <Button;
                                  variant="outline"
                                  size="sm"
                                  onClick={() => markFAQHelpful(faq.id, true)}
                                  className="flex items-center gap-1"
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                  Yes;
                                </Button>
                                <Button;
                                  variant="outline"
                                  size="sm"
                                  onClick={() => markFAQHelpful(faq.id, false)}
                                  className="flex items-center gap-1"
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                  No;
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No results found</h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your search or browse by category;
                      </p>
                      <Button variant="outline" onClick={() => setSearchQuery(&quot;")}>
                        Clear Search;
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Send us a message;
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input;
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select;
                      value={contactForm.category} 
                      onValueChange={(value) => setContactForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issues</SelectItem>
                        <SelectItem value="account">Account & Billing</SelectItem>
                        <SelectItem value="social">Friends & Social</SelectItem>
                        <SelectItem value="videos">Video Upload/Playback</SelectItem>
                        <SelectItem value="parties">Watch Parties</SelectItem>
                        <SelectItem value="mobile">Mobile App</SelectItem>
                        <SelectItem value="privacy">Privacy & Security</SelectItem>
                        <SelectItem value="feedback">Feature Request/Feedback</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select;
                      value={contactForm.priority} 
                      onValueChange={(value) => setContactForm(prev => ({ ...prev, priority: value as Record<string, unknown> }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - General question</SelectItem>
                        <SelectItem value="medium">Medium - Issue affecting usage</SelectItem>
                        <SelectItem value="high">High - Critical issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input;
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      We'll use your account email if not provided;
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea;
                      id="message"
                      placeholder="Please describe your issue in detail..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button;
                    onClick={submitContactForm} 
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message;
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Headphones className="h-5 w-5" />
                    Other ways to reach us;
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <Mail className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-semibold">Email Support</h3>
                      <p className="text-gray-600 mb-2">Get help via email</p>
                      <a href="mailto:support@watchparty.com" className="text-blue-600 hover:underline">
                        support@watchparty.com;
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <MessageCircle className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h3 className="font-semibold">Live Chat</h3>
                      <p className="text-gray-600 mb-2">Chat with our support team</p>
                      <p className="text-sm text-gray-500">Available Mon-Fri, 9AM-6PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 border rounded-lg">
                    <Globe className="h-6 w-6 text-purple-600 mt-1" />
                    <div>
                      <h3 className="font-semibold">Community Forum</h3>
                      <p className="text-gray-600 mb-2">Connect with other users</p>
                      <a href="/community" className="text-purple-600 hover:underline flex items-center gap-1">
                        Visit Forum <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900">Response Times</h3>
                        <ul className="text-sm text-blue-700 mt-2 space-y-1">
                          <li>• High Priority: Within 4 hours</li>
                          <li>• Medium Priority: Within 24 hours</li>
                          <li>• Low Priority: Within 48 hours</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Your Support Tickets;
                </CardTitle>
              </CardHeader>
              <CardContent>
                {supportTickets.length > 0 ? (
                  <div className="space-y-4">
                    {supportTickets.map((ticket) => (
                      <div key={ticket.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                            <p className="text-gray-600 text-sm">Ticket #{ticket.id}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority.toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status.replace("-", " ").toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Category: {ticket.category}</span>
                          <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                        {ticket.lastReply && (
                          <div className="mt-2 text-sm text-gray-600">
                            Last reply: {new Date(ticket.lastReply).toLocaleDateString()}
                          </div>
                        )}
                        <Button variant="outline" size="sm" className="mt-3">
                          View Details;
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No support tickets</h3>
                    <p className="text-gray-600 mb-6">You haven&apos;t created any support tickets yet.</p>
                    <Button>Create New Ticket</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <Book className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">User Guide</h3>
                  <p className="text-gray-600 mb-4">Complete guide to using all features</p>
                  <Button variant="outline" className="w-full">
                    Read Guide <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <VideoIcon className="h-12 w-12 text-green-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Video Tutorials</h3>
                  <p className="text-gray-600 mb-4">Step-by-step video walkthroughs</p>
                  <Button variant="outline" className="w-full">
                    Watch Videos <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Settings className="h-12 w-12 text-purple-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">API Documentation</h3>
                  <p className="text-gray-600 mb-4">For developers and integrations</p>
                  <Button variant="outline" className="w-full">
                    View Docs <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Smartphone className="h-12 w-12 text-orange-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Mobile App</h3>
                  <p className="text-gray-600 mb-4">Download our mobile apps</p>
                  <Button variant="outline" className="w-full">
                    Get Apps <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Globe className="h-12 w-12 text-teal-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Status Page</h3>
                  <p className="text-gray-600 mb-4">Check system status and uptime</p>
                  <Button variant="outline" className="w-full">
                    View Status <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Users className="h-12 w-12 text-pink-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Community</h3>
                  <p className="text-gray-600 mb-4">Join our user community</p>
                  <Button variant="outline" className="w-full">
                    Join Community <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
