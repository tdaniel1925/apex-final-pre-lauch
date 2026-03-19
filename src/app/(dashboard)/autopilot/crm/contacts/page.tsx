// =============================================
// CRM Contacts Page
// Main page for managing CRM contacts
// =============================================

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/server';
import { createClient } from '@/lib/supabase/server';
import ContactList from '@/components/autopilot/crm/ContactList';
import Link from 'next/link';

export default async function CRMContactsPage() {
  const distributor = await getCurrentUser();
  if (!distributor) {
    redirect('/login');
  }

  const supabase = await createClient();

  // Check tier access
  const { data: subscription } = await supabase
    .from('autopilot_subscriptions')
    .select('tier')
    .eq('distributor_id', distributor.id)
    .single();

  if (!subscription || !['lead_autopilot_pro', 'team_edition'].includes(subscription.tier)) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-900 mb-2">
            CRM Access Required
          </h2>
          <p className="text-yellow-800 mb-4">
            The CRM system requires Lead Autopilot Pro ($79/month) or Team Edition ($119/month).
          </p>
          <Link
            href="/autopilot/pricing"
            className="inline-block px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            View Pricing
          </Link>
        </div>
      </div>
    );
  }

  // Get usage limits
  const { data: usage } = await supabase
    .from('autopilot_usage_limits')
    .select('contacts_count, contacts_limit')
    .eq('distributor_id', distributor.id)
    .single();

  // Fetch contacts
  const { data: contacts, count } = await supabase
    .from('crm_contacts')
    .select('*', { count: 'exact' })
    .eq('distributor_id', distributor.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })
    .limit(50);

  const contactLimit = usage?.contacts_limit || 500;
  const contactCount = usage?.contacts_count || 0;
  const isUnlimited = contactLimit === -1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CRM Contacts</h1>
          <p className="text-gray-600 mt-1">
            Manage your leads and contacts with AI-powered lead scoring
          </p>
        </div>
        <Link
          href="/autopilot/crm/contacts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          + Add Contact
        </Link>
      </div>

      {/* Contact Limit */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700">Contact Usage</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {contactCount}
              {!isUnlimited && ` / ${contactLimit}`}
              {isUnlimited && ' (Unlimited)'}
            </div>
          </div>
          {!isUnlimited && (
            <div className="w-48 bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full"
                style={{ width: `${Math.min((contactCount / contactLimit) * 100, 100)}%` }}
              ></div>
            </div>
          )}
        </div>
        {!isUnlimited && contactCount >= contactLimit * 0.8 && (
          <div className="mt-2 text-sm text-orange-600">
            You're approaching your contact limit. Consider upgrading to Team Edition for unlimited
            contacts.
          </div>
        )}
      </div>

      {/* Contact List */}
      <ContactList initialContacts={contacts || []} total={count || 0} />
    </div>
  );
}
