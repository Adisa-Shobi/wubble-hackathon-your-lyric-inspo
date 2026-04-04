import type { Context, Next } from 'hono';
import type { Env, Variables } from './index.js';

export async function deviceIdMiddleware(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  next: Next,
) {
  const deviceId = c.req.header('X-Device-ID');
  if (!deviceId || deviceId.trim() === '') {
    return c.json({ error: 'Missing X-Device-ID header' }, 400);
  }
  c.set('deviceId', deviceId.trim());
  await next();
}
