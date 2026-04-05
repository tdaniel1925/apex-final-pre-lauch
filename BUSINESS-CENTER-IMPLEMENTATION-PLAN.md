# Business Center Complete Implementation Plan
## Streamlining + Help Sections + User Guides

**Date:** April 4, 2026
**Project:** Business Center Tools Optimization
**Goal:** Reduce from 11 tools to 7, add comprehensive help sections, create interactive guides

---

## Phase 1: Immediate Cleanup (Week 1)

### Task 1.1: Remove "Coming Soon" Items from Benefits Page
**File:** `src/app/dashboard/business-center/page.tsx`

**Current issues:**
- Lists "API Access (Coming Soon)" - NOT IMPLEMENTED
- Lists "Advanced Reports & Analytics" - NOT IMPLEMENTED
- Lists "Priority Training & Support" - NOT DIFFERENTIATED

**Action:**
```typescript
// REMOVE these from benefits list (lines 221-231):
<BenefitCard
  icon={<GraduationCap />}
  title="Priority Training & Support"  // ❌ REMOVE
  ...
/>

<BenefitCard
  icon={<Zap />}
  title="API Access (Coming Soon)"  // ❌ REMOVE
  ...
/>
```

**Updated benefits list (6 tools only):**
1. Unlimited AI Chatbot
2. Unlimited AI Voice Agent
3. Full CRM System
4. Advanced Reports (ONLY if implemented)
5. Interactive Genealogy + Matrix
6. Lead Autopilot & Nurture

---

### Task 1.2: Merge AI Team Insights into AI Chatbot
**Files to modify:**
- `src/components/business-center/AIAssistantButton.tsx`
- `src/app/dashboard/ai-insights/page.tsx` → Convert to tab
- `src/components/dashboard/Sidebar.tsx` → Remove separate menu item

**Implementation:**

#### Step 1: Add "Team Insights" tab to AI Chatbot modal

```typescript
// src/components/business-center/AIAssistantClient.tsx

type Tab = 'chat' | 'insights' | 'history';

const tabs = [
  { id: 'chat', name: 'AI Assistant', icon: <MessageSquare /> },
  { id: 'insights', name: 'Team Insights', icon: <Sparkles /> }, // NEW
  { id: 'history', name: 'History', icon: <Clock /> },
];

// Add insights tab content:
{activeTab === 'insights' && (
  <TeamInsightsContent distributorId={distributorId} />
)}
```

#### Step 2: Extract Team Insights UI into reusable component

```typescript
// src/components/business-center/TeamInsightsContent.tsx
export default function TeamInsightsContent({ distributorId }: { distributorId: string }) {
  // Move recommendation fetching and display logic here
  // Reuse existing RecommendationCard component
}
```

#### Step 3: Remove from navigation

```typescript
// src/components/dashboard/Sidebar.tsx
// DELETE this item from Business Center submenu:
{
  name: 'AI Team Insights',
  href: '/dashboard/ai-insights',  // ❌ DELETE
}
```

---

### Task 1.3: Update Navigation Structure
**File:** `src/components/dashboard/Sidebar.tsx`

**Before (11 items):**
- Business Center Dashboard
- Lead Autopilot
- AI Lead Nurture
- AI Voice Calls
- AI Team Insights ❌
- Meeting Reservations
- CRM Dashboard
- Leads
- Contacts
- Activities ❌
- Tasks ❌

**After (7 items):**
- Business Center Dashboard
- Lead Autopilot
- AI Lead Nurture
- AI Voice Calls
- CRM Dashboard (with Activities & Tasks tabs)
- Leads
- Contacts

---

## Phase 2: CRM Consolidation (Week 2)

### Task 2.1: Convert Activities & Tasks to Tabs
**Files to modify:**
- `src/app/dashboard/crm/page.tsx` - Add tabbed interface
- `src/app/dashboard/crm/activities/page.tsx` - Convert to component
- `src/app/dashboard/crm/tasks/page.tsx` - Convert to component

**Implementation:**

#### Step 1: Create tabbed CRM dashboard

