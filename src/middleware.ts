// =============================================
// Next.js Middleware
// Refreshes Supabase auth session on every request
// =============================================

import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest } from 'next/server';

/**
 * Middleware runs before every request
 * This ensures auth tokens are refreshed automatically
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

/**
 * Configure which routes use middleware
 * Match all routes except static files and Next.js internals
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
