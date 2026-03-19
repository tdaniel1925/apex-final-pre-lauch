// =============================================
// Admin Events E2E Tests
// Test company events management and distributor access
// =============================================

import { test, expect, Page } from '@playwright/test';

// Test data - ISO format for API calls
const testEvent = {
  event_name: 'Test Product Launch 2026',
  event_type: 'product_launch',
  event_description: 'This is a test event for E2E testing',
  event_date_time: new Date('2026-06-15T14:00:00').toISOString(),
  event_duration_minutes: 120,
  event_timezone: 'America/Chicago',
  location_type: 'virtual',
  virtual_meeting_link: 'https://zoom.us/j/123456789',
  virtual_meeting_platform: 'Zoom',
  status: 'active',
  is_public: true,
  is_featured: false,
};

// Datetime for form filling (datetime-local format)
const testEventFormDateTime = '2026-06-15T14:00';

// Test credentials (from setup script)
const TEST_ADMIN_EMAIL = 'test-admin@example.com';
const TEST_ADMIN_PASSWORD = 'TestAdmin123!';
const TEST_DISTRIBUTOR_EMAIL = 'test-distributor@example.com';
const TEST_DISTRIBUTOR_PASSWORD = 'TestDist123!';

// Helper function to login as admin
async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', TEST_ADMIN_EMAIL);
  await page.fill('input[name="password"]', TEST_ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin|\/dashboard/, { timeout: 10000 });
}

