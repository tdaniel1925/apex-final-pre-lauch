# Matrix UI Design Specification - Tech Ladder

**Date**: March 22, 2026
**Status**: FINAL - Ready for Implementation
**Decision**: Single Matrix View with Enrollment Indicators

---

## 📋 CORE DECISION

**UI Design**: Show 5-wide forced matrix with visual indicators for personal enrollments

**Single View**: "My Team Matrix" - combines placement matrix + enrollment indicators

---

## 🎨 UI LAYOUT

### Main Matrix View

**Features:**
1. **5-wide forced matrix visualization** (shows actual placement)
2. **Enrollment badges** (⭐ or highlight) for personal recruits
3. **Empty slots displayed** as placeholders [ ]
4. **Level labels** (L1, L2, L3, etc.)
5. **Member cards** with key info (name, rank, BV)

---

## 📊 VISUAL MOCKUP

### Example: Rep with 8 Recruits

```
┌─────────────────────────────────────────────────────────────┐
│  MY TEAM MATRIX                                    [Legend] │
│  ⭐ = You Enrolled    👥 = Spillover                        │
└─────────────────────────────────────────────────────────────┘

                       YOU
                   Gold Rank
                   1,250 BV
                       │
    ┌──────┬──────┬───┼───┬──────┐
    │      │      │   │   │      │
┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐
│⭐ R1  ││⭐ R2  ││⭐ R3  ││⭐ R4  ││⭐ R5  │  LEVEL 1
│Bronze ││Silver ││Bronze ││Starter││Silver │
│250 BV ││600 BV ││300 BV ││80 BV  ││500 BV │
└───────┘└───────┘└───────┘└───────┘└───────┘
    │
    ├────┬────┬────┬────┐
    │    │    │    │    │
┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐
│⭐ R6  ││⭐ R7  ││⭐ R8  ││  [ ]  ││  [ ]  │  LEVEL 2
│Starter││Bronze ││Starter││       ││       │  (Under R1)
│60 BV  ││200 BV ││75 BV  ││       ││       │
└───────┘└───────┘└───────┘└───────┘└───────┘
    │
    ├────┬────┬────┬────┐
    │    │    │    │    │
┌───────┐┌───────┐┌───────┐┌───────┐┌───────┐
│👥 R6-1││👥 R6-2││  [ ]  ││  [ ]  ││  [ ]  │  LEVEL 3
│Starter││Starter││       ││       ││       │  (Under R6)
│40 BV  ││50 BV  ││       ││       ││       │
└───────┘└───────┘└───────┘└───────┘└───────┘

┌─────────────────────────────────────────────────────────────┐
│ TEAM SUMMARY                                                │
│ • Total Personal Enrollments: 8 (⭐)                        │
│ • Total Matrix Positions Filled: 10                         │
│ • Your Level 1: 5/5 FULL                                    │
│ • Your Level 2: 3/25 (12%)                                  │
│ • Your Level 3: 2/125 (1.6%)                                │
│ • Next Available Position: Level 2, Position 4 (under R1)   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 MEMBER CARD COMPONENTS

### Card for Personal Enrollee (⭐)

```tsx
<div className="member-card personal-enrollee">
  <div className="badge">⭐</div>
  <div className="member-info">
    <div className="name">John Smith</div>
    <div className="rank">Bronze</div>
    <div className="bv">250 BV</div>
  </div>
  <div className="actions">
    <button>View Details</button>
  </div>
</div>

