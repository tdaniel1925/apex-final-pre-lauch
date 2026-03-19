'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { BroadcastComposer } from '@/components/autopilot/team/BroadcastComposer';
import { BroadcastList } from '@/components/autopilot/team/BroadcastList';

export default function TeamBroadcastsPage() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-navy-900 mb-2">Team Broadcasts</h1>
            <p className="text-gray-600">
              Send email, SMS, and in-app broadcasts to your downline team members
            </p>
          </div>

          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gold hover:bg-gold/90 text-navy-900"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Broadcast
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {showForm && (
          <BroadcastComposer
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Broadcasts</h2>
          <BroadcastList key={refreshKey} />
        </div>
      </div>
    </div>
  );
}
