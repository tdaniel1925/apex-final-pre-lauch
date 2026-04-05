'use client';

import { useState, useEffect } from 'react';
import { Plus, Mail, Calendar, User, TrendingUp, Pause, Play, X } from 'lucide-react';
import HelpSection from '@/components/business-center/HelpSection';

interface NurtureCampaign {
  id: string;
  prospect_name: string;
  prospect_email: string;
  prospect_source: string;
  campaign_status: 'active' | 'paused' | 'completed' | 'cancelled';
  current_week: number;
  next_email_at: string | null;
  created_at: string;
}

interface CampaignLimit {
  can_create: boolean;
  limit: number;
  current: number;
  reason: string;
}

export default function AILeadNurturePage() {
  const [campaigns, setCampaigns] = useState<NurtureCampaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [campaignLimit, setCampaignLimit] = useState<CampaignLimit | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    prospectName: '',
    prospectEmail: '',
    prospectSource: '',
    prospectInterests: '',
    prospectBirthday: '',
    prospectHobbies: '',
    prospectKids: '',
  });

  useEffect(() => {
    fetchCampaigns();
    checkCampaignLimit();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/dashboard/nurture-campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      // Error fetching campaigns
    } finally {
      setLoading(false);
    }
  };

  const checkCampaignLimit = async () => {
    try {
      const response = await fetch('/api/dashboard/nurture-campaigns/check-limit');
      if (response.ok) {
        const data = await response.json();
        setCampaignLimit(data);
      }
    } catch (error) {
      // Error checking limit
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/dashboard/nurture-campaigns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Reset form and refresh campaigns
        setFormData({
          prospectName: '',
          prospectEmail: '',
          prospectSource: '',
          prospectInterests: '',
          prospectBirthday: '',
          prospectHobbies: '',
          prospectKids: '',
        });
        setShowForm(false);
        await fetchCampaigns();
        await checkCampaignLimit();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create campaign');
      }
    } catch (error) {
      alert('Failed to create campaign');
    } finally {
      setCreating(false);
    }
  };

  const toggleCampaignStatus = async (campaignId: string, newStatus: 'active' | 'paused') => {
    try {
      const response = await fetch(`/api/dashboard/nurture-campaigns/${campaignId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchCampaigns();
      }
    } catch (error) {
      // Error updating campaign
    }
  };

  const cancelCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to cancel this campaign?')) return;

    try {
      const response = await fetch(`/api/dashboard/nurture-campaigns/${campaignId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (response.ok) {
        await fetchCampaigns();
        await checkCampaignLimit();
      }
    } catch (error) {
      // Error cancelling campaign
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Lead Nurture</h1>
          <p className="text-slate-600">
            Create personalized 7-week email campaigns for your prospects
          </p>
        </div>

        {/* Help Section */}
        <HelpSection
          title="How AI Lead Nurture Works"
          description="AI Lead Nurture automatically sends a personalized 7-week email sequence to your prospects. Each email builds rapport, shares valuable content, and keeps you top-of-mind until they're ready to take action."
          steps={[
            'Enter your prospect\'s basic information (name, email, interests)',
            'AI generates 7 personalized emails tailored to their interests and background',
            'Emails are sent automatically once per week for 7 weeks',
            'Track engagement and follow up when prospects show interest',
          ]}
          tips={[
            'Add personal details (hobbies, birthday, kids) for more personalized emails',
            'Free tier: 3 active campaigns. Business Center: Unlimited campaigns',
            'Emails include your contact info and encourage prospects to reach out',
            'Campaigns can be paused or cancelled at any time',
          ]}
          collapsible={true}
          defaultExpanded={false}
        />

        {/* Campaign Limit Banner */}
        {campaignLimit && (
          <div className={`mb-6 p-4 rounded-lg ${campaignLimit.limit === -1 ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {campaignLimit.limit === -1 ? (
                    <>✨ <strong>Unlimited Campaigns</strong> - Business Center Active</>
                  ) : (
                    <>📊 Active Campaigns: <strong>{campaignLimit.current} of {campaignLimit.limit}</strong></>
                  )}
                </p>
                {campaignLimit.limit !== -1 && (
                  <p className="text-xs text-slate-600 mt-1">
                    Upgrade to Business Center ($39/mo) for unlimited campaigns
                  </p>
                )}
              </div>
              {!campaignLimit.can_create && (
                <a
                  href="/dashboard/store"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Upgrade Now
                </a>
              )}
            </div>
          </div>
        )}

        {/* Create Campaign Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            disabled={!campaignLimit?.can_create}
            className="mb-6 flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Create New Campaign
          </button>
        )}

        {/* Create Campaign Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">New Lead Nurture Campaign</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Prospect Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.prospectName}
                    onChange={(e) => setFormData({ ...formData, prospectName: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sarah Johnson"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Prospect Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.prospectEmail}
                    onChange={(e) => setFormData({ ...formData, prospectEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="sarah@example.com"
                  />
                </div>
              </div>

              {/* How you met */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  How did you meet? *
                </label>
                <input
                  type="text"
                  required
                  value={formData.prospectSource}
                  onChange={(e) => setFormData({ ...formData, prospectSource: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Coffee shop networking event"
                />
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  What are they interested in? *
                </label>
                <textarea
                  required
                  value={formData.prospectInterests}
                  onChange={(e) => setFormData({ ...formData, prospectInterests: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Work from home, health & wellness, passive income, etc."
                />
              </div>

              {/* Personal Details (Optional) */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Personal Details (Optional - helps personalize emails)
                </h3>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Birthday (MM-DD)
                    </label>
                    <input
                      type="text"
                      value={formData.prospectBirthday}
                      onChange={(e) => setFormData({ ...formData, prospectBirthday: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="05-15"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Number of Kids
                    </label>
                    <input
                      type="text"
                      value={formData.prospectKids}
                      onChange={(e) => setFormData({ ...formData, prospectKids: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Hobbies
                    </label>
                    <input
                      type="text"
                      value={formData.prospectHobbies}
                      onChange={(e) => setFormData({ ...formData, prospectHobbies: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Yoga, reading, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {creating ? 'Creating Campaign...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Active Campaigns List */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Your Campaigns</h2>

          {loading ? (
            <div className="bg-white rounded-lg p-8 text-center text-slate-600">
              Loading campaigns...
            </div>
          ) : campaigns.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">No campaigns yet</p>
              <p className="text-sm text-slate-500">
                Create your first AI-powered nurture campaign to start building relationships with prospects
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="bg-white rounded-lg p-6 shadow hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {campaign.prospect_name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            campaign.campaign_status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : campaign.campaign_status === 'paused'
                              ? 'bg-yellow-100 text-yellow-700'
                              : campaign.campaign_status === 'completed'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {campaign.campaign_status}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {campaign.prospect_email}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Week {campaign.current_week} of 7
                        </span>
                        {campaign.next_email_at && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Next: {new Date(campaign.next_email_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-500">
                        Source: {campaign.prospect_source}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {campaign.campaign_status === 'active' && (
                        <button
                          onClick={() => toggleCampaignStatus(campaign.id, 'paused')}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                          title="Pause campaign"
                        >
                          <Pause className="w-5 h-5" />
                        </button>
                      )}
                      {campaign.campaign_status === 'paused' && (
                        <button
                          onClick={() => toggleCampaignStatus(campaign.id, 'active')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Resume campaign"
                        >
                          <Play className="w-5 h-5" />
                        </button>
                      )}
                      {(campaign.campaign_status === 'active' || campaign.campaign_status === 'paused') && (
                        <button
                          onClick={() => cancelCampaign(campaign.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Cancel campaign"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
