// =============================================
// Admin Onboarding Sessions
// View and manage all customer onboarding bookings
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';
import { createClient } from '@/lib/supabase/server';
import OnboardingSessionsClient from '@/components/admin/OnboardingSessionsClient';

export const metadata = {
  title: 'Onboarding Sessions - Admin',
};

export const revalidate = 30; // Refresh every 30 seconds

export default async function OnboardingSessionsPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const authSupabase = await createClient();

  // Get current user ID for notes ownership
  const { data: { user } } = await authSupabase.auth.getUser();
  const currentUserId = user?.id || '';

  // Get all onboarding sessions with related data
  const { data: sessions, error } = await supabase
    .from('onboarding_sessions')
    .select(`
      *,
      customer:customers(
        first_name,
        last_name,
        email,
        phone
      ),
      rep:distributors!onboarding_sessions_rep_distributor_id_fkey(
        first_name,
        last_name,
        slug
      )
    `)
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time', { ascending: true });

  if (error) {
    console.error('Error loading onboarding sessions:', error);
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Onboarding Sessions</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load onboarding sessions. Please try again.
        </div>
      </div>
    );
  }

  // Group sessions by status
  const upcomingSessions = sessions?.filter(
    (s) => s.status === 'scheduled' || s.status === 'confirmed'
  ) || [];
  const completedSessions = sessions?.filter((s) => s.status === 'completed') || [];
  const cancelledSessions = sessions?.filter((s) => s.status === 'cancelled' || s.status === 'no_show') || [];

  return (
    <div className="p-4 lg:p-8 pt-16 lg:pt-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Onboarding Sessions</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage customer onboarding appointments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-3xl font-bold text-blue-600">{upcomingSessions.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedSessions.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-3xl font-bold text-red-600">{cancelledSessions.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Client Component with Interactive Features */}
      <OnboardingSessionsClient
        upcomingSessions={upcomingSessions}
        completedSessions={completedSessions}
        currentUserId={currentUserId}
      />
    </div>
  );
}
