// =============================================
// Rate Limiting Utility
// Protects API routes from abuse and DOS attacks
// =============================================

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// =============================================
// Redis Client Setup
// =============================================

// Initialize Redis client for rate limiting
// Uses Upstash Redis for serverless compatibility
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// =============================================
// Rate Limiters by Type
// =============================================

/**
 * Public routes rate limiter (signup, login, password reset)
 * 10 requests per minute per IP
 */
export const publicRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
  prefix: 'ratelimit:public',
});

/**
 * Authenticated API routes rate limiter
 * 100 requests per minute per user
 */
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:api',
});

/**
 * Admin routes rate limiter
 * 200 requests per minute per admin
 */
export const adminRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, '1 m'),
  analytics: true,
  prefix: 'ratelimit:admin',
});

/**
 * Email sending rate limiter
 * 5 requests per hour per user (prevents spam)
 */
export const emailRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  analytics: true,
  prefix: 'ratelimit:email',
});

/**
 * Password reset rate limiter
 * 3 requests per hour per IP (prevents brute force)
 */
export const passwordResetRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1 h'),
  analytics: true,
  prefix: 'ratelimit:password',
});

// =============================================
// Helper Functions
// =============================================

/**
 * Get client IP address from request
 * Works with Vercel and other serverless platforms
 */
export function getClientIp(request: NextRequest): string {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to a default if no IP found
  return 'unknown';
}

/**
 * Check rate limit and return appropriate response
 *
 * @param limiter - The rate limiter to use
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @returns Response if rate limited, null if allowed
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<NextResponse | null> {
  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          limit,
          remaining: 0,
          reset: new Date(reset).toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Rate limit passed - return null to indicate success
    return null;
  } catch (error) {
    // If Redis is down, fail open (allow request) but log error
    console.error('Rate limit check failed:', error);
    return null;
  }
}

/**
 * Middleware wrapper for easy rate limiting in API routes
 *
 * Usage:
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const rateLimitResponse = await withRateLimit(request, publicRateLimit);
 *   if (rateLimitResponse) return rateLimitResponse;
 *
 *   // Your route logic here
 * }
 * ```
 */
export async function withRateLimit(
  request: NextRequest,
  limiter: Ratelimit,
  identifier?: string
): Promise<NextResponse | null> {
  const id = identifier || getClientIp(request);
  return checkRateLimit(limiter, id);
}

/**
 * Get rate limit info without enforcing it
 * Useful for showing users their limit status
 */
export async function getRateLimitInfo(limiter: Ratelimit, identifier: string) {
  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);
    return {
      allowed: success,
      limit,
      remaining,
      reset: new Date(reset).toISOString(),
    };
  } catch (error) {
    console.error('Failed to get rate limit info:', error);
    return null;
  }
}
