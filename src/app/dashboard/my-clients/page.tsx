// =============================================
// Rep Dashboard: My Clients
// View client onboarding sessions and fulfillment status
// =============================================

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Calendar, Clock, User, Mail, Phone, Package, Video, TrendingUp } from 'lucide-react';

const STAGE_LABELS: Record<string, string> = {
  service_payment_made: 'Payment Made',
  onboarding_date_set: 'Onboarding Scheduled',
  onboarding_complete: 'Onboarding Complete',
  pages_being_built: 'Building Pages',
  social_media_proofs: 'Creating Proofs',
  content_approved: 'Content Approved',
  campaigns_launched: 'Campaigns Live',
  service_completed: 'Completed',
};

export default async function MyClientsPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor record
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, first_name, last_name')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="text-slate-600">You must be a distributor to access this page.</p>
        </div>
      </div>
    );
  }

  // Get fulfillment records for this rep
  const { data: fulfillmentRecords, error: fulfillmentError } = await supabase
    .from('fulfillment_kanban')
    .select(`
      *,
      onboarding:client_onboarding(
        id,
        onboarding_date,
        meeting_link,
        completed,
        no_show
      )
    `)
    .eq('distributor_id', distributor.id)
    .order('created_at', { ascending: false });

  if (fulfillmentError) {
    console.error('Error fetching fulfillment records:', fulfillmentError);
  }

  // Get all onboarding sessions for this rep (legacy)
  const { data: sessions, error } = await supabase
    .from('onboarding_sessions')
    .select('*')
    .eq('rep_distributor_id', distributor.id)
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time', { ascending: true });

  if (error) {
    console.error('Error fetching onboarding sessions:', error);
  }

  // Separate into upcoming and past sessions
  const now = new Date();
  const upcoming = sessions?.filter((s) => {
    const sessionDate = new Date(`${s.scheduled_date}T${s.scheduled_time}`);
    return sessionDate >= now && s.status !== 'completed' && s.status !== 'cancelled';
  }) || [];

  const past = sessions?.filter((s) => {
    const sessionDate = new Date(`${s.scheduled_date}T${s.scheduled_time}`);
    return sessionDate < now || s.status === 'completed' || s.status === 'cancelled';
  }) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-[#2B4C7E] rounded-xl flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Clients</h1>
              <p className="text-slate-600">
                Track your clients through onboarding and fulfillment
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Active Clients</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {fulfillmentRecords?.filter((r) => r.stage !== 'service_completed').length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {fulfillmentRecords?.filter((r) => r.stage === 'service_completed').length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Upcoming Sessions</p>
                  <p className="text-2xl font-bold text-slate-900">{upcoming.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Total Clients</p>
                  <p className="text-2xl font-bold text-slate-900">{fulfillmentRecords?.length || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Client Fulfillment Table */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Client Fulfillment Status
          </h2>

          {!fulfillmentRecords || fulfillmentRecords.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-slate-200 p-12 text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-lg text-slate-600">No clients yet</p>
              <p className="text-sm text-slate-500 mt-2">
                When customers purchase products, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Client
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Current Stage
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Last Updated
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {fulfillmentRecords.map((record) => (
                      <FulfillmentRow key={record.id} record={record} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Upcoming Onboarding Sessions ({upcoming.length})
          </h2>

          {upcoming.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-slate-200 p-12 text-center">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-lg text-slate-600">No upcoming sessions scheduled</p>
              <p className="text-sm text-slate-500 mt-2">
                Sessions will appear here when clients book their onboarding.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {upcoming.map((session) => (
                <SessionCard key={session.id} session={session} isUpcoming={true} />
              ))}
            </div>
          )}
        </div>

        {/* Past Sessions */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Past Sessions ({past.length})
          </h2>

          {past.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-slate-200 p-12 text-center">
              <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-lg text-slate-600">No past sessions</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {past.slice(0, 10).map((session) => (
                <SessionCard key={session.id} session={session} isUpcoming={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Fulfillment Row Component
function FulfillmentRow({ record }: { record: any }) {
  const stageLabel = STAGE_LABELS[record.stage] || record.stage;

  // Determine badge color based on stage
  const stageBadgeColors: Record<string, string> = {
    service_payment_made: 'bg-blue-100 text-blue-700',
    onboarding_date_set: 'bg-purple-100 text-purple-700',
    onboarding_complete: 'bg-indigo-100 text-indigo-700',
    pages_being_built: 'bg-yellow-100 text-yellow-700',
    social_media_proofs: 'bg-orange-100 text-orange-700',
    content_approved: 'bg-cyan-100 text-cyan-700',
    campaigns_launched: 'bg-teal-100 text-teal-700',
    service_completed: 'bg-green-100 text-green-700',
  };

  const badgeColor = stageBadgeColors[record.stage] || 'bg-slate-100 text-slate-700';

  // Format product name
  const productName = record.product_slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l: string) => l.toUpperCase());

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4">
        <div>
          <div className="font-semibold text-slate-900">{record.client_name}</div>
          <div className="text-sm text-slate-600">{record.client_email}</div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-slate-900">{productName}</div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
          {stageLabel}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-slate-600">
          {new Date(record.moved_to_current_stage_at).toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4">
        {record.onboarding?.onboarding_date && (
          <a
            href={record.onboarding.meeting_link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Details
          </a>
        )}
      </td>
    </tr>
  );
}

// Session Card Component
function SessionCard({ session, isUpcoming }: { session: any; isUpcoming: boolean }) {
  const sessionDateTime = new Date(`${session.scheduled_date}T${session.scheduled_time}`);
  const now = new Date();
  const timeUntil = sessionDateTime.getTime() - now.getTime();
  const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
  const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

  // Status badge
  const statusConfig = {
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
    confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed' },
    completed: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Completed' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
    no_show: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'No Show' },
  };

  const status = statusConfig[session.status as keyof typeof statusConfig] || statusConfig.scheduled;

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:border-[#2B4C7E] transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left Side: Date/Time */}
        <div className="flex items-start gap-4">
          <div className="bg-[#2B4C7E] text-white rounded-lg p-4 text-center min-w-[80px]">
            <div className="text-sm font-semibold">
              {sessionDateTime.toLocaleDateString('en-US', { month: 'short' })}
            </div>
            <div className="text-3xl font-bold">
              {sessionDateTime.toLocaleDateString('en-US', { day: 'numeric' })}
            </div>
            <div className="text-xs">
              {sessionDateTime.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
          </div>

          {/* Client Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-slate-900">{session.customer_name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                {status.label}
              </span>
            </div>

            <div className="space-y-1 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {sessionDateTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}{' '}
                  CT ({session.duration_minutes} min)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${session.customer_email}`} className="hover:text-[#2B4C7E]">
                  {session.customer_email}
                </a>
              </div>

              {session.customer_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${session.customer_phone}`} className="hover:text-[#2B4C7E]">
                    {session.customer_phone}
                  </a>
                </div>
              )}

              {session.products_purchased && (
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>{getProductNames(session.products_purchased)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex flex-col gap-2 lg:items-end">
          {isUpcoming && hoursUntil >= 0 && (
            <div className="text-sm font-semibold text-slate-700 mb-2">
              {hoursUntil > 0 ? (
                <span>
                  In {hoursUntil}h {minutesUntil}m
                </span>
              ) : (
                <span className="text-orange-600">Starting in {minutesUntil} minutes!</span>
              )}
            </div>
          )}

          {isUpcoming && session.zoom_link && (
            <a
              href={session.zoom_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2B4C7E] text-white rounded-lg hover:bg-[#1a2c4e] transition-colors"
            >
              <Video className="w-5 h-5" />
              Join Meeting
            </a>
          )}

          {session.session_notes && (
            <div className="text-xs text-slate-500 mt-2 max-w-xs">
              <strong>Notes:</strong> {session.session_notes.replace(/\[.*?\]/g, '').trim()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to extract product names
function getProductNames(productsJson: any): string {
  if (!productsJson) return 'Unknown Product';

  try {
    if (Array.isArray(productsJson)) {
      return productsJson.map((p) => p.product_name || p.name).join(', ');
    }
    return 'Product Purchase';
  } catch {
    return 'Product Purchase';
  }
}
