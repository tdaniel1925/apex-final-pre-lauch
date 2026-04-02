export interface FulfillmentNote {
  id: string;
  onboarding_session_id: string;
  admin_id: string;
  note_text: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  admin_distributor?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const FULFILLMENT_STAGES = [
  'payment_made',
  'onboarding_scheduled',
  'onboarding_complete',
  'building_pages',
  'social_proofs',
  'content_approved',
  'campaigns_live',
  'completed'
] as const;

export type FulfillmentStage = typeof FULFILLMENT_STAGES[number];

export const STAGE_LABELS: Record<FulfillmentStage, string> = {
  payment_made: 'Payment Made',
  onboarding_scheduled: 'Onboarding Scheduled',
  onboarding_complete: 'Onboarding Complete',
  building_pages: 'Building Pages',
  social_proofs: 'Social Proofs',
  content_approved: 'Content Approved',
  campaigns_live: 'Campaigns Live',
  completed: 'Completed'
};
