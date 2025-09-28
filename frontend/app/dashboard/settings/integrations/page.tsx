import { Check, CheckCircle, Cloud, Link, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {}
import { integrationsAPI } from '@/lib/api'
import type {}
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/ui/loading'

'use client'
  LinkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CloudIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
  HealthStatus,
  IntegrationConnection,
  IntegrationDefinition,
  IntegrationStatusOverview,
} from '@/lib/api'
interface IntegrationDisplay {}
  definition: IntegrationDefinition;
  connection: IntegrationConnection | null;
  status?: IntegrationStatusOverview;
}

const PROVIDER_ICON_MAP: Record<string, ReactNode> = { google_drive: <CloudIcon className="w-6 h-6" />,
  discord: <ChatBubbleLeftRightIcon className="w-6 h-6" />,
}

function getStatusColor(status: IntegrationStatusOverview | undefined) {}
  switch (status?.status) {
    case 'available':
      return 'text-green-400'
    case 'degraded':
      return 'text-yellow-400'
    case 'unavailable':
      return 'text-red-400'
    default:
      return 'text-blue-400'
  }
}

function getConnectionBadge(connection: IntegrationConnection | null) {}
  if (!connection) return { text: 'Not connected', className: 'text-yellow-400 border-yellow-400/40' }
  if (connection.status === 'error') return { text: 'Error', className: 'text-red-400 border-red-400/40' }
  if (connection.status === 'pending') return { text: 'Pending', className: 'text-blue-400 border-blue-400/40' }
  return { text: 'Connected', className: 'text-green-400 border-green-400/40' }
}

