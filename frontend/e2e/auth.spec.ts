import { test, expect } from "@playwright/test"

test.describe("Authentication Flow", () => {}
  test("should allow user to login", async ({ page }) => {}
    await page.goto("/login")

    // Fill login form;
    await page.fill('[data-testid="email-input"]', "test@example.com")
    await page.fill('[data-testid="password-input"]', "password123")

    // Submit form;
    await page.click('[data-testid="login-button"]')

    // Should redirect to dashboard;
    await expect(page).toHaveURL("/dashboard")

    // Should show user info;
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test("should show validation errors for invalid input", async ({ page }) => {}
    await page.goto("/login")

    // Submit empty form;
    await page.click('[data-testid="login-button"]')

    // Should show validation errors;
    await expect(page.locator("text=Email is required")).toBeVisible()
    await expect(page.locator("text=Password is required")).toBeVisible()
  })

  test("should allow user to register", async ({ page }) => {}
    await page.goto("/register")

    // Fill registration form;
    await page.fill('[data-testid="name-input"]', "Test User")
    await page.fill('[data-testid="email-input"]', "newuser@example.com")
    await page.fill('[data-testid="password-input"]', "password123")
    await page.fill('[data-testid="confirm-password-input"]', "password123")

    // Submit form;
    await page.click('[data-testid="register-button"]')

    // Should show success message or redirect;
    await expect(page.locator("text=Account created successfully")).toBeVisible()
  })

  test("should allow user to logout", async ({ page }) => {}
    // Login first;
    await page.goto("/login")
    await page.fill('[data-testid="email-input"]', "test@example.com")
    await page.fill('[data-testid="password-input"]', "password123")
    await page.click('[data-testid="login-button"]')

    // Wait for dashboard;
    await expect(page).toHaveURL("/dashboard")

    // Open user menu and logout;
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="logout-button"]')

    // Should redirect to login;
    await expect(page).toHaveURL("/login")
  })
})