```typescript
// src/app/dashboard/crm/page.tsx

'use client';
import { useState } from 'react';

type CRMTab = 'overview' | 'activities' | 'tasks';

export default function CRMDashboard() {
  const [activeTab, setActiveTab] = useState<CRMTab>('overview');

  return (
    <div className="p-6">
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-slate-200">
        <nav className="flex gap-4">
          <TabButton tab="overview" active={activeTab} onClick={setActiveTab}>
            Dashboard Overview
          </TabButton>
          <TabButton tab="activities" active={activeTab} onClick={setActiveTab}>
            Recent Activities
          </TabButton>
          <TabButton tab="tasks" active={activeTab} onClick={setActiveTab}>
            My Tasks
          </TabButton>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <CRMOverview />}
      {activeTab === 'activities' && <ActivitiesContent />}
      {activeTab === 'tasks' && <TasksContent />}
    </div>
  );
}
```

#### Step 2: Extract Activities content

```typescript
// src/components/crm/ActivitiesContent.tsx
export default function ActivitiesContent() {
  // Move content from src/app/dashboard/crm/activities/page.tsx
}
```

#### Step 3: Extract Tasks content

```typescript
// src/components/crm/TasksContent.tsx
export default function TasksContent() {
  // Move content from src/app/dashboard/crm/tasks/page.tsx
}
```

#### Step 4: Redirect old routes

```typescript
// src/app/dashboard/crm/activities/page.tsx
import { redirect } from 'next/navigation';
export default function ActivitiesRedirect() {
  redirect('/dashboard/crm?tab=activities');
}

// src/app/dashboard/crm/tasks/page.tsx
import { redirect } from 'next/navigation';
export default function TasksRedirect() {
  redirect('/dashboard/crm?tab=tasks');
}
```

---

## Phase 3: Add Usage Limits (Week 3)

### Task 3.1: Implement CRM Usage Limits

**Database migration needed:**
```sql
-- supabase/migrations/YYYYMMDDHHMMSS_add_crm_limits.sql

-- Add usage tracking columns to distributors table
ALTER TABLE distributors
ADD COLUMN IF NOT EXISTS crm_leads_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS crm_contacts_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS crm_tasks_count INTEGER DEFAULT 0;

-- Create triggers to auto-update counts
CREATE OR REPLACE FUNCTION update_crm_leads_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE distributors
    SET crm_leads_count = crm_leads_count + 1
    WHERE id = NEW.distributor_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE distributors
    SET crm_leads_count = crm_leads_count - 1
    WHERE id = OLD.distributor_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER crm_leads_count_trigger
AFTER INSERT OR DELETE ON crm_leads
FOR EACH ROW EXECUTE FUNCTION update_crm_leads_count();

-- Repeat for contacts and tasks
```

**Limit enforcement:**
```typescript
// src/lib/subscription/crm-limits.ts

export interface CRMLimits {
  leads: { limit: number; current: number; canCreate: boolean };
  contacts: { limit: number; current: number; canCreate: boolean };
  tasks: { limit: number; current: number; canCreate: boolean };
}

export async function checkCRMLimits(distributorId: string): Promise<CRMLimits> {
  const bcStatus = await checkBusinessCenterSubscription(distributorId);

  // Get current counts
  const { data: distributor } = await supabase
    .from('distributors')
    .select('crm_leads_count, crm_contacts_count, crm_tasks_count')
    .eq('id', distributorId)
    .single();

  // Free tier limits
  const LIMITS = {
    leads: bcStatus.hasSubscription ? -1 : 50,
    contacts: bcStatus.hasSubscription ? -1 : 100,
    tasks: bcStatus.hasSubscription ? -1 : 20,
  };

  return {
    leads: {
      limit: LIMITS.leads,
      current: distributor?.crm_leads_count || 0,
      canCreate: LIMITS.leads === -1 || (distributor?.crm_leads_count || 0) < LIMITS.leads,
    },
    contacts: {
      limit: LIMITS.contacts,
      current: distributor?.crm_contacts_count || 0,
      canCreate: LIMITS.contacts === -1 || (distributor?.crm_contacts_count || 0) < LIMITS.contacts,
    },
    tasks: {
      limit: LIMITS.tasks,
      current: distributor?.crm_tasks_count || 0,
      canCreate: LIMITS.tasks === -1 || (distributor?.crm_tasks_count || 0) < LIMITS.tasks,
    },
  };
}
```

