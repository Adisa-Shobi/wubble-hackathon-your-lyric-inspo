import { z } from 'zod';
export declare const chatBodySchema: z.ZodObject<{
    message: z.ZodString;
    lyrics: z.ZodOptional<z.ZodString>;
    project_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const lyricsBodySchema: z.ZodObject<{
    lyrics: z.ZodString;
}, z.core.$strip>;
export declare const wubbleChatStartSchema: z.ZodObject<{
    request_id: z.ZodString;
    project_id: z.ZodString;
}, z.core.$strip>;
export declare const wubblePollingSchema: z.ZodObject<{
    request_id: z.ZodString;
    status: z.ZodEnum<{
        streaming: "streaming";
        generating: "generating";
        completed: "completed";
        failed: "failed";
    }>;
    message: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    response_type: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    generation_type: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    model_response: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    song_title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    final_request_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    results: z.ZodOptional<z.ZodObject<{
        custom_data: z.ZodOptional<z.ZodObject<{
            text: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            stream_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            audios: z.ZodOptional<z.ZodArray<z.ZodObject<{
                index: z.ZodNumber;
                audio_url: z.ZodString;
                duration_ms: z.ZodNumber;
                duration_seconds: z.ZodNumber;
                stream_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$loose>>>;
        }, z.core.$loose>>;
        lite: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        streaming: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    }, z.core.$loose>>;
    streaming: z.ZodOptional<z.ZodObject<{
        completed_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        final_audio_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        stream_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        stream_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        status: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$loose>>;
    error: z.ZodOptional<z.ZodObject<{
        message: z.ZodOptional<z.ZodString>;
        code: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>>;
    created_at: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    age_minutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    retry_after: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$loose>;
export declare const suggestionSchema: z.ZodObject<{
    original: z.ZodString;
    suggestion: z.ZodString;
    rationale: z.ZodString;
}, z.core.$strip>;
export declare const analysisSchema: z.ZodObject<{
    vibe: z.ZodString;
    impact: z.ZodString;
    status_quo: z.ZodString;
}, z.core.$strip>;
