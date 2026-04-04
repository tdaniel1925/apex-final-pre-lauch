/**
 * Life Insurance Licensing Series - 14 Days
 *
 * Complete guide to preparing for and getting your life insurance license
 * Public series - no login required
 */

export interface LicensingTraining {
  day: number;
  title: string;
  category: 'intro' | 'study' | 'exam' | 'post-license';
  duration: string;
  script: string;
  actionItem: string;
  keyTakeaways: string[];
  resources?: string[];
}

export const licensingTrainings: LicensingTraining[] = [
  {
    day: 1,
    title: "Why Get Licensed? The Income Opportunity",
    category: 'intro',
    duration: '2:30',
    script: `Welcome to another Apex Affinity Group Morning Moment!

Today we're starting a 14-day journey to help you get your life insurance license.

Let me start with the bottom line: A licensed agent in our system can earn 2 to 5 times more than an unlicensed distributor.

Here's why: You can sell insurance products that pay 70 to 90 percent commission. Not the 5 to 10 percent you see in most sales jobs. We're talking about policies that pay you $500 to $2,000 per sale.

But it's not just about the money. It's about the impact.

Life insurance protects families. When someone loses a loved one, that policy pays for the funeral, keeps the lights on, and sends kids to college. You're not just selling - you're serving.

Now, I know what you're thinking: "Is the exam hard? Will I pass?"

Here's the truth: The life insurance exam has about a 50 percent pass rate. But here's what most people don't know: Those who fail usually skip the prep course or cram the night before.

The people who study consistently for 2 weeks? They pass at a 90 percent rate.

And that's what this series is for. Over the next 14 days, I'm going to walk you through everything you need to know.

We'll cover: What's actually on the exam. How to study effectively. The topics that trip people up. Test-taking strategies. And what to do after you pass.

By day 14, you'll be ready to schedule your exam with confidence.

Here's what makes Apex different: We don't just hand you a study guide and say "good luck." We give you daily audio training, practice questions, a study buddy system, and one-on-one coaching.

Your action item today: Check your state's requirements. Every state is slightly different. Go to your state's Department of Insurance website and look up "Life and Health License Requirements."

You'll need to know: The pre-license education hours required. The exam fee. And any background check requirements.

Write those down. Tomorrow, we'll talk about choosing your pre-license course.

See you tomorrow.`,
    actionItem: 'Research your state\'s life insurance license requirements and write down: required hours, exam fee, and background check info',
    keyTakeaways: [
      'Licensed agents earn 2-5x more than unlicensed distributors',
      'Life insurance commissions are 70-90%, not 5-10%',
      '90% pass rate with proper 2-week study plan',
      'This 14-day series prepares you completely'
    ],
    resources: [
      'State Department of Insurance websites',
      'NAIC (National Association of Insurance Commissioners)'
    ]
  },
  {
    day: 2,
    title: "Choosing Your Pre-License Course",
    category: 'intro',
    duration: '2:15',
    script: `Welcome to another Apex Affinity Group Morning Moment!

Yesterday you looked up your state requirements. Today, let's talk about choosing your pre-license course.

Most states require 20 to 40 hours of pre-license education before you can take the exam. You can't skip this - it's state law.

Here's the good news: These courses are available online, and most take 1 to 2 weeks to complete if you study 2 to 3 hours per day.

Now, there are dozens of providers out there. Here's what to look for:

First, state approval. Make sure the course is approved by your state's Department of Insurance. If it's not approved, your hours won't count.

Second, pass guarantee. Good providers offer a "pass guarantee" - if you complete the course and fail the exam, they'll give you free access until you pass.

Third, practice exams. You want unlimited practice tests that mimic the real exam. The more practice questions, the better.

Fourth, mobile friendly. You'll be studying on your phone during lunch breaks, waiting rooms, and before bed. Make sure the platform works on mobile.

The three providers we recommend at Apex:

ExamFX: Most popular, clean interface, great mobile app. About $150 to $200.

Kaplan Financial Education: Premium option, more detailed content, about $250 to $300.

America's Professor: Budget friendly, no frills, about $100 to $150.

All three are state approved, offer pass guarantees, and have thousands of practice questions.

Here's my recommendation: If you're on a budget, go with America's Professor. If you want the best mobile experience, go with ExamFX. If you like detailed explanations, go with Kaplan.

Don't overthink this. All three work. Pick one and start today.

Your action item: Enroll in a pre-license course today. Yes, today. Not tomorrow. Not next week. Today.

The number one reason people don't get licensed is procrastination. They say "I'll do it later" and later never comes.

Go to the website, put in your credit card, and hit enroll. You'll thank yourself in 2 weeks when you're taking the exam.

Tomorrow, we'll talk about creating your study schedule.

See you tomorrow.`,
    actionItem: 'Enroll in a state-approved pre-license course TODAY (ExamFX, Kaplan, or America\'s Professor)',
    keyTakeaways: [
      'Most states require 20-40 hours of pre-license education',
      'Look for: state approval, pass guarantee, practice exams, mobile friendly',
      'Top 3 providers: ExamFX ($150-200), Kaplan ($250-300), America\'s Professor ($100-150)',
      'Procrastination is the #1 reason people don\'t get licensed - enroll today'
    ],
    resources: [
      'ExamFX.com',
      'KaplanFinancial.com',
      'AmericasProfessor.com'
    ]
  },
  {
    day: 3,
    title: "Your 2-Week Study Schedule",
    category: 'study',
    duration: '2:20',
    script: `Welcome to another Apex Affinity Group Morning Moment!

You've enrolled in your course. Now let's create a study schedule that actually works.

Most people fail because they don't have a plan. They study randomly, skip days, and cram the night before. Don't be most people.

Here's the 2-week schedule that gets a 90 percent pass rate:

Week 1: Content mastery.

Days 1 to 3: Watch all video lessons. Take notes. Don't worry about memorizing yet, just understand the concepts.

Days 4 to 5: Read the textbook chapters that correspond to the videos. Highlight key terms.

Days 6 to 7: Take the first practice exam. You'll probably score 60 to 70 percent. That's normal. Review every question you got wrong and write down why.

Week 2: Test preparation.

Days 8 to 10: Take 3 more practice exams. One per day. Aim to score 80 percent or higher on each.

Days 11 to 12: Focus on your weak areas. If you're struggling with underwriting, spend extra time there. If you're confused about policy types, drill those questions.

Day 13: Take a full, timed practice exam under real test conditions. No phone, no breaks, no looking anything up. This is your dress rehearsal.

Day 14: Light review only. Read through your notes, but don't try to learn anything new. Get a good night's sleep.

Day 15: Exam day.

Now, here's the key: Study at the same time every day. Your brain learns better with routine.

I recommend: 6 to 7 AM before work. Or 8 to 9 PM after dinner. Pick one time and stick to it.

How long? 2 to 3 hours per day during week 1. 1 to 2 hours per day during week 2.

"But I don't have 2 hours a day!" Yes, you do. You have 2 hours. You're just using it on Netflix, social media, or YouTube.

This is your income we're talking about. Your family's future. Your financial freedom. Give it 2 weeks of focus.

Your action item today: Block off your study time in your calendar for the next 14 days. Actually put it in your calendar app. Treat it like a doctor's appointment you can't miss.

Tomorrow, we'll dive into the first major topic: Insurance fundamentals and terminology.

See you tomorrow.`,
    actionItem: 'Block off 2-3 hours daily in your calendar for the next 14 days - treat study time as non-negotiable appointments',
    keyTakeaways: [
      'Week 1: Content mastery (videos, reading, first practice exam)',
      'Week 2: Test prep (3+ practice exams, focus on weak areas)',
      'Study same time daily - 6-7 AM or 8-9 PM recommended',
      'You have the time - it\'s about priorities, not availability'
    ]
  },
  {
    day: 4,
    title: "Insurance Fundamentals You Must Know",
    category: 'study',
    duration: '2:25',
    script: `Welcome to another Apex Affinity Group Morning Moment!

Today we're covering insurance fundamentals - the foundation everything else builds on.

These concepts show up in 40 to 50 percent of exam questions, so pay close attention.

Let's start with the four key principles of insurance:

Principle number one: Insurable interest. You can only buy insurance on someone if their death would cause you financial loss. You can insure yourself, your spouse, your business partner. You can't insure your neighbor or a celebrity. The exam loves to test this.

Principle number two: Indemnity. Insurance should restore you to your financial position before the loss, not make you richer. That's why you can't buy 10 life insurance policies and profit from someone's death. Well, technically you can, but we'll get to that nuance later.

Principle number three: Utmost good faith. Both parties must be honest. The insurance company must pay valid claims. The applicant must tell the truth on the application. Lying on an insurance application is called "material misrepresentation" and it voids the policy.

Principle number four: Law of large numbers. Insurance works because the company pools risk across thousands of people. Most won't die this year, so their premiums pay for the few who do.

Now, let's talk about the key parties in an insurance contract:

The insured: The person whose life is covered.

The policyowner: The person who owns the policy and pays premiums. Usually the same as the insured, but not always.

The beneficiary: The person who receives the death benefit. Can be anyone the policyowner chooses.

The insurer: The insurance company that pays the claim.

The agent: That's you. You represent the insurer and help clients apply for coverage.

Here's a question the exam loves: "Can the insured and the policyowner be different people?"

Answer: Yes. Example: A parent can own a policy on their child. The parent pays premiums, the child is insured.

One more critical concept: Contestability period. For the first 2 years of a policy, the insurance company can investigate claims and deny them if they find misrepresentation. After 2 years, the policy is "incontestable" except in cases of fraud.

Your action item today: Write down these four principles and the five parties. Quiz yourself until you can recite them without looking.

Tomorrow, we'll cover the types of life insurance policies.

See you tomorrow.`,
    actionItem: 'Write and memorize: 4 principles (insurable interest, indemnity, utmost good faith, law of large numbers) and 5 parties (insured, owner, beneficiary, insurer, agent)',
    keyTakeaways: [
      'These concepts appear in 40-50% of exam questions',
      '4 key principles: insurable interest, indemnity, utmost good faith, law of large numbers',
      '5 parties: insured, policyowner, beneficiary, insurer, agent',
      'Contestability period: 2 years for investigation, then incontestable (except fraud)'
    ]
  },
  {
    day: 5,
    title: "Types of Life Insurance Policies",
    category: 'study',
    duration: '2:30',
    script: `Welcome to another Apex Affinity Group Morning Moment!

Today we're breaking down the types of life insurance policies. This is 20 to 30 percent of the exam.

There are two main categories: Term and Permanent.

Let's start with term insurance.

Term insurance is simple: You pay premiums for a specific term - 10 years, 20 years, 30 years. If you die during that term, the policy pays. If you don't, the policy expires and you get nothing back.

Think of it like renting. You're renting coverage for a specific period.

The three types of term:

Level term: Premium stays the same for the entire term. This is most common.

Increasing term: Death benefit goes up over time. Rare, but it exists.

Decreasing term: Death benefit goes down over time. Often used for mortgages - as you pay down your loan, your coverage decreases.

Key exam fact: Term insurance is the cheapest type because it's temporary and has no cash value.

Now, permanent insurance.

Permanent insurance lasts your entire life and builds cash value. Think of it like buying a house - you're building equity.

The four types of permanent:

Whole life: Fixed premium, guaranteed death benefit, guaranteed cash value growth. The most conservative option. Your cash value grows slowly but steadily at a guaranteed rate, usually 2 to 4 percent.

Universal life: Flexible premiums, adjustable death benefit, cash value grows based on interest rates. You can pay more or less each month depending on your budget.

Variable life: Fixed premium, but cash value is invested in sub-accounts like mutual funds. Higher potential growth, but also higher risk. You could lose money if the market crashes.

Variable universal life: Combines the flexibility of universal life with the investment options of variable life. The most complex and risky option.

Exam tip: They love to ask "Which policy offers flexible premiums?" Answer: Universal life and variable universal life.

Here's another one: "Which policy has guaranteed cash value growth?" Answer: Whole life.

One more: "Which policy allows the policyowner to invest in the stock market?" Answer: Variable life and variable universal life.

Your action item today: Create a comparison chart. List term, whole life, universal life, variable life, and variable universal life. For each one, write: premium structure, death benefit, cash value, and risk level.

Tomorrow, we'll talk about policy riders and benefits.

See you tomorrow.`,
    actionItem: 'Create a comparison chart of all 5 policy types: term, whole life, universal life, variable life, VUL - include premium, death benefit, cash value, risk',
    keyTakeaways: [
      'Two main categories: Term (temporary) and Permanent (lifetime)',
      'Term types: Level, Increasing, Decreasing - cheapest, no cash value',
      'Permanent types: Whole (guaranteed), Universal (flexible), Variable (invested), VUL (both)',
      'Exam loves: flexible premiums = universal, guaranteed growth = whole, stock market = variable'
    ]
  },
  // Days 6-14 would continue with:
  // Day 6: Policy Riders and Benefits
  // Day 7: Underwriting and Risk Classification
  // Day 8: Premium Calculations and Reserves
  // Day 9: Policy Provisions and Exclusions
  // Day 10: Beneficiary Designations and Settlement Options
  // Day 11: Business Uses of Life Insurance
  // Day 12: Ethics and State Regulations
  // Day 13: Test-Taking Strategies
  // Day 14: Exam Day Preparation
];

export function getLicensingTrainingByDay(day: number): LicensingTraining | null {
  return licensingTrainings.find(t => t.day === day) || null;
}

export function getAllLicensingTrainings(): LicensingTraining[] {
  return licensingTrainings;
}

export function getLicensingTrainingsByCategory(category: string): LicensingTraining[] {
  return licensingTrainings.filter(t => t.category === category);
}
