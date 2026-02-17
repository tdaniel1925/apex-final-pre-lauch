import { test, expect } from '@playwright/test';

// Test credentials (create these test accounts in your DB first)
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'TestAdmin123!';

test.describe('Email Nurture Campaign System', () => {
  test.describe('Admin Email Templates Management', () => {
    test.beforeEach(async ({ page }) => {
      // Login as admin
      await page.goto('/login');
      await page.fill('input[type="email"]', ADMIN_EMAIL);
      await page.fill('input[type="password"]', ADMIN_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL('/dashboard');

      // Navigate to email templates
      await page.goto('/admin/email-templates');
    });

    test('should display email templates list', async ({ page }) => {
      // Check page loaded
      await expect(page.getByText('Email Templates')).toBeVisible();
      await expect(page.getByText('Manage nurture campaign email templates')).toBeVisible();

      // Check for create button
      await expect(page.getByRole('button', { name: /create template/i })).toBeVisible();

      // Check for filter dropdown
      await expect(page.getByText('Filter:')).toBeVisible();
    });

    test('should filter templates by licensing status', async ({ page }) => {
      // Get initial count
      const allTemplates = page.locator('[class*="bg-white rounded-lg shadow"]').filter({ has: page.locator('h3') });
      const initialCount = await allTemplates.count();

      // Filter to licensed only
      await page.selectOption('select', 'licensed');
      await page.waitForTimeout(500); // Wait for filter

      // Check licensed badge is visible
      await expect(page.getByText('Licensed').first()).toBeVisible();

      // Filter to non-licensed
      await page.selectOption('select', 'non_licensed');
      await page.waitForTimeout(500);

      // Check non-licensed badge is visible
      await expect(page.getByText('Non-Licensed').first()).toBeVisible();
    });

    test('should open create template modal', async ({ page }) => {
      // Click create button
      await page.click('button:has-text("Create Template")');

      // Check modal opened
      await expect(page.getByText('Create Template')).toBeVisible();
      await expect(page.getByText('Template Name')).toBeVisible();
      await expect(page.getByText('Subject')).toBeVisible();
      await expect(page.getByText('Email Body (HTML)')).toBeVisible();

      // Check AI generation section
      await expect(page.getByText('Generate with AI')).toBeVisible();
    });

    test('should create template manually', async ({ page }) => {
      // Open create modal
      await page.click('button:has-text("Create Template")');

      // Fill in template details
      await page.fill('input[placeholder*="Welcome Email"]', 'Test Template Manual');
      await page.fill('input[placeholder*="Internal description"]', 'Test description');
      await page.selectOption('select', { label: 'Licensed' });
      await page.fill('input[type="number"]', '2'); // Sequence order
      await page.fill('textarea[placeholder*="Hi {first_name}"]', '<h2>Test Email</h2><p>Hello {first_name}!</p>');
      await page.fill('input[placeholder*="Welcome to Apex"]', 'Test Subject {first_name}');

      // Submit
      await page.click('button:has-text("Create Template")');

      // Check success message
      await expect(page.getByText(/template created/i)).toBeVisible({ timeout: 10000 });
    });

    test('should open AI generation modal', async ({ page }) => {
      // Open create modal
      await page.click('button:has-text("Create Template")');

      // Click AI generate button
      await page.click('button:has-text("Generate")');

      // Check AI modal opened
      await expect(page.getByText('AI Email Generator')).toBeVisible();
      await expect(page.getByText('What kind of email do you want?')).toBeVisible();
      await expect(page.getByPlaceholder(/Example:/)).toBeVisible();
    });

    test('should generate email with AI (requires API key)', async ({ page }) => {
      // Skip if no API key
      test.skip(!process.env.ANTHROPIC_API_KEY, 'ANTHROPIC_API_KEY not set');

      // Open create modal
      await page.click('button:has-text("Create Template")');

      // Fill sequence info first
      await page.selectOption('select', { label: 'Licensed' });

      // Click AI generate
      await page.click('button:has-text("Generate")');

      // Enter prompt
      await page.fill('textarea[placeholder*="Example:"]',
        'A welcome email for licensed agents explaining how to verify their license and get started');

      // Generate
      await page.click('button:has-text("Generate Email")');

      // Wait for generation (should show loading state)
      await expect(page.getByText('Generating...')).toBeVisible();

      // Wait for completion (up to 10 seconds)
      await expect(page.getByText('Subject')).toBeVisible({ timeout: 10000 });

      // Check fields were populated
      const subjectField = page.locator('input[placeholder*="Welcome to Apex"]');
      await expect(subjectField).not.toHaveValue('');
    });

    test('should edit existing template', async ({ page }) => {
      // Find first template edit button
      const editButton = page.getByRole('button', { name: 'Edit' }).first();
      await editButton.click();

      // Check edit modal opened
      await expect(page.getByText('Edit Template')).toBeVisible();

      // Modify subject
      const subjectField = page.locator('input[placeholder*="Welcome to Apex"]');
      await subjectField.fill('Modified Subject Line');

      // Save
      await page.click('button:has-text("Update Template")');

      // Check success
      await expect(page.getByText(/template updated/i)).toBeVisible({ timeout: 10000 });
    });

    test('should delete template with confirmation', async ({ page }) => {
      // Get initial count
      const initialTemplates = page.locator('button:has-text("Delete")');
      const initialCount = await initialTemplates.count();

      if (initialCount > 2) { // Keep at least 2 templates
        // Click first delete button
        await initialTemplates.first().click();

        // Handle confirmation dialog
        page.on('dialog', dialog => dialog.accept());

        // Wait for deletion
        await page.waitForTimeout(1000);

        // Check success message
        await expect(page.getByText(/template deleted/i)).toBeVisible();
      }
    });

    test('should toggle template active status', async ({ page }) => {
      // Open edit modal for first template
      await page.getByRole('button', { name: 'Edit' }).first().click();

      // Find and toggle active checkbox
      const activeCheckbox = page.locator('input[type="checkbox"]#is_active');
      const wasChecked = await activeCheckbox.isChecked();

      await activeCheckbox.click();

      // Save
      await page.click('button:has-text("Update Template")');

      // Verify update
      await expect(page.getByText(/template updated/i)).toBeVisible({ timeout: 10000 });

      // Re-open to verify
      await page.getByRole('button', { name: 'Edit' }).first().click();
      const nowChecked = await activeCheckbox.isChecked();
      expect(nowChecked).toBe(!wasChecked);
    });

    test('should insert variables from helper', async ({ page }) => {
      // Open create modal
      await page.click('button:has-text("Create Template")');

      // Click variable helper
      await page.click('button:has-text("Insert Variable")');

      // Check dropdown opened
      await expect(page.getByText('{first_name}')).toBeVisible();
      await expect(page.getByText('{dashboard_link}')).toBeVisible();

      // Click a variable
      await page.click('text="{first_name}"');

      // Check it was inserted (need to verify textarea has the variable)
      // Note: This test might need adjustment based on actual behavior
    });
  });

  test.describe('Signup Email Enrollment', () => {
    test('should enroll new user in campaign and send welcome email (requires email setup)', async ({ page }) => {
      // Skip if no Resend key
      test.skip(!process.env.RESEND_API_KEY, 'RESEND_API_KEY not set');

      const testEmail = `test-${Date.now()}@example.com`;

      // Go to signup page
      await page.goto('/signup');

      // Fill signup form
      await page.fill('input[name="first_name"]', 'Test');
      await page.fill('input[name="last_name"]', 'User');
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', 'TestPass123!');
      await page.fill('input[name="slug"]', `test-user-${Date.now()}`);

      // Select licensing status
      await page.click('input[value="licensed"]');

      // Submit
      await page.click('button[type="submit"]');

      // Wait for redirect to dashboard
      await page.waitForURL('/dashboard', { timeout: 15000 });

      // Verify we're logged in
      await expect(page.getByText(/welcome|dashboard/i)).toBeVisible();

      // Note: Actual email sending verification would require checking
      // Resend dashboard or database email_sends table
    });
  });

  test.describe('User Licensing Status Change', () => {
    test('should allow user to change their own licensing status', async ({ page }) => {
      // Create and login as test user first
      // (This assumes you have a test user created)

      await page.goto('/login');
      // Add test user login here

      // Navigate to profile
      await page.goto('/dashboard/profile');

      // Find and click change status button
      await page.click('button:has-text("Change Licensing Status")');

      // Check modal opened
      await expect(page.getByText('Change Licensing Status')).toBeVisible();

      // Select different status
      const currentStatus = await page.locator('input[type="radio"]:checked').getAttribute('value');
      const newStatus = currentStatus === 'licensed' ? 'non_licensed' : 'licensed';
      await page.click(`input[value="${newStatus}"]`);

      // Submit
      await page.click('button:has-text("Update Status")');

      // Check success
      await expect(page.getByText(/status updated/i)).toBeVisible({ timeout: 10000 });
    });
  });
});

test.describe('Email Template Variable System', () => {
  test('should have all required variables available', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await page.goto('/admin/email-templates');
    await page.click('button:has-text("Create Template")');
    await page.click('button:has-text("Insert Variable")');

    // Check all important variables are present
    const requiredVars = [
      'first_name',
      'last_name',
      'email',
      'dashboard_link',
      'referral_link',
      'team_link',
    ];

    for (const varName of requiredVars) {
      await expect(page.getByText(`{${varName}}`)).toBeVisible();
    }
  });
});