**Enforce in UI:**
```typescript
// src/app/dashboard/crm/leads/page.tsx

export default async function LeadsPage() {
  const distributor = await getCurrentDistributor();
  const limits = await checkCRMLimits(distributor.id);

  return (
    <div>
      {/* Limit Banner */}
      {limits.leads.limit !== -1 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-slate-700">
            <strong>{limits.leads.current} of {limits.leads.limit}</strong> leads used
          </p>
          {!limits.leads.canCreate && (
            <p className="text-sm text-red-600 mt-1">
              Limit reached. <a href="/dashboard/store" className="underline">Upgrade to Business Center</a> for unlimited leads.
            </p>
          )}
        </div>
      )}

      {/* Disable "New Lead" button if limit reached */}
      <button disabled={!limits.leads.canCreate}>
        Add New Lead
      </button>
    </div>
  );
}
```

---

### Task 3.2: Implement Nurture Campaign Limits

**Current issue:** No limit enforced (free users can create unlimited campaigns)

**Fix:**
```typescript
// src/lib/subscription/nurture-limits.ts

export async function checkNurtureCampaignLimit(distributorId: string) {
  const bcStatus = await checkBusinessCenterSubscription(distributorId);

  // Count active campaigns
  const { count } = await supabase
    .from('nurture_campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('distributor_id', distributorId)
    .in('campaign_status', ['active', 'paused']);

  const FREE_LIMIT = 3;
  const limit = bcStatus.hasSubscription ? -1 : FREE_LIMIT;

  return {
    limit,
    current: count || 0,
    canCreate: limit === -1 || (count || 0) < limit,
  };
}
```

**Update UI:**
```typescript
// src/app/dashboard/business-center/ai-nurture/page.tsx

// ALREADY IMPLEMENTED in checkCampaignLimit() function
// Just need to update FREE_LIMIT from current value to 3
```

---

## Phase 4: Comprehensive Help Sections (Week 4-5)

### Overview of Help System Architecture

**3 Levels of Help:**
1. **Inline Tooltips** - Hover icons for quick explanations
2. **Help Sections** - Expandable "How It Works" sections on each page
3. **Full Guides** - Dedicated `/help/business-center/[tool-name]` pages

---

### Task 4.1: Create Help Content Infrastructure

**File structure:**
```
src/
  components/
    help/
      HelpSection.tsx          # Expandable help section component
      HelpTooltip.tsx          # Inline tooltip component
      VideoEmbed.tsx           # Embed Loom/YouTube videos
      StepByStep.tsx           # Step-by-step guide component
  content/
    help/
      ai-chatbot.ts           # Help content for AI Chatbot
      ai-voice.ts             # Help content for AI Voice Agent
      lead-autopilot.ts       # Help content for Lead Autopilot
      ai-nurture.ts           # Help content for AI Lead Nurture
      crm.ts                  # Help content for CRM
      leads.ts                # Help content for Leads
      contacts.ts             # Help content for Contacts
```

---

### Task 4.2: Implement Help Components

#### HelpSection Component

```typescript
// src/components/help/HelpSection.tsx

'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface HelpSectionProps {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export default function HelpSection({ title, defaultExpanded = false, children }: HelpSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-blue-100 transition"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-blue-900">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-blue-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-blue-600" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 border-t border-blue-200">
          <div className="prose prose-sm prose-blue max-w-none">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
```

#### HelpTooltip Component

```typescript
// src/components/help/HelpTooltip.tsx

'use client';
import { HelpCircle } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface HelpTooltipProps {
  content: string;
}

export default function HelpTooltip({ content }: HelpTooltipProps) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button className="inline-flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 transition" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-slate-900 text-white text-sm rounded-lg px-3 py-2 max-w-xs shadow-lg"
            sideOffset={5}
          >
            {content}
            <Tooltip.Arrow className="fill-slate-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
```

#### StepByStep Component

```typescript
// src/components/help/StepByStep.tsx

interface Step {
  title: string;
  description: string;
  image?: string;
}

interface StepByStepProps {
  steps: Step[];
}

export default function StepByStep({ steps }: StepByStepProps) {
  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {index + 1}
            </div>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 mb-1">{step.title}</h4>
            <p className="text-sm text-slate-600">{step.description}</p>
            {step.image && (
              <img
                src={step.image}
                alt={step.title}
                className="mt-3 rounded-lg border border-slate-200"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### Task 4.3: Create Help Content for Each Tool

#### Tool 1: AI Chatbot Help Content

```typescript
// src/content/help/ai-chatbot.ts

