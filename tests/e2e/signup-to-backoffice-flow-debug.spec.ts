/**
 * =============================================
 * DEBUG TEST: Signup → Back Office Data Flow
 * =============================================
 *
 * Simplified test with extensive logging to debug signup issues
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3050';
const TEST_PASSWORD = 'TestPass123!';

// Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateTestEmail(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

function generateTestSlug(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

function generateTestSSN(): string {
  const area = Math.floor(Math.random() * 699) + 100;
  const group = Math.floor(Math.random() * 99) + 1;
  const serial = Math.floor(Math.random() * 9999) + 1;
  return `${area.toString().padStart(3, '0')}-${group.toString().padStart(2, '0')}-${serial.toString().padStart(4, '0')}`;
}

test.describe('Signup to Back Office - Debug Tests', () => {

  test('should create signup and verify data flow step by step', async ({ page }) => {
    const testEmail = generateTestEmail();
    const testSlug = generateTestSlug();
    const consoleMessages: string[] = [];
    const apiResponses: any[] = [];

    // Capture console messages
    page.on('console', (msg) => {
      const text = `[${msg.type()}] ${msg.text()}`;
      consoleMessages.push(text);
      console.log(text);
    });

    // Capture API responses
    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        try {
          const body = await response.text();
          const log = {
            url: response.url(),
            status: response.status(),
            body: body.length < 1000 ? body : `${body.substring(0, 1000)}...`
          };
          apiResponses.push(log);
          console.log('[API Response]', log);
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });

    try {
      console.log('\n=== STEP 1: Navigate to signup page ===');
      await page.goto(`${BASE_URL}/signup?ref=apex-vision`);
      await page.waitForSelector('form', { timeout: 10000 });
      console.log('✓ Signup form loaded');

      console.log('\n=== STEP 2: Fill personal registration form ===');

      // Select personal type
      const personalRadio = page.getByRole('radio', { name: /personal/i });
      await personalRadio.check();
      await page.waitForTimeout(500); // Wait for conditional fields
      console.log('✓ Selected personal registration');

      // Fill form fields
      await page.getByLabel('First Name').fill('TestUser');
      console.log('✓ Filled first name');

      await page.getByLabel('Last Name').fill('Debug');
      console.log('✓ Filled last name');

      await page.getByLabel('Email').fill(testEmail);
      console.log('✓ Filled email:', testEmail);

      const passwordInput = page.locator('input[name="password"]').first();
      await passwordInput.fill(TEST_PASSWORD);
      console.log('✓ Filled password');

      const usernameField = page.getByLabel('Username');
      await usernameField.clear();
      await usernameField.fill(testSlug);
      console.log('✓ Filled username:', testSlug);

      await page.getByLabel('Phone').fill('5551234567');
      await page.getByLabel('Street Address').fill('123 Test St');
      await page.getByLabel('City').fill('Houston');
      await page.getByLabel('State').selectOption('TX');
      await page.getByLabel('ZIP Code').fill('77001');
      console.log('✓ Filled address fields');

      await page.getByLabel('Date of Birth').fill('1990-01-01');
      console.log('✓ Filled DOB');

      const testSSN = generateTestSSN();
      await page.getByLabel('Social Security Number').fill(testSSN);
      console.log('✓ Filled SSN:', testSSN);

      await page.getByRole('radio', { name: /No, I am not licensed/i }).check();
      console.log('✓ Selected licensing status');

      // Take screenshot before submit
      await page.screenshot({ path: 'test-results/debug-before-submit.png', fullPage: true });

      console.log('\n=== STEP 3: Submit form ===');
      const submitButton = page.getByRole('button', { name: /Join Apex Today/i });
      await submitButton.click();
      console.log('✓ Clicked submit button');

      // Wait for response or error
      console.log('\n=== STEP 4: Wait for result ===');

      const result = await Promise.race([
        page.waitForURL(/\/signup\/credentials/, { timeout: 20000 })
          .then(() => ({ type: 'success' as const }))
          .catch(() => null),

        page.waitForSelector('text=/failed|error|invalid/i', { timeout: 20000 })
          .then((el) => ({ type: 'error' as const, message: el?.textContent() }))
          .catch(() => null),

        new Promise<{ type: 'timeout' }>((resolve) =>
          setTimeout(() => resolve({ type: 'timeout' }), 20000)
        )
      ]);

      // Take screenshot after submit
      await page.screenshot({ path: 'test-results/debug-after-submit.png', fullPage: true });

      console.log('\n=== RESULT ===');
      console.log('Result type:', result?.type || 'unknown');
      console.log('Current URL:', page.url());

      // Log API responses
      console.log('\n=== API RESPONSES ===');
      apiResponses.forEach((resp, i) => {
        console.log(`\n[${i + 1}]`, resp);
      });

      if (result?.type === 'success') {
        console.log('\n✅ SUCCESS: Redirected to credentials page');

        // Verify database records
        console.log('\n=== STEP 5: Verify database records ===');

        const { data: distributor, error: distError } = await supabase
          .from('distributors')
          .select('*')
          .eq('email', testEmail)
          .single();

        console.log('Distributor query error:', distError);
        console.log('Distributor data:', distributor);

        expect(distributor).toBeTruthy();
        expect(distributor!.first_name).toBe('TestUser');
        expect(distributor!.last_name).toBe('Debug');
        expect(distributor!.slug).toBe(testSlug);

        // Check member record
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('distributor_id', distributor!.id)
          .single();

        console.log('Member query error:', memberError);
        console.log('Member data:', member);

        expect(member).toBeTruthy();
        expect(member!.email).toBe(testEmail);
        expect(member!.full_name).toBe('TestUser Debug');
        expect(member!.tech_rank).toBe('starter');

        // Cleanup
        console.log('\n=== CLEANUP ===');
        await supabase.auth.admin.deleteUser(distributor!.auth_user_id);
        console.log('✓ Cleaned up test user');

      } else if (result?.type === 'error') {
        console.log('\n❌ ERROR: Error message displayed');
        console.log('Error message:', result.message);

        // Check if partial data was created
        const { data: distributor } = await supabase
          .from('distributors')
          .select('*')
          .eq('email', testEmail)
          .single();

        if (distributor) {
          console.log('⚠️  WARNING: Partial data created, cleaning up');
          await supabase.auth.admin.deleteUser(distributor.auth_user_id);
        }

        throw new Error(`Signup failed: ${result.message}`);
      } else {
        console.log('\n⏱️  TIMEOUT: No success or error within 20 seconds');

        // Check database for partial data
        const { data: distributor } = await supabase
          .from('distributors')
          .select('*')
          .eq('email', testEmail)
          .single();

        console.log('Distributor found:', distributor ? 'YES' : 'NO');
        if (distributor) {
          console.log('Distributor ID:', distributor.id);
          await supabase.auth.admin.deleteUser(distributor.auth_user_id);
        }

        throw new Error('Signup timed out - no redirect or error message');
      }

    } catch (error) {
      console.log('\n💥 TEST FAILED');
      console.log('Error:', error);

      // Save console messages to file
      console.log('\n=== CONSOLE MESSAGES ===');
      consoleMessages.forEach(msg => console.log(msg));

      throw error;
    }
  });
});
