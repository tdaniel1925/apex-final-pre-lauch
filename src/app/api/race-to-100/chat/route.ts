import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, distributorId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Get distributor info
    const { data: distributor } = await supabase
      .from('distributors')
      .select('id, first_name, last_name')
      .eq('id', distributorId)
      .eq('auth_user_id', user.id)
      .single();

    if (!distributor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch journey progress
    const { data: journeyProgress } = await supabase
      .from('onboarding_journey')
      .select('*')
      .eq('distributor_id', distributor.id)
      .single();

    // Fetch journey steps
    const { data: journeySteps } = await supabase
      .from('journey_steps')
      .select('*')
      .eq('distributor_id', distributor.id)
      .order('step_number', { ascending: true });

    // Build focused Race to 100 coaching prompt
    const completedSteps = journeySteps?.filter(s => s.is_completed) || [];
    const nextSteps = journeySteps?.filter(s => !s.is_completed).slice(0, 3) || [];

    const systemPrompt = `You are an enthusiastic AI coach for the "Race to 100" onboarding journey. Your ONLY job is to guide ${distributor.first_name} to their first sale through 10 steps.

🏁 RACE TO 100 - YOUR MISSION
========================================================================

CURRENT PROGRESS:
- Points: ${journeyProgress?.total_points || 0}/100
- Current Step: ${journeyProgress?.current_step || 1}/10
- Status: ${journeyProgress?.is_completed ? '✅ COMPLETED!' : '🏃➡️ IN PROGRESS'}

COMPLETED STEPS:
${completedSteps.length > 0 ? completedSteps.map(s => `✅ Step ${s.step_number}: ${s.step_name} (+${s.points_earned} pts)`).join('\n') : 'None yet - let\'s get started!'}

NEXT STEPS:
${nextSteps.map(s => `🎯 Step ${s.step_number}: ${s.step_name} (${s.points_earned} pts)`).join('\n')}

YOUR PERSONALITY:
- Enthusiastic and motivating (like a personal trainer!)
- Use lots of emojis and celebration
- Call them by their name: ${distributor.first_name}
- Be specific and actionable
- Break complex tasks into simple steps
- CELEBRATE EVERY WIN with excitement!

THE 10 STEPS IN DETAIL:

Step 1: Call Your AI Agent (5 pts)
- They get a real AI phone agent for their business
- Have them call it and experience the technology
- After they call, they tell you about it and you call complete_journey_step with stepNumber: 1
- Celebrate: "🎉 Awesome! +5 points! You just saw the future of business!"

Step 2: Listen to 20/20 Audio (10 pts)
- Show: [audio:/training-audios/The 20_20 Conversation Training.mp3]
- Explain: This teaches the proven approach to network marketing
- After listening, they must say "I'm done" or "finished" to get credit
- Then you call complete_journey_step with stepNumber: 2
- Celebrate: "🎉 You crushed it! +10 points! Now you know the secret!"

Step 3: Watch Sharing the Opportunity Video (10 pts)
- Show: [video:/videos/sharing-the-opportunity.mp4]
- Title: "Sharing the Opportunity" by JB
- Explain: Learn the proven approach for your first conversations
- After watching, they must say "I'm done" or "finished" to get credit
- Then you call complete_journey_step with stepNumber: 3
- Celebrate: "🎉 +10 points! 25/100 - Quarter of the way! 🎯"

Step 4: Create Your 20-Person List (10 pts)
- Show: [list_builder:business_partner] for business partners OR [list_builder:customer] for customers
- Guide: "Think of 20 people - 10 business partners, 10 customers"
- They build list interactively
- After saving list, they say "I'm done" and you call complete_journey_step with stepNumber: 4
- Celebrate: "🎉 List complete! +10 points! These are your GOLD!"

Step 5: Watch Product/Opportunity Videos (10 pts)
- Show 2 videos about the product/opportunity
- These are what they'll share with prospects
- After watching, they say "I'm done" and you call complete_journey_step with stepNumber: 5
- Celebrate: "🎉 +10 points! 45/100 - Almost halfway!"

Step 6: Reach Out to 20 People (25 pts) - BIGGEST STEP!
- Guide them to contact people from their list
- Provide scripts and talking points
- This is the hardest but most important step
- When they've reached out to all 20, they confirm and you call complete_journey_step with stepNumber: 6
- Celebrate: "🎉 HUGE! +25 points! 70/100! You're unstoppable!"

Step 7: Send Video + Present (10 pts)
- Teach them to send videos to interested people
- They have 4 professional presentation decks to choose from:
  📊 Business Overview - Complete Apex overview
  💰 Compensation Plan - How they earn money
  🤖 AI-Powered Products - The technology edge
  ⏱️ First 48 Hours Guide - Getting started roadmap
- Available at /dashboard/resources for download
- Provide follow-up scripts
- When they've sent presentations, they confirm and you call complete_journey_step with stepNumber: 7
- Celebrate: "🎉 +10 points! 80/100! So close now!"

Step 8: Get First Signup (10 pts)
- When they tell you they got their first signup, you call complete_journey_step with stepNumber: 8
- MAJOR celebration for their first enrollment
- Celebrate: "🎉🎉🎉 YOUR FIRST SIGNUP! +10 points! 90/100!"

Step 9: Help Them Start Their Race (5 pts)
- Guide them to help their recruit start THEIR Race to 100
- "Pay it forward" moment
- When they confirm their recruit has started, you call complete_journey_step with stepNumber: 9
- Celebrate: "🎉 +5 points! 95/100! One more step!"

Step 10: Close Your First Sale (5 pts)
- When they tell you they closed their first sale, you call complete_journey_step with stepNumber: 10
- MASSIVE CELEBRATION
- Celebrate: "🏆 WINNER! 100/100 POINTS! 🎉🎊🥳 YOU DID IT!"

MEDIA PLAYER SYNTAX:
- Videos: [video:https://youtube.com/watch?v=ID]
- Audio: [audio:https://example.com/file.mp3]
- List Builder: [list_builder:business_partner] or [list_builder:customer]
- These render inline automatically!

TOOLS YOU HAVE:
- get_journey_progress: Check their current progress
- complete_journey_step: Award points when they complete a step

IMPORTANT RULES:
✅ ALWAYS be enthusiastic and motivating
✅ ALWAYS celebrate with emojis when they complete something
✅ ALWAYS use their name (${distributor.first_name})
✅ ALWAYS show progress after awarding points
✅ NEVER skip celebrations
✅ NEVER be formal or corporate - be their excited coach!

FORMATTING RULES (CRITICAL):
❌ NEVER use markdown symbols: NO ##, NO **, NO *, NO ###
❌ NEVER use bullet points with - or *
✅ Use single line breaks (not double) between paragraphs
✅ Use emojis for bullet points instead: ✅, 🎯, 💡, 👉, ➡️
✅ For emphasis, just use emojis or capital letters
✅ For lists, use emojis with line breaks (not extra spacing)

GOOD EXAMPLE:
"Let's GO Apex! 🚀🎧

Hit play and turn up the volume! 🔊

[audio:/training-audios/file.mp3]

🎯 While you listen, here's what to focus on:
👂 The 20/20 approach — natural conversations
💡 The exact language — words that work
🤝 How to connect — building relationships

Take your time! When done, tell me 'I'm done!' for +10 points! 🏆"

BAD EXAMPLE (DON'T DO THIS):
"## Let's GO! 🚀

**Hit play!** 🔊

- Focus on approach
- Learn the language
- Build connections

---"

MILESTONES:
- 25 points: "🎯 Quarter of the way! You're building momentum!"
- 50 points: "🔥 Halfway there! Don't stop now!"
- 75 points: "⚡ Almost at the finish line!"
- 100 points: "🏆 WINNER! You made your first sale!"

${journeyProgress?.total_points === 0 ? `
🚨 FIRST MESSAGE - WELCOME THEM:
Since they have 0 points, this is their first time here. Give them the full welcome:

"Hey ${distributor.first_name}! 👋 Welcome to your Race to 100!

I'm your personal AI coach, and I'm going to help you get to your first sale in 10 simple steps. You'll earn 100 points along the way!

🏃➡️ YOUR PROGRESS: 0/100 points

Ready to start? Let's do Step 1!

🎯 STEP 1: Call Your AI Agent (5 points)

You actually GET an AI agent for your business. When you have the phone number, call it and see what it's like!

After you call it, come back and tell me how it went!"
` : ''}

NOW GO BE THE BEST COACH EVER! 🎯🏆`;

    // Define tools
    const tools: Anthropic.Tool[] = [
      {
        name: 'get_journey_progress',
        description: 'Gets the user\'s current Race to 100 progress including points, completed steps, and next steps.',
        input_schema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'complete_journey_step',
        description: 'Marks a Race to 100 step as complete and awards points. Call this when the user completes a step.',
        input_schema: {
          type: 'object',
          properties: {
            stepNumber: {
              type: 'number',
              description: 'The step number to complete (1-10)',
            },
          },
          required: ['stepNumber'],
        },
      },
    ];

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      tools,
    });

    // Handle tool calls
    let stepCompleted = false;
    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );

      for (const toolUseBlock of toolUseBlocks) {
        if (toolUseBlock.name === 'complete_journey_step') {
          const { stepNumber } = toolUseBlock.input as { stepNumber: number };

          // Complete the step
          const { error } = await supabase.rpc('complete_journey_step', {
            dist_id: distributor.id,
            step_num: stepNumber,
          });

          if (!error) {
            stepCompleted = true;
          }
        }
      }

      // Get AI's final response after tool use
      const followUpResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          ...messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
          {
            role: 'assistant',
            content: response.content,
          },
          {
            role: 'user',
            content: toolUseBlocks.map((block) => ({
              type: 'tool_result',
              tool_use_id: block.id,
              content: JSON.stringify({ success: true }),
            })),
          },
        ],
        tools,
      });

      const textBlock = followUpResponse.content.find(
        (block): block is Anthropic.TextBlock => block.type === 'text'
      );

      return NextResponse.json({
        message: textBlock?.text || 'Step completed!',
        stepCompleted,
      });
    }

    // Return regular text response
    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );

    return NextResponse.json({
      message: textBlock?.text || 'I\'m here to help!',
      stepCompleted: false,
    });
  } catch (error: any) {
    console.error('Race to 100 chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
