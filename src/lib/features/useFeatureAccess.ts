'use client';

// =============================================
// useFeatureAccess Hook
// React hook for checking feature access based on licensing status
// =============================================

import { useContext } from 'react';
import { DistributorContext } from '@/contexts/DistributorContext';
import { hasFeatureAccess, type FeatureKey, type LicensingStatus } from './access-control';

export interface FeatureAccessResult {
  /** Whether the current user has access to the feature */
  hasAccess: boolean;

  /** Whether the current user is a licensed agent */
  isLicensed: boolean;

  /** Whether the feature is restricted (inverse of hasAccess) */
  isRestricted: boolean;

  /** The user's current licensing status */
  licensingStatus: LicensingStatus;

  /** Whether the user's license has been verified by admin */
  isVerified: boolean;
}

/**
 * Hook to check if current user has access to a feature
 *
 * @param feature - The feature key to check access for
 * @returns Object with access information
 *
 * @example
 * const { hasAccess, isLicensed } = useFeatureAccess('insurance_license_upload');
 *
 * if (!hasAccess) {
 *   return <LockedFeatureMessage />;
 * }
 */
export function useFeatureAccess(feature: FeatureKey): FeatureAccessResult {
  const distributor = useContext(DistributorContext);

  // If no distributor context (shouldn't happen in protected routes)
  if (!distributor) {
    return {
      hasAccess: false,
      isLicensed: false,
      isRestricted: true,
      licensingStatus: 'non_licensed',
      isVerified: false,
    };
  }

  const licensingStatus = distributor.licensing_status;
  const hasAccess = hasFeatureAccess(licensingStatus, feature);
  const isLicensed = licensingStatus === 'licensed';

  return {
    hasAccess,
    isLicensed,
    isRestricted: !hasAccess,
    licensingStatus,
    isVerified: distributor.licensing_verified,
  };
}

/**
 * Hook to get the current user's licensing status
 *
 * @returns The licensing status and verification info
 *
 * @example
 * const { isLicensed, isVerified, status } = useLicensingStatus();
 */
export function useLicensingStatus() {
  const distributor = useContext(DistributorContext);

  if (!distributor) {
    return {
      isLicensed: false,
      isVerified: false,
      status: 'non_licensed' as LicensingStatus,
      setAt: null as string | null,
    };
  }

  return {
    isLicensed: distributor.licensing_status === 'licensed',
    isVerified: distributor.licensing_verified,
    status: distributor.licensing_status,
    setAt: distributor.licensing_status_set_at,
  };
}
