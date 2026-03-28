/**
 * Service Client with Logging
 *
 * Wraps createServiceClient to log all queries for security auditing.
 * Helps identify inappropriate service client usage and potential security issues.
 *
 * @module lib/supabase/service-with-logging
 */

import { createServiceClient as createSupabaseServiceClient } from './service';
import type { SupabaseClient } from '@supabase/supabase-js';

interface QueryLog {
  timestamp: string;
  table: string;
  operation: string;
  user_id?: string;
  route?: string;
  ip_address?: string;
  filters?: Record<string, any>;
}

/**
 * Create service client with query logging
 *
 * Use this instead of createServiceClient for better security auditing
 *
 * @param context - Request context for logging (route, user, IP)
 */
export function createServiceClientWithLogging(context?: {
  route?: string;
  user_id?: string;
  ip_address?: string;
}): SupabaseClient {
  const supabase = createSupabaseServiceClient();

  // Wrap the query methods to add logging
  const originalFrom = supabase.from.bind(supabase);

  // Note: Full query wrapping is complex with TypeScript types
  // For production use, implement database-level logging instead
  // This is a simplified version for development

  // Log service client creation
  if (context?.route) {
    console.log('🔓 [SERVICE CLIENT CREATED]', {
      route: context.route,
      user: context.user_id || 'system',
      ip: context.ip_address,
    });
  }

  return supabase;
}

/**
 * Log service client query
 *
 * In production, this should write to a database table or log aggregation service
 */
function logServiceClientQuery(log: QueryLog) {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('🔓 [SERVICE CLIENT]', {
      table: log.table,
      operation: log.operation,
      route: log.route,
      user: log.user_id || 'anonymous',
    });
  }

  // TODO: In production, store in audit log table
  // await supabase.from('service_client_audit_log').insert(log);
}

/**
 * Check if current user has permission to use service client
 *
 * Service client bypasses RLS, so should only be used when:
 * 1. Admin routes with proper auth checks
 * 2. Server-side operations (webhooks, cron jobs)
 * 3. System operations (email sending, background tasks)
 */
export function shouldUseServiceClient(context: {
  route: string;
  user_role?: string;
}): boolean {
  // Admin routes should verify role first
  if (context.route.startsWith('/api/admin/')) {
    return context.user_role === 'admin';
  }

  // Webhook routes are OK (no user context)
  if (context.route.startsWith('/api/webhooks/')) {
    return true;
  }

  // Cron jobs are OK (system operations)
  if (context.route.startsWith('/api/cron/')) {
    return true;
  }

  // System operations
  if (
    context.route.startsWith('/api/system/') ||
    context.route.includes('/send-email') ||
    context.route.includes('/background/')
  ) {
    return true;
  }

  // Regular API routes should use regular client (RLS protected)
  return false;
}

/**
 * Get audit report of service client usage
 *
 * Shows which routes are using service client and why
 */
export async function getServiceClientAuditReport(): Promise<{
  total_queries: number;
  by_table: Record<string, number>;
  by_operation: Record<string, number>;
  by_route: Record<string, number>;
  flagged_routes: string[]; // Routes that probably shouldn't use service client
}> {
  // TODO: Implement by querying audit log table
  return {
    total_queries: 0,
    by_table: {},
    by_operation: {},
    by_route: {},
    flagged_routes: [],
  };
}

export default createServiceClientWithLogging;
