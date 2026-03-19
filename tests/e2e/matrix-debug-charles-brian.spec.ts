/**
 * DEBUG TEST: Charles Potter → Brian Rawlston Matrix Visibility
 *
 * Purpose: Diagnose why Brian doesn't appear in Charles's Matrix view
 *
 * Known Facts (from database):
 * - Charles Potter: member_id = ff41307d-2641-45bb-84c7-ee5022a7b869
 * - Brian Rawlston: member_id = 2ca889e6-0015-4100-ae08-043903926ee4
 * - Brian.enroller_id = Charles.member_id ✓ (confirmed in members table)
 * - Charles has 3 direct enrollees: Sella Daniel, Donna Potter, Brian Rawlston
 *
 * This test will:
 * 1. Login as Charles
 * 2. Navigate to Matrix view
 * 3. Take screenshots
 * 4. Intercept API calls
 * 5. Search for Brian
 * 6. Analyze why Brian may not be visible
 */

import { test, expect, Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Test configuration
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3050';

// Supabase client for verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Real credentials
const CHARLES_EMAIL = 'fyifromcharles@gmail.com';
const CHARLES_PASSWORD = process.env.CHARLES_TEST_PASSWORD || 'TestPass123!';

/**
 * Helper: Login as Charles
 */
async function loginAsCharles(page: Page) {
  await page.goto(`${BASE_URL}/auth/login`);
  await page.fill('input[type="email"]', CHARLES_EMAIL);
  await page.fill('input[type="password"]', CHARLES_PASSWORD);
  await page.click('button[type="submit"]');

  // Wait for successful login
  await page.waitForURL(/\/(dashboard|back-office)/, { timeout: 10000 });
}

/**
 * Helper: Save debug info to file
 */
function saveDebugInfo(filename: string, data: any) {
  const debugDir = 'test-results/matrix-debug';
  if (!fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir, { recursive: true });
  }
  fs.writeFileSync(
    `${debugDir}/${filename}`,
    JSON.stringify(data, null, 2)
  );
}

