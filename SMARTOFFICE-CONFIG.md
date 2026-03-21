# SmartOffice Integration Configuration

## Configuration Source
Found in: `C:\dev\1 - Jan. 10 Apex Site\apex-app\supabase\migrations\20260112100000_smartoffice_integration.sql`

## API Configuration

### Sandbox Environment (Current)
```
API URL: https://api.sandbox.smartofficecrm.com/3markapex/v1/send
Sitename: PREPRODNEW
Username: PREPRODNEW_SDC_UAT_tdaniel
API Key: fa0fc95d45e2405ca006a1bfe5d09b1f
API Secret: n2vcZOBHpfoFYDxm4xHKlTaQOvLpoe77
Environment: Sandbox
```

**Source:** Found in `SmartOffice/3MarkApex.postman_collection (1) (1).json`

### Storage Architecture
**IMPORTANT:** SmartOffice credentials are **NOT stored as environment variables**.

Credentials are stored in the **database** in the `smartoffice_sync_config` table:
- `api_url` - `https://api.sandbox.smartofficecrm.com/3markapex/v1/send` ✅
- `sitename` - `PREPRODNEW` ✅
- `username` - `PREPRODNEW_SDC_UAT_tdaniel` ✅
- `api_key` - `fa0fc95d45e2405ca006a1bfe5d09b1f` ✅
- `api_secret` - `n2vcZOBHpfoFYDxm4xHKlTaQOvLpoe77` ✅
- `is_active` - `true` ✅
- `sync_frequency_hours` - `6` ✅

### ✅ Configuration Complete

**The migration automatically inserts working credentials!**

When you run the migration, it will:
1. Create all SmartOffice tables
2. Insert the configuration row with working credentials
3. Set `is_active` to `true`
4. You can immediately start syncing data

**No manual configuration required!**

**Option 3: Via Admin UI (Coming Soon)**
The Jan 10 site has a configuration UI in the admin page that allows updating credentials through a form.

## Security Notes
- Credentials are encrypted at rest by Supabase
- Only one config row is allowed (singleton pattern via unique index)
- Access is restricted via RLS policies (admin/cfo roles only)
- The service role bypasses RLS for sync operations

## API Endpoints Created
- `GET /api/admin/smartoffice/stats` - Fetch sync statistics
- `POST /api/admin/smartoffice/sync` - Trigger manual sync

## Database Tables Created
- `smartoffice_sync_config` - API credentials and settings
- `smartoffice_agents` - Cached agent data with Apex mapping
- `smartoffice_policies` - Policy data
- `smartoffice_commissions` - Commission data
- `smartoffice_sync_logs` - Sync history

## XML API Documentation
Located at: `src/lib/smartoffice/API-QUERIES.md`

Contains three query types:
1. Advisor Details Query
2. Policy Status Query
3. Policy List Query
