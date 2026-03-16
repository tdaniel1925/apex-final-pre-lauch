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
      .select('id, rep_number, first_name, last_name, email, slug, status')
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
      .select('id, rep_number, first_name, last_name, email, slug, status')
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
    .select('id, rep_number, first_name, last_name, email, slug, status')
    .eq('slug', slugCleaned)
    .single();

  if (slugMatch) {
    return {
      success: true,
      distributor: slugMatch as ResolvedDistributor,
    };
  }

  // Try name search - first name, last name, or full name
  const nameParts = cleaned.split(/\s+/);

  let query = supabase
    .from('distributors')
    .select('id, rep_number, first_name, last_name, email, slug, status')
    .neq('status', 'deleted')
    .limit(10);

  if (nameParts.length === 1) {
    // Single name - could be first or last
    query = query.or(`first_name.ilike.%${nameParts[0]}%,last_name.ilike.%${nameParts[0]}%`);
  } else if (nameParts.length === 2) {
    // Full name
    const [first, last] = nameParts;
    query = query
      .ilike('first_name', `%${first}%`)
      .ilike('last_name', `%${last}%`);
  } else if (nameParts.length > 2) {
    // Try first word as first name, rest as last name
    const first = nameParts[0];
    const last = nameParts.slice(1).join(' ');
    query = query
      .ilike('first_name', `%${first}%`)
      .ilike('last_name', `%${last}%`);
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
