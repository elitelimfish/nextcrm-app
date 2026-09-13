/** Origin + rate-limit guards for local Sally BYOK proxies. */

export const RATE_LIMIT_MAX = 20;
export const RATE_LIMIT_WINDOW_MS = 60_000;

export function isLocalDevHost(requestHost: string): boolean {
  const lower = requestHost.toLowerCase();
  const host = lower.startsWith("[")
    ? (lower.match(/^(\[[^\]]+\])/)?.[1] ?? lower)
    : (lower.split(":")[0] ?? "");
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

export function isSameOrigin(
  origin: string | null,
  requestHost: string,
  options?: { allowMissingOrigin?: boolean },
): boolean {
  const allowMissing =
    options?.allowMissingOrigin ?? isLocalDevHost(requestHost);
  if (!origin) return allowMissing;
  try {
    return new URL(origin).host === requestHost;
  } catch {
    return false;
  }
}

type Bucket = { timestamps: number[] };

export function createRateLimiter(
  max = RATE_LIMIT_MAX,
  windowMs = RATE_LIMIT_WINDOW_MS,
) {
  const buckets = new Map<string, Bucket>();

  return {
    allow(key: string, now = Date.now()): boolean {
      const cutoff = now - windowMs;
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = { timestamps: [] };
        buckets.set(key, bucket);
      }
      bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
      if (bucket.timestamps.length >= max) return false;
      bucket.timestamps.push(now);
      return true;
    },
  };
}
