import type { HttpHandler } from "msw";

/**
 * Default MSW handlers. Empty by default — individual tests register
 * per-test handlers via `server.use(...)`.
 */
export const handlers: HttpHandler[] = [];
