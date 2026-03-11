'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import RepSidebar from '@/components/rep/RepSidebar';

interface ProfileData {
  rep_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  rank: string;
  sponsor_name: string;
  bank_name: string;
  account_number: string;
  routing_number: string;
  notifications_email: boolean;
  notifications_sms: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/login');
      return;
    }

    const { data: dist } = await supabase
      .from('distributors')
      .select('*')
      .eq('email', user.email)
      .single();

    if (dist) {
      // Get sponsor name
      let sponsorName = 'None';
      if (dist.sponsor_id) {
        const { data: sponsor } = await supabase
          .from('distributors')
          .select('first_name, last_name')
          .eq('id', dist.sponsor_id)
          .single();
        if (sponsor) {
          sponsorName = `${sponsor.first_name} ${sponsor.last_name}`;
        }
      }

      setProfile({
        rep_id: dist.rep_number || dist.id,
        first_name: dist.first_name || '',
        last_name: dist.last_name || '',
        email: dist.email || '',
        phone: dist.phone || '',
        rank: dist.rank || 'Associate',
        sponsor_name: sponsorName,
        bank_name: dist.bank_name || '',
        account_number: dist.bank_account_number || '',
        routing_number: dist.bank_routing_number || '',
        notifications_email: dist.notifications_email ?? true,
        notifications_sms: dist.notifications_sms ?? false
      });
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RepSidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#1B3A7D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen bg-gray-50">
        <RepSidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Profile not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <RepSidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-6">

          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0F2045]">Profile & Settings</h1>
              <p className="text-gray-500 text-sm mt-1">Manage your account information and preferences.</p>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                editMode
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-[#1B3A7D] text-white hover:bg-[#0F2045]'
              }`}
            >
              {editMode ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-[#0F2045] mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Rep ID</label>
                <input
                  type="text"
                  value={profile.rep_id}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-100 text-gray-500 text-sm border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Rank</label>
                <input
                  type="text"
                  value={profile.rank}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-100 text-gray-500 text-sm border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">First Name</label>
                <input
                  type="text"
                  value={profile.first_name}
                  disabled={!editMode}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm border ${
                    editMode
                      ? 'border-gray-300 focus:border-[#1B3A7D] focus:ring-2 focus:ring-[#1B3A7D] focus:ring-opacity-20'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Last Name</label>
                <input
                  type="text"
                  value={profile.last_name}
                  disabled={!editMode}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm border ${
                    editMode
                      ? 'border-gray-300 focus:border-[#1B3A7D] focus:ring-2 focus:ring-[#1B3A7D] focus:ring-opacity-20'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled={!editMode}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm border ${
                    editMode
                      ? 'border-gray-300 focus:border-[#1B3A7D] focus:ring-2 focus:ring-[#1B3A7D] focus:ring-opacity-20'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  disabled={!editMode}
                  className={`w-full px-4 py-2.5 rounded-lg text-sm border ${
                    editMode
                      ? 'border-gray-300 focus:border-[#1B3A7D] focus:ring-2 focus:ring-[#1B3A7D] focus:ring-opacity-20'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sponsor</label>
                <input
                  type="text"
                  value={profile.sponsor_name}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-100 text-gray-500 text-sm border border-gray-200"
                />
              </div>
            </div>
          </div>

          {/* Banking Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-[#0F2045] mb-4">Banking Information</h3>
            <p className="text-sm text-gray-600 mb-4">For commission payouts</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Bank Name</label>
                <input
                  type="text"
                  value={profile.bank_name}
                  disabled={!editMode}
                  placeholder="e.g., Chase Bank"
                  className={`w-full px-4 py-2.5 rounded-lg text-sm border ${
                    editMode
                      ? 'border-gray-300 focus:border-[#1B3A7D] focus:ring-2 focus:ring-[#1B3A7D] focus:ring-opacity-20'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Account Number</label>
                <input
                  type="text"
                  value={profile.account_number}
                  disabled={!editMode}
                  placeholder="••••••••1234"
                  className={`w-full px-4 py-2.5 rounded-lg text-sm border ${
                    editMode
                      ? 'border-gray-300 focus:border-[#1B3A7D] focus:ring-2 focus:ring-[#1B3A7D] focus:ring-opacity-20'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Routing Number</label>
                <input
                  type="text"
                  value={profile.routing_number}
                  disabled={!editMode}
                  placeholder="123456789"
                  className={`w-full px-4 py-2.5 rounded-lg text-sm border ${
                    editMode
                      ? 'border-gray-300 focus:border-[#1B3A7D] focus:ring-2 focus:ring-[#1B3A7D] focus:ring-opacity-20'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-[#0F2045] mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-semibold text-[#0F2045]">Email Notifications</h4>
                  <p className="text-xs text-gray-500 mt-1">Receive updates and alerts via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={profile.notifications_email} disabled={!editMode} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1B3A7D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B3A7D]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-semibold text-[#0F2045]">SMS Notifications</h4>
                  <p className="text-xs text-gray-500 mt-1">Receive important alerts via text message</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={profile.notifications_sms} disabled={!editMode} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#1B3A7D]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B3A7D]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-[#0F2045] mb-4">Change Password</h3>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm" style={{ background: '#1B3A7D' }}>
              Update Password
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
