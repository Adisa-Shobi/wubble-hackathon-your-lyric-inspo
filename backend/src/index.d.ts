import { z } from 'zod';
import { wubblePollingSchema } from './schemas.js';
export type Env = {
    GEMINI_API_KEY: string;
    WUBBLE_API_KEY: string;
    RATE_LIMIT_KV: KVNamespace;
    RATE_LIMIT_MAX?: string;
    RATE_LIMIT_WINDOW_MS?: string;
};
export type Variables = {
    deviceId: string;
};
declare const app: import("hono/hono-base").HonoBase<{
    Bindings: Env;
    Variables: Variables;
} & {
    Bindings: Env;
    Variables: Variables;
} & {
    Bindings: Env;
    Variables: Variables;
}, {
    "/": {
        $get: {
            input: {};
            output: "Lyric Pad API is running!";
            outputFormat: "text";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
} | import("hono/types").MergeSchemaPath<{
    "/suggest": {
        $post: {
            input: {
                json: {
                    lyrics: string;
                };
            };
            output: {
                original: string;
                suggestion: string;
                rationale: string;
            }[];
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        } | {
            input: {
                json: {
                    lyrics: string;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 500;
        };
    };
} & {
    "/analyze": {
        $post: {
            input: {
                json: {
                    lyrics: string;
                };
            };
            output: {
                vibe: string;
                impact: string;
                status_quo: string;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        } | {
            input: {
                json: {
                    lyrics: string;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 500;
        };
    };
}, "/api"> | import("hono/types").MergeSchemaPath<{
    "/chat": {
        $post: {
            input: {
                json: {
                    message: string;
                    lyrics?: string | undefined;
                    project_id?: string | undefined;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 100 | 102 | 103 | 200 | 201 | 202 | 203 | 206 | 207 | 208 | 226 | 300 | 301 | 302 | 303 | 305 | 306 | 307 | 308 | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 | 422 | 423 | 424 | 425 | 426 | 428 | 429 | 431 | 451 | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511 | -1;
        } | {
            input: {
                json: {
                    message: string;
                    lyrics?: string | undefined;
                    project_id?: string | undefined;
                };
            };
            output: {
                request_id: string;
                project_id: string;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
} & {
    "/polling/:request_id": {
        $get: {
            input: {
                param: {
                    request_id: string;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 100 | 102 | 103 | 200 | 201 | 202 | 203 | 206 | 207 | 208 | 226 | 300 | 301 | 302 | 303 | 305 | 306 | 307 | 308 | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 | 422 | 423 | 424 | 425 | 426 | 428 | 429 | 431 | 451 | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511 | -1;
        } | {
            input: {
                param: {
                    request_id: string;
                };
            };
            output: {
                [x: string]: import("hono/utils/types").JSONValue;
                request_id: string;
                status: "streaming" | "generating" | "completed" | "failed";
                message?: string | null | undefined;
                response_type?: string | null | undefined;
                generation_type?: string | null | undefined;
                model_response?: string | null | undefined;
                song_title?: string | null | undefined;
                final_request_id?: string | null | undefined;
                results?: {
                    [x: string]: import("hono/utils/types").JSONValue;
                    custom_data?: {
                        [x: string]: import("hono/utils/types").JSONValue;
                        text?: string | null | undefined;
                        stream_url?: string | null | undefined;
                        audios?: {
                            [x: string]: import("hono/utils/types").JSONValue;
                            index: number;
                            audio_url: string;
                            duration_ms: number;
                            duration_seconds: number;
                            stream_url?: string | null | undefined;
                        }[] | undefined;
                    } | undefined;
                    lite?: boolean | null | undefined;
                    streaming?: boolean | null | undefined;
                } | undefined;
                streaming?: {
                    [x: string]: import("hono/utils/types").JSONValue;
                    completed_at?: string | null | undefined;
                    final_audio_url?: string | null | undefined;
                    stream_url?: string | null | undefined;
                    stream_id?: string | null | undefined;
                    status?: string | null | undefined;
                } | undefined;
                error?: {
                    [x: string]: import("hono/utils/types").JSONValue;
                    message?: string | undefined;
                    code?: string | undefined;
                    type?: string | undefined;
                } | undefined;
                created_at?: string | null | undefined;
                age_minutes?: number | null | undefined;
                retry_after?: number | null | undefined;
            };
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
}, "/api">, "/", "/">;
export type AppType = typeof app;
export type PollResponse = z.infer<typeof wubblePollingSchema>;
export default app;
