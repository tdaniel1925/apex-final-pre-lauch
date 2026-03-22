# Tech Ladder Matrix UI - Hierarchy Canvas Design

**Date**: March 22, 2026
**Status**: FINAL DESIGN - Based on Provided UX Template
**Source**: Hierarchy Canvas — Node Detail Panel Open.zip

---

## 📋 DESIGN OVERVIEW

We're adapting the professional hierarchy canvas design to show the Tech Ladder 5×7 forced matrix with:

✅ **Node cards** - Compact cards for each matrix position
✅ **Slide-out panel** - Detailed rep info panel on right side
✅ **SVG connections** - Visual lines connecting matrix relationships
✅ **Tier colors** - Rank-based color coding (Starter → Elite)
✅ **Empty slots** - Dashed placeholders for unfilled positions
✅ **Enrollment badges** - Visual indicators for personal recruits (⭐)

---

## 🎨 VISUAL LAYOUT

### Main Components:

```
┌────────────────────────────────────────────────────────────────┐
│  FROSTED TOP BAR (48px height)                                 │
│  Logo │ View Tabs │ Search │ Rank Filters │ Zoom │ Controls   │
└────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────┐
│                                                                 │
│  CANVAS AREA (dot grid background)                             │
│                                                                 │
│    ┌─────┐                                                     │
│    │ YOU │  ← Root node                                        │
│    └──┬──┘                                                     │
│  ┌────┼────┬────┬────┐                                         │
│  │    │    │    │    │                                         │
│ ┌─┐  ┌─┐  ┌─┐  ┌─┐  ┌─┐                                       │
│ │1│  │2│  │3│  │4│  │5│  ← Level 1 (5 positions)              │
│ └─┘  └─┘  └─┘  └─┘  └─┘                                       │
│  │                                                              │
│ ┌──┼──┬──┬──┐                                                  │
│ │  │  │  │  │                                                  │
│ □  □  □  □  □  ← Level 2 (25 positions total)                 │
│                                                                 │
│  [Minimap in bottom-right corner]                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                                                   │
                                        ┌──────────────────────────┘
                                        │
                                        ▼
                         ┌────────────────────────────┐
                         │  DETAIL PANEL (380px)      │
                         │  Slides in from right      │
                         │                            │
                         │  [Avatar]                  │
                         │  Sarah Johnson             │
                         │  Silver Rank              │
                         │                            │
                         │  KPIs:                     │
                         │  Personal BV: 650          │
                         │  Group BV: 2,340           │
                         │                            │
                         │  Direct Reports (3):       │
                         │  ⭐ John Smith             │
                         │  ⭐ Lisa Chen              │
                         │  👥 Mike Wilson            │
                         │                            │
                         │  [More details...]         │
                         └────────────────────────────┘
```

---

## 🧩 NODE CARD COMPONENT

### Standard Node Card (Personal Enrollment - ⭐)

```tsx
<div className="hierarchy-node" style={{left: x, top: y, width: 160}}>
  <div className="node-card tier-silver selected-node">
    {/* Rank color stripe at top */}

    <div className="px-3 py-2.5">
      {/* Avatar + Status */}
      <div className="flex items-center gap-2 mb-2">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-blue-200">
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          </div>
          {/* Status dot (online/away/offline) */}
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full status-dot-online"></div>
        </div>

        {/* Name + Rank */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-900 truncate">Sarah Johnson</span>
            {/* Personal enrollment star badge */}
            <span className="text-yellow-500">⭐</span>
          </div>
          <div className="text-xs font-medium text-slate-500">Silver</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-1.5 mt-2">
        {/* Personal BV */}
        <div className="text-center bg-slate-50 rounded px-1.5 py-1">
          <div className="text-xs font-bold text-slate-900">650</div>
          <div className="text-xs font-medium text-slate-500">P-BV</div>
        </div>
        {/* Group BV */}
        <div className="text-center bg-slate-50 rounded px-1.5 py-1">
          <div className="text-xs font-bold text-slate-900">2.3K</div>
          <div className="text-xs font-medium text-slate-500">G-BV</div>
        </div>
      </div>

      {/* Position indicator */}
      <div className="mt-1.5 text-center">
        <span className="text-xs font-medium text-slate-400">Pos 2 • L1</span>
      </div>
    </div>
  </div>
</div>
```

### Empty Slot Card