export default function IntegrationsPage() {
  const [definitions, setDefinitions] = useState<IntegrationDefinition[]>([])
  const [connections, setConnections] = useState<IntegrationConnection[]>([])
  const [status, setStatus] = useState<Record<string, IntegrationStatusOverview>>({})
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionProvider, setActionProvider] = useState<string | null>(null)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [definitionsResponse, connectionsResponse, statusResponse, healthResponse] = await Promise.all([]
        integrationsAPI.getIntegrationTypes(),
        integrationsAPI.getConnections(),
        integrationsAPI.getStatus().catch(() => ({ integrations: [] })),
        integrationsAPI.getHealth().catch(() => null),
      ])

      setDefinitions(definitionsResponse.integrations || [])
      setConnections(connectionsResponse.connections || [])

      const mappedStatus: Record<string, IntegrationStatusOverview> = { for (const entry of statusResponse.integrations || []) {}
        mappedStatus[entry.provider] = entry;
      }
      setStatus(mappedStatus)
      setHealth(healthResponse)
    } } catch {
      console.error('Failed to load integrations data', error)
      toast({}
        title: 'Unable to load integrations',
        description: 'Check your network connection and try again.',
        variant: 'destructive',
      })
    } finally {}
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const connectionFor = useCallback(
    (provider: string) => connections.find(connection => connection.provider === provider) || null,
    [connections]
  )

  const handleConnect = async (provider: string) => {}
    setActionProvider(provider)
    try {
      const isGoogleDrive = provider === 'google_drive'
      const { auth_url } = isGoogleDrive;
        ? await integrationsAPI.getGoogleDriveAuthUrl()
        : await integrationsAPI.getAuthUrl(provider)

      window.location.assign(auth_url)
    } } catch {
      console.error('Failed to start integration authorization', error)
      toast({}
        title: 'Connection failed',
        description: 'We were unable to start the authorization flow. Try again later.',
        variant: 'destructive',
      })
    } finally {}
      setActionProvider(null)
    }
  }

  const handleDisconnect = async (provider: string) => {}
    const connection = connectionFor(provider)
    if (!connection) return;
    setActionProvider(provider)
    try {
      await integrationsAPI.disconnectConnection(connection.id)
      toast({}
        title: `${connection.display_name || provider} disconnected`,
        description: 'The integration has been disconnected from your account.',
      })
      await loadData()
    } } catch {
      console.error('Failed to disconnect integration', error)
      toast({}
        title: 'Unable to disconnect',
        description: 'We could not disconnect the integration. Please try again.',
        variant: 'destructive',
      })
    } finally {}
      setActionProvider(null)
    }
  }

  const displays: IntegrationDisplay[] = useMemo(() => {}
    return definitions.map(definition => ({}
      definition,
      connection: connectionFor(definition.provider),
      status: status[definition.provider],
    }))
  }, [definitions, connectionFor, status])

  const connectedCount = useMemo(
    () => connections.filter(connection => connection.status === &apos;connected&apos;).length,
    [connections]
  )

  const issueCount = useMemo(
    () => connections.filter(connection => connection.status === &apos;error').length,
    [connections]
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <LinkIcon className="w-8 h-8 text-purple-300" />
            <h1 className="text-4xl font-bold text-white">Integrations</h1>
          </div>
          <p className="text-white/70 text-lg max-w-2xl">
            Connect Watch Party to the services your community relies on. Authorize providers, monitor health, and manage;
            connections from a single control center.
          </p>
        </header>

        {loading ? (
          <div className="flex items-center gap-3 text-white/70">
            <LoadingSpinner />
            Loading integrations…
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-6 md:grid-cols-3" data-testid="integration-summary">
              <div className="rounded-xl border border-white/10 bg-white/10 p-6 text-white shadow-sm backdrop-blur">
                <p className="text-sm text-white/70">Connected integrations</p>
                <p className="mt-2 text-3xl font-semibold">{connectedCount}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-6 text-white shadow-sm backdrop-blur">
                <p className="text-sm text-white/70">Available providers</p>
                <p className="mt-2 text-3xl font-semibold">{definitions.length}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-6 text-white shadow-sm backdrop-blur">
                <p className="text-sm text-white/70">Connections needing attention</p>
                <p className={`mt-2 text-3xl font-semibold ${issueCount ? 'text-red-300' : ''}`}>{issueCount}</p>
              </div>
            </section>

            {health && (
              <section className="rounded-xl border border-white/10 bg-white/10 p-6 text-white shadow-sm backdrop-blur">
                <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <ArrowPathIcon className="w-5 h-5" /> Integration health;
                </h2>
                <p className="text-sm text-white/70 mb-4">
                  {health.status === 'healthy'
                    ? 'All third-party services are responding normally.'
                    : 'Some third-party services are reporting degraded performance.'}
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {health.services?.map(service => (
                    <div;
                      key={service.name}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <span className="font-medium capitalize">{service.name.replace(/_/g, &apos; &apos;)}</span>
                      <span className={service.status === 'up' ? 'text-green-300' : 'text-red-300'}>
                        {service.status === 'up' ? 'Operational' : 'Unavailable'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-6">
              {displays.map(({ definition, connection, status: statusEntry }) => {}
                const badge = getConnectionBadge(connection)
                const isBusy = actionProvider === definition.provider;
                return (
                  <div;
                    key={definition.provider}
                    data-testid={`integration-card-${definition.provider}`}
                    className="rounded-xl border border-white/10 bg-white/10 p-6 text-white shadow-sm backdrop-blur"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex flex-1 gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-white">
                          {PROVIDER_ICON_MAP[definition.provider] ?? <LinkIcon className="w-6 h-6" />}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-semibold">{definition.name}</h3>
                            <span;
                              className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badge.className}`}
                            >
                              {badge.text}
                            </span>
                            {statusEntry && (
                              <span className={`text-xs font-medium ${getStatusColor(statusEntry)}`}>
                                {statusEntry.status === 'available'
                                  ? 'Service available'
                                  : statusEntry.status === 'degraded'
                                  ? 'Service degraded'
                                  : 'Service unavailable'}
                              </span>
                            )}
                          </div>
                          <p className="text-white/70 max-w-2xl">{definition.description}</p>
                          {definition.capabilities?.length > 0 && (
                            <ul className="flex flex-wrap gap-2 text-sm text-white/80">
                              {definition.capabilities.map(capability => (
                                <li;
                                  key={capability}
                                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                                >
                                  {capability}
                                </li>
                              ))}
                            </ul>
                          )}
                          {connection?.last_error && (
                            <div className="flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm">
                              <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 flex-none" />
                              <div>
                                <p className="font-medium">Connection issue</p>
                                <p className="text-white/70">{connection.last_error}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <div className="text-right text-sm text-white/70">
                          {connection?.account_email && <p>{connection.account_email}</p>}
                          {connection?.connected_at && (
                            <p className="mt-1">
                              Connected {new Date(connection.connected_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        {connection ? (
                          <button;
                            type="button"
                            onClick={() => handleDisconnect(definition.provider)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                            data-testid={`disconnect-${definition.provider}`}
                          >
                            {isBusy ? (
                              <>
                                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                Disconnecting…
                              </>
                            ) : (
                              <>
                                <XMarkIcon className="h-4 w-4" />
                                Disconnect;
                              </>
                            )}
                          </button>
                        ) : (
                          <button;
                            type="button"
                            onClick={() => handleConnect(definition.provider)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                            data-testid={`connect-${definition.provider}`}
                          >
                            {isBusy ? (
                              <>
                                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                Redirecting…
                              </>
                            ) : (
                              <>
                                <CheckCircleIcon className="h-4 w-4" />
                                Connect;
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