export const aiChatbotHelp = {
  title: "How to Use the AI Chatbot",

  overview: `The AI Chatbot is your personal assistant for understanding your Apex business. Ask questions about your team, commissions, rank progress, and products - get instant, accurate answers 24/7.`,

  quickStart: [
    {
      title: "Click the blue chat icon",
      description: "Look for the floating button in the bottom-right corner of any dashboard page.",
    },
    {
      title: "Type your question",
      description: "Ask anything: 'Who are my top performers?', 'How much BV do I need for next rank?', 'Explain the override system'",
    },
    {
      title: "Review the answer",
      description: "AI analyzes your actual data and provides personalized responses.",
    },
    {
      title: "Ask follow-ups",
      description: "Continue the conversation - the AI remembers context from earlier in the chat.",
    },
  ],

  examples: [
    {
      category: "Team Performance",
      questions: [
        "Who are my most active reps this month?",
        "Which team members are close to ranking up?",
        "Show me reps who haven't made a sale in 30 days",
      ],
    },
    {
      category: "Commissions & Earnings",
      questions: [
        "How much BV do I need to hit Manager?",
        "What are my total commissions this month?",
        "Explain how the bonus pool works",
      ],
    },
    {
      category: "Products",
      questions: [
        "What's the difference between PulseFlow and PolicyPing?",
        "How much BV does Business Center generate?",
        "What products should I recommend to small business owners?",
      ],
    },
  ],

  limits: {
    free: "20 messages per day (resets at midnight CST)",
    businessCenter: "Unlimited messages",
  },

  tips: [
    "Be specific - 'Show me Jane's team stats' works better than 'team stats'",
    "Ask for explanations - 'Explain compression in overrides' gets detailed answers",
    "Request action items - 'What should I focus on to rank up?' gives concrete steps",
    "Check history tab to review past conversations",
  ],

  troubleshooting: [
    {
      issue: "AI says 'I don't have access to that data'",
      solution: "Some data requires Business Center subscription. Upgrade at /dashboard/store",
    },
    {
      issue: "Responses seem generic",
      solution: "Provide more context in your question. Instead of 'rank progress', try 'How far am I from Regional Director?'",
    },
    {
      issue: "Hit daily limit",
      solution: "Free users get 20 messages/day. Upgrade to Business Center for unlimited access.",
    },
  ],

  videoUrl: "https://loom.com/example-ai-chatbot-demo", // TODO: Record actual video
};
```

#### Tool 2: AI Voice Agent Help Content

```typescript
// src/content/help/ai-voice.ts

export const aiVoiceHelp = {
  title: "How to Use the AI Voice Agent",

  overview: `Practice your sales calls with an AI-powered prospect. Get real-time feedback, overcome objections, and perfect your pitch before talking to real customers.`,

  quickStart: [
    {
      title: "Navigate to AI Voice Calls",
      description: "Click 'Business Center' → 'AI Voice Calls' in the sidebar",
    },
    {
      title: "Choose a scenario",
      description: "Select from pre-built scenarios or create a custom prospect persona",
    },
    {
      title: "Start the call",
      description: "Click 'Start Practice Call' - your browser will ask for microphone permission",
    },
    {
      title: "Practice your pitch",
      description: "Talk naturally - the AI will respond like a real prospect",
    },
    {
      title: "Review feedback",
      description: "After the call, get AI-generated feedback on tone, objection handling, and closing",
    },
  ],

  scenarios: [
    {
      name: "Cold Call - Small Business Owner",
      difficulty: "Medium",
      description: "Practice introducing Apex products to a skeptical business owner",
    },
    {
      name: "Warm Lead - Recruited Distributor",
      difficulty: "Easy",
      description: "Follow up with someone who expressed interest at an event",
    },
    {
      name: "Objection Handling - Price Concerns",
      difficulty: "Hard",
      description: "Handle a prospect who thinks products are too expensive",
    },
    {
      name: "Cross-Sell - Existing Customer",
      difficulty: "Easy",
      description: "Introduce Business Center to a current PulseFlow customer",
    },
  ],

  limits: {
    free: "50 minutes per month",
    businessCenter: "Unlimited minutes",
  },

  tips: [
    "Use headphones for best audio quality",
    "Find a quiet space - background noise confuses the AI",
    "Practice the same scenario multiple times to improve",
    "Record your screen (optional) to review your performance later",
    "Start with 'easy' scenarios before attempting 'hard' objections",
  ],

  feedback: {
    what: "After each call, AI analyzes:",
    metrics: [
      "Talk-to-listen ratio (goal: 40% you talking, 60% listening)",
      "Number of questions asked (more questions = better engagement)",
      "Objection handling effectiveness",
      "Tone and confidence level",
      "Call-to-action clarity",
    ],
  },

  troubleshooting: [
    {
      issue: "Microphone not working",
      solution: "Check browser permissions. Click the lock icon in address bar → Allow microphone access",
    },
    {
      issue: "AI doesn't respond",
      solution: "Speak clearly and wait 1-2 seconds after finishing your sentence",
    },
    {
      issue: "Audio is choppy",
      solution: "Check your internet connection. Voice calls require stable 5+ Mbps connection",
    },
  ],

  videoUrl: "https://loom.com/example-ai-voice-demo", // TODO: Record actual video
};
```

#### Tool 3: Lead Autopilot Help Content

```typescript
// src/content/help/lead-autopilot.ts

