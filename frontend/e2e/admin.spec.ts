import { test, expect } from "@playwright/test"

test.describe("Admin Panel", () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto("/login")
    await page.fill('[data-testid="email-input"]', "admin@example.com")
    await page.fill('[data-testid="password-input"]', "adminpassword")
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL("/dashboard")
  })

  test("should access admin dashboard", async ({ page }) => {
    await page.goto("/dashboard/admin")

    // Should show admin dashboard
    await expect(page.locator("text=System Overview")).toBeVisible()
    await expect(page.locator("text=Total Users")).toBeVisible()
    await expect(page.locator("text=Active Sessions")).toBeVisible()
  })

  test("should manage users", async ({ page }) => {
    await page.goto("/dashboard/admin")

    // Navigate to user management
    await page.click('[data-testid="user-management-tab"]')

    // Should show user list
    await expect(page.locator('[data-testid="user-table"]')).toBeVisible()

    // Should be able to search users
    await page.fill('[data-testid="user-search"]', "test@example.com")
    await expect(page.locator("text=test@example.com")).toBeVisible()
  })

  test("should view system logs", async ({ page }) => {
    await page.goto("/dashboard/admin")

    // Navigate to system logs
    await page.click('[data-testid="system-logs-tab"]')

    // Should show logs table
    await expect(page.locator('[data-testid="logs-table"]')).toBeVisible()

    // Should be able to filter logs
    await page.selectOption('[data-testid="log-level-filter"]', "error")
    await expect(page.locator("text=Error")).toBeVisible()
  })

  test("should moderate content", async ({ page }) => {
    await page.goto("/dashboard/admin")

    // Navigate to content moderation
    await page.click('[data-testid="content-moderation-tab"]')

    // Should show moderation queue
    await expect(page.locator('[data-testid="moderation-queue"]')).toBeVisible()

    // Should be able to review content
    await page.click('[data-testid="review-button"]:first-child')
    await expect(page.locator('[data-testid="review-dialog"]')).toBeVisible()
  })
})
