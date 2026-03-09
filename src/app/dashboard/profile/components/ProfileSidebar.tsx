'use client';

import React from 'react';
import {
  User,
  CreditCard,
  FileText,
  Shield,
  Bell,
  Users
} from 'lucide-react';
import type { ProfileTab } from '@/types/profile';

interface ProfileSidebarProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  profile: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    tier: string;
    profile_photo_url?: string | null;
    referral_code?: string | null;
    created_at?: string;
  };
}

const tabs = [
  { id: 'personal' as ProfileTab, label: 'Personal Info', icon: User },
  { id: 'payment' as ProfileTab, label: 'Payment Info', icon: CreditCard },
  { id: 'tax' as ProfileTab, label: 'Tax Info', icon: FileText },
  { id: 'security' as ProfileTab, label: 'Security', icon: Shield },
  { id: 'notifications' as ProfileTab, label: 'Notifications', icon: Bell },
  { id: 'referral' as ProfileTab, label: 'Referral Info', icon: Users },
];

export default function ProfileSidebar({
  activeTab,
  onTabChange,
  profile
}: ProfileSidebarProps) {
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  const initials = profile.first_name && profile.last_name
    ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase()
    : profile.email.charAt(0).toUpperCase();

  return (
    <div className="w-56 flex-shrink-0">
      {/* Profile Summary Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4 shadow-sm">
        <div className="flex flex-col items-center text-center">
          {/* Profile Photo */}
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
              {profile.profile_photo_url ? (
                <img
                  src={profile.profile_photo_url}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-apex-primary to-apex-secondary flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {initials}
                  </span>
                </div>
              )}
            </div>
            {/* Edit Photo Button - TODO: Implement photo upload */}
            <button
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white hover:bg-blue-600 transition-colors"
              title="Change photo"
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>

          {/* Name & Email */}
          <div className="text-sm font-bold text-gray-900">
            {profile.first_name} {profile.last_name}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {profile.email}
          </div>

          {/* Tier Badge */}
          <div className="mt-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-apex-light text-apex-primary text-xs font-medium">
              ⭐ {profile.tier || 'Free'} Rank
            </span>
          </div>

          {/* Rep ID & Member Since */}
          <div className="mt-3 pt-3 border-t border-gray-100 w-full">
            {profile.referral_code && (
              <div className="text-xs text-gray-500">
                Rep ID: <span className="font-mono font-semibold text-gray-700">#{profile.referral_code}</span>
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              Since <span className="font-semibold text-gray-600">{memberSince}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-apex-primary text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
