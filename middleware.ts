// =============================================
// Next.js Middleware
// Handles www redirects and auth session refresh
// =============================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // =============================================
  // WWW Redirect - Force non-www for consistency
  // =============================================
  // This fixes cookie issues where www.domain.com and domain.com
  // have separate cookie domains causing logout errors

  if (hostname.startsWith('www.')) {
    // Remove www and redirect
    url.host = hostname.replace('www.', '');
    return NextResponse.redirect(url, 301); // Permanent redirect
  }

  // =============================================
  // Refresh Supabase Auth Session
  // =============================================
  // This keeps the user's authentication tokens fresh
  return await updateSession(request);
}

// =============================================
// Middleware Configuration
// =============================================
// Specify which routes this middleware should run on

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