```tsx
<div className="hierarchy-node" style={{left: x, top: y, width: 160}}>
  <div className="node-card" style={{
    border: '2px dashed #cbd5e1',
    background: '#f7fafc',
    opacity: 0.6
  }}>
    <div className="px-3 py-8 text-center">
      <svg className="w-8 h-8 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor">
        <circle cx="16" cy="16" r="14" strokeWidth="2" strokeDasharray="3 3"/>
        <line x1="16" y1="10" x2="16" y2="22" strokeWidth="2"/>
        <line x1="10" y1="16" x2="22" y2="16" strokeWidth="2"/>
      </svg>
      <div className="text-xs font-medium text-slate-400">Available</div>
      <div className="text-xs text-slate-300 mt-0.5">Pos 4 • L1</div>
    </div>
  </div>
</div>
```

---

## 🎨 RANK-BASED COLOR SYSTEM

Adapting the tier colors to match Tech Ladder ranks:

```css
/* Starter - Gray */
.tier-starter {
  border-top: 3px solid #94a3b8; /* slate-400 */
}

/* Bronze - Bronze/Brown */
.tier-bronze {
  border-top: 3px solid #cd7f32;
}

/* Silver - Silver/Light Gray */
.tier-silver {
  border-top: 3px solid #c0c0c0;
}

/* Gold - Gold/Yellow */
.tier-gold {
  border-top: 3px solid #ffd700;
}

/* Platinum - Light Blue */
.tier-platinum {
  border-top: 3px solid #3b82f6; /* blue-500 */
}

/* Ruby - Red/Pink */
.tier-ruby {
  border-top: 3px solid #e91e63; /* pink-600 */
}

/* Diamond - Cyan/Light Blue */
.tier-diamond {
  border-top: 3px solid #06b6d4; /* cyan-500 */
}

/* Crown - Purple */
.tier-crown {
  border-top: 3px solid #9b59b6; /* purple */
}

/* Elite - Black/Gold gradient */
.tier-elite {
  border-top: 3px solid;
  border-image: linear-gradient(90deg, #000000, #ffd700) 1;
}
```

---

## 📊 DETAIL PANEL (Slide-in from Right)

### Panel Structure

```tsx
<div className="detail-panel-container" style={{
  position: 'absolute',
  top: 0,
  right: 0,
  width: 380,
  height: '100%',
  zIndex: 200,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderLeft: '1px solid #e2e8f0',
  boxShadow: '-4px 0 24px rgba(0,0,0,0.05)',
  display: isOpen ? 'flex' : 'none',
  flexDirection: 'column'
}}>

  {/* Header */}
  <div className="px-4 py-4 border-b border-slate-200">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-bold text-slate-900">Team Member</h3>
      <button onClick={closePanel} className="text-slate-400 hover:text-slate-600">
        <svg width="16" height="16" fill="none" stroke="currentColor">
          <path d="M6 6L18 18M18 6L6 18" strokeWidth="2"/>
        </svg>
      </button>
    </div>

    {/* Avatar + Name */}
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200">
          <img src={avatarUrl} alt={name} />
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full status-dot-online"></div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-base font-bold text-slate-900">Sarah Johnson</h4>
          <span className="text-yellow-500 text-lg">⭐</span>
        </div>
        <div className="text-sm font-semibold text-slate-600">Silver Rank</div>
        <div className="text-xs text-slate-500">Joined Nov 2025</div>
      </div>
    </div>
  </div>

  {/* KPI Chips */}
  <div className="px-4 py-3 border-b border-slate-200">
    <div className="grid grid-cols-2 gap-2">
      <div className="kpi-chip">
        <div className="text-xl font-bold text-slate-900">650</div>
        <div className="text-xs font-medium text-slate-500">Personal BV</div>
      </div>
      <div className="kpi-chip">
        <div className="text-xl font-bold text-slate-900">2,340</div>
        <div className="text-xs font-medium text-slate-500">Group BV</div>
      </div>
    </div>
  </div>

  {/* Matrix Position Info */}
  <div className="px-4 py-3 border-b border-slate-200">
    <h5 className="text-xs font-bold text-slate-700 uppercase mb-2">Matrix Position</h5>
    <div className="space-y-1.5">
      <div className="meta-row">
        <span className="text-xs text-slate-500">Position</span>
        <span className="text-xs font-semibold text-slate-900">2 of 5</span>
      </div>
      <div className="meta-row">
        <span className="text-xs text-slate-500">Level</span>
        <span className="text-xs font-semibold text-slate-900">Level 1</span>
      </div>
      <div className="meta-row">
        <span className="text-xs text-slate-500">Matrix Parent</span>
        <span className="text-xs font-semibold text-slate-900">You</span>
      </div>
    </div>
  </div>

  {/* Enrollment Info */}
  <div className="px-4 py-3 border-b border-slate-200">
    <h5 className="text-xs font-bold text-slate-700 uppercase mb-2">Enrollment</h5>
    <div className="space-y-1.5">
      <div className="meta-row">
        <span className="text-xs text-slate-500">Enroller</span>
        <span className="text-xs font-semibold text-slate-900 flex items-center gap-1">
          You <span className="text-yellow-500">⭐</span>
        </span>
      </div>
      <div className="meta-row">
        <span className="text-xs text-slate-500">Enrollment Date</span>
        <span className="text-xs font-semibold text-slate-900">Nov 20, 2025</span>
      </div>
    </div>
  </div>

  {/* Direct Reports (Scrollable) */}
  <div className="flex-1 overflow-y-auto scrollbar-thin">
    <div className="px-4 py-3 border-b border-slate-200">
      <h5 className="text-xs font-bold text-slate-700 uppercase mb-2">
        Direct Reports (3)
      </h5>
    </div>
    <div>
      {/* Report 1 - Personal enrollment */}
      <div className="direct-report-row">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
          <img src={avatarUrl} alt="John Smith" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-900 truncate">John Smith</span>
            <span className="text-yellow-500 text-sm">⭐</span>
          </div>
          <div className="text-xs text-slate-500">Bronze • 250 BV</div>
        </div>
        <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor">
          <path d="M9 5l7 7-7 7" strokeWidth="2"/>
        </svg>
      </div>

      {/* Report 2 - Personal enrollment */}
      <div className="direct-report-row">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
          <img src={avatarUrl} alt="Lisa Chen" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-900 truncate">Lisa Chen</span>
            <span className="text-yellow-500 text-sm">⭐</span>
          </div>
          <div className="text-xs text-slate-500">Silver • 500 BV</div>
        </div>
        <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor">
          <path d="M9 5l7 7-7 7" strokeWidth="2"/>
        </svg>
      </div>

      {/* Report 3 - Spillover (not personal enrollment) */}
      <div className="direct-report-row">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
          <img src={avatarUrl} alt="Mike Wilson" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-900 truncate">Mike Wilson</span>
            <span className="text-slate-400 text-sm">👥</span>
          </div>
          <div className="text-xs text-slate-500">Starter • 80 BV</div>
          <div className="text-xs text-slate-400">Enrolled by: John</div>
        </div>
        <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor">
          <path d="M9 5l7 7-7 7" strokeWidth="2"/>
        </svg>
      </div>
    </div>
  </div>

  {/* Action Buttons */}
  <div className="px-4 py-3 border-t border-slate-200">
    <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
      View Full Profile
    </button>
  </div>
</div>
```

