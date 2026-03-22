# Tech Ladder 5×7 Matrix System - Complete Architecture

**Status:** ✅ 100% COMPLETE
**Date:** March 22, 2026

---

## 🏗️ System Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│                     (User Interfaces)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📊 Hierarchy Canvas       📋 Matrix Grid View    📄 Text Tree  │
│  /admin/hierarchy          /admin/matrix          /admin/genealogy│
│  • Interactive tree        • Level-based grid     • Text list    │
│  • Pan & zoom             • Filter by level       • Lineage view │
│  • Detail panel           • Stats dashboard       • Sponsorship  │
│  • Visual connections     • Position management   • Quick search │
│                                                                  │
│  Components:                                                     │
│  • HierarchyCanvas.tsx                                          │
│  • MatrixNode.tsx                                               │
│  • NodeDetailPanel.tsx                                          │
│  • MatrixView.tsx (existing)                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                          API LAYER                               │
│                     (REST Endpoints)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GET  /api/admin/matrix/tree                                    │
│       → Fetch recursive tree with children                      │
│       → Query params: rootId, maxDepth                          │
│       → Returns: TreeNode with nested children                  │
│                                                                  │
│  GET  /api/admin/matrix                                         │
│       → Get matrix statistics                                   │
│                                                                  │
│  GET  /api/admin/matrix/level/[level]                          │
│       → Get all distributors at specific level                  │
│                                                                  │
│  POST /api/admin/matrix/place                                   │
│       → Place distributor in matrix using spillover             │
│                                                                  │
│  GET  /api/admin/matrix/unplaced-reps                          │
│       → Get list of unplaced distributors                       │
│                                                                  │
│  POST /api/admin/matrix/create-and-place                       │
│       → Create new distributor and place in matrix              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BUSINESS LOGIC LAYER                       │
│                     (Core Algorithms)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📍 Spillover Placement Algorithm                               │
│     lib/admin/matrix-placement.ts                               │
│     • findNextAvailablePosition(sponsorId)                      │
│     • Breadth-first search (BFS)                                │
│     • Respects matrix width (5)                                 │
│     • Handles deleted users (checks ALL children)               │
│                                                                  │
│  💰 Override Calculation Engine                                 │
│     lib/admin/override-calculator.ts                            │
│     • calculateOverrides(distributorId)                         │
│     • Walks up matrix parent chain                              │
│     • Applies waterfall logic                                   │
│     • Tech rank-based percentages                               │
│                                                                  │
│  📊 BV Calculation Utility                                      │
│     lib/admin/bv-calculator.ts                                  │
│     • calculatePersonalBV(distributorId)                        │
│     • calculateGroupBV(distributorId)                           │
│     • Sums sales from orders                                    │
│     • Caches results (1-5 min TTL)                              │
│                                                                  │
│  📈 Matrix Statistics                                           │
│     lib/admin/matrix-manager.ts                                 │
│     • getMatrixStatistics()                                     │
│     • getMatrixLevel(level)                                     │
│     • Count filled/available positions                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                              │
│                     (PostgreSQL via Supabase)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📋 distributors table                                          │
│     ┌────────────────────────────────────────────────────────┐ │
│     │ Core Fields:                                            │ │
│     │ • id (uuid, PK)                                         │ │
│     │ • first_name, last_name, email                          │ │
│     │ • slug, rep_number, status                              │ │
│     │ • created_at, updated_at                                │ │
│     │                                                          │ │
│     │ Enrollment Tree Fields:                                 │ │
│     │ • sponsor_id (FK → distributors.id)                     │ │
│     │   ↳ Who enrolled them                                   │ │
│     │                                                          │ │
│     │ Placement Matrix Fields:                                │ │
│     │ • matrix_parent_id (FK → distributors.id)               │ │
│     │   ↳ Parent in placement tree                            │ │
│     │ • matrix_position (1-5)                                 │ │
│     │   ↳ Which slot under parent                             │ │
│     │ • matrix_depth (0-7)                                    │ │
│     │   ↳ Level in tree (0=root)                              │ │
│     │                                                          │ │
│     │ BV Tracking Fields: (NEW)                               │ │
│     │ • personal_bv_monthly (integer)                         │ │
│     │   ↳ Personal sales volume                               │ │
│     │ • group_bv_monthly (integer)                            │ │
│     │   ↳ Team sales volume                                   │ │
│     │ • bv_last_calculated_at (timestamp)                     │ │
│     │   ↳ Cache timestamp                                     │ │
│     │                                                          │ │
│     │ Unique Constraint:                                      │ │
│     │ • (matrix_parent_id, matrix_position)                   │ │
│     │   ↳ No duplicate positions under same parent            │ │
│     └────────────────────────────────────────────────────────┘ │
│                                                                  │
│  📦 orders table (for BV calculation)                           │
│     • distributor_id → Links to distributor                     │
│     • total_amount → Used for BV calculation                    │
│     • created_at → Monthly filtering                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MIGRATION LAYER                           │
│                     (Data Cleanup & Setup)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🔧 scripts/migrate-unplaced-distributors.ts                    │
│     • Finds all distributors with matrix_parent_id = null       │
│     • Uses spillover algorithm to place each one                │
│     • Handles enrollment order (FIFO)                           │
│     • Dry-run mode for testing                                  │
│     • Verification and rollback functions                       │
│                                                                  │
│  ✅ Result: Placed 6 real distributors successfully             │
│     13 test users skipped (no sponsor_id)                       │
│                                                                  │
│  📊 Database Migrations:                                        │
│     • supabase/migrations/20260319000001_matrix_bv_tracking.sql│
│     • Adds personal_bv_monthly, group_bv_monthly columns        │
│     • Adds bv_last_calculated_at timestamp                      │
│     • Updates existing rows with default 0 values               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

