// =============================================
// Next.js Middleware
// Refreshes Supabase auth session
// =============================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip auth refresh for static files, API routes, and ALL dashboard routes
  const isStaticFile = request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp)$/);
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
  const isNextInternal = request.nextUrl.pathname.startsWith('/_next/');
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

  // Dashboard routes handle auth server-side in their page components
  // This prevents the race condition: middleware auth + server component auth = concurrent token refresh
  if (isStaticFile || isApiRoute || isNextInternal || isDashboard) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request,
  });

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
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // ONLY check auth for admin/finance routes
    // DO NOT call getUser() for other routes - let server components handle their own auth

    // Protect finance routes - CFO/Admin only
    if (request.nextUrl.pathname.startsWith('/finance')) {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!user || authError) {
        console.log('Finance route: No user or auth error, redirecting to login');
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!user || authError) {
        console.log('Admin route: No user or auth error, redirecting to login');
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Check if user is in admins table (takes precedence)
      const { data: adminRecord, error: adminError } = await supabase
        .from('admins')
        .select('id, role')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      // If user is in admins table, grant access
      if (adminRecord) {
        console.log('Admin route: Access granted via admins table', {
          email: user.email,
          role: adminRecord.role,
        });
        // Allow through
      } else {
        // Fall back to checking is_admin in distributors table
        const { data: distributor, error: roleError } = await supabase
          .from('distributors')
          .select('is_admin')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        console.log('Admin check:', {
          email: user.email,
          distributor,
          roleError: roleError?.message,
          isAdmin: distributor?.is_admin,
        });

        if (!distributor || !distributor.is_admin) {
          console.log('Admin route: Not admin, redirecting to dashboard');
          // Unauthorized - redirect to dashboard
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }

        console.log('Admin route: Access granted via distributors table');
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
