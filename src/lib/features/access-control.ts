// =============================================
// Feature Access Control System
// Central control for licensing-based feature gating
// =============================================

export type LicensingStatus = 'licensed' | 'non_licensed';

/**
 * Feature Keys - All features that can be gated by licensing status
 * Add new features here as they're developed
 */
export type FeatureKey =
  // Insurance/Licensing Features
  | 'insurance_licensing_section'
  | 'insurance_license_upload'
  | 'insurance_professional_info'

  // Commission Features
  | 'commission_advanced'
  | 'commission_reporting'

  // Training & Education
  | 'training_materials'
  | 'training_advanced'
  | 'training_certifications'

  // Lead Generation & Marketing
  | 'lead_generation'
  | 'lead_generation_advanced'
  | 'marketing_materials'
  | 'marketing_campaigns'

  // Business Tools
  | 'business_analytics'
  | 'business_reports'
  | 'client_management'

  // Support & Resources
  | 'support_priority'
  | 'resource_library_advanced';

/**
 * Feature Access Matrix
 * Defines which licensing statuses have access to which features
 *
 * true = feature available
 * false = feature restricted (will be grayed out with message)
 */
const FEATURE_MATRIX: Record<FeatureKey, LicensingStatus[]> = {
  // Insurance/Licensing - Licensed Only
  insurance_licensing_section: ['licensed'],
  insurance_license_upload: ['licensed'],
  insurance_professional_info: ['licensed'],

  // Commissions - Licensed get advanced, non-licensed get basic (handled in UI)
  commission_advanced: ['licensed'],
  commission_reporting: ['licensed'],

  // Training - Both have access, but different content
  training_materials: ['licensed', 'non_licensed'],
  training_advanced: ['licensed'],
  training_certifications: ['licensed'],

  // Lead Generation - Both have access
  lead_generation: ['licensed', 'non_licensed'],
  lead_generation_advanced: ['licensed'],
  marketing_materials: ['licensed', 'non_licensed'],
  marketing_campaigns: ['licensed'],

  // Business Tools - Licensed only
  business_analytics: ['licensed'],
  business_reports: ['licensed'],
  client_management: ['licensed'],

  // Support - Both have access, licensed gets priority
  support_priority: ['licensed'],
  resource_library_advanced: ['licensed'],
};

/**
 * Check if a licensing status has access to a feature
 *
 * @param licensingStatus - The user's licensing status
 * @param feature - The feature key to check
 * @returns true if the user has access, false otherwise
 *
 * @example
 * hasFeatureAccess('licensed', 'insurance_license_upload') // true
 * hasFeatureAccess('non_licensed', 'insurance_license_upload') // false
 */
export function hasFeatureAccess(
  licensingStatus: LicensingStatus,
  feature: FeatureKey
): boolean {
  const allowedStatuses = FEATURE_MATRIX[feature];

  if (!allowedStatuses) {
    // Feature not in matrix - default to deny access
    console.warn(`Feature "${feature}" not found in access matrix`);
    return false;
  }

  return allowedStatuses.includes(licensingStatus);
}

/**
 * Get a user-friendly message explaining why a feature is restricted
 *
 * @param feature - The feature key
 * @returns A friendly message explaining the restriction
 */
export function getFeatureRestrictionMessage(feature: FeatureKey): string {
  const messages: Partial<Record<FeatureKey, string>> = {
    insurance_licensing_section: 'Insurance licensing information is only required for licensed agents.',
    insurance_license_upload: 'License upload is only available to licensed insurance agents.',
    insurance_professional_info: 'Professional licensing details are for licensed agents only.',

    commission_advanced: 'Advanced commission tracking is available to licensed agents.',
    commission_reporting: 'Detailed commission reports are available to licensed agents.',

    training_advanced: 'Advanced training materials require an active insurance license.',
    training_certifications: 'Professional certifications are available to licensed agents.',

    lead_generation_advanced: 'Advanced lead generation tools are for licensed agents.',
    marketing_campaigns: 'Marketing campaign management requires an insurance license.',

    business_analytics: 'Business analytics are available to licensed agents.',
    business_reports: 'Advanced reports require an active insurance license.',
    client_management: 'Client management tools are for licensed agents.',

    support_priority: 'Priority support is available to licensed agents.',
    resource_library_advanced: 'Advanced resources require an insurance license.',
  };

  return messages[feature] ?? 'This feature is not available with your current licensing status.';
}

/**
 * Get a list of all features available to a licensing status
 * Useful for displaying what's available in upgrade/comparison views
 *
 * @param licensingStatus - The licensing status to check
 * @returns Array of available feature keys
 */
export function getAvailableFeatures(licensingStatus: LicensingStatus): FeatureKey[] {
  return (Object.keys(FEATURE_MATRIX) as FeatureKey[]).filter((feature) =>
    hasFeatureAccess(licensingStatus, feature)
  );
}

/**
 * Get a list of all restricted features for a licensing status
 * Useful for showing what they'd get if they upgrade
 *
 * @param licensingStatus - The licensing status to check
 * @returns Array of restricted feature keys
 */
export function getRestrictedFeatures(licensingStatus: LicensingStatus): FeatureKey[] {
  return (Object.keys(FEATURE_MATRIX) as FeatureKey[]).filter(
    (feature) => !hasFeatureAccess(licensingStatus, feature)
  );
}

/**
 * Get a human-readable label for a feature
 * Used in UI displays
 */
export function getFeatureLabel(feature: FeatureKey): string {
  const labels: Record<FeatureKey, string> = {
    insurance_licensing_section: 'Insurance Licensing',
    insurance_license_upload: 'License Upload',
    insurance_professional_info: 'Professional Information',
    commission_advanced: 'Advanced Commissions',
    commission_reporting: 'Commission Reports',
    training_materials: 'Training Materials',
    training_advanced: 'Advanced Training',
    training_certifications: 'Professional Certifications',
    lead_generation: 'Lead Generation',
    lead_generation_advanced: 'Advanced Lead Gen',
    marketing_materials: 'Marketing Materials',
    marketing_campaigns: 'Marketing Campaigns',
    business_analytics: 'Business Analytics',
    business_reports: 'Business Reports',
    client_management: 'Client Management',
    support_priority: 'Priority Support',
    resource_library_advanced: 'Advanced Resources',
  };

  return labels[feature] ?? feature;
}
