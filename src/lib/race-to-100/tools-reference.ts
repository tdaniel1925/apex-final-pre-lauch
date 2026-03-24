/**
 * Race to 100 Tools & Topics Reference
 *
 * This file contains all available topics and step guides for the Race to 100 AI Coach.
 * Used by the accordion sidebar and by the AI to understand available guidance.
 */

export interface RaceTopic {
  id: string;
  label: string;
  description: string;
  prompt: string;
}

export interface RaceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  topics: RaceTopic[];
}

export const RACE_TO_100_TOOLS: RaceCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: '🚀',
    description: 'Your first steps',
    topics: [
      {
        id: 'welcome',
        label: 'Welcome & Overview',
        description: 'Learn what Race to 100 is about',
        prompt: 'Tell me about the Race to 100. What am I going to do and how does it work?',
      },
      {
        id: 'my-progress',
        label: 'My current progress',
        description: 'Where am I in my journey?',
        prompt: 'Show me where I am in my Race to 100 journey. What have I completed and what\'s next?',
      },
      {
        id: 'quick-start',
        label: 'Quick start guide',
        description: 'Jump right in!',
        prompt: 'Give me a quick start guide. What should I do right now to make progress?',
      },
    ],
  },
  {
    id: 'step-guides',
    name: 'Step-by-Step Guides',
    icon: '📋',
    description: 'Detailed help for each step',
    topics: [
      {
        id: 'step-1',
        label: 'Step 1: Call AI Agent',
        description: 'Learn about your AI phone agent',
        prompt: 'Tell me about Step 1 - calling my AI agent. What is it and how do I test it?',
      },
      {
        id: 'step-2',
        label: 'Step 2: 20/20 Audio',
        description: 'The conversation training',
        prompt: 'Tell me about Step 2 - the 20/20 audio training. What will I learn?',
      },
      {
        id: 'step-3',
        label: 'Step 3: First 48 Hours',
        description: 'Critical first actions',
        prompt: 'Tell me about Step 3 - the First 48 Hours video. What\'s the focus?',
      },
      {
        id: 'step-4',
        label: 'Step 4: Create List',
        description: 'Build your prospect list',
        prompt: 'Tell me about Step 4 - creating my 20-person list. Who should I include?',
      },
      {
        id: 'step-5',
        label: 'Step 5: Watch Videos',
        description: 'Product & opportunity videos',
        prompt: 'Tell me about Step 5 - watching the product/opportunity videos. What will I learn?',
      },
      {
        id: 'step-6',
        label: 'Step 6: Reach Out',
        description: 'Contact your 20 people',
        prompt: 'Tell me about Step 6 - reaching out to 20 people. How do I start conversations?',
      },
    ],
  },
  {
    id: 'skills',
    name: 'Skills & Training',
    icon: '💡',
    description: 'Learn key techniques',
    topics: [
      {
        id: '20-20-technique',
        label: 'The 20/20 Technique',
        description: 'Natural conversation approach',
        prompt: 'Explain the 20/20 conversation technique. How do I use it to talk to people naturally?',
      },
      {
        id: 'objections',
        label: 'Handling objections',
        description: 'What to say when people say no',
        prompt: 'Help me handle objections. What do I say when people say "I don\'t have time" or "I\'m not interested"?',
      },
      {
        id: 'follow-up',
        label: 'Follow-up strategies',
        description: 'Stay in touch effectively',
        prompt: 'Teach me follow-up strategies. How do I stay in touch with prospects without being annoying?',
      },
      {
        id: 'closing',
        label: 'Closing techniques',
        description: 'Ask for the sale',
        prompt: 'Show me how to close. What do I say to get people to sign up?',
      },
    ],
  },
  {
    id: 'motivation',
    name: 'Motivation & Mindset',
    icon: '🔥',
    description: 'Stay inspired and focused',
    topics: [
      {
        id: 'why',
        label: 'Remember your why',
        description: 'Stay connected to your purpose',
        prompt: 'Help me remember why I\'m doing this. Keep me motivated!',
      },
      {
        id: 'overcome-fear',
        label: 'Overcome call fear',
        description: 'Get past the hesitation',
        prompt: 'I\'m nervous about reaching out to people. Help me overcome this fear!',
      },
      {
        id: 'celebrate-wins',
        label: 'Celebrate my wins',
        description: 'Acknowledge your progress',
        prompt: 'Let\'s celebrate my progress! What have I accomplished so far?',
      },
      {
        id: 'stay-focused',
        label: 'Stay focused',
        description: 'Daily momentum tips',
        prompt: 'Help me stay focused and motivated. What should I do every single day?',
      },
    ],
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    icon: '❓',
    description: 'Get unstuck',
    topics: [
      {
        id: 'stuck',
        label: 'I\'m stuck!',
        description: 'Not sure what to do next',
        prompt: 'I\'m stuck and don\'t know what to do next. Help me figure out my next move!',
      },
      {
        id: 'no-responses',
        label: 'Not getting responses',
        description: 'People aren\'t responding',
        prompt: 'I reached out to people but no one is responding. What should I do differently?',
      },
      {
        id: 'time-management',
        label: 'Finding time',
        description: 'Balancing business with life',
        prompt: 'I\'m struggling to find time for this business. How do I fit it into my schedule?',
      },
      {
        id: 'who-to-contact',
        label: 'Who should I contact?',
        description: 'Building your list',
        prompt: 'I don\'t know who to contact. Help me think of people to reach out to!',
      },
    ],
  },
  {
    id: 'next-steps',
    name: 'After First Sale',
    icon: '🎯',
    description: 'What comes after 100 points',
    topics: [
      {
        id: 'help-recruit',
        label: 'Help my new recruit',
        description: 'Guide them to success',
        prompt: 'I got my first signup! How do I help them get started with their own Race to 100?',
      },
      {
        id: 'building-team',
        label: 'Building my team',
        description: 'Scale your business',
        prompt: 'Now that I\'ve made my first sale, how do I build a team and scale this business?',
      },
      {
        id: 'duplication',
        label: 'Duplication system',
        description: 'Teach what you learned',
        prompt: 'Explain how duplication works. How do I teach my team what I learned?',
      },
    ],
  },
];

/**
 * Get all topics as a flat list (useful for search)
 */
export function getAllRaceTopics(): RaceTopic[] {
  return RACE_TO_100_TOOLS.flatMap((category) => category.topics);
}

/**
 * Find a topic by ID
 */
export function findRaceTopicById(id: string): RaceTopic | undefined {
  return getAllRaceTopics().find((topic) => topic.id === id);
}

/**
 * Get category by ID
 */
export function getRaceCategoryById(id: string): RaceCategory | undefined {
  return RACE_TO_100_TOOLS.find((category) => category.id === id);
}
