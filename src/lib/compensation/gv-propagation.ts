/**
 * GROUP VOLUME (GV) PROPAGATION ENGINE
 *
 * When a sale happens, we need to update the Group Volume (GV) for the entire
 * upline sponsorship tree in real-time. This allows dashboards to show live
 * volume updates without waiting for the monthly commission run.
 *
 * CRITICAL RULES:
 * - Use ENROLLMENT TREE (sponsor_id) for GV propagation
 * - Update team_credits_monthly for all upline
 * - Stop at root (sponsor_id = null)
 * - Real-time updates (called from webhook)
 *
 * Source: APEX_COMP_ENGINE_SPEC_FINAL.md Section 3 (Data Model)
 *
 * @module lib/compensation/gv-propagation
 */

import { createServiceClient } from '@/lib/supabase/service';

// =============================================
// TYPES
// =============================================

export interface GVPropagationResult {
  seller_id: string;
  bv_amount: number;
  upline_updated: number;
  upline_members: Array<{
    member_id: string;
    distributor_id: string;
    name: string;
    previous_gv: number;
    new_gv: number;
  }>;
  errors: string[];
}

// =============================================
// CORE PROPAGATION FUNCTION
// =============================================

/**
 * Propagate Group Volume (GV) up the sponsorship tree
 *
 * When a distributor makes a sale:
 * 1. Get their sponsor_id
 * 2. Walk up the sponsor_id tree to root
 * 3. Update team_credits_monthly for each upline member
 * 4. Continue until sponsor_id = null (root)
 *
 * @param sellerId - Distributor ID who made the sale
 * @param bvAmount - Business Volume amount to propagate
 * @returns Propagation result with all upline updates
 *
 * @example
 * ```typescript
 * // Sale: Sarah sells $499 PulseCommand
 * await propagateGroupVolume('sarah-id', 499);
 *
 * // Updates:
 * // - Mike (sponsor): team_credits_monthly += 499
 * // - Jennifer (sponsor's sponsor): team_credits_monthly += 499
 * // - Tom (Jennifer's sponsor): team_credits_monthly += 499
 * // ... up to root
 * ```
 */
