import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { getCurrentDistributor } from '@/lib/auth/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schema
const createCampaignSchema = z.object({
  prospectName: z.string().min(1, 'Prospect name is required'),
  prospectEmail: z.string().email('Valid email is required'),
  prospectSource: z.string().min(1, 'How you met is required'),
  prospectInterests: z.string().min(1, 'Interests are required'),
  prospectBirthday: z.string().optional(),
  prospectHobbies: z.string().optional(),
  prospectKids: z.string().optional(),
});

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GeneratedEmail {
  week: number;
  subject: string;
  body_html: string;
  body_text: string;
}

/**
 * POST /api/dashboard/nurture-campaigns/create
 * Create a new AI-powered nurture campaign
 */
export async function POST(request: Request) {
  try {
    // 1. Authentication
    const currentDist = await getCurrentDistributor();
    if (!currentDist) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse and validate input
    const body = await request.json();
    const validationResult = createCampaignSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const supabase = createServiceClient();

    // 3. Check campaign limit
    const { data: limitCheck, error: limitError } = await supabase
      .rpc('check_campaign_limit', { p_distributor_id: currentDist.id });

    if (limitError) {
      return NextResponse.json({ error: 'Failed to check limit' }, { status: 500 });
    }

    if (!limitCheck?.can_create) {
      return NextResponse.json(
        {
          error: 'Campaign limit reached',
          message: 'Upgrade to Business Center ($39/mo) for unlimited campaigns'
        },
        { status: 403 }
      );
    }

    // 4. Generate personalized email sequence with Claude
    const emails = await generateEmailSequence({
      repName: `${currentDist.first_name} ${currentDist.last_name}`,
      prospectName: data.prospectName,
      prospectEmail: data.prospectEmail,
      prospectSource: data.prospectSource,
      prospectInterests: data.prospectInterests,
      prospectBirthday: data.prospectBirthday || null,
      prospectHobbies: data.prospectHobbies || null,
      prospectKids: data.prospectKids || null,
    });

    // 5. Build prospect_personal JSONB
    const prospectPersonal: Record<string, string | string[]> = {};
    if (data.prospectBirthday) prospectPersonal.birthday = data.prospectBirthday;
    if (data.prospectKids) prospectPersonal.kids = data.prospectKids;
    if (data.prospectHobbies) prospectPersonal.hobbies = data.prospectHobbies.split(',').map(h => h.trim());

    // 6. Insert campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('nurture_campaigns')
      .insert({
        distributor_id: currentDist.id,
        prospect_name: data.prospectName,
        prospect_email: data.prospectEmail,
        prospect_source: data.prospectSource,
        prospect_interests: data.prospectInterests.split(',').map(i => i.trim()),
        prospect_personal: Object.keys(prospectPersonal).length > 0 ? prospectPersonal : null,
        campaign_status: 'active',
        current_week: 1,
        next_email_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      })
      .select()
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
    }

    // 7. Insert all 7 emails
    const emailInserts = emails.map((email, index) => ({
      campaign_id: campaign.id,
      week_number: email.week,
      subject: email.subject,
      body_html: email.body_html,
      body_text: email.body_text,
      scheduled_at: new Date(Date.now() + index * 7 * 24 * 60 * 60 * 1000).toISOString(), // Weekly intervals
    }));

    const { error: emailsError } = await supabase
      .from('nurture_emails')
      .insert(emailInserts);

    if (emailsError) {
      // Rollback: delete campaign
      await supabase.from('nurture_campaigns').delete().eq('id', campaign.id);
      return NextResponse.json({ error: 'Failed to create email sequence' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      campaign_id: campaign.id,
      message: `Campaign created! First email will be sent in 24 hours.`,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate 7-week personalized email sequence using Claude
 */
async function generateEmailSequence(params: {
  repName: string;
  prospectName: string;
  prospectEmail: string;
  prospectSource: string;
  prospectInterests: string;
  prospectBirthday: string | null;
  prospectHobbies: string | null;
  prospectKids: string | null;
}): Promise<GeneratedEmail[]> {
  const prompt = buildEmailGenerationPrompt(params);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

  // Parse the JSON response
  const emails = parseEmailResponse(responseText);

  if (emails.length !== 7) {
    throw new Error(`Expected 7 emails, got ${emails.length}`);
  }

  return emails;
}

/**
 * Build the prompt for Claude to generate emails
 */
function buildEmailGenerationPrompt(params: {
  repName: string;
  prospectName: string;
  prospectSource: string;
  prospectInterests: string;
  prospectBirthday: string | null;
  prospectHobbies: string | null;
  prospectKids: string | null;
}): string {
  return `You are an expert email copywriter for Apex Affinity Group, a professional business opportunity in tech services and insurance.

CONTEXT:
- Rep Name: ${params.repName}
- Prospect Name: ${params.prospectName}
- How they met: ${params.prospectSource}
- Prospect's interests: ${params.prospectInterests}
${params.prospectBirthday ? `- Birthday: ${params.prospectBirthday}` : ''}
${params.prospectHobbies ? `- Hobbies: ${params.prospectHobbies}` : ''}
${params.prospectKids ? `- Number of kids: ${params.prospectKids}` : ''}

TASK:
Generate a 7-week email nurture sequence. Each email should:
1. Be warm, personalized, and professional (NO emojis, NO playful language)
2. Reference specific details about the prospect (interests, hobbies, how you met)
3. Build trust and rapport gradually
4. NOT be pushy or salesy
5. Follow the weekly themes below
6. Be 200-350 words per email
7. Include a clear subject line

WEEKLY THEMES:
- Week 1: Warm introduction, reference how you met, express genuine interest in staying connected
- Week 2: Share valuable insight related to their interests (work from home, passive income, etc.)
- Week 3: Personal story from ${params.repName} about their own journey with Apex
- Week 4: Educational content about the business opportunity (keep it casual)
- Week 5: Social proof - mention team success stories
- Week 6: Address common concerns/questions (time commitment, legitimacy, etc.)
- Week 7: Soft invitation to learn more (low pressure call-to-action)

TONE:
- Professional and corporate (like a business email, NOT a marketing email)
- Navy blue brand colors: #2c5aa0
- Use prospect's name naturally (not in every sentence)
- Sign emails as "${params.repName}" from Apex Affinity Group

FORMAT YOUR RESPONSE AS JSON:
[
  {
    "week": 1,
    "subject": "Subject line here",
    "body_html": "<p>HTML email body here with proper formatting</p>",
    "body_text": "Plain text version here"
  },
  ... (repeat for all 7 weeks)
]

IMPORTANT:
- body_html should use proper HTML tags: <p>, <strong>, <br>, <a>
- Use navy blue (#2c5aa0) for links
- body_text should be the plain text version (no HTML tags)
- NO emojis, NO purple colors, NO playful gradients
- Keep it professional and corporate

RESPOND WITH ONLY THE JSON ARRAY. NO MARKDOWN CODE BLOCKS, NO EXPLANATIONS, JUST THE JSON.`;
}

/**
 * Parse Claude's JSON response into email array
 */
function parseEmailResponse(responseText: string): GeneratedEmail[] {
  try {
    // Extract JSON from response (in case Claude adds markdown)
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed) || parsed.length !== 7) {
      throw new Error('Response must be an array of 7 emails');
    }

    return parsed.map((email: unknown) => {
      const e = email as { week: number; subject: string; body_html: string; body_text: string };
      return {
        week: e.week,
        subject: e.subject,
        body_html: e.body_html,
        body_text: e.body_text,
      };
    });
  } catch (error) {
    throw new Error('Failed to parse AI-generated emails');
  }
}
