import { Activity, AlertTriangle, Check, CheckCircle, Copy, Key, Link, Plus, Refresh, Settings, Shield, Trash, X, XCircle, Zap } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { integrationsAPI } from "@/lib/api"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"

"use client"

  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
interface APIKey {}
  id: string;
  name: string;
  key: string;
  permissions: string[]
  rateLimit: number;
  lastUsed: string;
  createdAt: string;
  isActive: boolean;
  usage: {}
    requests: number;
    limit: number;
    resetDate: string;
  }
}

interface Integration {}
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  status: "connected" | "disconnected" | "error"
  config: Record<string, any>
  lastSync: string;
  features: string[]
}

interface WebhookEndpoint {}
  id: string;
  url: string;
  events: string[]
  secret: string;
  isActive: boolean;
  lastDelivery: string;
  successRate: number;
  createdAt: string;
}

export default function IntegrationAPISystem() {}
  const { toast } = useToast()
  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([])
  const [showCreateKeyDialog, setShowCreateKeyDialog] = useState(false)
  const [showCreateWebhookDialog, setShowCreateWebhookDialog] = useState(false)
  const [selectedTab, setSelectedTab] = useState("api-keys")
  const [isLoading, setIsLoading] = useState(false)

  // Load integrations data;
  useEffect(() => {}
    loadIntegrations()
  }, [])

  const loadIntegrations = useCallback(async () => {}
    try {}
      setIsLoading(true)
      // Fetch available integrations data from API;
      const healthData = await integrationsAPI.getHealth()
      // For now, create placeholder data since specific endpoints don't exist yet;
      // In a real implementation, these would be separate API endpoints;
      // Placeholder API keys (would come from a dedicated endpoint)
      const placeholderAPIKeys: APIKey[] = []
        {}
          id: "1",
          name: "Production API",
          key: "wp_live_sk_1234567890abcdef",
          permissions: ["read", "write", "admin"],
          rateLimit: 1000,
          lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          usage: {}
            requests: 750,
            limit: 1000,
            resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        },
        {}
          id: "2",
          name: "Development API",
          key: "wp_test_sk_abcdef1234567890",
          permissions: ["read", "write"],
          rateLimit: 100,
          lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true,
          usage: {}
            requests: 45,
            limit: 100,
            resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
        },
      ]

      // Use health data to determine integration status;
      const integrationsWithStatus: Integration[] = []
        {}
          id: "google_drive",
          name: "Google Drive",
          description: "Import videos directly from Google Drive",
          icon: "🗂️",
          category: "Storage",
          status: healthData.google_drive ? "connected" : "disconnected",
          config: { autoSync: healthData.google_drive || false },
          lastSync: healthData.google_drive ? new Date(Date.now() - 60 * 60 * 1000).toISOString() : "",
          features: ["Video Import", "Auto Sync", "Folder Monitoring"],
        },
        {}
          id: "s3",
          name: "Amazon S3",
          description: "Store and serve video content",
          icon: "☁️",
          category: "Storage",
          status: healthData.s3_storage ? "connected" : "disconnected",
          config: { bucket: healthData.s3_storage ? "watchparty-videos" : "" },
          lastSync: healthData.s3_storage ? new Date(Date.now() - 30 * 60 * 1000).toISOString() : "",
          features: ["Video Storage", "CDN Integration", "Backup"],
        },
        {}
          id: "discord",
          name: "Discord",
          description: "Send notifications to Discord channels",
          icon: "💬",
          category: "Communication",
          status: "disconnected", // Not in health endpoint;
          config: {},
          lastSync: "",
          features: ["Party Notifications", "Event Reminders", "User Mentions"],
        },
      ]

      // Placeholder webhooks (would come from a dedicated endpoint)
      const placeholderWebhooks: WebhookEndpoint[] = []
        {}
          id: "1",
          url: "https://api.example.com/webhooks/watchparty",
          events: ["party.created", "party.started", "user.joined"],
          secret: "whsec_1234567890abcdef",
          isActive: true,
          lastDelivery: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          successRate: 98.5,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {}
          id: "2",
          url: "https://hooks.slack.com/services/...",
          events: ["party.ended", "video.uploaded"],
          secret: "whsec_abcdef1234567890",
          isActive: true,
          lastDelivery: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          successRate: 100,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]

      setApiKeys(placeholderAPIKeys)
      setIntegrations(integrationsWithStatus)
      setWebhooks(placeholderWebhooks)
    } catch {}
      console.error("Failed to load integrations:", error)
      toast({title: "Error",
        description: "Failed to load integrations data",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(false)
    }
  }, [])

  const handleCreateAPIKey = async (formData: FormData) => {}
    setIsLoading(true)
    try {}
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newKey: APIKey = { id: Date.now().toString(),
        name: formData.get("name") as string,
        key: `wp_${formData.get("environment")}_sk_${Math.random().toString(36).substring(2, 18)}`,
        permissions: (formData.get("permissions") as string).split(","),
        rateLimit: Number.parseInt(formData.get("rateLimit") as string) || 100,
        lastUsed: "",
        createdAt: new Date().toISOString(),
        isActive: true,
        usage: {}
          requests: 0,
          limit: Number.parseInt(formData.get("rateLimit") as string) || 100,
          resetDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        },
      }

      setApiKeys((prev) => [newKey, ...prev])
      setShowCreateKeyDialog(false)

      toast({title: "API Key Created",
        description: "Your new API key has been generated successfully.",
      })
    } catch {}
      toast({title: "Error",
        description: "Failed to create API key. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(false)
    }
  }

  const handleCreateWebhook = async (formData: FormData) => {}
    setIsLoading(true)
    try {}
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newWebhook: WebhookEndpoint = { id: Date.now().toString(),
        url: formData.get("url") as string,
        events: (formData.get("events") as string).split(",").map((e) => e.trim()),
        secret: `whsec_${Math.random().toString(36).substring(2, 18)}`,
        isActive: true,
        lastDelivery: "",
        successRate: 100,
        createdAt: new Date().toISOString(),
      }

      setWebhooks((prev) => [newWebhook, ...prev])
      setShowCreateWebhookDialog(false)

      toast({title: "Webhook Created",
        description: "Your webhook endpoint has been configured successfully.",
      })
    } catch {}
      toast({title: "Error",
        description: "Failed to create webhook. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(false)
    }
  }

  const handleToggleAPIKey = async (keyId: string) => {}
    try {}
      setApiKeys((prev) => prev.map((key) => (key.id === keyId ? { ...key, isActive: !key.isActive } : key)))

      toast({title: "API Key Updated",
        description: "API key status has been updated.",
      })
    } catch {}
      toast({title: "Error",
        description: "Failed to update API key status.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAPIKey = async (keyId: string) => {}
    try {}
      setApiKeys((prev) => prev.filter((key) => key.id !== keyId))

      toast({title: "API Key Deleted",
        description: "The API key has been permanently deleted.",
      })
    } catch {}
      toast({title: "Error",
        description: "Failed to delete API key.",
        variant: "destructive",
      })
    }
  }

  const handleCopyKey = (key: string) => {}
    navigator.clipboard.writeText(key)
    toast({title: "Copied",
      description: "API key copied to clipboard.",
    })
  }

  const handleConnectIntegration = async (integrationId: string) => {}
    try {}
      setIsLoading(true)
      const integration = integrations.find(i => i.id === integrationId)
      if (integration?.name === "Google Drive") {}
        // Get Google Drive auth URL and redirect;
        const authResponse = await integrationsAPI.getGoogleDriveAuthUrl()
        window.location.href = authResponse.auth_url;
        return;
      }
      // For other integrations, use generic auth;
      if (integration) {}
        const authResponse = await integrationsAPI.getAuthUrl(integration.name.toLowerCase().replace(/\s+/g, '-'))
        window.location.href = authResponse.auth_url;
      }
    } catch {}
      console.error("Failed to connect integration:", error)
      toast({title: "Error",
        description: "Failed to connect integration. Please try again.",
        variant: "destructive",
      })
    } finally {}
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {}
    switch (status) {}
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "disconnected":
        return <XCircle className="h-4 w-4 text-gray-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const maskAPIKey = (key: string) => {}
    return key.substring(0, 12) + "..." + key.substring(key.length - 4)
  }

  const sampleCode = { javascript: `// Initialize the WatchParty API client;
const WatchParty = require('@watchparty/api');

const client = new WatchParty({apiKey: 'your_api_key_here',
  environment: 'production' // or 'sandbox'
});

// Create a new watch party;
const party = await client.parties.create({title: 'Movie Night',
  description: 'Join us for a great movie!',
  videoId: 'video_123',
  scheduledStart: '2024-02-01T20:00:00Z',
  maxParticipants: 50;
});

console.log('Party created:', party.id);`,

    python: `# Install: pip install watchparty-api;
from watchparty import WatchPartyClient;
# Initialize client;
client = WatchPartyClient(
    api_key='your_api_key_here',
    environment='production'
)

# Create a watch party;
party = client.parties.create(
    title='Movie Night',
    description='Join us for a great movie!',
    video_id='video_123',
    scheduled_start='2024-02-01T20:00:00Z',
    max_participants=50;
)

print(f'Party created: {party.id}')`,

    curl: `# Create a watch party using cURL;
curl -X POST https://api.watchparty.com/v1/parties \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{}
    "title": "Movie Night",
    "description": "Join us for a great movie!",
    "videoId": "video_123",
    "scheduledStart": "2024-02-01T20:00:00Z",
    "maxParticipants": 50;
  }'`,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration APIs</h1>
          <p className="text-muted-foreground">Manage API keys, integrations, and webhooks</p>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">API Keys</h2>
              <p className="text-muted-foreground">Manage your API keys for accessing the WatchParty API</p>
            </div>

            <Dialog open={showCreateKeyDialog} onOpenChange={setShowCreateKeyDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key;
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>Generate a new API key for accessing the WatchParty API</DialogDescription>
                </DialogHeader>

                <form;
                  onSubmit={(e) => {}
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleCreateAPIKey(formData)
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="name">Key Name</Label>
                    <Input id="name" name="name" placeholder="Production API Key" required />
                  </div>

                  <div>
                    <Label htmlFor="environment">Environment</Label>
                    <Select name="environment" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="live">Production</SelectItem>
                        <SelectItem value="test">Development</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="permissions">Permissions</Label>
                    <Select name="permissions" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select permissions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="read">Read Only</SelectItem>
                        <SelectItem value="read,write">Read & Write</SelectItem>
                        <SelectItem value="read,write,admin">Full Access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="rateLimit">Rate Limit (requests/hour)</Label>
                    <Input id="rateLimit" name="rateLimit" type="number" defaultValue="100" />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateKeyDialog(false)}>
                      Cancel;
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Key"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        {apiKey.name}
                      </CardTitle>
                      <CardDescription>
                        Created {new Date(apiKey.createdAt).toLocaleDateString()}
                        {apiKey.lastUsed && ` • Last used ${new Date(apiKey.lastUsed).toLocaleDateString()}`}
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                        {apiKey.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Switch checked={apiKey.isActive} onCheckedChange={() => handleToggleAPIKey(apiKey.id)} />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-muted rounded text-sm font-mono">{maskAPIKey(apiKey.key)}</code>
                    <Button variant="outline" size="sm" onClick={() => handleCopyKey(apiKey.key)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Permissions</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {apiKey.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Rate Limit</p>
                      <p className="font-medium">{apiKey.rateLimit}/hour</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Usage</p>
                      <p className="font-medium">
                        {apiKey.usage.requests}/{apiKey.usage.limit}
                      </p>
                      <div className="w-full bg-muted rounded-full h-1 mt-1">
                        <div;
                          className="bg-primary h-1 rounded-full"
                          style={{ width: `${(apiKey.usage.requests / apiKey.usage.limit) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleDeleteAPIKey(apiKey.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Third-Party Integrations</h2>
            <p className="text-muted-foreground">
              Connect with external services to enhance your watch party experience;
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{integration.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {integration.category}
                        </Badge>
                      </div>
                    </div>

                    {getStatusIcon(integration.status)}
                  </div>
                  <CardDescription>{integration.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Features</p>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {integration.lastSync && (
                    <p className="text-xs text-muted-foreground">
                      Last synced: {new Date(integration.lastSync).toLocaleString()}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {integration.status === "connected" ? (
                      <>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure;
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" className="flex-1" onClick={() => handleConnectIntegration(integration.id)}>
                        <Link className="h-4 w-4 mr-2" />
                        Connect;
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Webhook Endpoints</h2>
              <p className="text-muted-foreground">Configure webhooks to receive real-time event notifications</p>
            </div>

            <Dialog open={showCreateWebhookDialog} onOpenChange={setShowCreateWebhookDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webhook;
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Webhook Endpoint</DialogTitle>
                  <DialogDescription>Add a new webhook endpoint to receive event notifications</DialogDescription>
                </DialogHeader>

                <form;
                  onSubmit={(e) => {}
                    e.preventDefault()
                    const formData = new FormData(e.currentTarget)
                    handleCreateWebhook(formData)
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="url">Endpoint URL</Label>
                    <Input id="url" name="url" type="url" placeholder="https://api.example.com/webhooks" required />
                  </div>

                  <div>
                    <Label htmlFor="events">Events (comma separated)</Label>
                    <Input id="events" name="events" placeholder="party.created, party.started, user.joined" required />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateWebhookDialog(false)}>
                      Cancel;
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Webhook"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Webhook className="h-5 w-5" />
                        {webhook.url}
                      </CardTitle>
                      <CardDescription>
                        Created {new Date(webhook.createdAt).toLocaleDateString()}
                        {webhook.lastDelivery &&
                          ` • Last delivery ${new Date(webhook.lastDelivery).toLocaleDateString()}`}
                      </CardDescription>
                    </div>

                    <Badge variant={webhook.isActive ? "default" : "secondary"}>
                      {webhook.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Events</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {webhook.events.slice(0, 2).map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                        {webhook.events.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{webhook.events.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Success Rate</p>
                      <p className="font-medium">{webhook.successRate}%</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Secret</p>
                      <code className="text-xs bg-muted p-1 rounded">{webhook.secret.substring(0, 12)}...</code>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Activity className="h-4 w-4 mr-2" />
                      View Logs;
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure;
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="documentation" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">API Documentation</h2>
            <p className="text-muted-foreground">Learn how to integrate with the WatchParty API</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Start</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Key className="h-4 w-4" />
                    <span>Get your API key</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Code className="h-4 w-4" />
                    <span>Make your first request</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Webhook className="h-4 w-4" />
                    <span>Set up webhooks</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start">
                    <Globe className="h-4 w-4 mr-2" />
                    API Reference;
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Code className="h-4 w-4 mr-2" />
                    SDKs & Libraries;
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Authentication;
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Zap className="h-4 w-4 mr-2" />
                    Rate Limits;
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Code Examples</CardTitle>
                  <CardDescription>Get started with these code samples</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="javascript" className="w-full">
                    <TabsList>
                      <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                      <TabsTrigger value="python">Python</TabsTrigger>
                      <TabsTrigger value="curl">cURL</TabsTrigger>
                    </TabsList>

                    {Object.entries(sampleCode).map(([language, code]) => (
                      <TabsContent key={language} value={language}>
                        <div className="relative">
                          <SyntaxHighlighter;
                            language={language === "curl" ? "bash" : language}
                            style={tomorrow}
                            className="rounded-lg"
                          >
                            {code}
                          </SyntaxHighlighter>
                          <Button;
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2 bg-transparent"
                            onClick={() => {}
                              navigator.clipboard.writeText(code)
                              toast({ title: "Copied", description: "Code copied to clipboard." })
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