test.describe('Matrix Debug: Charles → Brian', () => {

  test('STEP 1: Verify database relationship', async () => {
    console.log('\n=== STEP 1: Database Verification ===\n');

    // Get Charles from members table
    const { data: charlesMember } = await supabase
      .from('members')
      .select('member_id, full_name, enroller_id, tech_rank')
      .ilike('full_name', '%charles%potter%')
      .single();

    console.log('Charles Member:', charlesMember);

    // Get Brian from members table
    const { data: brianMember } = await supabase
      .from('members')
      .select('member_id, full_name, enroller_id, tech_rank, personal_credits_monthly')
      .ilike('full_name', '%brian%rawlston%')
      .single();

    console.log('Brian Member:', brianMember);

    // Verify relationship
    expect(brianMember?.enroller_id).toBe(charlesMember?.member_id);
    console.log('✓ Brian.enroller_id === Charles.member_id');

    // Get all Charles's enrollees
    const { data: enrollees } = await supabase
      .from('members')
      .select('member_id, full_name, tech_rank')
      .eq('enroller_id', charlesMember?.member_id!);

    console.log(`\nCharles has ${enrollees?.length} direct enrollees:`);
    enrollees?.forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.full_name} (${e.tech_rank})`);
    });

    saveDebugInfo('1-database-relationships.json', {
      charles: charlesMember,
      brian: brianMember,
      enrollees,
    });
  });

  test('STEP 2: Login as Charles and navigate to Matrix', async ({ page }) => {
    console.log('\n=== STEP 2: Login & Navigation ===\n');

    // Track API calls
    const apiCalls: Array<{ url: string; status: number; response?: any }> = [];

    page.on('response', async (response) => {
      if (response.url().includes('/api/')) {
        try {
          const json = await response.json();
          apiCalls.push({
            url: response.url(),
            status: response.status(),
            response: json,
          });
          console.log(`API Call: ${response.status()} ${response.url()}`);
        } catch {
          apiCalls.push({
            url: response.url(),
            status: response.status(),
          });
        }
      }
    });

    // Login
    await loginAsCharles(page);
    console.log('✓ Logged in as Charles');

    // Navigate to Matrix
    await page.goto(`${BASE_URL}/dashboard/matrix`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('✓ Navigated to Matrix view');

    // Take initial screenshot
    await page.screenshot({
      path: 'test-results/matrix-debug/2-matrix-initial-view.png',
      fullPage: true,
    });

    // Save API calls
    saveDebugInfo('2-api-calls.json', apiCalls);
  });

  test('STEP 3: Analyze Matrix page structure', async ({ page }) => {
    console.log('\n=== STEP 3: Page Structure Analysis ===\n');

    await loginAsCharles(page);
    await page.goto(`${BASE_URL}/dashboard/matrix`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get page title
    const title = await page.title();
    console.log('Page title:', title);

    // Look for Matrix heading
    const heading = await page.locator('h1, h2').filter({ hasText: /matrix/i }).first().textContent();
    console.log('Matrix heading:', heading);

    // Get total team size
    const teamSizeElement = page.locator('text=/Total Team Size/i').locator('..').locator('p.text-3xl');
    if (await teamSizeElement.isVisible()) {
      const teamSize = await teamSizeElement.textContent();
      console.log('Total Team Size:', teamSize);
    }

    // Check for level indicators
    const levels = await page.locator('[data-testid*="level"], text=/Level \\d/i').count();
    console.log(`Found ${levels} level indicators`);

    // Look for distributor cards/nodes
    const distributorCards = await page.locator('[data-testid*="matrix-node"], .matrix-node, .distributor-card, [data-member-id]').count();
    console.log(`Found ${distributorCards} distributor cards/nodes`);

    // Get all visible text on the page
    const bodyText = await page.locator('body').textContent();
    const hasBrian = bodyText?.includes('Brian');
    const hasRawlston = bodyText?.includes('Rawlston');

    console.log('\nText search:');
    console.log('  Contains "Brian":', hasBrian);
    console.log('  Contains "Rawlston":', hasRawlston);

    if (!hasBrian && !hasRawlston) {
      console.log('\n⚠️ Brian is NOT visible on the page');

      // Save the HTML
      const html = await page.content();
      fs.writeFileSync('test-results/matrix-debug/3-page-html.html', html);
      console.log('Saved page HTML to test-results/matrix-debug/3-page-html.html');
    }

    // Take screenshot
    await page.screenshot({
      path: 'test-results/matrix-debug/3-structure-analysis.png',
      fullPage: true,
    });

    saveDebugInfo('3-page-structure.json', {
      title,
      heading,
      levels,
      distributorCards,
      hasBrian,
      hasRawlston,
    });
  });

  test('STEP 4: Search for Brian explicitly', async ({ page }) => {
    console.log('\n=== STEP 4: Search for Brian ===\n');

    await loginAsCharles(page);
    await page.goto(`${BASE_URL}/dashboard/matrix`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[name*="search" i]');

    if (await searchInput.isVisible()) {
      console.log('Found search input');
      await searchInput.fill('Brian');
      await page.waitForTimeout(1000);

      // Take screenshot after search
      await page.screenshot({
        path: 'test-results/matrix-debug/4-search-brian.png',
        fullPage: true,
      });

      // Check if Brian appears after search
      const brianVisible = await page.locator('text=/brian/i').isVisible();
      console.log('Brian visible after search:', brianVisible);
    } else {
      console.log('No search input found on page');
    }
  });

  test('STEP 5: Check what level-1 members are shown', async ({ page }) => {
    console.log('\n=== STEP 5: Level 1 Members ===\n');

    await loginAsCharles(page);
    await page.goto(`${BASE_URL}/dashboard/matrix`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get database Level 1 members
    const { data: charlesMember } = await supabase
      .from('members')
      .select('member_id')
      .ilike('full_name', '%charles%potter%')
      .single();

    const { data: level1Members } = await supabase
      .from('members')
      .select('full_name, member_id, tech_rank')
      .eq('enroller_id', charlesMember?.member_id!);

    console.log(`Database says Charles has ${level1Members?.length} Level 1 members:`);
    level1Members?.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.full_name}`);
    });

    // Check page for each member
    for (const member of level1Members || []) {
      const visible = await page.locator(`text=/${member.full_name}/i`).isVisible();
      console.log(`  ${member.full_name}: ${visible ? '✓ VISIBLE' : '✗ NOT VISIBLE'}`);
    }

    // Take screenshot
    await page.screenshot({
      path: 'test-results/matrix-debug/5-level1-members.png',
      fullPage: true,
    });

    saveDebugInfo('5-level1-comparison.json', {
      databaseLevel1: level1Members,
    });
  });

  test('STEP 6: Check React component props/state', async ({ page }) => {
    console.log('\n=== STEP 6: Component Analysis ===\n');

    await loginAsCharles(page);
    await page.goto(`${BASE_URL}/dashboard/matrix`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Try to get React component data from DOM attributes
    const matrixNodes = await page.locator('[data-member-id]').all();

    console.log(`Found ${matrixNodes.length} nodes with data-member-id`);

    const memberIds: string[] = [];
    for (const node of matrixNodes) {
      const memberId = await node.getAttribute('data-member-id');
      if (memberId) {
        memberIds.push(memberId);
        const text = await node.textContent();
        console.log(`  Member ID: ${memberId.substring(0, 8)}... | ${text?.substring(0, 50)}`);
      }
    }

    // Check if Brian's member_id is in the list
    const brianMemberId = '2ca889e6-0015-4100-ae08-043903926ee4';
    const brianRendered = memberIds.includes(brianMemberId);

    console.log(`\nBrian's member_id (${brianMemberId}): ${brianRendered ? '✓ RENDERED' : '✗ NOT RENDERED'}`);

    saveDebugInfo('6-rendered-members.json', {
      totalRendered: memberIds.length,
      memberIds,
      brianRendered,
    });
  });

  test('STEP 7: Final diagnosis', async ({ page }) => {
    console.log('\n=== STEP 7: Final Diagnosis ===\n');

    await loginAsCharles(page);
    await page.goto(`${BASE_URL}/dashboard/matrix`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Comprehensive check
    const diagnosis = {
      timestamp: new Date().toISOString(),
      databaseRelationship: '✓ Brian.enroller_id = Charles.member_id',
      pageLoaded: await page.locator('h1, h2').filter({ hasText: /matrix/i }).isVisible(),
      brianInDOM: await page.locator('text=/brian/i').isVisible(),
      brianInHTML: (await page.content()).includes('Brian'),
      possibleIssues: [] as string[],
    };

    // Check for potential issues
    const teamSizeText = await page.locator('text=/Total Team Size/i').locator('..').locator('p.text-3xl').textContent();
    const teamSize = parseInt(teamSizeText?.trim() || '0');

    if (teamSize === 0) {
      diagnosis.possibleIssues.push('Total Team Size is 0 - Matrix query may be failing');
    }

    if (!diagnosis.brianInDOM && !diagnosis.brianInHTML) {
      diagnosis.possibleIssues.push('Brian not in DOM or HTML - likely a data fetching issue');
    }

    // Check console errors
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForTimeout(2000);

    if (consoleErrors.length > 0) {
      diagnosis.possibleIssues.push(`${consoleErrors.length} console errors detected`);
    }

    console.log('\nDiagnosis:', JSON.stringify(diagnosis, null, 2));
    saveDebugInfo('7-final-diagnosis.json', { ...diagnosis, consoleErrors });

    // Final screenshot
    await page.screenshot({
      path: 'test-results/matrix-debug/7-final-state.png',
      fullPage: true,
    });
  });

});
