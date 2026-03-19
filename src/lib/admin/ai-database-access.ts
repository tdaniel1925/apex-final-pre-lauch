// =============================================
// AI Database Access - FULL UNRESTRICTED ACCESS
// Gives AI assistant complete access to entire database
// =============================================

import { createServiceClient } from '@/lib/supabase/service';

export interface DatabaseQueryAction {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  join?: string;
}

export interface DatabaseQueryResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  rowCount?: number;
}

/**
 * UNRESTRICTED DATABASE QUERY FUNCTION
 *
 * The AI can query ANY table with ANY filters, joins, etc.
 * This gives complete visibility into the entire system.
 */
export async function executeDatabaseQuery(
  action: DatabaseQueryAction
): Promise<DatabaseQueryResult> {
  try {
    const supabase = createServiceClient();

    // Default select all if not specified
    const selectClause = action.select || '*';

    // Build the base query
    let query = supabase
      .from(action.table)
      .select(selectClause)
      .limit(action.limit || 50);

    // Apply filters if provided
    if (action.filters) {
      Object.entries(action.filters).forEach(([key, value]) => {
        // Check for comparison operators in key (e.g., "created_at__gte")
        if (key.includes('__')) {
          const [field, operator] = key.split('__');
          switch (operator) {
            case 'gt':
              query = query.gt(field, value);
              break;
            case 'gte':
              query = query.gte(field, value);
              break;
            case 'lt':
              query = query.lt(field, value);
              break;
            case 'lte':
              query = query.lte(field, value);
              break;
            case 'neq':
              query = query.neq(field, value);
              break;
            default:
              // Unknown operator, treat as exact match
              query = query.eq(key, value);
          }
        } else if (value === null) {
          query = query.is(key, null);
        } else if (typeof value === 'string' && value.startsWith('%') && value.endsWith('%')) {
          // Pattern matching
          query = query.ilike(key, value);
        } else if (Array.isArray(value)) {
          // IN clause
          query = query.in(key, value);
        } else {
          // Exact match
          query = query.eq(key, value);
        }
      });
    }

    // Apply ordering
    if (action.orderBy) {
      query = query.order(action.orderBy, { ascending: action.orderDirection === 'asc' });
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: error.message,
        message: `Database query failed: ${error.message}`,
      };
    }

    // Format a human-readable message
    const rowCount = data?.length || 0;
    let message = `Found ${rowCount} result${rowCount === 1 ? '' : 's'} in ${action.table}`;

    if (rowCount > 0 && rowCount < 5) {
      // Show some details for small result sets
      message += '\n\n' + JSON.stringify(data, null, 2);
    } else if (rowCount >= 5) {
      message += ' (showing summary)';
    }

    return {
      success: true,
      message,
      data,
      rowCount,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: `Database query error: ${error.message}`,
    };
  }
}

/**
 * Get comprehensive distributor data with ALL related information
 *
 * This fetches EVERYTHING about a distributor in one query:
 * - Personal details
 * - Team stats
 * - Commissions/earnings
 * - Orders/purchases
 * - Training progress
 * - Activity history
 * - Everything else
 */
