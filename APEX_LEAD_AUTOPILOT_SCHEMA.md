# Apex Lead Autopilot Database Schema

## Overview

The Apex Lead Autopilot is a 4-tier meeting invitation and lead automation system with comprehensive CRM, SMS campaigns, social media posting, and team collaboration features.

## Tiers

| Tier | Price | Features |
|------|-------|----------|
| **FREE** | $0 | 10 email invites/month, response tracking |
| **Social Connector** | $9 | 50 email invites/month, 30 social posts/month, 10 event flyers/month |
| **Lead Autopilot Pro** | $79 | Unlimited emails, 500 CRM contacts, 1,000 SMS/month, AI lead scoring, 14-day trial |
| **Team Edition** | $119 | Unlimited everything, team broadcasts, downline communication, training library |

## Database Tables

### 1. autopilot_subscriptions
Tracks subscription tiers for the lead automation system.

**Key Fields:**
- `distributor_id` - FK to distributors table
- `tier` - 'free', 'social_connector', 'lead_autopilot_pro', 'team_edition'
- `status` - 'active', 'canceled', 'past_due', 'trialing', 'paused'
- `stripe_subscription_id`, `stripe_customer_id` - Stripe integration
- `trial_start`, `trial_end` - Trial period tracking
- `current_period_start`, `current_period_end` - Billing periods

**Trigger:** Automatically creates/updates usage limits when subscription is created or tier changes

### 2. meeting_invitations
Email invitations to meetings with comprehensive tracking.

**Key Fields:**
- `distributor_id` - Sender
- `recipient_email`, `recipient_name` - Recipient details
- `meeting_title`, `meeting_description`, `meeting_date_time` - Meeting info
- `meeting_link` - Zoom/Teams/Google Meet URL
- `status` - 'draft', 'sent', 'opened', 'responded_yes', 'responded_no', 'responded_maybe', 'expired', 'canceled'
- `open_count` - Number of times opened
- `response_type` - 'yes', 'no', 'maybe'
- `reminder_count` - Number of reminders sent

### 3. event_flyers
Pre-made event flyers for meetings (Social Connector $9 tier).

**Key Fields:**
- `distributor_id` - Owner
- `flyer_template_id` - Template reference
- `flyer_title`, `event_date`, `event_location` - Event details
- `custom_text`, `custom_colors`, `custom_logo_url` - Customization
- `generated_image_url`, `generated_pdf_url` - Generated outputs
- `status` - 'draft', 'generating', 'ready', 'failed'
- `download_count`, `shared_count` - Usage tracking

### 4. sms_campaigns
Bulk SMS campaigns with automation (Lead Autopilot Pro $79 tier).

**Key Fields:**
- `distributor_id` - Owner
- `campaign_name`, `message_content` - Campaign details
- `character_count`, `estimated_segments` - Auto-calculated for pricing
- `recipient_list_type` - 'all_contacts', 'filtered', 'custom_list', 'single'
- `recipient_filter` - JSONB filter criteria
- `status` - 'draft', 'scheduled', 'sending', 'completed', 'failed', 'canceled'
- `total_recipients`, `total_sent`, `total_delivered`, `total_failed` - Delivery tracking
- `total_responses`, `total_opt_outs` - Response tracking
- `estimated_cost`, `actual_cost` - Cost tracking

### 5. sms_messages
Individual SMS messages within campaigns.

**Key Fields:**
- `campaign_id` - FK to sms_campaigns
- `distributor_id`, `contact_id` - Owner and recipient
- `recipient_phone`, `message_content` - Message details
- `status` - 'pending', 'queued', 'sending', 'sent', 'delivered', 'failed', 'bounced'
- `provider_message_id`, `provider_name` - External provider tracking (Twilio, etc.)
- `response_received`, `response_text` - Response tracking
- `cost` - Individual message cost

### 6. autopilot_usage_limits
Tracks usage against tier limits for each distributor.

**Key Fields:**
- `distributor_id` - One record per distributor (UNIQUE)
- `tier` - Current tier
- `email_invites_used_this_month` / `email_invites_limit`
- `sms_sent_this_month` / `sms_limit`
- `contacts_count` / `contacts_limit`
- `social_posts_this_month` / `social_posts_limit`
- `flyers_created_this_month` / `flyers_limit`
- `broadcasts_this_month` / `broadcasts_limit`
- `training_shares_this_month` / `training_shares_limit`
- `meetings_created_this_month` / `meetings_limit`
- `next_reset_at` - When counters reset (monthly)

**Note:** Limit value of `-1` means unlimited

## Existing Tables (Used by Lead Autopilot)

The system integrates with these existing tables:

- **crm_contacts** - CRM contact management
- **crm_tasks** - Task management for follow-ups
- **team_broadcasts** - Team communication
- **social_content** - Social media content
- **training_*** - Training video system

## Helper Functions

### check_autopilot_limit(distributor_id, limit_type)
Check if distributor has reached their tier limit.

```sql
SELECT check_autopilot_limit('uuid-here', 'email');
-- Returns: true (can send more) or false (limit reached)
```

**Limit types:** 'email', 'sms', 'contacts', 'social', 'flyers', 'broadcasts', 'training', 'meetings'

### increment_autopilot_usage(distributor_id, limit_type, increment)
Increment usage counter after an action.

