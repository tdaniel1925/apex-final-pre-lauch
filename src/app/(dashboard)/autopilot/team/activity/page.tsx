'use client';

import { DownlineActivityFeed } from '@/components/autopilot/team/DownlineActivityFeed';

export default function TeamActivityPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Downline Activity</h1>
          <p className="text-gray-600">
            Stay updated with your team's activities and achievements
          </p>
        </div>
      </div>

      {/* Activity Feed */}
      <DownlineActivityFeed />
    </div>
  );
}