---

## 🔗 SVG CONNECTION LINES

### Connection Types

**1. Selected Path (Highlighted)**
```tsx
<path
  className="connection-path highlighted"
  d={pathData}
  style={{
    stroke: '#3b82f6',
    strokeWidth: 2,
    fill: 'none',
    filter: 'drop-shadow(0 1px 2px rgba(59, 130, 246, 0.2))'
  }}
/>
```

**2. Normal Path**
```tsx
<path
  className="connection-path"
  d={pathData}
  style={{
    stroke: '#cbd5e1',
    strokeWidth: 1.5,
    fill: 'none'
  }}
/>
```

**3. Dimmed Path (Not in focus)**
```tsx
<path
  className="connection-path dimmed"
  d={pathData}
  style={{
    stroke: '#e2e8f0',
    strokeWidth: 1,
    fill: 'none',
    opacity: 0.6
  }}
/>
```

### Path Calculation (Curved Bezier)

```typescript
function calculateConnectionPath(
  parent: {x: number, y: number, height: number},
  child: {x: number, y: number}
): string {
  const startX = parent.x + 80; // Center of parent node (160px / 2)
  const startY = parent.y + parent.height;
  const endX = child.x + 80;
  const endY = child.y;

  const controlPointOffset = (endY - startY) / 2;

  return `M ${startX},${startY} C ${startX},${startY + controlPointOffset} ${endX},${endY - controlPointOffset} ${endX},${endY}`;
}
```

---

## 📱 RESPONSIVE BEHAVIOR

### Desktop (1200px+)
- Show full canvas with side panel
- Node cards 160px wide
- 5 nodes per row (Level 1)
- Detail panel 380px

### Tablet (768px - 1199px)
- Detail panel overlay (covers canvas)
- Node cards 140px wide
- Pan/zoom to navigate

### Mobile (< 768px)
- Full-screen canvas
- Swipe to navigate levels
- Detail panel full-screen modal
- Node cards 120px wide

---

## 🎯 KEY FEATURES TO IMPLEMENT

### 1. Click Node → Open Detail Panel
```typescript
function handleNodeClick(member: Member) {
  setSelectedMember(member);
  setDetailPanelOpen(true);

  // Highlight connections
  highlightPathToRoot(member);
}
```

### 2. Zoom Controls
```typescript
const [zoom, setZoom] = useState(1.0);

function zoomIn() {
  setZoom(prev => Math.min(prev + 0.1, 2.0));
}

function zoomOut() {
  setZoom(prev => Math.max(prev - 0.1, 0.5));
}
```

