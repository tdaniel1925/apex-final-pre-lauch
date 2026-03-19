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

// Lazy-load Redis client to avoid build-time initialization
// Only creates the client when rate limiting is actually used
let redis: Redis | undefined;

function getRedis(): Redis {
  if (!redis) {
    // Only initialize if credentials are provided
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    } else {
      // Create a mock Redis client that always allows requests
      // This allows the app to work without Redis configured
      redis = {
        get: async () => null,
        set: async () => 'OK',
        incr: async () => 1,
        expire: async () => 1,
      } as unknown as Redis;
    }
  }
  return redis;
}

// =============================================
// Rate Limiters by Type (Lazy-loaded)
// =============================================

let _publicRateLimit: Ratelimit | undefined;
let _apiRateLimit: Ratelimit | undefined;
let _adminRateLimit: Ratelimit | undefined;
let _emailRateLimit: Ratelimit | undefined;
let _passwordResetRateLimit: Ratelimit | undefined;

/**
 * Public routes rate limiter (signup, login, password reset)
 * 10 requests per minute per IP
 */
export const publicRateLimit = {
  limit: async (identifier: string) => {
    if (!_publicRateLimit) {
      _publicRateLimit = new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        analytics: true,
        prefix: 'ratelimit:public',
      });
    }
    return _publicRateLimit.limit(identifier);
  },
} as Ratelimit;

/**
 * Authenticated API routes rate limiter
 * 100 requests per minute per user
 */
export const apiRateLimit = {
  limit: async (identifier: string) => {
    if (!_apiRateLimit) {
      _apiRateLimit = new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(100, '1 m'),
        analytics: true,
        prefix: 'ratelimit:api',
      });
    }
    return _apiRateLimit.limit(identifier);
  },
} as Ratelimit;

/**
 * Admin routes rate limiter
 * 200 requests per minute per admin
 */
export const adminRateLimit = {
  limit: async (identifier: string) => {
    if (!_adminRateLimit) {
      _adminRateLimit = new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(200, '1 m'),
        analytics: true,
        prefix: 'ratelimit:admin',
      });
    }
    return _adminRateLimit.limit(identifier);
  },
} as Ratelimit;

/**
 * Email sending rate limiter
 * 5 requests per hour per user (prevents spam)
 */
export const emailRateLimit = {
  limit: async (identifier: string) => {
    if (!_emailRateLimit) {
      _emailRateLimit = new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(5, '1 h'),
        analytics: true,
        prefix: 'ratelimit:email',
      });
    }
    return _emailRateLimit.limit(identifier);
  },
} as Ratelimit;

/**
 * Password reset rate limiter
 * 3 requests per hour per IP (prevents brute force)
 */
export const passwordResetRateLimit = {
  limit: async (identifier: string) => {
    if (!_passwordResetRateLimit) {
      _passwordResetRateLimit = new Ratelimit({
        redis: getRedis(),
        limiter: Ratelimit.slidingWindow(3, '1 h'),
        analytics: true,
        prefix: 'ratelimit:password',
      });
    }
    return _passwordResetRateLimit.limit(identifier);
  },
} as Ratelimit;

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
