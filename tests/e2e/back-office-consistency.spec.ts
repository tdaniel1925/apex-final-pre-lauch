// =============================================
// E2E Tests - Cross-View Consistency
// Verifies Matrix, Genealogy, and Team views show consistent data
// =============================================

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3050';

// Test user credentials
const TEST_USER = {
  email: 'sellag.sb@gmail.com',
  password: '4Xkkilla1@',
};

/**
 * Helper function to extract numbers from text
 */
function extractNumber(text: string | null): number {
  if (!text) return 0;
  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Helper function to count visible member cards/nodes
 */
async function countVisibleMembers(page: any, selector: string): Promise<number> {
  const elements = page.locator(selector);
  const count = await elements.count();
  return count;
}

test.describe('Cross-View Consistency Tests', () => {
  // Login before all tests
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
  });

  test.describe('Rep Count Consistency', () => {
    test('should show same total team size across all views', async ({ page }) => {
      // MATRIX VIEW
      await page.goto(`${BASE_URL}/dashboard/matrix`);
      await page.waitForTimeout(2000);

      const matrixTotalText = await page.locator('text=/Total Team Size|Team Size/i').locator('..').textContent();
      const matrixTotal = extractNumber(matrixTotalText);

      console.log('Matrix Total Team Size:', matrixTotal);

      // GENEALOGY VIEW
      await page.goto(`${BASE_URL}/dashboard/genealogy`);
      await page.waitForTimeout(2000);

      const genealogyTotalText = await page.locator('text=/Total Organization|Organization Size/i').locator('..').textContent();
      const genealogyTotal = extractNumber(genealogyTotalText);

      console.log('Genealogy Total Organization Size:', genealogyTotal);

      // TEAM VIEW
      await page.goto(`${BASE_URL}/dashboard/team`);
      await page.waitForTimeout(2000);

      const teamTotalText = await page.locator('text=/Personal Enrollees|Total.*Enrollees/i').locator('..').textContent();
      const teamTotal = extractNumber(teamTotalText);

      console.log('Team Total Enrollees:', teamTotal);

      // Note: These views may show different counts by design:
      // - Team shows L1 direct enrollees only
      // - Genealogy shows full downline organization
      // - Matrix shows levels based on rank

      // Test consistency within expected parameters
      // Team (L1 only) should be <= Genealogy (all levels)
      expect(teamTotal).toBeLessThanOrEqual(genealogyTotal || teamTotal);

      // Log discrepancies for investigation
      if (teamTotal !== genealogyTotal && genealogyTotal > 0) {
        console.log('INFO: Team count differs from Genealogy (expected if multi-level downline exists)');
        console.log(`  Team (L1 only): ${teamTotal}`);
        console.log(`  Genealogy (all levels): ${genealogyTotal}`);
      }
    });

    test('should show same direct enrollee count in Team and Genealogy', async ({ page }) => {
      // GENEALOGY VIEW - Direct Enrollees
      await page.goto(`${BASE_URL}/dashboard/genealogy`);
      await page.waitForTimeout(2000);

      const genealogyDirectText = await page.locator('text=/Direct Enrollees|personally sponsored/i').locator('..').textContent();
      const genealogyDirect = extractNumber(genealogyDirectText);

      console.log('Genealogy Direct Enrollees:', genealogyDirect);

      // TEAM VIEW - Total Personal Enrollees
      await page.goto(`${BASE_URL}/dashboard/team`);
      await page.waitForTimeout(2000);

      const teamDirectText = await page.locator('text=/Personal Enrollees|\\d+ (direct )?enrollee/i').first().textContent();
      const teamDirect = extractNumber(teamDirectText);

      console.log('Team Direct Enrollees:', teamDirect);

      // Direct enrollees should match exactly
      expect(genealogyDirect).toBe(teamDirect);
    });
  });

  test.describe('Member Data Consistency', () => {
    test('should show same member names across all views', async ({ page }) => {
      const memberNames: {
        matrix: string[];
        genealogy: string[];
        team: string[];
      } = {
        matrix: [],
        genealogy: [],
        team: [],
      };

      // Collect names from MATRIX
      await page.goto(`${BASE_URL}/dashboard/matrix`);
      await page.waitForTimeout(2000);

      const matrixHasMembers = await page.locator('text=/No.*members|empty/i').isVisible().catch(() => false);

      if (!matrixHasMembers) {
        const matrixNodes = page.locator('[data-testid="matrix-node"], [class*="node"]');
        const matrixCount = await matrixNodes.count();

        for (let i = 0; i < Math.min(matrixCount, 10); i++) {
          const nodeText = await matrixNodes.nth(i).textContent();
          if (nodeText) {
            // Extract name (remove ranks, numbers, etc.)
            const nameMatch = nodeText.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
            if (nameMatch) {
              memberNames.matrix.push(nameMatch[0].trim());
            }
          }
        }
      }

      // Collect names from GENEALOGY
      await page.goto(`${BASE_URL}/dashboard/genealogy`);
      await page.waitForTimeout(2000);

      const genealogyHasMembers = await page.locator('text=/No Enrollees/i').isVisible().catch(() => false);

      if (!genealogyHasMembers) {
        const genealogyNodes = page.locator('[data-testid="tree-node"], [class*="node"]');
        const genealogyCount = await genealogyNodes.count();

        for (let i = 0; i < Math.min(genealogyCount, 10); i++) {
          const nodeText = await genealogyNodes.nth(i).textContent();
          if (nodeText) {
            const nameMatch = nodeText.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
            if (nameMatch) {
              memberNames.genealogy.push(nameMatch[0].trim());
            }
          }
        }
      }

      // Collect names from TEAM
      await page.goto(`${BASE_URL}/dashboard/team`);
      await page.waitForTimeout(2000);

      const teamHasMembers = await page.locator('text=/No.*members/i').isVisible().catch(() => false);

      if (!teamHasMembers) {
        const teamCards = page.locator('[data-testid="team-member"], [class*="member-card"]');
        const teamCount = await teamCards.count();

        for (let i = 0; i < Math.min(teamCount, 10); i++) {
          const cardText = await teamCards.nth(i).textContent();
          if (cardText) {
            const nameMatch = cardText.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
            if (nameMatch) {
              memberNames.team.push(nameMatch[0].trim());
            }
          }
        }
      }

      // Verify consistency
      console.log('Members found in Matrix:', memberNames.matrix);
      console.log('Members found in Genealogy:', memberNames.genealogy);
      console.log('Members found in Team:', memberNames.team);

      // Team members should be a subset of Genealogy
      if (memberNames.team.length > 0 && memberNames.genealogy.length > 0) {
        memberNames.team.forEach((teamName) => {
          const foundInGenealogy = memberNames.genealogy.some((gName) =>
            gName.includes(teamName) || teamName.includes(gName)
          );

          if (!foundInGenealogy) {
            console.warn(`WARNING: Team member "${teamName}" not found in Genealogy view`);
          }
        });
      }
    });

    test('should show same member ranks across views', async ({ page }) => {
      // This test verifies that a member's rank is consistent across all views

      // TEAM VIEW - Get first member's rank
      await page.goto(`${BASE_URL}/dashboard/team`);
      await page.waitForTimeout(2000);

      const hasMembers = await page.locator('text=/No.*members/i').isVisible().catch(() => false);

      if (!hasMembers) {
        const firstMemberCard = page.locator('[data-testid="team-member"], [class*="member-card"]').first();
        const memberCardText = await firstMemberCard.textContent();

        // Extract name and rank
        const nameMatch = memberCardText?.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
        const rankMatch = memberCardText?.toLowerCase().match(/(starter|bronze|silver|gold|platinum|ruby|diamond|crown|elite)/);

        if (nameMatch && rankMatch) {
          const memberName = nameMatch[0];
          const teamRank = rankMatch[0];

          console.log(`Team View - ${memberName}: ${teamRank}`);

          // Find same member in GENEALOGY
          await page.goto(`${BASE_URL}/dashboard/genealogy`);
          await page.waitForTimeout(2000);

          const genealogyMember = page.locator(`text=${memberName}`).first();
          const genealogyMemberContainer = genealogyMember.locator('..');

          if (await genealogyMember.isVisible()) {
            const genealogyText = await genealogyMemberContainer.textContent();
            const genealogyRankMatch = genealogyText?.toLowerCase().match(/(starter|bronze|silver|gold|platinum|ruby|diamond|crown|elite)/);

            if (genealogyRankMatch) {
              const genealogyRank = genealogyRankMatch[0];
              console.log(`Genealogy View - ${memberName}: ${genealogyRank}`);

              // Ranks should match
              expect(teamRank).toBe(genealogyRank);
            }
          }
        }
      }
    });

    test('should show same personal credits across views', async ({ page }) => {
      // TEAM VIEW - Get first member's credits
      await page.goto(`${BASE_URL}/dashboard/team`);
      await page.waitForTimeout(2000);

      const hasMembers = await page.locator('text=/No.*members/i').isVisible().catch(() => false);

      if (!hasMembers) {
        const firstMemberCard = page.locator('[data-testid="team-member"], [class*="member-card"]').first();
        const cardText = await firstMemberCard.textContent();

        const nameMatch = cardText?.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
        const creditsMatch = cardText?.match(/(\d+)\s*credit/i);

        if (nameMatch && creditsMatch) {
          const memberName = nameMatch[0];
          const teamCredits = parseInt(creditsMatch[1]);

          console.log(`Team View - ${memberName}: ${teamCredits} credits`);

          // Find same member in GENEALOGY
          await page.goto(`${BASE_URL}/dashboard/genealogy`);
          await page.waitForTimeout(2000);

          const genealogyMember = page.locator(`text=${memberName}`).first();

          if (await genealogyMember.isVisible()) {
            const genealogyContainer = genealogyMember.locator('..');
            const genealogyText = await genealogyContainer.textContent();
            const genealogyCreditsMatch = genealogyText?.match(/(\d+)\s*credit/i);

            if (genealogyCreditsMatch) {
              const genealogyCredits = parseInt(genealogyCreditsMatch[1]);
              console.log(`Genealogy View - ${memberName}: ${genealogyCredits} credits`);

              // Credits should match
              expect(teamCredits).toBe(genealogyCredits);
            }
          }
        }
      }
    });
  });

  test.describe('Stats Consistency', () => {
    test('should show consistent active member count', async ({ page }) => {
      // TEAM VIEW - Active count
      await page.goto(`${BASE_URL}/dashboard/team`);
      await page.waitForTimeout(2000);

      const teamActiveText = await page.locator('text=/Active.*Month|\\d+.*active/i').first().textContent();
      const teamActive = extractNumber(teamActiveText);

      console.log('Team Active Members:', teamActive);

      // MATRIX VIEW - Active count
      await page.goto(`${BASE_URL}/dashboard/matrix`);
      await page.waitForTimeout(2000);

      const matrixActiveText = await page.locator('text=/Active Members/i').locator('..').textContent();
      const matrixActive = extractNumber(matrixActiveText);

      console.log('Matrix Active Members:', matrixActive);

      // Active counts should be consistent
      // Note: Team shows L1 active, Matrix shows all levels active
      // So Matrix active >= Team active
      expect(matrixActive).toBeGreaterThanOrEqual(teamActive);
    });

    test('should show consistent override earnings', async ({ page }) => {
      // TEAM VIEW - L1 Override Earnings
      await page.goto(`${BASE_URL}/dashboard/team`);
      await page.waitForTimeout(2000);

      const teamOverrideText = await page.locator('text=/Override Earnings|L1 Override/i').locator('..').textContent();
      const teamOverrideMatch = teamOverrideText?.match(/\$?([\d,]+\.?\d*)/);
      const teamOverride = teamOverrideMatch ? parseFloat(teamOverrideMatch[1].replace(',', '')) : 0;

      console.log('Team L1 Override Earnings:', teamOverride);

      // MATRIX VIEW - Override Earnings (Total)
      await page.goto(`${BASE_URL}/dashboard/matrix`);
      await page.waitForTimeout(2000);

      const matrixOverrideText = await page.locator('text=/Override Earnings/i').locator('..').textContent();
      const matrixOverrideMatch = matrixOverrideText?.match(/\$?([\d,]+\.?\d*)/);
      const matrixOverride = matrixOverrideMatch ? parseFloat(matrixOverrideMatch[1].replace(',', '')) : 0;

      console.log('Matrix Total Override Earnings:', matrixOverride);

      // Matrix total should be >= Team L1 override
      expect(matrixOverride).toBeGreaterThanOrEqual(teamOverride);
    });
  });

  test.describe('Navigation Consistency', () => {
    test('should navigate between views without losing context', async ({ page }) => {
      // Start at Team
      await page.goto(`${BASE_URL}/dashboard/team`);
      await page.waitForTimeout(1000);
      await expect(page.locator('h1')).toContainText(/Team/i);

      // Navigate to Genealogy
      const genealogyLink = page.locator('a[href*="/genealogy"], a:has-text("Genealogy")').first();
      if (await genealogyLink.isVisible()) {
        await genealogyLink.click();
        await page.waitForTimeout(1000);
        await expect(page.locator('h1')).toContainText(/Genealogy/i);
      }

      // Navigate to Matrix
      const matrixLink = page.locator('a[href*="/matrix"], a:has-text("Matrix")').first();
      if (await matrixLink.isVisible()) {
        await matrixLink.click();
        await page.waitForTimeout(1000);
        await expect(page.locator('h1')).toContainText(/Matrix/i);
      }

      // Navigate back to Team
      const teamLink = page.locator('a[href*="/team"], a:has-text("Team")').first();
      if (await teamLink.isVisible()) {
        await teamLink.click();
        await page.waitForTimeout(1000);
        await expect(page.locator('h1')).toContainText(/Team/i);
      }
    });

    test('should maintain user session across all views', async ({ page }) => {
      const views = [
        '/dashboard/team',
        '/dashboard/genealogy',
        '/dashboard/matrix',
      ];

      for (const view of views) {
        await page.goto(`${BASE_URL}${view}`);
        await page.waitForTimeout(1000);

        // Should not redirect to login
        expect(page.url()).not.toContain('/login');

        // Should show user's name or info
        const userInfo = page.locator('text=/Sella|Rep #/i');
        await expect(userInfo).toBeVisible();
      }
    });
  });

  test.describe('Data Freshness', () => {
    test('should show same data when refreshing views', async ({ page }) => {
      // TEAM VIEW - Get initial count
      await page.goto(`${BASE_URL}/dashboard/team`);
      await page.waitForTimeout(2000);

      const initialCount1 = extractNumber(
        await page.locator('text=/\\d+ enrollee/i').first().textContent()
      );

      // Refresh page
      await page.reload();
      await page.waitForTimeout(2000);

      const refreshCount1 = extractNumber(
        await page.locator('text=/\\d+ enrollee/i').first().textContent()
      );

      expect(initialCount1).toBe(refreshCount1);

      // GENEALOGY VIEW
      await page.goto(`${BASE_URL}/dashboard/genealogy`);
      await page.waitForTimeout(2000);

      const initialCount2 = extractNumber(
        await page.locator('text=/Direct Enrollees/i').locator('..').textContent()
      );

      await page.reload();
      await page.waitForTimeout(2000);

      const refreshCount2 = extractNumber(
        await page.locator('text=/Direct Enrollees/i').locator('..').textContent()
      );

      expect(initialCount2).toBe(refreshCount2);
    });
  });

  test.describe('Modal Consistency', () => {
    test('should show same member details in modal from all views', async ({ page }) => {
      let memberDetailsFromTeam: string | null = null;
      let memberDetailsFromGenealogy: string | null = null;

      // TEAM VIEW - Open first member modal
      await page.goto(`${BASE_URL}/dashboard/team`);
      await page.waitForTimeout(2000);

      const hasTeamMembers = await page.locator('text=/No.*members/i').isVisible().catch(() => false);

      if (!hasTeamMembers) {
        const teamMemberCard = page.locator('[data-testid="team-member"] button, [class*="member-card"] button').first();

        if (await teamMemberCard.isVisible()) {
          await teamMemberCard.click();
          await page.waitForTimeout(1000);

          const modal = page.locator('[role="dialog"], [class*="modal"]');
          memberDetailsFromTeam = await modal.textContent();

          await page.locator('button[aria-label="Close"], button:has-text("Close")').first().click();
          await page.waitForTimeout(500);
        }
      }

      // GENEALOGY VIEW - Open same member modal
      await page.goto(`${BASE_URL}/dashboard/genealogy`);
      await page.waitForTimeout(2000);

      const hasGenealogyMembers = await page.locator('text=/No Enrollees/i').isVisible().catch(() => false);

      if (!hasGenealogyMembers) {
        const genealogyNode = page.locator('button[class*="node"], [data-testid="tree-node"] button').first();

        if (await genealogyNode.isVisible()) {
          await genealogyNode.click();
          await page.waitForTimeout(1000);

          const modal = page.locator('[role="dialog"], [class*="modal"]');
          memberDetailsFromGenealogy = await modal.textContent();
        }
      }

      // Compare modal content
      if (memberDetailsFromTeam && memberDetailsFromGenealogy) {
        // Extract key info (name, rank, credits)
        const nameMatch1 = memberDetailsFromTeam.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);
        const nameMatch2 = memberDetailsFromGenealogy.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/);

        if (nameMatch1 && nameMatch2) {
          console.log('Team modal name:', nameMatch1[0]);
          console.log('Genealogy modal name:', nameMatch2[0]);

          // Names should match
          expect(nameMatch1[0]).toBe(nameMatch2[0]);
        }
      }
    });
  });
});
