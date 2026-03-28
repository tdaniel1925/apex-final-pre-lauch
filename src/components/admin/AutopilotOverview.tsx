'use client';

import React from 'react';
import {
  Mail,
  FileText,
  Share2,
  Users,
  Calendar,
  CheckCircle2,
  Zap,
  Target,
  TrendingUp,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { isAutopilotFreeTrial } from '@/lib/config/autopilot';

export function AutopilotOverview() {
  const isFreeTrialActive = isAutopilotFreeTrial();

  return (
    <div className="space-y-8">
      {/* Free Trial Status */}
      {isFreeTrialActive && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 rounded-full p-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">🎉 FREE TRIAL MODE ACTIVE</h3>
              <p className="text-green-50 mb-3">
                All Autopilot features are currently FREE for all distributors. Everyone has full Team Edition access with unlimited usage.
              </p>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-sm font-semibold mb-2">To end the free trial:</p>
                <p className="text-sm text-green-50">
                  Edit <code className="bg-white/20 px-2 py-0.5 rounded font-mono">/lib/config/autopilot.ts</code> and set{' '}
                  <code className="bg-white/20 px-2 py-0.5 rounded font-mono">AUTOPILOT_FREE_TRIAL_ACTIVE = false</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* What is Autopilot */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 rounded-lg p-3">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              What is Apex Lead Autopilot?
            </h2>
            <p className="text-lg text-slate-700 mb-4">
              Autopilot is an AI-powered prospecting system that helps distributors automatically
              generate leads, send invitations, and manage their prospect pipeline.
            </p>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <p className="text-slate-700 font-medium mb-2">How it works:</p>
              <ol className="list-decimal list-inside space-y-2 text-slate-600">
                <li>Distributors subscribe to a monthly plan (Social, Pro, or Team)</li>
                <li>They get access to AI tools: flyer generator, invitation sender, CRM, and more</li>
                <li>Autopilot sends automated invitations to prospects on their behalf</li>
                <li>Tracks responses, opens, and engagement automatically</li>
                <li>Helps distributors focus on follow-up instead of manual outreach</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Guide */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-900">Quick Guide for Back Office</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-slate-900">What You Can Do</h4>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• View who has active Autopilot subscriptions</li>
                <li>• Monitor invitation sending activity</li>
                <li>• See which distributors are most active</li>
                <li>• Track overall system usage and engagement</li>
                <li>• View response rates across all users</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-slate-900">What Happens Automatically</h4>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>• Distributors create invitations in their dashboard</li>
                <li>• System sends emails automatically on their behalf</li>
                <li>• Tracks who opens emails and clicks links</li>
                <li>• Stores prospects in distributor's CRM</li>
                <li>• Charges monthly subscription fees via Stripe</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Features Breakdown */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Autopilot Features</h3>
          <p className="text-sm text-slate-600 mt-1">
            These tools are available to distributors based on their subscription tier
          </p>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Feature 1: Invitations */}
            <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-900">Event Invitations</h4>
              </div>
              <p className="text-sm text-slate-600 mb-2">
                Send automated invitations to prospects for company events, webinars, or meetings
              </p>
              <div className="text-xs text-slate-500">
                All Plans • Unlimited sends
              </div>
            </div>

            {/* Feature 2: Flyers */}
            <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-purple-100 rounded-lg p-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-900">Event Flyers</h4>
              </div>
              <p className="text-sm text-slate-600 mb-2">
                Create custom event flyers with professional templates and branding
              </p>
              <div className="text-xs text-slate-500">
                Social Connector, Pro & Team
              </div>
            </div>

            {/* Feature 3: Social */}
            <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-100 rounded-lg p-2">
                  <Share2 className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-900">Social Media Posts</h4>
              </div>
              <p className="text-sm text-slate-600 mb-2">
                AI-generated social media content ready to post on Facebook, Instagram, LinkedIn
              </p>
              <div className="text-xs text-slate-500">
                All Paid Plans
              </div>
            </div>

            {/* Feature 4: CRM */}
            <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-100 rounded-lg p-2">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <h4 className="font-semibold text-slate-900">Contact CRM</h4>
              </div>
              <p className="text-sm text-slate-600 mb-2">
                Manage prospects, track interactions, set follow-up tasks, and view pipeline stages
              </p>
              <div className="text-xs text-slate-500">
                All Plans • Included
              </div>
            </div>

            {/* Feature 5: Events Integration */}
            <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-pink-100 rounded-lg p-2">
                  <Calendar className="w-5 h-5 text-pink-600" />
                </div>
                <h4 className="font-semibold text-slate-900">Company Events</h4>
              </div>
              <p className="text-sm text-slate-600 mb-2">
                Access company-wide events and invite prospects directly from their dashboard
              </p>
              <div className="text-xs text-slate-500">
                All Plans • Automated
              </div>
            </div>

            {/* Feature 6: Team Tools */}
            <div className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-indigo-100 rounded-lg p-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                </div>
                <h4 className="font-semibold text-slate-900">Team Management</h4>
              </div>
              <p className="text-sm text-slate-600 mb-2">
                Send broadcasts to downline, share training materials, and track team activity
              </p>
              <div className="text-xs text-slate-500">
                Team Plan Only
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Tiers */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Subscription Tiers</h3>
          <p className="text-sm text-slate-600 mt-1">
            Distributors choose their plan based on features needed
          </p>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Social Connector */}
            <div className="border-2 border-slate-200 rounded-lg p-6">
              <div className="text-center mb-4">
                <h4 className="text-xl font-bold text-slate-900">Social Connector</h4>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-blue-600">$39</span>
                  <span className="text-slate-600">/month</span>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>50 email invitations/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>30 social posts/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>10 event flyers/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Response tracking</span>
                </li>
              </ul>
            </div>

            {/* Lead Autopilot Pro */}
            <div className="border-2 border-blue-500 rounded-lg p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                MOST POPULAR
              </div>
              <div className="text-center mb-4">
                <h4 className="text-xl font-bold text-slate-900">Lead Autopilot Pro</h4>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-blue-600">$79</span>
                  <span className="text-slate-600">/month</span>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Unlimited email invitations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Full CRM (500 contacts)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>1,000 SMS messages/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>100 social posts/month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>AI lead scoring</span>
                </li>
              </ul>
            </div>

            {/* Team Edition */}
            <div className="border-2 border-slate-200 rounded-lg p-6 relative">
              <div className="absolute -top-3 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                BEST VALUE
              </div>
              <div className="text-center mb-4">
                <h4 className="text-xl font-bold text-slate-900">Team Edition</h4>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-blue-600">$119</span>
                  <span className="text-slate-600">/month</span>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Unlimited everything</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Unlimited CRM contacts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Unlimited SMS</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Team broadcasts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Training library</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
        <h3 className="text-lg font-semibold text-amber-900 mb-3">Important Notes for Back Office</h3>
        <div className="space-y-2 text-sm text-amber-800">
          <p>
            <strong>Billing:</strong> All subscriptions are managed through Stripe. Payments are
            collected automatically on the 1st of each month.
          </p>
          <p>
            <strong>Support:</strong> Distributors access Autopilot from their dashboard at{' '}
            <code className="bg-amber-100 px-2 py-1 rounded">/autopilot/*</code>
          </p>
          <p>
            <strong>Monitoring:</strong> You can view distributor activity in the Distributors page,
            but detailed Autopilot analytics are coming in a future update.
          </p>
          <p>
            <strong>API Access:</strong> All Autopilot features work via API endpoints at{' '}
            <code className="bg-amber-100 px-2 py-1 rounded">/api/autopilot/*</code>
          </p>
        </div>
      </div>

      {/* User Journey */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">How Distributors Use Autopilot</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Subscribe</h4>
                <p className="text-sm text-slate-600">
                  Distributor goes to /autopilot/subscription, selects a plan, and subscribes via Stripe
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Create Invitations</h4>
                <p className="text-sm text-slate-600">
                  They go to /autopilot/invitations, enter prospect emails, select an event, and schedule sends
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Automatic Sending</h4>
                <p className="text-sm text-slate-600">
                  System sends emails automatically on scheduled date with tracking links embedded
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Track Responses</h4>
                <p className="text-sm text-slate-600">
                  Distributor sees who opened, clicked, or responded in their invitation dashboard
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                5
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Follow Up</h4>
                <p className="text-sm text-slate-600">
                  Hot leads move to CRM where distributor manages follow-up tasks and closes deals
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
