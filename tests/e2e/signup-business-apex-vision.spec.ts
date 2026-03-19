/**
 * E2E Test: Business Signup with apex-vision Sponsor
 *
 * Tests the complete business registration flow with the apex-vision sponsor referral.
 * This test validates:
 * - URL parameter handling (?ref=apex-vision)
 * - Business registration type selection
 * - All business-specific fields (EIN, company name, business type, etc.)
 * - Form submission and redirect flow
 * - API response handling
 */

import { test, expect, type Page } from '@playwright/test';

// Generate unique timestamp for test data
const timestamp = Date.now();

// Realistic business test data
const testData = {
  registration_type: 'business',
  first_name: 'Jane',
  last_name: 'Business',
  email: `test.business.${timestamp}@apextest.com`,
  password: 'SecurePass456!',
  slug: `test-business-${timestamp}`,
  company_name: 'Test Insurance Agency LLC',
  business_type: 'llc',
  ein: '12-3456789',
  dba_name: 'Test Agency',
  business_website: 'https://testagency.com',
  phone: '8005551234',
  address_line1: '456 Business Blvd',
  address_line2: 'Suite 200',
  city: 'Dallas',
  state: 'TX',
  zip: '75201',
  licensing_status: 'licensed',
  sponsor_slug: 'apex-vision',
};

