# User Sync System Documentation

## Overview

The User Sync System automatically creates replicated sites for distributors on external platforms (e.g., jordyn.app, agentpulse.cloud) when they sign up.

## Architecture

### Database Tables

#### `platform_integrations`
Stores configuration for external platforms.

**Key Fields:**
- `platform_name` - Unique platform identifier (e.g., 'jordyn', 'agentpulse')
- `api_endpoint` - Full API URL for user creation
- `auth_type` - Authentication method: 'bearer', 'basic', 'api_key'
- `sync_users` - Auto-create users on signup (boolean)
- `enabled` - Master switch (boolean)
- `site_url_pattern` - Pattern for generating URLs (use `{username}` placeholder)
- `max_retry_attempts` - Maximum retry attempts for failed creations

#### `distributor_replicated_sites`
Tracks replicated sites for each distributor.

**Key Fields:**
- `distributor_id` - Foreign key to distributors table
- `integration_id` - Foreign key to platform_integrations table
- `site_url` - Full URL of the replicated site
- `external_user_id` - User ID on external platform
- `status` - 'pending', 'active', 'failed', 'suspended'
- `sync_attempts` - Number of sync attempts made
- `last_sync_error` - Last error message (if failed)

### Service Layer

**File:** `src/lib/integrations/user-sync/service.ts`

#### Core Functions

##### `createReplicatedSites(distributorId: string)`
- Called after distributor creation in signup flow
- Fetches all enabled integrations where `sync_users=true`
- Creates sites on each platform sequentially
- Errors are logged but don't throw (signup should not fail)

##### `createReplicatedSite(integrationId: string, distributorId: string)`
- Creates a single replicated site
- Calls external platform API
- Stores result in database
- Returns `CreateReplicatedSiteResult`

##### `retryFailedSites(distributorId: string, integrationId?: string)`
- Retries failed site creations
- Respects `max_retry_attempts`
- Can retry specific integration or all failed sites
- Returns array of results

##### `getDistributorReplicatedSites(distributorId: string)`
- Fetches all replicated sites for a distributor
- Includes integration details via join

### API Endpoints

#### POST `/api/admin/integrations/sync-user`
Manual sync endpoint for admins.

**Request Body:**
```json
{
  "distributor_id": "uuid",
  "integration_id": "uuid", // optional
  "action": "sync_all" | "sync_specific" | "retry_failed"
}
```

**Actions:**
- `sync_all` - Create sites on all enabled integrations
- `sync_specific` - Create site on specific integration (requires `integration_id`)
- `retry_failed` - Retry all failed site creations

#### GET/POST `/api/cron/sync-failed-sites`
Cron job endpoint for retrying failed sites.

**Security:**
- Requires `CRON_SECRET` header: `Authorization: Bearer <CRON_SECRET>`
- Or can be called by authenticated admin

**Behavior:**
- Finds all failed sites with `status='failed'`
- Filters sites that haven't exceeded `max_retry_attempts`
- Retries each distributor's failed sites
- Returns statistics: processed, retried, succeeded, failed

### Admin UI

**Page:** `/admin/distributors/[id]/replicated-sites`

**Features:**
- View all replicated sites for a distributor
- See site status, URLs, and sync history
- Retry failed site creations
- Sync all integrations manually
- Click site URLs to visit (when active)

## Integration Flow

### 1. Signup Flow
```
User Signs Up
    ↓
Create Auth User
    ↓
Create Distributor
    ↓
Create Member Record
    ↓
Enroll in Email Campaign
    ↓
→ Create Replicated Sites ← (NEW)
    ↓
Return Success
```

### 2. Site Creation Flow
```
createReplicatedSites(distributorId)
    ↓
Fetch enabled integrations (sync_users=true)
    ↓
For each integration:
    ↓
  createReplicatedSite(integrationId, distributorId)
      ↓
    Fetch integration config
      ↓
    Fetch distributor data
      ↓
    Generate site URL from pattern
      ↓
    Call external platform API
      ↓
    Store result in database
      ↓
    Return success/failure
```

### 3. External API Call
```
Prepare Headers (based on auth_type)
    ↓
Prepare Request Body
    ↓
POST to external API (with 30s timeout)
    ↓
Handle Response
    ↓
Extract external_user_id
    ↓
Return result
```

## Error Handling

### Principles
1. **Never fail signup** - All errors are logged but don't throw
2. **Store failed attempts** - Record in database for manual retry
3. **Graceful degradation** - If one platform fails, others still process
4. **Retry with exponential backoff** - Use `retry_delay_seconds` from config

### Error Scenarios

| Scenario | Behavior |
|----------|----------|
| External API down | Log error, store failed status, continue signup |
| Network timeout (30s) | Log timeout, store failed status, continue signup |
| Invalid credentials | Log error, store failed status, continue signup |
| Distributor not found | Return error immediately, don't create record |
| Integration not found | Return error immediately, don't create record |
| Database error | Log error, attempt to store failed record |
| Max retries exceeded | Skip retry, keep failed status |

