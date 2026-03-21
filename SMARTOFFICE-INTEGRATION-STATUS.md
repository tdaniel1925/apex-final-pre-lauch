# SmartOffice Integration - Current Status & Implementation Plan

**Date**: 2026-03-21
**Status**: 🔴 **NOT IMPLEMENTED** (Marketing pages exist, no actual integration)

---

## 📋 EXECUTIVE SUMMARY

SmartOffice integration is **90% incomplete**. While marketing pages exist for the "PulseInsight" feature, there is:
- ❌ NO API integration code
- ❌ NO environment variables configured
- ❌ NO utility library for SmartOffice API calls
- ❌ NO API routes to fetch data
- ✅ Database fields for rank sync tracking (partial implementation)
- ✅ XML API specification document available
- ✅ Marketing pages for PulseInsight module

---

## 🗂️ WHAT EXISTS TODAY

### 1. Marketing Pages (Ready)
| File | Purpose | Status |
|------|---------|--------|
| `src/app/dashboard/agentpulse/page.tsx` | AgentPulse hub with PulseInsight module card | ✅ Complete |
| `src/app/dashboard/agentpulse/pulseinsight/page.tsx` | PulseInsight teaser/preview page | ✅ Complete |

**Marketing Promise**: "Turn ugly SmartOffice spreadsheets into beautiful dashboards with AI chat"

### 2. Database Fields (Partial)
| Table | Fields | Purpose | Status |
|-------|--------|---------|--------|
| `rank_upgrade_requests` | `smart_office_updated` | Track if rank was synced to SmartOffice | ✅ Exists |
| `rank_upgrade_requests` | `smart_office_updated_at` | Timestamp of sync | ✅ Exists |
| `rank_upgrade_requests` | `smart_office_updated_by` | Who performed the sync | ✅ Exists |
| `rank_upgrade_requests` | `carrier_contracts_updated` | Track if carrier contracts updated | ✅ Exists |
| `rank_upgrade_requests` | `carrier_contracts_updated_at` | Timestamp of carrier sync | ✅ Exists |

**Database Migration**: `supabase/migrations/20260311000003_dependency_connections.sql` (Lines 71-91)

### 3. API Specification (Ready)
| File | Content | Status |
|------|---------|--------|
| `Requests to fetch Advisor and Policy Details` | XML queries for SmartOffice API | ✅ Complete |

**Contains 3 Query Types**:
1. **Advisor Details Query** - Fetch agent supervisor, contact info
2. **Policy Status Query** - Fetch policy status, dates, history for specific policy number
3. **Policy List Query** - Fetch multiple policies with advisor, product, contact details

---

## ❌ WHAT'S MISSING

### 1. Environment Variables
**File**: `.env.local` (not in .env.example)

**Needed**:
```bash
# SmartOffice API Credentials
SMARTOFFICE_API_URL="https://api.smartoffice.com/v1"
SMARTOFFICE_API_KEY="your-api-key-here"
SMARTOFFICE_USERNAME="your-username"
SMARTOFFICE_PASSWORD="your-password"
SMARTOFFICE_CLIENT_ID="your-client-id"
```

### 2. API Integration Library
**File**: `src/lib/smartoffice/client.ts` (DOES NOT EXIST)

**Needs**:
- XML request builder
- HTTP client with authentication
- Type-safe response parsing
- Error handling

### 3. TypeScript Types
**File**: `src/types/smartoffice.ts` (DOES NOT EXIST)

**Needs**:
- `Advisor` interface
- `Policy` interface
- `PolicyStatus` interface
- `NBHistory` interface
- API response types

### 4. API Routes
**Files**: (NONE EXIST)

**Needed**:
- `src/app/api/smartoffice/advisors/[agentId]/route.ts` - Fetch advisor details
- `src/app/api/smartoffice/policies/[policyNumber]/route.ts` - Fetch single policy
- `src/app/api/smartoffice/policies/list/route.ts` - Fetch policy list
- `src/app/api/smartoffice/sync-rank/route.ts` - Sync rank upgrades to SmartOffice

### 5. Admin UI for Rank Sync
**Current Issue**: Database fields exist but no UI to manually trigger sync

**Needed**:
- Admin page to view pending rank syncs
- Button to manually sync rank to SmartOffice
- Status indicators (synced, pending, failed)

