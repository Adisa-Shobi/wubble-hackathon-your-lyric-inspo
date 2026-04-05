import { Hono } from 'hono';
import { cors } from 'hono/cors';

import aiRouter from './routes/ai.js';
import wubbleRouter from './routes/wubble.js';
import { deviceIdMiddleware, rateLimitMiddleware } from './middleware.js';

// D1 binding kept in wrangler.jsonc for future use — not yet referenced in code
export type Env = {
  GEMINI_API_KEY: string;
  WUBBLE_API_KEY: string;
  RATE_LIMIT_KV: KVNamespace;
  RATE_LIMIT_MAX?: string;       // default 30
  RATE_LIMIT_WINDOW_MS?: string; // default 60000 (1 minute)
};

export type Variables = {
  deviceId: string;
};

// Method chaining is required for Hono RPC to infer AppType correctly
const app = new Hono<{ Bindings: Env; Variables: Variables }>()
  .use('/api/*', cors())
  .use('/api/*', deviceIdMiddleware)
  .use('/api/*', rateLimitMiddleware)
  .get('/', (c) => c.text('Lyric Pad API is running!'))
  .route('/api', aiRouter)
  .route('/api', wubbleRouter);

export type AppType = typeof app;

export default app;
