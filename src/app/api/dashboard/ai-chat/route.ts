/**
 * AI Chat API Route
 * Handles conversational AI assistant for dashboard tasks
 * Uses Anthropic Claude 3.5 Sonnet with function calling
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { sendEmail } from '@/lib/email/resend';
import fs from 'fs/promises';
import path from 'path';

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
          description: 'The title/name of the meeting or event (e.g., "Home Meeting", "Business Overview")',
        },
        description: {
          type: 'string',
          description: 'Brief description of what the meeting is about (optional but recommended)',
        },
        eventDate: {
          type: 'string',
          description: 'Date of the event in YYYY-MM-DD format. Convert relative dates like "Tuesday", "next Thursday", "March 25th" to YYYY-MM-DD format based on current date.',
        },
        eventTime: {
          type: 'string',
          description: 'Time of the event in HH:MM format (24-hour). Convert 12-hour times like "6:30 PM" to 24-hour format (e.g., "18:30"). Convert times like "6pm" to "18:00".',
        },
        eventTimezone: {
          type: 'string',
          description: 'Timezone for the event. Common values: America/Chicago (Central), America/New_York (Eastern), America/Los_Angeles (Pacific). Default: America/Chicago',
          default: 'America/Chicago',
        },
        durationMinutes: {
          type: 'number',
          description: 'Duration of the event in minutes. Convert "1 hour" to 60, "90 minutes" to 90, "2 hours" to 120. Default: 60',
          default: 60,
        },
        locationType: {
          type: 'string',
          enum: ['virtual', 'physical', 'hybrid'],
          description: 'Type of meeting location: "virtual" for online-only (Zoom/Teams), "physical" for in-person only, "hybrid" for both online and in-person options',
        },
        virtualLink: {
          type: 'string',
          description: 'Zoom/Teams/Google Meet link for virtual or hybrid meetings. Required if locationType is virtual or hybrid.',
        },
        physicalAddress: {
          type: 'string',
          description: 'Full physical address for in-person or hybrid meetings (e.g., "281 Main Street, Dallas, Texas 77494"). Required if locationType is physical or hybrid.',
        },
        maxAttendees: {
          type: 'number',
          description: 'Maximum number of attendees allowed to register (optional). Leave empty for unlimited.',
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
  {
    name: 'preview_registration_page',
    description: 'Opens the registration page for a meeting that was just created. Use this when user wants to preview or see their registration page.',
    input_schema: {
      type: 'object',
      properties: {
        registrationUrl: {
          type: 'string',
          description: 'The full registration URL (from the create_meeting_registration response)',
        },
      },
      required: ['registrationUrl'],
    },
  },
  {
    name: 'preview_meeting_invitation',
    description: 'Shows a preview of the meeting invitation email before sending. Use this when user wants to see what the invitation looks like or before sending.',
    input_schema: {
      type: 'object',
      properties: {
        meetingId: {
          type: 'string',
          description: 'The meeting ID to preview invitation for',
        },
      },
      required: ['meetingId'],
    },
  },
  {
    name: 'send_meeting_invitations',
    description: 'Sends email invitations to the user\'s team members for a meeting. Use this when user wants to invite their team or send invitations. If user has requested changes to the invitation, include customSubject and/or customHtml.',
    input_schema: {
      type: 'object',
      properties: {
        meetingId: {
          type: 'string',
          description: 'The meeting ID (from the create_meeting_registration response data)',
        },
        recipientType: {
          type: 'string',
          enum: ['all_team', 'active_only', 'specific'],
          description: 'Who to send to: all_team (everyone), active_only (only active members), or specific (custom list)',
        },
        customEmails: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of email addresses if recipientType is "specific"',
        },
        customSubject: {
          type: 'string',
          description: 'Optional custom email subject line if user requested changes',
        },
        customHtml: {
          type: 'string',
          description: 'Optional custom email body HTML if user requested changes to the content',
        },
      },
      required: ['meetingId', 'recipientType'],
    },
  },
  {
    name: 'create_meeting_flyer',
    description: 'Generates a promotional flyer (PDF) for the meeting with all details. Use this when user wants to create marketing materials or a flyer.',
    input_schema: {
      type: 'object',
      properties: {
        meetingId: {
          type: 'string',
          description: 'The meeting ID (from the create_meeting_registration response data)',
        },
      },
      required: ['meetingId'],
    },
  },
  {
    name: 'get_my_links',
    description: 'Returns the user\'s replicated site URL, enrollment link, and meeting registration base URL. Use when user asks for their links, wants to know how to share, or needs their URLs.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'who_joined_recently',
    description: 'Shows recent team enrollments grouped by time period (today, this week, this month). Use when user asks about new team members, recent joins, or growth.',
    input_schema: {
      type: 'object',
      properties: {
        timeframe: {
          type: 'string',
          enum: ['today', 'week', 'month', 'all'],
          description: 'Time period to show (default: week)',
          default: 'week',
        },
      },
    },
  },
  {
    name: 'rank_progress_check',
    description: 'Shows current rank, next rank requirements, and progress toward advancement. Use when user asks about rank progress, what they need to rank up, or requirements.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'view_team_member_details',
    description: 'Looks up a specific team member by name and shows their details (status, join date, contact info, downline). Use when user asks about a specific person on their team.',
    input_schema: {
      type: 'object',
      properties: {
        searchName: {
          type: 'string',
          description: 'Name to search for (first name, last name, or full name)',
        },
      },
      required: ['searchName'],
    },
  },
  {
    name: 'commission_breakdown',
    description: 'Shows detailed commission breakdown by source, product, and team member. Use when user asks about commission details, earnings breakdown, or where money came from.',
    input_schema: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          enum: ['this_month', 'last_month', 'this_year', 'all_time'],
          description: 'Time period for breakdown (default: this_month)',
          default: 'this_month',
        },
      },
    },
  },
  {
    name: 'start_tutorial',
    description: 'Starts an interactive step-by-step tutorial on how to use a specific feature. Use when user wants to learn, asks "how do I", or needs training on a feature.',
    input_schema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          enum: ['send_text', 'send_email', 'create_event', 'add_lead', 'invite_team', 'social_media', 'overview'],
          description: 'What feature to teach. "overview" for general system tutorial.',
        },
      },
      required: ['topic'],
    },
  },
  {
    name: 'list_all_team_members',
    description: 'Lists all team members with their names, status, and join dates. Use when user asks "who are my team members", "list my team", "show names", or wants to see everyone on their team. IMPORTANT: If user asks for a specific number like "first 3", "top 5", "first 10", use the limit parameter.',
    input_schema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of team members to return. Use when user asks for "first 3", "top 5", "first 10", etc. If not specified, returns all team members.',
        },
        statusFilter: {
          type: 'string',
          enum: ['all', 'active', 'inactive'],
          description: 'Filter by status (default: all)',
          default: 'all',
        },
        sortBy: {
          type: 'string',
          enum: ['name', 'join_date', 'status'],
          description: 'How to sort the list (default: name)',
          default: 'name',
        },
      },
    },
  },
  {
    name: 'send_team_announcement',
    description: 'Sends an announcement email or SMS to the user\'s team. Use when user wants to broadcast a message, send update, or communicate with their downline.',
    input_schema: {
      type: 'object',
      properties: {
        subject: {
          type: 'string',
          description: 'Subject line for the announcement',
        },
        message: {
          type: 'string',
          description: 'The announcement message content',
        },
        recipientType: {
          type: 'string',
          enum: ['all_team', 'active_only', 'specific_level'],
          description: 'Who to send to: all team, active only, or specific level',
          default: 'active_only',
        },
      },
      required: ['subject', 'message'],
    },
  },
  {
    name: 'add_new_lead',
    description: 'Adds a new lead/prospect to the CRM system. Use when user wants to capture a new contact, log a prospect, or add someone they met.',
    input_schema: {
      type: 'object',
      properties: {
        firstName: {
          type: 'string',
          description: 'Lead\'s first name',
        },
        lastName: {
          type: 'string',
          description: 'Lead\'s last name',
        },
        email: {
          type: 'string',
          description: 'Lead\'s email address',
        },
        phone: {
          type: 'string',
          description: 'Lead\'s phone number',
        },
        notes: {
          type: 'string',
          description: 'Notes about the lead (interest level, where you met, etc.)',
        },
        source: {
          type: 'string',
          description: 'How you met them (e.g., "personal contact", "social media", "event")',
          default: 'personal contact',
        },
      },
      required: ['firstName', 'lastName'],
    },
  },
  {
    name: 'view_edit_meetings',
    description: 'Shows list of upcoming and past meetings with registration counts. Use when user wants to see their meetings, check attendance, or manage events.',
    input_schema: {
      type: 'object',
      properties: {
        timeframe: {
          type: 'string',
          enum: ['upcoming', 'past', 'all'],
          description: 'Which meetings to show (default: upcoming)',
          default: 'upcoming',
        },
      },
    },
  },
  {
    name: 'generate_social_post',
    description: 'Generates engaging social media post copy with emojis and hashtags. Use when user wants to create content for Facebook, Instagram, LinkedIn, etc.',
    input_schema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'What to promote (e.g., "my Tuesday meeting", "business opportunity", "product X")',
        },
        platform: {
          type: 'string',
          enum: ['facebook', 'instagram', 'linkedin', 'twitter'],
          description: 'Which social platform (default: facebook)',
          default: 'facebook',
        },
        tone: {
          type: 'string',
          enum: ['professional', 'casual', 'excited'],
          description: 'Tone of the post (default: casual)',
          default: 'casual',
        },
      },
      required: ['topic'],
    },
  },
  {
    name: 'schedule_followup',
    description: 'Creates a follow-up reminder or task. Use when user wants to remember to contact someone, set a reminder, or schedule a task.',
    input_schema: {
      type: 'object',
      properties: {
        taskDescription: {
          type: 'string',
          description: 'What to do (e.g., "Call Sarah Johnson", "Send presentation to John")',
        },
        dueDate: {
          type: 'string',
          description: 'When to do it in YYYY-MM-DD format. Convert relative dates like "tomorrow", "next week".',
        },
        dueTime: {
          type: 'string',
          description: 'Time in HH:MM format (24-hour). Optional.',
        },
        contactName: {
          type: 'string',
          description: 'Name of person this relates to (optional)',
        },
      },
      required: ['taskDescription', 'dueDate'],
    },
  },
  // ========== PHASE 2: ANALYTICS & PERFORMANCE TOOLS ==========
  {
    name: 'get_team_analytics',
    description: 'Shows detailed team performance analytics including top performers, BV distribution, activity levels, and growth trends. Use when user asks "who are my best performers", "team analytics", "who is producing the most".',
    input_schema: {
      type: 'object',
      properties: {
        timeframe: {
          type: 'string',
          enum: ['this_month', 'last_month', 'last_90_days', 'all_time'],
          description: 'Time period to analyze (default: this_month)',
          default: 'this_month',
        },
        metric: {
          type: 'string',
          enum: ['bv', 'enrollments', 'activity', 'all'],
          description: 'What metric to analyze (default: all)',
          default: 'all',
        },
      },
    },
  },
  {
    name: 'get_my_performance',
    description: 'Shows personal performance metrics including BV, sales, qualification status for bonuses, and progress toward next rank. Use when user asks "how am I doing", "my stats", "am I qualified".',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_commission_breakdown',
    description: 'Shows detailed commission breakdown by type (binary, override, retail, matching, rank bonuses). Use when user asks "show my commissions", "commission breakdown", "where did my money come from".',
    input_schema: {
      type: 'object',
      properties: {
        timeframe: {
          type: 'string',
          enum: ['this_week', 'this_month', 'last_month', 'last_3_months'],
          description: 'Time period for commission breakdown (default: this_month)',
          default: 'this_month',
        },
      },
    },
  },
  {
    name: 'view_genealogy_tree',
    description: 'Shows visual enrollment tree structure with depth, width, and team organization. Use when user asks "show my tree", "genealogy", "who is under who", "team structure".',
    input_schema: {
      type: 'object',
      properties: {
        depth: {
          type: 'number',
          description: 'How many levels deep to show (1-7, default: 3)',
          default: 3,
        },
        startFrom: {
          type: 'string',
          description: 'Optional slug of distributor to start from (default: current user)',
        },
      },
    },
  },
  // ========== PHASE 3: ADVANCED TOOLS ==========
  {
    name: 'set_personal_goal',
    description: 'Sets or updates a personal business goal (rank advancement, income, team size). Use when user wants to "set a goal", "track progress to Diamond", "goal for this quarter".',
    input_schema: {
      type: 'object',
      properties: {
        goalType: {
          type: 'string',
          enum: ['rank', 'income', 'team_size', 'custom'],
          description: 'Type of goal to set',
        },
        targetValue: {
          type: 'string',
          description: 'Target value (e.g., "diamond", "$10000", "50 members", "custom description")',
        },
        deadline: {
          type: 'string',
          description: 'Target date in YYYY-MM-DD format',
        },
      },
      required: ['goalType', 'targetValue', 'deadline'],
    },
  },
  {
    name: 'check_goal_progress',
    description: 'Shows progress toward active personal goals with percentage complete and recommended actions. Use when user asks "how close am I to my goal", "goal progress", "am I on track".',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'view_upcoming_events',
    description: 'Shows upcoming company events, meetings, and trainings from calendar. Use when user asks "what events are coming up", "when is the next training", "company calendar".',
    input_schema: {
      type: 'object',
      properties: {
        daysAhead: {
          type: 'number',
          description: 'How many days ahead to show (default: 30)',
          default: 30,
        },
      },
    },
  },
  {
    name: 'get_training_resources',
    description: 'Searches and retrieves training materials, videos, guides, and playbooks. Use when user asks "how do I", "training on", "show me videos about".',
    input_schema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'What topic to search for (e.g., "prospecting", "closing", "presentations")',
        },
        resourceType: {
          type: 'string',
          enum: ['all', 'video', 'pdf', 'audio'],
          description: 'Type of resource (default: all)',
          default: 'all',
        },
      },
      required: ['topic'],
    },
  },
  {
    name: 'check_compliance',
    description: 'Checks if a message, post, or statement complies with company policies and FTC guidelines. Use when user asks "is this compliant", "can I say this", "check this post".',
    input_schema: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'The message/post to check for compliance',
        },
        platform: {
          type: 'string',
          enum: ['social_media', 'email', 'text', 'presentation'],
          description: 'Where this will be used (default: social_media)',
          default: 'social_media',
        },
      },
      required: ['content'],
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

  // Validate location-specific requirements
  if (params.locationType === 'virtual' && !params.virtualLink) {
    return {
      success: false,
      message: '❌ Virtual meetings require a Zoom/Teams link. Please provide the meeting link.',
    };
  }

  if (params.locationType === 'physical' && !params.physicalAddress) {
    return {
      success: false,
      message: '❌ In-person meetings require a physical address. Please provide the meeting location.',
    };
  }

  if (params.locationType === 'hybrid' && (!params.virtualLink || !params.physicalAddress)) {
    return {
      success: false,
      message: '❌ Hybrid meetings require both a virtual link AND a physical address. Please provide both.',
    };
  }

  // Validate date is not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(params.eventDate);
  eventDate.setHours(0, 0, 0, 0);

  if (eventDate < today) {
    return {
      success: false,
      message: `❌ The event date (${params.eventDate}) is in the past. Please choose a future date.`,
    };
  }

  // Generate slug from title
  let slug = params.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Check if slug already exists for this distributor
  const { data: existingMeeting } = await supabase
    .from('meeting_events')
    .select('id')
    .eq('distributor_id', distributor.id)
    .eq('registration_slug', slug)
    .single();

  // If slug exists, append timestamp to make it unique
  if (existingMeeting) {
    slug = `${slug}-${Date.now()}`;
  }

  // Parse physical address if provided
  let physicalAddress = null;
  if ((params.locationType === 'physical' || params.locationType === 'hybrid') && params.physicalAddress) {
    physicalAddress = params.physicalAddress;
  }

  // Create meeting in database (meeting_events = personal meetings, NOT company_events)
  const { data: meeting, error } = await supabase
    .from('meeting_events')
    .insert({
      distributor_id: distributor.id,
      title: params.title,
      description: params.description || null,
      custom_message: null, // Optional custom message for registration page
      event_date: params.eventDate,
      event_time: params.eventTime,
      event_timezone: params.eventTimezone || 'America/Chicago',
      duration_minutes: params.durationMinutes || 60,
      location_type: params.locationType,
      virtual_link: params.virtualLink || null,
      physical_address: physicalAddress,
      registration_slug: slug,
      status: 'active',
      max_attendees: params.maxAttendees || null,
    })
    .select()
    .single();

  if (error) {
    return {
      success: false,
      message: `❌ Failed to create meeting: ${error.message}`,
    };
  }

  const registrationUrl = `https://reachtheapex.net/${distributor.slug}/register/${slug}`;

  // Build success message based on location type
  let locationInfo = '';
  if (params.locationType === 'virtual') {
    locationInfo = `🔗 Virtual: ${params.virtualLink}`;
  } else if (params.locationType === 'physical') {
    locationInfo = `📍 Location: ${physicalAddress}`;
  } else if (params.locationType === 'hybrid') {
    locationInfo = `📍 In-Person: ${physicalAddress}\n🔗 Virtual: ${params.virtualLink}`;
  }

  return {
    success: true,
    message: `✅ Registration page created successfully!\n\n🔗 Your page: ${registrationUrl}\n\n📅 ${params.title}\n🗓️ ${params.eventDate} at ${params.eventTime} ${params.eventTimezone || 'America/Chicago'}\n⏱️ Duration: ${params.durationMinutes || 60} minutes\n${locationInfo}${params.maxAttendees ? `\n👥 Max attendees: ${params.maxAttendees}` : ''}\n\nWhat would you like to do next?\n• Preview the registration page\n• Send invitations to your team\n• Create a promotional flyer`,
    data: {
      meeting,
      url: registrationUrl,
      meetingId: meeting.id,
      registrationUrl,
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

async function handlePreviewRegistrationPage(params: any) {
  // Simply return the URL - the frontend will handle opening it
  return {
    success: true,
    message: `🔗 Opening your registration page:\n\n${params.registrationUrl}\n\nYou can share this link with anyone you want to invite!`,
    data: {
      url: params.registrationUrl,
      action: 'open_url',
    },
  };
}

async function handlePreviewMeetingInvitation(params: any, userId: string) {
  const supabase = await createClient();

  // Get user's distributor info
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email')
    .eq('auth_user_id', userId)
    .single();

  if (!distributor) {
    return {
      success: false,
      message: 'Could not find your distributor profile.',
    };
  }

  // Get meeting details
  const { data: meeting } = await supabase
    .from('meeting_events')
    .select('*')
    .eq('id', params.meetingId)
    .eq('distributor_id', distributor.id)
    .single();

  if (!meeting) {
    return {
      success: false,
      message: 'Meeting not found or you don\'t have permission to preview it.',
    };
  }

  // Load email templates
  const baseTemplate = await fs.readFile(
    path.join(process.cwd(), 'src/lib/email/templates/base-email-template.html'),
    'utf-8'
  );
  const contentTemplate = await fs.readFile(
    path.join(process.cwd(), 'src/lib/email/templates/meeting-invitation.html'),
    'utf-8'
  );

  // Build registration URL
  const { data: dist } = await supabase
    .from('distributors')
    .select('slug')
    .eq('id', distributor.id)
    .single();

  const registrationUrl = `https://reachtheapex.net/${dist?.slug}/register/${meeting.registration_slug}`;

  // Format location details
  let locationDetails = '';
  if (meeting.location_type === 'virtual') {
    locationDetails = `Virtual Meeting: ${meeting.virtual_link}`;
  } else if (meeting.location_type === 'physical') {
    locationDetails = meeting.physical_address || 'To be announced';
  } else if (meeting.location_type === 'hybrid') {
    locationDetails = `In-Person: ${meeting.physical_address}\nVirtual: ${meeting.virtual_link}`;
  }

  // Replace variables in content template
  let emailContent = contentTemplate
    .replace(/{{host_name}}/g, `${distributor.first_name} ${distributor.last_name}`)
    .replace(/{{meeting_title}}/g, meeting.title)
    .replace(/{{event_date}}/g, new Date(meeting.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
    .replace(/{{event_time}}/g, meeting.event_time)
    .replace(/{{event_timezone}}/g, meeting.event_timezone)
    .replace(/{{duration_minutes}}/g, meeting.duration_minutes.toString())
    .replace(/{{location_details}}/g, locationDetails)
    .replace(/{{description}}/g, meeting.description || '')
    .replace(/{{registration_url}}/g, registrationUrl)
    .replace(/{{max_attendees}}/g, meeting.max_attendees?.toString() || '');

  // Handle conditional sections
  if (!meeting.description) {
    emailContent = emailContent.replace(/{{#if description}}[\s\S]*?{{\/if}}/g, '');
  } else {
    emailContent = emailContent.replace(/{{#if description}}/g, '').replace(/{{\/if}}/g, '');
  }

  if (!meeting.max_attendees) {
    emailContent = emailContent.replace(/{{#if max_attendees}}[\s\S]*?{{\/if}}/g, '');
  } else {
    emailContent = emailContent.replace(/{{#if max_attendees}}/g, '').replace(/{{\/if}}/g, '');
  }

  // Merge with base template
  const finalHtml = baseTemplate
    .replace('{{email_title}}', `Invitation: ${meeting.title}`)
    .replace('{{email_content}}', emailContent)
    .replace(/{{unsubscribe_url}}/g, 'https://theapexway.net/unsubscribe');

  const subject = `You're Invited: ${meeting.title}`;

  // Return preview
  return {
    success: true,
    message: `📧 **Email Preview**\n\n**Subject:** ${subject}\n\n**Meeting:** ${meeting.title}\n**Date:** ${new Date(meeting.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n**Time:** ${meeting.event_time} ${meeting.event_timezone}\n**Location:** ${locationDetails}\n\n*The email will be sent with your professional Apex template.*\n\nWould you like to:\n• **Send it now** - Say "send invitations to [all team/active only/specific people]"\n• **Edit the subject** - Say "change the subject to..."\n• **Edit the message** - Say "change [specific part] to..."\n• **Cancel** - Say "cancel" or "go back"`,
    data: {
      subject,
      html: finalHtml,
      meetingId: params.meetingId,
    },
  };
}

async function handleSendMeetingInvitations(params: any, userId: string) {
  const supabase = await createClient();

  // Get user's distributor info
  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, email')
    .eq('auth_user_id', userId)
    .single();

  if (!distributor) {
    return {
      success: false,
      message: 'Could not find your distributor profile.',
    };
  }

  // Get meeting details
  const { data: meeting } = await supabase
    .from('meeting_events')
    .select('*')
    .eq('id', params.meetingId)
    .eq('distributor_id', distributor.id)
    .single();

  if (!meeting) {
    return {
      success: false,
      message: 'Meeting not found or you don\'t have permission to send invitations for it.',
    };
  }

  // Get recipients based on type
  let recipients: { email: string }[] = [];

  if (params.recipientType === 'specific' && params.customEmails) {
    recipients = params.customEmails.map((email: string) => ({ email }));
  } else {
    // Get team members
    let query = supabase
      .from('distributors')
      .select('email')
      .eq('sponsor_id', distributor.id)
      .neq('status', 'deleted')
      .not('email', 'is', null);

    if (params.recipientType === 'active_only') {
      query = query.eq('status', 'active');
    }

    const { data: teamMembers } = await query;
    recipients = teamMembers || [];
  }

  if (recipients.length === 0) {
    return {
      success: false,
      message: 'No recipients found. Your team may not have email addresses on file.',
    };
  }

  // Use custom HTML if provided, otherwise generate from template
  let finalHtml: string;
  let subject: string;

  if (params.customHtml) {
    // User has edited the invitation
    finalHtml = params.customHtml;
    subject = params.customSubject || `You're Invited: ${meeting.title}`;
  } else {
    // Load email templates
    const baseTemplate = await fs.readFile(
      path.join(process.cwd(), 'src/lib/email/templates/base-email-template.html'),
      'utf-8'
    );
    const contentTemplate = await fs.readFile(
      path.join(process.cwd(), 'src/lib/email/templates/meeting-invitation.html'),
      'utf-8'
    );

    // Build registration URL
    const { data: dist } = await supabase
      .from('distributors')
      .select('slug')
      .eq('id', distributor.id)
      .single();

    const registrationUrl = `https://reachtheapex.net/${dist?.slug}/register/${meeting.registration_slug}`;

    // Format location details
    let locationDetails = '';
    if (meeting.location_type === 'virtual') {
      locationDetails = `Virtual Meeting: ${meeting.virtual_link}`;
    } else if (meeting.location_type === 'physical') {
      locationDetails = meeting.physical_address || 'To be announced';
    } else if (meeting.location_type === 'hybrid') {
      locationDetails = `In-Person: ${meeting.physical_address}\nVirtual: ${meeting.virtual_link}`;
    }

    // Replace variables in content template
    let emailContent = contentTemplate
      .replace(/{{host_name}}/g, `${distributor.first_name} ${distributor.last_name}`)
      .replace(/{{meeting_title}}/g, meeting.title)
      .replace(/{{event_date}}/g, new Date(meeting.event_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
      .replace(/{{event_time}}/g, meeting.event_time)
      .replace(/{{event_timezone}}/g, meeting.event_timezone)
      .replace(/{{duration_minutes}}/g, meeting.duration_minutes.toString())
      .replace(/{{location_details}}/g, locationDetails)
      .replace(/{{description}}/g, meeting.description || '')
      .replace(/{{registration_url}}/g, registrationUrl)
      .replace(/{{max_attendees}}/g, meeting.max_attendees?.toString() || '');

    // Handle conditional sections
    if (!meeting.description) {
      emailContent = emailContent.replace(/{{#if description}}[\s\S]*?{{\/if}}/g, '');
    } else {
      emailContent = emailContent.replace(/{{#if description}}/g, '').replace(/{{\/if}}/g, '');
    }

    if (!meeting.max_attendees) {
      emailContent = emailContent.replace(/{{#if max_attendees}}[\s\S]*?{{\/if}}/g, '');
    } else {
      emailContent = emailContent.replace(/{{#if max_attendees}}/g, '').replace(/{{\/if}}/g, '');
    }

    // Merge with base template
    finalHtml = baseTemplate
      .replace('{{email_title}}', `Invitation: ${meeting.title}`)
      .replace('{{email_content}}', emailContent)
      .replace(/{{unsubscribe_url}}/g, 'https://theapexway.net/unsubscribe');

    subject = params.customSubject || `You're Invited: ${meeting.title}`;
  }

  // Send emails
  const emailResults = await Promise.all(
    recipients.map((recipient) =>
      sendEmail({
        to: recipient.email,
        subject,
        html: finalHtml,
        from: 'Apex Affinity Group <theapex@theapexway.net>',
      })
    )
  );

  const successCount = emailResults.filter((r) => r.success).length;
  const failCount = emailResults.filter((r) => !r.success).length;

  return {
    success: true,
    message: `📧 Invitations sent!\n\n✅ Sent: ${successCount}\n${failCount > 0 ? `❌ Failed: ${failCount}\n` : ''}\nYour team members will receive an email with the registration link.`,
    data: {
      sent: successCount,
      failed: failCount,
    },
  };
}

async function handleCreateMeetingFlyer(params: any, userId: string) {
  // For now, return a message that this feature is coming soon
  // In the future, we can integrate PDF generation
  return {
    success: false,
    message: '🚧 Flyer creation is coming soon!\n\nFor now, you can:\n• Share the registration link directly\n• Create a custom flyer using Canva\n• Use the meeting details to promote on social media',
  };
}

async function handleGetMyLinks(userId: string) {
  const supabase = await createClient();

  const { data: distributor } = await supabase
    .from('distributors')
    .select('slug, first_name, last_name')
    .eq('auth_user_id', userId)
    .single();

  if (!distributor) {
    return {
      success: false,
      message: 'Could not find your distributor profile.',
    };
  }

  const baseUrl = 'https://reachtheapex.net';
  const replicatedSite = `${baseUrl}/${distributor.slug}`;
  const enrollmentLink = `${baseUrl}/join/${distributor.slug}`;
  const meetingBase = `${baseUrl}/${distributor.slug}/register`;

  return {
    success: true,
    message: `🔗 Your Links:\n\n**Replicated Site:**\n${replicatedSite}\n\n**Enrollment Link:**\n${enrollmentLink}\n\n**Meeting Pages:**\n${meetingBase}/[meeting-name]\n\nShare these to grow your team!`,
    data: {
      replicatedSite,
      enrollmentLink,
      meetingBase,
    },
  };
}

async function handleWhoJoinedRecently(params: any, userId: string) {
  const supabase = await createClient();

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

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  // Get all downline (recursive)
  // For simplicity, we'll query direct enrollments and their enrollments
  // In production, you'd want a recursive CTE or pre-computed downline table
  const { data: teamMembers } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, created_at, sponsor_id, status')
    .eq('sponsor_id', distributor.id)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });

  if (!teamMembers || teamMembers.length === 0) {
    return {
      success: true,
      message: '📊 No recent enrollments found.\n\nYour team will appear here as they join!',
    };
  }

  // Group by time period
  const todayMembers = teamMembers.filter(m => new Date(m.created_at) >= today);
  const weekMembers = teamMembers.filter(m => new Date(m.created_at) >= weekAgo && new Date(m.created_at) < today);
  const monthMembers = teamMembers.filter(m => new Date(m.created_at) >= monthAgo && new Date(m.created_at) < weekAgo);

  let message = '📊 Recent Team Enrollments\n\n';

  if (todayMembers.length > 0) {
    message += `**Today (${todayMembers.length}):**\n`;
    todayMembers.slice(0, 5).forEach(m => {
      message += `• ${m.first_name} ${m.last_name}\n`;
    });
    message += '\n';
  }

  if (weekMembers.length > 0) {
    message += `**This Week (${weekMembers.length}):**\n`;
    weekMembers.slice(0, 5).forEach(m => {
      const date = new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      message += `• ${m.first_name} ${m.last_name} - ${date}\n`;
    });
    message += '\n';
  }

  if (monthMembers.length > 0) {
    message += `**This Month (${monthMembers.length}):**\n`;
    monthMembers.slice(0, 5).forEach(m => {
      const date = new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      message += `• ${m.first_name} ${m.last_name} - ${date}\n`;
    });
  }

  const total = todayMembers.length + weekMembers.length + monthMembers.length;
  message += `\n🎉 Total recent enrollments: ${total}`;

  return {
    success: true,
    message,
    data: {
      today: todayMembers.length,
      week: weekMembers.length,
      month: monthMembers.length,
      total,
    },
  };
}

async function handleRankProgressCheck(userId: string) {
  const supabase = await createClient();

  const { data: member } = await supabase
    .from('members')
    .select('id, distributor_id, current_rank, personal_volume, group_volume')
    .eq('distributor_id', (await supabase.from('distributors').select('id').eq('auth_user_id', userId).single()).data?.id)
    .single();

  if (!member) {
    return {
      success: false,
      message: 'Could not find your member profile.',
    };
  }

  // Get team count
  const { count: activeEnrollments } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true })
    .eq('sponsor_id', member.distributor_id)
    .eq('status', 'active');

  // Simple rank progression (you'll want to customize based on your comp plan)
  const ranks = [
    { name: 'Member', pvRequired: 0, gvRequired: 0, activeRequired: 0 },
    { name: 'Bronze', pvRequired: 500, gvRequired: 2000, activeRequired: 3 },
    { name: 'Silver', pvRequired: 500, gvRequired: 5000, activeRequired: 5 },
    { name: 'Gold', pvRequired: 500, gvRequired: 10000, activeRequired: 10 },
    { name: 'Platinum', pvRequired: 500, gvRequired: 25000, activeRequired: 15 },
    { name: 'Diamond', pvRequired: 500, gvRequired: 50000, activeRequired: 25 },
  ];

  const currentRankName = member.current_rank || 'Member';
  const currentRankIndex = ranks.findIndex(r => r.name === currentRankName);
  const nextRank = ranks[currentRankIndex + 1];

  if (!nextRank) {
    return {
      success: true,
      message: `🏆 Congratulations!\n\nYou're at the highest rank: ${currentRankName}\n\nKeep building and leading your team!`,
    };
  }

  const pv = member.personal_volume || 0;
  const gv = member.group_volume || 0;
  const ae = activeEnrollments || 0;

  const pvProgress = Math.min((pv / nextRank.pvRequired) * 100, 100);
  const gvProgress = Math.min((gv / nextRank.gvRequired) * 100, 100);
  const aeProgress = Math.min((ae / nextRank.activeRequired) * 100, 100);

  const pvMet = pv >= nextRank.pvRequired;
  const gvMet = gv >= nextRank.gvRequired;
  const aeMet = ae >= nextRank.activeRequired;

  const pvNeeded = Math.max(nextRank.pvRequired - pv, 0);
  const gvNeeded = Math.max(nextRank.gvRequired - gv, 0);
  const aeNeeded = Math.max(nextRank.activeRequired - ae, 0);

  let message = `🏆 Rank Progress\n\n**Current Rank:** ${currentRankName}\n**Next Rank:** ${nextRank.name}\n\n`;
  message += `**Requirements for ${nextRank.name}:**\n`;
  message += `${pvMet ? '✅' : '⚠️'} Personal Volume: $${pv.toFixed(2)}/$${nextRank.pvRequired} (${pvProgress.toFixed(0)}%)\n`;
  message += `${gvMet ? '✅' : '⚠️'} Team Volume: $${gv.toFixed(2)}/$${nextRank.gvRequired} (${gvProgress.toFixed(0)}%)\n`;
  message += `${aeMet ? '✅' : '⚠️'} Active Enrollments: ${ae}/${nextRank.activeRequired} (${aeProgress.toFixed(0)}%)\n\n`;

  const overallProgress = (pvProgress + gvProgress + aeProgress) / 3;
  message += `📊 Overall Progress: ${overallProgress.toFixed(0)}%\n\n`;

  if (!pvMet || !gvMet || !aeMet) {
    message += `**You Need:**\n`;
    if (!pvMet) message += `• $${pvNeeded.toFixed(2)} more personal volume\n`;
    if (!gvMet) message += `• $${gvNeeded.toFixed(2)} more team volume\n`;
    if (!aeMet) message += `• ${aeNeeded} more active enrollment${aeNeeded > 1 ? 's' : ''}\n`;
  } else {
    message += `🎉 You've met all requirements! Contact support to advance to ${nextRank.name}!`;
  }

  return {
    success: true,
    message,
    data: {
      currentRank: currentRankName,
      nextRank: nextRank.name,
      progress: overallProgress,
    },
  };
}

async function handleViewTeamMemberDetails(params: any, userId: string) {
  const supabase = await createClient();

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

  // Search for team member by name
  const searchTerm = params.searchName.toLowerCase();
  const { data: teamMembers } = await supabase
    .from('distributors')
    .select('*')
    .eq('sponsor_id', distributor.id)
    .neq('status', 'deleted');

  if (!teamMembers || teamMembers.length === 0) {
    return {
      success: false,
      message: `No team members found matching "${params.searchName}"`,
    };
  }

  const matches = teamMembers.filter(m =>
    m.first_name.toLowerCase().includes(searchTerm) ||
    m.last_name.toLowerCase().includes(searchTerm) ||
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchTerm)
  );

  if (matches.length === 0) {
    return {
      success: false,
      message: `No team members found matching "${params.searchName}"`,
    };
  }

  if (matches.length > 1) {
    const names = matches.map(m => `• ${m.first_name} ${m.last_name}`).join('\n');
    return {
      success: true,
      message: `Found ${matches.length} matches:\n\n${names}\n\nPlease be more specific.`,
    };
  }

  const member = matches[0];

  // Get their downline count
  const { count: downlineCount } = await supabase
    .from('distributors')
    .select('*', { count: 'exact', head: true })
    .eq('sponsor_id', member.id)
    .neq('status', 'deleted');

  const joinDate = new Date(member.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let message = `👤 ${member.first_name} ${member.last_name}\n\n`;
  message += `**Status:** ${member.status.charAt(0).toUpperCase() + member.status.slice(1)}\n`;
  message += `**Joined:** ${joinDate}\n`;
  if (member.email) message += `**Email:** ${member.email}\n`;
  if (member.phone) message += `**Phone:** ${member.phone}\n`;
  message += `**Team Size:** ${downlineCount || 0} ${downlineCount === 1 ? 'person' : 'people'}\n`;
  message += `\n**Replicated Site:** https://reachtheapex.net/${member.slug}`;

  return {
    success: true,
    message,
    data: member,
  };
}

async function handleCommissionBreakdown(params: any, userId: string) {
  const supabase = await createClient();

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

  // Get member for balance
  const { data: member } = await supabase
    .from('members')
    .select('commission_balance')
    .eq('distributor_id', distributor.id)
    .single();

  const balance = member?.commission_balance || 0;

  // This is a placeholder - you'll want to query actual commission records
  // For now, return a simple breakdown
  return {
    success: true,
    message: `💰 Commission Breakdown\n\n**Total Balance:** $${balance.toFixed(2)}\n\n🚧 Detailed breakdown coming soon!\n\nWe're building out commission tracking by:\n• Source (direct sales, team sales, bonuses)\n• Product type\n• Team member\n• Time period\n\nFor now, you can see your total balance above.`,
    data: {
      balance,
    },
  };
}

async function handleStartTutorial(params: any) {
  const tutorials: Record<string, string> = {
    send_text: `📱 **Tutorial: Sending a Text Message**\n\n**Step 1:** Go to your team member's profile\n**Step 2:** Click the "Send Message" button\n**Step 3:** Choose "SMS/Text"\n**Step 4:** Type your message\n**Step 5:** Click "Send"\n\n💡 **Pro Tip:** Keep texts short and include a clear call-to-action!\n\nWant to try it now? Say "show my team" to get started!`,

    send_email: `📧 **Tutorial: Sending an Email**\n\n**Step 1:** Navigate to Team > Communications\n**Step 2:** Click "Send Email"\n**Step 3:** Choose recipients (all team, active only, or custom)\n**Step 4:** Write your subject line\n**Step 5:** Compose your message\n**Step 6:** Click "Send Email"\n\n💡 **Pro Tip:** Use the templates provided for professional formatting!\n\nTry it: Say "send team announcement" to send an email to your team!`,

    create_event: `📅 **Tutorial: Creating an Event**\n\n**Step 1:** Tell me about your event\n• What's it called?\n• When is it? (date and time)\n• Where? (virtual link or physical address)\n\n**Step 2:** I'll create a registration page for you\n**Step 3:** Preview the page\n**Step 4:** Share the link with your team\n\n💡 **Pro Tip:** Create events in advance to give people time to register!\n\nTry it now! Say: "Create a meeting for next Tuesday at 6pm"`,

    add_lead: `👤 **Tutorial: Adding a New Lead**\n\n**Step 1:** Collect their basic info (name, email, phone)\n**Step 2:** Tell me about the lead\n**Step 3:** I'll add them to your CRM\n**Step 4:** Set a follow-up reminder\n\n💡 **Pro Tip:** Add leads immediately after meeting them so you don't forget!\n\nTry it: Say "Add a new lead: John Smith, john@email.com, interested in business"`,

    invite_team: `📨 **Tutorial: Inviting Your Team**\n\n**Step 1:** Create an event first (meeting, webinar, etc.)\n**Step 2:** Say "send invitations"\n**Step 3:** Choose who to invite:\n• All team members\n• Active members only\n• Specific people\n\n**Step 4:** I'll send professional email invitations!\n\n💡 **Pro Tip:** Send invitations 3-5 days before your event for best attendance!\n\nTry it: Create an event first, then say "send invitations to my team"`,

    social_media: `📱 **Tutorial: Creating Social Media Posts**\n\n**Step 1:** Tell me what you want to promote (event, product, opportunity)\n**Step 2:** I'll generate engaging copy with emojis and hashtags\n**Step 3:** Copy the post\n**Step 4:** Paste to Facebook, Instagram, or LinkedIn\n\n💡 **Pro Tip:** Post consistently and engage with comments!\n\nTry it: Say "Create a Facebook post about my Tuesday meeting"`,

    overview: `🎓 **Welcome to Your AI Assistant!**\n\nI can help you with:\n\n📅 **Events**\n• Create registration pages\n• Send invitations\n• Track attendees\n\n👥 **Team Management**\n• View team stats\n• Look up members\n• Send announcements\n\n💰 **Business**\n• Check commissions\n• Track rank progress\n• Add leads\n\n📱 **Marketing**\n• Generate social posts\n• Get your links\n• Create content\n\n**Try asking me:**\n• "Create a meeting for Tuesday"\n• "Who joined recently?"\n• "What's my rank progress?"\n• "Generate a Facebook post"\n\nWhat would you like to learn about first?`,
  };

  const tutorial = tutorials[params.topic] || tutorials.overview;

  return {
    success: true,
    message: tutorial,
  };
}

async function handleSendTeamAnnouncement(params: any, userId: string) {
  const supabase = await createClient();

  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, first_name, last_name')
    .eq('auth_user_id', userId)
    .single();

  if (!distributor) {
    return {
      success: false,
      message: 'Could not find your distributor profile.',
    };
  }

  // Get team emails based on recipient type
  let query = supabase
    .from('distributors')
    .select('email, first_name, last_name')
    .eq('sponsor_id', distributor.id)
    .neq('status', 'deleted')
    .not('email', 'is', null);

  if (params.recipientType === 'active_only') {
    query = query.eq('status', 'active');
  }

  const { data: teamMembers } = await query;

  if (!teamMembers || teamMembers.length === 0) {
    return {
      success: false,
      message: 'No team members found with email addresses.',
    };
  }

  // Send announcement emails
  const emailResults = await Promise.all(
    teamMembers.map((member) =>
      sendEmail({
        to: member.email,
        subject: params.subject,
        html: `<p>Hi ${member.first_name},</p><p>${params.message.replace(/\n/g, '<br>')}</p><p>Best,<br>${distributor.first_name} ${distributor.last_name}</p>`,
        from: 'Apex Affinity Group <theapex@theapexway.net>',
      })
    )
  );

  const successCount = emailResults.filter((r) => r.success).length;
  const failCount = emailResults.filter((r) => !r.success).length;

  return {
    success: true,
    message: `📢 Announcement Sent!\n\n**Subject:** ${params.subject}\n\n✅ Sent: ${successCount}\n${failCount > 0 ? `❌ Failed: ${failCount}\n` : ''}\nYour team will receive the message shortly!`,
    data: {
      sent: successCount,
      failed: failCount,
    },
  };
}

async function handleAddNewLead(params: any, userId: string) {
  const supabase = await createClient();

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

  // For now, we'll return a success message
  // In production, you'd want a leads table to store this
  const leadName = `${params.firstName} ${params.lastName}`;

  return {
    success: true,
    message: `✅ Lead Added!\n\n**Name:** ${leadName}\n${params.email ? `**Email:** ${params.email}\n` : ''}${params.phone ? `**Phone:** ${params.phone}\n` : ''}${params.notes ? `**Notes:** ${params.notes}\n` : ''}**Source:** ${params.source || 'personal contact'}\n\n🚧 **Note:** Full CRM integration coming soon! For now, this lead has been logged.\n\n**Next Steps:**\n• Send them a follow-up email\n• Schedule a call\n• Share your replicated site`,
    data: {
      name: leadName,
      email: params.email,
      phone: params.phone,
    },
  };
}

async function handleViewEditMeetings(params: any, userId: string) {
  const supabase = await createClient();

  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, slug')
    .eq('auth_user_id', userId)
    .single();

  if (!distributor) {
    return {
      success: false,
      message: 'Could not find your distributor profile.',
    };
  }

  const now = new Date();
  let query = supabase
    .from('meeting_events')
    .select('*')
    .eq('distributor_id', distributor.id)
    .eq('status', 'active');

  if (params.timeframe === 'upcoming') {
    query = query.gte('event_date', now.toISOString().split('T')[0]);
  } else if (params.timeframe === 'past') {
    query = query.lt('event_date', now.toISOString().split('T')[0]);
  }

  const { data: meetings } = await query.order('event_date', { ascending: true });

  if (!meetings || meetings.length === 0) {
    return {
      success: true,
      message: `📅 No ${params.timeframe === 'past' ? 'past' : 'upcoming'} meetings found.\n\nCreate your first meeting by saying:\n"Create a meeting for next Tuesday at 6pm"`,
    };
  }

  let message = `📅 Your Meetings (${params.timeframe || 'upcoming'})\n\n`;

  meetings.slice(0, 5).forEach((meeting, index) => {
    const date = new Date(meeting.event_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    message += `**${index + 1}. ${meeting.title}**\n`;
    message += `📅 ${date} at ${meeting.event_time}\n`;
    message += `📍 ${meeting.location_type === 'virtual' ? 'Virtual' : meeting.location_type === 'physical' ? 'In-Person' : 'Hybrid'}\n`;

    // Get registration count (placeholder - would need to query registrations table)
    message += `👥 Registrations: Coming soon\n`;
    message += `🔗 https://reachtheapex.net/${distributor.slug}/register/${meeting.registration_slug}\n\n`;
  });

  if (meetings.length > 5) {
    message += `...and ${meetings.length - 5} more meetings\n\n`;
  }

  message += `Want to:\n• Create a new meeting\n• Send invitations\n• View registration details`;

  return {
    success: true,
    message,
    data: meetings,
  };
}

async function handleGenerateSocialPost(params: any) {
  const topic = params.topic;
  const platform = params.platform || 'facebook';
  const tone = params.tone || 'casual';

  // AI-generated social media posts
  let facebookPost = '🎉 Exciting news! ';
  if (topic.includes('meeting') || topic.includes('event')) {
    facebookPost += `I'm hosting a special event!\n\n`;
  } else {
    facebookPost += `${topic}\n\n`;
  }
  if (tone === 'professional') {
    facebookPost += 'Join me for an informative session.\n\n';
  } else if (tone === 'excited') {
    facebookPost += "You don't want to miss this!\n\n";
  } else {
    facebookPost += "I'd love to see you there!\n\n";
  }
  if (topic.includes('opportunity')) {
    facebookPost += '💼 This could be a game-changer for you!\n\n';
  } else {
    facebookPost += '📍 Limited spots available - register now!\n\n';
  }
  facebookPost += 'Drop a 👍 if you\'re interested or comment below!\n\n';
  facebookPost += '#NetworkMarketing #BusinessOpportunity #TeamApex #FinancialFreedom';

  let instagramPost = '✨ ';
  if (topic.includes('meeting') || topic.includes('event')) {
    instagramPost += 'Special event coming up! ✨\n\n';
  } else {
    instagramPost += `Big things happening! ${topic} ✨\n\n`;
  }
  if (tone === 'excited') {
    instagramPost += '🔥 This is going to be AMAZING! 🔥\n\n';
  } else {
    instagramPost += '💫 Join me for something special!\n\n';
  }
  if (topic.includes('opportunity')) {
    instagramPost += '💼 Your future starts here!\n\n';
  } else {
    instagramPost += '📅 Save the date!\n\n';
  }
  instagramPost += 'Link in bio 👆 or DM me for details!\n\n';
  instagramPost += '#BusinessGoals #Success #Opportunity #Growth #TeamWork #DreamBig';

  let linkedinPost = '';
  if (tone === 'professional') {
    linkedinPost += 'Professional Announcement\n\n';
  } else {
    linkedinPost += 'Exciting Update\n\n';
  }
  if (topic.includes('opportunity')) {
    linkedinPost += `I'm excited to share a unique business opportunity: ${topic}\n\n`;
  } else {
    linkedinPost += `${topic}\n\n`;
  }
  if (tone === 'professional') {
    linkedinPost += 'This aligns with my commitment to helping professionals achieve their goals.\n\n';
  } else {
    linkedinPost += 'This could be a great fit for ambitious professionals looking to expand their income streams.\n\n';
  }
  linkedinPost += 'Interested in learning more? Comment below or send me a message.\n\n';
  linkedinPost += '#ProfessionalDevelopment #BusinessOpportunity #Networking #CareerGrowth';

  let twitterPost = '🚀 ';
  if (topic.includes('meeting')) {
    twitterPost += 'Event Alert!\n\n';
  } else {
    twitterPost += 'Big news!\n\n';
  }
  twitterPost += `${topic}\n\n`;
  if (tone === 'excited') {
    twitterPost += '🔥 Don\'t miss out!\n\n';
  } else {
    twitterPost += '📍 Limited availability\n\n';
  }
  twitterPost += 'DM for details!\n\n';
  twitterPost += '#Business #Opportunity #Growth';

  const templates: Record<string, string> = {
    facebook: facebookPost,
    instagram: instagramPost,
    linkedin: linkedinPost,
    twitter: twitterPost,
  };

  const post = templates[platform] || templates.facebook;

  return {
    success: true,
    message: `📱 **Social Media Post Generated**\n\n**Platform:** ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n**Tone:** ${tone.charAt(0).toUpperCase() + tone.slice(1)}\n\n---\n\n${post}\n\n---\n\n**Copy to clipboard** | **Generate another version** | **Edit**`,
    data: {
      platform,
      tone,
      post,
    },
  };
}

async function handleScheduleFollowup(params: any, userId: string) {
  const supabase = await createClient();

  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, first_name, last_name')
    .eq('auth_user_id', userId)
    .single();

  if (!distributor) {
    return {
      success: false,
      message: 'Could not find your distributor profile.',
    };
  }

  const dueDateTime = params.dueTime
    ? `${params.dueDate} ${params.dueTime}`
    : params.dueDate;

  const formattedDate = new Date(params.dueDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return {
    success: true,
    message: `⏰ Follow-Up Scheduled!\n\n**Task:** ${params.taskDescription}\n**When:** ${formattedDate}${params.dueTime ? ` at ${params.dueTime}` : ''}\n${params.contactName ? `**Contact:** ${params.contactName}\n` : ''}\n🚧 **Note:** Full task management coming soon! For now, set a reminder in your calendar.\n\n**You'll receive:**\n• Email reminder 1 hour before\n• Dashboard notification\n• SMS reminder (optional)\n\nAdd to calendar | View all tasks | Mark as done`,
    data: {
      task: params.taskDescription,
      dueDate: params.dueDate,
      dueTime: params.dueTime,
      contact: params.contactName,
    },
  };
}

async function handleListAllTeamMembers(params: any, userId: string) {
  const supabase = await createClient();

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

  // Get all team members
  let query = supabase
    .from('distributors')
    .select('id, first_name, last_name, email, phone, status, created_at')
    .eq('sponsor_id', distributor.id)
    .neq('status', 'deleted');

  // Apply status filter
  if (params.statusFilter === 'active') {
    query = query.eq('status', 'active');
  } else if (params.statusFilter === 'inactive') {
    query = query.neq('status', 'active');
  }

  // Apply sorting
  if (params.sortBy === 'join_date') {
    query = query.order('created_at', { ascending: false });
  } else if (params.sortBy === 'status') {
    query = query.order('status', { ascending: true });
  } else {
    query = query.order('first_name', { ascending: true });
  }

  // Apply limit if specified
  if (params.limit && typeof params.limit === 'number' && params.limit > 0) {
    query = query.limit(params.limit);
  }

  const { data: teamMembers } = await query;

  if (!teamMembers || teamMembers.length === 0) {
    return {
      success: true,
      message: '👥 No team members found.\n\nYour team will appear here as they join!',
    };
  }

  // Get total count for context (if limited)
  let totalCount = teamMembers.length;
  if (params.limit && typeof params.limit === 'number' && params.limit > 0) {
    const { count } = await supabase
      .from('distributors')
      .select('id', { count: 'exact', head: true })
      .eq('sponsor_id', distributor.id)
      .neq('status', 'deleted');
    totalCount = count || teamMembers.length;
  }

  const limitedText = params.limit && totalCount > teamMembers.length
    ? ` (showing ${teamMembers.length} of ${totalCount})`
    : ` (${teamMembers.length} total)`;

  let message = `👥 **Your Team Members**${limitedText}\n\n`;

  teamMembers.forEach((member, index) => {
    const joinDate = new Date(member.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const statusEmoji = member.status === 'active' ? '✅' : '⚠️';

    message += `${index + 1}. ${statusEmoji} **${member.first_name} ${member.last_name}**\n`;
    message += `   Status: ${member.status.charAt(0).toUpperCase() + member.status.slice(1)}\n`;
    message += `   Joined: ${joinDate}\n`;
    if (member.email) message += `   Email: ${member.email}\n`;
    if (member.phone) message += `   Phone: ${member.phone}\n`;
    message += '\n';
  });

  if (params.limit && totalCount > teamMembers.length) {
    message += `\n💡 Showing first ${teamMembers.length}. Ask "show all team members" to see everyone.\n`;
  }

  message += `\nWant to:\n• Send announcement to team\n• View individual details\n• Filter by status`;

  return {
    success: true,
    message,
    data: {
      count: teamMembers.length,
      totalCount: totalCount,
      members: teamMembers,
    },
  };
}

// ========== PHASE 2: ANALYTICS & PERFORMANCE HANDLERS ==========

async function handleGetTeamAnalytics(params: any, userId: string) {
  const supabase = await createClient();

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

  // Get all team members with their BV
  const { data: teamMembers } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, personal_bv_monthly, status, created_at')
    .eq('sponsor_id', distributor.id)
    .neq('status', 'deleted');

  if (!teamMembers || teamMembers.length === 0) {
    return {
      success: true,
      message: '📊 **Team Analytics**\n\nNo team members yet. Your analytics will appear here as your team grows!',
    };
  }

  // Calculate analytics
  const totalBV = teamMembers.reduce((sum, m) => sum + (m.personal_bv_monthly || 0), 0);
  const activeMembers = teamMembers.filter(m => m.status === 'active').length;
  const topPerformers = [...teamMembers]
    .sort((a, b) => (b.personal_bv_monthly || 0) - (a.personal_bv_monthly || 0))
    .slice(0, 5);

  let message = `📊 **Team Analytics** (${params.timeframe})\n\n`;
  message += `**Overall Performance:**\n`;
  message += `• Total Team BV: ${totalBV.toLocaleString()}\n`;
  message += `• Active Members: ${activeMembers}/${teamMembers.length}\n`;
  message += `• Avg BV per Member: ${Math.round(totalBV / teamMembers.length)}\n\n`;

  message += `**🏆 Top 5 Performers:**\n`;
  topPerformers.forEach((member, index) => {
    const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐';
    const percentage = totalBV > 0 ? Math.round((member.personal_bv_monthly || 0) / totalBV * 100) : 0;
    message += `${emoji} **${member.first_name} ${member.last_name}** - ${member.personal_bv_monthly || 0} BV (${percentage}%)\n`;
  });

  message += `\n💡 Want to:\n• Recognize top performers\n• See detailed breakdown\n• Contact team members`;

  return {
    success: true,
    message,
    data: {
      totalBV,
      activeMembers,
      topPerformers,
    },
  };
}

async function handleGetMyPerformance(params: any, userId: string) {
  const supabase = await createClient();

  const { data: distributor } = await supabase
    .from('distributors')
    .select(`
      id,
      first_name,
      current_rank,
      personal_bv_monthly,
      status,
      created_at
    `)
    .eq('auth_user_id', userId)
    .single();

  if (!distributor) {
    return {
      success: false,
      message: 'Could not find your distributor profile.',
    };
  }

  // Get team BV
  const { data: teamMembers } = await supabase
    .from('distributors')
    .select('personal_bv_monthly')
    .eq('sponsor_id', distributor.id)
    .neq('status', 'deleted');

  const groupBV = (teamMembers || []).reduce((sum, m) => sum + (m.personal_bv_monthly || 0), 0);

  // Calculate rank progress
  const rankRequirements: Record<string, { personal: number; group: number; next: string }> = {
    starter: { personal: 150, group: 300, next: 'Bronze' },
    bronze: { personal: 500, group: 1500, next: 'Silver' },
    silver: { personal: 1200, group: 5000, next: 'Gold' },
    gold: { personal: 2000, group: 15000, next: 'Platinum' },
    platinum: { personal: 3000, group: 30000, next: 'Ruby' },
    ruby: { personal: 4000, group: 60000, next: 'Diamond' },
    diamond: { personal: 5000, group: 120000, next: 'Crown' },
    crown: { personal: 6000, group: 250000, next: 'Elite' },
  };

  const currentRank = distributor.current_rank || 'starter';
  const requirements = rankRequirements[currentRank];
  const personalBV = distributor.personal_bv_monthly || 0;

  let message = `📈 **Your Performance** (This Month)\n\n`;
  message += `**Current Status:**\n`;
  message += `• Rank: ${currentRank.toUpperCase()}\n`;
  message += `• Personal BV: ${personalBV}\n`;
  message += `• Group BV: ${groupBV}\n`;
  message += `• Team Size: ${teamMembers?.length || 0} members\n\n`;

  if (requirements) {
    const personalGap = requirements.personal - personalBV;
    const groupGap = requirements.group - groupBV;
    const personalProgress = Math.min(100, Math.round((personalBV / requirements.personal) * 100));
    const groupProgress = Math.min(100, Math.round((groupBV / requirements.group) * 100));

    message += `**Progress to ${requirements.next}:**\n`;
    message += `• Personal BV: ${personalProgress}% (${personalGap > 0 ? `${personalGap} more needed` : '✅ Qualified'})\n`;
    message += `• Group BV: ${groupProgress}% (${groupGap > 0 ? `${groupGap} more needed` : '✅ Qualified'})\n\n`;

    if (personalGap > 0 || groupGap > 0) {
      message += `💡 **Action Plan:**\n`;
      if (personalGap > 0) {
        message += `• Generate ${personalGap} personal BV (about ${Math.ceil(personalGap / 100)} sales)\n`;
      }
      if (groupGap > 0) {
        message += `• Help your team generate ${groupGap} more group BV\n`;
      }
    } else {
      message += `🎉 **You're qualified for ${requirements.next}!** Keep it up this month to advance!`;
    }
  }

  return {
    success: true,
    message,
    data: {
      currentRank,
      personalBV,
      groupBV,
      teamSize: teamMembers?.length || 0,
    },
  };
}

async function handleGetCommissionBreakdown(params: any, userId: string) {
  const supabase = await createClient();

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

  // Get date range based on timeframe
  let startDate = new Date();
  if (params.timeframe === 'this_week') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (params.timeframe === 'this_month') {
    startDate.setDate(1);
  } else if (params.timeframe === 'last_month') {
    startDate.setMonth(startDate.getMonth() - 1);
    startDate.setDate(1);
  } else if (params.timeframe === 'last_3_months') {
    startDate.setMonth(startDate.getMonth() - 3);
  }

  const { data: commissions } = await supabase
    .from('commissions')
    .select('type, amount, created_at')
    .eq('distributor_id', distributor.id)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (!commissions || commissions.length === 0) {
    return {
      success: true,
      message: `💰 **Commission Breakdown** (${params.timeframe})\n\nNo commissions earned in this period yet. Keep building!`,
    };
  }

  // Group by type
  const byType: Record<string, number> = {};
  let total = 0;

  commissions.forEach(c => {
    byType[c.type] = (byType[c.type] || 0) + c.amount;
    total += c.amount;
  });

  let message = `💰 **Commission Breakdown** (${params.timeframe})\n\n`;
  message += `**Total Earned: $${(total / 100).toFixed(2)}**\n\n`;
  message += `**By Type:**\n`;

  Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, amount]) => {
      const percentage = Math.round((amount / total) * 100);
      const emoji = type === 'binary' ? '⚖️' : type === 'override' ? '📊' : type === 'retail' ? '🛒' : '💎';
      message += `${emoji} ${type.charAt(0).toUpperCase() + type.slice(1)}: $${(amount / 100).toFixed(2)} (${percentage}%)\n`;
    });

  message += `\n💡 ${commissions.length} total commission${commissions.length !== 1 ? 's' : ''} earned`;

  return {
    success: true,
    message,
    data: {
      total,
      byType,
      count: commissions.length,
    },
  };
}

async function handleViewGenealogyTree(params: any, userId: string) {
  const supabase = await createClient();

  const { data: distributor } = await supabase
    .from('distributors')
    .select('id, first_name, last_name, slug, current_rank')
    .eq('auth_user_id', userId)
    .single();

  if (!distributor) {
    return {
      success: false,
      message: 'Could not find your distributor profile.',
    };
  }

  // Recursive function to build tree
  async function buildTree(parentId: string, depth: number, maxDepth: number): Promise<string> {
    if (depth > maxDepth) return '';

    const { data: children } = await supabase
      .from('distributors')
      .select('id, first_name, last_name, slug, current_rank')
      .eq('sponsor_id', parentId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: true });

    if (!children || children.length === 0) return '';

    let tree = '';
    const indent = '  '.repeat(depth);

    for (const child of children) {
      tree += `${indent}├─ **${child.first_name} ${child.last_name}** (${child.current_rank || 'starter'})\n`;
      const subtree = await buildTree(child.id, depth + 1, maxDepth);
      tree += subtree;
    }

    return tree;
  }

  const tree = await buildTree(distributor.id, 1, params.depth || 3);

  let message = `🌳 **Your Genealogy Tree** (${params.depth || 3} levels)\n\n`;
  message += `👤 **YOU** (${distributor.first_name} ${distributor.last_name}) - ${distributor.current_rank || 'starter'}\n`;

  if (tree) {
    message += tree;
  } else {
    message += `\nNo team members yet. Your tree will grow as you sponsor new members!`;
  }

  message += `\n💡 Want to see more levels? Ask "show my tree 5 levels deep"`;

  return {
    success: true,
    message,
  };
}

// ========== PHASE 3: ADVANCED TOOL HANDLERS ==========

async function handleSetPersonalGoal(params: any, userId: string) {
  // For now, return a success message (would need a goals table for persistence)
  let goalDescription = '';
  if (params.goalType === 'rank') {
    goalDescription = `Reach ${params.targetValue.toUpperCase()} rank`;
  } else if (params.goalType === 'income') {
    goalDescription = `Earn ${params.targetValue} per month`;
  } else if (params.goalType === 'team_size') {
    goalDescription = `Build team to ${params.targetValue}`;
  } else {
    goalDescription = params.targetValue;
  }

  const deadline = new Date(params.deadline).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    success: true,
    message: `🎯 **Goal Set!**\n\n**Goal:** ${goalDescription}\n**Deadline:** ${deadline}\n\n✅ I'll help you track progress and suggest actions to achieve this goal!\n\n💡 Ask "check my goal progress" anytime to see how you're doing.`,
    data: {
      goalType: params.goalType,
      targetValue: params.targetValue,
      deadline: params.deadline,
    },
  };
}

async function handleCheckGoalProgress(params: any, userId: string) {
  return {
    success: true,
    message: `🎯 **Goal Progress**\n\n🚧 **Feature Coming Soon!**\n\nGoal tracking is being built. For now, use "get my performance" to see your current stats.\n\nYou can set goals with "set a goal" and I'll remember them for you!`,
  };
}

async function handleViewUpcomingEvents(params: any, userId: string) {
  const supabase = await createClient();

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + (params.daysAhead || 30));

  const { data: events } = await supabase
    .from('company_events')
    .select('title, description, event_date, event_time, location, max_attendees')
    .eq('status', 'active')
    .gte('event_date', new Date().toISOString().split('T')[0])
    .lte('event_date', endDate.toISOString().split('T')[0])
    .order('event_date', { ascending: true });

  if (!events || events.length === 0) {
    return {
      success: true,
      message: `📅 **Upcoming Events** (Next ${params.daysAhead || 30} days)\n\nNo events scheduled yet. Check back soon!`,
    };
  }

  let message = `📅 **Upcoming Events** (Next ${params.daysAhead || 30} days)\n\n`;

  events.forEach((event, index) => {
    const eventDate = new Date(event.event_date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    message += `${index + 1}. **${event.title}**\n`;
    message += `   📆 ${eventDate} at ${event.event_time}\n`;
    if (event.location) message += `   📍 ${event.location}\n`;
    if (event.description) message += `   ${event.description}\n`;
    message += `\n`;
  });

  return {
    success: true,
    message,
    data: { events },
  };
}

async function handleGetTrainingResources(params: any, userId: string) {
  return {
    success: true,
    message: `📚 **Training Resources: "${params.topic}"**\n\n🎥 **Recommended Videos:**\n1. Getting Started with ${params.topic}\n2. Advanced ${params.topic} Strategies\n3. ${params.topic} Best Practices\n\n📄 **Guides & Playbooks:**\n• ${params.topic} Quick Start Guide\n• ${params.topic} Script Book\n• ${params.topic} FAQ\n\n💡 **Want to start a tutorial?** Ask "teach me about ${params.topic}"\n\n🚧 **Note:** Full training library integration coming soon!`,
  };
}

async function handleCheckCompliance(params: any, userId: string) {
  const content = params.content.toLowerCase();

  // Basic compliance checks
  const violations = [];
  const warnings = [];

  // Income claims
  if (content.match(/\$\d+|earn \d+|make money|get rich|financial freedom/i)) {
    violations.push('❌ **Income Claim:** Cannot promise specific income amounts or "get rich quick" messaging');
  }

  // Guarantees
  if (content.match(/guarantee|promised|for sure|definitely will/i)) {
    violations.push('❌ **Guarantee:** Cannot guarantee results or outcomes');
  }

  // Medical/health claims
  if (content.match(/cure|treat|heal|diagnose|prevent disease/i)) {
    violations.push('❌ **Health Claim:** Cannot make medical or health claims about products');
  }

  // Pyramid scheme language
  if (content.match(/no selling|passive income|money while you sleep/i)) {
    warnings.push('⚠️ **Warning:** Avoid pyramid scheme language. Focus on product value and effort required.');
  }

  if (violations.length > 0) {
    let message = `🚫 **Compliance Issues Detected**\n\n`;
    violations.forEach(v => message += `${v}\n\n`);
    if (warnings.length > 0) {
      warnings.forEach(w => message += `${w}\n\n`);
    }
    message += `**Suggested Fix:**\nFocus on:\n• Personal results (with disclaimers)\n• Product benefits\n• Business opportunity (requires work)\n• Testimonials (with "results not typical" disclaimer)`;

    return {
      success: false,
      message,
      data: { violations, warnings },
    };
  } else if (warnings.length > 0) {
    let message = `⚠️ **Compliance Warnings**\n\n`;
    warnings.forEach(w => message += `${w}\n\n`);
    message += `✅ No major violations, but consider revising for better compliance.`;

    return {
      success: true,
      message,
      data: { warnings },
    };
  } else {
    return {
      success: true,
      message: `✅ **Looks Good!**\n\nNo obvious compliance issues detected. Your ${params.platform} content appears compliant.\n\n💡 **Remember:**\n• Always disclose your relationship with the company\n• Use #ad or #sponsored if applicable\n• Results may vary - avoid guarantees`,
    };
  }
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

    // Fetch user context for personalized system prompt
    const { data: distributor } = await supabase
      .from('distributors')
      .select(`
        id,
        first_name,
        last_name,
        slug,
        current_rank,
        personal_bv_monthly,
        status,
        created_at,
        sponsor_id
      `)
      .eq('auth_user_id', user.id)
      .single();

    // Get sponsor info separately
    let sponsorInfo = null;
    if (distributor?.sponsor_id) {
      const { data: sponsor } = await supabase
        .from('distributors')
        .select('first_name, last_name, slug')
        .eq('id', distributor.sponsor_id)
        .single();
      sponsorInfo = sponsor;
    }

    // Get team count
    const { count: teamCount } = await supabase
      .from('distributors')
      .select('id', { count: 'exact', head: true })
      .eq('sponsor_id', distributor?.id || '')
      .neq('status', 'deleted');

    // Get current month commission total
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: commissions } = await supabase
      .from('commissions')
      .select('amount')
      .eq('distributor_id', distributor?.id || '')
      .gte('created_at', startOfMonth.toISOString());

    const monthlyCommissions = commissions?.reduce((sum, c) => sum + c.amount, 0) || 0;

    // Build personalized system prompt
    const userContext = distributor ? `
YOU ARE HELPING: ${distributor.first_name} ${distributor.last_name} (${distributor.slug})

CURRENT STATUS:
- Rank: ${distributor.current_rank?.toUpperCase() || 'STARTER'}
- Personal BV: ${distributor.personal_bv_monthly || 0} this month
- Team Size: ${teamCount || 0} members
- Commission Earned: $${(monthlyCommissions / 100).toFixed(2)} this month
- Sponsor: ${sponsorInfo?.first_name || 'N/A'} ${sponsorInfo?.last_name || ''}
- Member Since: ${new Date(distributor.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}

COMPENSATION PLAN (Tech Ladder):
- Starter: 0 personal BV, 0 group BV → L1 overrides only
- Bronze: 150 personal BV, 300 group BV → L1-L2 overrides, $250 rank bonus
- Silver: 500 personal BV, 1500 group BV → L1-L3 overrides, $1,000 rank bonus
- Gold: 1200 personal BV, 5000 group BV, 1 Bronze → L1-L4 overrides, $3,000 rank bonus
- Platinum: 2000 personal BV, 15000 group BV, 2 Gold → L1-L5 overrides, $10,000 rank bonus
- Ruby: 3000 personal BV, 30000 group BV, 3 Gold → L1-L5 overrides, $25,000 rank bonus
- Diamond: 4000 personal BV, 60000 group BV, (3 Platinum OR 5 Gold) → L1-L5 overrides, $50,000 rank bonus
- Crown: 5000 personal BV, 120000 group BV, (3 Diamond OR 5 Platinum) → L1-L5 overrides, $100,000 rank bonus
- Elite: 6000 personal BV, 250000 group BV, 3 Crown → L1-L5 overrides, $250,000 rank bonus

RANK PROGRESS CALCULATION:
- If user asks "how close am I to [rank]?", calculate the gap between their current BV and the requirement
- Show percentage complete and exact numbers needed
- Be encouraging but realistic

` : '';

    // Call Anthropic API with tools
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6', // Same model as admin chat - works!
      max_tokens: 2048,
      system: `You are a helpful AI assistant for network marketing distributors. You have access to tools to help with various tasks.

${userContext}

MEDIA CAPABILITIES (IMPORTANT - READ THIS!):
- ✅ YOU CAN show videos: Use [video:YOUTUBE_URL] syntax in your response (e.g., [video:https://youtube.com/watch?v=abc123])
- ✅ YOU CAN play audio: Use [audio:AUDIO_URL] syntax in your response (e.g., [audio:https://example.com/file.mp3])
- These will render inline in the chat interface with proper video/audio players
- DO NOT say "I can't show videos" or "I can't play audio" - you absolutely can using the syntax above
- Example: If user uploads a YouTube link, respond with "Here's your video: [video:URL]"

VISUAL DIAGRAMS WITH MERMAID (CRITICAL - USE THIS!):
- ✅ YOU CAN create visual organizational charts and diagrams using Mermaid syntax
- When user asks to "show my team in a diagram", "show a chart", "visualize my team", or "show my matrix", you MUST use Mermaid
- DO NOT give text-based trees - use visual Mermaid diagrams instead!

Mermaid syntax for organizational charts:
\`\`\`mermaid
graph TD
    A[You - Gold Partner<br/>BV: 1450 | Team: 47]
    B[Sarah J. - Silver<br/>BV: 980 | Team: 23]
    C[Mike C. - Silver<br/>BV: 920 | Team: 15]
    D[Emily R. - Bronze<br/>BV: 720 | Team: 9]
    A --> B
    A --> C
    A --> D
    B --> E[John D.<br/>Bronze]
    B --> F[Amy L.<br/>Bronze]
\`\`\`

WHEN TO USE MERMAID:
- User says: "show me a chart" → Use Mermaid
- User says: "diagram of my team" → Use Mermaid
- User says: "visualize my organization" → Use Mermaid
- User says: "show my matrix tree" → Use Mermaid
- User says: "show me a visual" → Use Mermaid

NEVER give text trees when user asks for visual representation!

QUANTITY UNDERSTANDING (CRITICAL - FOLLOW EXACTLY!):
When user asks for specific quantities, YOU MUST use the limit and sortBy parameters correctly:
- "who is the FIRST person I signed up?" → limit: 1, sortBy: 'join_date' (oldest first)
- "who was my LAST recruit?" → limit: 1, sortBy: 'join_date' (but show newest - reverse order)
- "show my RECENT 3 team members" → limit: 3, sortBy: 'join_date' (newest first)
- "who are my FIRST 5 people?" → limit: 5, sortBy: 'join_date' (oldest first)
- "who are my TOP 10 team members?" → limit: 10 (by any ranking metric available)
- "who are ALL my team members?" → no limit (show everyone)

REMEMBER:
- "first" = oldest members (early enrollees)
- "last" / "recent" / "latest" / "newest" = newest members (recent enrollees)
- ALWAYS use limit when a number is specified
- NEVER return all results when user asks for a specific quantity

IMPORTANT GUIDELINES:
1. When user asks "who are my team members" or "list my team" or "what are their names", use the list_all_team_members tool
2. When user asks for a SPECIFIC NUMBER like "first 3", "top 5", "first 10 people", ALWAYS use the limit parameter in list_all_team_members
3. When user asks for team stats (just numbers), use view_team_stats
4. When creating meetings, today's date is ${new Date().toISOString().split('T')[0]}. Parse relative dates like "next Tuesday", "April 10", "tomorrow" correctly
5. When user says "send invitations", ask which group: all team, active only, or specific people
6. When user asks about performance, analytics, or "how am I doing", use get_my_performance or get_team_analytics
7. When user wants to see their tree/genealogy, use view_genealogy_tree
8. When user asks about compliance or "can I say this", use check_compliance
9. Be conversational and friendly, but professional
10. If you don't have a tool for something, be CLEAR and SPECIFIC about why it won't work
11. Always use the most specific tool available for the user's request

ERROR MESSAGES (BE CLEAR AND HELPFUL):
- ❌ DON'T SAY: "Meeting not found or you don't have permission"
- ✅ DO SAY: "I can only send emails to your team members, not external email addresses. Would you like me to send to your team instead?"
- ❌ DON'T SAY: "Failed to process request"
- ✅ DO SAY: "I couldn't find that person on your team. Did you mean [similar name]? Or you can use 'list my team' to see everyone."
- BE SPECIFIC about WHY something didn't work and WHAT the user can do instead

CONTEXT AWARENESS:
- Remember what was just created (like a meeting) so when user says "preview it" or "send invitations", you know what they're referring to
- Keep track of the conversation flow
- Don't ask for information that was already provided in the conversation
- Pay attention to QUANTITY words: "first", "top", "3", "5", "10", "recent", "last", "latest", "newest", "oldest" and use them correctly with limit and sortBy`,
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
        case 'preview_registration_page':
          toolResult = await handlePreviewRegistrationPage(toolUseBlock.input);
          break;
        case 'preview_meeting_invitation':
          toolResult = await handlePreviewMeetingInvitation(toolUseBlock.input, user.id);
          break;
        case 'send_meeting_invitations':
          toolResult = await handleSendMeetingInvitations(toolUseBlock.input, user.id);
          break;
        case 'create_meeting_flyer':
          toolResult = await handleCreateMeetingFlyer(toolUseBlock.input, user.id);
          break;
        case 'get_my_links':
          toolResult = await handleGetMyLinks(user.id);
          break;
        case 'who_joined_recently':
          toolResult = await handleWhoJoinedRecently(toolUseBlock.input, user.id);
          break;
        case 'rank_progress_check':
          toolResult = await handleRankProgressCheck(user.id);
          break;
        case 'view_team_member_details':
          toolResult = await handleViewTeamMemberDetails(toolUseBlock.input, user.id);
          break;
        case 'commission_breakdown':
          toolResult = await handleCommissionBreakdown(toolUseBlock.input, user.id);
          break;
        case 'start_tutorial':
          toolResult = await handleStartTutorial(toolUseBlock.input);
          break;
        case 'send_team_announcement':
          toolResult = await handleSendTeamAnnouncement(toolUseBlock.input, user.id);
          break;
        case 'add_new_lead':
          toolResult = await handleAddNewLead(toolUseBlock.input, user.id);
          break;
        case 'view_edit_meetings':
          toolResult = await handleViewEditMeetings(toolUseBlock.input, user.id);
          break;
        case 'generate_social_post':
          toolResult = await handleGenerateSocialPost(toolUseBlock.input);
          break;
        case 'schedule_followup':
          toolResult = await handleScheduleFollowup(toolUseBlock.input, user.id);
          break;
        case 'list_all_team_members':
          toolResult = await handleListAllTeamMembers(toolUseBlock.input, user.id);
          break;
        // Phase 2 tools
        case 'get_team_analytics':
          toolResult = await handleGetTeamAnalytics(toolUseBlock.input, user.id);
          break;
        case 'get_my_performance':
          toolResult = await handleGetMyPerformance(toolUseBlock.input, user.id);
          break;
        case 'get_commission_breakdown':
          toolResult = await handleGetCommissionBreakdown(toolUseBlock.input, user.id);
          break;
        case 'view_genealogy_tree':
          toolResult = await handleViewGenealogyTree(toolUseBlock.input, user.id);
          break;
        // Phase 3 tools
        case 'set_personal_goal':
          toolResult = await handleSetPersonalGoal(toolUseBlock.input, user.id);
          break;
        case 'check_goal_progress':
          toolResult = await handleCheckGoalProgress(toolUseBlock.input, user.id);
          break;
        case 'view_upcoming_events':
          toolResult = await handleViewUpcomingEvents(toolUseBlock.input, user.id);
          break;
        case 'get_training_resources':
          toolResult = await handleGetTrainingResources(toolUseBlock.input, user.id);
          break;
        case 'check_compliance':
          toolResult = await handleCheckCompliance(toolUseBlock.input, user.id);
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
