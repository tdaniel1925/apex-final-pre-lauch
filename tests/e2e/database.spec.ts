import { test, expect } from '@playwright/test';

test.describe('Database Connection', () => {
  test('should connect to database successfully', async ({ request }) => {
    const response = await request.get('/api/test/db');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe('Database connection successful');
  });

  test('should return distributor count', async ({ request }) => {
    const response = await request.get('/api/test/db');
    const data = await response.json();

    expect(data.data).toHaveProperty('distributor_count');
    expect(typeof data.data.distributor_count).toBe('number');
    expect(data.data.distributor_count).toBeGreaterThanOrEqual(0);
  });

  test('should return master distributor status', async ({ request }) => {
    const response = await request.get('/api/test/db');
    const data = await response.json();

    expect(data.data).toHaveProperty('master_exists');
    expect(typeof data.data.master_exists).toBe('boolean');
  });

  test('should include timestamp and environment info', async ({ request }) => {
    const response = await request.get('/api/test/db');
    const data = await response.json();

    expect(data.data).toHaveProperty('timestamp');
    expect(data.data).toHaveProperty('database');
    expect(data.data).toHaveProperty('environment');
    expect(data.data.database).toBe('Supabase PostgreSQL');
  });
});

test.describe('Marketing Site', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Apex Affinity Group/i);
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
  });
});
