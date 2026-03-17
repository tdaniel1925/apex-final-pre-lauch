# External Platform Webhook Integration

## Overview

This system allows external platforms (jordyn.app, agentpulse.cloud) to send sales webhooks to Apex when a distributor makes a sale on their replicated site.

## Architecture

```
External Platform → POST /api/webhooks/integrations/[platform] → Apex API
                                   ↓
                    1. Verify HMAC signature
                    2. Check idempotency (duplicate order_id)
                    3. Find distributor via replicated_sites
                    4. Apply product mapping (credits/commission)
                    5. Create external_sales record
                    6. Update member credits
                    7. Create earnings_ledger entry
                    8. Log webhook event
```

## Files Created

### Core Webhook Logic

1. **`src/lib/integrations/webhooks/verify-signature.ts`**
   - HMAC-SHA256 signature verification
   - Constant-time comparison (prevents timing attacks)
   - Timestamp validation (prevents replay attacks)

2. **`src/lib/integrations/webhooks/process-sale.ts`**
   - Main sale processing logic
   - Commission calculation based on product mappings
   - Credit updates for members
   - Earnings ledger entries

3. **`src/app/api/webhooks/integrations/[platform]/route.ts`**
   - Generic webhook receiver (works for any platform)
   - Dynamic routing: `/api/webhooks/integrations/jordyn`, `/api/webhooks/integrations/agentpulse`
   - Error handling with proper HTTP status codes
   - Comprehensive logging to `integration_webhook_logs`

### Tests

4. **`tests/unit/lib/integrations/webhooks/verify-signature.test.ts`**
   - 16 tests for signature verification
   - Covers valid/invalid signatures, replay attacks, timestamp validation

5. **`tests/unit/api/webhooks/integrations/route.test.ts`**
   - 8 tests for webhook API endpoint
   - Happy path, error cases, idempotency, security

## Webhook Payload Format

External platforms should send webhooks in this format:

```json
{
  "event": "sale.created",
  "event_id": "evt_123",
  "timestamp": "2026-03-17T12:00:00Z",
  "seller": {
    "user_id": "external_user_123",
    "apex_distributor_id": "optional_uuid"
  },
  "transaction": {
    "order_id": "order_456",
    "amount": 99.00,
    "currency": "USD"
  },
  "product": {
    "product_id": "prod_789",
    "product_name": "Business Starter Pack",
    "quantity": 1
  },
  "customer": {
    "email": "customer@example.com",
    "name": "Jane Smith"
  }
}
```

## Security

### HMAC Signature

Webhooks must include an `x-webhook-signature` header with HMAC-SHA256 signature:

```
x-webhook-signature: abc123...def456
```

**Signature Generation (for external platforms):**

```javascript
const crypto = require('crypto');

const payload = JSON.stringify(webhookData);
const secret = process.env.APEX_WEBHOOK_SECRET; // Provided by Apex

const hmac = crypto.createHmac('sha256', secret);
hmac.update(payload);
const signature = hmac.digest('hex');

// Send in header: x-webhook-signature: <signature>
```

### Idempotency

Webhooks are idempotent via unique constraint on `(integration_id, external_sale_id)`.

If the same `order_id` is sent twice:
- First request: Creates sale, returns 200
- Second request: Returns 200 with message "Already processed"

## Testing

### Example Curl Command

```bash
# 1. Generate signature
SECRET="your_webhook_secret_here"
PAYLOAD='{"event":"sale.created","event_id":"evt_test_123","timestamp":"2026-03-17T12:00:00Z","seller":{"user_id":"ext_user_123"},"transaction":{"order_id":"order_test_456","amount":99.00,"currency":"USD"},"product":{"product_id":"prod_789","product_name":"Test Product","quantity":1},"customer":{"email":"test@example.com","name":"Test Customer"}}'

# Generate HMAC-SHA256 signature (bash)
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -hex | cut -d' ' -f2)

# 2. Send webhook
curl -X POST https://yourapp.com/api/webhooks/integrations/jordyn \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

### Expected Responses

#### Success (200)
```json
{
  "received": true,
  "sale_id": "uuid-of-created-sale"
}
```

#### Already Processed (200)
```json
{
  "received": true,
  "message": "Already processed"
}
```

#### Invalid Signature (401)
```json
{
  "error": "Invalid signature"
}
```

#### Platform Not Found (404)
```json
{
  "error": "Platform not found"
}
```

#### Distributor Not Found (404)
```json
{
  "error": "Distributor not found"
}
```

#### Missing Fields (400)
```json
{
  "error": "Missing required fields (event, transaction.order_id, seller.user_id)"
}
```

#### Internal Error (500)
```json
{
  "error": "Internal server error"
}
```

## Database Tables Used

### `integrations`
Stores platform configuration including `webhook_secret`

### `distributor_replicated_sites`
Links Apex distributors to external platform user IDs

### `integration_product_mappings`
Maps external product IDs to credits and commission percentages

### `external_sales`
Stores all sales from external platforms (unique on `integration_id` + `external_sale_id`)

### `members`
Updated with `personal_credits_monthly`, `tech_personal_credits_monthly`, `insurance_personal_credits_monthly`

### `earnings_ledger`
Records commission earnings for each sale

### `integration_webhook_logs`
Audit log for all webhook requests (success, failure, payload, signature)

## Error Codes Summary

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Sale processed or already processed |
| 400 | Bad Request | Fix payload format |
| 401 | Unauthorized | Check webhook signature |
| 404 | Not Found | Platform or distributor not found |
| 500 | Internal Error | Contact Apex support |

## Admin Configuration

Before external platforms can send webhooks:

1. **Create Integration Record** (in `integrations` table):
   - Set `platform_name` (e.g., "jordyn", "agentpulse")
   - Set `webhook_secret` (shared with external platform)
   - Enable `is_enabled = true`
   - Enable `supports_sales_webhooks = true`

2. **Create Replicated Sites** (in `distributor_replicated_sites` table):
   - Link Apex `distributor_id` to external platform `external_user_id`
   - Set `site_status = 'active'`

3. **Create Product Mappings** (optional, in `integration_product_mappings` table):
   - Map external `product_id` to credits/commission
   - Set `commission_type`: "credits", "percentage", "fixed", or "none"

## Monitoring

All webhook requests are logged to `integration_webhook_logs` with:
- Full payload
- Headers
- Signature verification result
- Processing status
- Error messages (if any)

Query recent webhook failures:

```sql
SELECT *
FROM integration_webhook_logs
WHERE processing_status = 'error'
  AND received_at > NOW() - INTERVAL '24 hours'
ORDER BY received_at DESC;
```

## Support

For integration support, contact: tech@theapexway.net
