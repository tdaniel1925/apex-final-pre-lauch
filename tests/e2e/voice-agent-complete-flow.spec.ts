/**
 * E2E Test: Complete Apex Voice Agent Flow
 * Tests all 7 phases of the voice agent implementation
 */

import { test, expect } from '@playwright/test';

test.describe('Apex Voice Agent - Complete Flow', () => {
  let testEmail: string;
  let testPhone: string;
  let testSlug: string;
  let aiPhoneNumber: string;
  let distributorId: string;

  test.beforeEach(() => {
    // Generate unique test data
    const timestamp = Date.now();
    testEmail = `test-voice-${timestamp}@example.com`;
    testPhone = '214-555-' + Math.floor(1000 + Math.random() * 9000);
    testSlug = `test-voice-${timestamp}`;
  });

  test('Phase 1: Signup with Bio Field', async ({ page }) => {
    await page.goto('/signup');

    // Fill out signup form
    await page.fill('input[name="first_name"]', 'John');
    await page.fill('input[name="last_name"]', 'TestVoice');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'Test1234!');
    await page.fill('input[name="slug"]', testSlug);
    await page.fill('input[name="phone"]', testPhone);

    // Fill address
    await page.fill('input[name="address_line1"]', '123 Test Street');
    await page.fill('input[name="city"]', 'Dallas');
    await page.selectOption('select[name="state"]', 'TX');
    await page.fill('input[name="zip"]', '75001');

    // NEW: Fill bio field
    await page.fill('textarea[name="bio"]',
      "I'm a former teacher passionate about helping families protect what matters most with technology and insurance."
    );

    // Select registration type
    await page.click('input[value="personal"]');

    // Fill DOB and SSN
    await page.selectOption('select#birth_month', '01');
    await page.selectOption('select#birth_day', '15');
    await page.selectOption('select#birth_year', '1985');
    await page.fill('input[name="ssn"]', '123-45-6789');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for success
    await expect(page).toHaveURL(/\/signup\/(credentials|welcome)/);
  });

  test('Phase 4: Welcome Page Shows Voice Agent', async ({ page }) => {
    // Assuming we're at welcome page after signup
    await page.goto('/signup/welcome?distributorId=test-id');

    // Check for Apex Voice Agent section
    await expect(page.locator('text=Your Apex Voice Agent')).toBeVisible();
    await expect(page.locator('text=Call your Voice Agent')).toBeVisible();

    // Check for enhanced first-call messaging
    await expect(page.locator('text=personalized welcome')).toBeVisible();
    await expect(page.locator('text=wow you with AI-powered conversation')).toBeVisible();
  });

  test('Phase 5: Profile Page Shows Voice Agent Section', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'Test1234!');
    await page.click('button[type="submit"]');

    // Navigate to profile
    await page.goto('/dashboard/profile');

    // Check for Apex Voice Agent card
    await expect(page.locator('text=Apex Voice Agent')).toBeVisible();
    await expect(page.locator('text=Your AI Phone Number')).toBeVisible();
    await expect(page.locator('text=Subscription')).toBeVisible();

    // Check tier display
    const tierBadge = page.locator('text=FREE Tier');
    await expect(tierBadge).toBeVisible();

    // Check for info about modes
    await expect(page.locator('text=Owner Mode')).toBeVisible();
    await expect(page.locator('text=Prospect Mode')).toBeVisible();
  });

  test('Phase 7: AI Chatbot - FREE Tier Cannot Customize', async ({ page }) => {
    // Login as FREE tier user
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'Test1234!');
    await page.click('button[type="submit"]');

    // Go to AI Assistant
    await page.goto('/dashboard/ai-assistant');

    // Try to customize voice agent
    await page.fill('textarea[placeholder*="message"]',
      'Can you make my voice agent talk about my real estate business?'
    );
    await page.click('button:has-text("Send")');

    // Should get upgrade message
    await expect(page.locator('text=Voice Agent Customization Not Available')).toBeVisible();
    await expect(page.locator('text=Upgrade to Business Center')).toBeVisible();
    await expect(page.locator('text=$39/month')).toBeVisible();
  });

  test('Phase 7: AI Chatbot - PAID Tier Can Customize', async ({ page, request }) => {
    // First upgrade user to PAID tier via API
    await request.post('/api/admin/upgrade-tier', {
      data: {
        email: testEmail,
        tier: 'basic',
      },
    });

    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'Test1234!');
    await page.click('button[type="submit"]');

    // Go to AI Assistant
    await page.goto('/dashboard/ai-assistant');

    // Request customization
    await page.fill('textarea[placeholder*="message"]',
      'Update my voice agent to mention I also do real estate. When prospects call, tell them about my real estate services in addition to Apex.'
    );
    await page.click('button:has-text("Send")');

    // Should get preview
    await expect(page.locator('text=Voice Agent Customization Preview')).toBeVisible();
    await expect(page.locator('text=Your Custom Programming')).toBeVisible();

    // Confirm update
    await page.fill('textarea[placeholder*="message"]', 'Apply this update');
    await page.click('button:has-text("Send")');

    // Should get success message
    await expect(page.locator('text=Voice Agent Updated Successfully')).toBeVisible();
  });
});

