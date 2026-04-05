import { Metadata } from 'next';
import { FlyerGenerator } from '@/components/autopilot/FlyerGenerator';
import { FlyerGallery } from '@/components/autopilot/FlyerGallery';
import HelpSection from '@/components/business-center/HelpSection';

export const metadata: Metadata = {
  title: 'Event Flyer Generator | Apex Lead Autopilot',
  description: 'Create professional event flyers with pre-made templates',
};

export default function FlyersPage() {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Event Flyer Generator</h1>
        <p className="text-gray-600">
          Create professional event flyers with pre-designed templates
        </p>
      </div>

      {/* Help Section */}
      <HelpSection
        title="How Flyer Generator Works"
        description="Create eye-catching event flyers in seconds using professionally-designed templates. Just enter your event details and download a high-quality image ready to print or share on social media."
        steps={[
          'Select a pre-designed template that matches your event style',
          'Enter your event details (title, date, time, location, description)',
          'Customize colors, fonts, and images if needed',
          'Download your flyer as a high-resolution image or PDF',
        ]}
        tips={[
          'Choose templates with plenty of white space for easy reading',
          'Keep event descriptions short and compelling (2-3 sentences)',
          'Include a clear call-to-action (RSVP, Register Now, etc.)',
          'Download both print-ready (PDF) and web-friendly (PNG) versions',
        ]}
        collapsible={true}
        defaultExpanded={false}
      />

      <div className="grid gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Generate New Flyer</h2>
          <FlyerGenerator />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Your Flyers</h2>
          <FlyerGallery />
        </section>
      </div>
    </div>
  );
}
