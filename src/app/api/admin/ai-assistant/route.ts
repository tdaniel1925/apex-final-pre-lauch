// =============================================
// AI Assistant API Route
// Processes natural language commands using Claude AI
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth/admin';
import { SYSTEM_PROMPT, AI_FUNCTIONS } from '@/lib/admin/ai-assistant-prompt';
import { executeCommand, type ParsedAction } from '@/lib/admin/command-executor';
import { resolveDistributor, formatDistributor } from '@/lib/admin/entity-resolver';
import { createServiceClient } from '@/lib/supabase/service';

// Force dynamic rendering - prevent build-time analysis
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Rate limiting map (in-memory, simple implementation)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AssistantRequest {
  message: string;
  conversationHistory?: Message[];
  confirmed?: boolean;
  action?: ParsedAction;
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const now = Date.now();
    const adminKey = admin.admin.id;
    const rateLimit = rateLimitMap.get(adminKey);

    if (rateLimit) {
      if (now < rateLimit.resetAt) {
        if (rateLimit.count >= RATE_LIMIT) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please wait a moment.' },
            { status: 429 }
          );
        }
        rateLimit.count++;
      } else {
        rateLimitMap.set(adminKey, { count: 1, resetAt: now + RATE_WINDOW });
      }
    } else {
      rateLimitMap.set(adminKey, { count: 1, resetAt: now + RATE_WINDOW });
    }

    const body: AssistantRequest = await request.json();

    // If this is a confirmed action, execute it
    if (body.confirmed && body.action) {
      return await executeConfirmedAction(body.action, admin.admin.id, body.message);
    }

    // Otherwise, process the message with Claude
    return await processMessage(body.message, body.conversationHistory || [], admin.admin.id);

  } catch (error: any) {
    console.error('AI Assistant error:', error);
    return NextResponse.json(
      {
        type: 'error',
        message: 'Sorry, I encountered an error processing your request.',
        error: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Process a message with Claude AI
 */
async function processMessage(
  message: string,
  conversationHistory: Message[],
  adminId: string
): Promise<NextResponse> {
  try {
    // Build messages array
    const messages: any[] = [
      ...conversationHistory.map(m => ({
        role: m.role,
        content: m.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    // Call Claude API directly via fetch (no SDK dependency)
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set in environment variables');
      throw new Error('AI service is not configured. Please contact support.');
    }

    const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6', // Sonnet 4.6 - MUCH smarter than Haiku
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: AI_FUNCTIONS,
        tool_choice: { type: 'auto' },
        messages,
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      console.error('Anthropic API error:', {
        status: apiResponse.status,
        statusText: apiResponse.statusText,
        error: errorData,
      });
      throw new Error(`Anthropic API error: ${errorData.error?.message || apiResponse.statusText || 'Unknown error'}`);
    }

    const response = await apiResponse.json();

    // Check if Claude wants to use a tool
    const toolUse = response.content.find((block: any) => block.type === 'tool_use') as any;

    if (toolUse && toolUse.type === 'tool_use') {
      // Claude identified a command
      const functionName = toolUse.name;
      const functionArgs = toolUse.input;

      // Validate and prepare action
      const action: ParsedAction = {
        type: functionName,
        ...functionArgs,
      };

      // Check if this action needs confirmation
      const needsConfirmation = [
        'move_rep_sponsor',
        'update_status',
        'change_email',
        'change_admin_role',
      ].includes(functionName);

      if (needsConfirmation) {
        // Generate confirmation message
        const confirmationMessage = await generateConfirmationMessage(action);

        // Log to database (not executed yet)
        await logAssistantAction(adminId, message, confirmationMessage, action, false);

        return NextResponse.json({
          type: 'confirmation',
          message: confirmationMessage,
          needsConfirmation: true,
          action,
        });
      } else {
        // Execute non-destructive actions immediately
        const result = await executeCommand(action, adminId);

        // Log to database
        await logAssistantAction(adminId, message, result.message, action, true, result);

        return NextResponse.json({
          type: 'result',
          message: result.message,
          success: result.success,
          data: result.data,
        });
      }
    }

    // No tool use - just a regular response
    const textBlock = response.content.find((block: any) => block.type === 'text') as any;
    const responseText = textBlock?.text || 'I can help you manage distributors. Try commands like "move rep John Smith under Jane Doe" or type "help" for more information.';

    // Log conversation
    await logAssistantAction(adminId, message, responseText, null, false);

    return NextResponse.json({
      type: 'question',
      message: responseText,
    });

  } catch (error: any) {
    console.error('Claude API error:', error);

    // Check for specific API errors
    if (error.status === 429) {
      return NextResponse.json({
        type: 'error',
        message: 'The AI service is currently busy. Please try again in a moment.',
      }, { status: 429 });
    }

    throw error;
  }
}

/**
 * Execute a confirmed action
 */
async function executeConfirmedAction(
  action: ParsedAction,
  adminId: string,
  originalMessage: string
): Promise<NextResponse> {
  const result = await executeCommand(action, adminId);

  // Log to database with execution result
  await logAssistantAction(adminId, originalMessage, result.message, action, true, result);

  return NextResponse.json({
    type: 'result',
    message: result.message,
    success: result.success,
    data: result.data,
    error: result.error,
  });
}

/**
 * Generate a confirmation message for an action
 */
async function generateConfirmationMessage(action: ParsedAction): Promise<string> {
  try {
    switch (action.type) {
      case 'move_rep_sponsor': {
        const distResult = await resolveDistributor(action.distributorIdentifier!);
        const sponsorResult = await resolveDistributor(action.newSponsorIdentifier!);

        if (!distResult.success || !sponsorResult.success) {
          return `Could not resolve distributors. Please be more specific.`;
        }

        const dist = distResult.distributor!;
        const sponsor = sponsorResult.distributor!;

        return `I found:
• Distributor: ${formatDistributor(dist)}
• New Sponsor: ${formatDistributor(sponsor)}

This will change ${dist.first_name}'s sponsor in the organization tree.

**Confirm this action?**`;
      }

      case 'update_status': {
        const distResult = await resolveDistributor(action.distributorIdentifier!);
        if (!distResult.success) {
          return `Could not find distributor. Please be more specific.`;
        }

        const dist = distResult.distributor!;
        const actionWord = action.action === 'suspend' ? 'suspend' : action.action === 'activate' ? 'activate' : 'delete';

        return `${actionWord.charAt(0).toUpperCase() + actionWord.slice(1)} ${formatDistributor(dist)}?

${action.reason ? `Reason: ${action.reason}` : ''}

**Confirm this action?**`;
      }

      case 'change_email': {
        const distResult = await resolveDistributor(action.distributorIdentifier!);
        if (!distResult.success) {
          return `Could not find distributor. Please be more specific.`;
        }

        const dist = distResult.distributor!;

        return `Change email for ${formatDistributor(dist)}

From: ${dist.email}
To: ${action.newEmail}

**Confirm this action?**`;
      }

      case 'change_admin_role': {
        const distResult = await resolveDistributor(action.distributorIdentifier!);
        if (!distResult.success) {
          return `Could not find distributor. Please be more specific.`;
        }

        const dist = distResult.distributor!;
        const roleText = action.role === 'none' ? 'Remove admin access' : `Make ${action.role}`;

        return `${roleText} for ${formatDistributor(dist)}

**Confirm this action?**`;
      }

      default:
        return 'Confirm this action?';
    }
  } catch (error) {
    return 'Confirm this action?';
  }
}

/**
 * Log assistant action to database
 */
async function logAssistantAction(
  adminId: string,
  userMessage: string,
  assistantResponse: string,
  action: ParsedAction | null,
  executed: boolean,
  executionResult?: any
): Promise<void> {
  try {
    const supabase = createServiceClient();

    await supabase.from('ai_assistant_logs').insert({
      admin_id: adminId,
      user_message: userMessage,
      assistant_response: assistantResponse,
      action_type: action?.type || null,
      action_details: action ? JSON.parse(JSON.stringify(action)) : null,
      executed,
      execution_result: executionResult ? JSON.parse(JSON.stringify(executionResult)) : null,
    });
  } catch (error) {
    console.error('Failed to log assistant action:', error);
  }
}
