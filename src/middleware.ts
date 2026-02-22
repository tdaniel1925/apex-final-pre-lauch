// =============================================
// Next.js Middleware - DISABLED
// Issue: www vs non-www redirect loop in Vercel
// Temporarily disabled until domain config is fixed
// =============================================

import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Completely bypass middleware to fix redirect loop
  return NextResponse.next();
}

export const config = {
  // Disable middleware on all routes temporarily
  matcher: [],
};
