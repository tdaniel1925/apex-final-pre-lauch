import { z } from 'zod';

// Fixed notification preferences schema - all fields required (not optional with defaults)
export const notificationPreferencesSchema = z.object({
  // Commissions & Payouts
  commission_credited_email: z.boolean(),
  commission_credited_sms: z.boolean(),
  commission_credited_push: z.boolean(),
  commission_credited_inapp: z.boolean(),

  payout_processed_email: z.boolean(),
  payout_processed_sms: z.boolean(),
  payout_processed_push: z.boolean(),
  payout_processed_inapp: z.boolean(),

  bonus_unlocked_email: z.boolean(),
  bonus_unlocked_sms: z.boolean(),
  bonus_unlocked_push: z.boolean(),
  bonus_unlocked_inapp: z.boolean(),

  // Team Activity
  new_recruit_email: z.boolean(),
  new_recruit_sms: z.boolean(),
  new_recruit_push: z.boolean(),
  new_recruit_inapp: z.boolean(),

  team_rankup_email: z.boolean(),
  team_rankup_sms: z.boolean(),
  team_rankup_push: z.boolean(),
  team_rankup_inapp: z.boolean(),

  team_inactive_email: z.boolean(),
  team_inactive_sms: z.boolean(),
  team_inactive_push: z.boolean(),
  team_inactive_inapp: z.boolean(),

  // Customers & Orders
  customer_order_email: z.boolean(),
  customer_order_sms: z.boolean(),
  customer_order_push: z.boolean(),
  customer_order_inapp: z.boolean(),

  autoship_renewal_email: z.boolean(),
  autoship_renewal_sms: z.boolean(),
  autoship_renewal_push: z.boolean(),
  autoship_renewal_inapp: z.boolean(),

  customer_cancellation_email: z.boolean(),
  customer_cancellation_sms: z.boolean(),
  customer_cancellation_push: z.boolean(),
  customer_cancellation_inapp: z.boolean(),

  // System & Security
  new_login_email: z.boolean(),
  new_login_sms: z.boolean(),
  new_login_push: z.boolean(),
  new_login_inapp: z.boolean(),

  corporate_announcements_email: z.boolean(),
  corporate_announcements_sms: z.boolean(),
  corporate_announcements_push: z.boolean(),
  corporate_announcements_inapp: z.boolean(),
});