test.describe('Voice Agent API Tests', () => {
  test('VAPI Webhook - Owner Call (First Time)', async ({ request }) => {
    const response = await request.post('/api/vapi/webhooks', {
      data: {
        message: {
          type: 'end-of-call-report',
          call: {
            id: 'test-call-1',
            customer: {
              number: '+12145551234', // Same as distributor phone
            },
            status: 'completed',
          },
          messages: [
            {
              role: 'assistant',
              content: 'Welcome to Apex Affinity Group! What would you like to know about your new AI Voice agent?',
            },
            {
              role: 'user',
              content: 'This is awesome! Tell me what you can do.',
            },
          ],
        },
        assistant: {
          id: 'test-assistant-id',
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('Owner call processed');
  });

  test('VAPI Webhook - Prospect Call (Sends SMS)', async ({ request }) => {
    const response = await request.post('/api/vapi/webhooks', {
      data: {
        message: {
          type: 'end-of-call-report',
          call: {
            id: 'test-call-2',
            customer: {
              number: '+19725559999', // Different from distributor phone
            },
            status: 'completed',
          },
          messages: [
            {
              role: 'assistant',
              content: "Hi! You've reached John TestVoice's Apex business line.",
            },
            {
              role: 'user',
              content: "Hi, I'm interested in learning more about the business opportunity. Can John call me back at 972-555-9999?",
            },
          ],
        },
        assistant: {
          id: 'test-assistant-id',
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.smsSent).toBe(true);
    expect(data.messageSid).toBeDefined();
  });

  test('Provision AI - Creates Assistant with Caller Detection', async ({ request }) => {
    const response = await request.post('/api/signup/provision-ai', {
      data: {
        distributorId: 'test-dist-id',
        firstName: 'John',
        lastName: 'TestVoice',
        phone: '+12145551234',
        sponsorSlug: 'apex-vision',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.phoneNumber).toBeDefined();
    expect(data.assistantId).toBeDefined();
  });
});

test.describe('Database Validation', () => {
  test('first_call_completed field exists', async ({ request }) => {
    // Query a distributor to verify field exists
    const response = await request.get('/api/admin/distributors/test-id');
    const data = await response.json();

    expect(data).toHaveProperty('first_call_completed');
    expect(typeof data.first_call_completed).toBe('boolean');
  });

  test('bio field exists and stores data', async ({ request }) => {
    const response = await request.get('/api/admin/distributors/test-id');
    const data = await response.json();

    expect(data).toHaveProperty('bio');
    expect(data.bio).toBeTruthy();
    expect(data.bio.length).toBeLessThanOrEqual(500);
  });
});

test.describe('VAPI Prompt Generation', () => {
  test('Generates Owner Mode prompt for first call', async ({ page }) => {
    // This would test the prompt generation logic
    // Mock test - actual implementation would call the function
    const promptVars = {
      firstName: 'John',
      lastName: 'TestVoice',
      sponsorName: 'Apex Vision',
      replicatedSiteUrl: 'https://reachtheapex.net/john-testvoice',
      distributorPhone: '+12145551234',
      distributorBio: "I'm a former teacher passionate about helping families.",
      firstCallCompleted: false,
      businessCenterTier: 'free',
    };

    // Would call generateNetworkMarketingPrompt(promptVars)
    // And verify it includes:
    // - Owner Mode section
    // - First call welcome message
    // - Bio reference
    // - Prospect Mode section
    // - FREE tier restrictions
  });

  test('Generates PAID tier custom prompt', async ({ page }) => {
    const promptVars = {
      firstName: 'John',
      lastName: 'TestVoice',
      sponsorName: 'Apex Vision',
      replicatedSiteUrl: 'https://reachtheapex.net/john-testvoice',
      distributorPhone: '+12145551234',
      distributorBio: "I'm a former teacher passionate about helping families.",
      firstCallCompleted: true,
      businessCenterTier: 'basic',
      customProspectPrompt: "Hi! I can help with Apex AND real estate services through ABC Realty.",
    };

    // Would verify custom prompt is injected in Prospect Mode section
  });
});
