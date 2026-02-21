// =============================================
// Redis Client with Usage Tracking
// Wraps Upstash Redis calls with automatic cost tracking
// =============================================

import { Redis } from '@upstash/redis';
import { trackUsage } from './tracking';
import type { TriggeredBy } from '@/types/service-tracking';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// =============================================
// Tracked Redis Client
// =============================================

export interface TrackedRedisContext {
  triggeredBy: TriggeredBy;
  userId?: string;
  adminId?: string;
  feature?: string;
}

/**
 * Get value from Redis with tracking
 */
export async function getTracked<T = any>(
  key: string,
  context: TrackedRedisContext
): Promise<T | null> {
  const startTime = Date.now();

  try {
    const value = await redis.get<T>(key);
    const durationMs = Date.now() - startTime;

    // Track read operation
    await trackUsage({
      service: 'redis',
      operation: 'get',
      endpoint: 'GET',

      requestsCount: 1,

      triggeredBy: context.triggeredBy,
      userId: context.userId,
      adminId: context.adminId,
      feature: context.feature,

      requestMetadata: {
        key,
        cache_hit: value !== null,
      },
      durationMs,
    });

    return value;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;

    await trackUsage({
      service: 'redis',
      operation: 'get',
      endpoint: 'GET',

      requestsCount: 1,

      triggeredBy: context.triggeredBy,
      userId: context.userId,
      adminId: context.adminId,
      feature: context.feature,

      error: error.message,
      durationMs,
    });

    throw error;
  }
}

/**
 * Set value in Redis with tracking
 */
export async function setTracked<T = any>(
  key: string,
  value: T,
  options: { ex?: number; px?: number } = {},
  context: TrackedRedisContext
): Promise<string | null> {
  const startTime = Date.now();

  try {
    const valueSize = JSON.stringify(value).length;
    const redisOptions = options.ex ? { ex: options.ex } : options.px ? { px: options.px } : undefined;
    const result = await redis.set(key, value, redisOptions as any);
    const durationMs = Date.now() - startTime;

    // Track write operation
    await trackUsage({
      service: 'redis',
      operation: 'set',
      endpoint: 'SET',

      requestsCount: 1,
      dataSizeBytes: valueSize,

      triggeredBy: context.triggeredBy,
      userId: context.userId,
      adminId: context.adminId,
      feature: context.feature,

      requestMetadata: {
        key,
        ttl_seconds: options.ex,
        ttl_ms: options.px,
      },
      durationMs,
    });

    return result as string;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;

    await trackUsage({
      service: 'redis',
      operation: 'set',
      endpoint: 'SET',

      requestsCount: 1,

      triggeredBy: context.triggeredBy,
      userId: context.userId,
      adminId: context.adminId,
      feature: context.feature,

      error: error.message,
      durationMs,
    });

    throw error;
  }
}

/**
 * Delete key from Redis with tracking
 */
export async function delTracked(
  key: string | string[],
  context: TrackedRedisContext
): Promise<number> {
  const startTime = Date.now();

  try {
    const result = Array.isArray(key) ? await redis.del(...key) : await redis.del(key);
    const durationMs = Date.now() - startTime;

    await trackUsage({
      service: 'redis',
      operation: 'del',
      endpoint: 'DEL',

      requestsCount: 1,

      triggeredBy: context.triggeredBy,
      userId: context.userId,
      adminId: context.adminId,
      feature: context.feature,

      requestMetadata: {
        key_count: Array.isArray(key) ? key.length : 1,
      },
      responseMetadata: {
        deleted_count: result,
      },
      durationMs,
    });

    return result;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;

    await trackUsage({
      service: 'redis',
      operation: 'del',
      endpoint: 'DEL',

      requestsCount: 1,

      triggeredBy: context.triggeredBy,
      userId: context.userId,
      adminId: context.adminId,
      feature: context.feature,

      error: error.message,
      durationMs,
    });

    throw error;
  }
}

/**
 * Get value with fallback and caching
 * Common pattern: try cache, fallback to fetcher, cache result
 */
export async function getCached<T>(params: {
  key: string;
  fetcher: () => Promise<T>;
  ttl?: number; // Seconds
  context: TrackedRedisContext;
}): Promise<T> {
  // Try cache first
  const cached = await getTracked<T>(params.key, params.context);

  if (cached !== null) {
    return cached;
  }

  // Cache miss - fetch data
  const data = await params.fetcher();

  // Store in cache
  await setTracked(
    params.key,
    data,
    params.ttl ? { ex: params.ttl } : {},
    params.context
  );

  return data;
}

/**
 * Increment counter with tracking
 */
export async function incrTracked(
  key: string,
  context: TrackedRedisContext
): Promise<number> {
  const startTime = Date.now();

  try {
    const result = await redis.incr(key);
    const durationMs = Date.now() - startTime;

    await trackUsage({
      service: 'redis',
      operation: 'incr',
      endpoint: 'INCR',

      requestsCount: 1,

      triggeredBy: context.triggeredBy,
      userId: context.userId,
      adminId: context.adminId,
      feature: context.feature,

      requestMetadata: { key },
      responseMetadata: { new_value: result },
      durationMs,
    });

    return result;
  } catch (error: any) {
    const durationMs = Date.now() - startTime;

    await trackUsage({
      service: 'redis',
      operation: 'incr',
      endpoint: 'INCR',

      requestsCount: 1,

      triggeredBy: context.triggeredBy,
      userId: context.userId,
      adminId: context.adminId,
      feature: context.feature,

      error: error.message,
      durationMs,
    });

    throw error;
  }
}

// Export original client for direct access if needed (not tracked)
export { redis };
