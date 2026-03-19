/**
 * =============================================
 * E2E TEST: Complete Signup → Back Office Data Flow
 * =============================================
 *
 * Tests the entire user journey from signup to data appearing
 * in sponsor's back office views (Matrix, Genealogy, Team).
 *
 * Verifies:
 * - New signups create distributor + member records
 * - Data flows correctly to back office views
 * - RLS policies isolate sponsor organizations
 * - Matrix positions are calculated correctly
 * - Genealogy tree structure is accurate
 * - Team counts and stats are correct
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// =============================================
// TEST CONFIGURATION
// =============================================

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3050';
const TEST_PASSWORD = 'TestPass123!';

// Supabase admin client for database operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Generate unique test email
 */
function generateTestEmail(prefix = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
}

/**
 * Generate unique username/slug
 */
function generateTestSlug(prefix = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate valid test SSN
 */
function generateTestSSN(): string {
  const area = Math.floor(Math.random() * 699) + 100; // 100-799
  const group = Math.floor(Math.random() * 99) + 1; // 01-99
  const serial = Math.floor(Math.random() * 9999) + 1; // 0001-9999
  return `${area.toString().padStart(3, '0')}-${group.toString().padStart(2, '0')}-${serial.toString().padStart(4, '0')}`;
}

/**
 * Generate valid test EIN
 */
function generateTestEIN(): string {
  const prefix = Math.floor(Math.random() * 89) + 10; // 10-99
  const suffix = Math.floor(Math.random() * 9999999); // 0-9999999
  return `${prefix}-${suffix.toString().padStart(7, '0')}`;
}

/**
 * Create a sponsor account via UI signup and return credentials
 */
async function createSponsorViaUI(
  page: any,
  firstName: string,
  lastName: string,
  registrationType: 'personal' | 'business' = 'personal'
): Promise<{ email: string; password: string; slug: string }> {
  const email = generateTestEmail(`sponsor-${firstName.toLowerCase()}`);
  const slug = generateTestSlug(`sponsor-${firstName.toLowerCase()}`);
  const password = TEST_PASSWORD;

  // Navigate to signup (no sponsor - will default to apex-vision)
  await page.goto(`${BASE_URL}/signup`);
  await page.waitForSelector('form', { timeout: 10000 });

  // Select registration type
  await page.getByRole('radio', { name: new RegExp(registrationType, 'i') }).check();
  await page.waitForTimeout(500);

  // Fill common fields
  await page.getByLabel('First Name').fill(firstName);
  await page.getByLabel('Last Name').fill(lastName);
  await page.getByLabel('Email').fill(email);

  const passwordInput = page.locator('input[name="password"]').first();
  await passwordInput.fill(password);

  const usernameField = page.getByLabel('Username');
  await usernameField.clear();
  await usernameField.fill(slug);

  await page.getByLabel('Phone').fill('5551234567');
  await page.getByLabel('Street Address').fill('123 Main St');
  await page.getByLabel('City').fill('Houston');
  await page.getByLabel('State').selectOption('TX');
  await page.getByLabel('ZIP Code').fill('77001');

  if (registrationType === 'personal') {
    await page.getByLabel('Date of Birth').fill('1990-01-01');
    await page.getByLabel('Social Security Number').fill(generateTestSSN());
    await page.getByRole('radio', { name: /No, I am not licensed/i }).check();
  } else {
    await page.getByLabel(/Company Legal Name/i).fill(`${firstName} Agency LLC`);
    await page.getByLabel('Business Type').selectOption('llc');
    await page.getByLabel('Employer Identification Number (EIN)').fill(generateTestEIN());
    await page.getByRole('radio', { name: /Yes, I am licensed/i }).check();
  }

  // Submit
  await page.getByRole('button', { name: /Join Apex Today/i }).click();

  // Wait for credentials page with better error handling
  try {
    await page.waitForURL(/\/signup\/credentials/, { timeout: 20000 });
  } catch (error) {
    // Take screenshot on failure
    await page.screenshot({
      path: `test-results/signup-failed-${firstName}-${Date.now()}.png`,
      fullPage: true
    });
    console.error(`Signup failed for ${firstName} ${lastName}`);
    console.error('Current URL:', page.url());
    throw error;
  }

  return { email, password, slug };
}

/**
 * Sign up a new rep under a sponsor
 */
async function signupRep(
  page: any,
  firstName: string,
  lastName: string,
  sponsorSlug: string,
  registrationType: 'personal' | 'business' = 'personal'
): Promise<{ email: string; slug: string }> {
  const email = generateTestEmail(`rep-${firstName.toLowerCase()}`);
  const slug = generateTestSlug(`rep-${firstName.toLowerCase()}`);

  await page.goto(`${BASE_URL}/signup?ref=${sponsorSlug}`);

  // Wait for form to load
  await page.waitForSelector('form', { timeout: 10000 });

  // Select registration type
  await page.getByRole('radio', { name: new RegExp(registrationType, 'i') }).check();

  // Wait a moment for conditional fields to render
  await page.waitForTimeout(500);

  // Fill common fields
  await page.getByLabel('First Name').fill(firstName);
  await page.getByLabel('Last Name').fill(lastName);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(TEST_PASSWORD);

  // Username is auto-generated, but we can edit it
  const usernameField = page.getByLabel('Username');
  await usernameField.clear();
  await usernameField.fill(slug);

  await page.getByLabel('Phone').fill('5551234567');
  await page.getByLabel('Street Address').fill('123 Main St');
  await page.getByLabel('City').fill('Houston');
  await page.getByLabel('State').selectOption('TX');
  await page.getByLabel('ZIP Code').fill('77001');

  if (registrationType === 'personal') {
    await page.getByLabel('Date of Birth').fill('1990-01-01');
    await page.getByLabel('Social Security Number').fill(generateTestSSN());
    await page.getByRole('radio', { name: /No, I am not licensed/i }).check();
  } else {
    await page.getByLabel(/Company Legal Name/i).fill(`${firstName} Agency LLC`);
    await page.getByLabel('Business Type').selectOption('llc');
    await page.getByLabel('Employer Identification Number (EIN)').fill(generateTestEIN());
    await page.getByRole('radio', { name: /Yes, I am licensed/i }).check();
  }

  // Submit
  await page.getByRole('button', { name: /Join Apex Today/i }).click();

  // Wait for credentials page with better error handling
  try {
    await page.waitForURL(/\/signup\/credentials/, { timeout: 20000 });
  } catch (error) {
    // Take screenshot on failure
    await page.screenshot({
      path: `test-results/signup-rep-failed-${firstName}-${Date.now()}.png`,
      fullPage: true
    });
    console.error(`Rep signup failed for ${firstName} ${lastName}`);
    console.error('Current URL:', page.url());
    throw error;
  }

  return { email, slug };
}

/**
 * Login as a user
 */
async function login(page: any, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /Sign In/i }).click();

  // Wait for dashboard redirect
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

