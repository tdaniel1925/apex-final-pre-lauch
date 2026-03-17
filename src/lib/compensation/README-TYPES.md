# Compensation System TypeScript Types

**Location:** `src/lib/compensation/types.ts`
**Created by:** Agent 2 (TypeScript Type Architect)
**Purpose:** Comprehensive type definitions for the dual-ladder compensation configuration system

---

## Quick Reference

### Core Configuration Types

```typescript
import type {
  CompensationPlanConfig,      // Top-level plan metadata
  TechRankConfig,              // Individual rank configuration
  WaterfallConfig,             // Revenue split percentages
  BonusProgramConfig,          // Bonus program config
  FullCompensationConfig,      // Complete config bundle
} from './types';
```

### API Request/Response Types

```typescript
import type {
  CreateConfigRequest,         // Create new plan
  CreateConfigResponse,        // Creation result
  UpdateConfigRequest,         // Update plan
  ActivateConfigRequest,       // Activate plan
  ActivateConfigResponse,      // Activation result
  UpdateTechRankRequest,       // Update rank
  UpdateWaterfallRequest,      // Update waterfall
} from './types';
```

### Commission Run Types

```typescript
import type {
  CommissionRun,               // Monthly run record
  EarningLineItem,             // Individual earning
  CommissionRunStatus,         // Run status enum
} from './types';
```

### Validation Types

```typescript
import type {
  ConfigValidationResult,      // Validation outcome
  ConfigValidationError,       // Error details
  ConfigValidationWarning,     // Warning details
} from './types';
```

### Type Guards

```typescript
import {
  isProductType,               // Check ProductType
  isMemberStatus,              // Check MemberStatus
  isCommissionRunStatus,       // Check CommissionRunStatus
  isAuditAction,               // Check AuditAction
} from './types';
```

---

## Usage Examples

### 1. Load Configuration

```typescript
import { getActiveCompensationConfig } from './config-loader';
import type { FullCompensationConfig } from './types';

const config: FullCompensationConfig | null = await getActiveCompensationConfig();

if (!config) {
  throw new Error('No active compensation plan configured');
}

console.log(`Active Plan: ${config.plan.name}`);
console.log(`Tech Ranks: ${config.techRanks.length}`);
console.log(`Effective Date: ${config.plan.effectiveDate}`);
```

### 2. Find Specific Rank

```typescript
import { findTechRankByName } from './config-loader';
import type { TechRankConfig } from './types';

const config = await getActiveCompensationConfig();
const silver: TechRankConfig | undefined = findTechRankByName(config, 'silver');

if (silver) {
  console.log(`Silver Requirements:`);
  console.log(`  Personal: ${silver.personalCreditsRequired} credits/month`);
  console.log(`  Group: ${silver.groupCreditsRequired} credits/month`);
  console.log(`  Bonus: $${silver.rankBonusCents / 100}`);
  console.log(`  Override Levels: ${silver.overrideSchedule}`);
}
```

### 3. Create New Configuration

```typescript
import type { CreateConfigRequest, CreateConfigResponse } from './types';

const request: CreateConfigRequest = {
  name: 'Q2 2026 Compensation Plan',
  description: 'Updated rank bonuses and override schedules',
  effectiveDate: '2026-04-01T00:00:00Z',
  copyFromPlanId: 'existing-plan-id', // Optional
};

const response = await fetch('/api/admin/compensation/plans', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request),
});

const result: CreateConfigResponse = await response.json();
console.log(`Created: ${result.plan.name} (v${result.plan.version})`);
```

### 4. Validate Configuration

```typescript
import { validateCompensationConfig } from './config-loader';

const config = await getActiveCompensationConfig();
const errors = validateCompensationConfig(config);

if (errors.length > 0) {
  console.error('Configuration Errors:', errors);
  throw new Error('Invalid compensation configuration');
}

console.log('✓ Configuration is valid');
```

### 5. Use Type Guards

```typescript
import { isProductType, isCommissionRunStatus } from './types';

function processProduct(type: unknown) {
  if (isProductType(type)) {
    // TypeScript knows type is ProductType
    const config = await getWaterfallConfig(type);
    // ...
  } else {
    throw new Error('Invalid product type');
  }
}

function handleRunStatus(status: unknown) {
  if (isCommissionRunStatus(status)) {
    // TypeScript knows status is CommissionRunStatus
    if (status === 'locked') {
      throw new Error('Cannot modify locked commission run');
    }
    // ...
  }
}
```

