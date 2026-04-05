import { Hono } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, Variables } from '../index.js';
import { chatBodySchema, wubbleChatStartSchema, wubblePollingSchema } from '../schemas.js';

const WUBBLE_BASE = 'https://api.wubble.ai/api/v1';

const pollingParamSchema = z.object({ request_id: z.string().min(1) });

const wubbleRouter = new Hono<{ Bindings: Env; Variables: Variables }>()
  .post('/chat', zValidator('json', chatBodySchema), async (c) => {
    const { message, lyrics, project_id } = c.req.valid('json');

    let prompt: string;
    if (lyrics?.trim()) {
      prompt = `Create a song using the following lyrics verbatim as the vocal content. Do not change or paraphrase the lyrics — sing them exactly as written.\n\nVibe / style direction: ${message}\n\nLyrics to sing:\n${lyrics.trim()}`;
    } else {
      prompt = `Create a song. Vibe / style direction: ${message}`;
    }

    const payload: Record<string, unknown> = { prompt, vocals: true };
    if (project_id) payload.project_id = project_id;

    const res = await fetch(`${WUBBLE_BASE}/chat`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${c.env.WUBBLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return c.json({ error: 'Wubble chat request failed' }, res.status as ContentfulStatusCode);
    }

    const data = wubbleChatStartSchema.parse(await res.json());
    return c.json(data);
  })
  .get('/polling/:request_id', zValidator('param', pollingParamSchema), async (c) => {
    const { request_id } = c.req.valid('param');

    const res = await fetch(`${WUBBLE_BASE}/polling/${request_id}`, {
      headers: { Authorization: `Bearer ${c.env.WUBBLE_API_KEY}` },
    });

    if (!res.ok) {
      return c.json({ error: 'Polling request failed' }, res.status as ContentfulStatusCode);
    }

    const raw = await res.json();
    const parsed = wubblePollingSchema.safeParse(raw);
    const data = parsed.success ? parsed.data : (raw as z.infer<typeof wubblePollingSchema>);
    return c.json(data);
  });

export default wubbleRouter;
