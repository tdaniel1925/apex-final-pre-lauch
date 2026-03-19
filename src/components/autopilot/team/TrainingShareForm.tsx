'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Send, Loader2, Check, AlertCircle } from 'lucide-react';

interface TrainingVideo {
  id: string;
  title: string;
  description: string | null;
}

interface DownlineMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export function TrainingShareForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [members, setMembers] = useState<DownlineMember[]>([]);
  const [selectedVideo, setSelectedVideo] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [personalMessage, setPersonalMessage] = useState('');

  useEffect(() => {
    // In a real app, fetch actual training videos and downline members
    // For now, using placeholder data
    setVideos([
      { id: '1', title: 'Getting Started with Sales', description: 'Learn the basics' },
      { id: '2', title: 'Advanced Techniques', description: 'Take your skills to the next level' },
    ]);
  }, []);

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedVideo) {
      setError('Please select a training video');
      return;
    }
    if (selectedMembers.length === 0) {
      setError('Please select at least one team member');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/autopilot/team/training/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          training_video_id: selectedVideo,
          shared_with_distributor_ids: selectedMembers,
          personal_message: personalMessage || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to share training');
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedVideo('');
        setSelectedMembers([]);
        setPersonalMessage('');
        if (onSuccess) onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to share training');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-semibold">Share Training Video</h2>

        {/* Video Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Training Video *</label>
          <select
            value={selectedVideo}
            onChange={(e) => setSelectedVideo(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Choose a video...</option>
            {videos.map((video) => (
              <option key={video.id} value={video.id}>
                {video.title}
              </option>
            ))}
          </select>
        </div>

        {/* Member Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Share With * ({selectedMembers.length} selected)
          </label>
          <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
            <p className="text-sm text-gray-500 mb-3">
              Select from your downline members (Team Edition required)
            </p>
            {members.length === 0 && (
              <p className="text-sm text-gray-400 italic">Loading downline members...</p>
            )}
          </div>
        </div>

        {/* Personal Message */}
        <div>
          <label className="block text-sm font-medium mb-2">Personal Message (Optional)</label>
          <textarea
            value={personalMessage}
            onChange={(e) => setPersonalMessage(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add a personal note..."
          />
          <p className="text-xs text-gray-500 mt-1">{personalMessage.length}/500</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <Check className="w-5 h-5 mr-2" />
            <span>Training video shared successfully!</span>
          </div>
        )}

        {/* Submit */}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sharing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Share Training
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
