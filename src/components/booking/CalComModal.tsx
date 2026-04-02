'use client';

/**
 * Cal.com Booking Modal
 *
 * Shows Cal.com booking interface in a modal after purchase
 * Uses Cal.com's official React embed component
 */

import { useEffect } from 'react';
import Cal, { getCalApi } from '@calcom/embed-react';

interface CalComModalProps {
  isOpen: boolean;
  onClose: () => void;
  calLink: string; // e.g., "botmakers/onboarding" or full URL
  prefillData?: {
    name?: string;
    email?: string;
    phone?: string;
    product?: string;
    notes?: string;
    metadata?: Record<string, any>;
  };
}

export default function CalComModal({
  isOpen,
  onClose,
  calLink,
  prefillData
}: CalComModalProps) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi();

      // Listen for booking completion
      cal('on', {
        action: 'bookingSuccessful',
        callback: (e) => {
          console.log('Booking successful!', e.detail);
          // Optional: Track booking completion
          // Optional: Show success message
          setTimeout(() => {
            onClose();
          }, 2000);
        },
      });

      // Listen for modal close
      cal('on', {
        action: 'linkReady',
        callback: () => {
          console.log('Cal.com embed ready');
        },
      });
    })();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Schedule Your Onboarding Session
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Book a 30-minute session with BotMakers to get started
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cal.com Embed */}
          <div className="p-6">
            <Cal
              calLink={calLink}
              style={{ width: '100%', height: '600px', overflow: 'hidden' }}
              config={{
                layout: 'month_view',
                theme: 'light',
                ...(prefillData && {
                  name: prefillData.name,
                  email: prefillData.email,
                  phone: prefillData.phone,
                  product: prefillData.product,
                  notes: prefillData.notes,
                  metadata: prefillData.metadata,
                }),
              }}
            />
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl">
            <p className="text-sm text-slate-600 text-center">
              Need help? Contact us at{' '}
              <a href="mailto:support@theapexway.net" className="text-blue-600 hover:underline">
                support@theapexway.net
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