export const leadAutopilotHelp = {
  title: "How to Use Lead Autopilot",

  overview: `Send personalized meeting invitations to up to 10 prospects at once. Create event registration pages, track RSVPs, and automate follow-up emails.`,

  quickStart: [
    {
      title: "Create a meeting",
      description: "Go to 'Meeting Reservations' tab and click 'Create New Meeting'",
    },
    {
      title: "Fill in meeting details",
      description: "Date, time, Zoom link, topic, description",
    },
    {
      title: "Send bulk invitations",
      description: "Add up to 10 email addresses, personalize the message",
    },
    {
      title: "Track responses",
      description: "See who opened, who RSVP'd, who clicked links",
    },
    {
      title: "Automate follow-ups",
      description: "System sends reminder emails 24 hours before meeting",
    },
  ],

  features: [
    {
      name: "Bulk Invitations (up to 10)",
      description: "Send to multiple prospects at once - saves hours of manual emailing",
    },
    {
      name: "Personalization",
      description: "Use {{firstName}} and {{prospectSource}} to customize each email",
    },
    {
      name: "Event Landing Pages",
      description: "Each meeting gets a unique registration URL to share on social media",
    },
    {
      name: "RSVP Tracking",
      description: "Real-time updates when prospects confirm attendance",
    },
    {
      name: "Automated Reminders",
      description: "System sends reminder emails 24 hours before event",
    },
  ],

  bestPractices: [
    "Send invitations 7-10 days before the event (not last-minute)",
    "Tuesday-Thursday 10am-2pm are best send times",
    "Keep invitation messages under 150 words",
    "Include 'What's in it for them' in first sentence",
    "Add social proof: 'Join 50+ agents already registered'",
    "Follow up with non-responders 3 days after sending",
  ],

  templates: [
    {
      occasion: "Monthly Business Overview",
      subject: "{{firstName}}, join our monthly business briefing ({{date}})",
      preview: "Discover how new agents are earning $2K-$5K/month with Apex products...",
    },
    {
      occasion: "Product Launch Webinar",
      subject: "🚀 NEW: See the latest Apex product before anyone else",
      preview: "You're invited to an exclusive first look at our newest insurance tech...",
    },
    {
      occasion: "Training Session",
      subject: "Learn the 3-step system top earners use (Free training)",
      preview: "I'm hosting a live training on the exact system Regional Directors use...",
    },
  ],

  videoUrl: "https://loom.com/example-autopilot-demo", // TODO: Record actual video
};
```

#### Tool 4: AI Lead Nurture Help Content

```typescript
// src/content/help/ai-nurture.ts

