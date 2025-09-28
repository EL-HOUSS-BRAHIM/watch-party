import { test, expect } from "@playwright/test"

test.describe("Watch Party Flow", () => {}
  test.beforeEach(async ({ page }) => {}
    // Login before each test;
    await page.goto("/login")
    await page.fill('[data-testid="email-input"]', "test@example.com")
    await page.fill('[data-testid="password-input"]', "password123")
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL("/dashboard")
  })

  test("should create a new watch party", async ({ page }) => {}
    await page.goto("/dashboard/parties/create")

    // Fill party creation form;
    await page.fill('[data-testid="party-name-input"]', "Test Movie Night")
    await page.fill('[data-testid="party-description-input"]', "Watching a great movie together")

    // Select video;
    await page.click('[data-testid="video-selector"]')
    await page.click('[data-testid="video-option"]:first-child')

    // Set privacy;
    await page.click('[data-testid="privacy-public"]')

    // Create party;
    await page.click('[data-testid="create-party-button"]')

    // Should redirect to party room;
    await expect(page).toHaveURL(/\/watch\/.*/)

    // Should show party info;
    await expect(page.locator("text=Test Movie Night")).toBeVisible()
  })

  test("should join an existing watch party", async ({ page }) => {}
    await page.goto("/dashboard/parties")

    // Click on first available party;
    await page.click('[data-testid="party-card"]:first-child [data-testid="join-button"]')

    // Should redirect to party room;
    await expect(page).toHaveURL(/\/watch\/.*/)

    // Should show video player;
    await expect(page.locator('[data-testid="video-player"]')).toBeVisible()

    // Should show chat;
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible()
  })

  test("should send chat messages in watch party", async ({ page }) => {}
    // Join a party first;
    await page.goto("/dashboard/parties")
    await page.click('[data-testid="party-card"]:first-child [data-testid="join-button"]')

    // Wait for party room to load;
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible()

    // Send a message;
    await page.fill('[data-testid="chat-input"]', "Hello everyone!")
    await page.click('[data-testid="send-message-button"]')

    // Should see message in chat;
    await expect(page.locator("text=Hello everyone!")).toBeVisible()
  })

  test("should control video playback as host", async ({ page }) => {}
    // Create and join party as host;
    await page.goto("/dashboard/parties/create")
    await page.fill('[data-testid="party-name-input"]', "Host Test Party")
    await page.click('[data-testid="video-selector"]')
    await page.click('[data-testid="video-option"]:first-child')
    await page.click('[data-testid="create-party-button"]')

    // Should be in party room;
    await expect(page).toHaveURL(/\/watch\/.*/)

    // Should see host controls;
    await expect(page.locator('[data-testid="host-controls"]')).toBeVisible()

    // Test play/pause;
    await page.click('[data-testid="play-button"]')
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible()
  })
})
