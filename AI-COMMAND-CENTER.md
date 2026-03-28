# 🚀 Apex AI Command Center - Dashboard v2

## Overview

The new AI Command Center transforms the Apex Affinity Group dashboard into a revolutionary chat-based interface where distributors can run their entire business through conversational AI with interactive components, visualizations, and quick actions.

## 🎨 Design Philosophy

### Apex Blue Color Scheme
**ALL PURPLE/VIOLET REPLACED WITH APEX BLUE:**
- **Primary Blue:** `#2c5aa0`
- **Dark Blue:** `#1a4075`
- **Accent Blue:** `#4a90e2`
- **Light Blue:** `#e3f2fd`
- **Gradient:** `linear-gradient(135deg, #2c5aa0 0%, #1a4075 100%)`

### Mobile-First Responsive
- Full-screen on mobile (no margins)
- Sidebar slides over content (not push)
- Quick actions: horizontal scroll
- Chat bubbles: 95% width on mobile
- Large touch targets (48px minimum)
- Sticky input always visible

## 📁 Component Architecture

### Main Page
```
src/app/dashboard-v2/page.tsx
```
Full-screen chat interface with sidebar, header, quick actions, and rich message components.

### Layout Components

#### 1. SlidingSidebar
```typescript
src/components/dashboard-v2/SlidingSidebar.tsx
```
**Features:**
- Hidden by default on mobile, visible on desktop (>1024px)
- Slide-in animation (300ms ease-in-out)
- Backdrop blur overlay on mobile
- Apex blue gradient header
- Navigation sections (Quick Actions, Settings)
- Recent chat history
- User profile with avatar and rank

**Props:**
```typescript
interface SlidingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userRank: string;
  userAvatar?: string;
}
```

#### 2. ChatHeader
```typescript
src/components/dashboard-v2/ChatHeader.tsx
```
**Features:**
- Sticky position at top
- Hamburger menu icon (toggles sidebar)
- Context-aware title
- Notification bell with badge
- Profile avatar
- Apex blue gradient background

**Props:**
```typescript
interface ChatHeaderProps {
  onMenuClick: () => void;
  title?: string;
  subtitle?: string;
  showNotifications?: boolean;
  notificationCount?: number;
}
```

#### 3. QuickActionBar
```typescript
src/components/dashboard-v2/QuickActionBar.tsx
```
**Features:**
- Horizontal scrolling action pills
- Apex blue accent when active
- Icons + labels
- Mobile: scroll horizontally
- Desktop: all visible

**Actions:**
- 👥 Team
- 💰 Earnings
- 📊 Stats
- 📅 Events
- 📧 Messages
- 🌳 Matrix
- 🎓 Training
- ✅ Compliance

### Interactive Chat Components

#### 4. StatCard
```typescript
src/components/dashboard-v2/chat/StatCard.tsx
```
**Shows metrics with trend indicators.**

**Example:**
```typescript
<StatCard
  label="Personal BV"
  value="$1,450"
  change={{
    amount: '+$320',
    percentage: 28,
    direction: 'up'
  }}
  icon="💰"
  variant="success"
/>
```

**Variants:**
- `default` - Apex blue gradient
- `success` - Green gradient
- `warning` - Yellow gradient
- `error` - Red gradient

#### 5. ButtonGrid
```typescript
src/components/dashboard-v2/chat/ButtonGrid.tsx
```
**Grid of action buttons (2 cols mobile, 3-4 desktop).**

**Example:**
```typescript
<ButtonGrid
  buttons={[
    { id: 'team', icon: '👥', label: 'View Team', description: 'See your downline' },
    { id: 'stats', icon: '📊', label: 'Performance', description: 'View stats' },
  ]}
  onButtonClick={(id) => console.log(id)}
  columns={3}
/>
```

#### 6. TeamMemberCard
```typescript
src/components/dashboard-v2/chat/TeamMemberCard.tsx
```
**Shows team member with avatar, name, rank, stats, and action buttons.**

**Example:**
```typescript
<TeamMemberCard
  memberId="1"
  name="Sarah Johnson"
  rank="Gold Partner"
  avatar="https://..."
  stats={{
    personalBV: 1450,
    teamSize: 23,
    monthlyEarnings: 285000
  }}
  onViewProfile={(id) => console.log('View', id)}
  onMessage={(id) => console.log('Message', id)}
  onCall={(id) => console.log('Call', id)}
/>
```

**Action Buttons:**
- View Profile (Apex blue)
- Message (gray outline)
- Call (gray outline, optional)

#### 7. ChartCard
```typescript
src/components/dashboard-v2/chat/ChartCard.tsx
```
**Inline charts using Recharts library.**

**Example:**
```typescript
<ChartCard
  title="Last 7 Days Performance"
  description="Personal BV trend"
  data={[
    { day: 'Mon', bv: 180 },
    { day: 'Tue', bv: 220 },
    ...
  ]}
  type="line"
  dataKey="bv"
  xAxisKey="day"
  color="#2c5aa0"
/>
```

**Chart Types:**
- `line` - Line chart with dots
- `bar` - Bar chart with rounded corners

#### 8. MatrixVisualization
```typescript
src/components/dashboard-v2/chat/MatrixVisualization.tsx
```
**Interactive matrix tree visualization.**

**Features:**
- User at top, downline below
- Click nodes to expand/collapse
- Zoom controls (50% - 200%)
- Level indicators
- Scrollable container
- Connector lines between nodes