```

---

## 🔄 Data Flow Examples

### Example 1: Viewing Hierarchy Canvas

```
┌──────────────────────────────────────────────────────────────┐
│ 1. User clicks "Hierarchy Canvas" in admin sidebar          │
│    → Navigate to /admin/hierarchy                            │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Server Component (page.tsx)                              │
│    → requireAdmin() - Check authentication                   │
│    → Parse query params (rootId, maxDepth)                   │
│    → Render HierarchyCanvasClient                            │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Client Component (HierarchyCanvasClient.tsx)             │
│    → useEffect on mount                                      │
│    → fetch('/api/admin/matrix/tree?maxDepth=3')             │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. API Route (/api/admin/matrix/tree/route.ts)              │
│    → Get root distributor (depth 0)                          │
│    → Recursively fetch children up to maxDepth              │
│    → For each node:                                          │
│       • Query: SELECT * FROM distributors                    │
│         WHERE matrix_parent_id = ? AND status = 'active'     │
│       • Get child count                                      │
│       • Recurse if depth < maxDepth                          │
│    → Return tree JSON                                        │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. Client receives tree data                                │
│    → Store in useState(treeData)                             │
│    → Render HierarchyCanvas component                        │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. HierarchyCanvas renders tree                             │
│    → Calculate positions for each node                       │
│    → Render SVG connection lines                             │
│    → Render MatrixNode components                            │
│    → Setup pan/zoom event handlers                           │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. User clicks a node                                        │
│    → setSelectedNode(node)                                   │
│    → setIsPanelOpen(true)                                    │
│    → NodeDetailPanel slides in from right                    │
│    → Display distributor details                             │
└──────────────────────────────────────────────────────────────┘
```

### Example 2: Placing New Distributor

```
┌──────────────────────────────────────────────────────────────┐
│ 1. Admin creates new distributor                            │
│    → POST /api/admin/matrix/create-and-place                │
│    → Body: { firstName, lastName, email, sponsorId }        │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. API calls findNextAvailablePosition(sponsorId)           │
│    → Breadth-first search starting from sponsor             │
│    → Queue: [{ memberId: sponsorId, depth: 0 }]             │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. For each node in queue:                                  │
│    → Query ALL children (including deleted):                │
│      SELECT * FROM distributors                              │
│      WHERE matrix_parent_id = currentNodeId                  │
│    → Check: children.length < 5?                             │
│    → If YES: Find first available position (1-5)             │
│    → If NO: Add active children to queue, continue BFS      │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Found position: { parentId, position, depth }            │
│    → Insert new distributor:                                 │
│      INSERT INTO distributors (                              │
│        first_name, last_name, email,                         │
│        sponsor_id,                                           │
│        matrix_parent_id, matrix_position, matrix_depth       │
│      ) VALUES (?, ?, ?, ?, ?, ?, ?)                          │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. Success! Distributor placed in matrix                    │
│    → Return: { success: true, distributorId, placement }    │
└──────────────────────────────────────────────────────────────┘
```

### Example 3: Calculating BV & Overrides

```
┌──────────────────────────────────────────────────────────────┐
│ 1. Cron job runs monthly BV calculation                     │
│    (or manual trigger button)                                │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. For each distributor:                                    │
│    → calculatePersonalBV(distributorId)                      │
│      • Query: SELECT SUM(total_amount) FROM orders          │
│        WHERE distributor_id = ? AND                          │
│        created_at >= start_of_month                          │
│    → calculateGroupBV(distributorId)                         │
│      • Get all descendants in matrix tree                    │
│      • Sum their personal BVs                                │
│    → Update: personal_bv_monthly, group_bv_monthly           │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Calculate overrides for each distributor:                │
│    → calculateOverrides(distributorId)                       │
│      • Walk up matrix_parent_id chain                        │
│      • For each ancestor:                                    │
│        - Get their tech_rank                                 │
│        - Apply waterfall percentage                          │
│        - Calculate commission amount                         │
│      • Store in commissions table                            │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. Generate payout batch                                    │
│    → Sum commissions for each distributor                    │
│    → Create payout records                                   │
│    → Send email notifications                                │
└──────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Design Decisions

### 1. **Dual-Tree System**