export const aiNurtureHelp = {
  title: "How to Use AI Lead Nurture",

  overview: `Set up personalized 7-week email campaigns for prospects. AI writes custom emails based on their interests, birthday, hobbies, and how you met.`,

  quickStart: [
    {
      title: "Click 'Create New Campaign'",
      description: "Navigate to AI Lead Nurture and start a new campaign",
    },
    {
      title: "Enter prospect details",
      description: "Name, email, how you met (required). Birthday, hobbies, kids (optional but recommended)",
    },
    {
      title: "AI generates 7 emails",
      description: "System creates personalized weekly emails based on their profile",
    },
    {
      title: "Campaign runs automatically",
      description: "One email sent per week for 7 weeks. Track opens, clicks, responses",
    },
    {
      title: "Monitor engagement",
      description: "See which prospects engage most, follow up with hot leads",
    },
  ],

  howItWorks: {
    week1: "Introduction email - references how you met",
    week2: "Value email - shares relevant success story",
    week3: "Education email - explains Apex opportunity",
    week4: "Social proof email - testimonials from similar people",
    week5: "Personal email - references their birthday/hobbies if provided",
    week6: "Objection handling email - addresses common concerns",
    week7: "Call to action email - invites to meeting or call",
  },

  limits: {
    free: "3 active campaigns at once",
    businessCenter: "Unlimited campaigns",
  },

  tips: [
    "Fill in birthday/hobbies/kids - makes emails WAY more personal",
    "Be specific about 'how you met' - AI uses this in Week 1 email",
    "Pause campaigns if prospect responds (to avoid spam)",
    "Track 'Week 4-5' for highest engagement (best time to call)",
    "Copy high-performing email templates for future use",
  ],

  examples: [
    {
      input: {
        name: "Sarah Johnson",
        met: "Coffee shop networking event on March 15th",
        interests: "Work from home, health & wellness, passive income",
        birthday: "05-15",
        kids: "2",
        hobbies: "Yoga, reading",
      },
      week1Email: `Hi Sarah,

Great meeting you at the coffee shop networking event last week! I loved hearing about your yoga practice and how you balance it with raising two kids.

You mentioned you're interested in work-from-home opportunities that align with health and wellness - that's exactly what Apex is about.

Would you be open to a quick 10-minute call this week to learn more? No pressure, just wanted to follow up while it's fresh.

Best,
[Your Name]`,
    },
  ],

  troubleshooting: [
    {
      issue: "Emails going to spam",
      solution: "Ask prospect to add your email to contacts. Use company email (@theapexway.net) not personal Gmail",
    },
    {
      issue: "Low open rates",
      solution: "Check send time (Tuesday/Thursday 10am-2pm best). Improve subject lines (ask AI for suggestions)",
    },
    {
      issue: "Prospect responded - what now?",
      solution: "PAUSE the campaign immediately. Reply personally, don't let automated emails continue",
    },
  ],

  videoUrl: "https://loom.com/example-nurture-demo", // TODO: Record actual video
};
```

#### Tool 5: CRM Dashboard Help Content

```typescript
// src/content/help/crm.ts

export const crmHelp = {
  title: "How to Use the CRM System",

  overview: `Manage leads, contacts, activities, and tasks in one place. Never lose track of a prospect, follow-up, or opportunity again.`,

  quickStart: [
    {
      title: "Add your first lead",
      description: "Click 'Leads' → 'Add New Lead' to create a prospect record",
    },
    {
      title: "Log activities",
      description: "Record calls, meetings, emails - keep a history of every interaction",
    },
    {
      title: "Set follow-up tasks",
      description: "Create tasks with due dates - system will remind you",
    },
    {
      title: "Convert leads to contacts",
      description: "When a lead signs up, convert them to a contact with one click",
    },
    {
      title: "View pipeline",
      description: "Dashboard shows your sales pipeline: new leads → contacted → closing → won",
    },
  ],

  concepts: {
    leads: "Prospects who haven't signed up yet. Track interest level, last contact date, next action.",
    contacts: "Active customers or team members. Full profile with purchase history and notes.",
    activities: "Log of all interactions: calls, meetings, emails. Build a relationship timeline.",
    tasks: "To-do items with due dates. Get reminders so nothing slips through cracks.",
  },

  limits: {
    free: "50 leads, 100 contacts, 20 tasks",
    businessCenter: "Unlimited leads, contacts, tasks",
  },

  workflow: [
    {
      title: "Capture lead",
      description: "Enter name, email, phone, source (where you met)",
      status: "New",
    },
    {
      title: "First contact",
      description: "Log activity: 'Called, left voicemail'. Set task: 'Follow up in 3 days'",
      status: "Contacted",
    },
    {
      title: "Build relationship",
      description: "Log every interaction. Update notes with interests, objections, goals",
      status: "Qualified",
    },
    {
      title: "Present offer",
      description: "Log meeting activity. Set task: 'Send contract'",
      status: "Proposal",
    },
    {
      title: "Close deal",
      description: "Convert to contact. Mark opportunity as 'Won'",
      status: "Customer",
    },
  ],

  tips: [
    "Add notes IMMEDIATELY after calls - you'll forget details in 10 minutes",
    "Set tasks with specific dates - 'Follow up Friday 2pm' not 'follow up soon'",
    "Use tags to categorize: 'Hot Lead', 'Cold', 'Needs Nurture', 'Ready to Close'",
    "Review pipeline weekly - focus on leads in 'Qualified' and 'Proposal' stages",
    "Archive old leads (no contact in 90 days) to keep dashboard clean",
  ],

  integrations: {
    leadAutopilot: "Send meeting invitations directly from lead profile",
    aiNurture: "Start 7-week nurture campaign with one click",
    aiChatbot: "Ask 'Show me my hottest leads' to get AI-powered prioritization",
  },

  videoUrl: "https://loom.com/example-crm-demo", // TODO: Record actual video
};
```

---

### Task 4.4: Add Help Sections to Each Tool Page

#### Example: AI Chatbot with Help Section

```typescript
// src/components/business-center/AIAssistantClient.tsx

