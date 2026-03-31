// =============================================
// AI Genealogy Analyzer
// Analyzes team data and generates strategic recommendations
// Uses Claude API (Anthropic)
// =============================================

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Types
export type RecommendationType =
  | 'rank_progress'
  | 'inactive_reps'
  | 'sales_opportunity'
  | 'team_growth'
  | 'commission_optimization'
  | 'training_needed';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';

export interface TeamMemberData {
  id: string;
  name: string;
  tech_rank: string;
  personal_qv: number;
  team_qv: number;
  sponsor_id: string | null;
  created_at: string;
  is_active: boolean;
}

export interface RecommendationOutput {
  recommendation_text: string;
  recommendation_type: RecommendationType;
  priority: PriorityLevel;
  action_items: string[];
  related_distributor_ids: string[];
}

/**
 * Fetch team data for a distributor
 * Uses sponsor_id (enrollment tree) - SINGLE SOURCE OF TRUTH
 */
export async function fetchTeamData(distributorId: string): Promise<{
  distributor: any;
  teamMembers: TeamMemberData[];
  personalEnrollees: TeamMemberData[];
}> {
  const supabase = await createClient();

  // Get distributor with member data (for QV/rank)
  const { data: distributor, error: distError } = await supabase
    .from('distributors')
    .select(`
      id,
      first_name,
      last_name,
      created_at,
      member:members!members_distributor_id_fkey (
        tech_rank,
        personal_qv_monthly,
        team_qv_monthly
      )
    `)
    .eq('id', distributorId)
    .single();

  if (distError || !distributor) {
    throw new Error(`Failed to fetch distributor: ${distError?.message || 'Not found'}`);
  }

  // Get personally enrolled team members (enrollment tree - sponsor_id)
  const { data: personalEnrollees, error: enrolleesError } = await supabase
    .from('distributors')
    .select(`
      id,
      first_name,
      last_name,
      sponsor_id,
      created_at,
      member:members!members_distributor_id_fkey (
        tech_rank,
        personal_qv_monthly,
        team_qv_monthly
      )
    `)
    .eq('sponsor_id', distributorId)
    .order('created_at', { ascending: false });

  if (enrolleesError) {
    console.error('Error fetching personal enrollees:', enrolleesError);
  }

  // Get full team (recursive downline from enrollment tree)
  // For now, we'll use personal enrollees only for MVP
  // TODO: Add recursive query for full downline when needed

  const teamMembers: TeamMemberData[] = (personalEnrollees || []).map((tm: any) => ({
    id: tm.id,
    name: `${tm.first_name} ${tm.last_name}`,
    tech_rank: tm.member?.tech_rank || 'starter',
    personal_qv: tm.member?.personal_qv_monthly || 0,
    team_qv: tm.member?.team_qv_monthly || 0,
    sponsor_id: tm.sponsor_id,
    created_at: tm.created_at,
    is_active: (tm.member?.personal_qv_monthly || 0) >= 50,
  }));

  return {
    distributor,
    teamMembers,
    personalEnrollees: teamMembers,
  };
}

/**
 * Analyze team and generate 2-3 recommendations using Claude API
 */
