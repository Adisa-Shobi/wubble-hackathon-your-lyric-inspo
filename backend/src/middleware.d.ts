import type { Context, Next } from 'hono';
import type { Env, Variables } from './index.js';
export declare function deviceIdMiddleware(c: Context<{
    Bindings: Env;
    Variables: Variables;
}>, next: Next): Promise<(Response & import("hono").TypedResponse<{
    error: string;
}, 400, "json">) | undefined>;
export declare function rateLimitMiddleware(c: Context<{
    Bindings: Env;
    Variables: Variables;
}>, next: Next): Promise<void | (Response & import("hono").TypedResponse<{
    error: string;
}, 429, "json">)>;
