// =============================================
// Profile Page
// Edit user profile information
// =============================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import ProfileForm from '@/components/dashboard/ProfileForm';
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account information</p>
      </div>

      <div className="max-w-2xl">
        <ProfileForm distributor={distributor as Distributor} userEmail={user.email!} />
      </div>
    </div>
  );
}