### 6. Work with Override Schedules

```typescript
import { findTechRankByName, rankQualifiesForLevel, getMaxOverrideLevel } from './config-loader';

const config = await getActiveCompensationConfig();
const platinum = findTechRankByName(config, 'platinum');

if (platinum) {
  // Check if rank qualifies for specific level
  const canEarnL4 = rankQualifiesForLevel(platinum, 4);
  console.log(`Platinum earns L4 overrides: ${canEarnL4}`); // true

  // Get maximum override level
  const maxLevel = getMaxOverrideLevel(platinum);
  console.log(`Platinum max override level: L${maxLevel}`); // L5

  // Get specific percentage
  const l3Percentage = platinum.overrideSchedule[2];
  console.log(`L3 Override: ${l3Percentage * 100}%`);
}
```

### 7. Handle Downline Requirements

```typescript
const gold = findTechRankByName(config, 'gold');
if (gold?.downlineRequirements) {
  // Single requirement: { bronze: 1 }
  console.log('Gold requires 1 Bronze sponsored member');
}

const diamond = findTechRankByName(config, 'diamond');
if (diamond?.downlineRequirements) {
  // OR condition: [{ gold: 3 }, { platinum: 2 }]
  console.log('Diamond requires 3 Golds OR 2 Platinums');
}
```

### 8. Access Waterfall Config

```typescript
import { findWaterfallByProductType } from './config-loader';

const config = await getActiveCompensationConfig();

// Standard products
const standardWaterfall = findWaterfallByProductType(config, 'standard');
if (standardWaterfall) {
  console.log(`BotMakers: ${standardWaterfall.botmakersPct * 100}%`);
  console.log(`Apex: ${standardWaterfall.apexPct * 100}%`);
  console.log(`Seller: ${standardWaterfall.sellerCommissionPct * 100}%`);
}

// Business Center
const bcWaterfall = findWaterfallByProductType(config, 'business_center');
```

### 9. Work with Bonus Programs

```typescript
import { findBonusProgramByName } from './config-loader';

const config = await getActiveCompensationConfig();

// Check if rank bonuses are enabled
const rankBonuses = findBonusProgramByName(config, 'rank_advancement_bonuses');
if (rankBonuses?.enabled) {
  console.log('Rank bonuses are active');
  console.log('Config:', rankBonuses.configJson);
}

// Check leadership pool
const leadershipPool = findBonusProgramByName(config, 'leadership_pool');
if (leadershipPool?.enabled) {
  console.log('Leadership pool distribution active');
}
```

### 10. Commission Run Operations

```typescript
import type { CommissionRun, EarningLineItem, CommissionRunStatus } from './types';

// Create commission run
const run: CommissionRun = {
  id: crypto.randomUUID(),
  month: 3,
  year: 2026,
  status: 'pending',
  planConfigId: config.plan.id,
  createdAt: new Date().toISOString(),
};

// Add earnings
const earning: EarningLineItem = {
  id: crypto.randomUUID(),
  runId: run.id,
  memberId: 'member-123',
  earningType: 'seller_commission',
  amountCents: 1648, // $16.48
  productType: 'standard',
  createdAt: new Date().toISOString(),
};

// Update status
const newStatus: CommissionRunStatus = 'processing';
if (isCommissionRunStatus(newStatus)) {
  run.status = newStatus;
}
```

---

## Type Hierarchy

```
FullCompensationConfig
├── plan: CompensationPlanConfig
│   ├── id
│   ├── name
│   ├── version
│   ├── effectiveDate
│   ├── isActive
│   └── description
│
├── techRanks: TechRankConfig[]
│   ├── rankName (e.g., 'silver')
│   ├── rankOrder (0-8)
│   ├── personalCreditsRequired
│   ├── groupCreditsRequired
│   ├── downlineRequirements
│   ├── rankBonusCents
│   ├── overrideSchedule [L1, L2, L3, L4, L5]
│   ├── gracePeriodMonths
│   └── rankLockMonths
│
├── waterfalls: WaterfallConfig[]
│   ├── productType ('standard' | 'business_center')
│   ├── botmakersPct
│   ├── apexPct
│   ├── bonusPoolPct
│   ├── leadershipPoolPct
│   ├── sellerCommissionPct
│   └── overridePoolPct
│
└── bonusPrograms: BonusProgramConfig[]
    ├── programName
    ├── enabled
    └── configJson
```

