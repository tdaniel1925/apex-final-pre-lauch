// =============================================
// Apex Lead Autopilot - Meeting Invitation Helpers
// Helper functions for managing meeting invitations
// =============================================

import { createServiceClient } from '@/lib/supabase/service';
import { hasReachedLimit } from '@/lib/stripe/autopilot-helpers';

export type InvitationStatus =
  | 'draft'
  | 'sent'
  | 'opened'
  | 'responded_yes'
  | 'responded_no'
  | 'responded_maybe'
  | 'expired'
  | 'canceled';

export type ResponseType = 'yes' | 'no' | 'maybe';

export interface MeetingInvitation {
  id: string;
  distributor_id: string;
  recipient_email: string;
  recipient_name: string;
  meeting_title: string;
  meeting_description: string | null;
  meeting_date_time: string;
  meeting_location: string | null;
  meeting_link: string | null;
  status: InvitationStatus;
  sent_at: string | null;
  opened_at: string | null;
  open_count: number;
  responded_at: string | null;
  response_type: ResponseType | null;
  reminder_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Check if distributor can send more invitations
 */
export async function canSendInvitation(distributorId: string): Promise<boolean> {
  try {
    const hasReached = await hasReachedLimit(distributorId, 'email');
    return !hasReached;
  } catch (error) {
    console.error('[Invitation Helpers] Error checking limit:', error);
    return false;
  }
}

/**
 * Get remaining invitations for distributor
 */
export async function getRemainingInvites(distributorId: string): Promise<number> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('autopilot_usage_limits')
      .select('email_invites_used_this_month, email_invites_limit')
      .eq('distributor_id', distributorId)
      .single();

    if (error || !data) {
      console.error('[Invitation Helpers] Error fetching usage limits:', error);
      return 0;
    }

    // -1 means unlimited
    if (data.email_invites_limit === -1) {
      return 999999; // Return large number for unlimited
    }

    const remaining = data.email_invites_limit - data.email_invites_used_this_month;
    return Math.max(0, remaining);
  } catch (error) {
    console.error('[Invitation Helpers] Error calculating remaining invites:', error);
    return 0;
  }
}

/**
 * Generate invitation response link
 */
export function generateInvitationLink(
  invitationId: string,
  responseType: ResponseType
): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${baseUrl}/autopilot/respond/${invitationId}?response=${responseType}`;
}

/**
 * Generate tracking pixel URL
 */
export function generateTrackingPixelUrl(invitationId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${baseUrl}/api/autopilot/track/open/${invitationId}`;
}

/**
 * Generate calendar file (.ics) content
 */
export function generateCalendarFile(invitation: MeetingInvitation): string {
  const startDate = new Date(invitation.meeting_date_time);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later

  // Format dates for iCalendar (YYYYMMDDTHHMMSSZ)
  const formatICalDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const location = invitation.meeting_location || invitation.meeting_link || 'TBD';
  const description = invitation.meeting_description || '';

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apex Affinity Group//Meeting Invitation//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${invitation.id}@theapexway.net
DTSTAMP:${formatICalDate(new Date())}
DTSTART:${formatICalDate(startDate)}
DTEND:${formatICalDate(endDate)}
SUMMARY:${invitation.meeting_title}
DESCRIPTION:${description}
LOCATION:${location}
ORGANIZER;CN=${invitation.recipient_name}:mailto:${invitation.recipient_email}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
}

/**
 * Check if invitation has expired (meeting date has passed)
 */
export function isInvitationExpired(invitation: MeetingInvitation): boolean {
  const meetingDate = new Date(invitation.meeting_date_time);
  const now = new Date();
  return meetingDate < now;
}

/**
 * Increment email invitation usage counter
 */
export async function incrementInvitationUsage(distributorId: string): Promise<boolean> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase.rpc('increment_autopilot_usage', {
      p_distributor_id: distributorId,
      p_limit_type: 'email',
      p_increment: 1,
    });

    if (error) {
      console.error('[Invitation Helpers] Error incrementing usage:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('[Invitation Helpers] Error incrementing usage:', error);
    return false;
  }
}

/**
 * Get invitation statistics for a distributor
 */
export async function getInvitationStats(distributorId: string) {
  try {
    const supabase = createServiceClient();

    // Get current month's start date
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all invitations for this month
    const { data: invitations, error } = await supabase
      .from('meeting_invitations')
      .select('status, response_type, opened_at')
      .eq('distributor_id', distributorId)
      .gte('created_at', monthStart.toISOString());

    if (error) {
      console.error('[Invitation Helpers] Error fetching stats:', error);
      return null;
    }

    // Calculate statistics
    const totalSent = invitations?.length || 0;
    const totalOpened = invitations?.filter(i => i.opened_at !== null).length || 0;
    const totalResponded = invitations?.filter(i => i.response_type !== null).length || 0;
    const respondedYes = invitations?.filter(i => i.response_type === 'yes').length || 0;
    const respondedNo = invitations?.filter(i => i.response_type === 'no').length || 0;
    const respondedMaybe = invitations?.filter(i => i.response_type === 'maybe').length || 0;

    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const responseRate = totalSent > 0 ? (totalResponded / totalSent) * 100 : 0;

    return {
      totalSent,
      totalOpened,
      totalResponded,
      respondedYes,
      respondedNo,
      respondedMaybe,
      openRate: Math.round(openRate * 10) / 10, // Round to 1 decimal
      responseRate: Math.round(responseRate * 10) / 10,
    };
  } catch (error) {
    console.error('[Invitation Helpers] Error calculating stats:', error);
    return null;
  }
}

/**
 * Format meeting date/time for display
 */
export function formatMeetingDateTime(dateTime: string): string {
  const date = new Date(dateTime);

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

/**
 * Validate invitation data before sending
 */
export function validateInvitationData(data: {
  recipient_email: string;
  recipient_name: string;
  meeting_title: string;
  meeting_date_time: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.recipient_email)) {
    errors.push('Invalid email address');
  }

  // Validate name
  if (!data.recipient_name || data.recipient_name.trim().length < 2) {
    errors.push('Recipient name must be at least 2 characters');
  }

  // Validate title
  if (!data.meeting_title || data.meeting_title.trim().length < 3) {
    errors.push('Meeting title must be at least 3 characters');
  }

  // Validate date is in the future
  const meetingDate = new Date(data.meeting_date_time);
  const now = new Date();
  if (meetingDate <= now) {
    errors.push('Meeting date must be in the future');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
