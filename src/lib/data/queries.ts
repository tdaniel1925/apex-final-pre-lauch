/**
 * Centralized Query Pattern Library
 *
 * SINGLE SOURCE OF TRUTH for all database queries.
 * All pages MUST use these functions to ensure consistency.
 *
 * CRITICAL RULES:
 * 1. Enrollment tree uses distributors.sponsor_id (NOT members.enroller_id)
 * 2. Live BV/credits from members table (NOT cached distributors fields)
 * 3. Only payment_status='paid' orders count for revenue
 * 4. Only status='active' subscriptions count for recurring
 *
 * Created: April 2, 2026
 * Ref: SINGLE-SOURCE-OF-TRUTH-AUDIT-REPORT.md
 */

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

// =============================================
// DISTRIBUTOR & MEMBER QUERIES
// =============================================

/**
 * Get distributor with live member data
 *
 * ALWAYS use this for current stats - uses members table for authoritative data.
 *
 * Returns:
 * - Distributor record (id, name, email, slug, etc.)
 * - Live member data (personal_credits_monthly, team_credits_monthly, tech_rank, etc.)
 *
 * @param distributorId - Distributor UUID
 * @returns Distributor with nested member object
 */
export async function getDistributorWithMember(distributorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('distributors')
    .select(`
      *,
      member:members!members_distributor_id_fkey (
        member_id,
        personal_credits_monthly,
        team_credits_monthly,
        tech_rank,
        highest_tech_rank,
        override_qualified,
        enrollment_date,
        tech_rank_achieved_date
      )
    `)
    .eq('id', distributorId)
    .single();

  return { data, error };
}

/**
 * Get distributor by auth user ID
 *
 * Use for authenticated user lookups.
 *
 * @param authUserId - Supabase auth user UUID
 * @returns Distributor with member data
 */
export async function getDistributorByAuthId(authUserId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('distributors')
    .select(`
      *,
      member:members!members_distributor_id_fkey (
        member_id,
        personal_credits_monthly,
        team_credits_monthly,
        tech_rank,
        highest_tech_rank,
        override_qualified,
        enrollment_date
      )
    `)
    .eq('auth_user_id', authUserId)
    .single();

  return { data, error };
}

// =============================================
// TEAM & ENROLLMENT QUERIES
// =============================================

/**
 * Get team members (L1 direct enrollees)
 *
 * CRITICAL: Uses sponsor_id (enrollment tree) - CORRECT!
 * This is the proper way to get "your team" for team page display.
 *
 * @param sponsorId - Distributor UUID of sponsor
 * @returns Array of team members with stats
 */
