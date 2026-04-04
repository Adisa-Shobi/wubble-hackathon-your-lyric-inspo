import { Hono } from 'hono';
import { GoogleGenAI } from '@google/genai';
import type { Env } from '../index.js';

const aiRouter = new Hono<{ Bindings: Env }>();

aiRouter.post('/suggest', async (c) => {
  const { lyrics } = await c.req.json();
  if (!lyrics) return c.json({ error: 'lyrics required' }, 400);

  const ai = new GoogleGenAI({ apiKey: c.env.GEMINI_API_KEY });
  const prompt = `You are a professional songwriting assistant. Provide word-level improvements for the following lyrics.
  Return a JSON array of up to 3 objects with keys: "original" (the exact exact word in the text), "suggestion" (replacement word), "rationale" (brief reason why it's better).
  Lyrics: ${lyrics}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });
    return c.json(JSON.parse(response.text || '[]'));
  } catch (error) {
    return c.json({ error: 'Failed to generate content' }, 500);
  }
});

aiRouter.post('/analyze', async (c) => {
  const { lyrics } = await c.req.json();
  if (!lyrics) return c.json({ error: 'lyrics required' }, 400);

  const ai = new GoogleGenAI({ apiKey: c.env.GEMINI_API_KEY });
  const prompt = `Analyze the following song lyrics. 
  Return a JSON object exactly with these 3 keys:
  - "vibe": A sentence describing the emotional energy and mood.
  - "impact": A sentence describing who it resonates with and its target audience.
  - "status_quo": A sentence describing where it sits in current musical trends.
  Lyrics: ${lyrics}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });
    return c.json(JSON.parse(response.text || '{}'));
  } catch (error) {
    return c.json({ error: 'Failed to analyze' }, 500);
  }
});

export default aiRouter;
