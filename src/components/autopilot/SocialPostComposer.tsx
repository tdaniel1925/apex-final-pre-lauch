'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  getCharacterLimit,
  getPlatformDisplayName,
  getPlatformColor,
  type SocialPlatform,
} from '@/lib/autopilot/social-helpers';

const postSchema = z.object({
  platforms: z.array(z.string()).min(1, 'Select at least one platform'),
  post_content: z.string().min(1, 'Post content is required'),
  image_url: z.string().url().optional().or(z.literal('')),
  link_url: z.string().url().optional().or(z.literal('')),
  scheduled_for: z.string().optional(),
  status: z.enum(['draft', 'scheduled']),
});

interface SocialPostComposerProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PLATFORMS: SocialPlatform[] = ['facebook', 'instagram', 'linkedin', 'twitter', 'x'];

export function SocialPostComposer({ onSuccess, onCancel }: SocialPostComposerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [usage, setUsage] = useState<{ used: number; limit: number; remaining: number } | null>(null);

  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['facebook']);
  const [postContent, setPostContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [status, setStatus] = useState<'draft' | 'scheduled'>('draft');

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/autopilot/social/posts?limit=1');
      if (response.ok) {
        const data = await response.json();
        if (data.usage) {
          setUsage(data.usage);
        }
      }
    } catch (err) {
      console.error('Error fetching usage:', err);
    }
  };

  const togglePlatform = (platform: SocialPlatform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const getCharCount = () => {
    if (selectedPlatforms.length === 0) return { current: postContent.length, max: 0 };
    const limits = selectedPlatforms.map(p => getCharacterLimit(p));
    const minLimit = Math.min(...limits);
    return { current: postContent.length, max: minLimit };
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const actualStatus = isDraft ? 'draft' : status;

    const validation = postSchema.safeParse({
      platforms: selectedPlatforms,
      post_content: postContent,
      image_url: imageUrl,
      link_url: linkUrl,
      scheduled_for: scheduledFor || undefined,
      status: actualStatus,
    });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    if (actualStatus === 'scheduled' && !scheduledFor) {
      setError('Please select a date and time for scheduling');
      return;
    }

    // Check Instagram requires image
    if (selectedPlatforms.includes('instagram') && !imageUrl) {
      setError('Instagram posts require an image');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/autopilot/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: selectedPlatforms,
          post_content: postContent,
          image_url: imageUrl || undefined,
          link_url: linkUrl || undefined,
          scheduled_for: scheduledFor || undefined,
          status: actualStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Failed to create post');
        return;
      }

      setSuccess(true);
      fetchUsage(); // Refresh usage

      // Reset form
      setTimeout(() => {
        setPostContent('');
        setImageUrl('');
        setLinkUrl('');
        setScheduledFor('');
        setSelectedPlatforms(['facebook']);
        setSuccess(false);
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { current, max } = getCharCount();
  const isOverLimit = max > 0 && current > max;
  const isAtLimit = usage && usage.remaining <= 0;

  return (
    <Card className="p-6">
      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="space-y-4">
          <div>
            <Label>Select Platforms</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
              {PLATFORMS.map(platform => (
                <div
                  key={platform}
                  className={`flex items-center space-x-2 p-3 rounded border cursor-pointer transition-colors ${
                    selectedPlatforms.includes(platform)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => togglePlatform(platform)}
                >
                  <Checkbox
                    checked={selectedPlatforms.includes(platform)}
                    onCheckedChange={() => togglePlatform(platform)}
                  />
                  <span className="text-sm">{getPlatformDisplayName(platform)}</span>
                </div>
              ))}
            </div>
            {selectedPlatforms.includes('instagram') && (
              <p className="text-sm text-amber-600 mt-2">Instagram posts require an image</p>
            )}
          </div>

          <div>
            <Label htmlFor="post_content">Post Content</Label>
            <Textarea
              id="post_content"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="What would you like to share?"
              rows={5}
              className="resize-none"
              disabled={isAtLimit ?? undefined}
            />
            <div className="flex justify-between items-center mt-1">
              <span className={`text-sm ${isOverLimit ? 'text-red-500' : 'text-gray-500'}`}>
                {current} / {max > 0 ? max : '∞'} characters
              </span>
              {isOverLimit && (
                <span className="text-sm text-red-500">Exceeds character limit</span>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="image_url">Image URL (optional)</Label>
              <Input
                id="image_url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={isAtLimit ?? undefined}
              />
            </div>
            <div>
              <Label htmlFor="link_url">Link URL (optional)</Label>
              <Input
                id="link_url"
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={isAtLimit ?? undefined}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="scheduled_for">Schedule For (optional)</Label>
              <Input
                id="scheduled_for"
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => {
                  setScheduledFor(e.target.value);
                  if (e.target.value) {
                    setStatus('scheduled');
                  }
                }}
                disabled={isAtLimit ?? undefined}
              />
            </div>
          </div>

          {usage && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Posts this month:</span>
                <span className="text-sm font-medium">
                  {usage.used} / {usage.limit === -1 ? '∞' : usage.limit}
                </span>
              </div>
              <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{
                    width: usage.limit === -1 ? '0%' : `${Math.min(100, (usage.used / usage.limit) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <AlertDescription>Post created successfully!</AlertDescription>
            </Alert>
          )}

          {isAtLimit && (
            <Alert variant="destructive">
              <AlertDescription>
                You have reached your monthly limit. Please upgrade to post more.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={(e) => handleSubmit(e, true)} disabled={isSubmitting || isAtLimit || isOverLimit}>
              Save Draft
            </Button>
            <Button type="submit" disabled={isSubmitting || isAtLimit || isOverLimit}>
              {isSubmitting ? 'Creating...' : scheduledFor ? 'Schedule Post' : 'Save Post'}
            </Button>
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
}
