import { z } from 'zod';
// ── Request schemas ───────────────────────────────────────────────────────────
export const chatBodySchema = z.object({
    message: z.string().min(1, 'message is required').max(1000),
    lyrics: z.string().max(10_000).optional(),
    project_id: z.string().optional(),
});
export const lyricsBodySchema = z.object({
    lyrics: z.string().min(1, 'lyrics is required').max(10_000),
});
// ── Response schemas (parse external APIs before returning to client) ─────────
export const wubbleChatStartSchema = z.object({
    request_id: z.string(),
    project_id: z.string(),
});
export const wubblePollingSchema = z.object({
    request_id: z.string(),
    status: z.enum(['streaming', 'generating', 'completed', 'failed']),
    message: z.string().nullable().optional(),
    response_type: z.string().nullable().optional(),
    generation_type: z.string().nullable().optional(),
    /** Model's text reply — arrives during 'streaming', may be null initially */
    model_response: z.string().nullable().optional(),
    song_title: z.string().nullable().optional(),
    final_request_id: z.string().nullable().optional(),
    results: z.object({
        custom_data: z.object({
            /** AI response text — arrives at 'generating' stage */
            text: z.string().nullable().optional(),
            /** Live stream URL — available at 'streaming' stage */
            stream_url: z.string().nullable().optional(),
            audios: z.array(z.object({
                index: z.number(),
                audio_url: z.string(),
                duration_ms: z.number(),
                duration_seconds: z.number(),
                stream_url: z.string().nullable().optional(),
            }).passthrough()).optional(),
        }).passthrough().optional(),
        lite: z.boolean().nullable().optional(),
        streaming: z.boolean().nullable().optional(),
    }).passthrough().optional(),
    /** Populated during 'streaming' and 'completed' stages */
    streaming: z.object({
        completed_at: z.string().nullable().optional(),
        /** Final MP3 — use this at 'completed' */
        final_audio_url: z.string().nullable().optional(),
        /** Live AAC stream — available before completion */
        stream_url: z.string().nullable().optional(),
        stream_id: z.string().nullable().optional(),
        status: z.string().nullable().optional(),
    }).passthrough().optional(),
    error: z.object({
        message: z.string().optional(),
        code: z.string().optional(),
        type: z.string().optional(),
    }).passthrough().optional(),
    created_at: z.string().nullable().optional(),
    age_minutes: z.number().nullable().optional(),
    retry_after: z.number().nullable().optional(),
}).passthrough();
export const suggestionSchema = z.object({
    original: z.string(),
    suggestion: z.string(),
    rationale: z.string(),
});
export const analysisSchema = z.object({
    vibe: z.string(),
    impact: z.string(),
    status_quo: z.string(),
});
