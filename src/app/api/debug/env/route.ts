// Debug endpoint to check environment variables on Vercel
// DELETE THIS FILE after debugging!

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET',
    HAS_RESEND_API_KEY: process.env.RESEND_API_KEY ? 'YES' : 'NO',
    HAS_SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'YES' : 'NO',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV || 'NOT ON VERCEL',
    VERCEL_URL: process.env.VERCEL_URL || 'NOT ON VERCEL',
  });
}