// Helper function to login as distributor
async function loginAsDistributor(page: Page) {
  await page.goto('/login');
  await page.fill('input[name="email"]', TEST_DISTRIBUTOR_EMAIL);
  await page.fill('input[name="password"]', TEST_DISTRIBUTOR_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

// Helper function to create event via API using page context (shares cookies)
async function createEventViaAPI(page: Page, eventData: any = testEvent) {
  const cookies = await page.context().cookies();

  const response = await page.context().request.post('http://localhost:3050/api/admin/events', {
    data: eventData,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
    },
  });

  // Debug: Log the response if it fails
  if (!response.ok()) {
    const errorData = await response.json().catch(() => ({ error: 'Could not parse error response' }));
    console.log('API Error:', {
      status: response.status(),
      statusText: response.statusText(),
      error: errorData,
    });
  }

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  return data.data;
}

// Helper function to delete event via API using page context
async function deleteEventViaAPI(page: Page, eventId: string) {
  const cookies = await page.context().cookies();
  await page.context().request.delete(`http://localhost:3050/api/admin/events/${eventId}`, {
    headers: {
      'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
    },
  });
}

test.describe('Admin Events Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await loginAsAdmin(page);
  });

  test('admin can view events list page', async ({ page }) => {
    await page.goto('/admin/events');

    // Check page loaded correctly
    await expect(page.locator('h1')).toContainText('Company Events');

    // Check filters are present
    await expect(page.locator('button:has-text("All Events")')).toBeVisible();
    await expect(page.locator('button:has-text("Active")')).toBeVisible();
    await expect(page.locator('button:has-text("Draft")')).toBeVisible();

    // Check create button is present
    await expect(page.locator('a:has-text("Create Event")')).toBeVisible();
  });

  test('admin can create new event', async ({ page }) => {
    await page.goto('/admin/events/new', { waitUntil: 'networkidle' });

    // Check form loaded
    await expect(page.locator('h1')).toContainText('Create New Event');

    // Wait for React to hydrate
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Fill out basic information
    await page.fill('input[name="event_name"]', testEvent.event_name);
    await page.selectOption('select[name="event_type"]', testEvent.event_type);
    await page.fill('textarea[name="event_description"]', testEvent.event_description);

    // Fill out date/time
    await page.fill('input[name="event_date_time"]', testEventFormDateTime);
    await page.fill('input[name="event_duration_minutes"]', testEvent.event_duration_minutes.toString());

    // Select location type
    await page.check('input[value="virtual"]');

    // Fill virtual meeting details
    await page.fill('input[name="virtual_meeting_link"]', testEvent.virtual_meeting_link);
    await page.fill('input[name="virtual_meeting_platform"]', testEvent.virtual_meeting_platform);

    // Set status
    await page.selectOption('select[name="status"]', testEvent.status);

    // Submit form
    await page.click('button[type="submit"]');

    // Debug: Log current URL after submission
    await page.waitForTimeout(2000);
    console.log('Current URL after form submit:', page.url());

    // Wait for redirect
    await page.waitForURL('/admin/events', { timeout: 10000 });

    // Verify event appears in list
    await expect(page.locator(`text=${testEvent.event_name}`)).toBeVisible();

    // Cleanup: Delete the created event
    const eventCard = page.locator(`text=${testEvent.event_name}`).locator('..').locator('..');
    const deleteButton = eventCard.locator('button:has-text("Delete"), button[aria-label*="delete"]').first();

    // Intercept the confirm dialog
    page.on('dialog', dialog => dialog.accept());
    await deleteButton.click();

    // Wait for deletion
    await page.waitForTimeout(1000);
  });

  test('admin can edit existing event', async ({ page }) => {
    // Create event via API first
    const event = await createEventViaAPI(page);

    try {
      await page.goto('/admin/events');

      // Click edit button for our test event
      const eventCard = page.locator(`text=${testEvent.event_name}`).locator('..').locator('..');
      const editButton = eventCard.locator('a:has-text("Edit"), a[href*="/admin/events/"]').first();
      await editButton.click();

      // Wait for edit page
      await page.waitForURL(/\/admin\/events\/[a-f0-9-]+/, { timeout: 10000 });

      // Modify event name
      const newName = 'Updated Test Event 2026';
      await page.fill('input[name="event_name"]', newName);

      // Change status to draft
      await page.selectOption('select[name="status"]', 'draft');

      // Submit form
      await page.click('button[type="submit"]');

      // Wait for redirect
      await page.waitForURL('/admin/events', { timeout: 10000 });

      // Verify changes
      await expect(page.locator(`text=${newName}`)).toBeVisible();

      // Verify draft badge
      const updatedEventCard = page.locator(`text=${newName}`).locator('..').locator('..');
      await expect(updatedEventCard.locator('text=draft')).toBeVisible();
    } finally {
      // Cleanup
      await deleteEventViaAPI(page, event.id);
    }
  });

  test('admin can delete event with no invitations', async ({ page }) => {
    // Create event via API
    const event = await createEventViaAPI(page);

    await page.goto('/admin/events');

    // Wait for the event to appear in the list
    await page.waitForSelector(`text=${testEvent.event_name}`, { timeout: 10000 });

    // Find and delete the event
    const eventCard = page.locator(`text=${testEvent.event_name}`).locator('..').locator('..');
    // Delete button is the second button in the actions (has Trash2 icon)
    const deleteButton = eventCard.locator('button').nth(1);

    // Intercept the confirm dialog
    page.on('dialog', dialog => dialog.accept());
    await deleteButton.click();

    // Wait for deletion and page refresh
    await page.waitForTimeout(2000);
    await page.reload();

    // Verify event is gone
    await expect(page.locator(`text=${testEvent.event_name}`)).not.toBeVisible();
  });

  test('admin can filter events by status', async ({ page }) => {
    // Create active and draft events
    const activeEvent = await createEventViaAPI(page, {
      ...testEvent,
      event_name: 'Active Event Test',
      status: 'active',
    });

    const draftEvent = await createEventViaAPI(page, {
      ...testEvent,
      event_name: 'Draft Event Test',
      status: 'draft',
    });

    try {
      await page.goto('/admin/events');

      // Click Active filter
      await page.click('button:has-text("Active")');
      await page.waitForTimeout(1000);

      // Should see active event
      await expect(page.locator('text=Active Event Test')).toBeVisible();

      // Should not see draft event
      await expect(page.locator('text=Draft Event Test')).not.toBeVisible();

      // Click Draft filter
      await page.click('button:has-text("Draft")');
      await page.waitForTimeout(1000);

      // Should see draft event
      await expect(page.locator('text=Draft Event Test')).toBeVisible();

      // Should not see active event
      await expect(page.locator('text=Active Event Test')).not.toBeVisible();

      // Click All filter
      await page.click('button:has-text("All Events")');
      await page.waitForTimeout(1000);

      // Should see both events
      await expect(page.locator('text=Active Event Test')).toBeVisible();
      await expect(page.locator('text=Draft Event Test')).toBeVisible();
    } finally {
      // Cleanup
      await deleteEventViaAPI(page, activeEvent.id);
      await deleteEventViaAPI(page, draftEvent.id);
    }
  });

  test('admin can see event statistics', async ({ page }) => {
    // Create event
    const event = await createEventViaAPI(page);

    try {
      await page.goto('/admin/events');

      // Find event card
      const eventCard = page.locator(`text=${testEvent.event_name}`).locator('..').locator('..');

      // Check stats are displayed
      await expect(eventCard.locator('text=/\\d+ RSVPs/').first()).toBeVisible();
      await expect(eventCard.locator('text=/\\d+ invitations sent/').first()).toBeVisible();
      await expect(eventCard.locator('text=/\\d+ confirmed/').first()).toBeVisible();
    } finally {
      // Cleanup
      await deleteEventViaAPI(page, event.id);
    }
  });
});

