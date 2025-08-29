import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should display login screen for unauthenticated users', async ({ page }) => {
    // Should show login form and hide main app
    await expect(page.locator('.login-container')).toBeVisible();
    await expect(page.locator('.app-container')).toBeHidden();
    
    // Check login form elements
    await expect(page.locator('#loginForm')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should handle login with valid credentials', async ({ page }) => {
    // Fill login form with demo credentials
    await page.fill('input[type="email"]', 'demo@demo.com');
    await page.fill('input[type="password"]', 'demo');
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Should redirect to main app
    await expect(page.locator('.login-container')).toBeHidden();
    await expect(page.locator('.app-container')).toBeVisible();
    
    // Should be on dashboard by default
    await expect(page.locator('#dashboard-content')).toBeVisible();
    
    // Check navigation items are present
    await expect(page.locator('#nav-dashboard')).toBeVisible();
    await expect(page.locator('#nav-suppliers')).toBeVisible();
    await expect(page.locator('#nav-projects')).toBeVisible();
    await expect(page.locator('#nav-po')).toBeVisible();
    await expect(page.locator('#nav-analytics')).toBeVisible();
  });

  test('should handle login with invalid credentials', async ({ page }) => {
    // Fill login form with invalid credentials
    await page.fill('input[type="email"]', 'wrong@demo.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Should stay on login screen
    await expect(page.locator('.login-container')).toBeVisible();
    await expect(page.locator('.app-container')).toBeHidden();
    
    // Should show error toast
    await expect(page.locator('.toast.error')).toBeVisible();
  });

  test('should handle logout', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'demo@demo.com');
    await page.fill('input[type="password"]', 'demo');
    await page.click('button[type="submit"]');
    
    // Wait for main app to be visible
    await expect(page.locator('.app-container')).toBeVisible();
    
    // Click account dropdown
    await page.click('[data-action="toggle-account-dropdown"]');
    
    // Wait for dropdown to be visible
    await expect(page.locator('#account-dropdown')).toBeVisible();
    
    // Click logout
    await page.click('[data-action="logout"]');
    
    // Should return to login screen
    await expect(page.locator('.login-container')).toBeVisible();
    await expect(page.locator('.app-container')).toBeHidden();
  });

  test('should maintain authentication state on page refresh', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'demo@demo.com');
    await page.fill('input[type="password"]', 'demo');
    await page.click('button[type="submit"]');
    
    // Wait for main app to be visible
    await expect(page.locator('.app-container')).toBeVisible();
    
    // Refresh the page
    await page.reload();
    
    // Should still be authenticated and show main app
    await expect(page.locator('.app-container')).toBeVisible();
    await expect(page.locator('.login-container')).toBeHidden();
  });
});
