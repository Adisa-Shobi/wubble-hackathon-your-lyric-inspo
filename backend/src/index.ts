import { Hono } from 'hono';
import { cors } from 'hono/cors';

import aiRouter from './routes/ai.js';
import wubbleRouter from './routes/wubble.js';
import { deviceIdMiddleware } from './middleware.js';

export type Env = {
  DB: D1Database;
  GEMINI_API_KEY: string;
  WUBBLE_API_KEY: string;
};

export type Variables = {
  deviceId: string;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use('/api/*', cors());
app.use('/api/*', deviceIdMiddleware);

app.get('/', (c) => {
  return c.text('Lyric Pad API is running!');
});

app.route('/api', aiRouter);
app.route('/api', wubbleRouter);

export default app;
