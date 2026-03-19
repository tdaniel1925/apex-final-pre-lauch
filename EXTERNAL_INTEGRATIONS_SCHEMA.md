# External Integrations System - Schema Documentation

**Created:** 2026-03-17
**Migration File:** `supabase/migrations/20260317181850_external_integrations_system.sql`
**Types File:** `src/lib/types/index.ts` (lines 182-423)

## Overview

This system enables Apex MLM to integrate with external platforms (jordyn.app, agentpulse.cloud, etc.) to:
1. Create and track replicated sites for distributors
2. Receive and process sales webhooks
3. Map external products to internal credits and commissions
4. Maintain audit logs of all webhook activity

## Database Schema

### 1. `integrations`
Master configuration for each external platform.

**Key Fields:**
- `platform_name` - Unique identifier (e.g., 'jordyn', 'agentpulse')
- `display_name` - User-friendly name
- `api_endpoint` - Base API URL
- `webhook_secret` - For verifying webhook signatures
- `supports_replicated_sites` - Whether platform supports site creation
- `supports_sales_webhooks` - Whether platform sends sales webhooks
- `auto_create_site_on_signup` - Whether to auto-create sites on distributor signup

**Indexes:**
- `idx_integrations_platform` - Fast lookup by platform name
- `idx_integrations_enabled` - Filter enabled integrations

### 2. `distributor_replicated_sites`
Tracks each distributor's replicated site on external platforms.

**Key Fields:**
- `distributor_id` - Foreign key to distributors table
- `integration_id` - Foreign key to integrations table
- `external_site_id` - Platform's unique ID for the site
- `site_url` - Full URL to the replicated site
- `site_status` - 'pending' | 'active' | 'suspended' | 'deleted'
- `sync_status` - 'synced' | 'pending' | 'error'
- `site_metadata` - JSONB for platform-specific data

**Constraints:**
- One site per distributor per platform
- External site ID must be unique within platform

**Indexes:**
- `idx_repl_sites_distributor` - Fast lookup by distributor
- `idx_repl_sites_integration` - Fast lookup by integration
- `idx_repl_sites_external_id` - Fast lookup by external ID

### 3. `integration_product_mappings`
Maps external platform products to internal credits and commissions.

**Key Fields:**
- `integration_id` - Foreign key to integrations table
- `product_id` - Foreign key to products table (nullable)
- `external_product_id` - Platform's product ID
- `tech_credits` - Tech ladder credits earned
- `insurance_credits` - Insurance ladder credits earned
- `direct_commission_percentage` - Direct commission %
- `override_commission_percentage` - Override commission %
- `fixed_commission_amount` - Fixed dollar amount (alternative)
- `commission_type` - 'credits' | 'percentage' | 'fixed' | 'none'

**Indexes:**
- `idx_prod_mappings_integration` - Fast lookup by integration
- `idx_prod_mappings_external_id` - Fast lookup by external product ID
- `idx_prod_mappings_active` - Filter active mappings

### 4. `external_sales`
Sales received from external platforms via webhooks.

**Key Fields:**
- `integration_id` - Foreign key to integrations table
- `distributor_id` - Seller (foreign key to distributors)
- `external_sale_id` - Platform's unique order/sale ID
- `sale_amount` - Sale amount in dollars
- `tech_credits_earned` - Calculated tech credits
- `insurance_credits_earned` - Calculated insurance credits
- `commission_amount` - Calculated commission
- `sale_status` - 'pending' | 'completed' | 'refunded' | 'canceled'
- `sale_date` - When sale occurred on external platform
- `processed_at` - When we received the webhook
- `webhook_payload` - Full webhook payload (JSONB)
- `commission_applied` - Whether credits/commission applied

**Constraints:**
- Unique constraint on (integration_id, external_sale_id) prevents duplicate processing

**Indexes:**
- `idx_ext_sales_distributor` - Fast lookup by distributor
- `idx_ext_sales_external_id` - Fast lookup by external sale ID
- `idx_ext_sales_commission_applied` - Filter unapplied commissions

