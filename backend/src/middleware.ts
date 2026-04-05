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
