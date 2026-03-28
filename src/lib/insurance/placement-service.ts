// =============================================
// Insurance Placement Service
// Handles temporary placement and round-robin logic
// =============================================

import { createServiceClient } from '@/lib/supabase/service';

/**
 * Fallback agents for temporary placement
 * Phil Resch and Ahn Doan receive licensed agents when sponsor is unlicensed or below Level 3
 */
export const FALLBACK_AGENTS = {
  // TODO: Update these with actual member IDs from database
  PHIL_RESCH: 'PHIL_RESCH_MEMBER_ID', // Replace with actual ID
  AHN_DOAN: 'AHN_DOAN_MEMBER_ID',     // Replace with actual ID
} as const;

export interface PlacementResult {
  success: boolean;
  fallbackAgentId: string;
  fallbackAgentName: 'Phil Resch' | 'Ahn Doan';
  reason: string;
  error?: string;
}

export interface SponsorEligibility {
  eligible: boolean;
  reason?: string;
  sponsorId: string;
  isLicensed: boolean;
  insuranceRank?: string;
  isLevel3OrHigher: boolean;
}

/**
 * Get the next fallback agent using round-robin
 * Counts existing placements and alternates between Phil and Ahn
 */
export async function getRoundRobinFallbackAgent(): Promise<PlacementResult> {
  const supabase = createServiceClient();

  try {
    // Get current placement counts from insurance_agents
    const { data: philCount } = await supabase
      .from('insurance_agents')
      .select('id', { count: 'exact', head: true })
      .eq('insurance_enroller_id', FALLBACK_AGENTS.PHIL_RESCH)
      .eq('temporary_placement', true);

    const { data: ahnCount } = await supabase
      .from('insurance_agents')
      .select('id', { count: 'exact', head: true })
      .eq('insurance_enroller_id', FALLBACK_AGENTS.AHN_DOAN)
      .eq('temporary_placement', true);

    const philTotal = philCount || 0;
    const ahnTotal = ahnCount || 0;

    // Assign to whoever has fewer (or Phil if tied)
    const usePhil = philTotal <= ahnTotal;

    return {
      success: true,
      fallbackAgentId: usePhil ? FALLBACK_AGENTS.PHIL_RESCH : FALLBACK_AGENTS.AHN_DOAN,
      fallbackAgentName: usePhil ? 'Phil Resch' : 'Ahn Doan',
      reason: `Round-robin: Phil (${philTotal}) vs Ahn (${ahnTotal})`,
    };
  } catch (error) {
    console.error('Error getting round-robin fallback agent:', error);
    return {
      success: false,
      fallbackAgentId: FALLBACK_AGENTS.PHIL_RESCH, // Default to Phil on error
      fallbackAgentName: 'Phil Resch',
      reason: 'Error determining placement, defaulted to Phil Resch',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if a sponsor is eligible to hold licensed agents
 * Requirements:
 * 1. Sponsor must be licensed
 * 2. Sponsor must be Level 3+ (Sr. Associate or higher)
 */
export async function checkSponsorEligibility(sponsorId: string): Promise<SponsorEligibility> {
  const supabase = createServiceClient();

  try {
    // Get sponsor's distributor and member info
    const { data: sponsor, error } = await supabase
      .from('distributors')
      .select(`
        id,
        is_licensed_agent,
        member:members!members_distributor_id_fkey (
          insurance_rank
        )
      `)
      .eq('id', sponsorId)
      .single();

    if (error || !sponsor) {
      return {
        eligible: false,
        reason: 'Sponsor not found',
        sponsorId,
        isLicensed: false,
        isLevel3OrHigher: false,
      };
    }

    const isLicensed = sponsor.is_licensed_agent || false;
    const member = Array.isArray(sponsor.member) ? sponsor.member[0] : sponsor.member;
    const insuranceRank = member?.insurance_rank || 'inactive';

    // Level 3 = Sr. Associate
    // Level 3+ = sr_associate, agent, sr_agent, mga, associate_mga, senior_mga, etc.
    const level3AndAbove = [
      'sr_associate', // Level 3
      'agent',        // Level 4
      'sr_agent',     // Level 5
      'mga',          // Level 6
      'associate_mga',
      'senior_mga',
      'regional_mga',
      'national_mga',
      'executive_mga',
      'premier_mga',
    ];

    const isLevel3OrHigher = level3AndAbove.includes(insuranceRank);

    // Both conditions must be true
    const eligible = isLicensed && isLevel3OrHigher;

    let reason = '';
    if (!isLicensed) {
      reason = 'Sponsor is not licensed';
    } else if (!isLevel3OrHigher) {
      reason = `Sponsor is below Level 3 (current rank: ${insuranceRank})`;
    }

    return {
      eligible,
      reason: eligible ? undefined : reason,
      sponsorId,
      isLicensed,
      insuranceRank,
      isLevel3OrHigher,
    };
  } catch (error) {
    console.error('Error checking sponsor eligibility:', error);
    return {
      eligible: false,
      reason: 'Error checking sponsor eligibility',
      sponsorId,
      isLicensed: false,
      isLevel3OrHigher: false,
    };
  }
}

/**
 * Place a licensed agent temporarily with Phil or Ahn
 * Called when sponsor is unlicensed or below Level 3
 */
export async function placeAgentTemporarily(
  agentId: string,
  originalEnrollerId: string,
  reason: 'sponsor_unlicensed' | 'sponsor_below_level_3'
): Promise<{ success: boolean; error?: string; fallbackAgentName?: string }> {
  const supabase = createServiceClient();

  try {
    // Get fallback agent via round-robin
    const fallback = await getRoundRobinFallbackAgent();

    if (!fallback.success) {
      return {
        success: false,
        error: fallback.error || 'Failed to determine fallback agent',
      };
    }

    // Check if insurance_agents record exists
    const { data: existingAgent } = await supabase
      .from('insurance_agents')
      .select('id, member_id')
      .eq('member_id', agentId)
      .single();

    if (!existingAgent) {
      // Create new insurance_agents record with temporary placement
      const { error: insertError } = await supabase
        .from('insurance_agents')
        .insert({
          member_id: agentId,
          insurance_enroller_id: fallback.fallbackAgentId,
          original_enroller_id: originalEnrollerId,
          temporary_placement: true,
          temporary_placement_reason: reason,
          placed_with_fallback_at: new Date().toISOString(),
          rank: 'pre_associate', // Default starting rank
        });

      if (insertError) {
        console.error('Error creating insurance agent with temporary placement:', insertError);
        return {
          success: false,
          error: 'Failed to create insurance agent record',
        };
      }
    } else {
      // Update existing record with temporary placement
      const { error: updateError } = await supabase
        .from('insurance_agents')
        .update({
          insurance_enroller_id: fallback.fallbackAgentId,
          original_enroller_id: originalEnrollerId,
          temporary_placement: true,
          temporary_placement_reason: reason,
          placed_with_fallback_at: new Date().toISOString(),
        })
        .eq('member_id', agentId);

      if (updateError) {
        console.error('Error updating insurance agent with temporary placement:', updateError);
        return {
          success: false,
          error: 'Failed to update insurance agent record',
        };
      }
    }

    return {
      success: true,
      fallbackAgentName: fallback.fallbackAgentName,
    };
  } catch (error) {
    console.error('Error placing agent temporarily:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Return a licensed agent from Phil/Ahn back to their original sponsor
 * Called when sponsor reaches Level 3 (Sr. Associate) and request is approved
 */
export async function returnAgentToSponsor(
  agentId: string
): Promise<{ success: boolean; error?: string; sponsorName?: string }> {
  const supabase = createServiceClient();

  try {
    // Get agent's current placement info
    const { data: agent, error: agentError } = await supabase
      .from('insurance_agents')
      .select('member_id, original_enroller_id, temporary_placement')
      .eq('member_id', agentId)
      .single();

    if (agentError || !agent) {
      return {
        success: false,
        error: 'Agent not found',
      };
    }

    if (!agent.temporary_placement || !agent.original_enroller_id) {
      return {
        success: false,
        error: 'Agent is not temporarily placed',
      };
    }

    // Move agent back to original sponsor
    const { error: updateError } = await supabase
      .from('insurance_agents')
      .update({
        insurance_enroller_id: agent.original_enroller_id,
        original_enroller_id: null,
        temporary_placement: false,
        temporary_placement_reason: null,
        placed_with_fallback_at: null,
      })
      .eq('member_id', agentId);

    if (updateError) {
      console.error('Error returning agent to sponsor:', updateError);
      return {
        success: false,
        error: 'Failed to return agent to sponsor',
      };
    }

    // Get sponsor name for notification
    const { data: sponsor } = await supabase
      .from('distributors')
      .select('first_name, last_name')
      .eq('id', agent.original_enroller_id)
      .single();

    return {
      success: true,
      sponsorName: sponsor ? `${sponsor.first_name} ${sponsor.last_name}` : undefined,
    };
  } catch (error) {
    console.error('Error returning agent to sponsor:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Find all agents temporarily placed that should return to a specific sponsor
 * Used when sponsor reaches Level 3
 */
export async function findAgentsToReturn(sponsorId: string): Promise<string[]> {
  const supabase = createServiceClient();

  try {
    const { data: agents } = await supabase
      .from('insurance_agents')
      .select('member_id')
      .eq('original_enroller_id', sponsorId)
      .eq('temporary_placement', true);

    return agents ? agents.map(a => a.member_id) : [];
  } catch (error) {
    console.error('Error finding agents to return:', error);
    return [];
  }
}
