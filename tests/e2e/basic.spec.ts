import { test, expect } from "@playwright/test";

test.describe("SynqChain MVP Basic E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto("/");
  });

  test("should redirect to login page when not authenticated", async ({ page }) => {
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator("h1, h2")).toContainText(/welcome|sign in|login/i);
  });

  test("should display login form with demo credentials", async ({ page }) => {
    await expect(page).toHaveURL(/.*login/);
    
    // Check for login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check for demo button
    await expect(page.locator("text=Log in as Demo User")).toBeVisible();
    
    // Check for demo credentials display
    await expect(page.locator("text=demo@demo.com")).toBeVisible();
    await expect(page.locator("text=demo")).toBeVisible();
  });

  test("should login with demo credentials and navigate to dashboard", async ({ page }) => {
    await expect(page).toHaveURL(/.*login/);
    
    // Use demo login button
    await page.click("text=Log in as Demo User");
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator("h1")).toContainText("Dashboard");
    
    // Check for KPI cards
    await expect(page.locator("text=Spend Sourced")).toBeVisible();
    await expect(page.locator("text=Savings Secured")).toBeVisible();
    await expect(page.locator("text=Active Projects")).toBeVisible();
  });

  test("should navigate between main pages", async ({ page }) => {
    // Login first
    await page.click("text=Log in as Demo User");
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Navigate to Projects
    await page.click("text=Projects");
    await expect(page).toHaveURL(/.*projects/);
    await expect(page.locator("h1")).toContainText("Projects");
    
    // Navigate to Suppliers
    await page.click("text=Suppliers");
    await expect(page).toHaveURL(/.*suppliers/);
    await expect(page.locator("h1")).toContainText("Suppliers");
    
    // Navigate to Analytics
    await page.click("text=Analytics");
    await expect(page).toHaveURL(/.*analytics/);
    await expect(page.locator("h1")).toContainText("Analytics");
    
    // Navigate to Connector Playground
    await page.click("text=Connector Playground");
    await expect(page).toHaveURL(/.*connector-playground/);
    await expect(page.locator("h1")).toContainText("Connector Playground");
    
    // Navigate to Settings
    await page.click("text=Settings");
    await expect(page).toHaveURL(/.*settings/);
    await expect(page.locator("h1")).toContainText("Settings");
  });

  test("should display project data and allow CRUD operations", async ({ page }) => {
    // Login and navigate to projects
    await page.click("text=Log in as Demo User");
    await page.click("text=Projects");
    await expect(page).toHaveURL(/.*projects/);
    
    // Check if projects table is visible
    await expect(page.locator("table")).toBeVisible();
    
    // Try to add a new project
    await page.click("text=New Project");
    
    // Check if dialog opened
    await expect(page.locator("text=Create New Project")).toBeVisible();
    
    // Fill in project details
    await page.fill('input[placeholder*="project name"]', "E2E Test Project");
    await page.fill('input[placeholder*="client"]', "Test Client");
    await page.fill('input[type="number"]:first-of-type', "50000");
    await page.fill('input[type="number"]:last-of-type', "5000");
    
    // Submit the form
    await page.click("text=Create Project");
    
    // Verify project was added (should see it in the table)
    await expect(page.locator("text=E2E Test Project")).toBeVisible();
  });

  test("should test connector playground functionality", async ({ page }) => {
    // Login and navigate to connector playground
    await page.click("text=Log in as Demo User");
    await page.click("text=Connector Playground");
    await expect(page).toHaveURL(/.*connector-playground/);
    
    // Check for adapter selection
    await expect(page.locator("select")).toBeVisible();
    
    // Check for resource selection
    await expect(page.locator("text=Suppliers")).toBeVisible();
    
    // Execute a test
    await page.click("text=Execute Test");
    
    // Wait for response (should see loading or results)
    await page.waitForSelector("text=Execute Test", { state: "visible" });
    
    // Should eventually show some response
    await expect(page.locator("pre, code")).toBeVisible({ timeout: 10000 });
  });

  test("should handle theme switching", async ({ page }) => {
    // Login and navigate to settings
    await page.click("text=Log in as Demo User");
    await page.click("text=Settings");
    await expect(page).toHaveURL(/.*settings/);
    
    // Find theme buttons
    await expect(page.locator("text=Light")).toBeVisible();
    await expect(page.locator("text=Dark")).toBeVisible();
    await expect(page.locator("text=System")).toBeVisible();
    
    // Click dark theme
    await page.click("text=Dark");
    
    // Verify dark theme is applied (check for dark class on html element)
    const htmlElement = page.locator("html");
    await expect(htmlElement).toHaveClass(/dark/);
  });

  test("should logout successfully", async ({ page }) => {
    // Login first
    await page.click("text=Log in as Demo User");
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Find and click logout button
    await page.click("text=Logout");
    
    // Should redirect back to login
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator("text=Welcome back")).toBeVisible();
  });

  test("should show no console errors during navigation", async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Login and navigate through pages
    await page.click("text=Log in as Demo User");
    await page.click("text=Projects");
    await page.click("text=Suppliers");
    await page.click("text=Analytics");
    await page.click("text=Connector Playground");
    await page.click("text=Settings");
    await page.click("text=Dashboard");

    // Check that no console errors occurred
    expect(consoleErrors).toEqual([]);
  });
});






