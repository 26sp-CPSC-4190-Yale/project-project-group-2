const WINDOW_MS = 60_000;

const buckets = new Map<string, number[]>();

/**
 * Returns true if the request is allowed, false if the user has exceeded `max`
 * within the last minute. Records the hit on success.
 */
export function rateLimit(key: string, max: number): boolean {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const hits = (buckets.get(key) ?? []).filter((t) => t > cutoff);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}