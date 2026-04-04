import { Hono } from 'hono';

const wubbleRouter = new Hono();

wubbleRouter.post('/chat', async (c) => {
  const { prompt } = await c.req.json();
  const requestId = crypto.randomUUID();
  console.log('Mock Wubble Request:', prompt, 'ID:', requestId);
  return c.json({ request_id: requestId });
});

wubbleRouter.get('/polling/:request_id', async (c) => {
  const reqId = c.req.param('request_id');
  return c.json({
    status: 'completed',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  });
});

export default wubbleRouter;
