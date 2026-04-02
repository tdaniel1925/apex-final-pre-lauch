// =============================================
// CRM Contacts List Page
// Business Center Feature-Gated
// =============================================

import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import FeatureGate from '@/components/dashboard/FeatureGate';
import Link from 'next/link';
import { Users, UserPlus, Mail, Phone, Building } from 'lucide-react';
import { checkBusinessCenterSubscription } from '@/lib/subscription/check-business-center';

export const metadata: Metadata = {
  title: 'Contacts | CRM | Apex Affinity Group',
  description: 'Manage your contacts',
};

async function getContacts(distributorId: string) {
  const supabase = await createClient();

  const { data: contacts, error } = await supabase
    .from('crm_contacts')
    .select('*')
    .eq('distributor_id', distributorId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return contacts || [];
}

export default async function ContactsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  // Check Business Center access
  const bcStatus = await checkBusinessCenterSubscription(currentUser.id);
  const contacts = await getContacts(currentUser.id);

  return (
    <FeatureGate
      featurePath="/dashboard/crm/contacts"
      hasAccess={bcStatus.hasSubscription}
      daysWithout={bcStatus.daysWithout}
    >
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Contacts</h1>
              <p className="text-slate-600">Manage your active contacts and relationships</p>
            </div>
            <Link
              href="/dashboard/crm/contacts/new"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <UserPlus className="w-5 h-5" />
              Add Contact
            </Link>
          </div>

          {/* Contacts Grid */}
          {contacts.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No contacts yet</h3>
              <p className="text-slate-600 mb-6">Get started by adding your first contact</p>
              <Link
                href="/dashboard/crm/contacts/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <UserPlus className="w-5 h-5" />
                Add Contact
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.map((contact: any) => (
                <div
                  key={contact.id}
                  className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {contact.first_name} {contact.last_name}
                      </h3>
                      {contact.company && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                          <Building className="w-4 h-4" />
                          {contact.company}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${contact.email}`} className="hover:text-blue-600">
                          {contact.email}
                        </a>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                          {contact.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <span className="text-xs text-slate-500">
                      Added {new Date(contact.created_at).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/dashboard/crm/contacts/${contact.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FeatureGate>
  );
}
