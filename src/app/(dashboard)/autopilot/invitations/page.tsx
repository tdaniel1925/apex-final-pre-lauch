'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Mail } from 'lucide-react';
import { MeetingInvitationForm } from '@/components/autopilot/MeetingInvitationForm';
import { InvitationList } from '@/components/autopilot/InvitationList';
import { InvitationStats } from '@/components/autopilot/InvitationStats';

export default function InvitationsPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setShowForm(false);
    // Trigger refresh of stats and list
    setRefreshKey((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-navy-900 mb-2">
              Meeting Invitations
            </h1>
            <p className="text-gray-600">
              Send and track meeting invitations to prospects and team members
            </p>
          </div>

          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gold hover:bg-gold/90 text-navy-900"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Invitation
            </Button>
          )}
        </div>
      </div>

      {/* Invitation Form */}
      {showForm && (
        <div className="mb-8">
          <MeetingInvitationForm
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Stats Section */}
      {!showForm && (
        <div key={`stats-${refreshKey}`} className="mb-8">
          <InvitationStats />
        </div>
      )}

      {/* Invitations List */}
      {!showForm && (
        <div key={`list-${refreshKey}`}>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-navy-900 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Your Invitations
            </h2>
          </div>
          <InvitationList onRefresh={handleRefresh} />
        </div>
      )}

      {/* Empty State when showing form */}
      {showForm && (
        <div className="text-center text-gray-500 mt-12">
          <p className="text-sm">
            After sending your invitation, you'll be able to view stats and manage all invitations here.
          </p>
        </div>
      )}
    </div>
  );
}
