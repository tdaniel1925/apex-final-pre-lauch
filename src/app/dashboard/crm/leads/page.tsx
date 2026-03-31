// =============================================
// CRM Leads List Page
// Business Center Feature-Gated
// =============================================

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import FeatureGate from '@/components/dashboard/FeatureGate';
import Link from 'next/link';
import { UserPlus, Search, Filter } from 'lucide-react';
import LeadsTable from '@/components/crm/LeadsTable';

export const metadata: Metadata = {
  title: 'Leads | CRM | Apex Affinity Group',
  description: 'Manage your leads',
};

export default async function LeadsListPage({
  searchParams,
}: {
  searchParams: { status?: string; source?: string; interest_level?: string; search?: string };
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  // Check Business Center access
  const supabase = await createClient();
  const { data: access } = await supabase
    .from('service_access')
    .select('is_active')
    .eq('distributor_id', currentUser.id)
    .eq('feature', '/dashboard/genealogy')
    .single();

  const hasAccess = access?.is_active || false;

  // Calculate days without Business Center
  const signupDate = new Date(currentUser.created_at);
  const daysWithout = Math.floor((Date.now() - signupDate.getTime()) / (1000 * 60 * 60 * 24));

  // Fetch leads
  let query = supabase
    .from('crm_leads')
    .select('*', { count: 'exact' })
    .eq('distributor_id', currentUser.id);

  // Apply filters
  if (searchParams.status) {
    query = query.eq('status', searchParams.status);
  }
  if (searchParams.source) {
    query = query.eq('source', searchParams.source);
  }
  if (searchParams.interest_level) {
    query = query.eq('interest_level', searchParams.interest_level);
  }
  if (searchParams.search) {
    query = query.or(
      `first_name.ilike.%${searchParams.search}%,last_name.ilike.%${searchParams.search}%,email.ilike.%${searchParams.search}%`
    );
  }

  query = query.order('created_at', { ascending: false }).limit(50);

  const { data: leads, count } = await query;

  return (
    <FeatureGate
      featurePath="/dashboard/crm/leads"
      hasAccess={hasAccess}
      daysWithout={daysWithout}
    >
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Leads</h1>
              <p className="text-slate-600">Manage prospects and opportunities</p>
            </div>
            <Link
              href="/dashboard/crm/leads/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Add Lead
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-slate-400" />
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Name or email..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    defaultValue={searchParams.search}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    defaultValue={searchParams.status || ''}
                  >
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="unqualified">Unqualified</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>

                {/* Source */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    defaultValue={searchParams.source || ''}
                  >
                    <option value="">All Sources</option>
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="social_media">Social Media</option>
                    <option value="event">Event</option>
                    <option value="cold_call">Cold Call</option>
                    <option value="email_campaign">Email Campaign</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Interest Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Interest Level</label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    defaultValue={searchParams.interest_level || ''}
                  >
                    <option value="">All Levels</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="bg-white rounded-lg border border-slate-200">
            {leads && leads.length > 0 ? (
              <LeadsTable leads={leads} />
            ) : (
              <div className="p-12 text-center">
                <UserPlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No leads yet</h3>
                <p className="text-slate-600 mb-4">Start adding leads to track your prospects</p>
                <Link
                  href="/dashboard/crm/leads/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Your First Lead
                </Link>
              </div>
            )}
          </div>

          {/* Pagination Info */}
          {count && count > 0 && (
            <div className="mt-4 text-sm text-slate-600 text-center">
              Showing {leads?.length || 0} of {count} leads
            </div>
          )}
        </div>
      </div>
    </FeatureGate>
  );
}
