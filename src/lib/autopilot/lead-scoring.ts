// =============================================
// AI Lead Scoring Algorithm
// Calculates lead score (0-100) based on engagement factors
// =============================================

interface Contact {
  last_contact_date: string | null;
  created_at: string;
  lead_status: string;
  tags?: string[] | null;
  email_opt_in?: boolean;
  sms_opt_in?: boolean;
  phone?: string | null;
  email?: string | null;
}

interface LeadScoreFactors {
  recency_score: number;
  recency_reason: string;
  engagement_score: number;
  engagement_reason: string;
  stage_score: number;
  stage_reason: string;
  interest_score: number;
  interest_reason: string;
  total_score: number;
}

/**
 * Calculate AI lead score (0-100) based on multiple factors
 */
export function calculateLeadScore(contact: Contact): {
  score: number;
  factors: LeadScoreFactors;
} {
  let recencyScore = 0;
  let engagementScore = 0;
  let stageScore = 0;
  let interestScore = 0;

  let recencyReason = '';
  let engagementReason = '';
  let stageReason = '';
  let interestReason = '';

  // FACTOR 1: Recency of last contact (0-30 points)
  const now = new Date();
  const lastContact = contact.last_contact_date
    ? new Date(contact.last_contact_date)
    : new Date(contact.created_at);
  const daysSinceContact = Math.floor(
    (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceContact <= 1) {
    recencyScore = 30;
    recencyReason = 'Contacted within 24 hours';
  } else if (daysSinceContact <= 3) {
    recencyScore = 25;
    recencyReason = 'Contacted within 3 days';
  } else if (daysSinceContact <= 7) {
    recencyScore = 20;
    recencyReason = 'Contacted within 1 week';
  } else if (daysSinceContact <= 14) {
    recencyScore = 15;
    recencyReason = 'Contacted within 2 weeks';
  } else if (daysSinceContact <= 30) {
    recencyScore = 10;
    recencyReason = 'Contacted within 1 month';
  } else if (daysSinceContact <= 60) {
    recencyScore = 5;
    recencyReason = 'Contacted within 2 months';
  } else {
    recencyScore = 0;
    recencyReason = 'No recent contact (60+ days)';
  }

  // FACTOR 2: Engagement level (0-20 points)
  let engagementCount = 0;

  if (contact.email_opt_in) engagementCount++;
  if (contact.sms_opt_in) engagementCount++;
  if (contact.phone) engagementCount++;
  if (contact.email) engagementCount++;

  engagementScore = engagementCount * 5; // Max 20 points
  engagementReason = `${engagementCount} engagement indicators`;

  // FACTOR 3: Pipeline stage (0-30 points)
  const stageScores: Record<string, number> = {
    new: 10,
    contacted: 15,
    qualified: 25,
    nurturing: 20,
    converted: 30,
    unqualified: 5,
    lost: 0,
  };

  stageScore = stageScores[contact.lead_status] || 10;
  stageReason = `Lead status: ${contact.lead_status}`;

  // FACTOR 4: Tags/interests (0-20 points)
  const tags = contact.tags || [];
  const tagCount = tags.length;

  if (tagCount === 0) {
    interestScore = 0;
    interestReason = 'No tags/interests recorded';
  } else if (tagCount === 1) {
    interestScore = 8;
    interestReason = '1 interest area';
  } else if (tagCount === 2) {
    interestScore = 14;
    interestReason = '2 interest areas';
  } else {
    interestScore = 20;
    interestReason = `${tagCount} interest areas`;
  }

  // Calculate total score
  const totalScore = recencyScore + engagementScore + stageScore + interestScore;

  return {
    score: Math.min(100, totalScore),
    factors: {
      recency_score: recencyScore,
      recency_reason: recencyReason,
      engagement_score: engagementScore,
      engagement_reason: engagementReason,
      stage_score: stageScore,
      stage_reason: stageReason,
      interest_score: interestScore,
      interest_reason: interestReason,
      total_score: totalScore,
    },
  };
}

/**
 * Get lead score label based on score value
 */
export function getLeadScoreLabel(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 80) {
    return {
      label: 'Hot',
      color: 'red',
      description: 'High-priority lead - engage immediately',
    };
  } else if (score >= 50) {
    return {
      label: 'Warm',
      color: 'orange',
      description: 'Engaged lead - follow up soon',
    };
  } else {
    return {
      label: 'Cold',
      color: 'blue',
      description: 'Low engagement - nurture over time',
    };
  }
}

/**
 * Get recommended next action based on lead score and status
 */
export function getRecommendedAction(
  score: number,
  leadStatus: string,
  daysSinceContact: number
): string {
  // Hot leads
  if (score >= 80) {
    if (leadStatus === 'new' || leadStatus === 'contacted') {
      return 'Schedule a demo or meeting ASAP';
    }
    if (leadStatus === 'qualified') {
      return 'Send proposal or pricing';
    }
    if (leadStatus === 'nurturing') {
      return 'Check in with personalized offer';
    }
    return 'Maintain regular contact';
  }

  // Warm leads
  if (score >= 50) {
    if (daysSinceContact > 7) {
      return 'Send follow-up email or SMS';
    }
    if (leadStatus === 'new') {
      return 'Reach out to qualify interest';
    }
    if (leadStatus === 'contacted') {
      return 'Schedule discovery call';
    }
    return 'Continue nurturing relationship';
  }

  // Cold leads
  if (daysSinceContact > 30) {
    return 'Re-engagement campaign needed';
  }
  if (leadStatus === 'new') {
    return 'Send introductory email';
  }
  return 'Add to nurture campaign';
}