### 5. `integration_webhook_logs`
Audit log for all webhook requests received.

**Key Fields:**
- `integration_id` - Foreign key to integrations table
- `webhook_event_type` - Event type (e.g., 'sale.created')
- `webhook_signature` - Signature for verification
- `signature_verified` - Whether signature was valid
- `payload` - Full webhook payload (JSONB)
- `processing_status` - 'pending' | 'processing' | 'success' | 'error' | 'ignored'
- `error_message` - Error message if processing failed
- `retry_count` - Number of retry attempts

**Indexes:**
- `idx_webhook_logs_integration` - Fast lookup by integration
- `idx_webhook_logs_event_type` - Filter by event type
- `idx_webhook_logs_status` - Filter by processing status

## TypeScript Types

All types are exported from `src/lib/types/index.ts`:

- `Integration` - Platform configuration
- `DistributorReplicatedSite` - Replicated site record
- `IntegrationProductMapping` - Product mapping
- `ExternalSale` - External sale record
- `IntegrationWebhookLog` - Webhook audit log
- `DistributorReplicatedSiteInsert` - Insert type (omits auto-generated fields)
- `ExternalSaleInsert` - Insert type (omits auto-generated fields)
- `IntegrationWithStats` - Integration with usage statistics

## Row Level Security

All tables have RLS enabled:

- **Integrations:** Admin access only
- **Replicated Sites:** Distributors can view their own, admins can view all
- **Product Mappings:** Admin access only
- **External Sales:** Distributors can view their own, admins can view all
- **Webhook Logs:** Admin access only

## Helper Functions

### `get_replicated_site_url(distributor_id, platform_name)`
Returns active replicated site URL for a distributor on a specific platform.

### `has_replicated_site(distributor_id, platform_name)`
Checks if distributor has an active replicated site on a platform.

## Seeded Data

The migration seeds two initial integrations:
1. **Jordyn.app** - AI-powered sales assistant platform
2. **AgentPulse Cloud** - Insurance agent CRM

Both are disabled by default until API keys are configured.

## Usage Example

```typescript
import type { Integration, ExternalSale } from '@/lib/types';

// Get active integrations
const { data: integrations } = await supabase
  .from('integrations')
  .select('*')
  .eq('is_enabled', true);

// Get distributor's replicated sites
const { data: sites } = await supabase
  .from('distributor_replicated_sites')
  .select(`
    *,
    integration:integrations(display_name, platform_name)
  `)
  .eq('distributor_id', distributorId)
  .eq('site_status', 'active');

// Get external sales for distributor
const { data: sales } = await supabase
  .from('external_sales')
  .select('*')
  .eq('distributor_id', distributorId)
  .eq('commission_applied', false);
```

## Testing

Test file: `tests/unit/types/external-integrations.test.ts`

Tests verify:
- Type definitions match database schema
- Enum values are correctly enforced
- Nullable fields are properly typed
- Insert types omit auto-generated fields
- Extended types include statistics

Run tests:
```bash
npm test -- tests/unit/types/external-integrations.test.ts
```

## Next Steps

1. **Create Webhook Endpoint:** Build API route at `/api/webhooks/[platform]` to receive webhooks
2. **Implement Signature Verification:** Verify webhook signatures using `webhook_secret`
3. **Create Product Mapping UI:** Admin interface to map external products to credits
4. **Build Site Creation Logic:** Service to create replicated sites via platform APIs
5. **Commission Application:** Process external sales and apply credits to distributors

## Notes

- This schema is separate from any other integration systems (user sync, etc.)
- JSONB fields (`integration_metadata`, `site_metadata`, `webhook_payload`) provide flexibility for platform-specific data
- All timestamps use `TIMESTAMPTZ` for proper timezone handling
- Foreign key constraints use appropriate `ON DELETE` actions (CASCADE for child records, RESTRICT for referenced data)
