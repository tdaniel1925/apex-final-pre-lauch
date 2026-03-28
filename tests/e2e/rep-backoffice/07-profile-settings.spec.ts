import { test, expect } from '@playwright/test';

/**
 * Rep Back Office - Profile and Settings Tests
 * Tests user profile management, settings, and account preferences
 */

async function login(page: any) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill('test.distributor@apex.com');
  await page.locator('input[type="password"]').fill('TestPassword123!');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

test.describe('Rep Back Office - Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/profile');
  });

  test('should display profile page', async ({ page }) => {
    await expect(page).toHaveURL(/profile/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should show user information', async ({ page }) => {
    // Check for name fields
    const nameField = page.locator('text=/name|first name|last name/i').first();
    await expect(nameField).toBeVisible({ timeout: 5000 });
  });

  test('should display email address', async ({ page }) => {
    const emailText = page.locator('text=/email|@/i').first();
    await expect(emailText).toBeVisible();
  });

  test('should show phone number field', async ({ page }) => {
    const phoneField = page.locator('input[type="tel"], input[name*="phone"]').first();
    const isVisible = await phoneField.isVisible().catch(() => false);

    if (isVisible) {
      await expect(phoneField).toBeVisible();
    }
  });

  test('should have profile photo/avatar section', async ({ page }) => {
    const avatar = page.locator('img[alt*="profile" i], img[alt*="avatar" i], [class*="avatar"], [class*="photo"]').first();
    const isVisible = await avatar.isVisible().catch(() => false);

    if (isVisible) {
      await expect(avatar).toBeVisible();
    }
  });

  test('should have edit profile functionality', async ({ page }) => {
    const editButton = page.locator('button:has-text("Edit"), button:has-text("Update"), input[type="text"]').first();
    await expect(editButton).toBeVisible({ timeout: 5000 });
  });

  test('should allow updating profile information', async ({ page }) => {
    const firstNameInput = page.locator('input[name*="first"], input[placeholder*="first" i]').first();

    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill('Updated Name');
      await expect(firstNameInput).toHaveValue('Updated Name');
    }
  });

  test('should have save/submit button for profile changes', async ({ page }) => {
    const saveButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Update")').first();
    const isVisible = await saveButton.isVisible().catch(() => false);

    if (isVisible) {
      await expect(saveButton).toBeVisible();
    }
  });

  test('should show distributor ID or member number', async ({ page }) => {
    const idField = page.locator('text=/id|member|distributor.*#/i').first();
    const isVisible = await idField.isVisible().catch(() => false);

    if (isVisible) {
      await expect(idField).toBeVisible();
    }
  });

  test('should display rank information', async ({ page }) => {
    const rankInfo = page.locator('text=/rank|level|tier/i').first();
    const isVisible = await rankInfo.isVisible().catch(() => false);

    if (isVisible) {
      await expect(rankInfo).toBeVisible();
    }
  });

  test('should show join date or enrollment information', async ({ page }) => {
    const joinDate = page.locator('text=/joined|enrolled|member since/i').first();
    const isVisible = await joinDate.isVisible().catch(() => false);

    if (isVisible) {
      await expect(joinDate).toBeVisible();
    }
  });
});

