import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import type { Env, Variables } from '../index.js';
import { lyricsBodySchema, suggestionSchema, analysisSchema } from '../schemas.js';

const aiRouter = new Hono<{ Bindings: Env; Variables: Variables }>()
  .post('/suggest', zValidator('json', lyricsBodySchema), async (c) => {
    const { lyrics } = c.req.valid('json');
    const ai = new GoogleGenAI({ apiKey: c.env.GEMINI_API_KEY });

    const prompt = `You are a professional songwriting assistant. Provide word-level improvements for the following lyrics.
  Return a JSON array of up to 3 objects with keys: "original" (the exact word in the text), "suggestion" (replacement word), "rationale" (brief reason why it's better).
  Lyrics: ${lyrics}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      const data = z.array(suggestionSchema).parse(JSON.parse(response.text || '[]'));
      return c.json(data);
    } catch {
      return c.json({ error: 'Failed to generate suggestions' }, 500);
    }
  })
  .post('/analyze', zValidator('json', lyricsBodySchema), async (c) => {
    const { lyrics } = c.req.valid('json');
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
        config: { responseMimeType: 'application/json' },
      });
      const data = analysisSchema.parse(JSON.parse(response.text || '{}'));
      return c.json(data);
    } catch {
      return c.json({ error: 'Failed to analyze lyrics' }, 500);
    }
  });

export default aiRouter;