**Why:** Separates enrollment (who recruited) from placement (who benefits)

```
Enrollment Tree (sponsor_id)         Placement Matrix (matrix_parent_id)
      Alice                                  Alice
     /     \                                /  |  \
  Bob       Carol                        Bob Carol David
           /                                     |
        David                                  Emma
```

- **Enrollment:** Bob and Carol recruited by Alice, David recruited by Carol
- **Placement:** All 4 placed directly under Alice (spillover)
- **Benefit:** Alice gets overrides on ALL 4 (placement tree)

### 2. **Breadth-First Spillover**

**Why:** Fair distribution, fills levels evenly

```
Level 0:     Alice (5/5 filled) ❌
Level 1:     [B] [C] [D] [E] [F] (all 5/5 filled) ❌
Level 2:     New member → Placed under B (first with space) ✅
```

Algorithm checks Level 0, then Level 1, then Level 2, etc.

### 3. **Handle Deleted Users**

**Why:** Unique constraint includes ALL rows, not just active

```
Parent: Alice
Children:
  Position 1: Bob (DELETED) ← Still occupies position!
  Position 2: Carol (ACTIVE)
  Position 3: David (DELETED) ← Still occupies position!
  Position 4: Emma (ACTIVE)
  Position 5: Frank (ACTIVE)

Query must check ALL children, not just active.
Available positions: NONE (all 5 occupied, even if 2 are deleted)
```

### 4. **BV Caching**

**Why:** Expensive to calculate on every request

```
distributors table:
  personal_bv_monthly: 12500       ← Cached value
  group_bv_monthly: 450000         ← Cached value
  bv_last_calculated_at: 2026-03-22 06:00:00 ← Timestamp

If (now - bv_last_calculated_at) > 5 minutes:
  Recalculate from orders table
Else:
  Use cached value
```

### 5. **API Tree Depth Limit**

**Why:** Performance at scale

```
maxDepth = 3:
  Level 0: 1 node
  Level 1: 5 nodes
  Level 2: 25 nodes
  Level 3: 125 nodes
  Total: 156 nodes

maxDepth = 7 (full tree):
  Total: 19,531 nodes ← TOO LARGE for single API response!
```

Solution: Default to 3 levels, allow query param override

---

## 📊 Database Schema Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                      distributors                              │
├────────────────────────────────────────────────────────────────┤
│ id (PK)                                uuid                    │
│ first_name                             text                    │
│ last_name                              text                    │
│ email                                  text (UNIQUE)           │
│ slug                                   text (UNIQUE)           │
│ rep_number                             text (UNIQUE)           │
│ status                                 text (active/deleted)   │
│────────────────────────────────────────────────────────────────│
│ sponsor_id (FK)         ──────────┐    uuid                    │
│ matrix_parent_id (FK)   ──────────┼──→ distributors.id        │
│ matrix_position                    │    integer (1-5)          │
│ matrix_depth                       │    integer (0-7)          │
│────────────────────────────────────────────────────────────────│
│ personal_bv_monthly (NEW)          │    integer               │
│ group_bv_monthly (NEW)             │    integer               │
│ bv_last_calculated_at (NEW)        │    timestamp             │
│────────────────────────────────────────────────────────────────│
│ UNIQUE (matrix_parent_id, matrix_position)                     │
└────────────────────────────────────────────────────────────────┘

Relationships:
  • sponsor_id → distributors.id (enrollment tree)
  • matrix_parent_id → distributors.id (placement tree)
```

---

## ✅ Completion Checklist

### Phase 1: Database Layer ✅
- [x] Add BV tracking columns to distributors table
- [x] Create migration SQL file
- [x] Apply migration to Supabase production
- [x] Verify columns exist with correct types

### Phase 2: Business Logic ✅
- [x] Implement spillover placement algorithm (BFS)
- [x] Handle deleted users in position checks
- [x] Create BV calculation utility
- [x] Create override calculation engine
- [x] Test with real data

### Phase 3: Data Migration ✅
- [x] Write migration script for unplaced distributors
- [x] Add dry-run mode for testing
- [x] Fix table/field name mismatches
- [x] Fix deleted user bug in spillover
- [x] Run migration successfully (6 distributors placed)
- [x] Verify no position conflicts

### Phase 4: UI Layer ✅
- [x] Create MatrixNode component
- [x] Create NodeDetailPanel component
- [x] Create HierarchyCanvas component
- [x] Implement pan & zoom controls
- [x] Add SVG connection lines
- [x] Create API route for tree data
- [x] Create admin page (/admin/hierarchy)
- [x] Add navigation link in sidebar
- [x] Test with real data
- [x] Document implementation

---

## 🎉 Final Status

**All 4 phases complete!** The Tech Ladder 5×7 Matrix system is fully operational:

✅ Database schema ready
✅ Algorithms working correctly
✅ Migration successful (6 placed)
✅ UI fully functional

**Ready for production use!** 🚀

---

**Last Updated:** March 22, 2026
**Documentation by:** Claude Code
