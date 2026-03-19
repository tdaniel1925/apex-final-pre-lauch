import { Metadata } from 'next';
import { FlyerGenerator } from '@/components/autopilot/FlyerGenerator';
import { FlyerGallery } from '@/components/autopilot/FlyerGallery';

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
