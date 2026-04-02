'use client';

import Link from 'next/link';
import { CheckCircle, Calendar } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import CalComModal from '@/components/booking/CalComModal';

function ProductSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [requiresOnboarding, setRequiresOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState('');

  const sessionId = searchParams.get('session_id');
  const productSlug = searchParams.get('product');

  // Check if product requires onboarding
  useEffect(() => {
    async function checkOnboarding() {
      if (!productSlug) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/products/onboarding-check?slug=${productSlug}`);
        const data = await response.json();

        setRequiresOnboarding(data.requires_onboarding || false);
        setProductName(data.product?.name || '');
      } catch (error) {
        console.error('Failed to check onboarding requirement:', error);
        setRequiresOnboarding(false);
      } finally {
        setLoading(false);
      }
    }

    checkOnboarding();
  }, [productSlug]);

  // Auto-open booking modal for products requiring onboarding
  useEffect(() => {
    if (requiresOnboarding && sessionId && !loading) {
      // Auto-open modal after 1 second
      const timer = setTimeout(() => {
        setShowBookingModal(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [requiresOnboarding, sessionId, loading]);

  // Show loading state while checking onboarding requirement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg text-slate-700">Processing your purchase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>

        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Thank You for Your Purchase!
        </h1>

        <p className="text-lg text-slate-700 mb-6">
          Your subscription has been successfully activated.
        </p>

        {requiresOnboarding && sessionId ? (
          <>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <Calendar className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Schedule Your Onboarding Session
              </h2>
              <p className="text-slate-700 mb-4">
                To get started with your new AI-powered tools, you'll need to schedule a 30-minute onboarding session with BotMakers.
              </p>
              <p className="text-sm text-slate-600 mb-4">
                Click below to schedule your session now, or you can do it later from your dashboard.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Now
                </button>
                <Link
                  href="/"
                  className="bg-slate-100 text-slate-900 px-6 py-3 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Skip for Now
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-slate-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                What Happens Next?
              </h2>
              <ul className="text-left text-slate-700 space-y-3">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span>You'll receive a confirmation email with your order details</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span>Access to your service will be activated within 24 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span>Your referring distributor has been credited with Business Volume (BV)</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <Link
                href="/products"
                className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"
              >
                View All Products
              </Link>
              <Link
                href="/"
                className="bg-slate-100 text-slate-900 px-6 py-3 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Return Home
              </Link>
            </div>
          </>
        )}

        <p className="text-sm text-slate-500 mt-8">
          Questions? Contact support at{' '}
          <a
            href="mailto:support@theapexway.net"
            className="text-blue-600 hover:underline"
          >
            support@theapexway.net
          </a>
        </p>
      </div>

      {/* Cal.com Booking Modal */}
      <CalComModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        calLink="botmakers/apex-affinity-group-onboarding"
        prefillData={{
          product: productName,
          metadata: {
            session_id: sessionId || '',
          }
        }}
      />
    </div>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
        </div>
        <p className="text-lg text-slate-700">Loading...</p>
      </div>
    </div>
  );
}

export default function ProductPurchaseSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProductSuccessContent />
    </Suspense>
  );
}