export async function analyzeTeamWithAI(
  distributorId: string
): Promise<RecommendationOutput[]> {
  const { distributor, teamMembers } = await fetchTeamData(distributorId);

  // Extract member data
  const memberData = distributor.member;
  const currentRank = memberData?.tech_rank || 'starter';
  const personalQV = memberData?.personal_qv_monthly || 0;
  const teamQV = memberData?.team_qv_monthly || 0;

  // Calculate team stats
  const totalTeam = teamMembers.length;
  const activeTeam = teamMembers.filter((tm) => tm.is_active).length;
  const inactiveTeam = totalTeam - activeTeam;
  const newRecruits30Days = teamMembers.filter((tm) => {
    const enrolledDate = new Date(tm.created_at);
    const daysSince = (Date.now() - enrolledDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 30;
  }).length;

  // Build context for Claude
  const prompt = buildAnalysisPrompt({
    distributorName: `${distributor.first_name} ${distributor.last_name}`,
    currentRank,
    personalQV,
    teamQV,
    totalTeam,
    activeTeam,
    inactiveTeam,
    newRecruits30Days,
    teamMembers: teamMembers.slice(0, 10), // Top 10 for context
  });

  // Call Claude API
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // Parse response
  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

  // Parse structured recommendations from Claude response
  const recommendations = parseRecommendations(responseText, teamMembers);

  return recommendations;
}

/**
 * Build analysis prompt for Claude
 */
function buildAnalysisPrompt(data: {
  distributorName: string;
  currentRank: string;
  personalQV: number;
  teamQV: number;
  totalTeam: number;
  activeTeam: number;
  inactiveTeam: number;
  newRecruits30Days: number;
  teamMembers: TeamMemberData[];
}): string {
  const rankRequirements = getRankRequirements(data.currentRank);

  return `You are an AI business advisor for Apex Affinity Group, an MLM platform with a 7-level compensation plan.

Analyze the team data below and generate 2-3 strategic, actionable recommendations.

DISTRIBUTOR: ${data.distributorName}
CURRENT RANK: ${data.currentRank}
PERSONAL QV: ${data.personalQV} (minimum 50 QV/month to earn overrides)
TEAM QV: ${data.teamQV}

TEAM STATS:
- Total team members: ${data.totalTeam}
- Active members (50+ QV/month): ${data.activeTeam}
- Inactive members: ${data.inactiveTeam}
- New recruits (last 30 days): ${data.newRecruits30Days}

NEXT RANK: ${rankRequirements.nextRank}
REQUIREMENTS:
- Personal QV: ${rankRequirements.personalQV}
- Team QV: ${rankRequirements.teamQV}
${rankRequirements.downlineReq ? `- Downline: ${rankRequirements.downlineReq}` : ''}

GAPS TO NEXT RANK:
- Personal QV gap: ${Math.max(0, rankRequirements.personalQV - data.personalQV)}
- Team QV gap: ${Math.max(0, rankRequirements.teamQV - data.teamQV)}

TOP TEAM MEMBERS:
${data.teamMembers.map((tm, i) => `${i + 1}. ${tm.name} - ${tm.tech_rank} - ${tm.personal_qv} QV (${tm.is_active ? 'ACTIVE' : 'INACTIVE'})`).join('\n')}

INSTRUCTIONS:
1. Generate 2-3 recommendations (MUST be 2 or 3, never 1, never 4+)
2. Prioritize based on what will drive the most impact
3. Focus on ACTIONABLE steps, not generic advice
4. Use specific numbers and names from the data
5. For each recommendation, provide:
   - Type (rank_progress, inactive_reps, sales_opportunity, team_growth, commission_optimization, or training_needed)
   - Priority (low, medium, high, or urgent)
   - Recommendation text (2-3 sentences, specific and actionable)
   - Action items (2-3 specific steps)
   - Related distributor IDs (if applicable)

FORMAT YOUR RESPONSE EXACTLY LIKE THIS (JSON):
[
  {
    "type": "rank_progress",
    "priority": "high",
    "text": "Your specific recommendation here with numbers and names",
    "action_items": [
      "Specific action 1",
      "Specific action 2",
      "Specific action 3"
    ],
    "related_ids": ["ID1", "ID2"]
  },
  {
    "type": "inactive_reps",
    "priority": "medium",
    "text": "Second recommendation",
    "action_items": [
      "Action 1",
      "Action 2"
    ],
    "related_ids": []
  }
]

RESPOND WITH ONLY THE JSON ARRAY. NO MARKDOWN, NO EXPLANATIONS, JUST THE JSON.`;
}

/**
 * Get rank requirements
 */
function getRankRequirements(currentRank: string): {
  nextRank: string;
  personalQV: number;
  teamQV: number;
  downlineReq: string | null;
} {
  const ranks: Record<string, any> = {
    starter: { next: 'Bronze', personal: 150, team: 300, downline: null },
    bronze: { next: 'Silver', personal: 500, team: 1500, downline: null },
    silver: { next: 'Gold', personal: 1200, team: 5000, downline: '1 Bronze' },
    gold: { next: 'Platinum', personal: 2500, team: 15000, downline: '2 Silvers' },
    platinum: { next: 'Ruby', personal: 4000, team: 30000, downline: '2 Golds' },
    ruby: { next: 'Diamond', personal: 5000, team: 50000, downline: '3 Golds or 2 Platinums' },
    diamond: {
      next: 'Crown',
      personal: 6000,
      team: 75000,
      downline: '2 Platinums + 1 Gold',
    },
    crown: {
      next: 'Elite',
      personal: 8000,
      team: 120000,
      downline: '3 Platinums or 2 Diamonds',
    },
    elite: { next: 'Elite (Max)', personal: 8000, team: 120000, downline: null },
  };

  const currentRankData = ranks[currentRank.toLowerCase()] || ranks.starter;

  return {
    nextRank: currentRankData.next,
    personalQV: currentRankData.personal,
    teamQV: currentRankData.team,
    downlineReq: currentRankData.downline,
  };
}

/**
 * Parse Claude's response into structured recommendations
 */
function parseRecommendations(
  responseText: string,
  teamMembers: TeamMemberData[]
): RecommendationOutput[] {
  try {
    // Extract JSON from response (in case Claude adds markdown or extra text)
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }

    // Map to our recommendation format
    return parsed.map((rec: any) => ({
      recommendation_text: rec.text || rec.recommendation_text || 'No recommendation provided',
      recommendation_type: (rec.type || rec.recommendation_type || 'team_growth') as RecommendationType,
      priority: (rec.priority || 'medium') as PriorityLevel,
      action_items: Array.isArray(rec.action_items) ? rec.action_items : [],
      related_distributor_ids: Array.isArray(rec.related_ids) ? rec.related_ids : [],
    }));
  } catch (error) {
    console.error('Failed to parse Claude response:', error);
    console.error('Response text:', responseText);

    // Fallback: return generic recommendation
    return [
      {
        recommendation_text: 'Focus on activating your team by helping them reach 50 QV/month minimum',
        recommendation_type: 'team_growth',
        priority: 'medium',
        action_items: [
          'Schedule 1-on-1 calls with inactive team members',
          'Share product training resources',
          'Set up weekly team calls',
        ],
        related_distributor_ids: [],
      },
    ];
  }
}

/**
 * Save recommendations to database
 */
export async function saveRecommendations(
  distributorId: string,
  recommendations: RecommendationOutput[]
): Promise<void> {
  const supabase = await createClient();

  const inserts = recommendations.map((rec) => ({
    distributor_id: distributorId,
    recommendation_text: rec.recommendation_text,
    recommendation_type: rec.recommendation_type,
    priority: rec.priority,
    action_items: rec.action_items,
    related_distributor_ids: rec.related_distributor_ids,
    ai_model: 'claude-sonnet-4-20250514',
    generated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('ai_genealogy_recommendations').insert(inserts);

  if (error) {
    console.error('Error saving recommendations:', error);
    throw error;
  }
}
