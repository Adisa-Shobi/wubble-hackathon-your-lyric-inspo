import { Hono } from 'hono';
import { cors } from 'hono/cors';

import projectsRouter from './routes/projects.js';
import aiRouter from './routes/ai.js';
import wubbleRouter from './routes/wubble.js';

export type Env = {
  DB: D1Database;
  GEMINI_API_KEY: string;
  WUBBLE_API_KEY: string;
};

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for frontend
app.use('/api/*', cors());

app.get('/', (c) => {
  return c.text('Lyric Pad API is running!');
});

// Mount specialized routers
app.route('/api/projects', projectsRouter);
app.route('/api', aiRouter);
app.route('/api', wubbleRouter);

export default app;
