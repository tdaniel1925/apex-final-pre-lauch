// Apex Affinity Group - Override Resolution & Compression
// Source: BUSINESS-RULES.md, 05_genealogy_examples.md

import type { Rep, Rank, OverrideRecipient } from './types';
import { qualifiesForOverrideLevel } from './rank';

/**
 * Resolve override recipient for a specific level
 *
 * CRITICAL COMPRESSION RULES:
 * - Start at seller's sponsor (L1 position)
 * - Walk upline chain via placement_parent_id
 * - Skip INACTIVE reps (status != 'ACTIVE')
 * - Skip reps below required rank for this level
 * - First qualified rep receives the override
 * - If no qualified rep found → route to Apex Reserve
 * - EXCEPTION: Personal enroller ALWAYS earns L1 (checked separately)
 *
 * Algorithm (from BUSINESS-RULES.md):
 * ```
 * function resolveOverrideRecipient(sale, level, startingRep):
 *   current = startingRep.sponsor  # start at L1 above seller
 *   depth = 0
 *   maxDepth = 10  # safety guard
 *
 *   while current is not None and depth < maxDepth:
 *     priorRank = getPriorMonthRank(current)
 *     if current.status != 'ACTIVE':
 *       current = current.sponsor  # compress past inactive
 *       depth++
 *       continue
 *     if qualifiesForLevel(priorRank, level):
 *       return current  # found qualified recipient
 *     current = current.sponsor  # move up
 *     depth++
 *
 *   return null  # no qualified recipient → Apex Reserve
 * ```
 *
 * @param seller - Rep who made the sale
 * @param level - Override level (1-7)
 * @param uplineChain - Pre-fetched upline chain from database
 * @param getPriorMonthRank - Function to get prior month rank for a rep
 * @returns Override recipient or null (Apex Reserve)
 */
export async function resolveOverrideRecipient(
  seller: Rep,
  level: number,
  uplineChain: Rep[],
  getPriorMonthRank: (repId: string) => Promise<Rank | null>
): Promise<OverrideRecipient | null> {
  const MAX_DEPTH = 10;
  let depth = 0;
  let compressed = false;
  let originalLevel = level;

  for (const uplineRep of uplineChain) {
    if (depth >= MAX_DEPTH) {
      break;
    }

    depth++;

    // Skip if inactive or terminated
    if (uplineRep.status !== 'ACTIVE') {
      compressed = true;
      continue;
    }

    // Get prior month rank (CRITICAL: not current rank!)
    const priorRank = await getPriorMonthRank(uplineRep.rep_id);

    // Check if qualified for this level
    if (qualifiesForOverrideLevel(priorRank, level, uplineRep.current_rank === 'PLATINUM' ? uplineRep.team_bv || 0 : 0)) {
      // NOTE: team_bv would need to be fetched from BV snapshot for accuracy
      // For now, assuming current team_bv is acceptable proxy

      return {
        rep: uplineRep,
        level,
        amount: 0,  // Set by caller after finding recipient
        compressed,
        ...(compressed && { originalLevel }),
      };
    }

    // Not qualified → compress upward
    compressed = true;
  }

  // No qualified recipient found → Apex Reserve
  return null;
}

/**
 * Resolve ALL override recipients for a sale
 *
 * Returns complete override chain with amounts assigned
 *
 * SPECIAL CASES:
 * - Personal enroller ALWAYS earns L1 (even if placed elsewhere in matrix)
 * - BizCenter: Enroller gets $8 flat, NO L2-L7
 * - Compressed overrides: Percentage doesn't change, only recipient
 *
 * @param seller - Rep who made the sale
 * @param overridePool - Total override pool from waterfall
 * @param overrideLevels - Override amounts per level from waterfall
 * @param uplineChain - Pre-fetched upline chain
 * @param getPriorMonthRank - Function to get prior month rank
 * @param enroller - Personal enroller (for L1 exception)
 * @returns Array of override recipients with amounts
 */
