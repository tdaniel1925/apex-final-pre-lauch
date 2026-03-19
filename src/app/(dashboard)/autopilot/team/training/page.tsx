'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { TrainingShareForm } from '@/components/autopilot/team/TrainingShareForm';
import { TrainingSharesList } from '@/components/autopilot/team/TrainingSharesList';

export default function TeamTrainingPage() {
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
            <h1 className="text-3xl font-bold text-navy-900 mb-2">Training Sharing</h1>
            <p className="text-gray-600">
              Share training videos with your downline and track their progress
            </p>
          </div>

          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gold hover:bg-gold/90 text-navy-900"
              size="lg"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Training
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {showForm && <TrainingShareForm onSuccess={handleSuccess} />}

        <div>
          <h2 className="text-xl font-semibold mb-4">Training Shares</h2>
          <TrainingSharesList key={refreshKey} />
        </div>
      </div>
    </div>
  );
}
