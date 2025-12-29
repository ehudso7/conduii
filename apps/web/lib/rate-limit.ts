/**
 * Simple in-memory rate limiter for API routes
 *
 * For production, consider using Redis-based rate limiting
 * with a library like @upstash/ratelimit
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const cache = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.resetAt < now) {
      cache.delete(key);
    }
  }
}, 60000); // Clean up every minute

export interface RateLimitConfig {
  /**
   * Maximum requests allowed in the window
   */
  limit: number;
  /**
   * Time window in milliseconds
   */
  window: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

/**
 * Rate limit a request by identifier
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns RateLimitResult with success status and headers info
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { limit: 60, window: 60000 }
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  let entry = cache.get(key);

  // Reset if window has passed
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + config.window,
    };
    cache.set(key, entry);
  }

  entry.count++;

  const remaining = Math.max(0, config.limit - entry.count);
  const success = entry.count <= config.limit;

  return {
    success,
    remaining,
    reset: entry.resetAt,
    limit: config.limit,
  };
}

/**
 * Get rate limit response headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };
}

/**
 * Default rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // General API: 60 requests per minute
  api: { limit: 60, window: 60000 },

  // Auth endpoints: 10 requests per minute (stricter)
  auth: { limit: 10, window: 60000 },

  // Test runs: 20 per minute (resource-intensive)
  testRuns: { limit: 20, window: 60000 },

  // AI/LLM endpoints: 10 per minute (expensive)
  ai: { limit: 10, window: 60000 },

  // CLI validation: 100 per minute (less strict for CI/CD)
  cli: { limit: 100, window: 60000 },
} as const;
