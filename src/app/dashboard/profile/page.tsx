// =============================================
// Profile Page
// Edit user profile information
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import ProfileForm from '@/components/dashboard/ProfileForm';
import { DistributorProvider } from '@/contexts/DistributorContext';
import { LicensingStatusBadge } from '@/components/common';
import type { Distributor } from '@/lib/types';

export const metadata = {
  title: 'Profile - Apex Affinity Group',
  description: 'Edit your profile',
};

export default async function ProfilePage() {
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get distributor
  const serviceClient = createServiceClient();
  const { data: distributor } = await serviceClient
    .from('distributors')
    .select('*')
    .eq('auth_user_id', user.id)
    .single();

  if (!distributor) {
    redirect('/signup');
  }

  const dist = distributor as Distributor;

  return (
    <DistributorProvider distributor={dist}>
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your account information</p>
        </div>

        <div className="max-w-3xl space-y-3">
          {/* Licensing Status Section */}
          <div className="bg-white rounded-lg shadow p-3">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Licensing Status</h2>
            <div className="flex items-center justify-between">
              <div>
                <LicensingStatusBadge
                  status={dist.licensing_status}
                  verified={dist.licensing_verified}
                  size="lg"
                />
                {dist.licensing_status === 'licensed' && !dist.licensing_verified && (
                  <p className="text-xs text-orange-600 mt-2">
                    ⏳ License verification pending - please upload your license documents
                  </p>
                )}
                {dist.licensing_verified && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ License verified by administrator
                  </p>
                )}
              </div>
              {dist.licensing_status_set_at && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Status set on</p>
                  <p className="text-xs text-gray-700 font-medium">
                    {new Date(dist.licensing_status_set_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                <strong>Note:</strong> Your licensing status determines which features are available
                in your dashboard. Only administrators can change this setting.
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <ProfileForm distributor={dist} userEmail={user.email!} />
        </div>
      </div>
    </DistributorProvider>
  );
}
