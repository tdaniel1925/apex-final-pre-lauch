// =============================================
// Debug Page - Check Auth State
// =============================================

import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export default async function DebugPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Get user
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get all cookies
  const allCookies = cookieStore.getAll();
  const supabaseCookies = allCookies.filter((c) =>
    c.name.includes('supabase') || c.name.includes('sb-')
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Auth Debug Info</h1>

        {/* User Info */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">User</h2>
          {user ? (
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          ) : (
            <p className="text-red-600">No user found</p>
          )}
          {error && (
            <p className="text-red-600 mt-2">Error: {error.message}</p>
          )}
        </div>

        {/* Session Info */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Session</h2>
          {session ? (
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(
                {
                  access_token: session.access_token.substring(0, 20) + '...',
                  refresh_token: session.refresh_token?.substring(0, 20) + '...',
                  expires_at: session.expires_at,
                  expires_in: session.expires_in,
                  user: session.user.email,
                },
                null,
                2
              )}
            </pre>
          ) : (
            <p className="text-red-600">No session found</p>
          )}
        </div>

        {/* Cookies */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Supabase Cookies ({supabaseCookies.length})
          </h2>
          {supabaseCookies.length > 0 ? (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(
                supabaseCookies.map((c) => ({
                  name: c.name,
                  value: c.value.substring(0, 30) + '...',
                })),
                null,
                2
              )}
            </pre>
          ) : (
            <p className="text-red-600">No Supabase cookies found</p>
          )}
        </div>

        {/* All Cookies */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            All Cookies ({allCookies.length})
          </h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(
              allCookies.map((c) => c.name),
              null,
              2
            )}
          </pre>
        </div>

        <div className="mt-8 flex gap-4">
          <a
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </a>
          <a
            href="/dashboard"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
