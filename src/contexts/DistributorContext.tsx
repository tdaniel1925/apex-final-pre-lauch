'use client';

// =============================================
// Distributor Context
// Provides distributor data throughout the app
// =============================================

import { createContext } from 'react';
import type { Distributor } from '@/lib/types';

/**
 * Context that provides the current distributor's data
 * Used by useFeatureAccess and other hooks to check licensing status
 */
export const DistributorContext = createContext<Distributor | null>(null);

export interface DistributorProviderProps {
  distributor: Distributor;
  children: React.ReactNode;
}

/**
 * Provider component that wraps pages/layouts to provide distributor context
 *
 * @example
 * // In a layout or page:
 * <DistributorProvider distributor={distributorData}>
 *   <YourComponents />
 * </DistributorProvider>
 *
 * // Then in child components:
 * const { hasAccess } = useFeatureAccess('some_feature');
 */
export function DistributorProvider({ distributor, children }: DistributorProviderProps) {
  return (
    <DistributorContext.Provider value={distributor}>
      {children}
    </DistributorContext.Provider>
  );
}