### 6. PulseInsight Dashboard
**Current Status**: Marketing page only (no functional dashboard)

**Needed**:
- Dashboard page to display SmartOffice data
- AI chat interface
- Report beautification engine
- Email ingestion system

---

## 🔧 XML API SPECIFICATION ANALYSIS

### Query 1: Fetch Advisor Details
```xml
<search>
  <object>
    <Agent id = "Agent.5000.1364">
      <Supervisor>
        <FirstName/>
        <LastName/>
      </Supervisor>
      <Contact>
        <FirstName/>
        <LastName/>
        <ReferentName/>
        <Source/>
        <SubSource/>
      </Contact>
    </Agent>
  </object>
</search>
```

**Purpose**: Get supervisor and contact information for a specific agent ID

**TypeScript Response Type**:
```typescript
interface AdvisorDetails {
  agentId: string;
  supervisor: {
    firstName: string;
    lastName: string;
  };
  contact: {
    firstName: string;
    lastName: string;
    referentName: string;
    source: string;
    subSource: string;
  };
}
```

---

### Query 2: Fetch Policy Status
```xml
<search>
  <object>
    <Policy>
      <PolicyDate/>
      <PolicyStatus/>
      <PolicyStatusText/>
      <NBHistorys>
        <NBHistory>
          <Status/>
          <StatusDate/>
        </NBHistory>
      </NBHistorys>
    </Policy>
  </object>
  <condition>
    <expr prop="Policy.PolicyNumber" op="eq">
      <v>1572022</v>
    </expr>
  </condition>
</search>
```

**Purpose**: Get policy status and history for a specific policy number

**TypeScript Response Type**:
```typescript
interface PolicyStatus {
  policyNumber: string;
  policyDate: string;
  policyStatus: string;
  policyStatusText: string;
  nbHistory: Array<{
    status: string;
    statusDate: string;
  }>;
}
```

---

### Query 3: Fetch Policy List
```xml
<search>
  <object>
    <Policy>
      <PolicyStatus/>
      <PolicyStatusText/>
      <StatusDate/>
      <CarrierName/>
      <CommAnnPrem/>
      <PrimaryAdvisor>
        <LastName />
        <FirstName />
        <Source/>
        <SubSource/>
      </PrimaryAdvisor>
      <Product>
        <Name/>
        <InsProduct>
          <InsProductType/>
          <InsProductTypeText/>
        </InsProduct>
      </Product>
      <Contact>
        <FirstName/>
        <LastName/>
      </Contact>
    </Policy>
  </object>
  <condition>
    <expr prop="Policy.PolicyNumber" op="eq">
      <v>343535</v>
    </expr>
  </condition>
</search>
```

**Purpose**: Get comprehensive policy details including advisor, product, and contact

**TypeScript Response Type**:
```typescript
interface PolicyDetails {
  policyNumber: string;
  policyStatus: string;
  policyStatusText: string;
  statusDate: string;
  carrierName: string;
  commAnnPrem: number;
  primaryAdvisor: {
    firstName: string;
    lastName: string;
    source: string;
    subSource: string;
  };
  product: {
    name: string;
    insProductType: string;
    insProductTypeText: string;
  };
  contact: {
    firstName: string;
    lastName: string;
  };
}
```

---

## 🎯 IMPLEMENTATION PLAN (8 Tasks)

### Phase 1: Foundation (Day 1-2)
| # | Task | Estimate | Priority |
|---|------|----------|----------|
| 1 | Add SmartOffice env vars to `.env.example` and `.env.local` | 15 min | 🔴 Critical |
| 2 | Create TypeScript types (`src/types/smartoffice.ts`) | 30 min | 🔴 Critical |
| 3 | Create SmartOffice API client library (`src/lib/smartoffice/client.ts`) | 2 hours | 🔴 Critical |

### Phase 2: API Routes (Day 2-3)
| # | Task | Estimate | Priority |
|---|------|----------|----------|
| 4 | Create advisor details API route | 45 min | 🟡 High |
| 5 | Create policy status API route | 45 min | 🟡 High |
| 6 | Create policy list API route | 45 min | 🟡 High |

