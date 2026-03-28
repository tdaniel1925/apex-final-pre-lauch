'use client';

// =====================================================
// Autopilot Dashboard
// Tabbed interface for all Autopilot features
// =====================================================

import { useState } from 'react';
import { Mail, MessageSquare, Image, Users, Megaphone, Sparkles, Calendar } from 'lucide-react';
import { isAutopilotFreeTrial, getEffectiveTier } from '@/lib/config/autopilot';
import { MeetingInvitationForm } from './MeetingInvitationForm';
import { SocialPostComposer } from './SocialPostComposer';
import { SocialPostsList } from './SocialPostsList';
import { FlyerGenerator } from './FlyerGenerator';
import { FlyerGallery } from './FlyerGallery';
import { InvitationStats } from './InvitationStats';
import MeetingsTab from './MeetingsTab';

interface AutopilotDashboardProps {
  distributorId: string;
  autopilotTier: string;
}

type Tab = 'invitations' | 'meetings' | 'social' | 'flyers' | 'crm' | 'stats';

export default function AutopilotDashboard({ distributorId, autopilotTier }: AutopilotDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('invitations');

  // Check if free trial is active (controlled in /lib/config/autopilot.ts)
  const isFreeTrial = isAutopilotFreeTrial();
  const effectiveTier = getEffectiveTier(autopilotTier);

  const tabs = [
    {
      id: 'invitations' as Tab,
      name: 'Send Invitations',
      icon: <Mail className="w-4 h-4" />,
      description: 'Email invitations to prospects',
      enabled: true,
    },
    {
      id: 'meetings' as Tab,
      name: 'Meeting Reservations',
      icon: <Calendar className="w-4 h-4" />,
      description: 'Create event registration pages',
      enabled: true,
    },
    {
      id: 'social' as Tab,
      name: 'Social Posts',
      icon: <MessageSquare className="w-4 h-4" />,
      description: 'AI-powered social media content',
      enabled: false,
    },
    {
      id: 'flyers' as Tab,
      name: 'Create Flyers',
      icon: <Image className="w-4 h-4" />,
      description: 'Professional marketing materials',
      enabled: false,
    },
    {
      id: 'crm' as Tab,
      name: 'My Contacts',
      icon: <Users className="w-4 h-4" />,
      description: 'Manage your prospect database',
      enabled: false,
    },
    {
      id: 'stats' as Tab,
      name: 'Statistics',
      icon: <Sparkles className="w-4 h-4" />,
      description: 'Track your performance',
      enabled: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Free Trial Banner */}
      {isFreeTrial && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-full p-3">
              <Mail className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">📧 Meeting Invitations Now Available!</h3>
              <p className="text-blue-50 mb-3">
                Send personalized invitations to prospects for meetings and events. Additional features coming soon!
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Send bulk invitations (up to 10 at once)
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Track engagement and responses
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Status - Hidden during free trial */}
      {!isFreeTrial && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Current Plan: {autopilotTier.replace('_', ' ').toUpperCase()}
          </h3>
          <p className="text-slate-600">
            Manage your subscription and billing settings
          </p>
          <a
            href="/dashboard/autopilot/subscription"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Subscription Details
          </a>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => tab.enabled && setActiveTab(tab.id)}
              disabled={!tab.enabled}
              className={`relative flex items-center gap-2 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id && tab.enabled
                  ? 'bg-blue-600 text-white shadow-md'
                  : !tab.enabled
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{tab.name}</span>
                  {!tab.enabled && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      Coming Soon
                    </span>
                  )}
                </div>
                <div className={`text-xs ${activeTab === tab.id && tab.enabled ? 'text-blue-100' : 'text-slate-500'}`}>
                  {tab.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        {activeTab === 'invitations' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Send Invitations</h2>
              <p className="text-slate-600">
                Send personalized email invitations to prospects for meetings, events, or presentations.
              </p>
            </div>
            <MeetingInvitationForm />
          </div>
        )}

        {activeTab === 'meetings' && <MeetingsTab />}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Social Media Posts</h2>
              <p className="text-slate-600 mb-6">
                Create engaging social media content with AI assistance. Generate posts for Facebook, LinkedIn, Instagram, and more.
              </p>
            </div>

            <SocialPostComposer />

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Recent Posts</h3>
              <SocialPostsList />
            </div>
          </div>
        )}

        {activeTab === 'flyers' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Marketing Flyers</h2>
              <p className="text-slate-600 mb-6">
                Create professional flyers and marketing materials with our AI-powered design tools.
              </p>
            </div>

            <FlyerGenerator />

            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Flyers</h3>
              <FlyerGallery />
            </div>
          </div>
        )}

        {activeTab === 'crm' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Contact Management</h2>
              <p className="text-slate-600 mb-6">
                Manage your prospects and contacts. Track interactions, set follow-up reminders, and organize your pipeline.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                CRM Contact Management
              </h3>
              <p className="text-slate-600 mb-6">
                View and manage all your contacts, track lead scores, and organize your sales pipeline.
              </p>
              <a
                href="/dashboard/autopilot/crm/contacts"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Go to CRM
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Performance Statistics</h2>
              <p className="text-slate-600 mb-6">
                Track your Autopilot activity and see how your marketing efforts are performing.
              </p>
            </div>

            <InvitationStats />
          </div>
        )}
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Megaphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Invitation Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use bulk invitations to send to multiple prospects at once (up to 10)</li>
              <li>• Send invitations at optimal times (Tuesday-Thursday, 10am-2pm)</li>
              <li>• Personalize with recipient names for better engagement</li>
              <li>• Follow up within 24-48 hours of sending</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
