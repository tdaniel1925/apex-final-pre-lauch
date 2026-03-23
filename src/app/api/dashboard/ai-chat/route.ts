/**
 * AI Chat API Route
 * Handles conversational AI assistant for dashboard tasks
 * Uses Anthropic Claude 3.5 Sonnet with function calling
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Define available tools
const tools: Anthropic.Tool[] = [
  {
    name: 'create_meeting_registration',
    description: 'Creates a registration page for a meeting or event. Use this when the user wants to set up a registration page, create an event, or set up a meeting registration.',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title/name of the meeting or event',
        },
        description: {
          type: 'string',
          description: 'Brief description of what the meeting is about',
        },
        eventDate: {
          type: 'string',
          description: 'Date of the event in YYYY-MM-DD format',
        },
        eventTime: {
          type: 'string',
          description: 'Time of the event in HH:MM format (24-hour)',
        },
        eventTimezone: {
          type: 'string',
          description: 'Timezone (default: America/Chicago)',
          default: 'America/Chicago',
        },
        durationMinutes: {
          type: 'number',
          description: 'Duration of the event in minutes (default: 60)',
          default: 60,
        },
        locationType: {
          type: 'string',
          enum: ['virtual', 'physical'],
          description: 'Whether the event is virtual or in-person',
        },
        virtualLink: {
          type: 'string',
          description: 'Zoom/Teams link if virtual meeting',
        },
        maxAttendees: {
          type: 'number',
          description: 'Maximum number of attendees (optional)',
        },
      },
      required: ['title', 'eventDate', 'eventTime', 'locationType'],
    },
  },
  {
    name: 'view_team_stats',
    description: 'Shows team statistics including total team members, active members, and enrollment levels. Use this when user asks about their team, downline, or organization.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'check_commission_balance',
    description: 'Checks the current commission balance and recent earnings. Use this when user asks about commissions, earnings, or payouts.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
];

// Tool handlers
async function handleCreateMeetingRegistration(params: any, userId: string) {
  const supabase = await createClient();

  // Get user's distributor info
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, slug, first_name, last_name')
    .eq('auth_user_id', userId)
    .single();

  if (!distributor) {
    return {
      success: false,
      message: 'Could not find your distributor profile.',
    };
  }

  // Generate slug from title
  const slug = params.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Create meeting in database
  const { data: meeting, error } = await supabase
    .from('company_events')
    .insert({
      distributor_id: distributor.id,
      title: params.title,
      description: params.description || null,
      event_date: params.eventDate,
      event_time: params.eventTime,
      event_timezone: params.eventTimezone || 'America/Chicago',
      duration_minutes: params.durationMinutes || 60,
      location_type: params.locationType,
      virtual_link: params.virtualLink || null,
      max_attendees: params.maxAttendees || null,
      registration_slug: slug,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      message: `Failed to create meeting: ${error.message}`,
    };
  }

  const registrationUrl = `https://reachtheapex.net/${distributor.slug}/register/${slug}`;

  return {
    success: true,
    message: `✅ Registration page created successfully!\n\n📍 Your page: ${registrationUrl}\n📅 ${params.title}\n🗓️ ${params.eventDate} at ${params.eventTime}\n\nWould you like to:\n• Preview the page\n• Send invitations\n• Create a flyer`,
    data: {
      meeting,
      url: registrationUrl,
    },
  };
}

async function handleViewTeamStats(userId: string) {
  const supabase = await createClient();

  // Get user's distributor info
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id')
    .eq('auth_user_id', userId)
    .single();

  if (!distributor) {
    return {
      success: false,
      message: 'Could not find your distributor profile.',
    };
  }

  // Get team count
  const { count: teamCount } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true })
    .eq('sponsor_id', distributor.id)
    .neq('status', 'deleted');

  // Get active team count
  const { count: activeCount } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true })
    .eq('sponsor_id', distributor.id)
    .eq('status', 'active');

  return {
    success: true,
    message: `📊 Your Team Stats:\n\n👥 Total Team Members: ${teamCount || 0}\n✅ Active Members: ${activeCount || 0}\n\nWant to see more details? I can show you:\n• Team genealogy tree\n• Commission breakdown\n• Individual team member stats`,
  };
}

async function handleCheckCommissionBalance(userId: string) {
  const supabase = await createClient();

  // Get user's distributor info
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id')
    .eq('auth_user_id', userId)
    .single();

  if (!distributor) {
    return {
      success: false,
      message: 'Could not find your distributor profile.',
    };
  }

  // Get member record with current balance
  const { data: member } = await supabase
    .from('members')
    .select('commission_balance')
    .eq('distributor_id', distributor.id)
    .single();

  const balance = member?.commission_balance || 0;

  return {
    success: true,
    message: `💰 Commission Balance: $${balance.toFixed(2)}\n\nNeed more details? I can show you:\n• Recent earnings\n• Payout history\n• Commission breakdown by product`,
  };
}

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

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Call Anthropic API with tools
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      tools: tools,
      messages: messages,
    });

    // Check if AI wants to use a tool
    const toolUseBlock = response.content.find((block) => block.type === 'tool_use');

    if (toolUseBlock && toolUseBlock.type === 'tool_use') {
      // Execute the tool
      let toolResult: { success: boolean; message: string; data?: any };

      switch (toolUseBlock.name) {
        case 'create_meeting_registration':
          toolResult = await handleCreateMeetingRegistration(toolUseBlock.input, user.id);
          break;
        case 'view_team_stats':
          toolResult = await handleViewTeamStats(user.id);
          break;
        case 'check_commission_balance':
          toolResult = await handleCheckCommissionBalance(user.id);
          break;
        default:
          toolResult = { success: false, message: 'Unknown tool' };
      }

      // Return the tool result to user
      return NextResponse.json({
        message: toolResult.message,
        data: toolResult.data,
      });
    }

    // If no tool use, return the text response
    const textBlock = response.content.find((block) => block.type === 'text');
    const message = textBlock && textBlock.type === 'text' ? textBlock.text : 'I can help you with that!';

    return NextResponse.json({ message });
  } catch (error) {
    console.error('[AI Chat API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