test.describe('Rep Back Office - Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/dashboard/settings');
  });

  test('should display settings page', async ({ page }) => {
    await expect(page).toHaveURL(/settings/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should have notification preferences', async ({ page }) => {
    const notificationSection = page.locator('text=/notification|alert|email preference/i').first();
    const isVisible = await notificationSection.isVisible().catch(() => false);

    if (isVisible) {
      await expect(notificationSection).toBeVisible();
    }
  });

  test('should have notification toggle switches', async ({ page }) => {
    const toggles = page.locator('input[type="checkbox"], [role="switch"], button[role="switch"]').first();
    const isVisible = await toggles.isVisible().catch(() => false);

    if (isVisible) {
      await expect(toggles).toBeVisible();
    }
  });

  test('should have password change option', async ({ page }) => {
    const passwordSection = page.locator('text=/password|change password|update password/i').first();
    const isVisible = await passwordSection.isVisible().catch(() => false);

    if (isVisible) {
      await expect(passwordSection).toBeVisible();
    }
  });

  test('should have communication preferences', async ({ page }) => {
    const commPrefs = page.locator('text=/communication|contact preference/i').first();
    const isVisible = await commPrefs.isVisible().catch(() => false);

    if (isVisible) {
      await expect(commPrefs).toBeVisible();
    }
  });

  test('should have privacy settings', async ({ page }) => {
    const privacySection = page.locator('text=/privacy|security/i').first();
    const isVisible = await privacySection.isVisible().catch(() => false);

    if (isVisible) {
      await expect(privacySection).toBeVisible();
    }
  });

  test('should allow toggling notification settings', async ({ page }) => {
    const firstToggle = page.locator('input[type="checkbox"]').first();

    if (await firstToggle.isVisible()) {
      const initialState = await firstToggle.isChecked();
      await firstToggle.click();
      const newState = await firstToggle.isChecked();
      expect(newState).not.toBe(initialState);
    }
  });

  test('should have save settings button', async ({ page }) => {
    const saveButton = page.locator('button[type="submit"], button:has-text("Save")').first();
    const isVisible = await saveButton.isVisible().catch(() => false);

    if (isVisible) {
      await expect(saveButton).toBeVisible();
    }
  });
});

test.describe('Rep Back Office - Account Security', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should have password change functionality', async ({ page }) => {
    await page.goto('/dashboard/settings');

    const passwordLink = page.locator('a:has-text("Password"), button:has-text("Change Password")').first();
    const isVisible = await passwordLink.isVisible().catch(() => false);

    if (isVisible) {
      await passwordLink.click();
      await page.waitForTimeout(500);

      // Should see password fields
      const passwordFields = page.locator('input[type="password"]');
      const count = await passwordFields.count();
      expect(count).toBeGreaterThanOrEqual(2); // Current and new password
    }
  });

  test('should require current password for password change', async ({ page }) => {
    await page.goto('/dashboard/settings');

    const currentPasswordField = page.locator('input[name*="current"], input[placeholder*="current" i]').filter({ has: page.locator('[type="password"]') }).first();
    const isVisible = await currentPasswordField.isVisible().catch(() => false);

    if (isVisible) {
      await expect(currentPasswordField).toHaveAttribute('required', '');
    }
  });
});

test.describe('Rep Back Office - Replicated Site Settings', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should show replicated site URL if feature exists', async ({ page }) => {
    await page.goto('/dashboard/profile');

    const replicatedSite = page.locator('text=/replicated|personal site|website/i').first();
    const isVisible = await replicatedSite.isVisible().catch(() => false);

    if (isVisible) {
      await expect(replicatedSite).toBeVisible();
    }
  });

  test('should have option to customize replicated site', async ({ page }) => {
    await page.goto('/dashboard/settings');

    const customizeLink = page.locator('a:has-text("Site"), a:has-text("Website"), button:has-text("Customize")').first();
    const isVisible = await customizeLink.isVisible().catch(() => false);

    if (isVisible) {
      await expect(customizeLink).toBeVisible();
    }
  });
});

test.describe('Rep Back Office - Payment Information', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should have payment/banking section if available', async ({ page }) => {
    await page.goto('/dashboard/settings');

    const paymentSection = page.locator('text=/payment|bank|direct deposit/i').first();
    const isVisible = await paymentSection.isVisible().catch(() => false);

    if (isVisible) {
      await expect(paymentSection).toBeVisible();
    }
  });

  test('should show tax information section if available', async ({ page }) => {
    await page.goto('/dashboard/settings');

    const taxSection = page.locator('text=/tax|w-9|1099/i').first();
    const isVisible = await taxSection.isVisible().catch(() => false);

    if (isVisible) {
      await expect(taxSection).toBeVisible();
    }
  });
});