import HelpSection from '@/components/help/HelpSection';
import StepByStep from '@/components/help/StepByStep';
import { aiChatbotHelp } from '@/content/help/ai-chatbot';

export default function AIAssistantClient() {
  return (
    <div>
      {/* Existing chat interface */}

      {/* NEW: Help Section at bottom of modal */}
      {activeTab === 'chat' && (
        <div className="mt-6 border-t border-slate-200 pt-6">
          <HelpSection title={aiChatbotHelp.title}>
            <p className="mb-4">{aiChatbotHelp.overview}</p>

            <h4 className="font-semibold text-slate-900 mb-3">Quick Start:</h4>
            <StepByStep steps={aiChatbotHelp.quickStart} />

            <h4 className="font-semibold text-slate-900 mb-3 mt-6">Example Questions:</h4>
            {aiChatbotHelp.examples.map((category, idx) => (
              <div key={idx} className="mb-4">
                <h5 className="font-medium text-slate-800 mb-2">{category.category}</h5>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
                  {category.questions.map((q, qIdx) => (
                    <li key={qIdx}>{q}</li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-semibold text-yellow-900 mb-2">💡 Pro Tips:</h5>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                {aiChatbotHelp.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </HelpSection>
        </div>
      )}
    </div>
  );
}
```

---

## Phase 5: Dedicated Help Pages (Week 6)

### Task 5.1: Create Help Center Structure

```
src/app/help/
  business-center/
    page.tsx                    # Overview of all BC tools
    ai-chatbot/
      page.tsx                  # Full guide for AI Chatbot
    ai-voice/
      page.tsx                  # Full guide for AI Voice Agent
    lead-autopilot/
      page.tsx                  # Full guide for Lead Autopilot
    ai-nurture/
      page.tsx                  # Full guide for AI Lead Nurture
    crm/
      page.tsx                  # Full guide for CRM system
    leads/
      page.tsx                  # Full guide for Leads
    contacts/
      page.tsx                  # Full guide for Contacts
```

### Task 5.2: Create Help Center Landing Page

```typescript
// src/app/help/business-center/page.tsx

export default function BusinessCenterHelpPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          Business Center Help Center
        </h1>
        <p className="text-xl text-slate-600 mb-12">
          Learn how to use all 7 Business Center tools to grow your Apex business
        </p>

        {/* Tool Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <HelpCard
            title="AI Chatbot"
            description="Get instant answers about your team, commissions, and products"
            href="/help/business-center/ai-chatbot"
            icon={<MessageSquare />}
            video="https://loom.com/ai-chatbot-demo"
            readTime="5 min read"
          />

          <HelpCard
            title="AI Voice Agent"
            description="Practice sales calls and perfect your pitch with AI"
            href="/help/business-center/ai-voice"
            icon={<Phone />}
            video="https://loom.com/ai-voice-demo"
            readTime="7 min read"
          />

          {/* Repeat for all 7 tools */}
        </div>

        {/* Quick Links */}
        <div className="mt-12 bg-white rounded-lg border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Links</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <QuickLink
              title="Getting Started"
              description="New to Business Center? Start here"
              href="/help/business-center/getting-started"
            />
            <QuickLink
              title="Video Tutorials"
              description="Watch step-by-step walkthroughs"
              href="/help/business-center/videos"
            />
            <QuickLink
              title="FAQs"
              description="Common questions answered"
              href="/help/business-center/faq"
            />
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 mb-4">
            Can't find what you're looking for?
          </p>
          <a
            href="/dashboard/support"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
```

---

## Phase 6: Video Tutorials (Week 7-8)

### Task 6.1: Record Video Tutorials

**Tools needed:**
- Loom (screen recording)
- Test account with sample data
- Script for each video

**Videos to create:**

1. **AI Chatbot (3-4 minutes)**
   - Show how to open modal
   - Ask 5 example questions
   - Demonstrate Team Insights tab
   - Show chat history

2. **AI Voice Agent (5-6 minutes)**
   - Select scenario
   - Practice full call (2 min demo)
   - Review AI feedback
   - Show usage tracking

3. **Lead Autopilot (4-5 minutes)**
   - Create meeting
   - Send bulk invitations
   - Track RSVPs
   - View meeting page

4. **AI Lead Nurture (5-6 minutes)**
   - Create campaign
   - Fill in prospect details
   - Preview generated emails
   - Monitor campaign progress

5. **CRM System (6-7 minutes)**
   - Add lead
   - Log activity
   - Create task
   - Convert to contact
   - View pipeline

6. **Leads Management (3-4 minutes)**
   - Add new lead
   - Update lead status
   - Set follow-up tasks
   - Convert to customer

7. **Contacts Management (3-4 minutes)**
   - View contact profile
   - Add notes
   - Track purchase history
   - Export contacts

### Task 6.2: Embed Videos in Help Pages

```typescript
// src/components/help/VideoEmbed.tsx

interface VideoEmbedProps {
  loomUrl: string;
  title: string;
}

export default function VideoEmbed({ loomUrl, title }: VideoEmbedProps) {
  // Extract Loom video ID from URL
  const videoId = loomUrl.split('/').pop();

  return (
    <div className="aspect-video rounded-lg overflow-hidden shadow-lg mb-6">
      <iframe
        src={`https://www.loom.com/embed/${videoId}`}
        frameBorder="0"
        webkitallowfullscreen
        mozallowfullscreen
        allowFullScreen
        className="w-full h-full"
        title={title}
      ></iframe>
    </div>
  );
}
```

---

## Phase 7: Interactive Tooltips (Week 9)

### Task 7.1: Add Tooltips to Key UI Elements

**Install Radix UI Tooltip:**
```bash
npm install @radix-ui/react-tooltip
```

**Add tooltips to:**

1. **AI Chatbot:**
   - "Daily limit" badge
   - "Team Insights" tab
   - "Clear history" button

2. **AI Voice Agent:**
   - "Scenario difficulty" badge
   - "Feedback score" metrics
   - "Monthly usage" chart

3. **Lead Autopilot:**
   - "Bulk send (up to 10)" label
   - "Personalization tags" field
   - "RSVP tracking" status

4. **CRM:**
   - "Lead status" dropdown
   - "Next follow-up date" field
   - "Convert to contact" button

**Example implementation:**

```typescript
// src/app/dashboard/business-center/ai-nurture/page.tsx

import HelpTooltip from '@/components/help/HelpTooltip';

<div className="flex items-center gap-2">
  <label>Birthday (Optional)</label>
  <HelpTooltip content="Adding birthday allows AI to personalize Week 5 email with birthday wishes, increasing engagement by 40%" />
</div>
```

---

## Implementation Timeline

| Week | Phase | Tasks | Est. Hours |
|------|-------|-------|------------|
| 1 | Quick Wins | Remove "Coming Soon", Update navigation | 8h |
| 2 | CRM Consolidation | Tabs, redirects, update links | 16h |
| 3 | Usage Limits | Database migration, UI enforcement | 20h |
| 4 | Help Infrastructure | Components, content files | 24h |
| 5 | Help Content | Write guides for all 7 tools | 32h |
| 6 | Help Pages | Dedicated help center | 16h |
| 7-8 | Video Tutorials | Record, edit, embed 7 videos | 40h |
| 9 | Tooltips | Add interactive tooltips | 12h |
| **Total** | | | **168 hours (~4 weeks)** |

---

## Success Metrics

### Before Implementation:
- ❌ 11 tools listed (3 "coming soon")
- ❌ No help sections
- ❌ No usage limits enforced
- ❌ No video tutorials
- ❌ No tooltips

### After Implementation:
- ✅ 7 focused tools
- ✅ Comprehensive help on every page
- ✅ Usage limits enforced (50 leads, 100 contacts, 3 campaigns)
- ✅ 7 video tutorials
- ✅ 50+ interactive tooltips
- ✅ Dedicated help center
- ✅ Better UX, higher conversion

---

## Next Steps

1. **Review and approve** this implementation plan
2. **Prioritize phases** - Which should we tackle first?
3. **Allocate resources** - Who will record videos?
4. **Set deadlines** - When do you want this completed?
5. **Begin Phase 1** - Start with quick wins

**Questions?** Contact: tdaniel@botmakers.ai
