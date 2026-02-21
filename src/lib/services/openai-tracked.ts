// =============================================
// OpenAI Client with Usage Tracking
// Wraps OpenAI API calls with automatic cost tracking
// =============================================

import OpenAI from 'openai';
import { trackUsage } from './tracking';
import type { TriggeredBy } from '@/types/service-tracking';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =============================================
// Tracked OpenAI Client
// =============================================

export interface TrackedCompletionParams {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;

  // Tracking context
  triggeredBy: TriggeredBy;
  userId?: string;
  adminId?: string;
  feature?: string;
}

/**
 * Create chat completion with automatic cost tracking
 *
 * Usage:
 * ```typescript
 * const response = await createTrackedCompletion({
 *   messages: [{ role: 'user', content: 'Hello!' }],
 *   model: 'gpt-4o-mini',
 *   triggeredBy: 'user',
 *   userId: user.id,
 *   feature: 'pulse-follow',
 * });
 * ```
 */
export async function createTrackedCompletion(params: TrackedCompletionParams) {
  const startTime = Date.now();

  try {
    const response = await openai.chat.completions.create({
      model: params.model || 'gpt-4o-mini',
      messages: params.messages,
      temperature: params.temperature,
      max_tokens: params.max_tokens,
    });

    const durationMs = Date.now() - startTime;

    // Track usage
    await trackUsage({
      service: 'openai',
      operation: 'chat.completion',
      endpoint: '/v1/chat/completions',

      tokensInput: response.usage?.prompt_tokens,
      tokensOutput: response.usage?.completion_tokens,

      triggeredBy: params.triggeredBy,
      userId: params.userId,
      adminId: params.adminId,
      feature: params.feature,

      requestMetadata: {
        model: params.model || 'gpt-4o-mini',
        temperature: params.temperature,
        max_tokens: params.max_tokens,
      },
      responseMetadata: {
        finish_reason: response.choices[0]?.finish_reason,
        model: response.model,
      },
      durationMs,
    });

    return response;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;

    // Track failed request too
    await trackUsage({
      service: 'openai',
      operation: 'chat.completion',
      endpoint: '/v1/chat/completions',

      triggeredBy: params.triggeredBy,
      userId: params.userId,
      adminId: params.adminId,
      feature: params.feature,

      requestMetadata: {
        model: params.model || 'gpt-4o-mini',
      },
      error: error.message,
      durationMs,
    });

    throw error;
  }
}

/**
 * Create embeddings with automatic cost tracking
 */
export async function createTrackedEmbedding(params: {
  input: string | string[];
  model?: string;

  triggeredBy: TriggeredBy;
  userId?: string;
  adminId?: string;
  feature?: string;
}) {
  const startTime = Date.now();

  try {
    const response = await openai.embeddings.create({
      model: params.model || 'text-embedding-3-small',
      input: params.input,
    });

    const durationMs = Date.now() - startTime;

    // Track usage
    await trackUsage({
      service: 'openai',
      operation: 'embedding',
      endpoint: '/v1/embeddings',

      tokensInput: response.usage?.prompt_tokens,
      tokensOutput: 0, // Embeddings don't have output tokens

      triggeredBy: params.triggeredBy,
      userId: params.userId,
      adminId: params.adminId,
      feature: params.feature,

      requestMetadata: {
        model: params.model || 'text-embedding-3-small',
        input_count: Array.isArray(params.input) ? params.input.length : 1,
      },
      responseMetadata: {
        model: response.model,
        dimensions: response.data[0]?.embedding.length,
      },
      durationMs,
    });

    return response;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;

    await trackUsage({
      service: 'openai',
      operation: 'embedding',
      endpoint: '/v1/embeddings',

      triggeredBy: params.triggeredBy,
      userId: params.userId,
      adminId: params.adminId,
      feature: params.feature,

      error: error.message,
      durationMs,
    });

    throw error;
  }
}

// Export original client for non-tracked use if needed
export { openai };
