/**
 * E2E Tests for Signup Flow
 * Tests complete signup process for both personal and business registrations
 */

import { test, expect } from '@playwright/test';

test.describe('Signup Flow - Personal and Business Registration', () => {
  // ========================================
  // PERSONAL REGISTRATION E2E TEST
  // ========================================

  test('should complete personal registration successfully', async ({ page }) => {
    await page.goto('/signup');

    // Step 1: Select Personal Registration Type
    await page.getByRole('radio', { name: /personal/i }).check();
    await expect(page.getByRole('radio', { name: /personal/i })).toBeChecked();

    // Step 2: Fill Personal Information
    await page.getByLabel('First Name').fill('John');
    await page.getByLabel('Last Name').fill('Doe');
    await page.getByLabel('Email').fill(`john.doe.${Date.now()}@example.com`);
    await page.getByLabel('Password').fill('SecurePass123');

    // Step 3: Username (auto-generated from name, can be edited)
    const usernameField = page.getByLabel('Username');
    await expect(usernameField).toHaveValue(/john-doe/);

    // Step 4: Contact Information
    await page.getByLabel('Phone').fill('5551234567');

    // Step 5: Address
    await page.getByLabel('Street Address').fill('123 Main St');
    await page.getByLabel('City').fill('Houston');
    await page.getByLabel('State').selectOption('TX');
    await page.getByLabel('ZIP Code').fill('77001');

    // Step 6: Date of Birth (18+ required)
    await page.getByLabel('Date of Birth').fill('1990-01-01');

    // Step 7: Social Security Number
    await page.getByLabel('Social Security Number').fill('123-45-6789');

    // Step 8: Licensing Status
    await page.getByRole('radio', { name: /No, I am not licensed/i }).check();

    // Step 9: Submit
    await page.getByRole('button', { name: /Join Apex Today/i }).click();

    // Expected: Redirect to credentials confirmation page
    await expect(page).toHaveURL('/signup/credentials', { timeout: 10000 });
  });

  test('should show validation errors for incomplete personal registration', async ({ page }) => {
    await page.goto('/signup');

    // Select Personal Registration
    await page.getByRole('radio', { name: /personal/i }).check();

    // Try to submit without filling required fields
    await page.getByRole('button', { name: /Join Apex Today/i }).click();

    // Expect validation errors
    await expect(page.getByText(/First name/i)).toBeVisible();
    await expect(page.getByText(/Email/i)).toBeVisible();
  });

  test('should validate age requirement (18+) for personal registration', async ({ page }) => {
    await page.goto('/signup');

    // Select Personal Registration
    await page.getByRole('radio', { name: /personal/i }).check();

    // Fill all fields except use an underage DOB
    await page.getByLabel('First Name').fill('Young');
    await page.getByLabel('Last Name').fill('Person');
    await page.getByLabel('Email').fill(`young.person.${Date.now()}@example.com`);
    await page.getByLabel('Password').fill('SecurePass123');
    await page.getByLabel('Phone').fill('5551234567');
    await page.getByLabel('Street Address').fill('123 Main St');
    await page.getByLabel('City').fill('Houston');
    await page.getByLabel('State').selectOption('TX');
    await page.getByLabel('ZIP Code').fill('77001');

    // Use underage DOB (17 years old)
    const today = new Date();
    const under18 = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
    await page.getByLabel('Date of Birth').fill(under18.toISOString().split('T')[0]);

    await page.getByLabel('Social Security Number').fill('123-45-6789');
    await page.getByRole('radio', { name: /No, I am not licensed/i }).check();

    // Submit
    await page.getByRole('button', { name: /Join Apex Today/i }).click();

    // Expect age validation error
    await expect(page.getByText(/18 years old/i)).toBeVisible({ timeout: 5000 });
  });

  // ========================================
  // BUSINESS REGISTRATION E2E TEST
  // ========================================

  test('should complete business registration successfully', async ({ page }) => {
    await page.goto('/signup');

    // Step 1: Select Business Registration Type
    await page.getByRole('radio', { name: /business/i }).check();
    await expect(page.getByRole('radio', { name: /business/i })).toBeChecked();

    // Step 2: Fill Personal Information (Primary Contact)
    await page.getByLabel('First Name').fill('Jane');
    await page.getByLabel('Last Name').fill('Smith');
    await page.getByLabel('Email').fill(`jane.smith.${Date.now()}@businessagency.com`);
    await page.getByLabel('Password').fill('SecurePass456');

    // Step 3: Company Information
    await page.getByLabel(/Company Legal Name/i).fill('Smith Insurance Agency LLC');
    await page.getByLabel('Business Type').selectOption('llc');
    await page.getByLabel('DBA Name').fill('Smith Agency');
    await page.getByLabel('Business Website').fill('https://www.smithagency.com');

    // Step 4: Contact Information
    await page.getByLabel('Phone').fill('8005551234');

    // Step 5: Address
    await page.getByLabel('Street Address').fill('456 Business Blvd');
    await page.getByLabel('Apartment, Suite, etc.').fill('Suite 200');
    await page.getByLabel('City').fill('Dallas');
    await page.getByLabel('State').selectOption('TX');
    await page.getByLabel('ZIP Code').fill('75201');

    // Step 6: Employer Identification Number (EIN)
    await page.getByLabel('Employer Identification Number (EIN)').fill('12-3456789');

    // Step 7: Licensing Status
    await page.getByRole('radio', { name: /Yes, I am licensed/i }).check();

    // Step 8: Submit
    await page.getByRole('button', { name: /Join Apex Today/i }).click();

    // Expected: Redirect to credentials confirmation page
    await expect(page).toHaveURL('/signup/credentials', { timeout: 10000 });
  });

  test('should show validation errors for incomplete business registration', async ({ page }) => {
    await page.goto('/signup');

    // Select Business Registration
    await page.getByRole('radio', { name: /business/i }).check();

    // Fill only some fields, leave company_name and EIN empty
    await page.getByLabel('First Name').fill('Jane');
    await page.getByLabel('Last Name').fill('Smith');

    // Try to submit
    await page.getByRole('button', { name: /Join Apex Today/i }).click();

    // Expect validation errors for required business fields
    await expect(page.getByText(/Company.*required/i)).toBeVisible();
    await expect(page.getByText(/Business Type/i)).toBeVisible();
  });

  test('should validate EIN format for business registration', async ({ page }) => {
    await page.goto('/signup');

    // Select Business Registration
    await page.getByRole('radio', { name: /business/i }).check();

    // Fill all required fields but use invalid EIN format
    await page.getByLabel('First Name').fill('Jane');
    await page.getByLabel('Last Name').fill('Smith');
    await page.getByLabel('Email').fill(`jane.smith.${Date.now()}@businessagency.com`);
    await page.getByLabel('Password').fill('SecurePass456');
    await page.getByLabel(/Company Legal Name/i).fill('Smith Agency LLC');
    await page.getByLabel('Business Type').selectOption('llc');
    await page.getByLabel('Phone').fill('8005551234');
    await page.getByLabel('Street Address').fill('456 Business Blvd');
    await page.getByLabel('City').fill('Dallas');
    await page.getByLabel('State').selectOption('TX');
    await page.getByLabel('ZIP Code').fill('75201');

    // Use invalid EIN format (missing hyphen)
    await page.getByLabel('Employer Identification Number (EIN)').fill('123456789');

    await page.getByRole('radio', { name: /Yes, I am licensed/i }).check();

    // Submit
    await page.getByRole('button', { name: /Join Apex Today/i }).click();

    // Expect EIN format validation error
    await expect(page.getByText(/EIN.*format/i)).toBeVisible({ timeout: 5000 });
  });

  // ========================================
  // FIELD CONDITIONAL VISIBILITY TESTS
  // ========================================

  test('should show SSN field for personal, EIN for business', async ({ page }) => {
    await page.goto('/signup');

    // Personal registration: SSN visible, EIN not visible
    await page.getByRole('radio', { name: /personal/i }).check();
    await expect(page.getByLabel('Social Security Number')).toBeVisible();
    await expect(page.getByLabel('Employer Identification Number (EIN)')).not.toBeVisible();

    // Business registration: EIN visible, SSN not visible
    await page.getByRole('radio', { name: /business/i }).check();
    await expect(page.getByLabel('Employer Identification Number (EIN)')).toBeVisible();
    await expect(page.getByLabel('Social Security Number')).not.toBeVisible();
  });

  test('should show business-specific fields only for business registration', async ({ page }) => {
    await page.goto('/signup');

    // Personal registration: business fields not visible
    await page.getByRole('radio', { name: /personal/i }).check();
    await expect(page.getByLabel('Business Type')).not.toBeVisible();
    await expect(page.getByLabel('DBA Name')).not.toBeVisible();
    await expect(page.getByLabel('Business Website')).not.toBeVisible();

    // Business registration: business fields visible
    await page.getByRole('radio', { name: /business/i }).check();
    await expect(page.getByLabel('Business Type')).toBeVisible();
    await expect(page.getByLabel('DBA Name')).toBeVisible();
    await expect(page.getByLabel('Business Website')).toBeVisible();
  });

  test('should show date of birth field only for personal registration', async ({ page }) => {
    await page.goto('/signup');

    // Personal registration: DOB visible
    await page.getByRole('radio', { name: /personal/i }).check();
    await expect(page.getByLabel('Date of Birth')).toBeVisible();

    // Business registration: DOB not visible
    await page.getByRole('radio', { name: /business/i }).check();
    await expect(page.getByLabel('Date of Birth')).not.toBeVisible();
  });

  test('should require company name for business, make it optional for personal', async ({ page }) => {
    await page.goto('/signup');

    // Personal registration: Company name is optional
    await page.getByRole('radio', { name: /personal/i }).check();
    const personalCompanyLabel = page.getByText(/Company Name.*Optional/i);
    await expect(personalCompanyLabel).toBeVisible();

    // Business registration: Company name is required
    await page.getByRole('radio', { name: /business/i }).check();
    const businessCompanyLabel = page.getByText(/Company Legal Name.*\*/);
    await expect(businessCompanyLabel).toBeVisible();
  });
});
