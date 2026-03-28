/**
 * Anthropic Tool Definitions
 * Defines the schema for all AI chat tools
 */

import Anthropic from '@anthropic-ai/sdk';

export const tools: Anthropic.Tool[] = [
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
];