export async function getTeamMembers(sponsorId: string) {
  const serviceClient = createServiceClient();

  const { data, error } = await serviceClient
    .from('distributors')
    .select(`
      id,
      first_name,
      last_name,
      email,
      slug,
      rep_number,
      status,
      created_at,
      member:members!members_distributor_id_fkey (
        member_id,
        tech_rank,
        personal_credits_monthly,
        team_credits_monthly,
        enrollment_date,
        override_qualified
      )
    `)
    .eq('sponsor_id', sponsorId)  // Enrollment tree - CORRECT!
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Get all downline members (recursive enrollment tree)
 *
 * WARNING: This can be expensive for large organizations.
 * Use with caution and implement pagination if needed.
 *
 * @param sponsorId - Root sponsor distributor UUID
 * @param maxDepth - Maximum depth to traverse (default: 10)
 * @returns Array of all downline members
 */
export async function getAllDownline(sponsorId: string, maxDepth: number = 10) {
  const serviceClient = createServiceClient();

  // Recursive CTE to get all downline
  const { data, error } = await serviceClient.rpc('get_downline_recursive', {
    p_sponsor_id: sponsorId,
    p_max_depth: maxDepth
  });

  return { data, error };
}

// =============================================
// EARNINGS & COMMISSIONS QUERIES
// =============================================

/**
 * Get monthly earnings for member
 *
 * Uses earnings_ledger (authoritative source).
 * Only returns approved/paid earnings.
 *
 * @param memberId - Member UUID
 * @param monthYear - Format: 'YYYY-MM' (e.g., '2026-04')
 * @returns Array of earnings records
 */
export async function getMonthlyEarnings(memberId: string, monthYear: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('earnings_ledger')
    .select('*')
    .eq('member_id', memberId)
    .eq('month_year', monthYear)
    .in('status', ['approved', 'paid'])  // Only count finalized earnings
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Get total earnings for member (all time)
 *
 * @param memberId - Member UUID
 * @param status - Filter by status (default: approved + paid)
 * @returns Total earnings in USD
 */
export async function getTotalEarnings(
  memberId: string,
  status: ('pending' | 'approved' | 'paid')[] = ['approved', 'paid']
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('earnings_ledger')
    .select('amount_usd')
    .eq('member_id', memberId)
    .in('status', status);

  if (error || !data) {
    return { total: 0, error };
  }

  const total = data.reduce((sum, row) => sum + (row.amount_usd || 0), 0);
  return { total, error: null };
}

/**
 * Get pending earnings for member
 *
 * Shows earnings awaiting approval/payment.
 *
 * @param memberId - Member UUID
 * @returns Array of pending earnings
 */
export async function getPendingEarnings(memberId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('earnings_ledger')
    .select('*')
    .eq('member_id', memberId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return { data, error };
}

// =============================================
// SALES & ORDERS QUERIES
// =============================================

/**
 * Get paid orders for member (sales)
 *
 * CRITICAL: Only counts payment_status='paid'!
 *
 * @param distributorId - Distributor UUID (seller)
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 * @returns Array of paid orders
 */
export async function getMemberSales(
  distributorId: string,
  startDate?: Date,
  endDate?: Date
) {
  const supabase = await createClient();

  let query = supabase
    .from('orders')
    .select(`
      id,
      order_number,
      total_cents,
      total_bv,
      payment_status,
      created_at,
      customer:customers (
        email,
        first_name,
        last_name
      ),
      items:order_items (
        product_name,
        quantity,
        total_price_cents,
        bv_amount
      )
    `)
    .eq('distributor_id', distributorId)
    .eq('payment_status', 'paid')  // ONLY count paid orders!
    .order('created_at', { ascending: false });

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }

  if (endDate) {
    query = query.lte('created_at', endDate.toISOString());
  }

  const { data, error } = await query;
  return { data, error };
}

/**
 * Get sales totals for member
 *
 * Returns aggregated totals (revenue, BV, order count).
 *
 * @param distributorId - Distributor UUID
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 * @returns Sales totals
 */
export async function getSalesTotals(
  distributorId: string,
  startDate?: Date,
  endDate?: Date
) {
  const { data, error } = await getMemberSales(distributorId, startDate, endDate);

  if (error || !data) {
    return {
      totalRevenueCents: 0,
      totalBV: 0,
      orderCount: 0,
      error
    };
  }

  const totals = data.reduce(
    (acc, order) => ({
      totalRevenueCents: acc.totalRevenueCents + (order.total_cents || 0),
      totalBV: acc.totalBV + (order.total_bv || 0),
      orderCount: acc.orderCount + 1
    }),
    { totalRevenueCents: 0, totalBV: 0, orderCount: 0 }
  );

  return { ...totals, error: null };
}

/**
 * Get sales this month for member
 *
 * Convenience function for current month sales.
 *
 * @param distributorId - Distributor UUID
 * @returns Current month sales data
 */
export async function getSalesThisMonth(distributorId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return getSalesTotals(distributorId, startOfMonth, endOfMonth);
}

// =============================================
// PRODUCT QUERIES
// =============================================

/**
 * Get all active products
 *
 * Returns products with pricing and credits.
 *
 * @returns Array of active products
 */
export async function getActiveProducts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return { data, error };
}

/**
 * Get product by slug
 *
 * @param slug - Product slug (e.g., 'custom-business-center')
 * @returns Product record
 */
export async function getProductBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  return { data, error };
}

// =============================================
// SUBSCRIPTION QUERIES
// =============================================

/**
 * Get active subscriptions for member
 *
 * CRITICAL: Only returns status='active'!
 *
 * @param distributorId - Distributor UUID
 * @returns Array of active subscriptions
 */
export async function getActiveSubscriptions(distributorId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      product:products (
        name,
        slug,
        member_credits
      )
    `)
    .eq('distributor_id', distributorId)
    .eq('status', 'active')  // Only active subscriptions count!
    .order('created_at', { ascending: false });

  return { data, error };
}

// =============================================
// RANK & QUALIFICATION QUERIES
// =============================================

/**
 * Get rank requirements
 *
 * Returns rank qualification requirements from config.
 *
 * @param rank - Tech rank name
 * @returns Rank requirements
 */
export async function getRankRequirements(rank: string) {
  const { TECH_RANK_REQUIREMENTS } = await import('@/lib/compensation/config');
  return TECH_RANK_REQUIREMENTS.find((r) => r.name === rank.toLowerCase());
}

/**
 * Check if member qualifies for rank
 *
 * @param memberId - Member UUID
 * @param targetRank - Rank to check (e.g., 'gold')
 * @returns Qualification status with details
 */
export async function checkRankQualification(memberId: string, targetRank: string) {
  const supabase = await createClient();

  // Get member data
  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('personal_credits_monthly, team_credits_monthly')
    .eq('member_id', memberId)
    .single();

  if (memberError || !member) {
    return {
      qualified: false,
      reason: 'Member not found',
      error: memberError
    };
  }

  // Get rank requirements
  const rankReq = await getRankRequirements(targetRank);
  if (!rankReq) {
    return {
      qualified: false,
      reason: 'Invalid rank',
      error: null
    };
  }

  const meetsPersonal = member.personal_credits_monthly >= rankReq.personal;
  const meetsTeam = member.team_credits_monthly >= rankReq.group;

  return {
    qualified: meetsPersonal && meetsTeam,
    meetsPersonal,
    meetsTeam,
    personalCredits: member.personal_credits_monthly,
    teamCredits: member.team_credits_monthly,
    personalRequired: rankReq.personal,
    teamRequired: rankReq.group,
    error: null
  };
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Get current month-year string
 *
 * @returns Format: 'YYYY-MM' (e.g., '2026-04')
 */
export function getCurrentMonthYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get start of current month
 *
 * @returns Date object (first day of month, 00:00:00)
 */
export function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Get end of current month
 *
 * @returns Date object (last day of month, 23:59:59)
 */
export function getEndOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}
