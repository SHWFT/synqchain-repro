import { test, expect } from '@playwright/test';

test.describe('Navigation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and login
    await page.goto('/');
    await page.fill('input[type="email"]', 'demo@demo.com');
    await page.fill('input[type="password"]', 'demo');
    await page.click('button[type="submit"]');
    
    // Wait for main app to be visible
    await expect(page.locator('.app-container')).toBeVisible();
  });

  test('should navigate between pages correctly', async ({ page }) => {
    // Should start on dashboard
    await expect(page.locator('#dashboard-content')).toBeVisible();
    await expect(page.locator('#nav-dashboard')).toHaveClass(/active/);
    
    // Navigate to Suppliers
    await page.click('#nav-suppliers');
    await expect(page.locator('#suppliers-content')).toBeVisible();
    await expect(page.locator('#dashboard-content')).toBeHidden();
    await expect(page.locator('#nav-suppliers')).toHaveClass(/active/);
    await expect(page.locator('#nav-dashboard')).not.toHaveClass(/active/);
    
    // Navigate to Projects
    await page.click('#nav-projects');
    await expect(page.locator('#projects-content')).toBeVisible();
    await expect(page.locator('#suppliers-content')).toBeHidden();
    await expect(page.locator('#nav-projects')).toHaveClass(/active/);
    await expect(page.locator('#nav-suppliers')).not.toHaveClass(/active/);
    
    // Navigate to PO Management
    await page.click('#nav-po');
    await expect(page.locator('#po-content')).toBeVisible();
    await expect(page.locator('#projects-content')).toBeHidden();
    await expect(page.locator('#nav-po')).toHaveClass(/active/);
    await expect(page.locator('#nav-projects')).not.toHaveClass(/active/);
    
    // Navigate to Analytics
    await page.click('#nav-analytics');
    await expect(page.locator('#analytics-content')).toBeVisible();
    await expect(page.locator('#po-content')).toBeHidden();
    await expect(page.locator('#nav-analytics')).toHaveClass(/active/);
    await expect(page.locator('#nav-po')).not.toHaveClass(/active/);
    
    // Navigate back to Dashboard
    await page.click('#nav-dashboard');
    await expect(page.locator('#dashboard-content')).toBeVisible();
    await expect(page.locator('#analytics-content')).toBeHidden();
    await expect(page.locator('#nav-dashboard')).toHaveClass(/active/);
    await expect(page.locator('#nav-analytics')).not.toHaveClass(/active/);
  });

  test('should ensure only one section is visible at a time', async ({ page }) => {
    const sections = [
      '#dashboard-content',
      '#suppliers-content', 
      '#projects-content',
      '#po-content',
      '#analytics-content'
    ];

    const navItems = [
      '#nav-dashboard',
      '#nav-suppliers',
      '#nav-projects', 
      '#nav-po',
      '#nav-analytics'
    ];

    // Test each navigation item
    for (let i = 0; i < navItems.length; i++) {
      await page.click(navItems[i]);
      
      // Check that only the current section is visible
      for (let j = 0; j < sections.length; j++) {
        if (i === j) {
          await expect(page.locator(sections[j])).toBeVisible();
        } else {
          await expect(page.locator(sections[j])).toBeHidden();
        }
      }
      
      // Check that only the current nav item is active
      for (let j = 0; j < navItems.length; j++) {
        if (i === j) {
          await expect(page.locator(navItems[j])).toHaveClass(/active/);
        } else {
          await expect(page.locator(navItems[j])).not.toHaveClass(/active/);
        }
      }
    }
  });

  test('should load data when navigating to pages', async ({ page }) => {
    // Navigate to Dashboard and check for KPI data loading
    await page.click('#nav-dashboard');
    await expect(page.locator('[data-kpi="active-projects"]')).toBeVisible();
    await expect(page.locator('[data-kpi="active-pos"]')).toBeVisible();
    await expect(page.locator('[data-kpi="total-spend"]')).toBeVisible();
    await expect(page.locator('[data-kpi="platform-savings"]')).toBeVisible();
    
    // Navigate to Suppliers and check for loading states
    await page.click('#nav-suppliers');
    await expect(page.locator('#suppliers-content')).toBeVisible();
    
    // Navigate to Projects and check for loading states
    await page.click('#nav-projects');
    await expect(page.locator('#projects-content')).toBeVisible();
    
    // Navigate to Analytics and check for charts
    await page.click('#nav-analytics');
    await expect(page.locator('#analytics-content')).toBeVisible();
  });

  test('should handle account dropdown', async ({ page }) => {
    // Account dropdown should be hidden initially
    await expect(page.locator('#account-dropdown')).toBeHidden();
    
    // Click account dropdown button
    await page.click('[data-action="toggle-account-dropdown"]');
    
    // Dropdown should now be visible
    await expect(page.locator('#account-dropdown')).toBeVisible();
    
    // Click outside to close dropdown
    await page.click('body');
    
    // Dropdown should be hidden again
    await expect(page.locator('#account-dropdown')).toBeHidden();
  });

  test('should display user information in account dropdown', async ({ page }) => {
    // Open account dropdown
    await page.click('[data-action="toggle-account-dropdown"]');
    await expect(page.locator('#account-dropdown')).toBeVisible();
    
    // Should show user email
    await expect(page.locator('#account-dropdown')).toContainText('demo@demo.com');
    
    // Should show logout option
    await expect(page.locator('[data-action="logout"]')).toBeVisible();
  });
});
