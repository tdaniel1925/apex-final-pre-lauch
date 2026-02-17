// =============================================
// Profile Page
// Edit user profile information
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import ProfileForm from '@/components/dashboard/ProfileForm';
import { DistributorProvider } from '@/contexts/DistributorContext';
import LicensingStatusManager from '@/components/dashboard/LicensingStatusManager';
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
          <LicensingStatusManager distributor={dist} />

          {/* Profile Form */}
          <ProfileForm distributor={dist} userEmail={user.email!} />
        </div>
      </div>
    </DistributorProvider>
  );
}
