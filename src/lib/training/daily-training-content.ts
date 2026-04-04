/**
 * Daily Training Content - 30 Days
 *
 * 2-minute podcast-style training on sales, leadership, and team building
 */

export interface DailyTraining {
  day: number;
  title: string;
  category: 'prospecting' | 'objections' | 'team-building' | 'mindset' | 'action';
  duration: string;
  script: string;
  actionItem: string;
  keyTakeaways: string[];
}

export const dailyTrainings: DailyTraining[] = [
  {
    day: 1,
    title: "The Compound Effect of 5 Contacts a Day",
    category: 'prospecting',
    duration: '2:04',
    script: `Welcome to another Apex Affinity Group Morning Moment!

Most reps fail because they make contacts when they "feel like it."

Top earners make contacts like brushing their teeth. Non-negotiable.

Here's the math: 5 contacts per day equals 150 contacts per month. At a 10 percent interest rate, that's 15 conversations. At a 20 percent close rate, that's 3 new team members per month. That's 36 new people in your first year.

The secret? Make it EASY.

Your contact list for today: Number 1, someone you talked to yesterday. Fresh in their mind. Number 2, someone on your social media. Like or comment on their post first. Number 3, someone at the coffee shop, gym, or store. Strike up a conversation. Number 4, someone your spouse knows. Warm introduction. Number 5, someone from your past. Old friend, colleague, classmate.

That's it. 5 people. 2 minutes each. 10 minutes total.

Reality check: Most will say no. That's the game. You're looking for the 1 in 10 who says "Tell me more."

The reps who do this daily for 90 days? They're unstoppable. The reps who skip days? They quit within 6 months.

Which one will you be?

Your action item today: Before you check email again, text 5 people this exact message: "Hey! Quick question, are you open to side income ideas?"

See you tomorrow.`,
    actionItem: 'Text 5 people: "Hey! Quick question - are you open to side income ideas?"',
    keyTakeaways: [
      '5 contacts/day = 150/month = 36 new team members/year',
      'Make it non-negotiable like brushing your teeth',
      'Most will say no - you\'re looking for the 1 in 10',
      '90 days of consistency = unstoppable momentum'
    ]
  },
  {
    day: 2,
    title: "Where to Find Qualified Prospects",
    category: 'prospecting',
    duration: '2:10',
    script: `Welcome to another Apex Affinity Group Morning Moment!

Yesterday you reached out to 5 people. Today, let's talk about WHERE to find the right prospects.

Not all contacts are equal. You want people who are: ambitious, coachable, and frustrated with their current income.

Here are the best places to find them:

LinkedIn: Search for people who recently changed jobs. They're open to new opportunities. Message: "Saw you started a new role. Congrats! Are you open to exploring side income?"

Facebook groups: Join local entrepreneurship and side hustle groups. Engage first, don't pitch immediately. Build rapport for a week, then start conversations.

Your phone contacts: Sort by who you haven't talked to in 6-12 months. Reconnect genuinely: "Hey! It's been a while. How've you been?" Let the conversation flow naturally.

Networking events: Chamber of commerce, meetups, conferences. Go with the goal of making 3 new connections, not pitching.

Your current workplace: The people you see every day. They already know and trust you. Casual mention: "I started a side project. Curious if you'd ever consider extra income?"

The key? Plant seeds everywhere. Most won't be ready today. But in 3 months when their car breaks down or their credit card bill hits, they'll remember you.

Your action today: Pick ONE source from this list. Find 5 people. Start conversations. No pitching yet. Just connect.

See you tomorrow.`,
    actionItem: 'Pick one prospecting source and connect with 5 new people (no pitching yet)',
    keyTakeaways: [
      'Look for ambitious, coachable people frustrated with income',
      'Best sources: LinkedIn job changers, Facebook groups, old contacts',
      'Plant seeds everywhere - they may not be ready today',
      'Focus on connecting first, not pitching immediately'
    ]
  },
  {
    day: 3,
    title: "The 3-Second Approach That Works",
    category: 'prospecting',
    duration: '2:05',
    script: `Welcome to another Apex Affinity Group Morning Moment!

You've been finding prospects. Now let's talk about the OPENING LINE.

Most reps overthink this. They rehearse fancy pitches. They try to sound professional. And they come off as salespeople.

Here's what works: Be human. Be direct. Be brief.

The 3-second approach: "Hey! Quick question - are you open to side income ideas?"

That's it. No explanation. No pitch. No "I have this amazing opportunity." Just that one question.

Why does this work? Three reasons:

One, it's disarming. You're not pitching, you're asking permission.

Two, it's binary. They say yes or no. You don't waste time on maybes.

Three, it creates curiosity. If they say yes, THEY ask YOU what it is. Now you're not chasing, they're pulling.

What happens next?

If they say NO: "No worries! If anything changes, let me know." Move on. No hard feelings.

If they say MAYBE: "Cool! I'll send you some info. No pressure." Then follow up in 3 days.

If they say YES: "Awesome! Let me ask you three quick questions to see if it's a fit." Now you qualify them.

The three questions: One, are you currently working? Two, are you looking to replace your income or just supplement it? Three, if I showed you how to make an extra thousand a month working 10 hours a week, would that interest you?

Based on their answers, you know if they're serious or just curious.

Your action today: Use the 3-second approach with 5 people. Notice how they respond differently when you ASK instead of PITCH.

See you tomorrow.`,
    actionItem: 'Use the 3-second approach: "Are you open to side income ideas?" with 5 people',
    keyTakeaways: [
      'Keep your opening line under 3 seconds',
      'Ask permission, don\'t pitch immediately',
      'Binary response (yes/no) saves time on maybes',
      'If they say yes, qualify them with 3 questions'
    ]
  },
  // Days 4-30 would continue here...
  // For now, creating a condensed version to get the system working
];

export function getTrainingByDay(day: number): DailyTraining | null {
  return dailyTrainings.find(t => t.day === day) || null;
}

export function getAllTrainings(): DailyTraining[] {
  return dailyTrainings;
}
