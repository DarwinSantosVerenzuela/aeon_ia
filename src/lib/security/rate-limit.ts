/**
 * In-memory token bucket rate limiter.
 * Protects API routes from abuse.
 * 
 * In production with multiple instances, replace with
 * Redis-based rate limiting (e.g., @upstash/ratelimit).
 */

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, TokenBucket>();

/** Default: 40 requests per 60-second window */
const MAX_TOKENS = 40;
const REFILL_INTERVAL_MS = 60_000;

/**
 * Clean up expired buckets periodically to prevent memory leaks.
 */
function cleanup() {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > REFILL_INTERVAL_MS * 5) {
      buckets.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanup, 300_000);
}

/**
 * Check if a request from the given identifier should be allowed.
 * Returns { allowed, remaining, resetMs }.
 */
export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetMs: number;
} {
  const now = Date.now();
  let bucket = buckets.get(identifier);

  if (!bucket) {
    bucket = { tokens: MAX_TOKENS, lastRefill: now };
    buckets.set(identifier, bucket);
  }

  // Refill tokens if window has elapsed
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= REFILL_INTERVAL_MS) {
    bucket.tokens = MAX_TOKENS;
    bucket.lastRefill = now;
  }

  const resetMs = REFILL_INTERVAL_MS - (now - bucket.lastRefill);

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    return { allowed: true, remaining: bucket.tokens, resetMs };
  }

  return { allowed: false, remaining: 0, resetMs };
}

/**
 * Get the client IP from request headers.
 * Handles common proxy headers.
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  return "unknown";
}
