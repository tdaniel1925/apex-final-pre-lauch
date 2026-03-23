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
    name: 'send_meeting_invitations',
    description: 'Sends email invitations to the user\'s team members for a meeting. Use this when user wants to invite their team or send invitations.',
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

  // Handle conditional sections (simplified - just remove if not needed)
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

  // Send emails
  const emailResults = await Promise.all(
    recipients.map((recipient) =>
      sendEmail({
        to: recipient.email,
        subject: `You're Invited: ${meeting.title}`,
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
      model: 'claude-sonnet-4-6', // Same model as admin chat - works!
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
        case 'preview_registration_page':
          toolResult = await handlePreviewRegistrationPage(toolUseBlock.input);
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
