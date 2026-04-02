// =============================================
// Dashboard Top Cards Component
// 3-card grid layout for dashboard banners
// =============================================

'use client';

import AudioPlayerCard from './AudioPlayerCard';
import RaceTo100Card from './RaceTo100Card';
import VideoTrainingCard from './VideoTrainingCard';

interface DashboardTopCardsProps {
  distributorId: string;
}

export default function DashboardTopCards({ distributorId }: DashboardTopCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <AudioPlayerCard />
      <RaceTo100Card distributorId={distributorId} />
      <VideoTrainingCard />
    </div>
  );
}
