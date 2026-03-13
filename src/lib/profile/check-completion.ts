// =============================================
// Profile Completion Check
// Validates that distributor has completed required profile fields
// =============================================

import type { Distributor } from '@/lib/types';

export interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  requiredFields: {
    name: string;
    label: string;
    value: any;
    isComplete: boolean;
  }[];
}

/**
 * Check if distributor profile is complete
 * Required fields: address, banking info
 */
export function checkProfileCompletion(distributor: Distributor): ProfileCompletionStatus {
  const requiredFields = [
    {
      name: 'address_line1',
      label: 'Street Address',
      value: distributor.address_line1,
      isComplete: !!distributor.address_line1,
    },
    {
      name: 'city',
      label: 'City',
      value: distributor.city,
      isComplete: !!distributor.city,
    },
    {
      name: 'state',
      label: 'State',
      value: distributor.state,
      isComplete: !!distributor.state,
    },
    {
      name: 'zip',
      label: 'ZIP Code',
      value: distributor.zip,
      isComplete: !!distributor.zip,
    },
    {
      name: 'bank_name',
      label: 'Bank Name',
      value: distributor.bank_name,
      isComplete: !!distributor.bank_name,
    },
    {
      name: 'bank_routing_number',
      label: 'Routing Number',
      value: distributor.bank_routing_number,
      isComplete: !!distributor.bank_routing_number && distributor.bank_routing_number.length === 9,
    },
    {
      name: 'bank_account_number',
      label: 'Account Number',
      value: distributor.bank_account_number,
      isComplete: !!distributor.bank_account_number,
    },
    {
      name: 'bank_account_type',
      label: 'Account Type',
      value: distributor.bank_account_type,
      isComplete: !!distributor.bank_account_type,
    },
  ];

  const missingFields = requiredFields
    .filter(field => !field.isComplete)
    .map(field => field.label);

  const isComplete = missingFields.length === 0;

  return {
    isComplete,
    missingFields,
    requiredFields,
  };
}

/**
 * Get completion percentage (0-100)
 */
export function getCompletionPercentage(distributor: Distributor): number {
  const status = checkProfileCompletion(distributor);
  const totalFields = status.requiredFields.length;
  const completedFields = status.requiredFields.filter(f => f.isComplete).length;

  return Math.round((completedFields / totalFields) * 100);
}

/**
 * Validate routing number format
 */
export function validateRoutingNumber(routing: string): boolean {
  // Must be exactly 9 digits
  if (!/^\d{9}$/.test(routing)) {
    return false;
  }

  // Routing number checksum validation
  // https://en.wikipedia.org/wiki/ABA_routing_transit_number#Check_digit
  const digits = routing.split('').map(Number);
  const checksum =
    (3 * (digits[0] + digits[3] + digits[6])) +
    (7 * (digits[1] + digits[4] + digits[7])) +
    (digits[2] + digits[5] + digits[8]);

  return checksum % 10 === 0;
}

/**
 * Validate ZIP code format
 */
export function validateZipCode(zip: string): boolean {
  // 5 digits or 5+4 format
  return /^\d{5}(-\d{4})?$/.test(zip);
}