export async function getCompleteDistributorData(
  distributorId: string
): Promise<DatabaseQueryResult> {
  try {
    const supabase = createServiceClient();

    // Get ALL distributor fields
    const { data: distributor, error: distError } = await supabase
      .from('distributors')
      .select('*')
      .eq('id', distributorId)
      .single();

    if (distError || !distributor) {
      return {
        success: false,
        error: distError?.message || 'Distributor not found',
        message: 'Could not find distributor',
      };
    }

    // Get ALL direct recruits (sponsor_id)
    const { data: directRecruits } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, email, rep_number, status, created_at')
      .eq('sponsor_id', distributorId)
      .neq('status', 'deleted');

    // Get ALL matrix children
    const { data: matrixChildren } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, rep_number, status')
      .eq('matrix_parent_id', distributorId)
      .neq('status', 'deleted');

    // Get sponsor info
    let sponsorInfo = null;
    if (distributor.sponsor_id) {
      const { data: sponsor } = await supabase
        .from('distributors')
        .select('id, first_name, last_name, rep_number, email')
        .eq('id', distributor.sponsor_id)
        .single();
      sponsorInfo = sponsor;
    }

    // Get prospects they created (may not exist)
    let prospects = [];
    try {
      const { data: prospectsData, error: prospectsError } = await supabase
        .from('prospects')
        .select('*')
        .eq('created_by', distributorId);

      if (!prospectsError && prospectsData) {
        prospects = prospectsData;
      }
    } catch (e) {
      // Table might not exist, ignore
      console.log('Prospects table query failed:', e);
    }

    // Get their commissions (may not exist)
    let commissions = [];
    try {
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('commissions')
        .select('*')
        .eq('distributor_id', distributorId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!commissionsError && commissionsData) {
        commissions = commissionsData;
      }
    } catch (e) {
      // Table might not exist, ignore
      console.log('Commissions table query failed:', e);
    }

    // Calculate stats
    const recruits = directRecruits || [];
    const teamStats = {
      total: recruits.length,
      active: recruits.filter(r => (r.status || 'active') === 'active').length,
      suspended: recruits.filter(r => r.status === 'suspended').length,
    };

    const matrixStats = {
      filled: (matrixChildren || []).length,
      empty: 5 - (matrixChildren || []).length,
      percentage: Math.round(((matrixChildren || []).length / 5) * 100),
    };

    const totalCommissions = commissions.reduce((sum: number, c: any) => sum + (c.amount || 0), 0);

    // Format comprehensive response
    const message = `**COMPLETE DATA FOR ${distributor.first_name} ${distributor.last_name}** (Rep #${distributor.rep_number})

📧 Email: ${distributor.email}
📞 Phone: ${distributor.phone || 'Not provided'}
📍 Address: ${distributor.address_line1 || 'N/A'}, ${distributor.city || 'N/A'}, ${distributor.state || 'N/A'} ${distributor.zip || ''}
🎯 Status: ${distributor.status || 'active'}
📅 Joined: ${new Date(distributor.created_at).toLocaleDateString()}
🆔 ID: ${distributor.id}
🔗 Slug: ${distributor.slug}
🏷️ Affiliate Code: ${distributor.affiliate_code}

**ORGANIZATION:**
👥 Direct Recruits: ${teamStats.total} (${teamStats.active} active, ${teamStats.suspended} suspended)
🌳 Matrix: ${matrixStats.filled}/5 positions filled (${matrixStats.percentage}%)
${sponsorInfo ? `👤 Sponsor: ${sponsorInfo.first_name} ${sponsorInfo.last_name} (Rep #${sponsorInfo.rep_number})` : '⚠️ No sponsor'}

**BANKING:**
🏦 Bank: ${distributor.bank_name || 'Not set up'}
${distributor.ach_verified ? '✅ ACH Verified' : '❌ ACH Not Verified'}

**COMMISSIONS:**
💰 Total Commissions: $${totalCommissions.toFixed(2)}
📊 Commission Records: ${commissions.length}

**PROSPECTS:**
📋 Prospects Created: ${prospects.length}

**ADMIN:**
${distributor.is_admin ? `🛡️ Admin Role: ${distributor.admin_role}` : '👤 Regular Distributor'}
${distributor.is_licensed_agent ? '📜 Licensed Agent' : ''}

**ONBOARDING:**
${distributor.onboarding_completed ? `✅ Completed on ${new Date(distributor.onboarding_completed_at).toLocaleDateString()}` : `📝 Step ${distributor.onboarding_step}/5`}
${distributor.profile_complete ? '✅ Profile Complete' : '❌ Profile Incomplete'}`;

    return {
      success: true,
      message,
      data: {
        distributor,
        sponsor: sponsorInfo,
        directRecruits: recruits,
        matrixChildren: matrixChildren || [],
        teamStats,
        matrixStats,
        prospects,
        commissions,
        totalCommissions,
      },
      rowCount: 1,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      message: `Failed to get complete distributor data: ${error.message}`,
    };
  }
}
