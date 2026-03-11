// =============================================
// Finance Authentication & Authorization
// Protects finance routes (CFO and Admin access only)
// =============================================

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { redirect } from 'next/navigation';

export type FinanceRole = 'cfo' | 'admin';

export interface Distributor {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
}

export interface FinanceContext {
  user: {
    id: string;
    email: string;
  };
  distributor: Distributor;
}

/**
 * Requires CFO or Admin authentication for a finance route
 * Redirects to login if not authenticated
 * Redirects to dashboard if not CFO/Admin
 * Returns finance context with user and distributor info
 */
export async function requireFinanceAccess(): Promise<FinanceContext> {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is CFO or Admin (use service client to bypass RLS)
  const serviceClient = createServiceClient();
  const { data: distributor, error } = await serviceClient
    .from('distributors')
    .select('id, email, first_name, last_name, role, status')
    .eq('email', user.email)
    .single();

  // If no distributor record or not authorized, redirect to dashboard
  if (error || !distributor || !['cfo', 'admin'].includes(distributor.role)) {
    console.warn('Finance access denied:', {
      email: user.email,
      role: distributor?.role,
      error: error?.message,
    });
    redirect('/dashboard');
  }

  return {
    user: {
      id: user.id,
      email: user.email!,
    },
    distributor: distributor as Distributor,
  };
}

/**
 * Gets CFO/Admin user without redirect (for API routes)
 * Returns null if user is not authenticated or not CFO/Admin
 */
export async function getFinanceUser(): Promise<FinanceContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const serviceClient = createServiceClient();
  const { data: distributor, error } = await serviceClient
    .from('distributors')
    .select('id, email, first_name, last_name, role, status')
    .eq('email', user.email)
    .single();

  if (error || !distributor || !['cfo', 'admin'].includes(distributor.role)) {
    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email!,
    },
    distributor: distributor as Distributor,
  };
}

/**
 * Checks if distributor has CFO role specifically
 */
export function isCFO(distributor: Distributor): boolean {
  return distributor.role === 'cfo';
}

/**
 * Checks if distributor has either CFO or Admin role
 */
export function hasFinanceAccess(distributor: Distributor): boolean {
  return ['cfo', 'admin'].includes(distributor.role);
}