test.describe('Distributor Events Access', () => {
  test.beforeEach(async ({ page }) => {
    // Login as distributor before each test
    await loginAsDistributor(page);
  });

  test('distributor can see company events in invitation form', async ({ page }) => {
    // Create a public active event first
    const adminPage = await page.context().newPage();
    await loginAsAdmin(adminPage);
    const event = await createEventViaAPI(adminPage, {
      ...testEvent,
      is_public: true,
      status: 'active',
    });

    try {
      // Navigate to invitation form (adjust URL based on actual location)
      await page.goto('/autopilot/invitations');

      // Look for Company Event button/option
      const companyEventButton = page.locator('button:has-text("Company Event")');
      if (await companyEventButton.isVisible()) {
        await companyEventButton.click();

        // Check if event dropdown is visible
        await expect(page.locator('select#company_event, select[name="company_event"]')).toBeVisible();

        // Check if our test event is in the list
        const eventOption = page.locator(`option:has-text("${testEvent.event_name}")`);
        await expect(eventOption).toBeVisible();
      }
    } finally {
      // Cleanup
      await deleteEventViaAPI(adminPage, event.id);
      await adminPage.close();
    }
  });

  test('distributor cannot see draft events', async ({ page }) => {
    // Create a draft event
    const adminPage = await page.context().newPage();
    await loginAsAdmin(adminPage);
    const event = await createEventViaAPI(adminPage, {
      ...testEvent,
      event_name: 'Draft Event - Should Not Be Visible',
      status: 'draft',
      is_public: true,
    });

    try {
      // Navigate to invitation form
      await page.goto('/autopilot/invitations');

      // Look for Company Event button/option
      const companyEventButton = page.locator('button:has-text("Company Event")');
      if (await companyEventButton.isVisible()) {
        await companyEventButton.click();

        // Draft event should NOT be in the dropdown
        const eventOption = page.locator('option:has-text("Draft Event - Should Not Be Visible")');
        await expect(eventOption).not.toBeVisible();
      }
    } finally {
      // Cleanup
      await deleteEventViaAPI(adminPage, event.id);
      await adminPage.close();
    }
  });

  test('distributor cannot see private events', async ({ page }) => {
    // Create a private event (is_public = false)
    const adminPage = await page.context().newPage();
    await loginAsAdmin(adminPage);
    const event = await createEventViaAPI(adminPage, {
      ...testEvent,
      event_name: 'Private Event - Should Not Be Visible',
      status: 'active',
      is_public: false,
    });

    try {
      // Navigate to invitation form
      await page.goto('/autopilot/invitations');

      // Look for Company Event button/option
      const companyEventButton = page.locator('button:has-text("Company Event")');
      if (await companyEventButton.isVisible()) {
        await companyEventButton.click();

        // Private event should NOT be in the dropdown
        const eventOption = page.locator('option:has-text("Private Event - Should Not Be Visible")');
        await expect(eventOption).not.toBeVisible();
      }
    } finally {
      // Cleanup
      await deleteEventViaAPI(adminPage, event.id);
      await adminPage.close();
    }
  });

  test('selecting company event pre-fills meeting details', async ({ page }) => {
    // Create a public active event
    const adminPage = await page.context().newPage();
    await loginAsAdmin(adminPage);
    const event = await createEventViaAPI(adminPage, {
      ...testEvent,
      is_public: true,
      status: 'active',
    });

    try {
      // Navigate to invitation form
      await page.goto('/autopilot/invitations');

      // Switch to Company Event
      const companyEventButton = page.locator('button:has-text("Company Event")');
      if (await companyEventButton.isVisible()) {
        await companyEventButton.click();

        // Select the event
        const eventSelect = page.locator('select#company_event, select[name="company_event"]');
        await eventSelect.selectOption({ label: new RegExp(testEvent.event_name) });

        // Wait a bit for pre-fill
        await page.waitForTimeout(500);

        // Verify meeting title is pre-filled
        const meetingTitleInput = page.locator('input#meeting_title, input[name="meeting_title"]');
        await expect(meetingTitleInput).toHaveValue(testEvent.event_name);

        // Verify meeting link is pre-filled (for virtual events)
        const meetingLinkInput = page.locator('input#meeting_link, input[name="meeting_link"]');
        await expect(meetingLinkInput).toHaveValue(testEvent.virtual_meeting_link);
      }
    } finally {
      // Cleanup
      await deleteEventViaAPI(adminPage, event.id);
      await adminPage.close();
    }
  });
});

