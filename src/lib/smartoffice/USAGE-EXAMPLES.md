# SmartOffice Integration - Usage Examples

This guide shows how to use the custom query builders that match your spec file: **"Requests to fetch Advisor and Policy Details"**

---

## 🔍 Custom Queries Available

All queries from your spec file are pre-built and ready to use:

| Query | Purpose | Source |
|-------|---------|--------|
| `buildAdvisorDetailsQuery()` | Fetch agent with supervisor info | Screenshot #1 |
| `buildPolicyStatusQuery()` | Fetch policy with application history | Screenshot #2 |
| `buildPolicyListQuery()` | Fetch policy with advisor & product details | Screenshot #3 |

---

## 📚 Usage Examples

### 1. Fetch Advisor Details (with Supervisor)

```typescript
import { getSmartOfficeClient, buildAdvisorDetailsQuery } from '@/lib/smartoffice';

async function getAdvisorWithSupervisor(agentId: string) {
  const client = await getSmartOfficeClient();

  // Build the XML query (matches your spec exactly)
  const xml = buildAdvisorDetailsQuery(agentId);

  // Example: agentId = "Agent.5000.1364"
  // This fetches:
  // - Supervisor FirstName, LastName
  // - Contact FirstName, LastName, ReferentName, Source, SubSource

  const response = await client.sendRequest(xml);
  return response;
}
```

**What you get back:**
```json
{
  "id": "Agent.5000.1364",
  "supervisor": {
    "firstName": "John",
    "lastName": "Manager"
  },
  "contact": {
    "firstName": "Jane",
    "lastName": "Agent",
    "referentName": "John Manager",
    "source": "Web",
    "subSource": "Facebook"
  }
}
```

---

### 2. Fetch Policy Status (with Application History)

```typescript
import { getSmartOfficeClient, buildPolicyStatusQuery } from '@/lib/smartoffice';

async function getPolicyStatus(policyNumber: string) {
  const client = await getSmartOfficeClient();

  // Build the XML query (matches Screenshot #2)
  const xml = buildPolicyStatusQuery(policyNumber);

  // Example: policyNumber = "1572022"
  // This fetches:
  // - PolicyDate, PolicyStatus, PolicyStatusText
  // - NBHistorys (application lifecycle tracking)

  const response = await client.sendRequest(xml);
  return response;
}
```

**What you get back:**
```json
{
  "policyNumber": "1572022",
  "policyDate": "2025-01-15",
  "policyStatus": "4",
  "policyStatusText": "Issued",
  "nbHistorys": [
    {
      "status": "Submitted",
      "statusDate": "2025-01-10"
    },
    {
      "status": "Underwriting",
      "statusDate": "2025-01-12"
    },
    {
      "status": "Approved",
      "statusDate": "2025-01-14"
    },
    {
      "status": "Issued",
      "statusDate": "2025-01-15"
    }
  ]
}
```

**Use Case:** Track where policies are in the application process (submitted → underwriting → approved → issued)

---

### 3. Fetch Policy List (with Advisor & Product Details)

```typescript
import { getSmartOfficeClient, buildPolicyListQuery } from '@/lib/smartoffice';

async function getPolicyDetails(policyNumber: string) {
  const client = await getSmartOfficeClient();

  // Build the XML query (matches Screenshot #3)
  const xml = buildPolicyListQuery(policyNumber);

  // Example: policyNumber = "343535"
  // This fetches:
  // - Policy status, carrier, premium
  // - PrimaryAdvisor details (with Source/SubSource)
  // - Product info (InsProductType)
  // - Contact (insured person)

  const response = await client.sendRequest(xml);
  return response;
}
```

**What you get back:**
```json
{
  "policyNumber": "343535",
  "policyStatus": "4",
  "policyStatusText": "In Force",
  "statusDate": "2025-01-15",
  "carrierName": "Pacific Life",
  "commAnnPrem": 5000.00,
  "primaryAdvisor": {
    "firstName": "Jane",
    "lastName": "Agent",
    "source": "Web",
    "subSource": "Facebook"
  },
  "product": {
    "name": "Pacific Indexed UL",
    "insProduct": {
      "insProductType": "IUL",
      "insProductTypeText": "Indexed Universal Life"
    }
  },
  "contact": {
    "firstName": "John",
    "lastName": "Client"
  }
}
```

