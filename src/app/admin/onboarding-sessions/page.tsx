// =============================================
// Admin Onboarding Sessions
// View and manage all customer onboarding bookings
// =============================================

import { requireAdmin } from '@/lib/auth/admin';
import { createServiceClient } from '@/lib/supabase/service';

export const metadata = {
  title: 'Onboarding Sessions - Admin',
};

export const revalidate = 30; // Refresh every 30 seconds

export default async function OnboardingSessionsPage() {
  await requireAdmin();
  const supabase = createServiceClient();

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

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Upcoming Sessions</h2>
        </div>

        {upcomingSessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No upcoming sessions scheduled
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rep</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingSessions.map((session) => {
                  const dateObj = new Date(session.scheduled_date + 'T' + session.scheduled_time);
                  const customer = session.customer;
                  const rep = session.rep;
                  const products = session.products_purchased || [];

                  return (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {dateObj.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {dateObj.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            timeZone: 'America/Chicago',
                          })} CT
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {session.customer_name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.customer_email}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {rep && (
                          <div className="text-sm text-gray-900">
                            {rep.first_name} {rep.last_name}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {Array.isArray(products) && products.length > 0
                            ? products.map((p: any) => p.product_name).join(', ')
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            session.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {session.customer_email && (
                          <a
                            href={`mailto:${session.customer_email}`}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                          >
                            Email
                          </a>
                        )}
                        {session.customer_phone && (
                          <a
                            href={`tel:${session.customer_phone}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Call
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Completed Sessions */}
      {completedSessions.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Completed Sessions</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rep</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedSessions.slice(0, 10).map((session) => {
                  const dateObj = new Date(session.scheduled_date + 'T' + session.scheduled_time);
                  const rep = session.rep;

                  return (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {dateObj.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {session.customer_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {rep && `${rep.first_name} ${rep.last_name}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {session.completed_notes || 'No notes'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