### 3. Pan/Drag Canvas
```typescript
const [pan, setPan] = useState({x: 0, y: 0});
const [isDragging, setIsDragging] = useState(false);

function handleMouseMove(e: MouseEvent) {
  if (!isDragging) return;
  setPan(prev => ({
    x: prev.x + e.movementX,
    y: prev.y + e.movementY
  }));
}
```

### 4. Minimap (Bottom-right corner)
```tsx
<div className="minimap" style={{
  position: 'absolute',
  bottom: 16,
  right: 16,
  width: 200,
  height: 150,
  background: 'rgba(255, 255, 255, 0.9)',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: 8
}}>
  {/* Mini version of the tree */}
  {allMembers.map(member => (
    <div key={member.id} className="mini-node" style={{
      position: 'absolute',
      left: member.x / 5, // Scale down
      top: member.y / 5,
      width: 4,
      height: 4,
      background: member.id === selectedMember?.id ? '#3b82f6' : '#cbd5e1',
      borderRadius: 2
    }} />
  ))}
</div>
```

---

## 📐 NODE POSITIONING ALGORITHM

### Calculate X/Y Coordinates for 5-Wide Matrix

```typescript
const NODE_WIDTH = 160;
const NODE_HEIGHT = 120;
const HORIZONTAL_SPACING = 40;
const VERTICAL_SPACING = 120;

function calculateNodePosition(
  member: Member,
  level: number,
  position: number, // 1-5
  parentX: number
): {x: number, y: number} {

  // Level spacing
  const y = level * (NODE_HEIGHT + VERTICAL_SPACING);

  // For Level 1: Center 5 nodes around parent
  if (level === 1) {
    const totalWidth = (NODE_WIDTH * 5) + (HORIZONTAL_SPACING * 4);
    const startX = parentX - (totalWidth / 2) + (NODE_WIDTH / 2);
    const x = startX + ((NODE_WIDTH + HORIZONTAL_SPACING) * (position - 1));
    return {x, y};
  }

  // For Level 2+: Position under parent node
  const parentNode = findParentNode(member.matrix_parent_id);
  if (!parentNode) return {x: 0, y: 0};

  const totalWidth = (NODE_WIDTH * 5) + (HORIZONTAL_SPACING * 4);
  const startX = parentNode.x - (totalWidth / 2) + (NODE_WIDTH / 2);
  const x = startX + ((NODE_WIDTH + HORIZONTAL_SPACING) * (position - 1));

  return {x, y};
}
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Basic Canvas (2-3 days)
- [ ] Frosted top bar with logo and controls
- [ ] Dot grid background
- [ ] Node card component (basic)
- [ ] Empty slot component
- [ ] Pan/zoom functionality

### Phase 2: Node Rendering (2-3 days)
- [ ] Position calculation algorithm
- [ ] Render 5-wide matrix (Level 1)
- [ ] Render spillover levels (Level 2+)
- [ ] Rank-based color coding
- [ ] Enrollment badges (⭐)
- [ ] Status indicators (online/away/offline)

### Phase 3: SVG Connections (1-2 days)
- [ ] Calculate curved paths between nodes
- [ ] Render connection lines
- [ ] Highlight selected path
- [ ] Dim non-selected paths

### Phase 4: Detail Panel (2-3 days)
- [ ] Slide-in animation
- [ ] Header with avatar + name
- [ ] KPI chips
- [ ] Matrix position info
- [ ] Enrollment info
- [ ] Direct reports list (scrollable)
- [ ] Action buttons

### Phase 5: Interactions (1-2 days)
- [ ] Click node → Open panel
- [ ] Click background → Close panel
- [ ] Highlight path on node select
- [ ] Click direct report → Navigate to that node

### Phase 6: Polish (1-2 days)
- [ ] Minimap
- [ ] Search/filter
- [ ] Rank filter pills
- [ ] Export functionality
- [ ] Responsive design (mobile)

**Total: 9-15 days**

---

## 🎨 FINAL NOTES

This design is significantly more polished than the basic cards we spec'd earlier. Key improvements:

1. **Professional hierarchy visualization** - Uses industry-standard org chart patterns
2. **Smooth interactions** - Slide-in panel, path highlighting, zoom/pan
3. **Information density** - Compact nodes with expandable details
4. **Visual hierarchy** - Clear rank colors, enrollment badges, status indicators
5. **Scalable** - Handles hundreds of nodes with minimap navigation

**This will be a STUNNING matrix visualization for your Tech Ladder system.** 🚀

---

**END OF HIERARCHY CANVAS DESIGN SPECIFICATION**

*Ready to build a world-class matrix visualization.*