export async function propagateGroupVolume(
  sellerId: string,
  bvAmount: number
): Promise<GVPropagationResult> {
  const supabase = createServiceClient();

  const result: GVPropagationResult = {
    seller_id: sellerId,
    bv_amount: bvAmount,
    upline_updated: 0,
    upline_members: [],
    errors: [],
  };

  console.log(`\n📊 Starting GV Propagation for seller: ${sellerId}, BV: ${bvAmount}`);

  try {
    // Get seller's distributor record to find sponsor_id
    const { data: seller, error: sellerError } = await supabase
      .from('distributors')
      .select('id, sponsor_id, first_name, last_name')
      .eq('id', sellerId)
      .single();

    if (sellerError || !seller) {
      const error = `Failed to find seller distributor: ${sellerError?.message || 'Not found'}`;
      result.errors.push(error);
      console.error(`❌ ${error}`);
      return result;
    }

    console.log(`   Seller: ${seller.first_name} ${seller.last_name}`);
    console.log(`   Sponsor ID: ${seller.sponsor_id || 'None (root)'}`);

    // Walk up the sponsorship tree
    let currentSponsorId = seller.sponsor_id;
    let level = 1;
    const maxLevels = 100; // Safety limit to prevent infinite loops

    while (currentSponsorId && level <= maxLevels) {
      console.log(`\n   Level ${level}: Processing sponsor ${currentSponsorId}`);

      // Get sponsor's member record (need to update team_credits_monthly)
      const { data: sponsorMember, error: memberError } = await supabase
        .from('members')
        .select('member_id, distributor_id, full_name, team_credits_monthly')
        .eq('distributor_id', currentSponsorId)
        .single();

      if (memberError || !sponsorMember) {
        const error = `Level ${level}: Failed to find member for distributor ${currentSponsorId}`;
        result.errors.push(error);
        console.error(`   ❌ ${error}`);

        // Try to continue up the tree even if this member has issues
        const { data: nextSponsor } = await supabase
          .from('distributors')
          .select('sponsor_id')
          .eq('id', currentSponsorId)
          .single();

        currentSponsorId = nextSponsor?.sponsor_id || null;
        level++;
        continue;
      }

      const previousGV = sponsorMember.team_credits_monthly || 0;
      const newGV = previousGV + bvAmount;

      console.log(`   Member: ${sponsorMember.full_name}`);
      console.log(`   Previous GV: ${previousGV} → New GV: ${newGV}`);

      // Update team_credits_monthly
      const { error: updateError } = await supabase
        .from('members')
        .update({
          team_credits_monthly: newGV,
        })
        .eq('member_id', sponsorMember.member_id);

      if (updateError) {
        const error = `Level ${level}: Failed to update GV for ${sponsorMember.full_name}: ${updateError.message}`;
        result.errors.push(error);
        console.error(`   ❌ ${error}`);
      } else {
        console.log(`   ✅ Updated GV successfully`);

        result.upline_updated++;
        result.upline_members.push({
          member_id: sponsorMember.member_id,
          distributor_id: currentSponsorId,
          name: sponsorMember.full_name,
          previous_gv: previousGV,
          new_gv: newGV,
        });
      }

      // Get next sponsor up the tree
      const { data: currentDistributor, error: distError } = await supabase
        .from('distributors')
        .select('sponsor_id')
        .eq('id', currentSponsorId)
        .single();

      if (distError || !currentDistributor) {
        console.log(`   ℹ️  Reached end of sponsorship tree`);
        break;
      }

      currentSponsorId = currentDistributor.sponsor_id;
      level++;
    }

    if (level > maxLevels) {
      const error = 'Reached maximum tree depth (possible circular reference)';
      result.errors.push(error);
      console.error(`   ⚠️  ${error}`);
    }

    console.log(`\n✅ GV Propagation Complete:`);
    console.log(`   Upline members updated: ${result.upline_updated}`);
    console.log(`   Errors: ${result.errors.length}`);

  } catch (error: any) {
    const errorMsg = `GV propagation failed: ${error.message}`;
    result.errors.push(errorMsg);
    console.error(`❌ ${errorMsg}`);
  }

  return result;
}

/**
 * Reverse GV propagation for refunds/cancellations
 *
 * When a sale is refunded, we need to subtract the BV from upline
 *
 * @param sellerId - Distributor ID who made the original sale
 * @param bvAmount - Business Volume amount to subtract
 * @returns Propagation result
 */