test.describe('Business Signup with apex-vision Sponsor', () => {

  test.beforeEach(async ({ page }) => {
    // Set up response and request interceptors for debugging
    page.on('response', async (response) => {
      if (response.url().includes('/api/signup')) {
        console.log(`[API Response] ${response.status()} ${response.url()}`);
        try {
          const json = await response.json();
          console.log('[API Response Body]', JSON.stringify(json, null, 2));
        } catch (e) {
          // Response might not be JSON
          console.log('[API Response] Could not parse as JSON');
        }
      }
    });

    page.on('request', (request) => {
      if (request.url().includes('/api/signup')) {
        console.log(`[API Request] ${request.method()} ${request.url()}`);
        try {
          const postData = request.postDataJSON();
          // Mask sensitive data in logs
          const safeData = { ...postData };
          if (safeData.password) safeData.password = '***';
          if (safeData.ssn) safeData.ssn = '***';
          if (safeData.ein) safeData.ein = '***';
          console.log('[API Request Body]', JSON.stringify(safeData, null, 2));
        } catch (e) {
          // Request might not have JSON body
        }
      }
    });
  });

  test('should display apex-vision sponsor banner', async ({ page }) => {
    // Navigate to signup with ref parameter
    await page.goto(`/signup?ref=${testData.sponsor_slug}`);

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify sponsor banner is visible
    const sponsorBanner = page.getByText(/You've been invited by/i);
    await expect(sponsorBanner).toBeVisible({ timeout: 10000 });

    // Verify "Apex Vision" name appears in the banner
    const apexVisionName = page.getByText('Apex Vision');
    await expect(apexVisionName).toBeVisible();

    console.log('✅ Sponsor banner displayed correctly');
  });

  test('should complete full business registration successfully', async ({ page }) => {
    console.log('🧪 Starting business signup test with data:', {
      email: testData.email,
      slug: testData.slug,
      company_name: testData.company_name,
    });

    // Navigate to signup with apex-vision referral
    await page.goto(`/signup?ref=${testData.sponsor_slug}`);
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    await page.screenshot({ path: `test-results/01-signup-page-${timestamp}.png`, fullPage: true });

    // STEP 1: Select Business Registration Type
    console.log('Step 1: Selecting business registration type...');
    const businessRadio = page.getByRole('radio', { name: /business/i });
    await businessRadio.check();
    await expect(businessRadio).toBeChecked();
    console.log('✅ Business registration type selected');

    // STEP 2: Fill Personal Information (Primary Contact)
    console.log('Step 2: Filling personal information...');
    await page.getByLabel('First Name').fill(testData.first_name);
    await page.getByLabel('Last Name').fill(testData.last_name);
    await page.getByLabel('Email').fill(testData.email);

    // Password field
    const passwordField = page.getByLabel('Password').first();
    await passwordField.fill(testData.password);
    console.log('✅ Personal information filled');

    // STEP 3: Username (slug) - auto-generated, but we'll set it explicitly
    console.log('Step 3: Setting username...');
    const slugField = page.getByLabel('Username');
    await slugField.fill(testData.slug);

    // Wait for slug validation to complete
    await page.waitForTimeout(1000);

    // Check for availability indicator (green checkmark)
    const slugAvailable = page.locator('text="✓"').first();
    await expect(slugAvailable).toBeVisible({ timeout: 5000 });
    console.log('✅ Username available');

    // STEP 4: Fill Company Information (Business-specific)
    console.log('Step 4: Filling company information...');
    await page.getByLabel(/Company Legal Name/i).fill(testData.company_name);
    await page.getByLabel('Business Type').selectOption(testData.business_type);
    await page.getByLabel('DBA Name').fill(testData.dba_name);
    await page.getByLabel('Business Website').fill(testData.business_website);
    console.log('✅ Company information filled');

    // STEP 5: Contact Information
    console.log('Step 5: Filling contact information...');
    await page.getByLabel('Phone').fill(testData.phone);
    console.log('✅ Contact information filled');

    // STEP 6: Address Fields
    console.log('Step 6: Filling address...');
    await page.getByLabel('Street Address').fill(testData.address_line1);
    await page.getByLabel('Apartment, Suite, etc.').fill(testData.address_line2);
    await page.getByLabel('City').fill(testData.city);
    await page.getByLabel('State').selectOption(testData.state);
    await page.getByLabel('ZIP Code').fill(testData.zip);
    console.log('✅ Address filled');

    // Take screenshot before EIN
    await page.screenshot({ path: `test-results/02-before-ein-${timestamp}.png`, fullPage: true });

    // STEP 7: Employer Identification Number (EIN)
    console.log('Step 7: Entering EIN...');
    const einField = page.getByLabel('Employer Identification Number (EIN)');
    await expect(einField).toBeVisible();
    await einField.fill(testData.ein);
    console.log('✅ EIN entered');

    // STEP 8: Licensing Status
    console.log('Step 8: Selecting licensing status...');
    const licensedRadio = page.getByRole('radio', { name: /Yes, I am licensed/i });
    await licensedRadio.check();
    await expect(licensedRadio).toBeChecked();
    console.log('✅ Licensing status selected');

    // Take screenshot before submission
    await page.screenshot({ path: `test-results/03-before-submit-${timestamp}.png`, fullPage: true });

    // STEP 9: Submit Form
    console.log('Step 9: Submitting form...');
    const submitButton = page.getByRole('button', { name: /Join Apex Today/i });

    // Wait for any pending operations
    await page.waitForTimeout(500);

    // Ensure button is not disabled
    await expect(submitButton).toBeEnabled();

    // Click submit and wait for navigation or error
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/signup') && response.request().method() === 'POST',
      { timeout: 30000 }
    );

    await submitButton.click();
    console.log('🔄 Form submitted, waiting for response...');

    // Wait for API response
    const response = await responsePromise;
    const responseData = await response.json();

    console.log('📥 API Response:', {
      status: response.status(),
      success: responseData.success,
      message: responseData.message,
      error: responseData.error,
    });

    // Take screenshot after submission
    await page.screenshot({ path: `test-results/04-after-submit-${timestamp}.png`, fullPage: true });

    // Verify the response
    if (!responseData.success) {
      console.error('❌ Signup failed:', responseData.message);
      console.error('Error details:', responseData);

      // Check for specific error messages on the page
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `test-results/05-error-state-${timestamp}.png`, fullPage: true });

      throw new Error(`Signup failed: ${responseData.message || responseData.error}`);
    }

    expect(response.status()).toBe(201);
    expect(responseData.success).toBe(true);
    console.log('✅ API returned success');

    // STEP 10: Verify redirect to credentials page
    console.log('Step 10: Verifying redirect...');
    await expect(page).toHaveURL('/signup/credentials', { timeout: 10000 });
    console.log('✅ Redirected to credentials page');

    // Take final screenshot
    await page.screenshot({ path: `test-results/06-credentials-page-${timestamp}.png`, fullPage: true });

    console.log('🎉 Business signup test completed successfully!');
  });

  test('should validate business-specific required fields', async ({ page }) => {
    await page.goto(`/signup?ref=${testData.sponsor_slug}`);
    await page.waitForLoadState('networkidle');

    // Select business registration
    await page.getByRole('radio', { name: /business/i }).check();

    // Fill minimal fields (not business-specific ones)
    await page.getByLabel('First Name').fill('Jane');
    await page.getByLabel('Last Name').fill('Test');
    await page.getByLabel('Email').fill(`minimal.${timestamp}@test.com`);
    await page.getByLabel('Password').first().fill('SecurePass456!');

    // Try to submit without company name, business type, or EIN
    await page.getByRole('button', { name: /Join Apex Today/i }).click();

    // Wait a moment for validation
    await page.waitForTimeout(1000);

    // Should still be on signup page (validation should prevent submission)
    await expect(page).toHaveURL(/\/signup/);

    console.log('✅ Form validation prevented submission of incomplete business data');
  });

  test('should show business-specific fields only when business is selected', async ({ page }) => {
    await page.goto(`/signup?ref=${testData.sponsor_slug}`);
    await page.waitForLoadState('networkidle');

    // Initially select Personal - business fields should not be visible
    await page.getByRole('radio', { name: /personal/i }).check();

    // Business fields should not be visible
    await expect(page.getByLabel('Business Type')).not.toBeVisible();
    await expect(page.getByLabel('DBA Name')).not.toBeVisible();
    await expect(page.getByLabel('Business Website')).not.toBeVisible();
    await expect(page.getByLabel('Employer Identification Number (EIN)')).not.toBeVisible();

    // SSN should be visible for personal
    await expect(page.getByLabel('Social Security Number')).toBeVisible();
    console.log('✅ Personal registration shows SSN, hides business fields');

    // Switch to Business - business fields should become visible
    await page.getByRole('radio', { name: /business/i }).check();

    // Business fields should be visible
    await expect(page.getByLabel('Business Type')).toBeVisible();
    await expect(page.getByLabel('DBA Name')).toBeVisible();
    await expect(page.getByLabel('Business Website')).toBeVisible();
    await expect(page.getByLabel('Employer Identification Number (EIN)')).toBeVisible();

    // SSN should not be visible for business
    await expect(page.getByLabel('Social Security Number')).not.toBeVisible();
    console.log('✅ Business registration shows EIN and business fields, hides SSN');
  });

  test('should format EIN input correctly', async ({ page }) => {
    await page.goto(`/signup?ref=${testData.sponsor_slug}`);
    await page.waitForLoadState('networkidle');

    // Select business registration
    await page.getByRole('radio', { name: /business/i }).check();

    // Enter EIN without formatting
    const einField = page.getByLabel('Employer Identification Number (EIN)');
    await einField.fill('123456789');

    // Check that it gets formatted to XX-XXXXXXX
    await page.waitForTimeout(500);
    const einValue = await einField.inputValue();

    console.log('EIN input value:', einValue);
    expect(einValue).toMatch(/^\d{2}-\d{7}$/);
    console.log('✅ EIN formatted correctly');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto(`/signup?ref=${testData.sponsor_slug}`);
    await page.waitForLoadState('networkidle');

    // Intercept API request and force an error
    await page.route('**/api/signup', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Test error',
          message: 'This is a simulated error for testing',
        }),
      });
    });

    // Fill out form with valid data
    await page.getByRole('radio', { name: /business/i }).check();
    await page.getByLabel('First Name').fill('Error');
    await page.getByLabel('Last Name').fill('Test');
    await page.getByLabel('Email').fill(`error.${timestamp}@test.com`);
    await page.getByLabel('Password').first().fill('SecurePass456!');
    await page.getByLabel('Username').fill(`error-test-${timestamp}`);
    await page.getByLabel(/Company Legal Name/i).fill('Error Test LLC');
    await page.getByLabel('Business Type').selectOption('llc');
    await page.getByLabel('Phone').fill('8005551234');
    await page.getByLabel('Street Address').fill('123 Test St');
    await page.getByLabel('City').fill('Austin');
    await page.getByLabel('State').selectOption('TX');
    await page.getByLabel('ZIP Code').fill('78701');
    await page.getByLabel('Employer Identification Number (EIN)').fill('12-3456789');
    await page.getByRole('radio', { name: /Yes, I am licensed/i }).check();

    // Submit
    await page.getByRole('button', { name: /Join Apex Today/i }).click();

    // Wait for error message to appear
    await page.waitForTimeout(1000);

    // Should show error message on page
    const errorMessage = page.getByText(/This is a simulated error for testing/i);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    console.log('✅ Error message displayed correctly');
  });
});