```sql
SELECT increment_autopilot_usage('uuid-here', 'email', 1);
-- Returns: true (success) or false (failed)
```

### reset_autopilot_usage_counters()
Reset all monthly usage counters (run via cron on 1st of each month).

```sql
SELECT reset_autopilot_usage_counters();
-- Returns: number of records reset
```

### initialize_autopilot_usage_limits()
**Trigger function** - Automatically called when subscription is created or tier changes.

## Tier Limits Configuration

| Feature | FREE | Social ($9) | Pro ($79) | Team ($119) |
|---------|------|-------------|-----------|-------------|
| Email Invites | 10/mo | 50/mo | Unlimited | Unlimited |
| SMS Messages | 0 | 0 | 1,000/mo | Unlimited |
| CRM Contacts | 0 | 0 | 500 | Unlimited |
| Social Posts | 0 | 30/mo | 100/mo | Unlimited |
| Event Flyers | 0 | 10/mo | 50/mo | Unlimited |
| Team Broadcasts | 0 | 0 | 0 | Unlimited |
| Training Shares | 0 | 0 | 0 | Unlimited |

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Distributors
- Can view, create, update, and delete their own records
- Cannot see other distributors' data

### Admins
- Full access to all records across all distributors
- Can manage subscriptions, view analytics, etc.

### Anonymous Users
- No access to any Lead Autopilot tables

## Indexes

All tables are properly indexed for:
- Foreign key columns
- Status columns
- Date/time columns for scheduling
- Search and filter columns

## Migration Files

1. **20260318000004_apex_lead_autopilot_schema.sql** - Initial comprehensive schema (superseded)
2. **20260318000005_apex_lead_autopilot_additions.sql** - Actual applied schema (works with existing CRM tables)
3. **20260318000006_fix_autopilot_trigger.sql** - Fixed ambiguous column reference in trigger

## Application Scripts

- **apply-autopilot-migration.js** - Full migration with verification
- **apply-autopilot-additions.js** - Simplified migration application
- **apply-autopilot-migration-debug.js** - Statement-by-statement debug application

## Tests

**Location:** `tests/unit/autopilot-schema.test.ts`

**Test Coverage:**
- ✅ Subscription creation and tier enforcement
- ✅ Meeting invitation tracking
- ✅ Event flyer generation
- ✅ SMS campaign creation with character counting
- ✅ SMS message delivery tracking
- ✅ Usage limits initialization via trigger
- ✅ Usage tracking
- ✅ Helper function validation

**All 12 tests passing** ✅

## Usage Examples

### Creating a Free Subscription

```typescript
const { data, error } = await supabase
  .from('autopilot_subscriptions')
  .insert({
    distributor_id: distributorId,
    tier: 'free',
    status: 'active',
  });
```

This automatically creates usage limits with:
- email_invites_limit: 10
- All other limits: 0

### Sending a Meeting Invitation

```typescript
// 1. Check limit
const canSend = await supabase.rpc('check_autopilot_limit', {
  p_distributor_id: distributorId,
  p_limit_type: 'email'
});

if (!canSend) {
  throw new Error('Email invite limit reached');
}

// 2. Create invitation
const { data } = await supabase
  .from('meeting_invitations')
  .insert({
    distributor_id: distributorId,
    recipient_email: 'prospect@example.com',
    recipient_name: 'John Prospect',
    meeting_title: 'Business Overview',
    meeting_date_time: new Date('2026-04-01T19:00:00Z'),
    meeting_link: 'https://zoom.us/j/123456789',
    status: 'sent',
    sent_at: new Date(),
  });

// 3. Increment usage
await supabase.rpc('increment_autopilot_usage', {
  p_distributor_id: distributorId,
  p_limit_type: 'email',
  p_increment: 1
});
```

### Creating an SMS Campaign

```typescript
const { data } = await supabase
  .from('sms_campaigns')
  .insert({
    distributor_id: distributorId,
    campaign_name: 'Spring Promotion',
    message_content: 'Join us for our spring promotion! Limited time offer.',
    recipient_list_type: 'all_contacts',
    status: 'scheduled',
    scheduled_for: new Date('2026-04-01T10:00:00Z'),
  });

// Character count and estimated_segments are auto-calculated!
console.log(data.character_count); // 56
console.log(data.estimated_segments); // 1 (under 160 chars)
```

## Next Steps

1. **Subscription Management UI** - Build interface for tier selection and upgrades
2. **Meeting Invitation System** - Email templates, RSVP tracking, calendar integration
3. **Social Media Integration** - Connect Facebook, Instagram, LinkedIn APIs
4. **CRM Interface** - Contact management, pipeline views, AI scoring dashboard
5. **SMS Integration** - Twilio/Plivo integration for sending
6. **Team Broadcast System** - Downline messaging and training sharing
7. **Usage Limit Enforcement** - Frontend checks and upgrade prompts
8. **Stripe Integration** - Subscription payment processing
9. **Analytics Dashboard** - Track invitation opens, response rates, campaign performance
10. **Monthly Cron Job** - Implement usage counter reset

## Support

For questions about the Apex Lead Autopilot schema:
- Schema location: `supabase/migrations/`
- Tests: `tests/unit/autopilot-schema.test.ts`
- Documentation: This file

---

**Created:** 2026-03-18
**Agent:** Agent 4 (Database Schema)
**Status:** ✅ Complete and Tested
