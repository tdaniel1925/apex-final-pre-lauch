// ============================================
// CRM Usage Limits
// Check and enforce CRM limits for free users
// Business Center subscribers get unlimited access
// ============================================

import { createServiceClient } from '@/lib/supabase/service';
import { checkBusinessCenterSubscription } from './check-business-center';

// Define usage limits for free tier
export const CRM_LIMITS = {
  FREE: {
    leads: 50,
    contacts: 100,
    tasks: 20,
  },
  BUSINESS_CENTER: {
    leads: -1, // unlimited
    contacts: -1, // unlimited
    tasks: -1, // unlimited
  },
};

export interface CRMUsageLimits {
  hasBusinessCenter: boolean;
  limits: {
    leads: number;
    contacts: number;
    tasks: number;
  };
  usage: {
    leads: number;
    contacts: number;
    tasks: number;
  };
  canAddLead: boolean;
  canAddContact: boolean;
  canAddTask: boolean;
  leadsRemaining: number;
  contactsRemaining: number;
  tasksRemaining: number;
}

/**
 * Get CRM usage and limits for a distributor
 */
export async function getCRMUsageLimits(distributorId: string): Promise<CRMUsageLimits> {
  const supabase = createServiceClient();

  // Check Business Center subscription
  const bcStatus = await checkBusinessCenterSubscription(distributorId);

  // Get current usage from distributors table
  const { data: distributor, error } = await supabase
    .from('distributors')
    .select('crm_leads_count, crm_contacts_count, crm_tasks_count')
    .eq('id', distributorId)
    .single();

  if (error || !distributor) {
    console.error('Error fetching CRM usage:', error);
    return {
      hasBusinessCenter: false,
      limits: CRM_LIMITS.FREE,
      usage: { leads: 0, contacts: 0, tasks: 0 },
      canAddLead: true,
      canAddContact: true,
      canAddTask: true,
      leadsRemaining: CRM_LIMITS.FREE.leads,
      contactsRemaining: CRM_LIMITS.FREE.contacts,
      tasksRemaining: CRM_LIMITS.FREE.tasks,
    };
  }

  const usage = {
    leads: distributor.crm_leads_count || 0,
    contacts: distributor.crm_contacts_count || 0,
    tasks: distributor.crm_tasks_count || 0,
  };

  // If has Business Center, unlimited everything
  if (bcStatus.hasSubscription) {
    return {
      hasBusinessCenter: true,
      limits: CRM_LIMITS.BUSINESS_CENTER,
      usage,
      canAddLead: true,
      canAddContact: true,
      canAddTask: true,
      leadsRemaining: -1, // unlimited
      contactsRemaining: -1, // unlimited
      tasksRemaining: -1, // unlimited
    };
  }

  // Free tier limits
  const limits = CRM_LIMITS.FREE;

  return {
    hasBusinessCenter: false,
    limits,
    usage,
    canAddLead: usage.leads < limits.LEADS,
    canAddContact: usage.contacts < limits.CONTACTS,
    canAddTask: usage.tasks < limits.TASKS,
    leadsRemaining: Math.max(0, limits.LEADS - usage.leads),
    contactsRemaining: Math.max(0, limits.CONTACTS - usage.contacts),
    tasksRemaining: Math.max(0, limits.TASKS - usage.tasks),
  };
}

/**
 * Check if distributor can add a lead
 */
export async function canAddLead(distributorId: string): Promise<boolean> {
  const limits = await getCRMUsageLimits(distributorId);
  return limits.canAddLead;
}

/**
 * Check if distributor can add a contact
 */
export async function canAddContact(distributorId: string): Promise<boolean> {
  const limits = await getCRMUsageLimits(distributorId);
  return limits.canAddContact;
}

/**
 * Check if distributor can add a task
 */
export async function canAddTask(distributorId: string): Promise<boolean> {
  const limits = await getCRMUsageLimits(distributorId);
  return limits.canAddTask;
}
