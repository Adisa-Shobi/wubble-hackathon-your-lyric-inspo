import { z } from 'zod';
import type { Context, Next } from 'hono';
import type { Env, Variables } from './index.js';

const deviceIdSchema = z.string().min(1).max(200).trim();

export async function deviceIdMiddleware(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  next: Next,
) {
  const result = deviceIdSchema.safeParse(c.req.header('X-Device-ID'));
  if (!result.success) {
    return c.json({ error: 'Missing or invalid X-Device-ID header' }, 400);
  }
  c.set('deviceId', result.data);
  await next();
}

// ── Rate limiter ────────────────────────────────────────────────────────────
// Fixed-window counter backed by Cloudflare KV — persistent across isolates
// and regions. Configure via RATE_LIMIT_MAX and RATE_LIMIT_WINDOW_MS env vars.

type RateLimitEntry = { count: number; resetAt: number };

export async function rateLimitMiddleware(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  next: Next,
) {
  const max = Number(c.env.RATE_LIMIT_MAX ?? 30);
  const windowMs = Number(c.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
  const deviceId = c.get('deviceId');

  const now = Date.now();
  const kvKey = `ratelimit:${deviceId}`;

  const raw = await c.env.RATE_LIMIT_KV.get(kvKey);
  let entry: RateLimitEntry = raw ? JSON.parse(raw) : { count: 0, resetAt: now + windowMs };

  // Reset if the window has expired
  if (now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
  }

  if (entry.count >= max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return c.json({ error: 'Rate limit exceeded' }, 429, {
      'Retry-After': String(retryAfter),
    });
  }

  entry.count++;
  const ttl = Math.max(60, Math.ceil((entry.resetAt - now) / 1000));
  await c.env.RATE_LIMIT_KV.put(kvKey, JSON.stringify(entry), { expirationTtl: ttl });

  return next();
}