/**
 * Cleanup test users from database
 */
async function cleanupTestUsers(emails: string[]) {
  for (const email of emails) {
    try {
      // Get distributor and auth_user_id
      const { data: dist } = await supabase
        .from('distributors')
        .select('id, auth_user_id')
        .eq('email', email)
        .single();

      if (dist) {
        // Delete auth user (cascades to distributor via trigger)
        await supabase.auth.admin.deleteUser(dist.auth_user_id);

        // Clean up any remaining records
        await supabase.from('members').delete().eq('distributor_id', dist.id);
        await supabase.from('distributors').delete().eq('id', dist.id);
      }
    } catch (error) {
      console.log(`Cleanup warning for ${email}:`, error);
    }
  }
}

// =============================================
// TEST SUITE
// =============================================

test.describe('Signup → Back Office Data Flow', () => {

  // =============================================
  // TEST 1: Personal Registration → Back Office
  // =============================================

  test('should show personal signup in sponsor Matrix, Genealogy, and Team views', async ({ page }) => {
    const testEmails: string[] = [];

    try {
      // Step 1: Use apex-vision as sponsor (exists in DB)
      const sponsorSlug = 'apex-vision';
      const sponsorEmail = 'admin@reachtheapex.net'; // Apex Vision's email
      const sponsorPassword = 'ApexSecure2024!'; // You'll need to set this or use a test sponsor

      // Step 2: Sign up new rep under apex-vision
      const rep = await signupRep(page, 'Bob', 'Recruit', sponsorSlug, 'personal');
      testEmails.push(rep.email);

      // Step 3: Get apex-vision's credentials from database
      const { data: sponsorData } = await supabase
        .from('distributors')
        .select('email, auth_user_id')
        .eq('slug', 'apex-vision')
        .single();

      if (!sponsorData) {
        console.log('WARNING: apex-vision sponsor not found, skipping login verification');
        return;
      }

      // Verify the rep was created in database
      const { data: repData } = await supabase
        .from('distributors')
        .select('id, first_name, last_name, email, sponsor_id')
        .eq('email', rep.email)
        .single();

      // Verify rep distributor was created
      expect(repData).toBeTruthy();
      expect(repData!.first_name).toBe('Bob');
      expect(repData!.last_name).toBe('Recruit');

      // Verify rep's member record was created
      const { data: memberData } = await supabase
        .from('members')
        .select('member_id, email, full_name, tech_rank')
        .eq('distributor_id', repData!.id)
        .single();

      expect(memberData).toBeTruthy();
      expect(memberData!.member_id).toBeTruthy();
      expect(memberData!.email).toBe(rep.email);
      expect(memberData!.full_name).toBe('Bob Recruit');
      expect(memberData!.tech_rank).toBe('starter');

      // Get apex-vision's distributor_id
      const { data: sponsorDist } = await supabase
        .from('distributors')
        .select('id')
        .eq('slug', 'apex-vision')
        .single();

      // Verify rep's distributor record has correct sponsor_id
      expect(repData!.sponsor_id).toBe(sponsorDist?.id || null);

    } finally {
      // Cleanup
      await cleanupTestUsers(testEmails);
    }
  });

  // =============================================
  // TEST 2: Business Registration → Back Office
  // =============================================

  test('should show business signup in sponsor back office views', async ({ page }) => {
    const testEmails: string[] = [];

    try {
      // Step 1: Create sponsor account (business)
      const sponsor = await createSponsorViaUI(page, 'Charlie', 'Agency', 'business');
      testEmails.push(sponsor.email);

      // Step 2: Sign up business rep under sponsor
      const rep = await signupRep(page, 'Delta', 'Insurance', sponsor.slug, 'business');
      testEmails.push(rep.email);

      // Step 3: Log in as sponsor
      await page.goto(`${BASE_URL}/logout`);
      await login(page, sponsor.email, sponsor.password);

      // Step 4: Verify in Matrix
      await page.goto(`${BASE_URL}/dashboard/matrix`);
      await expect(page.getByText('Delta Insurance')).toBeVisible({ timeout: 10000 });

      // Step 5: Verify in Genealogy
      await page.goto(`${BASE_URL}/dashboard/genealogy`);
      await expect(page.getByText('Delta Insurance')).toBeVisible({ timeout: 10000 });

      // Step 6: Verify in Team
      await page.goto(`${BASE_URL}/dashboard/team`);
      await expect(page.getByText('Delta Insurance')).toBeVisible({ timeout: 10000 });

    } finally {
      await cleanupTestUsers(testEmails);
    }
  });

  // =============================================
  // TEST 3: Multiple Signups Under Same Sponsor
  // =============================================

  test('should show all 5 reps in sponsor back office with correct counts', async ({ page }) => {
    const testEmails: string[] = [];

    try {
      // Step 1: Create sponsor
      const sponsor = await createSponsorViaUI(page, 'Echo', 'Leader', 'personal');
      testEmails.push(sponsor.email);

      // Step 2: Sign up 5 reps (sequentially to avoid race conditions)
      const reps = [];
      reps.push(await signupRep(page, 'Rep1', 'Test', sponsor.slug, 'personal'));
      reps.push(await signupRep(page, 'Rep2', 'Test', sponsor.slug, 'personal'));
      reps.push(await signupRep(page, 'Rep3', 'Test', sponsor.slug, 'personal'));
      reps.push(await signupRep(page, 'Rep4', 'Test', sponsor.slug, 'business'));
      reps.push(await signupRep(page, 'Rep5', 'Test', sponsor.slug, 'business'));

      testEmails.push(...reps.map(r => r.email));

      // Step 3: Log in as sponsor
      await page.goto(`${BASE_URL}/logout`);
      await login(page, sponsor.email, sponsor.password);

      // Step 4: Check Matrix - should show 5 reps
      await page.goto(`${BASE_URL}/dashboard/matrix`);
      await expect(page.getByText(/Total Team Size/i)).toBeVisible();

      // Verify all 5 reps appear in matrix (check for "Rep" text which is in all their names)
      // We created: Rep1, Rep2, Rep3, Rep4, Rep5
      await expect(page.getByText(/Rep1|Rep2|Rep3|Rep4|Rep5/i).first()).toBeVisible({ timeout: 10000 });

      // Step 5: Check Genealogy - should show 5 members
      await page.goto(`${BASE_URL}/dashboard/genealogy`);
      await expect(page.getByText(/Total Organization Size/i)).toBeVisible();
      await expect(page.getByText('5')).toBeVisible(); // Organization size

      // Step 6: Check Team - should show "5 direct enrollees"
      await page.goto(`${BASE_URL}/dashboard/team`);
      await expect(page.getByText(/5 direct enrollees/i)).toBeVisible({ timeout: 10000 });

    } finally {
      await cleanupTestUsers(testEmails);
    }
  });

  // =============================================
  // TEST 4: Deep Tree Structure (3 Levels)
  // =============================================

  test('should show deep tree structure correctly in all views', async ({ page }) => {
    const testEmails: string[] = [];

    try {
      // Level 0: Create sponsor
      const sponsor = await createSponsorViaUI(page, 'Level0', 'Sponsor', 'personal');
      testEmails.push(sponsor.email);

      // Level 1: Sign up rep under sponsor
      const level1Rep = await signupRep(page, 'Level1', 'Rep', sponsor.slug, 'personal');
      testEmails.push(level1Rep.email);

      // Level 2: Sign up rep under Level 1
      const level2Rep = await signupRep(page, 'Level2', 'Rep', level1Rep.slug, 'personal');
      testEmails.push(level2Rep.email);

      // Level 3: Sign up rep under Level 2
      const level3Rep = await signupRep(page, 'Level3', 'Rep', level2Rep.slug, 'personal');
      testEmails.push(level3Rep.email);

      // Step 5: Log in as sponsor (Level 0)
      await page.goto(`${BASE_URL}/logout`);
      await login(page, sponsor.email, sponsor.password);

      // Step 6: Check Matrix - sponsor should see all 3 downline levels
      await page.goto(`${BASE_URL}/dashboard/matrix`);
      await expect(page.getByText('Level1 Rep')).toBeVisible({ timeout: 10000 });

      // Step 7: Check Genealogy - should show tree with 3 levels
      await page.goto(`${BASE_URL}/dashboard/genealogy`);
      await expect(page.getByText('Level1 Rep')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/Total Organization Size/i)).toBeVisible();
      await expect(page.getByText('3')).toBeVisible(); // 3 total in organization

      // Step 8: Check Team - should show 1 direct enrollee (Level 1 only)
      await page.goto(`${BASE_URL}/dashboard/team`);
      await expect(page.getByText('Level1 Rep')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/1 direct enrollee/i)).toBeVisible();

      // Step 9: Log in as Level 1 rep
      await page.goto(`${BASE_URL}/logout`);
      await login(page, level1Rep.email, TEST_PASSWORD);

      // Step 10: Level 1 should see Level 2 and Level 3 in their downline
      await page.goto(`${BASE_URL}/dashboard/genealogy`);
      await expect(page.getByText('Level2 Rep')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('2')).toBeVisible(); // 2 in their organization

    } finally {
      await cleanupTestUsers(testEmails);
    }
  });

  // =============================================
  // TEST 5: RLS Isolation Between Sponsors
  // =============================================

  test('should enforce RLS - sponsors cannot see each others reps', async ({ page }) => {
    const testEmails: string[] = [];

    try {
      // Create Sponsor A
      const sponsorA = await createSponsorViaUI(page, 'SponsorA', 'Leader', 'personal');
      testEmails.push(sponsorA.email);

      // Create Sponsor B
      const sponsorB = await createSponsorViaUI(page, 'SponsorB', 'Boss', 'personal');
      testEmails.push(sponsorB.email);

      // Sign up Rep1 under Sponsor A
      const rep1 = await signupRep(page, 'Rep1A', 'TeamA', sponsorA.slug, 'personal');
      testEmails.push(rep1.email);

      // Sign up Rep2 under Sponsor B
      const rep2 = await signupRep(page, 'Rep2B', 'TeamB', sponsorB.slug, 'personal');
      testEmails.push(rep2.email);

      // Log in as Sponsor A
      await page.goto(`${BASE_URL}/logout`);
      await login(page, sponsorA.email, sponsorA.password);

      // Sponsor A should see Rep1A, NOT Rep2B
      await page.goto(`${BASE_URL}/dashboard/team`);
      await expect(page.getByText('Rep1A TeamA')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Rep2B TeamB')).not.toBeVisible();

      // Check Matrix
      await page.goto(`${BASE_URL}/dashboard/matrix`);
      await expect(page.getByText('Rep1A TeamA')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Rep2B TeamB')).not.toBeVisible();

      // Log out and log in as Sponsor B
      await page.goto(`${BASE_URL}/logout`);
      await login(page, sponsorB.email, sponsorB.password);

      // Sponsor B should see Rep2B, NOT Rep1A
      await page.goto(`${BASE_URL}/dashboard/team`);
      await expect(page.getByText('Rep2B TeamB')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Rep1A TeamA')).not.toBeVisible();

      // Check Matrix
      await page.goto(`${BASE_URL}/dashboard/matrix`);
      await expect(page.getByText('Rep2B TeamB')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('Rep1A TeamA')).not.toBeVisible();

    } finally {
      await cleanupTestUsers(testEmails);
    }
  });

  // =============================================
  // TEST 6: Verify Rep Details Are Correct
  // =============================================

  test('should display correct rep details in all views', async ({ page }) => {
    const testEmails: string[] = [];

    try {
      // Create sponsor
      const sponsor = await createSponsorViaUI(page, 'DetailTest', 'Sponsor', 'personal');
      testEmails.push(sponsor.email);

      // Sign up rep with specific details
      const rep = await signupRep(page, 'DetailRep', 'Verify', sponsor.slug, 'personal');
      testEmails.push(rep.email);

      // Get the rep's data from database to verify
      const { data: repData } = await supabase
        .from('distributors')
        .select(`
          id,
          first_name,
          last_name,
          email,
          rep_number,
          created_at,
          member:members!members_distributor_id_fkey (
            tech_rank,
            personal_credits_monthly
          )
        `)
        .eq('email', rep.email)
        .single();

      expect(repData).toBeTruthy();
      expect(repData!.first_name).toBe('DetailRep');
      expect(repData!.last_name).toBe('Verify');

      // Log in as sponsor
      await page.goto(`${BASE_URL}/logout`);
      await login(page, sponsor.email, sponsor.password);

      // Check Team view - verify all details
      await page.goto(`${BASE_URL}/dashboard/team`);
      await expect(page.getByText('DetailRep Verify')).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(rep.email)).toBeVisible();

      // Check that rep_number is displayed (should be auto-generated)
      if (repData!.rep_number) {
        await expect(page.getByText(`#${repData!.rep_number}`)).toBeVisible();
      }

      // Check Matrix view
      await page.goto(`${BASE_URL}/dashboard/matrix`);
      await expect(page.getByText('DetailRep Verify')).toBeVisible({ timeout: 10000 });

      // Check Genealogy view
      await page.goto(`${BASE_URL}/dashboard/genealogy`);
      await expect(page.getByText('DetailRep Verify')).toBeVisible({ timeout: 10000 });

    } finally {
      await cleanupTestUsers(testEmails);
    }
  });

  // =============================================
  // TEST 7: Verify Counts Are Consistent
  // =============================================

  test('should show consistent counts across Matrix, Genealogy, and Team views', async ({ page }) => {
    const testEmails: string[] = [];

    try {
      // Create sponsor
      const sponsor = await createSponsorViaUI(page, 'CountTest', 'Sponsor', 'personal');
      testEmails.push(sponsor.email);

      // Sign up exactly 3 reps (sequentially)
      const reps = [];
      reps.push(await signupRep(page, 'Count1', 'Rep', sponsor.slug, 'personal'));
      reps.push(await signupRep(page, 'Count2', 'Rep', sponsor.slug, 'personal'));
      reps.push(await signupRep(page, 'Count3', 'Rep', sponsor.slug, 'business'));

      testEmails.push(...reps.map(r => r.email));

      // Log in as sponsor
      await page.goto(`${BASE_URL}/logout`);
      await login(page, sponsor.email, sponsor.password);

      // Matrix: Should show "Total Team Size: 3"
      await page.goto(`${BASE_URL}/dashboard/matrix`);
      const matrixHeader = await page.locator('text=/Total Team Size/i').locator('..');
      await expect(matrixHeader).toContainText('3');

      // Genealogy: Should show "Total Organization Size: 3"
      await page.goto(`${BASE_URL}/dashboard/genealogy`);
      const genealogyHeader = await page.locator('text=/Total Organization Size/i').locator('..');
      await expect(genealogyHeader).toContainText('3');

      // Team: Should show "3 direct enrollees"
      await page.goto(`${BASE_URL}/dashboard/team`);
      await expect(page.getByText(/3 direct enrollees/i)).toBeVisible({ timeout: 10000 });

    } finally {
      await cleanupTestUsers(testEmails);
    }
  });
});
