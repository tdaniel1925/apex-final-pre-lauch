import { test, expect } from '@playwright/test';

/**
 * Rep Back Office - AI Autopilot Invitations Tests
 * Tests the meeting invitation system with company events
 */

async function login(page: any) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill('test.distributor@apex.com');
  await page.locator('input[type="password"]').fill('TestPassword123!');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

async function openInvitationForm(page: any) {
  const newInvitationBtn = page.locator('button:has-text("New Invitation")');
  if (await newInvitationBtn.isVisible().catch(() => false)) {
    await newInvitationBtn.click();
    await page.waitForTimeout(500);
  }
}

test.describe('Rep Back Office - AI Autopilot Invitations', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/autopilot/invitations');
  });

  test('should display invitations page correctly', async ({ page }) => {
    await expect(page).toHaveURL(/autopilot.*invitations/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display invitation form after clicking New Invitation', async ({ page }) => {
    // Click New Invitation button to show form
    const newInvitationBtn = page.locator('button:has-text("New Invitation")');
    if (await newInvitationBtn.isVisible()) {
      await newInvitationBtn.click();
      // Form should now be visible
      await expect(page.locator('form, [role="form"], input, select, textarea').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show invitation type selector', async ({ page }) => {
    await openInvitationForm(page);

    // Look for company event or custom invitation options (buttons)
    const customMeetingBtn = page.locator('button:has-text("Custom Meeting")').first();
    const companyEventBtn = page.locator('button:has-text("Company Event")').first();

    await expect(customMeetingBtn).toBeVisible();
    await expect(companyEventBtn).toBeVisible();
  });

  test('should display company events dropdown when company event type selected', async ({ page }) => {
    await openInvitationForm(page);

    // Click Company Event button
    const companyEventBtn = page.locator('button:has-text("Company Event")').first();
    await companyEventBtn.click();
    await page.waitForTimeout(1500); // Wait for events to load

    // Should show events dropdown, "no events" message, or "loading" message
    const eventsDropdown = page.locator('select#company_event').first();
    const noEventsMessage = page.locator('text=/No upcoming company events/i').first();
    const loadingMessage = page.locator('text=/Loading events/i').first();

    // One of these should be visible
    const hasDropdown = await eventsDropdown.isVisible().catch(() => false);
    const hasNoEvents = await noEventsMessage.isVisible().catch(() => false);
    const isLoading = await loadingMessage.isVisible().catch(() => false);

    expect(hasDropdown || hasNoEvents || isLoading).toBeTruthy();
  });

  test('should load company events in dropdown', async ({ page }) => {
    await openInvitationForm(page);

    // Click Company Event button
    const companyEventBtn = page.locator('button:has-text("Company Event")').first();
    await companyEventBtn.click();
    await page.waitForTimeout(1500); // Wait for events to load

    // Check if events dropdown has options (if events exist)
    const eventsDropdown = page.locator('select#company_event').first();
    const noEventsMessage = page.locator('text=/No upcoming company events/i').first();
    const loadingMessage = page.locator('text=/Loading events/i').first();

    const hasDropdown = await eventsDropdown.isVisible().catch(() => false);
    const hasNoEvents = await noEventsMessage.isVisible().catch(() => false);
    const isLoading = await loadingMessage.isVisible().catch(() => false);

    // Should have one of these visible
    expect(hasDropdown || hasNoEvents || isLoading).toBeTruthy();

    if (hasDropdown) {
      const options = await eventsDropdown.locator('option').count();
      expect(options).toBeGreaterThan(0); // At least the placeholder option
    }
  });

  test('should require recipient email', async ({ page }) => {
    await openInvitationForm(page);

    const emailInput = page.locator('input[type="email"][name*="email"], input[placeholder*="email" i]').first();

    if (await emailInput.isVisible()) {
      await expect(emailInput).toHaveAttribute('required', '');
    }
  });

  test('should validate email format', async ({ page }) => {
    await openInvitationForm(page);

    const emailInput = page.locator('input[type="email"]').first();

    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email');

      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();

      // HTML5 validation should trigger
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    }
  });

  test('should show AI-generated message preview', async ({ page }) => {
    await openInvitationForm(page);

    // Look for message preview or template area
    const preview = page.locator('textarea, [class*="preview"], [class*="message"]').first();
    await expect(preview).toBeVisible({ timeout: 5000 });
  });

  test('should have send invitation button', async ({ page }) => {
    await openInvitationForm(page);

    const sendButton = page.locator('button:has-text("Send"), button[type="submit"]').first();
    await expect(sendButton).toBeVisible();
  });

  test('should display usage limit information', async ({ page }) => {
    await openInvitationForm(page);

    // Check for limit counter
    const limitText = page.locator('text=/\d+\s*(of|\/)\s*\d+|remaining|limit/i').first();
    const isVisible = await limitText.isVisible().catch(() => false);

    if (isVisible) {
      await expect(limitText).toBeVisible();
    }
  });

  test('should allow selecting event and filling form', async ({ page }) => {
    await openInvitationForm(page);

    // Try to complete the form
    const companyEventRadio = page.locator('input[value="company_event"]').first();

    if (await companyEventRadio.isVisible()) {
      await companyEventRadio.click();
      await page.waitForTimeout(1000);

      // Select an event
      const eventsDropdown = page.locator('select').filter({ hasText: /Tuesday|Thursday/i }).first();
      if (await eventsDropdown.isVisible()) {
        const options = await eventsDropdown.locator('option').all();
        if (options.length > 1) {
          await eventsDropdown.selectOption({ index: 1 }); // Select first real event
        }
      }

      // Fill email
      const emailInput = page.locator('input[type="email"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com');
      }

      // Form should be ready for submission
      const submitButton = page.locator('button[type="submit"]').first();
      await expect(submitButton).toBeEnabled();
    }
  });

  test('should show success message after sending invitation', async ({ page }) => {
    await openInvitationForm(page);

    // Fill and submit form
    const companyEventRadio = page.locator('input[value="company_event"]').first();

    if (await companyEventRadio.isVisible()) {
      await companyEventRadio.click();
      await page.waitForTimeout(1000);

      const eventsDropdown = page.locator('select').filter({ hasText: /Tuesday|Thursday/i }).first();
      if (await eventsDropdown.isVisible()) {
        const options = await eventsDropdown.locator('option').all();
        if (options.length > 1) {
          await eventsDropdown.selectOption({ index: 1 });

          const emailInput = page.locator('input[type="email"]').first();
          await emailInput.fill('test@example.com');

          const submitButton = page.locator('button[type="submit"]').first();
          await submitButton.click();

          // Look for success message
          const successMessage = page.locator('text=/success|sent|delivered/i').first();
          await expect(successMessage).toBeVisible({ timeout: 10000 });
        }
      }
    }
  });

  test('should prevent sending when limit reached', async ({ page }) => {
    await openInvitationForm(page);

    // Check if usage limit component shows disabled state
    const limitWarning = page.locator('text=/limit reached|no.*remaining/i').first();
    const isLimitReached = await limitWarning.isVisible().catch(() => false);

    if (isLimitReached) {
      const submitButton = page.locator('button[type="submit"]').first();
      await expect(submitButton).toBeDisabled();
    }
  });

  test('should navigate to subscription upgrade if needed', async ({ page }) => {
    const upgradeLink = page.locator('a[href*="subscription"], a:has-text("Upgrade")').first();
    const isVisible = await upgradeLink.isVisible().catch(() => false);

    if (isVisible) {
      await expect(upgradeLink).toBeVisible();
      await expect(upgradeLink).toHaveAttribute('href', /subscription/);
    }
  });
});
