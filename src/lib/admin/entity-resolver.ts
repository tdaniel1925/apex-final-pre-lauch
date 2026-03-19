// =============================================
// Entity Resolver Service
// Resolves natural language identifiers to database entities
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import type { Distributor } from '@/lib/types';

export interface ResolvedDistributor {
  id: string;
  rep_number: number;
  first_name: string;
  last_name: string;
  email: string;
  slug: string;
  status: string;
  auth_user_id?: string;
}

export interface ResolutionResult {
  success: boolean;
  distributor?: ResolvedDistributor;
  matches?: ResolvedDistributor[];
  error?: string;
}

/**
 * Resolve a distributor by various identifiers
 * Supports: name, email, rep number, slug
 */
export async function resolveDistributor(identifier: string): Promise<ResolutionResult> {
  const supabase = createServiceClient();

  // Clean up the identifier
  const cleaned = identifier.trim().toLowerCase();

  // Try parsing as rep number first (e.g., "1234" or "rep #1234")
  const repNumberMatch = cleaned.match(/(?:rep\s*#?\s*)?(\d+)/);
  if (repNumberMatch) {
    const repNumber = parseInt(repNumberMatch[1]);
    const { data, error } = await supabase
      .from('distributors')
      .select('id, rep_number, first_name, last_name, email, slug, status, auth_user_id')
      .eq('rep_number', repNumber)
      .single();

    if (data) {
      return {
        success: true,
        distributor: data as ResolvedDistributor,
      };
    }
  }

  // Try email match
  if (cleaned.includes('@')) {
    const { data, error } = await supabase
      .from('distributors')
      .select('id, rep_number, first_name, last_name, email, slug, status, auth_user_id')
      .eq('email', cleaned)
      .single();

    if (data) {
      return {
        success: true,
        distributor: data as ResolvedDistributor,
      };
    }
  }

  // Try slug match
  const slugCleaned = cleaned.replace(/[@\s]/g, '');
  const { data: slugMatch, error: slugError } = await supabase
    .from('distributors')
    .select('id, rep_number, first_name, last_name, email, slug, status, auth_user_id')
    .eq('slug', slugCleaned)
    .single();

  if (slugMatch) {
    return {
      success: true,
      distributor: slugMatch as ResolvedDistributor,
    };
  }

  // Try name search - first name, last name, or full name
  // Using broader matching to handle typos
  const nameParts = cleaned.split(/\s+/).filter(p => p.length > 0);

  let query = supabase
    .from('distributors')
    .select('id, rep_number, first_name, last_name, email, slug, status, auth_user_id')
    .neq('status', 'deleted')
    .limit(20); // Get more results for fuzzy matching

  if (nameParts.length === 1) {
    // Single name - could be first or last
    // Use broader matching (starts with OR contains)
    const term = nameParts[0];
    query = query.or(
      `first_name.ilike.${term}%,` +  // Starts with
      `last_name.ilike.${term}%,` +   // Starts with
      `first_name.ilike.%${term}%,` + // Contains
      `last_name.ilike.%${term}%`     // Contains
    );
  } else if (nameParts.length >= 2) {
    // Full name - match first and last parts
    const [first, ...lastParts] = nameParts;
    const last = lastParts.join(' ');

    // Try exact pattern first, then broader patterns
    query = query.or(
      `and(first_name.ilike.${first}%,last_name.ilike.${last}%),` +      // Both start with
      `and(first_name.ilike.%${first}%,last_name.ilike.%${last}%)`       // Both contain
    );
  }

  const { data: nameMatches } = await query;

  if (!nameMatches || nameMatches.length === 0) {
    return {
      success: false,
      error: `Could not find distributor "${identifier}"`,
    };
  }

  if (nameMatches.length === 1) {
    return {
      success: true,
      distributor: nameMatches[0] as ResolvedDistributor,
    };
  }

  // Multiple matches - return them for clarification
  return {
    success: false,
    matches: nameMatches as ResolvedDistributor[],
    error: `Found ${nameMatches.length} distributors matching "${identifier}". Please be more specific.`,
  };
}

/**
 * Resolve a sponsor (same as distributor, just semantic alias)
 */
export async function resolveSponsor(identifier: string): Promise<ResolutionResult> {
  return resolveDistributor(identifier);
}

/**
 * Format distributor for display
 */
export function formatDistributor(dist: ResolvedDistributor): string {
  return `${dist.first_name} ${dist.last_name} (Rep #${dist.rep_number}, ${dist.email})`;
}

/**
 * Validate if distributor can be a sponsor (active status, etc.)
 */
export function canBeSponsor(dist: ResolvedDistributor): { valid: boolean; reason?: string } {
  if (dist.status === 'deleted') {
    return { valid: false, reason: 'This distributor has been deleted' };
  }

  if (dist.status === 'suspended') {
    return { valid: false, reason: 'This distributor is suspended' };
  }

  return { valid: true };
}