**Example:**
```typescript
<MatrixVisualization
  rootNode={{
    id: 'user-1',
    name: 'You',
    rank: 'Gold Partner',
    personalBV: 1450,
    teamSize: 47,
    children: [...]
  }}
  maxDepth={3}
  onNodeClick={(id) => console.log('Node clicked:', id)}
/>
```

## 🎯 Usage Examples

### Display Team Members
```typescript
const assistantMessage = {
  role: 'assistant',
  content: 'Here are your top performers this month:',
  components: [
    {
      type: 'team',
      data: [
        {
          memberId: '1',
          name: 'Sarah Johnson',
          rank: 'Gold Partner',
          stats: { personalBV: 1450, teamSize: 23, monthlyEarnings: 285000 }
        }
      ]
    }
  ]
};
```

### Display Stats Grid
```typescript
const assistantMessage = {
  role: 'assistant',
  content: 'Your performance overview:',
  components: [
    {
      type: 'stats',
      data: [
        { label: 'Personal BV', value: '$1,450', change: {...}, icon: '💰' },
        { label: 'Team Size', value: '47', change: {...}, icon: '👥' },
      ]
    }
  ]
};
```

### Display Chart
```typescript
const assistantMessage = {
  role: 'assistant',
  content: 'Your performance trend:',
  components: [
    {
      type: 'chart',
      data: {
        title: 'Last 7 Days Performance',
        chartData: [...],
        type: 'line',
        dataKey: 'bv',
        xAxisKey: 'day'
      }
    }
  ]
};
```

### Display Matrix Tree
```typescript
const assistantMessage = {
  role: 'assistant',
  content: 'Your matrix structure:',
  components: [
    {
      type: 'matrix',
      data: {
        id: 'user-1',
        name: 'You',
        rank: 'Gold Partner',
        personalBV: 1450,
        teamSize: 47,
        children: [...]
      }
    }
  ]
};
```

## 🔧 Integration with AI API

The dashboard integrates with `/api/dashboard/ai-chat` which uses Anthropic Claude 3.5 Sonnet with function calling.

### Message Flow
1. User types message
2. Message sent to AI API
3. AI responds with text + optional component data
4. Dashboard renders rich components inline

### Component Detection
The dashboard automatically renders rich components based on user intent:
- "show my team" → Team member cards
- "show stats" → Stat cards + charts
- "show matrix" → Matrix visualization
- Default → Text-only response

## 📱 Responsive Breakpoints

```css
/* Mobile: < 1024px */
- Sidebar: Hidden by default (slide-in when opened)
- Quick actions: Horizontal scroll
- Chat bubbles: 95% width
- Components: Stack vertically

/* Desktop: >= 1024px */
- Sidebar: Always visible
- Quick actions: All visible
- Chat bubbles: 75% width
- Components: Grid layouts
```

## 🎨 Color Usage

### Text on Apex Blue Backgrounds
```typescript
✅ ALWAYS USE: text-white, text-slate-100
❌ NEVER USE: text-slate-400, text-slate-500 (fails WCAG)
```

### Status Colors
```typescript
✅ Success: text-green-400 (on dark), text-green-600 (on light)
✅ Warning: text-yellow-300 (on dark), text-yellow-600 (on light)
✅ Error: text-red-400 (on dark), text-red-600 (on light)
```

## 🚀 Getting Started

### 1. Access the Dashboard
Navigate to `/dashboard-v2` to see the new command center.

### 2. Test Features
- Click hamburger menu to toggle sidebar
- Click quick action pills to trigger AI responses
- Try these prompts:
  - "Show my team"
  - "Show my stats"
  - "Show my matrix tree"
  - "Create a meeting"

### 3. Customize
Edit `src/app/dashboard-v2/page.tsx` to:
- Modify initial greeting
- Add more component types
- Customize quick actions
- Change color scheme (though Apex blue is required)

## 📦 Dependencies

All dependencies already installed:
- `react` - Core library
- `react-markdown` - Markdown rendering
- `remark-gfm` - GitHub Flavored Markdown
- `recharts` - Charts library
- `@anthropic-ai/sdk` - AI API
- `tailwindcss` - Styling

## 🔜 Next Steps

### Phase 1: Integration (Current)
- ✅ Component architecture built
- ✅ Apex blue theme applied
- ✅ Mobile-first responsive
- 🔄 Connect to real API data

### Phase 2: AI Enhancement
- Add more tool functions to AI API
- Implement real-time updates
- Add voice input support
- Implement chat history persistence

### Phase 3: Advanced Features
- Matrix tree with live data
- Drag-and-drop matrix placement
- Team member messaging
- Calendar integration
- Document generation

## 🐛 Known Issues

None at this time! All components compile successfully with TypeScript.

## 📝 Notes

- The existing `/api/dashboard/ai-chat` route works but returns demo data
- Real data integration requires connecting to Supabase queries
- Matrix tree uses demo data - needs real distributor hierarchy
- Team member cards use demo data - needs real team stats

## 🎉 Summary

The AI Command Center is a complete redesign of the dashboard experience:
- **Chat-first interface** - Everything through conversation
- **Rich interactive components** - Stats, charts, team cards, matrix trees
- **Mobile-optimized** - Touch-friendly, full-screen, responsive
- **Apex blue branding** - Professional, consistent with brand
- **Extensible architecture** - Easy to add new component types

Access it at: `/dashboard-v2`
