'use client';

// =====================================================
// Autopilot Dashboard
// Tabbed interface for all Autopilot features
// =====================================================

import { useState } from 'react';
import { Mail, Megaphone, Calendar } from 'lucide-react';
import { isAutopilotFreeTrial, getEffectiveTier } from '@/lib/config/autopilot';
import { MeetingInvitationForm } from './MeetingInvitationForm';
import MeetingsTab from './MeetingsTab';

interface AutopilotDashboardProps {
  distributorId: string;
  autopilotTier: string;
}

type Tab = 'invitations' | 'meetings';

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