export async function reversePropagateGroupVolume(
  sellerId: string,
  bvAmount: number
): Promise<GVPropagationResult> {
  const supabase = createServiceClient();

  const result: GVPropagationResult = {
    seller_id: sellerId,
    bv_amount: -bvAmount, // Negative to indicate reversal
    upline_updated: 0,
    upline_members: [],
    errors: [],
  };

  console.log(`\n📊 Starting GV Reversal for seller: ${sellerId}, BV: -${bvAmount}`);

  try {
    // Get seller's distributor record
    const { data: seller, error: sellerError } = await supabase
      .from('distributors')
      .select('id, sponsor_id, first_name, last_name')
      .eq('id', sellerId)
      .single();

    if (sellerError || !seller) {
      const error = `Failed to find seller distributor: ${sellerError?.message || 'Not found'}`;
      result.errors.push(error);
      console.error(`❌ ${error}`);
      return result;
    }

    // Walk up the sponsorship tree
    let currentSponsorId = seller.sponsor_id;
    let level = 1;
    const maxLevels = 100;

    while (currentSponsorId && level <= maxLevels) {
      // Get sponsor's member record
      const { data: sponsorMember, error: memberError } = await supabase
        .from('members')
        .select('member_id, distributor_id, full_name, team_credits_monthly')
        .eq('distributor_id', currentSponsorId)
        .single();

      if (memberError || !sponsorMember) {
        // Continue up tree
        const { data: nextSponsor } = await supabase
          .from('distributors')
          .select('sponsor_id')
          .eq('id', currentSponsorId)
          .single();

        currentSponsorId = nextSponsor?.sponsor_id || null;
        level++;
        continue;
      }

      const previousGV = sponsorMember.team_credits_monthly || 0;
      const newGV = Math.max(0, previousGV - bvAmount); // Don't go negative

      console.log(`   Level ${level}: ${sponsorMember.full_name}`);
      console.log(`   Previous GV: ${previousGV} → New GV: ${newGV}`);

      // Update team_credits_monthly
      const { error: updateError } = await supabase
        .from('members')
        .update({
          team_credits_monthly: newGV,
        })
        .eq('member_id', sponsorMember.member_id);

      if (updateError) {
        const error = `Failed to reverse GV for ${sponsorMember.full_name}: ${updateError.message}`;
        result.errors.push(error);
        console.error(`   ❌ ${error}`);
      } else {
        console.log(`   ✅ Reversed GV successfully`);

        result.upline_updated++;
        result.upline_members.push({
          member_id: sponsorMember.member_id,
          distributor_id: currentSponsorId,
          name: sponsorMember.full_name,
          previous_gv: previousGV,
          new_gv: newGV,
        });
      }

      // Get next sponsor
      const { data: currentDistributor } = await supabase
        .from('distributors')
        .select('sponsor_id')
        .eq('id', currentSponsorId)
        .single();

      currentSponsorId = currentDistributor?.sponsor_id || null;
      level++;
    }

    console.log(`\n✅ GV Reversal Complete:`);
    console.log(`   Upline members updated: ${result.upline_updated}`);
    console.log(`   Errors: ${result.errors.length}`);

  } catch (error: any) {
    const errorMsg = `GV reversal failed: ${error.message}`;
    result.errors.push(errorMsg);
    console.error(`❌ ${errorMsg}`);
  }

  return result;
}

/**
 * Recalculate GV for entire organization (admin utility)
 *
 * Use this to rebuild GV from scratch if data gets out of sync.
 * Should be run as a background job, not in real-time.
 *
 * @returns Summary of recalculation
 */
export async function recalculateAllGV(): Promise<{
  members_processed: number;
  members_updated: number;
  errors: string[];
}> {
  const supabase = createServiceClient();

  console.log('\n🔄 Starting Full GV Recalculation...');

  // Reset all team_credits_monthly to 0
  await supabase
    .from('members')
    .update({ team_credits_monthly: 0 })
    .neq('member_id', '00000000-0000-0000-0000-000000000000'); // Update all

  // Get all members with their personal_credits_monthly
  const { data: members, error } = await supabase
    .from('members')
    .select(`
      member_id,
      distributor_id,
      full_name,
      personal_credits_monthly
    `)
    .gt('personal_credits_monthly', 0)
    .order('created_at', { ascending: true });

  if (error || !members) {
    console.error('Failed to fetch members:', error);
    return { members_processed: 0, members_updated: 0, errors: [error?.message || 'Failed to fetch'] };
  }

  console.log(`   Found ${members.length} members with personal volume`);

  const errors: string[] = [];
  let processed = 0;
  let updated = 0;

  // For each member, propagate their PV up the tree as GV
  for (const member of members) {
    processed++;

    if (member.personal_credits_monthly > 0) {
      const result = await propagateGroupVolume(
        member.distributor_id,
        member.personal_credits_monthly
      );

      updated += result.upline_updated;
      errors.push(...result.errors);
    }
  }

  console.log(`\n✅ Full GV Recalculation Complete:`);
  console.log(`   Members processed: ${processed}`);
  console.log(`   Upline updates: ${updated}`);
  console.log(`   Errors: ${errors.length}`);

  return {
    members_processed: processed,
    members_updated: updated,
    errors,
  };
}

// =============================================
// EXPORTS
// =============================================

export default {
  propagateGroupVolume,
  reversePropagateGroupVolume,
  recalculateAllGV,
};
