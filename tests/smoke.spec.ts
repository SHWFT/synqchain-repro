import { test, expect } from '@playwright/test';

test.describe('SynqChain Smoke Tests', () => {
  test('login flow and navigation', async ({ page }) => {
    // Start at the home page
    await page.goto('/');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
    
    // Fill in demo credentials
    await page.fill('input[name="email"]', 'demo@demo.com');
    await page.fill('input[name="password"]', 'demo');
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard after login
    await expect(page).toHaveURL('/dashboard');
    
    // Navigate to Projects
    await page.click('a[href="/projects"]');
    await expect(page).toHaveURL('/projects');
    
    // Navigate to Suppliers  
    await page.click('a[href="/suppliers"]');
    await expect(page).toHaveURL('/suppliers');
    
    // Navigate to POs
    await page.click('a[href="/po"]');
    await expect(page).toHaveURL('/po');
    
    // Navigate to Analytics
    await page.click('a[href="/analytics"]');
    await expect(page).toHaveURL('/analytics');
    
    // Should have charts rendered (check for canvas elements)
    const charts = page.locator('canvas');
    await expect(charts).toHaveCount({ min: 1 });
  });
  
  test('CRUD operations', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'demo@demo.com');
    await page.fill('input[name="password"]', 'demo');
    await page.click('button[type="submit"]');
    
    // Go to suppliers page
    await page.goto('/suppliers');
    
    // Create a new supplier
    await page.click('button:has-text("Add Supplier")');
    await page.fill('input[name="name"]', 'Test Supplier');
    await page.fill('input[name="category"]', 'Testing');
    await page.click('button:has-text("Save")');
    
    // Should see the new supplier in the list
    await expect(page.locator('text=Test Supplier')).toBeVisible();
    
    // Delete the supplier
    await page.click('button[aria-label="Delete Test Supplier"]');
    await page.click('button:has-text("Confirm")');
    
    // Should no longer see the supplier
    await expect(page.locator('text=Test Supplier')).not.toBeVisible();
  });
  
  test('health check endpoint', async ({ request }) => {
    const response = await request.get('/api/healthz');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.checks.database).toBe('healthy');
  });
  
  test('API endpoints respond', async ({ request }) => {
    // Test suppliers API
    const suppliersResponse = await request.get('/api/suppliers');
    expect(suppliersResponse.status()).toBe(200);
    
    // Test projects API
    const projectsResponse = await request.get('/api/projects');
    expect(projectsResponse.status()).toBe(200);
    
    // Test PO API
    const poResponse = await request.get('/api/po');
    expect(poResponse.status()).toBe(200);
    
    // Test analytics API
    const analyticsResponse = await request.get('/api/analytics/kpis');
    expect(analyticsResponse.status()).toBe(200);
  });
});