---

## Field Validation Rules

### TechRankConfig

| Field | Type | Constraints |
|-------|------|-------------|
| `rankOrder` | number | 0-8, unique within plan |
| `personalCreditsRequired` | number | >= 0 |
| `groupCreditsRequired` | number | >= 0 |
| `rankBonusCents` | number | >= 0 |
| `overrideSchedule[0]` | number | Must be 0.30 (L1) |
| `overrideSchedule[1-4]` | number | 0.0-1.0 |
| `gracePeriodMonths` | number | >= 0 (typically 2) |
| `rankLockMonths` | number | >= 0 (typically 6) |

### WaterfallConfig

| Field | Type | Constraints |
|-------|------|-------------|
| `botmakersPct` | number | 0.0-1.0 |
| `apexPct` | number | 0.0-1.0 |
| `bonusPoolPct` | number | 0.0-1.0 |
| `leadershipPoolPct` | number | 0.0-1.0 |
| `sellerCommissionPct` | number | 0.0-1.0 |
| `overridePoolPct` | number | 0.0-1.0 |

**Sum Rule:** All percentages should add up to <= 1.0

### CommissionRun

| Field | Type | Constraints |
|-------|------|-------------|
| `month` | number | 1-12 |
| `year` | number | >= 2026 |
| `status` | CommissionRunStatus | pending → processing → completed/failed → locked |

---

## Best Practices

### 1. Always Check for Null

```typescript
const config = await getActiveCompensationConfig();
if (!config) {
  throw new Error('No active configuration');
}
// Now safe to use config
```

### 2. Use Type Guards

```typescript
if (isProductType(value)) {
  // TypeScript knows value is ProductType
} else {
  throw new Error('Invalid product type');
}
```

### 3. Validate Before Using

```typescript
const errors = validateCompensationConfig(config);
if (errors.length > 0) {
  throw new Error(`Invalid config: ${errors.join(', ')}`);
}
```

### 4. Use Helper Functions

```typescript
// Instead of:
const silver = config.techRanks.find(r => r.rankName === 'silver');

// Use:
const silver = findTechRankByName(config, 'silver');
```

### 5. Handle OR Conditions

```typescript
const downline = rank.downlineRequirements;
if (Array.isArray(downline)) {
  // OR condition - check if ANY condition is met
  const anyMet = downline.some(req => checkRequirement(req));
} else if (downline) {
  // Single condition - check if met
  const met = checkRequirement(downline);
}
```

---

## Common Patterns

### Loading and Caching

```typescript
import { getActiveCompensationConfig, getCachedConfig, setCachedConfig } from './config-loader';

// Try cache first
let config = getCachedConfig();
if (!config) {
  // Cache miss - load from database
  config = await getActiveCompensationConfig();
  if (config) {
    setCachedConfig(config);
  }
}
```

### Finding Multiple Items

```typescript
const config = await getActiveCompensationConfig();

// Get all ranks >= Gold
const seniorRanks = config.techRanks.filter(r => r.rankOrder >= 3);

// Get all enabled bonus programs
const activePrograms = config.bonusPrograms.filter(p => p.enabled);

// Get ranks with 5-level overrides
const fullOverrideRanks = config.techRanks.filter(r =>
  r.overrideSchedule[4] > 0
);
```

### Type-Safe Updates

```typescript
import type { UpdateTechRankRequest } from './types';

const update: UpdateTechRankRequest = {
  personalCreditsRequired: 600, // Update Silver to 600 credits
  // Other fields remain unchanged
};

await fetch(`/api/admin/compensation/ranks/${rankId}`, {
  method: 'PATCH',
  body: JSON.stringify(update),
});
```

---

## Related Files

- `types.ts` - Type definitions (this file's types)
- `config.ts` - Hardcoded configuration constants
- `config-loader.ts` - Database loading functions
- `rank.ts` - Rank evaluation logic
- `waterfall.ts` - Revenue waterfall calculations
- `override-resolution.ts` - Override resolution logic
- `bonus-programs.ts` - Bonus program calculations

---

## Support

For questions about these types, see:
- `AGENT-2-TYPESCRIPT-TYPES-COMPLETE.md` - Full documentation
- `APEX_COMP_ENGINE_SPEC_FINAL.md` - Business requirements
- Database migrations in `supabase/migrations/` - Schema definitions

---

**Last Updated:** 2026-03-16
**Agent:** Agent 2 (TypeScript Type Architect)
