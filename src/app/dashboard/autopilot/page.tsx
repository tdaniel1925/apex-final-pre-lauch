// =====================================================
// Lead Autopilot Dashboard
// Main interface for reps to send invitations, create content, manage CRM
// =====================================================

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AutopilotDashboard from '@/components/autopilot/AutopilotDashboard';
import { getAdminUser } from '@/lib/auth/admin';

export const metadata = {
  title: 'Lead Autopilot - Apex Affinity Group',
  description: 'AI-powered prospecting and marketing automation',
};

export default async function AutopilotPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor info
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email, autopilot_tier')
    .eq('auth_user_id', user.id)
    .single();

  // If no distributor record, check if they're an admin
  if (!distributor) {
    const adminUser = await getAdminUser();

    // If they're an admin, redirect to admin autopilot page
    if (adminUser) {
      redirect('/admin/autopilot');
    }

    // Otherwise, they need to complete signup
    redirect('/signup');
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h1 className="text-3xl font-bold text-slate-900">Lead Autopilot</h1>
          </div>
          <p className="text-slate-600">
            AI-powered tools to grow your business and engage prospects
          </p>
        </div>

        {/* Dashboard */}
        <AutopilotDashboard
          distributorId={distributor.id}
          autopilotTier={distributor.autopilot_tier || 'free'}
        />
      </div>
    </div>
  );
}
