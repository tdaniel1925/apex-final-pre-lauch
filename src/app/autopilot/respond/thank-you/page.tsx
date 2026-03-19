import { Suspense } from 'react';
import ThankYouContent from './ThankYouContent';

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-800 flex items-center justify-center p-4">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}
