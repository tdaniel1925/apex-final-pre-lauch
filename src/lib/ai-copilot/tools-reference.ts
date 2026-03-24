/**
 * AI Copilot Tools & Topics Reference
 *
 * This file contains all available topics and prompts for the AI Copilot.
 * Used by the accordion sidebar to build the UI and by the AI to understand available tools.
 */

export interface Topic {
  id: string;
  label: string;
  description: string;
  prompt: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  topics: Topic[];
}

export const AI_COPILOT_TOOLS: ToolCategory[] = [
  {
    id: 'business',
    name: 'Business Overview',
    icon: '📊',
    description: 'Revenue, metrics, and performance',
    topics: [
      {
        id: 'revenue',
        label: 'Show my revenue',
        description: 'View total revenue and earnings breakdown',
        prompt: 'Show me my total revenue and earnings breakdown. Include commissions, overrides, and bonuses.',
      },
      {
        id: 'team-size',
        label: 'Team size & growth',
        description: 'See your team size and growth trends',
        prompt: 'How many people are on my team? Show me team growth over time.',
      },
      {
        id: 'performance',
        label: 'Performance summary',
        description: 'Overall business performance metrics',
        prompt: 'Give me a summary of my business performance this month. Include sales, team growth, and key metrics.',
      },
    ],
  },
  {
    id: 'strategy',
    name: 'Strategy & Planning',
    icon: '🎯',
    description: 'Goals, plans, and next steps',
    topics: [
      {
        id: 'goals',
        label: 'Review my goals',
        description: 'Check progress on your business goals',
        prompt: 'Show me my current goals and progress. What should I focus on next?',
      },
      {
        id: 'roadmap',
        label: 'Next 30 days plan',
        description: 'Get a personalized action plan',
        prompt: 'Create a 30-day action plan for me based on my current business state. What should I do each week?',
      },
      {
        id: 'rank-advancement',
        label: 'Path to next rank',
        description: "What's needed to advance in rank",
        prompt: 'What do I need to do to reach the next rank? Show me exact requirements and a step-by-step plan.',
      },
    ],
  },
  {
    id: 'team',
    name: 'Team & Recruitment',
    icon: '👥',
    description: 'Downline, training, and support',
    topics: [
      {
        id: 'downline',
        label: 'View my downline',
        description: 'See your team structure and members',
        prompt: 'Show me my downline structure. Who are my top performers?',
      },
      {
        id: 'new-members',
        label: 'Recent signups',
        description: 'Who joined your team recently',
        prompt: 'Show me recent signups in my team. When did they join and what do they need help with?',
      },
      {
        id: 'recruiting-tips',
        label: 'Recruiting strategies',
        description: 'Get tips on growing your team',
        prompt: 'Give me proven strategies for recruiting new team members. What works best in my situation?',
      },
    ],
  },
  {
    id: 'commissions',
    name: 'Commissions & Payouts',
    icon: '💰',
    description: 'Earnings, bonuses, and overrides',
    topics: [
      {
        id: 'earnings',
        label: 'This month earnings',
        description: 'See your current month earnings',
        prompt: 'Show me my earnings for this month. Break down commissions, overrides, and bonuses.',
      },
      {
        id: 'payout-history',
        label: 'Payout history',
        description: 'View past commissions and payouts',
        prompt: 'Show me my payout history for the last 6 months. What are the trends?',
      },
      {
        id: 'override-breakdown',
        label: 'Override breakdown',
        description: 'Understand your override earnings',
        prompt: 'Explain my override earnings. Which levels am I earning from and how much?',
      },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing & Tools',
    icon: '📱',
    description: 'Social media, AI agent, resources',
    topics: [
      {
        id: 'ai-agent',
        label: 'My AI agent status',
        description: 'Check your AI phone agent setup',
        prompt: 'Show me the status of my AI phone agent. Is it active? How many calls has it handled?',
      },
      {
        id: 'social-media',
        label: 'Social media tips',
        description: 'Get content ideas and posting strategies',
        prompt: 'Give me social media content ideas for this week. What should I post to attract customers and recruits?',
      },
      {
        id: 'marketing-materials',
        label: 'Marketing materials',
        description: 'Access videos, images, and resources',
        prompt: 'What marketing materials are available? Show me videos and resources I can share.',
      },
    ],
  },
  {
    id: 'training',
    name: 'Training & Education',
    icon: '🎓',
    description: 'Videos, guides, and best practices',
    topics: [
      {
        id: 'recommended-training',
        label: 'Recommended for me',
        description: 'Training specific to your situation',
        prompt: 'What training should I focus on right now based on my business stage?',
      },
      {
        id: 'product-knowledge',
        label: 'Product training',
        description: 'Learn about the products',
        prompt: 'Show me product training videos and resources. What do I need to know to present effectively?',
      },
      {
        id: 'leadership',
        label: 'Leadership skills',
        description: 'Build your leadership abilities',
        prompt: 'Give me training on leadership skills. How do I become a better team leader?',
      },
    ],
  },
  {
    id: 'quick-actions',
    name: 'Quick Actions',
    icon: '⚡',
    description: 'Common tasks and shortcuts',
    topics: [
      {
        id: 'daily-checklist',
        label: 'Daily action checklist',
        description: 'What to do every day',
        prompt: 'Give me a daily action checklist. What should I do every single day to grow my business?',
      },
      {
        id: 'follow-up',
        label: 'Who to follow up with',
        description: 'See who needs your attention',
        prompt: 'Who should I follow up with today? Show me prospects and team members who need contact.',
      },
      {
        id: 'quick-win',
        label: 'Quick win opportunity',
        description: 'Get an immediate action item',
        prompt: 'Give me one quick win I can accomplish today. What single action will have the biggest impact?',
      },
    ],
  },
];

/**
 * Get all topics as a flat list (useful for search)
 */
export function getAllTopics(): Topic[] {
  return AI_COPILOT_TOOLS.flatMap((category) => category.topics);
}

/**
 * Find a topic by ID
 */
export function findTopicById(id: string): Topic | undefined {
  return getAllTopics().find((topic) => topic.id === id);
}

/**
 * Get category by ID
 */
export function getCategoryById(id: string): ToolCategory | undefined {
  return AI_COPILOT_TOOLS.find((category) => category.id === id);
}
