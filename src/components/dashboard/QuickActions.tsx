'use client';

// =============================================
// Quick Actions Component
// Displays action buttons for common tasks
// =============================================

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface QuickActionsProps {
  distributorSlug: string;
}

export default function QuickActions({ distributorSlug }: QuickActionsProps) {
  const router = useRouter();

  const handleEnrollRep = () => {
    router.push('/dashboard/team?action=add-rep');
  };

  const handleShareLink = async () => {
    const referralUrl = `${window.location.origin}/${distributorSlug}`;

    try {
      await navigator.clipboard.writeText(referralUrl);
      toast.success('Referral link copied to clipboard!', {
        description: referralUrl,
        duration: 3000
      });
    } catch (error) {
      toast.error('Failed to copy link', {
        description: 'Please try again'
      });
    }
  };

  const handleScheduleCall = () => {
    // Open external calendar (Calendly)
    window.open('https://calendly.com/theapexway', '_blank');

    // Show toast confirmation
    toast.info('Opening calendar...', {
      description: 'Schedule a call with your team'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h2 className="text-lg font-bold text-gray-900 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Enroll Rep Button */}
        <button
          onClick={handleEnrollRep}
          className="flex flex-col items-center justify-center p-4 bg-[#2B4C7E] hover:bg-[#1e3557] text-white rounded-lg transition-colors"
        >
          <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span className="text-sm font-semibold">Enroll Rep</span>
        </button>

        {/* Share Link Button */}
        <button
          onClick={handleShareLink}
          className="flex flex-col items-center justify-center p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="text-sm font-semibold">Share Link</span>
        </button>

        {/* Schedule Call Button */}
        <button
          onClick={handleScheduleCall}
          className="flex flex-col items-center justify-center p-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
        >
          <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-semibold">Schedule Call</span>
        </button>
      </div>
    </div>
  );
}
