import { Hono } from 'hono';
import type { Env, Variables } from '../index.js';

const WUBBLE_BASE = 'https://api.wubble.ai/api/v1';

const wubbleRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

wubbleRouter.post('/chat', async (c) => {
  const { prompt, vocals = true } = await c.req.json();

  const res = await fetch(`${WUBBLE_BASE}/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${c.env.WUBBLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, vocals }),
  });

  const data = await res.json();
  return c.json(data, res.status as any);
});

wubbleRouter.get('/polling/:request_id', async (c) => {
  const reqId = c.req.param('request_id');

  const res = await fetch(`${WUBBLE_BASE}/polling/${reqId}`, {
    headers: {
      Authorization: `Bearer ${c.env.WUBBLE_API_KEY}`,
    },
  });

  const data = await res.json();
  return c.json(data, res.status as any);
});

export default wubbleRouter;
