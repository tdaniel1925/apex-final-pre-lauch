// =============================================
// Supabase Browser Client
// Use this in Client Components
// =============================================

import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for use in Client Components
 *
 * Usage:
 * ```tsx
 * 'use client'
 *
 * import { createClient } from '@/lib/supabase/client'
 *
 * export default function MyComponent() {
 *   const supabase = createClient()
 *   // Use supabase client...
 * }
 * ```
 */
export function createClient() {
  // Check if we're on production domain (NOT Vercel preview)
  const isActualProduction = typeof window !== 'undefined' &&
    window.location.hostname.includes('reachtheapex.net');

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') return undefined;
          const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`));
          return cookie ? cookie.split('=')[1] : undefined;
        },
        set(name: string, value: string, options: any) {
          if (typeof document === 'undefined') return;

          try {
            let cookie = `${name}=${value}; path=/`;

            // CRITICAL: Match server-side domain configuration
            if (isActualProduction) {
              cookie += '; domain=.reachtheapex.net';
            }

            if (options?.maxAge) {
              cookie += `; max-age=${options.maxAge}`;
            }

            // Use 'lax' to match server configuration
            cookie += `; samesite=${options?.sameSite || 'lax'}`;

            if (options?.secure !== false) {
              cookie += '; secure';
            }

            document.cookie = cookie;
          } catch (error) {
            // Log cookie setting failures for debugging
            console.error('[Supabase Client] Failed to set cookie:', name, error);
          }
        },
        remove(name: string, options: any) {
          if (typeof document === 'undefined') return;

          try {
            let cookie = `${name}=; path=/; max-age=0`;

            // CRITICAL: Match server-side domain configuration
            if (isActualProduction) {
              cookie += '; domain=.reachtheapex.net';
            }

            document.cookie = cookie;
          } catch (error) {
            console.error('[Supabase Client] Failed to remove cookie:', name, error);
          }
        },
      },
    }
  );
}
