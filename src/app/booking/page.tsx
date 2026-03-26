// =============================================
// Onboarding Booking Page
// Customers land here after successful Stripe checkout
// =============================================

import { Suspense } from 'react';
import BookingClient from '@/components/booking/BookingClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Schedule Your Onboarding - Apex Affinity Group',
  description: 'Schedule your personalized onboarding session with an Apex specialist',
};

export default function BookingPage() {
  return (
    <Suspense fallback={<LoadingBooking />}>
      <BookingClient />
    </Suspense>
  );
}

function LoadingBooking() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-[#2B4C7E] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-600">Loading booking...</p>
      </div>
    </div>
  );
}
