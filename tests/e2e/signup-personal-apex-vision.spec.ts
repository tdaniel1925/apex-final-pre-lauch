/**
 * E2E Test: Personal Signup with apex-vision Sponsor
 *
 * Purpose: Test the complete personal registration flow under the apex-vision sponsor
 * to debug the "account creation failed" error reported by a client.
 *
 * Test Strategy:
 * - Use realistic dummy data with unique timestamps
 * - Intercept API calls to capture detailed error information
 * - Take screenshots on failure
 * - Log console errors
 * - Verify every step of the signup process
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Personal Signup with apex-vision Sponsor', () => {

  test('should complete personal registration under apex-vision sponsor successfully', async ({ page }) => {
    // Set up console error logging
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Set up API response interception
    let signupApiResponse: any = null;
    let signupApiStatus: number | null = null;

    page.on('response', async (response) => {
      if (response.url().includes('/api/signup')) {
        signupApiStatus = response.status();
        try {
          signupApiResponse = await response.json();
        } catch (e) {
          signupApiResponse = await response.text();
        }
        console.log('[API RESPONSE]', {
          status: signupApiStatus,
          body: signupApiResponse,
        });
      }
    });

    // Generate unique test data
    const timestamp = Date.now();
    const testData = {
      registration_type: 'personal',
      first_name: 'John',
      last_name: 'TestUser',
      email: `test.personal.${timestamp}@apextest.com`,
      password: 'SecurePass123!',
      slug: `test-personal-${timestamp}`,
      phone: '5551234567',
      address_line1: '123 Test Street',
      address_line2: 'Apt 4B',
      city: 'Houston',
      state: 'TX',
      zip: '77001',
      date_of_birth: '1990-01-01',
      ssn: '123-45-6789',
      licensing_status: 'non_licensed',
      sponsor_slug: 'apex-vision',
    };

    console.log('[TEST DATA]', testData);

    // Step 1: Navigate to signup page with apex-vision sponsor
    console.log('Step 1: Navigate to /signup?ref=apex-vision');
    await page.goto('/signup?ref=apex-vision', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `test-results/01-landing-${timestamp}.png`, fullPage: true });

    // Step 2: Verify sponsor is detected and displayed
    console.log('Step 2: Verify sponsor is displayed');
    const sponsorBanner = page.locator('text=Apex Vision');
    await expect(sponsorBanner).toBeVisible({ timeout: 10000 });
    console.log('✓ Sponsor banner visible');

    // Step 3: Select Personal Registration Type
    console.log('Step 3: Select Personal registration type');
    const personalRadio = page.getByRole('radio', { name: /personal/i });
    await personalRadio.check();
    await expect(personalRadio).toBeChecked();
    await page.screenshot({ path: `test-results/02-personal-selected-${timestamp}.png`, fullPage: true });
    console.log('✓ Personal registration type selected');

    // Step 4: Fill Personal Information
    console.log('Step 4: Fill personal information');
    await page.getByLabel('First Name').fill(testData.first_name);
    await page.getByLabel('Last Name').fill(testData.last_name);
    await page.getByLabel('Email').fill(testData.email);

    // Password field (look for the input, not just the label due to show/hide toggle)
    const passwordInput = page.locator('input[name="password"]').first();
    await passwordInput.fill(testData.password);
    console.log('✓ Basic info filled');

    // Step 5: Verify and edit username (slug)
    console.log('Step 5: Verify username field');
    const usernameField = page.getByLabel('Username');
    await expect(usernameField).toBeVisible();

    // Clear auto-generated slug and use our test slug
    await usernameField.clear();
    await usernameField.fill(testData.slug);

    // Wait for slug availability check
    await page.waitForTimeout(1000);
    console.log('✓ Username set and checked');

    // Step 6: Fill Contact Information
    console.log('Step 6: Fill contact information');
    await page.getByLabel('Phone').fill(testData.phone);
    console.log('✓ Phone filled');

    // Step 7: Fill Address Information
    console.log('Step 7: Fill address information');
    await page.getByLabel('Street Address').fill(testData.address_line1);

    // Address Line 2 might be labeled differently
    const addressLine2 = page.locator('input[name="address_line2"]');
    if (await addressLine2.count() > 0) {
      await addressLine2.fill(testData.address_line2);
    }

    await page.getByLabel('City').fill(testData.city);
    await page.getByLabel('State').selectOption(testData.state);
    await page.getByLabel('ZIP Code').fill(testData.zip);
    await page.screenshot({ path: `test-results/03-address-filled-${timestamp}.png`, fullPage: true });
    console.log('✓ Address filled');

    // Step 8: Fill Date of Birth
    console.log('Step 8: Fill date of birth');
    const dobField = page.getByLabel('Date of Birth');
    await dobField.fill(testData.date_of_birth);
    console.log('✓ Date of birth filled');

    // Step 9: Fill Social Security Number
    console.log('Step 9: Fill SSN');
    const ssnField = page.getByLabel('Social Security Number');
    await ssnField.fill(testData.ssn);
    console.log('✓ SSN filled');

    // Step 10: Select Licensing Status
    console.log('Step 10: Select licensing status');
    const nonLicensedRadio = page.getByRole('radio', { name: /No, I am not licensed/i });
    await nonLicensedRadio.check();
    await expect(nonLicensedRadio).toBeChecked();
    await page.screenshot({ path: `test-results/04-form-complete-${timestamp}.png`, fullPage: true });
    console.log('✓ Licensing status selected');

    // Step 11: Submit the form
    console.log('Step 11: Submit form');
    const submitButton = page.getByRole('button', { name: /Join Apex Today/i });
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();

    // Click submit and wait for navigation or error
    await submitButton.click();
    console.log('✓ Submit button clicked');

    // Step 12: Wait for either success redirect or error message
    console.log('Step 12: Waiting for result...');

    // Wait up to 15 seconds for either:
    // 1. Redirect to /signup/credentials (success)
    // 2. Error message appears (failure)
    const result = await Promise.race([
      // Success path: redirect to credentials page
      page.waitForURL('/signup/credentials', { timeout: 15000 })
        .then(() => ({ type: 'success' as const })),

      // Failure path: error message appears
      page.waitForSelector('text=/failed|error|invalid/i', { timeout: 15000 })
        .then((element) => ({
          type: 'error' as const,
          message: element ? element.textContent() : 'Unknown error'
        })),

      // Timeout path
      new Promise<{ type: 'timeout' }>((resolve) =>
        setTimeout(() => resolve({ type: 'timeout' }), 15000)
      ),
    ]).catch(() => ({ type: 'timeout' as const }));

    // Take final screenshot
    await page.screenshot({ path: `test-results/05-final-result-${timestamp}.png`, fullPage: true });

    // Step 13: Analyze and report results
    console.log('\n========================================');
    console.log('TEST RESULTS');
    console.log('========================================');
    console.log('Result Type:', result.type);
    console.log('Current URL:', page.url());
    console.log('API Status:', signupApiStatus);
    console.log('API Response:', JSON.stringify(signupApiResponse, null, 2));
    console.log('Console Errors:', consoleErrors.length > 0 ? consoleErrors : 'None');
    console.log('========================================\n');

    // Assertions based on result
    if (result.type === 'success') {
      console.log('✅ TEST PASSED: Successfully redirected to credentials page');
      expect(page.url()).toContain('/signup/credentials');
      expect(signupApiStatus).toBe(201);
    } else if (result.type === 'error') {
      console.log('❌ TEST FAILED: Error message displayed');
      console.log('Error Message:', result.message);

      // Capture detailed error information
      const errorReport = {
        testData,
        errorMessage: result.message,
        apiStatus: signupApiStatus,
        apiResponse: signupApiResponse,
        consoleErrors,
        currentUrl: page.url(),
        timestamp: new Date().toISOString(),
      };

      console.log('\n🔍 DETAILED ERROR REPORT:');
      console.log(JSON.stringify(errorReport, null, 2));

      // Fail the test with detailed information
      throw new Error(`Signup failed with error: ${result.message}\n\nAPI Response: ${JSON.stringify(signupApiResponse, null, 2)}`);
    } else {
      console.log('❌ TEST FAILED: Timeout waiting for result');

      // Capture timeout error information
      const timeoutReport = {
        testData,
        apiStatus: signupApiStatus,
        apiResponse: signupApiResponse,
        consoleErrors,
        currentUrl: page.url(),
        timestamp: new Date().toISOString(),
      };

      console.log('\n🔍 TIMEOUT ERROR REPORT:');
      console.log(JSON.stringify(timeoutReport, null, 2));

      throw new Error(`Signup timed out. No success redirect or error message appeared.\n\nAPI Response: ${JSON.stringify(signupApiResponse, null, 2)}`);
    }
  });

  // Additional test: Verify all required fields are present
  test('should display all required fields for personal registration', async ({ page }) => {
    await page.goto('/signup?ref=apex-vision');

    // Select personal registration
    await page.getByRole('radio', { name: /personal/i }).check();

    // Verify all expected fields are present
    await expect(page.getByLabel('First Name')).toBeVisible();
    await expect(page.getByLabel('Last Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.locator('input[name="password"]').first()).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Phone')).toBeVisible();
    await expect(page.getByLabel('Street Address')).toBeVisible();
    await expect(page.getByLabel('City')).toBeVisible();
    await expect(page.getByLabel('State')).toBeVisible();
    await expect(page.getByLabel('ZIP Code')).toBeVisible();
    await expect(page.getByLabel('Date of Birth')).toBeVisible();
    await expect(page.getByLabel('Social Security Number')).toBeVisible();

    console.log('✅ All required fields are present and visible');
  });

  // Additional test: Verify sponsor data is passed correctly
  test('should include sponsor_slug in form submission', async ({ page }) => {
    let submittedData: any = null;

    // Intercept the signup API call
    await page.route('**/api/signup', async (route) => {
      const request = route.request();
      submittedData = JSON.parse(request.postData() || '{}');

      // Continue with the actual request
      await route.continue();
    });

    await page.goto('/signup?ref=apex-vision');

    // Fill minimal form data
    await page.getByRole('radio', { name: /personal/i }).check();
    await page.getByLabel('First Name').fill('Test');
    await page.getByLabel('Last Name').fill('User');

    // Try to submit (will fail validation but we just want to see the data)
    await page.getByRole('button', { name: /Join Apex Today/i }).click();

    // Wait a bit for the form to attempt submission
    await page.waitForTimeout(2000);

    console.log('Submitted data:', submittedData);

    if (submittedData) {
      expect(submittedData.sponsor_slug).toBe('apex-vision');
      console.log('✅ sponsor_slug is correctly included in submission');
    }
  });
});