**Use Case:** Display policy details to agents with full advisor and product information

---

## 🔄 Using in Sync Service

The sync service already uses similar queries, but you can extend it:

```typescript
// src/lib/smartoffice/sync-service.ts

import { buildPolicyStatusQuery, buildAgentsWithSupervisorQuery } from './custom-queries';

export class SmartOfficeSyncService {

  async syncPolicyStatuses() {
    // Get all policies that need status updates
    const policies = await this.supabase
      .from('smartoffice_policies')
      .select('policy_number')
      .is('status_date', null); // Policies without status tracking

    for (const policy of policies.data || []) {
      const xml = buildPolicyStatusQuery(policy.policy_number);
      const response = await this.client.sendRequest(xml);

      // Update database with NBHistory data
      await this.supabase
        .from('smartoffice_policies')
        .update({
          status_history: response.nbHistorys,
          status_date: response.statusDate,
        })
        .eq('policy_number', policy.policy_number);
    }
  }

  async syncAgentHierarchy() {
    const xml = buildAgentsWithSupervisorQuery(100);
    const response = await this.client.sendRequest(xml);

    // Process agents with supervisor relationships
    for (const agent of response.agents) {
      await this.supabase
        .from('smartoffice_agents')
        .upsert({
          smartoffice_id: agent.id,
          supervisor_name: `${agent.supervisor.firstName} ${agent.supervisor.lastName}`,
          // ... other fields
        });
    }
  }
}
```

---

## 🎯 Complete API Route Example

Here's a complete example of an API route that uses your custom queries:

```typescript
// src/app/api/admin/smartoffice/policy/[policyNumber]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSmartOfficeClient, buildPolicyListQuery } from '@/lib/smartoffice';

export async function GET(
  request: NextRequest,
  { params }: { params: { policyNumber: string } }
) {
  try {
    const client = await getSmartOfficeClient();
    const xml = buildPolicyListQuery(params.policyNumber);
    const response = await client.sendRequest(xml);

    return NextResponse.json({
      success: true,
      policy: response,
    });
  } catch (error) {
    console.error('Policy fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch policy'
      },
      { status: 500 }
    );
  }
}
```

---

## 📋 All Available Query Builders

```typescript
// From custom-queries.ts
import {
  buildAdvisorDetailsQuery,      // Get agent with supervisor
  buildPolicyStatusQuery,         // Get policy with application history
  buildPolicyListQuery,           // Get policy with advisor & product
  buildAllPoliciesQuery,          // Get all policies (paginated)
  buildAgentsWithSupervisorQuery, // Get all agents with supervisors
  buildPolicyHistoryQuery,        // Get detailed application lifecycle
} from '@/lib/smartoffice/custom-queries';

// From xml-builder.ts (generic builders)
import {
  buildSearchRequest,   // Generic search
  buildGetRequest,      // Get by ID
  buildUpdateRequest,   // Update object
} from '@/lib/smartoffice/xml-builder';
```

---

## 🔗 Key Fields Explained

### NBHistory (New Business History)
Tracks policy application lifecycle:
- **Submitted** → Application entered
- **Underwriting** → Being reviewed
- **Approved** → Passed underwriting
- **Issued** → Policy issued
- **In Force** → Active policy

### Source/SubSource
Marketing attribution:
- **Source**: Where lead came from (Web, Referral, Event)
- **SubSource**: Specific channel (Facebook, LinkedIn, Conference)

### InsProductType
Product categories:
- **WL** = Whole Life
- **TL** = Term Life
- **IUL** = Indexed Universal Life
- **VUL** = Variable Universal Life
- **FIA** = Fixed Index Annuity

---

## ✅ Summary

**Your spec file queries are now implemented!**

✅ **Query 1** (Advisor Details) → `buildAdvisorDetailsQuery()`
✅ **Query 2** (Policy Status) → `buildPolicyStatusQuery()`
✅ **Query 3** (Policy List) → `buildPolicyListQuery()`

All queries match your spec file exactly and are ready to use in your integration!
