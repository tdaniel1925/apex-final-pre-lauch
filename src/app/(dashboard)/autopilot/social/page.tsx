import { Metadata } from 'next';
import { SocialPostComposer } from '@/components/autopilot/SocialPostComposer';
import { SocialPostsList } from '@/components/autopilot/SocialPostsList';

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
