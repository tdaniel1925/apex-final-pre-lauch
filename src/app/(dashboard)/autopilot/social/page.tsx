import { Metadata } from 'next';
import { SocialPostComposer } from '@/components/autopilot/SocialPostComposer';
import { SocialPostsList } from '@/components/autopilot/SocialPostsList';
import HelpSection from '@/components/business-center/HelpSection';

export const metadata: Metadata = {
  title: 'Social Media Posting | Apex Lead Autopilot',
  description: 'Schedule and manage social media posts across multiple platforms',
};

export default function SocialPostingPage() {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Social Media Posting</h1>
        <p className="text-gray-600">
          Create and schedule posts across Facebook, Instagram, LinkedIn, and Twitter/X
        </p>
      </div>

      {/* Help Section */}
      <HelpSection
        title="How Social Media Posting Works"
        description="Create engaging social media content and schedule posts to publish at optimal times. Maintain consistent presence across all platforms without spending hours every day on social media."
        steps={[
          'Write your post content or use AI to generate engaging copy',
          'Select which platforms to post to (Facebook, Instagram, LinkedIn, X)',
          'Choose to publish immediately or schedule for a future date/time',
          'Track engagement and performance of your published posts',
        ]}
        tips={[
          'Post during peak engagement times: weekdays 9-11am and 1-3pm',
          'Include relevant hashtags to increase discoverability',
          'Add eye-catching images or videos to boost engagement',
          'Ask questions or include calls-to-action to encourage comments',
        ]}
        collapsible={true}
        defaultExpanded={false}
      />

      <div className="grid gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
          <SocialPostComposer />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Your Posts</h2>
          <SocialPostsList />
        </section>
      </div>
    </div>
  );
}
