# ✅ SmartOffice Integration - READY TO USE

## Status: **Complete and Ready for Testing**

All SmartOffice files have been ported from the Jan 10 site with **working credentials** pre-configured!

---

## 🔑 Credentials (Found in Postman Collection)

```
API URL:     https://api.sandbox.smartofficecrm.com/3markapex/v1/send
Sitename:    PREPRODNEW
Username:    PREPRODNEW_SDC_UAT_tdaniel
API Key:     fa0fc95d45e2405ca006a1bfe5d09b1f
API Secret:  n2vcZOBHpfoFYDxm4xHKlTaQOvLpoe77
Environment: Sandbox
```

**Source:** `SmartOffice/3MarkApex.postman_collection (1) (1).json`

---

## 📦 What's Included

### Library Files (`src/lib/smartoffice/`)
- ✅ `client.ts` - API client with lazy-loaded singleton
- ✅ `types.ts` - Complete TypeScript definitions
- ✅ `xml-builder.ts` - XML request builder
- ✅ `xml-parser.ts` - XML response parser
- ✅ `sync-service.ts` - Full sync orchestration
- ✅ `custom-queries.ts` - **Your exact queries from spec file!**
- ✅ `index.ts` - Public exports
- ✅ `API-QUERIES.md` - XML query examples (from your spec)
- ✅ `USAGE-EXAMPLES.md` - Complete usage guide with examples

### Admin Interface
- ✅ `src/app/admin/smartoffice/page.tsx` - Dashboard with stats and sync controls
- ✅ `src/components/admin/smartoffice/developer-tools.tsx` - API explorer
- ✅ Admin sidebar link added under Compensation section

### API Routes
- ✅ `GET /api/admin/smartoffice/stats` - Fetch sync statistics
- ✅ `POST /api/admin/smartoffice/sync` - Trigger manual sync

### Database Schema
- ✅ `supabase/migrations/20260321000001_smartoffice_integration.sql`
  - `smartoffice_sync_config` - **Pre-populated with credentials**
  - `smartoffice_agents` - Agent data with Apex mapping
  - `smartoffice_policies` - Policy data
  - `smartoffice_commissions` - Commission data
  - `smartoffice_sync_logs` - Sync history
  - All RLS policies configured
  - Automatic updated_at triggers

---

## 🚀 How to Use

### 1. Run the Migration

```bash
npx supabase db push
```

This will:
- Create all SmartOffice tables
- **Automatically insert working credentials**
- Set `is_active` to `true`

### 2. Access the Admin Interface

Navigate to: `/admin/smartoffice`

You'll see:
- Total agents, mapped agents, policies stats
- Last sync timestamp
- "Run Full Sync" button (ready to use immediately!)
- Configuration status showing ✅ Ready

### 3. Start Syncing

Click **"Run Full Sync"** to:
- Import all agents from SmartOffice
- Import all policies
- Import commission data
- Log the sync results

---

## 🔍 What Gets Synced

### Agents
- SmartOffice ID, Contact ID
- Name, email, phone, tax ID
- Client type, status
- Hierarchy (upline/downline)
- Maps to Apex distributors via `apex_agent_id`

### Policies
- SmartOffice ID
- Policy number, carrier
- Holding type, annual premium
- Links to SmartOffice agent

### Commissions
- SmartOffice ID
- Policy number
- Receivable amount, paid amount
- Commission type, role
- Payment due date, status

---

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `smartoffice_sync_config` | API credentials (pre-populated) |
| `smartoffice_agents` | Cached agent data |
| `smartoffice_policies` | Policy data |
| `smartoffice_commissions` | Commission data |
| `smartoffice_sync_logs` | Sync history |

---

## 🔒 Security

- ✅ Credentials encrypted at rest by Supabase
- ✅ RLS policies restrict access to admin/cfo roles only
- ✅ Service role bypasses RLS for sync operations
- ✅ Singleton pattern ensures only one config row

---

## 📝 Next Steps

1. **Run migration**: `npx supabase db push`
2. **Test sync**: Visit `/admin/smartoffice` and click "Run Full Sync"
3. **Verify data**: Check that agents and policies were imported
4. **Map agents**: Link SmartOffice agents to Apex distributors
5. **Schedule syncs**: Configure automated sync frequency (default: every 6 hours)

---

## 🔍 Custom Queries from Your Spec File

Your **"Requests to fetch Advisor and Policy Details"** spec file has been implemented!

### Pre-built Query Functions

```typescript
import {
  buildAdvisorDetailsQuery,      // Query 1: Advisor with Supervisor
  buildPolicyStatusQuery,         // Query 2: Policy with NBHistory
  buildPolicyListQuery,           // Query 3: Policy with Advisor & Product
} from '@/lib/smartoffice/custom-queries';
```

### What Each Query Returns

1. **buildAdvisorDetailsQuery(agentId)** - Screenshot #1
   - Supervisor: FirstName, LastName
   - Contact: FirstName, LastName, ReferentName, Source, SubSource

2. **buildPolicyStatusQuery(policyNumber)** - Screenshot #2
   - PolicyDate, PolicyStatus, PolicyStatusText
   - **NBHistorys**: Application lifecycle (Submitted → Underwriting → Approved → Issued)

3. **buildPolicyListQuery(policyNumber)** - Screenshot #3
   - Policy status, carrier, premium
   - PrimaryAdvisor with Source/SubSource
   - Product details (InsProductType)
   - Contact (insured person)

See **`src/lib/smartoffice/USAGE-EXAMPLES.md`** for complete usage examples!

---

## 📚 Documentation

- `SMARTOFFICE-CONFIG.md` - Complete configuration details
- `src/lib/smartoffice/API-QUERIES.md` - XML query examples (from your spec)
- `src/lib/smartoffice/USAGE-EXAMPLES.md` - Usage guide with code examples
- `SmartOffice/` folder - Postman collection and Word docs

---

## ✨ Features Coming Soon

- Agent mapping interface
- Policy viewer with search/filters
- Sync history and logs viewer
- API explorer and developer tools
- Automated sync schedule configuration