export async function resolveAllOverrides(
  seller: Rep,
  overrideLevels: Record<string, number>,
  uplineChain: Rep[],
  getPriorMonthRank: (repId: string) => Promise<Rank | null>,
  enroller: Rep | null
): Promise<OverrideRecipient[]> {
  const recipients: OverrideRecipient[] = [];

  // EXCEPTION: Personal enroller always earns L1
  if (enroller && enroller.rep_id !== seller.rep_id) {
    const priorRank = await getPriorMonthRank(enroller.rep_id);

    if (enroller.status === 'ACTIVE' && qualifiesForOverrideLevel(priorRank, 1)) {
      recipients.push({
        rep: enroller,
        level: 1,
        amount: overrideLevels.L1,
        compressed: false,
      });

      // Remove L1 from upline chain processing (enroller already got it)
      delete overrideLevels.L1;
    }
  }

  // Process remaining levels (L2-L7, or L1-L7 if no enroller handled L1)
  for (const [levelKey, amount] of Object.entries(overrideLevels)) {
    const level = parseInt(levelKey.replace('L', ''));

    const recipient = await resolveOverrideRecipient(
      seller,
      level,
      uplineChain,
      getPriorMonthRank
    );

    if (recipient) {
      recipients.push({
        ...recipient,
        amount,
      });
    } else {
      // No recipient → Apex Reserve
      // (Caller should track this separately for accounting)
    }
  }

  return recipients;
}

/**
 * Check if override chain is valid (no circular references)
 *
 * Used during enrollment to prevent invalid placements
 *
 * @param repId - Rep being placed
 * @param placementParentId - Proposed placement parent
 * @param getUplineChain - Function to fetch upline chain
 * @returns True if valid (no circular reference)
 */
export async function validateOverrideChain(
  repId: string,
  placementParentId: string,
  getUplineChain: (startRepId: string) => Promise<Rep[]>
): Promise<boolean> {
  const upline = await getUplineChain(placementParentId);

  // Check if repId appears anywhere in upline chain
  const circular = upline.some(rep => rep.rep_id === repId);

  return !circular;
}

/**
 * Calculate compression statistics for reporting
 *
 * Used in admin dashboard to track compression frequency
 *
 * @param overrideRecipients - Override recipients from resolveAllOverrides
 * @returns Compression stats
 */
export function calculateCompressionStats(overrideRecipients: OverrideRecipient[]) {
  const total = overrideRecipients.length;
  const compressed = overrideRecipients.filter(r => r.compressed).length;
  const compressedByLevel = overrideRecipients
    .filter(r => r.compressed)
    .reduce((acc, r) => {
      const level = r.originalLevel || r.level;
      acc[`L${level}`] = (acc[`L${level}`] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  return {
    total,
    compressed,
    compressionRate: total > 0 ? (compressed / total) * 100 : 0,
    compressedByLevel,
  };
}

/**
 * Get compression chain visualization (for debugging/support)
 *
 * Example output:
 * ```
 * Seller: Carlos (Associate)
 *   L1 → Frank (INACTIVE) [COMPRESSED]
 *   L1 → Deja (Bronze) ✓ $19.65
 *   L2 → Marcus (Silver) ✓ $16.38
 *   L3 → Diana (Platinum) ✓ $13.10
 *   L4 → [Apex Reserve] $9.83
 * ```
 *
 * @param seller - Seller rep
 * @param uplineChain - Upline chain
 * @param overrideRecipients - Resolved recipients
 * @returns Formatted chain visualization
 */
export function visualizeCompressionChain(
  seller: Rep,
  uplineChain: Rep[],
  overrideRecipients: OverrideRecipient[]
): string {
  let output = `Seller: ${seller.full_name} (${seller.current_rank})\n`;

  // Track which upline reps received overrides
  const recipientIds = new Set(overrideRecipients.map(r => r.rep_id));

  for (const uplineRep of uplineChain) {
    const recipient = overrideRecipients.find(r => r.rep.rep_id === uplineRep.rep_id);

    if (recipient) {
      const compressed = recipient.compressed ? ' [COMPRESSED]' : '';
      output += `  L${recipient.level} → ${uplineRep.full_name} (${uplineRep.current_rank})${compressed} ✓ $${recipient.amount.toFixed(2)}\n`;
    } else if (uplineRep.status !== 'ACTIVE') {
      output += `  → ${uplineRep.full_name} (${uplineRep.status}) [SKIPPED]\n`;
    }
  }

  // Show Apex Reserve for unassigned levels
  const assignedLevels = new Set(overrideRecipients.map(r => r.level));
  for (let level = 1; level <= 7; level++) {
    if (!assignedLevels.has(level)) {
      output += `  L${level} → [Apex Reserve]\n`;
    }
  }

  return output;
}
