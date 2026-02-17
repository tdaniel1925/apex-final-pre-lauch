'use client';

// =============================================
// FeatureGate Component
// Conditionally renders content based on licensing status
// =============================================

import { useFeatureAccess } from '@/lib/features/useFeatureAccess';
import { getFeatureRestrictionMessage, getFeatureLabel } from '@/lib/features/access-control';
import type { FeatureKey } from '@/lib/features/access-control';

export interface FeatureGateProps {
  /** The feature to check access for */
  feature: FeatureKey;

  /** Content to render if user has access */
  children: React.ReactNode;

  /** Optional content to render if user doesn't have access */
  fallback?: React.ReactNode;

  /**
   * How to handle restricted features:
   * - 'hide': Don't render anything (default)
   * - 'disable': Gray out with overlay message
   * - 'show-message': Show info message instead
   */
  mode?: 'hide' | 'disable' | 'show-message';

  /** Optional custom restriction message */
  customMessage?: string;
}

/**
 * FeatureGate - Conditionally renders content based on licensing status
 *
 * @example
 * // Hide completely if no access
 * <FeatureGate feature="insurance_license_upload">
 *   <LicenseUploadForm />
 * </FeatureGate>
 *
 * @example
 * // Gray out if no access
 * <FeatureGate feature="commission_advanced" mode="disable">
 *   <AdvancedCommissionDashboard />
 * </FeatureGate>
 *
 * @example
 * // Show message if no access
 * <FeatureGate feature="training_advanced" mode="show-message">
 *   <AdvancedTrainingSection />
 * </FeatureGate>
 */
export default function FeatureGate({
  feature,
  children,
  fallback,
  mode = 'hide',
  customMessage,
}: FeatureGateProps) {
  const { hasAccess, isLicensed } = useFeatureAccess(feature);

  // User has access - render normally
  if (hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access - handle based on mode

  // Mode: hide - Don't render anything
  if (mode === 'hide') {
    return fallback ? <>{fallback}</> : null;
  }

  // Mode: disable - Gray out with overlay message
  if (mode === 'disable') {
    const message = customMessage || getFeatureRestrictionMessage(feature);

    return (
      <div className="relative">
        {/* Grayed out content */}
        <div className="opacity-40 pointer-events-none select-none">{children}</div>

        {/* Overlay with lock message */}
        <div className="absolute inset-0 bg-gray-100/50 backdrop-blur-[1px] rounded-lg flex items-center justify-center">
          <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 max-w-sm mx-4">
            <div className="flex items-start gap-3">
              {/* Lock Icon */}
              <div className="flex-shrink-0">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              {/* Message */}
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Feature Restricted
                </p>
                <p className="text-xs text-gray-600">{message}</p>

                {!isLicensed && (
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    💡 Available to licensed insurance agents
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mode: show-message - Show info card instead of content
  if (mode === 'show-message') {
    const message = customMessage || getFeatureRestrictionMessage(feature);
    const featureLabel = getFeatureLabel(feature);

    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-6 text-center">
        {/* Lock Icon */}
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-2">{featureLabel}</h3>

        {/* Message */}
        <p className="text-sm text-gray-600 mb-3">{message}</p>

        {/* Upgrade hint */}
        {!isLicensed && (
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-xs font-medium text-blue-700">
              Available to licensed insurance agents
            </span>
          </div>
        )}
      </div>
    );
  }

  return null;
}
