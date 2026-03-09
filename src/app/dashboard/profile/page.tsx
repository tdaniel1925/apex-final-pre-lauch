'use client';

import React, { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import ProfileSidebar from './components/ProfileSidebar';
import PersonalInfoTab from './components/tabs/PersonalInfoTab';
import ReferralInfoTab from './components/tabs/ReferralInfoTab';
import NotificationsTab from './components/tabs/NotificationsTab';
import SecurityTab from './components/tabs/SecurityTab';
import PaymentInfoTab from './components/tabs/PaymentInfoTab';
import TaxInfoTab from './components/tabs/TaxInfoTab';
import type { ProfileTab } from '@/types/profile';

export default function ProfilePage() {
  const { user, profile, loading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apex-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-900 font-semibold">Profile Not Found</p>
          <p className="mt-2 text-gray-600">No distributor profile found for this user.</p>
          <p className="mt-1 text-sm text-gray-500">User ID: {user.id}</p>
          <p className="mt-1 text-sm text-gray-500">Email: {user.email}</p>
          <p className="mt-4 text-sm text-gray-600">
            If you just signed up, please contact support to activate your distributor account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Profile & Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your account information, payment details & preferences
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-8 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar */}
          <ProfileSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            profile={{
              first_name: profile.first_name,
              last_name: profile.last_name,
              email: profile.email,
              tier: profile.licensing_status === 'licensed' ? 'Licensed' : 'Non-Licensed',
              profile_photo_url: profile.profile_photo_url,
              referral_code: profile.affiliate_code,
              created_at: profile.created_at,
            }}
          />

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            {activeTab === 'personal' && (
              <PersonalInfoTab
                userId={user.id}
                initialData={{
                  first_name: profile.first_name || '',
                  last_name: profile.last_name || '',
                  email: profile.email || '',
                  phone: profile.phone || '',
                  city: profile.city || '',
                  state: profile.state || '',
                  date_of_birth: profile.date_of_birth || '',
                  gender: 'prefer_not_to_say',
                  street_address: profile.address_line1 || '',
                  zip_code: profile.zip || '',
                  language: 'en-US',
                  timezone: 'America/Chicago',
                }}
              />
            )}

            {activeTab === 'payment' && (
              <PaymentInfoTab userId={user.id} />
            )}

            {activeTab === 'tax' && (
              <TaxInfoTab userId={user.id} />
            )}

            {activeTab === 'security' && (
              <SecurityTab userId={user.id} />
            )}

            {activeTab === 'notifications' && (
              <NotificationsTab userId={user.id} />
            )}

            {activeTab === 'referral' && (
              <ReferralInfoTab
                referredBy={profile.sponsor_id}
                referralCode={profile.affiliate_code}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
