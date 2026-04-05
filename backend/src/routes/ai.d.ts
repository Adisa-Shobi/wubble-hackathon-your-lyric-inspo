import type { Env, Variables } from '../index.js';
declare const aiRouter: import("hono/hono-base").HonoBase<{
    Bindings: Env;
    Variables: Variables;
}, {
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
}, "/", "/analyze">;
export default aiRouter;
