import { Hono } from 'hono';
import { cors } from 'hono/cors';

import aiRouter from './routes/ai.js';
import wubbleRouter from './routes/wubble.js';
import { deviceIdMiddleware } from './middleware.js';

// D1 binding kept in wrangler.jsonc for future use — not yet referenced in code
export type Env = {
  GEMINI_API_KEY: string;
  WUBBLE_API_KEY: string;
};

export type Variables = {
  deviceId: string;
};

// Method chaining is required for Hono RPC to infer AppType correctly
const app = new Hono<{ Bindings: Env; Variables: Variables }>()
  .use('/api/*', cors())
  .use('/api/*', deviceIdMiddleware)
  .get('/', (c) => c.text('Lyric Pad API is running!'))
  .route('/api', aiRouter)
  .route('/api', wubbleRouter);

export type AppType = typeof app;

export default app;
