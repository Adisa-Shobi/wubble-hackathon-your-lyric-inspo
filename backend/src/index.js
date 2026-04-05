import { Hono } from 'hono';
import { cors } from 'hono/cors';
import aiRouter from './routes/ai.js';
import wubbleRouter from './routes/wubble.js';
import { deviceIdMiddleware, rateLimitMiddleware } from './middleware.js';
// Method chaining is required for Hono RPC to infer AppType correctly
const app = new Hono()
    .use('/api/*', cors())
    .use('/api/*', deviceIdMiddleware)
    .use('/api/*', rateLimitMiddleware)
    .get('/', (c) => c.text('Lyric Pad API is running!'))
    .route('/api', aiRouter)
    .route('/api', wubbleRouter);
export default app;