### Phase 3: Rank Sync (Day 3-4)
| # | Task | Estimate | Priority |
|---|------|----------|----------|
| 7 | Create rank sync API route | 1 hour | 🟡 High |
| 8 | Add admin UI for manual rank sync | 1.5 hours | 🟢 Medium |

### Phase 4: PulseInsight Dashboard (Day 4-7)
| # | Task | Estimate | Priority |
|---|------|----------|----------|
| 9 | Create PulseInsight dashboard page | 3 hours | 🟢 Medium |
| 10 | Add AI chat interface | 2 hours | 🟢 Medium |
| 11 | Implement report beautification | 4 hours | 🟢 Medium |
| 12 | Set up email ingestion system | 3 hours | 🟢 Medium |

**Total Estimate**: 18-20 hours (4-5 days)

---

## 🚀 QUICKSTART: Complete SmartOffice Integration

### Step 1: Get SmartOffice Credentials
Contact SmartOffice to obtain:
- API URL
- API Key
- Username/Password
- Client ID

### Step 2: Add Environment Variables
```bash
# Add to .env.local
SMARTOFFICE_API_URL="https://api.smartoffice.com/v1"
SMARTOFFICE_API_KEY="your-actual-key"
SMARTOFFICE_USERNAME="your-username"
SMARTOFFICE_PASSWORD="your-password"
SMARTOFFICE_CLIENT_ID="your-client-id"
```

### Step 3: Install Dependencies (if needed)
```bash
npm install xml2js fast-xml-parser
# For XML parsing and building
```

### Step 4: Run Implementation Scripts
I'll create the following files in sequence:
1. `src/types/smartoffice.ts`
2. `src/lib/smartoffice/client.ts`
3. `src/app/api/smartoffice/*/route.ts`

---

## ⚠️ CRITICAL QUESTIONS FOR USER

Before implementing, we need answers to:

1. **SmartOffice API Type**: Is this SOAP/XML or REST/JSON?
   - The XML spec suggests SOAP
   - Do you have API documentation?

2. **Authentication Method**:
   - API Key in header?
   - Basic Auth?
   - OAuth?
   - Session-based?

3. **API Endpoint**: What's the actual SmartOffice API URL?

4. **Agent ID Format**: In the XML, I see `Agent.5000.1364`
   - Is this the format for all agent IDs?
   - Where do we store this in our database?

5. **Rank Sync Direction**:
   - Do we push ranks TO SmartOffice?
   - Do we pull ranks FROM SmartOffice?
   - Bi-directional sync?

6. **PulseInsight Priority**:
   - Is PulseInsight launching soon?
   - Or should we focus on rank sync first?

---

## 📊 CURRENT STATUS SCORECARD

| Category | Status | Percentage |
|----------|--------|------------|
| **Marketing/UI** | ✅ Complete | 100% |
| **Database Schema** | 🟡 Partial | 40% |
| **API Integration** | ❌ Not Started | 0% |
| **Type Definitions** | ❌ Not Started | 0% |
| **Environment Setup** | ❌ Not Started | 0% |
| **API Routes** | ❌ Not Started | 0% |
| **Admin UI** | ❌ Not Started | 0% |
| **PulseInsight Dashboard** | ❌ Not Started | 0% |

**Overall Completion**: **~10%**

---

## 🎯 RECOMMENDED NEXT STEPS

### Option A: Just Rank Sync (Minimal Integration)
**Goal**: Enable manual rank sync to SmartOffice
**Time**: 4-5 hours
**Tasks**: #1-3, #7-8

### Option B: Full Data Integration (No Dashboard)
**Goal**: Fetch all SmartOffice data via API
**Time**: 7-8 hours
**Tasks**: #1-8

### Option C: Complete PulseInsight (Full Build)
**Goal**: Launch functional PulseInsight module
**Time**: 18-20 hours
**Tasks**: All tasks #1-12

---

## 📝 NOTES

- SmartOffice appears to use **XML-based SOAP API** (not modern REST)
- Will need XML parsing library (xml2js or fast-xml-parser)
- Marketing pages promise AI chat and report beautification
- Database fields already exist for rank sync tracking
- PulseInsight is part of "AgentPulse Marketing Suite" launching Feb 28, 2025

---

**Next Action**:
1. User provides SmartOffice API credentials and documentation
2. Answer critical questions above
3. Choose Option A, B, or C
4. Begin implementation
