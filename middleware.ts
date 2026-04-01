// =============================================
// Next.js Middleware
// Handles www redirects, referral tracking, and auth session refresh
// =============================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Reserved routes that should NOT trigger referral tracking
const RESERVED_SLUGS = [
  'api',
  'admin',
  'dashboard',
  'login',
  'signup',
  'join',
  'about',
  'contact',
  'terms',
  'privacy',
  'live',
  'products',
  '_next',
  'favicon.ico',
];

const REFERRER_COOKIE_NAME = 'apex_referrer_slug';
const REFERRER_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

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
  // Referral Tracking - Set cookie for /{slug} visits
  // =============================================
  const pathname = request.nextUrl.pathname;
  const pathSegments = pathname.split('/').filter(Boolean);

  // Check if this is a /{slug} or /{slug}/* route (not a reserved route)
  if (pathSegments.length >= 1 && !RESERVED_SLUGS.includes(pathSegments[0].toLowerCase())) {
    const slug = pathSegments[0].toLowerCase();

    // Only set the cookie if it's not already set to avoid unnecessary overhead
    const existingCookie = request.cookies.get(REFERRER_COOKIE_NAME);

    if (!existingCookie || existingCookie.value !== slug) {
      // Set the referral cookie
      // Note: We don't validate the slug here for performance - validation happens on checkout
      const response = await updateSession(request);
      response.cookies.set(REFERRER_COOKIE_NAME, slug, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: REFERRER_COOKIE_MAX_AGE,
        path: '/',
      });
      return response;
    }
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