CSS:
.personal-enrollee {
  border: 2px solid #2c5aa0; /* Apex blue */
  background: linear-gradient(135deg, #2c5aa0 0%, #1e3a5f 100%);
  color: white;
}
```

### Card for Spillover Member (👥)

```tsx
<div className="member-card spillover">
  <div className="badge">👥</div>
  <div className="member-info">
    <div className="name">Sarah Johnson</div>
    <div className="rank">Starter</div>
    <div className="bv">40 BV</div>
    <div className="enrolled-by">Enrolled by: R6</div>
  </div>
  <div className="actions">
    <button>View Details</button>
  </div>
</div>

CSS:
.spillover {
  border: 1px solid #cbd5e0;
  background: white;
  color: #2d3748;
}
```

### Card for Empty Slot

```tsx
<div className="member-card empty-slot">
  <div className="placeholder">
    <svg><!-- Plus icon --></svg>
    <span>Available</span>
  </div>
</div>

CSS:
.empty-slot {
  border: 2px dashed #cbd5e0;
  background: #f7fafc;
  opacity: 0.6;
}
```

---

## 📱 RESPONSIVE DESIGN

### Desktop (1200px+)
```
- Show 5 cards per row (full matrix width)
- Expand cards to show full details
- Side-by-side level comparison
```

### Tablet (768px - 1199px)
```
- Show 3 cards per row
- Compress card details slightly
- Stack levels vertically with clear separators
```

### Mobile (< 768px)
```
- Show 1-2 cards per row
- Collapsible levels (expand to view)
- Swipe to navigate levels
- Sticky header showing current level
```

---

## 🔍 INTERACTIVE FEATURES

### 1. Hover State (Desktop)

```tsx
// On hover over a member card
<Tooltip>
  <div className="member-tooltip">
    <h4>{member.name}</h4>
    <div>Rank: {member.rank}</div>
    <div>Personal BV: {member.personal_bv}</div>
    <div>Group BV: {member.group_bv}</div>
    <div>Joined: {formatDate(member.enrollment_date)}</div>
    {member.enroller_id === currentUser.id && (
      <div className="highlight">✅ Your Personal Recruit</div>
    )}
    {member.matrix_parent_id === currentUser.id && (
      <div>📍 Direct Matrix Position {member.matrix_position}</div>
    )}
  </div>
</Tooltip>
```

### 2. Click to Expand

```tsx
// Click member card → Show detailed modal
<Modal>
  <MemberDetailView
    member={member}
    showEnrollmentInfo={true}
    showMatrixInfo={true}
    showCommissionBreakdown={true}
  />
</Modal>
```

### 3. Level Toggle

```tsx
// Toggle levels on/off to reduce visual clutter
<div className="level-controls">
  <button onClick={() => toggleLevel(1)}>L1 ✓</button>
  <button onClick={() => toggleLevel(2)}>L2 ✓</button>
  <button onClick={() => toggleLevel(3)}>L3</button>
  <button onClick={() => toggleLevel(4)}>L4</button>
  <button onClick={() => toggleLevel(5)}>L5</button>
</div>
```

### 4. Search/Filter

```tsx
<div className="matrix-filters">
  <input
    type="search"
    placeholder="Search by name..."
    onChange={filterMembers}
  />
  <select onChange={filterByRank}>
    <option>All Ranks</option>
    <option>Bronze+</option>
    <option>Silver+</option>
    <option>Gold+</option>
  </select>
  <select onChange={filterByEnrollment}>
    <option>All Members</option>
    <option>⭐ My Enrollments Only</option>
    <option>👥 Spillover Only</option>
  </select>
</div>
```

---

## 📊 SUMMARY STATISTICS PANEL

### Top Stats Bar

```tsx
<div className="matrix-stats-bar">
  <StatCard
    label="Your Direct Enrollments"
    value={enrollmentCount}
    icon="⭐"
    color="blue"
  />
  <StatCard
    label="Total Matrix Positions"
    value={matrixPositionsFilled}
    subtitle={`${(matrixPositionsFilled / 19531 * 100).toFixed(2)}% of max`}
    icon="📊"
    color="green"
  />
  <StatCard
    label="Level 1 Fill Rate"
    value={`${level1Filled}/5`}
    progress={level1Filled / 5 * 100}
    icon="📈"
    color="purple"
  />
  <StatCard
    label="Next Available Slot"
    value={`L${nextSlot.level}, P${nextSlot.position}`}
    subtitle={`Under ${nextSlot.parent}`}
    icon="📍"
    color="orange"
  />
</div>
```

---

## 🎨 COLOR CODING SYSTEM

### Visual Indicators

**Personal Enrollments (⭐):**
- Border: Apex Blue (#2c5aa0)
- Background: Blue gradient
- Badge: Gold star ⭐

**Spillover Members (👥):**
- Border: Light gray
- Background: White
- Badge: People icon 👥

**Empty Slots:**
- Border: Dashed gray
- Background: Very light gray
- Icon: Plus sign +

**Rank Colors:**
- Starter: Gray (#718096)
- Bronze: Bronze (#cd7f32)
- Silver: Silver (#c0c0c0)
- Gold: Gold (#ffd700)
- Platinum: Light blue (#e5e4e2)
- Ruby: Red (#e0115f)
- Diamond: Cyan (#b9f2ff)
- Crown: Purple (#9b59b6)
- Elite: Black with gold (#000 + #ffd700)

---

## 🔔 NOTIFICATIONS & ALERTS

### Real-time Updates

**When someone joins your matrix:**
```tsx
<Toast type="success">
  🎉 New team member!
  {member.name} joined your Level {level}, Position {position}
  {isPersonalEnrollment && " (Your personal recruit!)"}
</Toast>
```

**When your Level 1 fills up:**
```tsx
<Alert type="info">
  ℹ️ Your Level 1 is now FULL (5/5)!
  Future recruits will spillover to Level 2.
  <button>Learn about spillover</button>
</Alert>
```

**When you earn a matrix override:**
```tsx
<Notification>
  💰 Matrix Override Earned!
  ${amount} from {member.name}'s sale
  (Level {level} matrix override)
</Notification>
```

---

## 🛠️ COMPONENT STRUCTURE

### Main Component Tree

```tsx
<MatrixPage>
  <MatrixHeader>
    <PageTitle />
    <MatrixStatsBar />
    <LegendAndControls />
  </MatrixHeader>

  <MatrixFilters>
    <SearchInput />
    <RankFilter />
    <EnrollmentFilter />
    <LevelToggle />
  </MatrixFilters>

  <MatrixVisualization>
    <MatrixLevel level={1}>
      {level1Members.map(member => (
        <MemberCard
          member={member}
          isPersonalEnrollment={member.enroller_id === currentUser.id}
          onClick={() => showMemberDetail(member)}
        />
      ))}
      {emptySlots(1).map(slot => <EmptySlotCard />)}
    </MatrixLevel>

    <MatrixLevel level={2}>
      {/* Grouped by parent */}
      {level1Members.map(parent => (
        <ParentGroup parent={parent}>
          {getChildren(parent).map(member => (
            <MemberCard member={member} />
          ))}
          {emptySlots(parent).map(slot => <EmptySlotCard />)}
        </ParentGroup>
      ))}
    </MatrixLevel>

    {/* Levels 3-7... */}
  </MatrixVisualization>

  <MatrixSummary>
    <TeamStats />
    <NextSteps />
  </MatrixSummary>
</MatrixPage>
```

---

## 📱 MOBILE-SPECIFIC FEATURES

### Swipe Navigation

```tsx
// Swipe left/right to navigate levels
<SwipeableViews
  index={currentLevel}
  onChangeIndex={setCurrentLevel}
>
  {[1, 2, 3, 4, 5].map(level => (
    <LevelView level={level} key={level} />
  ))}
</SwipeableViews>
```

### Sticky Level Selector

```tsx
<div className="sticky-level-nav">
  <button onClick={() => setLevel(1)}>L1 (5/5)</button>
  <button onClick={() => setLevel(2)}>L2 (3/25)</button>
  <button onClick={() => setLevel(3)}>L3 (2/125)</button>
  ...
</div>
```

---

## 🎯 KEY RULES SUMMARY

1. ✅ **Single view**: Matrix with enrollment indicators (no separate enrollment tree view)
2. ✅ **⭐ Badge**: Personal enrollments clearly marked
3. ✅ **👥 Badge**: Spillover members identified
4. ✅ **Empty slots**: Shown as dashed placeholders
5. ✅ **5-wide enforcement**: Always show 5 positions per level
6. ✅ **Responsive**: Mobile-first design with swipe navigation
7. ✅ **Interactive**: Hover tooltips, click to expand, search/filter
8. ✅ **Real-time**: Toast notifications for new members and overrides

---

## 📂 FILES TO CREATE/MODIFY

### New Components

```
src/components/matrix/
├─ MatrixPage.tsx              (Main container)
├─ MatrixHeader.tsx            (Stats and controls)
├─ MatrixVisualization.tsx     (Tree visualization)
├─ MatrixLevel.tsx             (Single level row)
├─ MemberCard.tsx              (Individual member card)
├─ EmptySlotCard.tsx           (Empty position placeholder)
├─ MemberDetailModal.tsx       (Click to expand)
├─ MatrixFilters.tsx           (Search/filter controls)
└─ MatrixSummary.tsx           (Stats panel)
```

### Update Existing

```
src/app/dashboard/matrix/page.tsx
  - Replace current implementation
  - Use matrix_parent_id instead of enroller_id
  - Add enrollment indicators
  - Show 5-wide forced structure
```

---

## 🔄 DATA LOADING

### Query for Matrix Data

```typescript
async function loadMatrixData(userId: string, maxDepth: number = 5) {
  // Load user's matrix with proper fields
  const { data, error } = await supabase
    .from('members')
    .select(`
      member_id,
      full_name,
      tech_rank,
      personal_bv_monthly,
      group_bv_monthly,
      enroller_id,
      matrix_parent_id,
      matrix_position,
      matrix_depth,
      enrollment_date
    `)
    .or(`matrix_parent_id.eq.${userId},member_id.eq.${userId}`)
    .order('matrix_depth', { ascending: true })
    .order('matrix_position', { ascending: true });

  // Transform into tree structure
  const matrixTree = buildMatrixTree(data, userId, maxDepth);

  return matrixTree;
}

function buildMatrixTree(members, rootId, maxDepth) {
  const tree = {
    root: members.find(m => m.member_id === rootId),
    levels: Array(maxDepth).fill(null).map(() => []),
  };

  // Organize by level and position
  members.forEach(member => {
    if (member.matrix_depth <= maxDepth) {
      tree.levels[member.matrix_depth - 1].push(member);
    }
  });

  return tree;
}
```

---

**END OF MATRIX UI DESIGN SPECIFICATION**

*Next Topic: Handling the 22 Unplaced Distributors*
