'use server';

// =============================================
// Rep Services Actions
// Server actions for setting rep attribution
// =============================================

import { cookies } from 'next/headers';

export async function setRepAttribution(slug: string) {
  const cookieStore = await cookies();
  cookieStore.set('rep_attribution', slug, {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}