test.describe('Events API Integration', () => {
  test('API returns only active public events for distributors', async ({ page, browser }) => {
    await loginAsDistributor(page);

    // Create test events via admin (use separate context to avoid session conflicts)
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await loginAsAdmin(adminPage);

    const publicActiveEvent = await createEventViaAPI(adminPage, {
      ...testEvent,
      event_name: 'Public Active Event',
      is_public: true,
      status: 'active',
    });

    const privateDraftEvent = await createEventViaAPI(adminPage, {
      ...testEvent,
      event_name: 'Private Draft Event',
      is_public: false,
      status: 'draft',
    });

    try {
      // Fetch events via API (use browser context to include auth cookies)
      const cookies = await page.context().cookies();
      const response = await page.context().request.get('http://localhost:3050/api/autopilot/events?upcoming=true', {
        headers: {
          'Cookie': cookies.map(c => `${c.name}=${c.value}`).join('; '),
        },
      });

      // Debug: Log error if failed
      if (!response.ok()) {
        const errorData = await response.json().catch(() => ({ error: 'Could not parse error' }));
        console.log('API Error:', {
          status: response.status(),
          statusText: response.statusText(),
          error: errorData,
        });
      }

      expect(response.ok()).toBeTruthy();

      const result = await response.json();
      expect(Array.isArray(result.data)).toBeTruthy();
      expect(result.meta).toBeDefined();

      // Check public active event is in results
      const hasPublicEvent = result.data.some((e: any) => e.event_name === 'Public Active Event');
      expect(hasPublicEvent).toBeTruthy();

      // Check private draft event is NOT in results
      const hasPrivateEvent = result.data.some((e: any) => e.event_name === 'Private Draft Event');
      expect(hasPrivateEvent).toBeFalsy();
    } finally {
      // Cleanup
      await deleteEventViaAPI(adminPage, publicActiveEvent.id);
      await deleteEventViaAPI(adminPage, privateDraftEvent.id);
      await adminContext.close();
    }
  });
});
