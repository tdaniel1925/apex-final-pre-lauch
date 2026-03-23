# AI System Awareness Roadmap

## Current Issue
User asked: "how can we make the ai complete aware of everything in this system?"

This document outlines what's needed for the AI to have full system awareness.

---

## Current Status: 17 Tools ✅

### What AI Can Do Now:
1. **Events** - Create meetings, preview pages, send invitations
2. **Team** - View stats, list members, view details, send announcements
3. **Business** - Check commissions, view rank progress
4. **Marketing** - Generate social posts, create shareable links
5. **CRM** - Add leads, schedule follow-ups
6. **Tutorials** - Interactive learning system

---

## What's Missing for "Complete Awareness"

### 1. **Personal Data Context** (HIGH PRIORITY)
The AI should know WHO the user is without asking:
- [ ] Current rank and rank progress
- [ ] Personal BV/sales this month
- [ ] Qualification status for bonuses
- [ ] Goals and targets
- [ ] Upcoming milestones

**Implementation:**
```typescript
// Add to system prompt dynamically:
const { data: userContext } = await supabase
  .from('distributors')
  .select(`
    first_name,
    last_name,
    current_rank,
    personal_bv_monthly,
    sponsor:distributors!sponsor_id(first_name, last_name)
  `)
  .eq('auth_user_id', userId)
  .single();

system: `
You are helping ${userContext.first_name} ${userContext.last_name}.
Current Rank: ${userContext.current_rank}
Personal BV: ${userContext.personal_bv_monthly}
Sponsor: ${userContext.sponsor.first_name} ${userContext.sponsor.last_name}
...
`
```

### 2. **Organizational Knowledge** (HIGH PRIORITY)
AI should understand the business structure:
- [ ] Compensation plan rules (from `src/lib/compensation/config.ts`)
- [ ] Rank requirements
- [ ] Bonus qualifications
- [ ] Matrix vs Enrollment tree difference
- [ ] Product catalog and pricing

**Implementation:**
```typescript
// Load into system prompt:
import { COMPENSATION_PLAN } from '@/lib/compensation/config';

system: `
COMPENSATION PLAN:
- Ranks: ${COMPENSATION_PLAN.ranks.map(r => r.name).join(', ')}
- Binary bonus: ${COMPENSATION_PLAN.binaryBonus.percentage * 100}%
- Override levels: ${COMPENSATION_PLAN.overrideBonus.levels.length}
...
`
```

### 3. **New Tools Needed** (MEDIUM PRIORITY)

#### Team Analytics
```typescript
{
  name: 'get_team_analytics',
  description: 'Get detailed team performance analytics',
  // Returns: team BV, active%, rank distribution, etc.
}
```

#### Personal Performance
```typescript
{
  name: 'get_my_performance',
  description: 'Get personal sales, BV, and qualification status',
  // Returns: monthly sales, BV, bonus qualifications, etc.
}
```

#### Commission Details
```typescript
{
  name: 'get_commission_breakdown',
  description: 'Get detailed commission breakdown by type',
  // Returns: binary, override, matching, retail by week
}
```

#### Genealogy Navigation
```typescript
{
  name: 'view_genealogy_tree',
  description: 'View enrollment or matrix tree structure',
  // Returns: tree visualization, depth, width, etc.
}
```

#### Goal Management
```typescript
{
  name: 'set_personal_goal',
  description: 'Set or view personal goals and targets',
}
{
  name: 'check_goal_progress',
  description: 'Check progress toward goals',
}
```

#### Calendar/Schedule
```typescript
{
  name: 'view_my_calendar',
  description: 'View upcoming events, meetings, follow-ups',
}
{
  name: 'add_calendar_event',
  description: 'Add event to personal calendar',
}
```

#### Marketing Materials
```typescript
{
  name: 'get_marketing_materials',
  description: 'Get approved marketing materials, flyers, videos',
  // Returns: library of compliant marketing content
}
```

#### Training Resources
```typescript
{
  name: 'get_training_resources',
  description: 'Get training videos, guides, playbooks',
  // Returns: organized training content
}
```

#### Product Catalog
```typescript
{
  name: 'search_products',
  description: 'Search product catalog',
}
{
  name: 'get_product_details',
  description: 'Get detailed product information',
}
```

#### Compliance Check
```typescript
{
  name: 'check_compliance',
  description: 'Check if a message/post is compliant',
  // Uses AI to check against compliance rules
}
```

### 4. **Historical Context** (LOW PRIORITY)
AI should remember past conversations:
- [ ] Store conversation history in database
- [ ] Reference past questions/answers
- [ ] Learn user preferences over time

**Implementation:**
```sql
CREATE TABLE ai_chat_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  distributor_id UUID REFERENCES distributors(id),
  conversation_id UUID,
  role TEXT, -- 'user' or 'assistant'
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 5. **Proactive Suggestions** (LOW PRIORITY)
AI should proactively suggest actions:
- "You're 500 BV away from Gold rank this month!"
- "You have 3 team members who joined in the last week - want to send them a welcome message?"
- "Your meeting is tomorrow - want to send reminder invitations?"

---

## Implementation Priority

### Phase 1: Context Enhancement (1-2 hours)
- ✅ Fix quantity understanding ("first 3 people")
- [ ] Add personal data to system prompt
- [ ] Add compensation plan knowledge
- [ ] Add product catalog knowledge

### Phase 2: Core Tools (2-4 hours)
- [ ] Team analytics tool
- [ ] Personal performance tool
- [ ] Commission breakdown tool
- [ ] Genealogy navigation tool

### Phase 3: Advanced Tools (4-8 hours)
- [ ] Goal management tools
- [ ] Calendar integration
- [ ] Marketing materials library
- [ ] Training resources library
- [ ] Compliance checker

### Phase 4: Intelligence (8+ hours)
- [ ] Conversation history storage
- [ ] Proactive suggestions
- [ ] Personalization/learning

---

## Testing the Fix

To test the "first 3 people" fix:
1. Go to `/dashboard/ai-chat-test`
2. Ask: "who are my first 3 people?"
3. Should see: "👥 **Your Team Members** (showing 3 of 12)"
4. Should only show 3 people, not all 12

---

## Summary

**To make AI "completely aware":**
1. ✅ **Fixed:** Quantity understanding (limit parameter)
2. 🟡 **Next:** Add user context to system prompt
3. 🟡 **Next:** Add business rules knowledge
4. ⚪ **Future:** Build 10+ additional tools
5. ⚪ **Future:** Add conversation memory

**Quick Win:** Phases 1-2 would give 80% of "complete awareness" with minimal effort.
