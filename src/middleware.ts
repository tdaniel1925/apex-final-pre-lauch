// =============================================
// Next.js Middleware
// Refreshes Supabase auth session
// =============================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Skip auth refresh for static files and API routes
  const isStaticFile = request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp)$/);
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
  const isNextInternal = request.nextUrl.pathname.startsWith('/_next/');

  if (isStaticFile || isApiRoute || isNextInternal) {
    return response;
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // Refresh session and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // Protect finance routes - CFO/Admin only
    if (request.nextUrl.pathname.startsWith('/finance')) {
      if (!user || authError) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Check is_admin in distributors table
      const { data: distributor, error: roleError } = await supabase
        .from('distributors')
        .select('is_admin, admin_role')
        .eq('email', user.email)
        .single();

      if (roleError || !distributor || (!distributor.is_admin && !['cfo', 'admin'].includes(distributor.admin_role))) {
        // Unauthorized - redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!user || authError) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Check is_admin in distributors table
      const { data: distributor, error: roleError } = await supabase
        .from('distributors')
        .select('is_admin')
        .eq('email', user.email)
        .single();

      if (roleError || !distributor || !distributor.is_admin) {
        // Unauthorized - redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  } catch (error) {
    // If middleware fails, continue without auth refresh
    console.error('Middleware error:', error);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/webpack-hmr|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
