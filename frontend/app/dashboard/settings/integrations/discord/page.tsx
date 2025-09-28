'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ChatBubbleLeftRightIcon,
  MicrophoneIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { integrationsAPI } from '@/lib/api'
import type { HealthStatus, IntegrationConnection } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/ui/loading'

interface DiscordServer {
  id: string
  name: string
  member_count?: number
  is_connected?: boolean
}

export default function DiscordIntegrationPage() {
  const [connection, setConnection] = useState<IntegrationConnection | null>(null)
  const [health, setHealth] = useState<HealthStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState<'connect' | 'disconnect' | 'refresh' | null>(null)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [connectionsResponse, healthResponse] = await Promise.all([
        integrationsAPI.getConnections(),
        integrationsAPI.getHealth().catch(() => null),
      ])
      const discordConnection = connectionsResponse.connections?.find(
        (item) => item.provider === &apos;discord'
      )
      setConnection(discordConnection ?? null)
      setHealth(healthResponse)
    } catch (error) {
      console.error('Failed to load Discord integration', error)
      toast({
        title: 'Unable to load Discord integration',
        description: 'Check your network connection and try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      setAction(null)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const servers: DiscordServer[] = useMemo(() => {
    const rawServers = (connection?.metadata?.servers as DiscordServer[] | undefined) ?? []
    return rawServers
  }, [connection])

  const handleConnect = async () => {
    setAction('connect')
    try {
      const { auth_url } = await integrationsAPI.getAuthUrl('discord')
      window.location.assign(auth_url)
    } catch (error) {
      console.error('Failed to start Discord OAuth', error)
      toast({
        title: 'Connection failed',
        description: 'We were unable to start the Discord authorization flow.',
        variant: 'destructive',
      })
      setAction(null)
    }
  }

  const handleDisconnect = async () => {
    if (!connection) return

    setAction('disconnect')
    try {
      await integrationsAPI.disconnectConnection(connection.id)
      toast({
        title: 'Discord disconnected',
        description: 'The integration has been removed from your account.',
      })
      await loadData()
    } catch (error) {
      console.error('Failed to disconnect Discord', error)
      toast({
        title: 'Unable to disconnect',
        description: 'We could not disconnect the Discord integration. Try again later.',
        variant: 'destructive',
      })
      setAction(null)
    }
  }

  const handleRefresh = async () => {
    setAction('refresh')
    await loadData()
  }

  const healthMessage = useMemo(() => {
    if (!health) return 'Discord service status is currently unavailable.'
    const discordService = health.services?.find((service) => service.name === 'discord')
    if (!discordService) return 'Discord health information is not available from the status endpoint.'
    return discordService.status === 'up'
      ? 'Discord integrations are operational.'
      : 'Discord integrations are reporting issues.'
  }, [health])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-indigo-300" />
            <h1 className="text-4xl font-bold text-white">Discord Integration</h1>
          </div>
          <p className="text-white/70 text-lg max-w-3xl">
            Connect Discord to share party updates, synchronize voice channels, and broadcast what you are watching to your
            community in real time.
          </p>
        </header>

        {loading ? (
          <div className="flex items-center gap-3 text-white/70">
            <LoadingSpinner /> Loading Discord data…
          </div>
        ) : (
          <div className="space-y-8">
            <section
              className="rounded-xl border border-white/10 bg-white/10 p-6 text-white shadow-sm backdrop-blur"
              data-testid="discord-connection-card"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">Connection status</h2>
                  <p className="text-white/70">{healthMessage}</p>
                  {connection ? (
                    <div className="rounded-lg border border-green-400/40 bg-green-400/10 px-4 py-3 text-sm">
                      <p className="font-medium">Connected as {connection.account_email ?? connection.display_name}</p>
                      {connection.connected_at && (
                        <p className="text-white/70">
                          Connected on {new Date(connection.connected_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-yellow-400/40 bg-yellow-400/10 px-4 py-3 text-sm">
                      <p className="font-medium">Discord is not connected.</p>
                      <p className="text-white/70">Start the OAuth flow to grant Watch Party the necessary permissions.</p>
                    </div>
                  )}
                  {connection?.last_error && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm">
                      <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 flex-none" />
                      <div>
                        <p className="font-medium">Integration error</p>
                        <p className="text-white/70">{connection.last_error}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={action === 'refresh'}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    data-testid="discord-refresh"
                  >
                    {action === 'refresh' ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 animate-spin" /> Refreshing…
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="h-4 w-4" /> Refresh
                      </>
                    )}
                  </button>
                  {connection ? (
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      disabled={action === 'disconnect'}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                      data-testid="discord-disconnect"
                    >
                      {action === 'disconnect' ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 animate-spin" /> Disconnecting…
                        </>
                      ) : (
                        <>
                          <XMarkIcon className="h-4 w-4" /> Disconnect
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConnect}
                      disabled={action === 'connect'}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                      data-testid="discord-connect"
                    >
                      {action === 'connect' ? (
                        <>
                          <ArrowPathIcon className="h-4 w-4 animate-spin" /> Redirecting…
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4" /> Connect Discord
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-white/10 p-6 text-white shadow-sm backdrop-blur">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MicrophoneIcon className="w-5 h-5" /> Connected servers
              </h2>
              {servers.length === 0 ? (
                <p className="text-white/70 text-sm">
                  No Discord servers are linked to this integration yet. Once connected, select servers and channels from the
                  authorization prompt.
                </p>
              ) : (
                <ul className="space-y-3" data-testid="discord-server-list">
                  {servers.map((server) => (
                    <li
                      key={server.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium">{server.name}</p>
                        {typeof server.member_count === 'number' && (
                          <p className="text-sm text-white/70">{server.member_count} members</p>
                        )}
                      </div>
                      <span className={server.is_connected ? 'text-green-300' : 'text-yellow-300'}>
                        {server.is_connected ? 'Notifications enabled' : 'Not enabled'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
