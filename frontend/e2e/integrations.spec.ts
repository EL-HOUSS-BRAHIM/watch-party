import { test, expect } from '@playwright/test'

test.describe('Integrations management', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const win = window as typeof window & {
        __mockNavigations: string[]
        __originalAssign?: typeof window.location.assign
      }

      win.__mockNavigations = []
      const originalAssign = window.location.assign.bind(window.location)
      win.__originalAssign = originalAssign
      window.location.assign = (url: string | URL) => {
        win.__mockNavigations.push(url.toString())
      }
    })

    await page.route('**/api/auth/login/', route =>
      route.fulfill({
        json: { token: 'test-token' },
      })
    )

    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('shows integration overview with live data and handles connect/disconnect', async ({ page }) => {
    let driveDisconnected = false

    await page.route('**/api/integrations/types/', route =>
      route.fulfill({
        json: {
          integrations: [
            {
              id: 'google-drive',
              provider: 'google_drive',
              name: 'Google Drive',
              description: 'Import content from your Drive folders.',
              capabilities: ['File import', 'Streaming'],
            },
            {
              id: 'discord',
              provider: 'discord',
              name: 'Discord',
              description: 'Share party activity with your Discord community.',
              capabilities: ['Presence', 'Notifications'],
            },
          ],
        },
      })
    )

    await page.route('**/api/integrations/connections/', route =>
      route.fulfill({
        json: driveDisconnected
          ? { connections: [] }
          : {
              connections: [
                {
                  id: 'conn-gdrive',
                  provider: 'google_drive',
                  display_name: 'Google Drive',
                  status: 'connected',
                  account_email: 'drive@example.com',
                  connected_at: '2024-05-10T12:00:00Z',
                  permissions: ['drive.readonly'],
                },
              ],
            },
      })
    )

    await page.route('**/api/integrations/status/', route =>
      route.fulfill({
        json: {
          integrations: [
            { provider: 'google_drive', status: 'available' },
            { provider: 'discord', status: 'degraded' },
          ],
        },
      })
    )

    await page.route('**/api/integrations/health/', route =>
      route.fulfill({
        json: {
          status: 'healthy',
          services: [
            { name: 'google_drive', status: 'up' },
            { name: 'discord', status: 'down' },
          ],
        },
      })
    )

    await page.route('**/api/integrations/google-drive/auth-url/', route =>
      route.fulfill({ json: { auth_url: 'https://accounts.google.com/o/oauth2/mock' } })
    )

    await page.route('**/api/integrations/social/discord/auth-url/', route =>
      route.fulfill({ json: { auth_url: 'https://discord.com/oauth2/mock' } })
    )

    await page.route('**/api/integrations/connections/conn-gdrive/disconnect/', route => {
      driveDisconnected = true
      route.fulfill({ json: { success: true } })
    })

    await page.goto('/dashboard/settings/integrations')

    await expect(page.locator('[data-testid="integration-card-google_drive"]')).toContainText('Connected')
    await expect(page.locator('[data-testid="integration-card-discord"]')).toContainText('Not connected')

    await page.click('[data-testid="connect-discord"]')
    const discordRedirect = await page.evaluate(() => (window as Record<string, unknown>).__mockNavigations?.[0] as string | undefined)
    expect(discordRedirect).toContain('discord.com')

    await page.click('[data-testid="disconnect-google_drive"]')
    await expect(page.locator('[data-testid="connect-google_drive"]')).toBeVisible()
  })

  test('browses Google Drive files and loads streaming link', async ({ page }) => {
    await page.route('**/api/integrations/connections/', route =>
      route.fulfill({
        json: {
          connections: [
            {
              id: 'conn-gdrive',
              provider: 'google_drive',
              display_name: 'Google Drive',
              status: 'connected',
              account_email: 'drive@example.com',
              connected_at: '2024-05-10T12:00:00Z',
            },
          ],
        },
      })
    )

    await page.route('**/api/integrations/google-drive/files/', route =>
      route.fulfill({
        json: {
          files: [
            {
              id: 'file-1',
              name: 'Movie Night.mp4',
              size: 104857600,
              mime_type: 'video/mp4',
              url: 'https://drive.google.com/file/file-1',
              thumbnail: 'https://drive.google.com/thumb/file-1',
            },
          ],
        },
      })
    )

    await page.route('**/api/integrations/google-drive/files/file-1/streaming-url/', route =>
      route.fulfill({ json: { streaming_url: 'https://stream.watch/mock' } })
    )

    await page.goto('/dashboard/settings/integrations/google-drive')

    await expect(page.locator('[data-testid="google-drive-connection-details"]')).toContainText('drive@example.com')
    await page.click('[data-testid="drive-stream-file-1"]')
    await expect(page.locator('[data-testid="drive-streaming-url"]')).toContainText('https://stream.watch/mock')
  })

  test('renders Discord integration with server metadata', async ({ page }) => {
    await page.route('**/api/integrations/connections/', route =>
      route.fulfill({
        json: {
          connections: [
            {
              id: 'conn-discord',
              provider: 'discord',
              display_name: 'WatchParty Discord',
              status: 'connected',
              account_email: 'discord@example.com',
              connected_at: '2024-05-10T12:00:00Z',
              metadata: {
                servers: [
                  { id: '1', name: 'Watch Party Community', member_count: 1523, is_connected: true },
                  { id: '2', name: 'Movie Night Friends', member_count: 89, is_connected: false },
                ],
              },
            },
          ],
        },
      })
    )

    await page.route('**/api/integrations/health/', route =>
      route.fulfill({
        json: {
          status: 'healthy',
          services: [
            { name: 'discord', status: 'up' },
          ],
        },
      })
    )

    await page.goto('/dashboard/settings/integrations/discord')

    await expect(page.locator('[data-testid="discord-connection-card"]')).toContainText('discord@example.com')
    await expect(page.locator('[data-testid="discord-server-list"]')).toContainText('Watch Party Community')
  })
})