## Setup Instructions

### 1. Run Migration
```bash
# Apply the migration to create tables
supabase db push
```

### 2. Configure Integrations
Insert integration records or use the seeded examples:

```sql
INSERT INTO platform_integrations (
  platform_name,
  platform_display_name,
  platform_url,
  api_endpoint,
  api_key_encrypted,
  auth_type,
  sync_users,
  enabled,
  site_url_pattern
) VALUES (
  'jordyn',
  'Jordyn.app',
  'https://jordyn.app',
  'https://jordyn.app/api/v1/users/create',
  'your-api-key-here',
  'bearer',
  true,
  true,
  '{username}.jordyn.app'
);
```

### 3. Set Environment Variables
```bash
# For cron job security
CRON_SECRET=your-secret-here
```

### 4. Set Up Cron Job (Optional)
Configure Vercel Cron or similar service to call:
```
POST https://your-domain.com/api/cron/sync-failed-sites
Authorization: Bearer <CRON_SECRET>
```

**Recommended Schedule:** Daily at 2 AM UTC

## Testing

### Manual Testing

#### Test Site Creation
1. Sign up a new distributor
2. Check console logs for sync messages
3. Visit `/admin/distributors/[id]/replicated-sites`
4. Verify sites were created

#### Test Failed Site Retry
1. Temporarily disable external API
2. Sign up a distributor (should fail)
3. Re-enable external API
4. Click "Retry" button in admin UI
5. Verify site is now active

#### Test Cron Job
```bash
curl -X POST https://your-domain.com/api/cron/sync-failed-sites \
  -H "Authorization: Bearer your-cron-secret"
```

### Automated Tests
Run the test suite:
```bash
npm run test tests/services/user-sync.test.ts
```

## Security Considerations

### API Key Storage
- **Development:** Keys stored in plain text in database
- **Production:** Encrypt keys using a secure encryption library
- Use environment variables for sensitive keys when possible

### RLS Policies
- Admins can view/edit all integrations and sites
- Distributors can only view their own sites
- Service role has full access for automated sync

### Cron Job Security
- Requires `CRON_SECRET` header to prevent unauthorized calls
- Secret should be stored in environment variables
- Rotate secret regularly

## Monitoring

### Key Metrics to Track
- Signup success rate (with vs without replication)
- Site creation success rate per platform
- Average sync time per platform
- Failed sites count and reasons
- Retry success rate

### Logging
All operations log to console with prefix:
- `[UserSync]` - Service layer operations
- `[AdminSync]` - Manual admin sync operations
- `[CronJob]` - Cron job operations
- `[Signup]` - Signup flow integration

### Recommended Alerts
- Alert if failed sites exceed threshold (e.g., 10%)
- Alert if external API timeouts exceed 5%
- Alert if cron job fails to run

## Future Enhancements

### Phase 2
- [ ] Webhook support for site activation callbacks
- [ ] Site suspension/reactivation
- [ ] Site deletion on distributor deletion
- [ ] Bulk sync for existing distributors
- [ ] Real-time sync status updates (WebSocket)

### Phase 3
- [ ] Multi-region API endpoints
- [ ] Site analytics integration
- [ ] Custom domain support per distributor
- [ ] Site template customization

## Troubleshooting

### Sites Not Created on Signup
1. Check integration is enabled: `enabled=true`
2. Check integration sync is enabled: `sync_users=true`
3. Check API credentials are valid
4. Check console logs for errors

### Sites Stuck in Failed Status
1. Check `last_sync_error` field for error message
2. Verify external platform API is accessible
3. Check `sync_attempts` vs `max_retry_attempts`
4. Use admin UI to manually retry

### Cron Job Not Running
1. Verify `CRON_SECRET` is set correctly
2. Check cron service configuration (Vercel Cron, etc.)
3. Test endpoint manually with curl
4. Check server logs for errors

## API Documentation

### External Platform API Requirements

Your external platforms must expose an API endpoint that accepts:

**POST** `/api/v1/users/create`

**Headers:**
- `Authorization: Bearer <api_key>` (for Bearer auth)
- `X-API-Key: <api_key>` (for API key auth)
- `Authorization: Basic <base64_credentials>` (for Basic auth)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "username": "john-doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "company_name": "Acme Inc",
  "phone": "+1234567890"
}
```

**Response (Success):**
```json
{
  "user_id": "external-user-123",
  "site_url": "john-doe.platform.com",
  "status": "active"
}
```

**Response (Error):**
```json
{
  "error": "User already exists",
  "code": "DUPLICATE_USER"
}
```

## Support

For questions or issues:
1. Check this documentation
2. Review console logs
3. Check admin UI for site status
4. Contact system administrator
